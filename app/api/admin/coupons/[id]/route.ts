import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";



function isAdmin(session: any) {
  return (
    session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN"
  );
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();

    const coupon = await prisma.coupon.update({
      where: { id: params.id },
      data: {
        isActive:
          body.isActive !== undefined ? Boolean(body.isActive) : undefined,
        code: body.code ? body.code.trim().toUpperCase() : undefined,
        type: body.type ?? undefined,
        value: body.value != null ? parseFloat(body.value) : undefined,
        minOrder: body.minOrder != null ? parseFloat(body.minOrder) : undefined,
        usageLimit:
          body.usageLimit != null ? parseInt(body.usageLimit) : undefined,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
      },
    });

    return NextResponse.json(coupon);
  } catch (error) {
    console.error("Update coupon error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await prisma.coupon.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete coupon error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
