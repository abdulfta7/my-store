"use client";

import { useState, useEffect } from 'react';

export interface RecentlyViewedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  oldPrice: number | null;
  discount: number | null;
  image: string;
  brand?: { name: string } | null;
  category?: { name: string } | null;
  stock?: number;
}

const STORAGE_KEY = 'zoma-recently-viewed';
const MAX_ITEMS = 8;

export function useRecentlyViewed() {
  const [recentProducts, setRecentProducts] = useState<RecentlyViewedProduct[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setRecentProducts(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load recently viewed products", error);
    }
  }, []);

  const addProduct = (product: RecentlyViewedProduct) => {
    setRecentProducts((prev) => {
      // Remove product if it already exists to move it to the front
      const filtered = prev.filter(p => p.id !== product.id);
      
      const updated = [product, ...filtered].slice(0, MAX_ITEMS);
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error("Failed to save recently viewed products", error);
      }
      
      return updated;
    });
  };

  const clearRecentlyViewed = () => {
    setRecentProducts([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return { recentProducts, addProduct, clearRecentlyViewed };
}
