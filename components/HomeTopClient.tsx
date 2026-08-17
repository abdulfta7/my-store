"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLang } from "@/lib/i18n/LanguageContext";
import styles from "@/app/(storefront)/Home.module.css";

const categoryIcons: Record<string, string> = {
  laptops: "💻",
  monitors: "🖥️",
  pcs: "🖱️",
  "pos-systems": "🏪",
  "active-panels": "📺",
  projectors: "📽️",
  accessories: "🎧",
};

interface Props {
  activeCategories: any[];
}

export function HomeTopClient({ activeCategories }: Props) {
  const { t } = useLang();

  return (
    <section className={styles.categoriesSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t("shopByCategory")}</h2>
          <Link href="/shop" className={styles.seeAll}>
            {t("seeAll")} <ArrowRight size={15} />
          </Link>
        </div>
        <div className={styles.categoryGrid}>
          {activeCategories.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              className={styles.categoryCard}
            >
              <span className={styles.categoryEmoji}>
                {categoryIcons[cat.slug] || "📦"}
              </span>
              <span className={styles.categoryName}>{cat.name}</span>
              <span className={styles.categoryCount}>
                {cat.products.length} {t("items")}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
