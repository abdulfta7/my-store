"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Check } from "lucide-react";
import styles from "./ProductCard.module.css";
import { useCartStore, useWishlistStore } from "@/lib/store";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useLang } from "@/lib/i18n/LanguageContext";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    oldPrice: number | null;
    discount: number | null;
    images: { url: string; alt: string | null }[];
    brand?: { name: string } | null;
    category?: { name: string } | null;
    inventory?: { stock: number } | null;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { t } = useLang();
  const imageUrl = product.images?.[0]?.url || (product as any).image || "/placeholder-product.png";
  const addItem = useCartStore((state) => state.addItem);
  const [added, setAdded] = useState(false);

  const stock = product.inventory?.stock ?? 10;

  const { addItem: addWishlistItem, removeItem: removeWishlistItem, hasItem } =
    useWishlistStore();
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    setIsWishlisted(hasItem(product.id));
  }, [hasItem, product.id]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: imageUrl,
      stock,
    });
    setAdded(true);
    toast.success(`${product.name} added to cart`);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isWishlisted) {
      removeWishlistItem(product.id);
      setIsWishlisted(false);
    } else {
      addWishlistItem({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image: imageUrl,
        stock,
      });
      setIsWishlisted(true);
      toast.success(`${product.name} added to wishlist`);
    }
  };

  // Stock status
  const stockStatus =
    stock === 0
      ? { label: t("outOfStock"), color: "#ef4444" }
      : stock <= 5
        ? { label: `${t("onlyLeft")} ${stock} ${t("leftInStock")}`, color: "#f59e0b" }
        : { label: "In stock", color: "#10b981" };

  return (
    <div className={styles.card}>
      {/* Image */}
      <Link href={`/product/${product.slug}`} className={styles.imageWrapper}>
        {product.discount && product.discount > 0 && (
          <span className={styles.badge}>Save {product.discount.toLocaleString()} EGP</span>
        )}

        {/* Wishlist — floats over the image */}
        <button
          className={`${styles.wishlistBtn} ${isWishlisted ? styles.wishlistActive : ""}`}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          onClick={handleWishlistToggle}
        >
          <Heart size={16} fill={isWishlisted ? "#ef4444" : "none"} strokeWidth={2} />
        </button>

        <div style={{ position: "relative", width: "100%", height: "100%" }}>
          <Image
            src={imageUrl}
            alt={product.images?.[0]?.alt || product.name}
            fill
            style={{ objectFit: "contain", padding: "1.25rem" }}
            sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        </div>
      </Link>

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.brand}>{product.brand?.name || "Zoma Tech"}</div>

        <Link href={`/product/${product.slug}`} className={styles.title}>
          {product.name}
        </Link>

        <div className={styles.pricing}>
          <span className={styles.price}>{product.price.toLocaleString()} EGP</span>
          {product.oldPrice && (
            <span className={styles.oldPrice}>
              {product.oldPrice.toLocaleString()} EGP
            </span>
          )}
        </div>

        <div className={styles.stockRow}>
          <span className={styles.stockDot} style={{ backgroundColor: stockStatus.color }} />
          <span className={styles.stockText} style={{ color: stockStatus.color }}>
            {stockStatus.label}
          </span>
        </div>

        <button
          className={styles.addToCartBtn}
          onClick={handleAddToCart}
          disabled={added || stock === 0}
        >
          {added ? (
            <><Check size={16} />{t("added")}</>
          ) : stock === 0 ? (
            t("outOfStock")
          ) : (
            <><ShoppingCart size={16} />{t("addToCart")}</>
          )}
        </button>
      </div>
    </div>
  );
}
