import { prisma } from "@/lib/prisma";
import { HeroSlider } from "@/components/HeroSlider";
import { ProductCarousel } from "@/components/ProductCarousel";
import { RecentlyViewed } from "@/components/RecentlyViewed";
import { HomeTopClient } from "@/components/HomeTopClient";
import { HomeBottomClient } from "@/components/HomeBottomClient";

async function getData() {
  const [categoriesWithProducts, hasOffers] = await Promise.all([
    prisma.category.findMany({
      include: {
        products: {
          where: { isPublished: true },
          take: 100, // Increased limit to show more products per category
          include: {
            images: { where: { isPrimary: true } },
            brand: true,
            inventory: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    // Check if there are any active discounted products right now
    prisma.product.count({
      where: { isPublished: true, oldPrice: { not: null } },
    }),
  ]);

  return {
    activeCategories: categoriesWithProducts.filter((c) => c.products.length > 0),
    showPromoBanner: hasOffers > 0,
  };
}

export default async function Home() {
  const { activeCategories, showPromoBanner } = await getData();

  return (
    <div>
      {/* 1. Hero */}
      <HeroSlider />

      {/* 2. Categories strip */}
      <HomeTopClient activeCategories={activeCategories} />

      {/* 3. Promo banner — only if discounted products exist */}
      {showPromoBanner && <HomeBottomClient showOnlyPromo />}

      {/* 4. Per-category carousels */}
      {activeCategories.map((category) => (
        <ProductCarousel
          key={category.id}
          title={category.name}
          categorySlug={category.slug}
          products={category.products}
        />
      ))}

      {/* 5. Why Choose Us + CTA */}
      <HomeBottomClient />

      {/* 6. Recently Viewed — conditional, right before footer */}
      <div className="container">
        <RecentlyViewed />
      </div>
    </div>
  );
}
