import { prisma } from "@/lib/prisma";

import { notFound } from "next/navigation";
import { ProductEditForm } from "@/components/admin/ProductEditForm";



export default async function AdminEditProductPage({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      inventory: true,
      images: true,
      specs: true
    }
  });

  if (!product) {
    notFound();
  }

  return <ProductEditForm product={product} />;
}
