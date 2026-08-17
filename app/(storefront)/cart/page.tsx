"use client";

import { useCartStore } from "@/lib/store";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, ShoppingCart } from "lucide-react";
import styles from "./Cart.module.css";
import { useLang } from "@/lib/i18n/LanguageContext";

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const cart = useCartStore();
  const { t } = useLang();

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return (
    <div className="container" style={{ padding: "3rem 0" }}>{t("loadingCart")}</div>
  );

  const { items, removeItem, updateQuantity, getTotal } = cart;

  if (items.length === 0) {
    return (
      <div className={`container ${styles.container}`}>
        <h1 className={styles.title}>{t("cartTitle")}</h1>
        <div className={styles.emptyCart}>
          <ShoppingCart size={64} className={styles.emptyIcon} />
          <h2>{t("cartEmpty")}</h2>
          <p>{t("cartEmptyDesc")}</p>
          <Link href="/shop" className={styles.btnPrimary}>{t("continueShopping")}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`container ${styles.container}`}>
      <h1 className={styles.title}>{t("cartTitle")}</h1>

      <div className={styles.cartLayout}>
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
                <div className={styles.itemActions}>
                  <div className={styles.quantity}>
                    <button
                      className={styles.qtyBtn}
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                    >-</button>
                    <input type="number" value={item.quantity} readOnly className={styles.qtyInput} />
                    <button
                      className={styles.qtyBtn}
                      onClick={() => updateQuantity(item.id, Math.min(item.stock, item.quantity + 1))}
                    >+</button>
                  </div>
                  <button className={styles.removeBtn} onClick={() => removeItem(item.id)}>
                    <Trash2 size={16} /> {t("remove")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.summary}>
          <h2 className={styles.summaryTitle}>{t("orderSummary")}</h2>
          <div className={styles.summaryRow}>
            <span>{t("subtotal")}</span>
            <span>{getTotal().toLocaleString()} EGP</span>
          </div>
          <div className={styles.summaryRow}>
            <span>{t("shipping")}</span>
            <span>{t("shippingCalc")}</span>
          </div>
          <div className={styles.summaryTotal}>
            <span>{t("total")}</span>
            <span>{getTotal().toLocaleString()} EGP</span>
          </div>
          <Link href="/checkout" className={styles.checkoutBtn}>
            {t("proceedToCheckout")}
          </Link>
        </div>
      </div>
    </div>
  );
}
