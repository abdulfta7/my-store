"use client";

import { useWishlistStore, useCartStore } from "@/lib/store";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Heart, ShoppingCart } from "lucide-react";
import styles from "../cart/Cart.module.css";
import { useLang } from "@/lib/i18n/LanguageContext";

export default function WishlistPage() {
  const [mounted, setMounted] = useState(false);
  const wishlist = useWishlistStore();
  const cart = useCartStore();
  const { t } = useLang();

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return (
    <div className="container" style={{ padding: "3rem 0" }}>{t("loadingWishlist")}</div>
  );

  const { items, removeItem, clearWishlist } = wishlist;

  const handleAddToCart = (item: any) => {
    cart.addItem({
      id: item.id,
      name: item.name,
      slug: item.slug,
      price: item.price,
      image: item.image,
      stock: item.stock,
    });
  };

  if (items.length === 0) {
    return (
      <div className={`container ${styles.container}`}>
        <h1 className={styles.title}>{t("yourWishlist")}</h1>
        <div className={styles.emptyCart}>
          <Heart size={64} className={styles.emptyIcon} style={{ margin: "0 auto 1rem" }} />
          <h2>{t("wishlistEmpty")}</h2>
          <p>{t("wishlistEmptyDesc")}</p>
          <Link href="/shop" className={styles.btnPrimary}>{t("exploreProducts")}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`container ${styles.container}`}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 className={styles.title} style={{ marginBottom: 0 }}>{t("yourWishlist")}</h1>
        <button
          onClick={clearWishlist}
          style={{ color: "var(--danger)", display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: "500" }}
        >
          <Trash2 size={16} /> {t("clearWishlist")}
        </button>
      </div>

      <div className={styles.cartLayout} style={{ flexDirection: "column" }}>
        <div className={styles.cartItems}>
          {items.map((item) => (
            <div key={item.id} className={styles.cartItem}>
              <div className={styles.itemImage}>
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  style={{ objectFit: "contain", padding: "0.5rem" }}
                />
              </div>
              <div className={styles.itemDetails}>
                <Link href={`/product/${item.slug}`} className={styles.itemName}>
                  {item.name}
                </Link>
                <div className={styles.itemPrice}>{item.price.toLocaleString()} EGP</div>
                <div className={styles.itemActions} style={{ justifyContent: "flex-start", gap: "1rem" }}>
                  <button
                    className={styles.btnPrimary}
                    style={{ margin: 0, padding: "0.5rem 1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}
                    onClick={() => handleAddToCart(item)}
                  >
                    <ShoppingCart size={16} /> {t("addToCart")}
                  </button>
                  <button className={styles.removeBtn} onClick={() => removeItem(item.id)} style={{ marginInlineStart: "auto" }}>
                    <Trash2 size={16} /> {t("remove")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
