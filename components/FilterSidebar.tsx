"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import styles from "./FilterSidebar.module.css";
import { useLang } from "@/lib/i18n/LanguageContext";

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  categories: any[];
  brands: any[];
}

export function FilterSidebar({ isOpen, onClose, categories, brands }: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLang();

  const initialCategories = searchParams.get("category")?.split(",") || [];
  const initialBrands = searchParams.get("brand")?.split(",") || [];
  const initialMinPrice = searchParams.get("minPrice") || "";
  const initialMaxPrice = searchParams.get("maxPrice") || "";

  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategories);
  const [selectedBrands, setSelectedBrands] = useState<string[]>(initialBrands);
  const [minPrice, setMinPrice] = useState(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);

  const handleCategoryChange = (slug: string) =>
    setSelectedCategories((p) => p.includes(slug) ? p.filter((c) => c !== slug) : [...p, slug]);

  const handleBrandChange = (slug: string) =>
    setSelectedBrands((p) => p.includes(slug) ? p.filter((b) => b !== slug) : [...p, slug]);

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString());
    selectedCategories.length > 0 ? params.set("category", selectedCategories.join(",")) : params.delete("category");
    selectedBrands.length > 0 ? params.set("brand", selectedBrands.join(",")) : params.delete("brand");
    minPrice ? params.set("minPrice", minPrice) : params.delete("minPrice");
    maxPrice ? params.set("maxPrice", maxPrice) : params.delete("maxPrice");
    params.delete("page");
    router.push(`/shop?${params.toString()}`);
    onClose();
  };

  const handleReset = () => {
    setSelectedCategories([]); setSelectedBrands([]); setMinPrice(""); setMaxPrice("");
    const params = new URLSearchParams(searchParams.toString());
    ["category", "brand", "minPrice", "maxPrice", "page"].forEach((k) => params.delete(k));
    router.push(`/shop?${params.toString()}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.sidebar}>
        <div className={styles.header}>
          <h2>{t("filterTitle")}</h2>
          <button onClick={onClose} className={styles.closeBtn} aria-label="Close">
            <X size={22} />
          </button>
        </div>

        <div className={styles.content}>
          {/* Categories */}
          <div className={styles.filterGroup}>
            <h3>{t("categoriesFilter")}</h3>
            <div className={styles.checkboxList}>
              {categories.map((cat) => (
                <label key={cat.id} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat.slug)}
                    onChange={() => handleCategoryChange(cat.slug)}
                  />
                  <span>{cat.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Brands */}
          <div className={styles.filterGroup}>
            <h3>{t("brandsFilter")}</h3>
            <div className={styles.checkboxList}>
              {brands.map((brand) => (
                <label key={brand.id} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand.slug)}
                    onChange={() => handleBrandChange(brand.slug)}
                  />
                  <span>{brand.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className={styles.filterGroup}>
            <h3>{t("priceRange")}</h3>
            <div className={styles.priceInputs}>
              <input
                type="number"
                placeholder={t("minPrice")}
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className={styles.priceInput}
              />
              <span>—</span>
              <input
                type="number"
                placeholder={t("maxPrice")}
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className={styles.priceInput}
              />
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button onClick={handleReset} className={styles.resetBtn}>{t("resetFilters")}</button>
          <button onClick={handleApply} className={styles.applyBtn}>{t("applyFilters")}</button>
        </div>
      </div>
    </>
  );
}
