"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import styles from "./HeroSlider.module.css";
import { useLang } from "@/lib/i18n/LanguageContext";

export function HeroSlider() {
  const { t, isRTL } = useLang();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  // Touch swipe
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const slides = [
    {
      tag: t("slide1Tag"),
      titleLine1: t("slide1Title").split("\n")[0],
      titleLine2: t("slide1Title").split("\n")[1] ?? "",
      subtitle: t("slide1Sub"),
      cta: { label: t("slide1Cta"), href: "/shop?category=laptops" },
      secondary: { label: t("viewAll"), href: "/shop" },
      gradient: "linear-gradient(135deg, #0B1F3A 0%, #1a3a6b 60%, #0d2d52 100%)",
      accent: "#F59E0B",
      emoji: "💻",
    },
    {
      tag: t("slide2Tag"),
      titleLine1: t("slide2Title").split("\n")[0],
      titleLine2: t("slide2Title").split("\n")[1] ?? "",
      subtitle: t("slide2Sub"),
      cta: { label: t("slide2Cta"), href: "/shop?category=monitors" },
      secondary: { label: t("specialOffers"), href: "/offers" },
      gradient: "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f2744 100%)",
      accent: "#38bdf8",
      emoji: "🖥️",
    },
    {
      tag: t("slide3Tag"),
      titleLine1: t("slide3Title").split("\n")[0],
      titleLine2: t("slide3Title").split("\n")[1] ?? "",
      subtitle: t("slide3Sub"),
      cta: { label: t("slide3Cta"), href: "/shop?category=pos-systems" },
      secondary: { label: t("specialOffers"), href: "/offers" },
      gradient: "linear-gradient(135deg, #1a0533 0%, #2d1058 60%, #1a0c3f 100%)",
      accent: "#a78bfa",
      emoji: "🏪",
    },
  ];

  const goTo = useCallback((index: number) => {
    setCurrentIndex(index);
    setAnimKey((k) => k + 1);
  }, []);

  const next = useCallback(() => goTo(currentIndex === slides.length - 1 ? 0 : currentIndex + 1), [currentIndex, goTo, slides.length]);
  const prev = useCallback(() => goTo(currentIndex === 0 ? slides.length - 1 : currentIndex - 1), [currentIndex, goTo, slides.length]);

  useEffect(() => {
    if (isHovered) return;
    const t_ = setInterval(next, 5500);
    return () => clearInterval(t_);
  }, [isHovered, next]);

  const slide = slides[currentIndex];

  return (
    <section
      className={styles.hero}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        touchEndX.current = e.changedTouches[0].clientX;
        const diff = touchStartX.current - touchEndX.current;
        if (Math.abs(diff) > 40) { diff > 0 ? next() : prev(); }
      }}
      aria-label="Featured products"
    >
      {slides.map((s, i) => (
        <div key={i} className={`${styles.bg} ${i === currentIndex ? styles.bgActive : ""}`}
          style={{ background: s.gradient }} />
      ))}
      <div className={styles.gridOverlay} />
      {/* Extra dark overlay on mobile for text readability */}
      <div className={styles.mobileOverlay} />

      <div className={`container ${styles.content}`}>
        {/* Text */}
        <div className={styles.textBlock} key={animKey}>
          <span className={styles.tag} style={{ borderColor: slide.accent, color: slide.accent }}>
            {slide.tag}
          </span>
          <h1 className={styles.title}>
            {slide.titleLine1}
            {slide.titleLine2 && (
              <><br /><em style={{ color: slide.accent, fontStyle: "normal" }}>{slide.titleLine2}</em></>
            )}
          </h1>
          <p className={styles.subtitle}>{slide.subtitle}</p>
          <div className={styles.actions}>
            <Link href={slide.cta.href} className={styles.primaryBtn}
              style={{ backgroundColor: slide.accent }}>
              {slide.cta.label} <ArrowRight size={16} />
            </Link>
            <Link href={slide.secondary.href} className={styles.secondaryBtn}>
              {slide.secondary.label}
            </Link>
          </div>
          <div className={styles.badges}>
            <span className={styles.badge}>{t("genuine")}</span>
            <span className={styles.badge}>{t("fastDelivery")}</span>
            <span className={styles.badge}>{t("support")}</span>
          </div>
        </div>

        {/* Visual */}
        <div className={styles.visual}>
          <div className={styles.emojiRing} style={{ borderColor: `${slide.accent}35` }}>
            <div className={styles.emojiInner} style={{ background: `${slide.accent}18` }}>
              <span className={styles.emoji}>{slide.emoji}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Arrows */}
      <button
        className={`${styles.navBtn} ${isRTL ? styles.nextBtn : styles.prevBtn}`}
        onClick={isRTL ? next : prev}
        aria-label="Previous"
      ><ChevronLeft size={22} /></button>
      <button
        className={`${styles.navBtn} ${isRTL ? styles.prevBtn : styles.nextBtn}`}
        onClick={isRTL ? prev : next}
        aria-label="Next"
      ><ChevronRight size={22} /></button>

      {/* Dots */}
      <div className={styles.dotsRow}>
        {slides.map((s, i) => (
          <button key={i} className={`${styles.dot} ${i === currentIndex ? styles.dotActive : ""}`}
            style={i === currentIndex ? { backgroundColor: slide.accent } : {}}
            onClick={() => goTo(i)} aria-label={`Slide ${i + 1}`} />
        ))}
      </div>

      {/* Counter */}
      <div className={styles.counter}>
        <span className={styles.counterCurrent}>{String(currentIndex + 1).padStart(2, "0")}</span>
        <span className={styles.counterSep}>/</span>
        <span className={styles.counterTotal}>{String(slides.length).padStart(2, "0")}</span>
      </div>
    </section>
  );
}
