"use client";

import styles from "./PromoBar.module.css";
import { useLang } from "@/lib/i18n/LanguageContext";

export function PromoBar() {
  const { isRTL } = useLang();
  return (
    <div className={styles.promoBar} dir={isRTL ? "rtl" : "ltr"}>
      
    </div>
  );
}
