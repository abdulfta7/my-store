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

// ── PUT: update category ─────────────────────────────────────────────────────
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!isAdmin(session))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const categoryId = params.id;
    const body = await req.json();
    const { name, slug, description, imageUrl } = body;

    if (!name || !slug)
      return NextResponse.json(
        { error: "Name and Slug are required" },
        { status: 400 }
      );

    const existing = await prisma.category.findFirst({
      where: { slug, id: { not: categoryId } },
    });
    if (existing)
      return NextResponse.json(
        { error: "Slug is already in use by another category" },
        { status: 400 }
      );

    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: { name, slug, description, imageUrl },
    });

    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath(`/category/${slug}`);

    return NextResponse.json({ success: true, category: updatedCategory });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ── DELETE: remove category ──────────────────────────────────────────────────
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!isAdmin(session))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const categoryId = params.id;

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: { _count: { select: { products: true } } },
    });

    if (!category)
      return NextResponse.json({ error: "Category not found" }, { status: 404 });

    if (category._count.products > 0)
      return NextResponse.json(
        {
          error:
            "Cannot delete category because it contains products. Reassign or delete the products first.",
        },
        { status: 400 }
      );

    await prisma.category.delete({ where: { id: categoryId } });

    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath(`/category/${category.slug}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
