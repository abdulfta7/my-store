import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";
import type { Metadata } from "next";

export const metadata = {
  title: "Categories | Zoma Tech",
  description: "Browse our product categories at Zoma Tech Egypt.",
};

const PAGE_SIZE = 12;

async function getCategoryData(searchParams: { [key: string]: string | string[] | undefined }) {
  const categoryParam = searchParams.category as string | undefined;
  const qParam = searchParams.q as string | undefined;
  const page = Math.max(1, parseInt((searchParams.page as string) ?? "1") || 1);

  const where: any = { isPublished: true };

  if (categoryParam) {
    const categorySlugs = categoryParam.split(",");
    if (categorySlugs.length > 0) {
      where.category = { slug: { in: categorySlugs } };
    }
  }

  if (qParam) {
    where.OR = [
      { name: { contains: qParam, mode: "insensitive" } },
      { description: { contains: qParam, mode: "insensitive" } },
      { sku: { contains: qParam, mode: "insensitive" } }
    ];
  }

  const [total, products, categories] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: {
        images: { where: { isPrimary: true } },
        brand: true,
        category: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return {
    products,
    categories,
    categoryParam,
    qParam,
    page,
    total,
    totalPages,
  };
}

export default async function CategoryPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { products, categories, categoryParam, qParam, page, total, totalPages } =
    await getCategoryData(searchParams);

  return (
    <div className="container" style={{ padding: "3rem 0" }}>
      <main>
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
            {qParam 
              ? `Search Results for "${qParam}"`
              : categoryParam
                ? categories.find((c) => c.slug === categoryParam)?.name ?? "Category"
                : "Shop All"}
            <span style={{ fontSize: "1rem", color: "#64748b", marginLeft: "0.5rem" }}>
              ({total} products)
            </span>
          </h1>
        </div>

        {products.length > 0 ? (
          <>
            <div className="product-grid">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {totalPages > 1 && (
              <div style={{ 
                display: "flex", 
                justifyContent: "center", 
                alignItems: "center", 
                gap: "1rem",
                padding: "1rem"
              }}>
                {page > 1 && (
                  <a
                    href={`?page=${page - 1}${categoryParam ? `&category=${categoryParam}` : ""}${qParam ? `&q=${qParam}` : ""}`}
                    style={{
                      padding: "0.5rem 1rem",
                      backgroundColor: "var(--primary)",
                      color: "white",
                      borderRadius: "4px",
                      textDecoration: "none"
                    }}
                  >
                    Previous
                  </a>
                )}
                <span style={{ color: "#64748b" }}>
                  Page {page} of {totalPages}
                </span>
                {page < totalPages && (
                  <a
                    href={`?page=${page + 1}${categoryParam ? `&category=${categoryParam}` : ""}${qParam ? `&q=${qParam}` : ""}`}
                    style={{
                      padding: "0.5rem 1rem",
                      backgroundColor: "var(--primary)",
                      color: "white",
                      borderRadius: "4px",
                      textDecoration: "none"
                    }}
                  >
                    Next
                  </a>
                )}
              </div>
            )}
          </>
        ) : (
          <div style={{ 
            textAlign: "center", 
            padding: "4rem", 
            backgroundColor: "#f8fafc", 
            borderRadius: "8px" 
          }}>
            <h2>No products found</h2>
            <p>{qParam ? "Try searching with different keywords." : "Try selecting a different category."}</p>
          </div>
        )}
      </main>
    </div>
  );
}