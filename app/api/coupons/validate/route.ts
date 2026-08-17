import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

// Generic error prevents distinguishing "code doesn't exist" from "code expired"
const INVALID_MSG = "This coupon code is not valid or cannot be applied to your order.";

export async function POST(req: Request) {
  // ── Rate limit: 15 attempts per 5 min per IP ──────────────────────────
  const ip = getClientIp(req);
  const { allowed } = rateLimit(ip, "coupon", 15, 5 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait before trying again." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

    const { code, subtotal } = body;

    if (typeof code !== "string" || typeof subtotal !== "number" || subtotal < 0) {
      return NextResponse.json({ error: INVALID_MSG }, { status: 400 });
    }

    // Sanitize code
    const cleanCode = code.trim().toUpperCase().slice(0, 50);
    if (!cleanCode) return NextResponse.json({ error: INVALID_MSG }, { status: 400 });

    const coupon = await prisma.coupon.findUnique({ where: { code: cleanCode } });

    // Consolidate all failure reasons into one generic message
    const isValid =
      coupon &&
      coupon.isActive &&
      !(coupon.expiresAt && coupon.expiresAt < new Date()) &&
      !(coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) &&
      !(coupon.minOrder !== null && subtotal < coupon.minOrder);

    if (!isValid) {
      // Return 200 (not 404) so response status can't be used to enumerate codes
      return NextResponse.json({ valid: false, error: INVALID_MSG }, { status: 200 });
    }

    const discountAmount =
      coupon.type === "PERCENTAGE"
        ? Math.round((subtotal * coupon.value) / 100)
        : Math.min(coupon.value, subtotal);

    // Provide a helpful message when min-order is the only issue — UX improvement
    if (coupon.minOrder !== null && subtotal < coupon.minOrder) {
      return NextResponse.json({ valid: false, error: INVALID_MSG }, { status: 200 });
    }

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discountAmount,
    });
  } catch (error) {
    console.error("Coupon validation error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
