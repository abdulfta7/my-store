"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { FilterSidebar } from "@/components/FilterSidebar";
import { Suspense } from "react";
import styles from "./Shop.module.css";
import { useLang } from "@/lib/i18n/LanguageContext";

interface Props {
  categories: any[];
  brands: any[];
  activeFilterCount: number;
}

export function ShopClient({ categories, brands, activeFilterCount }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLang();

  return (
    <>
      <button
        className={styles.filterToggleBtn}
        onClick={() => setIsOpen(true)}
        aria-label={t("filters")}
      >
        <SlidersHorizontal size={17} />
        <span>{t("filters")}</span>
        {activeFilterCount > 0 && (
          <span className={styles.filterBadge}>{activeFilterCount}</span>
        )}
      </button>

      <Suspense fallback={null}>
        <FilterSidebar
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          categories={categories}
          brands={brands}
        />
      </Suspense>
    </>
  );
}
