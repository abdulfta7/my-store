import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";
import { Pagination } from "@/components/Pagination";
import styles from "./Shop.module.css";
import { SortSelect } from "./SortSelect";
import { ShopClient } from "./ShopClient";
import { Suspense } from "react";
import type { Metadata } from "next";

export function generateMetadata({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}): Metadata {
  const q = searchParams.q as string | undefined;
  const cat = searchParams.category as string | undefined;
  const title = q
    ? `Search: "${q}" | Zoma Tech`
    : cat
      ? `${cat} | Zoma Tech Shop`
      : "Shop | Zoma Tech — Laptops, Monitors & More";

  return {
    title,
    description: "Browse laptops, monitors, POS systems, projectors, and accessories at Zoma Tech Egypt.",
  };
}

const PAGE_SIZE = 12;

type SortKey = "newest" | "price-asc" | "price-desc" | "name-asc" | "name-desc";

const sortMap: Record<SortKey, object> = {
  newest: { createdAt: "desc" },
  "price-asc": { price: "asc" },
  "price-desc": { price: "desc" },
  "name-asc": { name: "asc" },
  "name-desc": { name: "desc" },
};

async function getShopData(
  searchParams: { [key: string]: string | string[] | undefined }
) {
  const categoryParam = searchParams.category as string | undefined;
  const brandParam = searchParams.brand as string | undefined;
  const minPriceParam = searchParams.minPrice as string | undefined;
  const maxPriceParam = searchParams.maxPrice as string | undefined;
  const q = searchParams.q as string | undefined;
  const sortParam = (searchParams.sort as string | undefined) ?? "newest";
  const page = Math.max(1, parseInt((searchParams.page as string) ?? "1") || 1);

  const where: any = { isPublished: true };

  const categorySlugs = categoryParam ? categoryParam.split(",") : [];
  if (categorySlugs.length > 0) {
    where.category = { slug: { in: categorySlugs } };
  }

  const brandSlugs = brandParam ? brandParam.split(",") : [];
  if (brandSlugs.length > 0) {
    where.brand = { slug: { in: brandSlugs } };
  }

  if (minPriceParam || maxPriceParam) {
    where.price = {};
    if (minPriceParam) where.price.gte = parseFloat(minPriceParam);
    if (maxPriceParam) where.price.lte = parseFloat(maxPriceParam);
  }

  if (q) {
    where.OR = [
      { name: { contains: q } },
      { description: { contains: q } },
    ];
  }

  const orderBy = sortMap[sortParam as SortKey] ?? sortMap.newest;

  const [total, products, categories, brands] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: {
        images: { where: { isPrimary: true } },
        brand: true,
        category: true,
      },
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Count how many filter groups are active (for the badge)
  const activeFilterCount =
    (categorySlugs.length > 0 ? 1 : 0) +
    (brandSlugs.length > 0 ? 1 : 0) +
    (minPriceParam ? 1 : 0) +
    (maxPriceParam ? 1 : 0);

  return {
    products, categories, brands,
    categorySlugs, q, sortParam,
    page, total, totalPages,
    activeFilterCount,
  };
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const {
    products, categories, brands,
    categorySlugs, q, sortParam,
    page, total, totalPages,
    activeFilterCount,
  } = await getShopData(searchParams);

  return (
    <div className={`container ${styles.shopContainer}`}>
      <main className={styles.mainContent}>

        {/* ── Header row: title + filter button + sort ── */}
        <div className={styles.header}>
          <h1 className={styles.title}>
            {q
              ? `Search results for "${q}"`
              : categorySlugs.length === 1
                ? categories.find((c) => c.slug === categorySlugs[0])?.name ?? "Shop"
                : "All Products"}
            <span className={styles.titleCount}>({total} products)</span>
          </h1>

          <div className={styles.headerActions}>
            <Suspense fallback={null}>
              <ShopClient
                categories={categories}
                brands={brands}
                activeFilterCount={activeFilterCount}
              />
            </Suspense>

            <Suspense fallback={null}>
              <SortSelect currentSort={sortParam} />
            </Suspense>
          </div>
        </div>

        {/* ── Active filter chips ── */}
        {activeFilterCount > 0 && (
          <div className={styles.activeFilters}>
            {categorySlugs.map((slug) => {
              const cat = categories.find((c) => c.slug === slug);
              return cat ? (
                <span key={slug} className={styles.filterChip}>
                  {cat.name}
                </span>
              ) : null;
            })}
            {(searchParams.minPrice || searchParams.maxPrice) && (
              <span className={styles.filterChip}>
                {searchParams.minPrice ? `From ${searchParams.minPrice} EGP` : ""}
                {searchParams.minPrice && searchParams.maxPrice ? " – " : ""}
                {searchParams.maxPrice ? `Up to ${searchParams.maxPrice} EGP` : ""}
              </span>
            )}
          </div>
        )}

        {/* ── Product grid ── */}
        {products.length > 0 ? (
          <>
            <div className={styles.productGrid}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <Suspense fallback={null}>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalItems={total}
                pageSize={PAGE_SIZE}
              />
            </Suspense>
          </>
        ) : (
          <div className={styles.empty}>
            <h2>No products found</h2>
            <p>Try adjusting your filters or search query.</p>
          </div>
        )}
      </main>
    </div>
  );
}
