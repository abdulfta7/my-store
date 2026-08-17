"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import styles from "../app/(storefront)/product/[slug]/ProductDetails.module.css";
import { useCartStore } from "@/lib/store";
import { toast } from "sonner";
import { useLang } from "@/lib/i18n/LanguageContext";

interface AddToCartDetailsProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    image: string;
    stock: number;
  };
}

export function AddToCartDetails({ product }: AddToCartDetailsProps) {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);
  const [added, setAdded] = useState(false);
  const { t } = useLang();

  const handleAddToCart = () => {
    addItem({ ...product, quantity });
    setAdded(true);
    toast.success(`${product.name} ${t("added")}`);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className={styles.actions}>
      <div className={styles.quantity}>
        <button
          className={styles.qtyBtn}
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          aria-label="Decrease quantity"
        >-</button>
        <input
          type="number"
          value={quantity}
          readOnly
          className={styles.qtyInput}
          aria-label="Quantity"
        />
        <button
          className={styles.qtyBtn}
          onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
          aria-label="Increase quantity"
        >+</button>
      </div>

      <button
        className={styles.addToCart}
        onClick={handleAddToCart}
        disabled={product.stock === 0 || added}
        style={{ backgroundColor: added ? "var(--success)" : "" }}
      >
        {added ? <Check size={22} /> : <ShoppingCart size={22} />}
        {product.stock === 0
          ? t("outOfStock")
          : added
            ? t("added")
            : t("addToCart")}
      </button>
    </div>
  );
}
