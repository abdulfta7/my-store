import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderNumber = searchParams.get("orderNumber");

  if (!orderNumber) {
    return NextResponse.json({ error: "Order number is required" }, { status: 400 });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber: orderNumber.trim() },
      select: {
        orderNumber: true,
        status: true,
        createdAt: true,
        total: true,
        shippingAddress: true,
        items: {
          select: {
            quantity: true,
            product: {
              select: { name: true }
            }
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Failed to track order:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
