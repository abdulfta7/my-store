"use client";

import { useRecentlyViewed } from "@/lib/hooks/useRecentlyViewed";
import { ProductCarousel } from "./ProductCarousel";
import { useEffect, useState } from "react";

export function RecentlyViewed() {
  const { recentProducts } = useRecentlyViewed();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || recentProducts.length === 0) return null;

  return (
    <div style={{ marginTop: '4rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
        Recently Viewed
      </h2>
      <ProductCarousel products={recentProducts as any} />
    </div>
  );
}
