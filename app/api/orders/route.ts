import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

import { getShippingCost } from "@/lib/governorates";

// ── Constants ──────────────────────────────────────────────────────────────
const VALID_PAYMENT_METHODS = ["COD", "INSTAPAY", "VODAFONE_CASH"] as const;

export async function POST(req: Request) {
  // ── Rate limit: 10 orders per 10 min per IP (guests), 20 if logged in ──
  const ip = getClientIp(req);
  const session = await getServerSession(authOptions);
  const limit = session?.user ? 20 : 10;
  const { allowed } = rateLimit(ip, "order", limit, 10 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait before placing another order." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

    const { items, customerInfo, shippingAddress, paymentMethod, couponCode } = body;

    // ── Basic structural validation ─────────────────────────────────────
    if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
      return NextResponse.json({ error: "Cart is empty or too large" }, { status: 400 });
    }

    if (!VALID_PAYMENT_METHODS.includes(paymentMethod)) {
      return NextResponse.json({ error: "Invalid payment method" }, { status: 400 });
    }

    if (
      typeof customerInfo?.name !== "string" || !customerInfo.name.trim() ||
      typeof customerInfo?.phone !== "string" || !customerInfo.phone.trim() ||
      typeof shippingAddress?.street !== "string" || !shippingAddress.street.trim() ||
      typeof shippingAddress?.city !== "string" || !shippingAddress.city.trim()
    ) {
      return NextResponse.json({ error: "Missing required customer or address fields" }, { status: 400 });
    }

    // ── Validate item structure ──────────────────────────────────────────
    for (const item of items) {
      if (
        typeof item.id !== "string" ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 100
      ) {
        return NextResponse.json(
          { error: "Invalid item in cart. Please refresh and try again." },
          { status: 400 }
        );
      }
    }

    // ── Server-side price recalculation ──────────────────────────────────
    const productIds = items.map((i: any) => i.id as string);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds }, isPublished: true },
      include: { inventory: true },
    });

    if (dbProducts.length !== productIds.length) {
      return NextResponse.json(
        { error: "One or more items are no longer available." },
        { status: 400 }
      );
    }

    // Map productId → DB product for fast lookup
    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    let subtotal = 0;
    const validatedItems: { productId: string; quantity: number; price: number }[] = [];

    for (const item of items) {
      const dbProduct = productMap.get(item.id);
      if (!dbProduct) {
        return NextResponse.json({ error: `Product not found: ${item.id}` }, { status: 400 });
      }

      // Check stock — must have enough
      const stock = dbProduct.inventory?.stock ?? 0;
      if (stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for "${dbProduct.name}". Only ${stock} left.` },
          { status: 400 }
        );
      }

      // Use DB price — never trust client price
      subtotal += dbProduct.price * item.quantity;
      validatedItems.push({ productId: item.id, quantity: item.quantity, price: dbProduct.price });
    }

    const shippingCost = getShippingCost(shippingAddress.governorate ?? "");

    // ── Coupon validation ────────────────────────────────────────────────
    let discountAmount = 0;
    let appliedCouponId: string | null = null;

    if (couponCode && typeof couponCode === "string") {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.trim().toUpperCase() },
      });

      if (
        !coupon ||
        !coupon.isActive ||
        (coupon.expiresAt && coupon.expiresAt < new Date()) ||
        (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) ||
        (coupon.minOrder !== null && subtotal < coupon.minOrder)
      ) {
        return NextResponse.json({ error: "Coupon is no longer valid" }, { status: 400 });
      }

      discountAmount = coupon.type === "PERCENTAGE"
        ? Math.round((subtotal * coupon.value) / 100)
        : Math.min(coupon.value, subtotal);

      appliedCouponId = coupon.id;
    }

    const total = Math.max(0, subtotal + shippingCost - discountAmount);

    // ── Generate order number ────────────────────────────────────────────
    const orderNumber = `ORD-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`;

    // ── Transaction: create order + decrement stock atomically ───────────
    const order = await prisma.$transaction(async (tx) => {
      // Verify stock again inside the transaction (race condition guard)
      for (const item of validatedItems) {
        const inv = await tx.inventory.findUnique({ where: { productId: item.productId } });
        if (!inv || inv.stock < item.quantity) {
          throw new Error(`STOCK_INSUFFICIENT:${item.productId}`);
        }
      }

      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: (session?.user as any)?.id ?? null,
          total,
          subtotal,
          shipping: shippingCost,
          discount: discountAmount,
          status: "PENDING",
          paymentMethod,
          shippingAddress: `${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.governorate ?? ""}`.trim(),
          customerNotes: customerInfo.notes?.slice(0, 500) || null,
          customerName: customerInfo.name.trim().slice(0, 100),
          customerEmail: customerInfo.email?.trim().slice(0, 254) || null,
          customerPhone: customerInfo.phone.trim().slice(0, 20),
          items: { create: validatedItems },
        },
        include: { items: true },
      });

      // Decrement inventory for all items in one loop
      for (const item of validatedItems) {
        await tx.inventory.update({
          where: { productId: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      if (appliedCouponId) {
        await tx.coupon.update({
          where: { id: appliedCouponId },
          data: { usageCount: { increment: 1 } },
        });
      }

      return newOrder;
    });

    return NextResponse.json({ success: true, orderId: order.id, orderNumber: order.orderNumber }, { status: 201 });

  } catch (error: any) {
    if (error.message?.startsWith("STOCK_INSUFFICIENT")) {
      return NextResponse.json(
        { error: "An item in your cart ran out of stock. Please refresh and try again." },
        { status: 409 }
      );
    }
    console.error("Order creation failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
