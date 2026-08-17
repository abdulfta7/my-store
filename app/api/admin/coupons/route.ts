import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";



function isAdmin(session: any) {
  return (
    session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN"
  );
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const coupons = await prisma.coupon.findMany({
    orderBy: { id: "desc" },
  });

  return NextResponse.json(coupons);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { code, type, value, minOrder, usageLimit, expiresAt } = body;

    if (!code || !type || value == null) {
      return NextResponse.json(
        { error: "code, type and value are required" },
        { status: 400 }
      );
    }

    if (!["PERCENTAGE", "FIXED"].includes(type)) {
      return NextResponse.json(
        { error: "type must be PERCENTAGE or FIXED" },
        { status: 400 }
      );
    }

    if (type === "PERCENTAGE" && (value <= 0 || value > 100)) {
      return NextResponse.json(
        { error: "Percentage value must be between 1 and 100" },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.trim().toUpperCase(),
        type,
        value: parseFloat(value),
        minOrder: minOrder ? parseFloat(minOrder) : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: true,
      },
    });

    return NextResponse.json(coupon, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "A coupon with this code already exists" },
        { status: 409 }
      );
    }
    console.error("Create coupon error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
