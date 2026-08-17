import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

function isAdmin(s: any) { return s?.user?.role === "ADMIN" || s?.user?.role === "SUPER_ADMIN"; }

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { name, slug, imageUrl } = await req.json();
  if (!name || !slug) return NextResponse.json({ error: "Name and slug required" }, { status: 400 });

  try {
    const brand = await prisma.brand.update({ where: { id: params.id }, data: { name: name.trim(), slug: slug.trim().toLowerCase(), imageUrl: imageUrl || null } });
    revalidatePath("/shop"); revalidatePath("/");
    return NextResponse.json(brand);
  } catch (e: any) {
    if (e.code === "P2002") return NextResponse.json({ error: "Slug already in use" }, { status: 409 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const brand = await prisma.brand.findUnique({ where: { id: params.id }, include: { _count: { select: { products: true } } } });
  if (!brand) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (brand._count.products > 0) return NextResponse.json({ error: `Cannot delete — ${brand._count.products} products use this brand.` }, { status: 400 });

  await prisma.brand.delete({ where: { id: params.id } });
  revalidatePath("/shop"); revalidatePath("/");
  return NextResponse.json({ success: true });
}
