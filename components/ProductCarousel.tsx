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

export function ProductCarousel({
  title,
  categorySlug,
  products,
}: ProductCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeDot, setActiveDot] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  if (products.length === 0) return null;

  // How many dots to show on mobile (one per card)
  const dotCount = Math.min(products.length, 8);

  // ── Update dot + arrow state on scroll ──
  const onScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanPrev(scrollLeft > 4);
    setCanNext(scrollLeft + clientWidth < scrollWidth - 4);
    // approximate active slide
    const cardW = el.firstElementChild
      ? (el.firstElementChild as HTMLElement).offsetWidth + 14
      : clientWidth;
    setActiveDot(Math.round(scrollLeft / cardW));
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  const scrollBy = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const cardW =
      (el.firstElementChild as HTMLElement | null)?.offsetWidth ?? 280;
    el.scrollBy({ left: dir * (cardW + 14), behavior: "smooth" });
  };

  const scrollToDot = (idx: number) => {
    const el = trackRef.current;
    if (!el) return;
    const cardW =
      (el.firstElementChild as HTMLElement | null)?.offsetWidth ?? 280;
    el.scrollTo({ left: idx * (cardW + 14), behavior: "smooth" });
  };

  return (
    <section className={styles.carouselSection}>
      <div className={`container ${styles.container}`}>
        {/* Header — only shown if title provided */}
        {title && (
          <div className={styles.header}>
            <h2 className={styles.title}>{title}</h2>
            {categorySlug && categorySlug !== "shop" && (
              <Link
                href={`/shop?category=${categorySlug}`}
                className={styles.seeAll}
              >
                See All <ArrowRight size={14} />
              </Link>
            )}
          </div>
        )}

        <div className={styles.carouselWrapper}>
          {/* Prev arrow */}
          <button
            className={`${styles.navBtn} ${styles.prevBtn}`}
            onClick={() => scrollBy(-1)}
            disabled={!canPrev}
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Track */}
          <div className={styles.productsContainer} ref={trackRef}>
            {products.map((product) => (
              <div key={product.id} className={styles.productSlide}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          {/* Next arrow */}
          <button
            className={`${styles.navBtn} ${styles.nextBtn}`}
            onClick={() => scrollBy(1)}
            disabled={!canNext}
            aria-label="Scroll right"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Dots — mobile only */}
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
