import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";



function isAdmin(session: any) {
  return (
    session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN"
  );
}

// ── PUT: update product ──────────────────────────────────────────────────────
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!isAdmin(session))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const productId = params.id;
    const body = await req.json();
    const {
      name, slug, sku, description, descriptionAr,
      price, oldPrice, discount,
      categoryId, brandId, isPublished, stock, imageUrls,
    } = body;

    if (
      !name || !slug || !sku || !description ||
      price === undefined || !categoryId || stock === undefined
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existingSlug = await prisma.product.findFirst({
      where: { slug, id: { not: productId } },
    });
    if (existingSlug)
      return NextResponse.json({ error: "Slug is already in use" }, { status: 400 });

    const existingSku = await prisma.product.findFirst({
      where: { sku, id: { not: productId } },
    });
    if (existingSku)
      return NextResponse.json({ error: "SKU is already in use" }, { status: 400 });

    const updatedProduct = await prisma.$transaction(async (tx) => {
      const product = await tx.product.update({
        where: { id: productId },
        data: {
          name, slug, sku, description,
          descriptionAr: descriptionAr || null,
          price: parseFloat(price),
          oldPrice: oldPrice ? parseFloat(oldPrice) : null,
          discount: discount ? parseFloat(discount) : null,
          categoryId,
          brandId: brandId || null,
          isPublished,
        },
      });

      await tx.inventory.upsert({
        where: { productId },
        update: { stock: parseInt(stock, 10) },
        create: { productId, stock: parseInt(stock, 10), lowStockAlert: 5 },
      });

      if (imageUrls && Array.isArray(imageUrls) && imageUrls.length > 0) {
        await tx.productImage.deleteMany({ where: { productId } });
        await tx.productImage.createMany({
          data: imageUrls.map((url: string, index: number) => ({
            productId,
            url,
            alt: `${name} - Image ${index + 1}`,
            isPrimary: index === 0,
          })),
        });
      }

      if (body.specs !== undefined) {
        await tx.productSpecification.deleteMany({ where: { productId } });
        if (Array.isArray(body.specs) && body.specs.length > 0) {
          await tx.productSpecification.createMany({
            data: body.specs.map((spec: { name: string; value: string }) => ({
              productId,
              name: spec.name,
              value: spec.value,
            })),
          });
        }
      }

      return product;
    });

    // Revalidate affected pages
    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/offers");
    revalidatePath(`/product/${slug}`);
    revalidatePath(`/shop?category=${categoryId}`);

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ── DELETE: remove product ───────────────────────────────────────────────────
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!isAdmin(session))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const productId = params.id;

    const orderItemsCount = await prisma.orderItem.count({ where: { productId } });
    if (orderItemsCount > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete this product because it has been ordered by customers. Please 'Unpublish' it instead.",
        },
        { status: 400 }
      );
    }

    // Grab slug + categoryId before deleting (needed for revalidation)
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { slug: true, categoryId: true },
    });

    await prisma.$transaction(async (tx) => {
      await tx.productImage.deleteMany({ where: { productId } });
      await tx.inventory.deleteMany({ where: { productId } });
      await tx.product.delete({ where: { id: productId } });
    });

    // Revalidate
    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/offers");
    if (product) {
      revalidatePath(`/product/${product.slug}`);
      revalidatePath(`/shop?category=${product.categoryId}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
