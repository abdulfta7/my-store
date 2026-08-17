"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import styles from "./Shop.module.css";
import { useLang } from "@/lib/i18n/LanguageContext";

export function SortSelect({ currentSort }: { currentSort: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useLang();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", e.target.value);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <select
      className={styles.sortSelect}
      value={currentSort}
      onChange={handleChange}
      aria-label={t("filters")}
    >
      <option value="newest">{t("sortNewest")}</option>
      <option value="price-asc">{t("sortPriceAsc")}</option>
      <option value="price-desc">{t("sortPriceDesc")}</option>
      <option value="name-asc">{t("sortNameAsc")}</option>
      <option value="name-desc">{t("sortNameDesc")}</option>
    </select>
  );
}
