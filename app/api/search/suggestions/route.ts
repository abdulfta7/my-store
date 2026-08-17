import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

export async function GET(request: Request) {
  // ── Rate limit: 30 requests per minute per IP ─────────────────────────
  const ip = getClientIp(request);
  const { allowed } = rateLimit(ip, "search", 30, 60 * 1000);
  if (!allowed) {
    return NextResponse.json({ results: [] }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("q") ?? "";

  // ── Input validation ──────────────────────────────────────────────────
  if (raw.length < 2) return NextResponse.json({ results: [] });

  // Cap query length — prevents massive LIKE scans
  const query = raw.slice(0, 100).trim();
  if (!query) return NextResponse.json({ results: [] });

  try {
    const products = await prisma.product.findMany({
      where: {
        isPublished: true,
        OR: [
          { name: { contains: query } },
          { brand: { name: { contains: query } } },
          { category: { name: { contains: query } } },
        ],
      },
      select: {
        id: true, name: true, slug: true, price: true,
        images: { where: { isPrimary: true }, take: 1 },
      },
      take: 6,
      orderBy: { name: "asc" },
    });

    const results = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      image: p.images[0]?.url || "/placeholder-product.png",
    }));

    return NextResponse.json(
      { results },
      {
        headers: {
          // Cache for 60 s at the edge, serve stale for 5 min while revalidating
          "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}
