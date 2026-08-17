import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";

// ── Cloudinary config ─────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// ── Config ─────────────────────────────────────────────────────────────────
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg", "image/png", "image/webp", "image/gif",
]);

const MAGIC_SIGNATURES = [
  { mime: "image/jpeg", bytes: [0xff, 0xd8, 0xff], offset: 0 },
  { mime: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47], offset: 0 },
  { mime: "image/webp", bytes: [0x52, 0x49, 0x46, 0x46], offset: 0 },
  { mime: "image/gif", bytes: [0x47, 0x49, 0x46, 0x38], offset: 0 },
];

function detectMimeFromBytes(buffer: Buffer): string | null {
  for (const sig of MAGIC_SIGNATURES) {
    const slice = buffer.slice(sig.offset, sig.offset + sig.bytes.length);
    if (sig.bytes.every((b, i) => slice[i] === b)) return sig.mime;
  }
  return null;
}

export async function POST(req: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────────
  const session = await getServerSession(authOptions);
  if (
    !session?.user ||
    ((session.user as any).role !== "ADMIN" &&
      (session.user as any).role !== "SUPER_ADMIN")
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // ── Size check ────────────────────────────────────────────────────
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum is ${MAX_FILE_SIZE / 1024 / 1024}MB.` },
        { status: 413 }
      );
    }
    if (file.size === 0) {
      return NextResponse.json({ error: "File is empty" }, { status: 400 });
    }

    // ── MIME check ────────────────────────────────────────────────────
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, WebP, and GIF are allowed." },
        { status: 415 }
      );
    }

    // ── Magic bytes ───────────────────────────────────────────────────
    const buffer = Buffer.from(await file.arrayBuffer());
    const realMime = detectMimeFromBytes(buffer);
    if (!realMime || !ALLOWED_MIME_TYPES.has(realMime)) {
      return NextResponse.json(
        { error: "File content does not match an allowed image type." },
        { status: 415 }
      );
    }

    // ── Upload to Cloudinary ──────────────────────────────────────────
    const result = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "zomatech/products",
          resource_type: "image",
          allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
          transformation: [{ quality: "auto", fetch_format: "auto" }],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(buffer);
    });

    return NextResponse.json({ url: result.secure_url }, { status: 201 });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
