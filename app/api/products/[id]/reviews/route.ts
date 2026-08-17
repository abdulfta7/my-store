import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { revalidatePath } from "next/cache";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const reviews = await prisma.review.findMany({
      where: { productId: params.id, isApproved: true },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { user: { select: { name: true } } },
    });

    return NextResponse.json({ reviews }, {
      headers: { "Cache-Control": "public, max-age=120, stale-while-revalidate=600" },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  // ── Auth ──────────────────────────────────────────────────────────────
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "You must be logged in to leave a review" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;

  // ── Rate limit: 5 reviews per hour per user ───────────────────────────
  const ip = getClientIp(request);
  const { allowed } = rateLimit(`${userId}:${ip}`, "review", 5, 60 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many reviews submitted. Please wait before trying again." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

    const { rating, comment } = body;

    // ── Validate rating ───────────────────────────────────────────────
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    // ── Validate comment length ───────────────────────────────────────
    if (comment !== undefined && comment !== null) {
      if (typeof comment !== "string") {
        return NextResponse.json({ error: "Comment must be a string" }, { status: 400 });
      }
      if (comment.length > 1000) {
        return NextResponse.json({ error: "Comment must be 1000 characters or fewer" }, { status: 400 });
      }
    }

    // ── Verify the product exists ─────────────────────────────────────
    const product = await prisma.product.findUnique({
      where: { id: params.id, isPublished: true },
      select: { id: true, slug: true },
    });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // ── One review per user per product ───────────────────────────────
    const existing = await prisma.review.findFirst({
      where: { productId: params.id, userId },
    });
    if (existing) {
      return NextResponse.json(
        { error: "You have already reviewed this product" },
        { status: 409 }
      );
    }

    const review = await prisma.review.create({
      data: {
        rating,
        comment: comment?.trim().slice(0, 1000) ?? null,
        productId: params.id,
        userId,
        isApproved: true,
      },
      include: { user: { select: { name: true } } },
    });

    // Revalidate the product page so the new review appears
    revalidatePath(`/product/${product.slug}`);

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error("Review submission error:", error);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
