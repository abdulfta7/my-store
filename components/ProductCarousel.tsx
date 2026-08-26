"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { ProductCard } from "./ProductCard";
import styles from "./ProductCarousel.module.css";
import Link from "next/link";

interface ProductCarouselProps {
  title: string;
  categorySlug: string;
  products: any[];
}

export function ProductCarousel({ title, categorySlug, products }: ProductCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeDot, setActiveDot] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const dotCount = Math.min(products.length, 8);

  const onScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const isRTL = document.documentElement.dir === "rtl";
    const absScroll = Math.abs(scrollLeft);
    
    if (isRTL) {
      setCanNext(absScroll > 4);
      setCanPrev(absScroll + clientWidth < scrollWidth - 4);
    } else {
      setCanPrev(scrollLeft > 4);
      setCanNext(scrollLeft + clientWidth < scrollWidth - 4);
    }
    
    const cardW = el.firstElementChild
      ? (el.firstElementChild as HTMLElement).offsetWidth + 14
      : clientWidth;
    setActiveDot(Math.round(absScroll / cardW));
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", onScroll, { passive: true });
    // setTimeout to ensure layout is done
    setTimeout(onScroll, 100);
    return () => el.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  const scrollBy = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const cardW = (el.firstElementChild as HTMLElement | null)?.offsetWidth ?? 280;
    el.scrollBy({ left: dir * (cardW + 14), behavior: "smooth" });
  };

  const scrollToDot = (idx: number) => {
    const el = trackRef.current;
    if (!el) return;
    const isRTL = document.documentElement.dir === "rtl";
    const multiplier = isRTL ? -1 : 1;
    const cardW = (el.firstElementChild as HTMLElement | null)?.offsetWidth ?? 280;
    el.scrollTo({ left: idx * multiplier * (cardW + 14), behavior: "smooth" });
  };

  if (products.length === 0) return null;

  return (
    <section className={styles.carouselSection}>
      <div className={`container ${styles.container}`}>
        {title && (
          <div className={styles.header}>
            <h2 className={styles.title}>{title}</h2>
            {categorySlug && categorySlug !== "shop" && (
              <Link href={`/shop?category=${categorySlug}`} className={styles.seeAll}>
                See All <ArrowRight size={14} />
              </Link>
            )}
          </div>
        )}

        <div className={styles.carouselWrapper}>
          <button className={`${styles.navBtn} ${styles.prevBtn}`} onClick={() => scrollBy(-1)} disabled={!canPrev} aria-label="Scroll left">
            <ChevronLeft size={20} />
          </button>

          <div className={styles.productsContainer} ref={trackRef}>
            {products.map((product) => (
              <div key={product.id} className={styles.productSlide}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          <button className={`${styles.navBtn} ${styles.nextBtn}`} onClick={() => scrollBy(1)} disabled={!canNext} aria-label="Scroll right">
            <ChevronRight size={20} />
          </button>
        </div>

        {products.length > 1 && (
          <div className={styles.dots} role="tablist" aria-label="Carousel position">
            {Array.from({ length: dotCount }).map((_, i) => (
              <button
                key={i}
                className={`${styles.dot} ${i === activeDot ? styles.dotActive : ""}`}
                onClick={() => scrollToDot(i)}
                aria-label={`Go to slide ${i + 1}`}
                role="tab"
                aria-selected={i === activeDot}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
