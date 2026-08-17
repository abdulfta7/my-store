"use client";

import { useLang } from "@/lib/i18n/LanguageContext";
import styles from "@/app/(storefront)/product/[slug]/ProductDetails.module.css";

interface Props {
  description: string;
  descriptionAr?: string | null;
}

export function ProductDescription({ description, descriptionAr }: Props) {
  const { lang } = useLang();
  const text = lang === "ar" && descriptionAr ? descriptionAr : description;
  return <p className={styles.description}>{text}</p>;
}
