"use client";

import { Shield, Truck, Phone } from "lucide-react";
import styles from "@/app/(storefront)/product/[slug]/ProductDetails.module.css";
import { useLang } from "@/lib/i18n/LanguageContext";

interface Props {
  whatsappUrl: string;
  inStock: boolean;
  stock: number;
  sku: string;
  discount: number | null;
}

export function ProductInfoClient({ whatsappUrl, inStock, stock, sku, discount }: Props) {
  const { t } = useLang();

  return (
    <>
      {/* Meta row */}
      <div className={styles.meta}>
        <span className={styles.metaItem}>{t("skuLabel")} {sku}</span>
        <span
          style={{
            color: "white",
            backgroundColor: inStock ? "var(--success)" : "var(--danger)",
            padding: "0.2rem 0.7rem",
            borderRadius: "999px",
            fontWeight: 700,
            fontSize: "0.8125rem",
          }}
        >
          {inStock ? `✓ ${t("inStockCount")} (${stock})` : `✗ ${t("outOfStock")}`}
        </span>
      </div>

      {inStock && stock <= 5 && (
        <div style={{ color: "var(--danger)", fontWeight: "bold", marginTop: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "1.2rem" }}>🔥</span>
          سارع بالشراء! تبقى {stock} قطع فقط في المخزون
        </div>
      )}

      {/* Discount badge */}
      {discount && discount > 0 && (
        <span className={styles.discount}>
          {t("saveLabel")} {discount.toLocaleString()} EGP
        </span>
      )}

      {/* WhatsApp CTA */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.whatsappBtn}
      >
        <Phone size={20} />
        {t("askOnWhatsApp")}
      </a>

      {/* Trust badges */}
      <div className={styles.trustBadges}>
        <div className={styles.trustItem}>
          <Shield size={20} color="var(--primary)" />
          <div>
            <strong>{t("warranty")}</strong>
            {t("warrantyDesc")}
          </div>
        </div>
        <div className={styles.trustItem}>
          <Truck size={20} color="var(--primary)" />
          <div>
            <strong>{t("fastDeliveryLabel")}</strong>
            {t("fastDeliveryDesc")}
          </div>
        </div>
      </div>
    </>
  );
}
