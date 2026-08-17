import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// ── Config ─────────────────────────────────────────────────────────────────
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

// Allowed MIME types declared by the client
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

// Magic bytes (file signatures) for each allowed type
// We check the actual bytes — not just the declared MIME type
const MAGIC_SIGNATURES: { mime: string; bytes: number[]; offset: number }[] = [
  { mime: "image/jpeg", bytes: [0xff, 0xd8, 0xff], offset: 0 },
  { mime: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47], offset: 0 },
  { mime: "image/webp", bytes: [0x52, 0x49, 0x46, 0x46], offset: 0 }, // RIFF
  { mime: "image/gif", bytes: [0x47, 0x49, 0x46, 0x38], offset: 0 }, // GIF8
];

function detectMimeFromBytes(buffer: Buffer): string | null {
  for (const sig of MAGIC_SIGNATURES) {
    const slice = buffer.slice(sig.offset, sig.offset + sig.bytes.length);
    if (sig.bytes.every((b, i) => slice[i] === b)) return sig.mime;
  }
  return null;
}

// Safe filename: keep extension, strip everything risky
function sanitizeFilename(original: string): string {
  const ext = path.extname(original).toLowerCase().replace(/[^.a-z0-9]/g, "");
  const allowed = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
  const safeExt = allowed.includes(ext) ? ext : ".bin";
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 9);
  return `${ts}-${rand}${safeExt}`;
}

export async function POST(req: NextRequest) {
  // ── Auth check (admin only) ───────────────────────────────────────────
  const session = await getServerSession(authOptions);
  if (
    !session?.user ||
    ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPER_ADMIN")
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // ── 1. Size check ─────────────────────────────────────────────────
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024} MB.` },
        { status: 413 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json({ error: "File is empty" }, { status: 400 });
    }

    // ── 2. MIME type declared by client ──────────────────────────────
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, WebP, and GIF images are allowed." },
        { status: 415 }
      );
    }

    // ── 3. Read into buffer and verify magic bytes ────────────────────
    const buffer = Buffer.from(await file.arrayBuffer());
    const realMime = detectMimeFromBytes(buffer);

    if (!realMime || !ALLOWED_MIME_TYPES.has(realMime)) {
      return NextResponse.json(
        { error: "File content does not match an allowed image type." },
        { status: 415 }
      );
    }

    // Ensure declared MIME matches actual content (prevents type-spoofing)
    if (realMime !== file.type && !(file.type === "image/jpeg" && realMime === "image/jpeg")) {
      return NextResponse.json(
        { error: "File type mismatch. Please upload a valid image." },
        { status: 415 }
      );
    }

    // ── 4. Write to disk ──────────────────────────────────────────────
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true }); // create if missing

    const filename = sanitizeFilename(file.name);
    const fullPath = path.join(uploadsDir, filename);

    await writeFile(fullPath, buffer);

    return NextResponse.json({ url: `/uploads/${filename}` }, { status: 201 });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
