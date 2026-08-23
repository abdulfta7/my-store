"use client";

import { useRecentlyViewed } from "@/lib/hooks/useRecentlyViewed";
import { ProductCarousel } from "./ProductCarousel";
import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n/LanguageContext";

export function RecentlyViewed() {
  const { recentProducts } = useRecentlyViewed();
  const { t } = useLang();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || recentProducts.length === 0) return null;

  return (
    <div style={{ marginTop: '4rem' }}>
      <ProductCarousel 
        title={t("recentlyViewed")} 
        categorySlug="" 
        products={recentProducts as any} 
      />
    </div>
  );
}
