"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import styles from "@/app/(storefront)/product/[slug]/ProductDetails.module.css";
import { ReviewSection } from "./ReviewSection";
import { useLang } from "@/lib/i18n/LanguageContext";

interface Spec { id: string; name: string; value: string }
interface ProductTabsProps { productId: string; specs: Spec[] }

// ── Specs grid (reused in both accordion and tab) ─────────────────────────
function SpecsContent({ specs }: { specs: Spec[] }) {
  const { t } = useLang();
  if (specs.length === 0)
    return <p style={{ color: "var(--text-muted)" }}>{t("noSpecifications")}</p>;
  return (
    <div className={styles.specGrid}>
      {specs.map((spec) => (
        <div key={spec.id} className={styles.specRow}>
          <div className={styles.specName}>{spec.name}</div>
          <div className={styles.specValue}>{spec.value}</div>
        </div>
      ))}
    </div>
  );
}

// ── Accordion item (mobile only) ──────────────────────────────────────────
function AccordionItem({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={styles.accordionItem}>
      <button className={styles.accordionTrigger} onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span>{label}</span>
        <ChevronDown
          size={18}
          className={`${styles.accordionChevron} ${open ? styles.accordionChevronOpen : ""}`}
        />
      </button>
      {open && <div className={styles.accordionBody}>{children}</div>}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────
export function ProductTabs({ productId, specs }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<"specs" | "reviews">("specs");
  const { t } = useLang();

  return (
    <div className={styles.tabs}>

      {/* Mobile: Accordion (hidden on ≥640px via CSS) */}
      <AccordionItem label={t("specifications")}>
        <SpecsContent specs={specs} />
      </AccordionItem>
      <AccordionItem label={t("reviews")}>
        <ReviewSection productId={productId} />
      </AccordionItem>

      {/* Desktop: Tabs (hidden on <640px via CSS) */}
      <div className={styles.tabList} role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === "specs"}
          className={`${styles.tab} ${activeTab === "specs" ? styles.active : ""}`}
          onClick={() => setActiveTab("specs")}
        >
          {t("specifications")}
        </button>
        <button
          role="tab"
          aria-selected={activeTab === "reviews"}
          className={`${styles.tab} ${activeTab === "reviews" ? styles.active : ""}`}
          onClick={() => setActiveTab("reviews")}
        >
          {t("reviews")}
        </button>
      </div>

      <div className={styles.tabContent} role="tabpanel">
        {activeTab === "specs" && <SpecsContent specs={specs} />}
        {activeTab === "reviews" && <ReviewSection productId={productId} />}
      </div>

    </div>
  );
}
