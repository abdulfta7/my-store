"use client";

import { useEffect } from "react";
import { useRecentlyViewed, RecentlyViewedProduct } from "@/lib/hooks/useRecentlyViewed";

export function ProductViewTracker({ product }: { product: RecentlyViewedProduct }) {
  const { addProduct } = useRecentlyViewed();

  useEffect(() => {
    addProduct(product);
  }, [product.id]); // only re-run if product ID changes

  return null;
}
