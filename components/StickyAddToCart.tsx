"use client";

import { useState, useEffect, useRef } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { toast } from "sonner";
import styles from "@/app/(storefront)/product/[slug]/ProductDetails.module.css";

interface Props {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    image: string;
    stock: number;
  };
}

export function StickyAddToCart({ product }: Props) {
  const [visible, setVisible]   = useState(false);
  const [added, setAdded]       = useState(false);
  const sentinelRef             = useRef<HTMLDivElement>(null);
  const addItem                 = useCartStore((s) => s.addItem);

  // Show sticky bar once the main "Add to Cart" button scrolls out of viewport
  useEffect(() => {
    // The sentinel sits right after the main action buttons
    const sentinel = document.getElementById("product-actions-sentinel");
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const handleAdd = () => {
    addItem({ ...product, quantity: 1 });
    setAdded(true);
    toast.success(`${product.name} added to cart`);
    setTimeout(() => setAdded(false), 2000);
  };

  if (!visible) return null;

  return (
    <div className={styles.stickyBar}>
      <div className={styles.stickyBarInfo}>
        <div className={styles.stickyBarName}>{product.name}</div>
        <div className={styles.stickyBarPrice}>
          {product.price.toLocaleString()} EGP
        </div>
      </div>
      <button
        className={styles.stickyBarBtn}
        onClick={handleAdd}
        disabled={product.stock === 0 || added}
      >
        {added ? (
          <><Check size={16} /> Added!</>
        ) : product.stock === 0 ? (
          "Out of Stock"
        ) : (
          <><ShoppingCart size={16} /> Add to Cart</>
        )}
      </button>
    </div>
  );
}
