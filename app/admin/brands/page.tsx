import { prisma } from "@/lib/prisma";
import { BrandsClient } from "./BrandsClient";

export const dynamic = "force-dynamic";

export default async function AdminBrandsPage() {
  const brands = await prisma.brand.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.875rem", fontWeight: "bold" }}>Brands</h1>
      </div>
      <BrandsClient initialBrands={brands} />
    </div>
  );
}
