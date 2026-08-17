"use client";

import Link from "next/link";
import { ShieldCheck, Truck, Headphones, CreditCard, ArrowRight, Zap } from "lucide-react";
import { useLang } from "@/lib/i18n/LanguageContext";
import styles from "@/app/(storefront)/Home.module.css";

interface Props {
  /** When true, renders only the promo banner (used before the carousels) */
  showOnlyPromo?: boolean;
}

export function HomeBottomClient({ showOnlyPromo = false }: Props) {
  const { t } = useLang();

  const features = [
    { icon: ShieldCheck, titleKey: "f1Title", descKey: "f1Desc", color: "#10b981", bg: "rgba(16,185,129,0.08)" },
    { icon: Truck, titleKey: "f2Title", descKey: "f2Desc", color: "#3b82f6", bg: "rgba(59,130,246,0.08)" },
    { icon: CreditCard, titleKey: "f3Title", descKey: "f3Desc", color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
    { icon: Headphones, titleKey: "f4Title", descKey: "f4Desc", color: "#8b5cf6", bg: "rgba(139,92,246,0.08)" },
  ] as const;

  /* ── Promo banner only ── */
  if (showOnlyPromo) {
    return (
      <section className={styles.promoBanner}>
        <div className="container">
          <div className={styles.promoInner}>
            <div className={styles.promoText}>
              <span className={styles.promoTag}>
                <Zap size={13} /> {t("limitedTime")}
              </span>
              <h2 className={styles.promoTitle}>{t("offersTitle")}</h2>
              <p className={styles.promoDesc}>{t("offersDesc")}</p>
              <Link href="/offers" className={styles.promoBtn}>
                {t("viewAllOffers")} <ArrowRight size={15} />
              </Link>
            </div>
            <div className={styles.promoVisual} aria-hidden>🏷️</div>
          </div>
        </div>
      </section>
    );
  }

  /* ── Why Choose Us + CTA ── */
  return (
    <>
      <section className={styles.featuresSection}>
        <div className="container">
          <div className={styles.sectionHeader} style={{ justifyContent: "center", marginBottom: "2.5rem" }}>
            <h2 className={styles.sectionTitle}>{t("whyChooseUs")}</h2>
          </div>
          <div className={styles.featuresGrid}>
            {features.map((f) => (
              <div key={f.titleKey} className={styles.featureCard}>
                <div className={styles.featureIconWrap} style={{ background: f.bg }}>
                  <f.icon size={24} color={f.color} strokeWidth={1.75} />
                </div>
                <h3 className={styles.featureTitle}>{t(f.titleKey)}</h3>
                <p className={styles.featureDesc}>{t(f.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.ctaStrip}>
        <div className="container">
          <div className={styles.ctaInner}>
            <div>
              <h2 className={styles.ctaTitle}>{t("readyToUpgrade")}</h2>
              <p className={styles.ctaDesc}>{t("browse500")}</p>
            </div>
            <div className={styles.ctaActions}>
              <Link href="/shop" className={styles.ctaPrimary}>
                {t("shopNow")} <ArrowRight size={15} />
              </Link>
              <Link href="/about" className={styles.ctaSecondary}>
                {t("aboutUs")}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
