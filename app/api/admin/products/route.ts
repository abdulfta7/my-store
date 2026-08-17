import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";



export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (
      !session?.user ||
      ((session.user as any).role !== "ADMIN" &&
        (session.user as any).role !== "SUPER_ADMIN")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name, slug, description, descriptionAr,
      price, oldPrice, discount,
      sku, categoryId, brandId, imageUrls, specs,
    } = body;

    if (!name || !slug || !description || !price || !sku || !categoryId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
      return NextResponse.json(
        { error: "At least one image URL is required" },
        { status: 400 }
      );
    }

    const existingProduct = await prisma.product.findFirst({
      where: { OR: [{ slug }, { sku }] },
    });
    if (existingProduct) {
      return NextResponse.json(
        { error: "Product with this slug or SKU already exists" },
        { status: 409 }
      );
    }

    const newProduct = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name, slug, description,
          descriptionAr: descriptionAr || null,
          price: parseFloat(price),
          oldPrice: oldPrice ? parseFloat(oldPrice) : null,
          discount: discount ? parseFloat(discount) : null,
          sku, categoryId,
          brandId: brandId || null,
          isPublished: true,
        },
      });

      await tx.productImage.createMany({
        data: imageUrls.map((url: string, index: number) => ({
          url,
          isPrimary: index === 0,
          productId: product.id,
        })),
      });

      if (Array.isArray(specs) && specs.length > 0) {
        await tx.productSpecification.createMany({
          data: specs.map((spec: { name: string; value: string }) => ({
            name: spec.name,
            value: spec.value,
            productId: product.id,
          })),
        });
      }

      await tx.inventory.create({
        data: { productId: product.id, stock: 10, lowStockAlert: 2 },
      });

      return product;
    });

    // Revalidate every page that shows products
    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/offers");
    revalidatePath(`/shop?category=${categoryId}`);

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
