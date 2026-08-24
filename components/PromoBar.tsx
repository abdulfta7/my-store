"use client";

import styles from "./PromoBar.module.css";
import { useLang } from "@/lib/i18n/LanguageContext";

import { Tag, ArrowLeft } from "lucide-react";

export function PromoBar() {
  const { isRTL } = useLang();
  return (
    <div className={styles.promoBar} dir={isRTL ? "rtl" : "ltr"}>
      <div className={`container ${styles.promoContent}`}>
        <div className={styles.message}>
          <Tag size={18} className={styles.icon} />
          <span>
            استخدم كود الخصم <span dir="ltr">ZOMA1</span> واحصل على خصم <span dir="ltr">5%</span>
          </span>
        </div>
        <a href="/track-order" className={styles.trackBtn}>
          تتبع طلبك
          <ArrowLeft size={16} />
        </a>
      </div>
    </div>
  );
}
