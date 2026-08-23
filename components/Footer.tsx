"use client";

import Link from "next/link";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import styles from "./Footer.module.css";
import { useLang } from "@/lib/i18n/LanguageContext";

export function Footer() {
  const { t } = useLang();

  const categories = [
    { key: "laptops", slug: "laptops" },
    { key: "monitors", slug: "monitors" },
    { key: "pcs", slug: "pcs" },
    { key: "posSystems", slug: "pos-systems" },
    { key: "activePanels", slug: "active-panels" },
    { key: "projectors", slug: "projectors" },
    { key: "accessories", slug: "accessories" },
  ] as const;

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.grid}>

          {/* ── Brand ── */}
          <div className={styles.brandCol}>
            <div className={styles.logo}>
              <span>Zoma</span><span className={styles.logoAccent}>Tech</span>
            </div>
            <p className={styles.tagline}>{t("footerTagline")}</p>
            <a
              href="https://wa.me/201554473748"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.whatsappBtn}
            >
              <MessageCircle size={17} />
              {t("chatWhatsApp")}
            </a>
          </div>

          {/* ── Categories ── */}
          <div className={styles.col}>
            <h4 className={styles.colTitle}>{t("footerCategories")}</h4>
            <ul className={styles.linkList}>
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link href={`/shop?category=${c.slug}`} className={styles.footerLink}>
                    {t(c.key as any)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Quick links ── */}
          <div className={styles.col}>
            <h4 className={styles.colTitle}>{t("quickLinks")}</h4>
            <ul className={styles.linkList}>
              <li><Link href="/offers" className={styles.footerLink}>{t("specialOffers")}</Link></li>
              <li><Link href="/contact" className={styles.footerLink}>{t("contactUs")}</Link></li>
              <li><Link href="/account" className={styles.footerLink}>{t("myAccount")}</Link></li>
              <li><Link href="/cart" className={styles.footerLink}>{t("cart")}</Link></li>
              <li><Link href="/wishlist" className={styles.footerLink}>{t("wishlist")}</Link></li>
            </ul>
          </div>

          {/* ── Contact ── */}
          <div className={styles.col}>
            <h4 className={styles.colTitle}>{t("contactUs")}</h4>
            <div className={styles.contactList}>
              <div className={styles.contactItem}>
                <MapPin size={15} className={styles.contactIcon} />
                <span>Cairo, Egypt</span>
              </div>
              <div className={styles.contactItem}>
                <Mail size={15} className={styles.contactIcon} />
                <span>abdulftahmosalm@gmail.com</span>
              </div>
              <div className={styles.contactItem}>
                <Phone size={15} className={styles.contactIcon} />
                <div className={styles.contactHighlight}>01554473748</div>
              </div>
              <div className={styles.contactItem}>
                <Phone size={15} className={styles.contactIcon} />
                <div className={styles.contactHighlight}>01070217520</div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className={styles.bottomBar}>
        <div className={`container ${styles.bottomInner}`}>
          <span>© {new Date().getFullYear()} {t("copyright")}</span>
          <span>{t("madeIn")}</span>
        </div>
      </div>
    </footer>
  );
}
