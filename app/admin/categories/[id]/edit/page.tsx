import { prisma } from "@/lib/prisma";

import { notFound } from "next/navigation";
import { CategoryEditForm } from "@/components/admin/CategoryEditForm";



export default async function AdminEditCategoryPage({ params }: { params: { id: string } }) {
  const category = await prisma.category.findUnique({
    where: { id: params.id }
  });

  if (!category) {
    notFound();
  }

  return <CategoryEditForm category={category} />;
}
