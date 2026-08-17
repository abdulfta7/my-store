"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import styles from "./ProductGallery.module.css";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  isPrimary: boolean;
}

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const sorted = [...images].sort((a) => (a.isPrimary ? -1 : 1));
  const [activeIdx, setActiveIdx] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const mainRef = useRef<HTMLDivElement>(null);

  // ── Touch / swipe state ──
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const activeImage = sorted[activeIdx];

  const goTo = useCallback(
    (idx: number) => setActiveIdx(Math.max(0, Math.min(sorted.length - 1, idx))),
    [sorted.length]
  );

  // ── Desktop zoom ──
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mainRef.current) return;
    const { left, top, width, height } = mainRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  // ── Mobile swipe ──
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 40) {
      diff > 0 ? goTo(activeIdx + 1) : goTo(activeIdx - 1);
    }
  };

  return (
    <div className={styles.galleryContainer}>
      {/* ── Desktop layout: thumbnails left, main right ── */}
      <div className={styles.inner}>

        {/* Thumbnail strip — vertical on desktop, hidden on mobile */}
        {sorted.length > 1 && (
          <div className={styles.thumbStrip}>
            {sorted.map((img, i) => (
              <button
                key={img.id}
                className={`${styles.thumb} ${i === activeIdx ? styles.thumbActive : ""}`}
                onClick={() => goTo(i)}
                aria-label={`View image ${i + 1}`}
              >
                <Image
                  src={img.url}
                  alt={img.alt || productName}
                  fill
                  sizes="80px"
                  style={{ objectFit: "contain", padding: "6px" }}
                />
              </button>
            ))}
          </div>
        )}

        {/* Main image */}
        <div
          ref={mainRef}
          className={`${styles.main} ${zoom ? styles.mainZoomed : ""}`}
          onMouseEnter={() => setZoom(true)}
          onMouseLeave={() => setZoom(false)}
          onMouseMove={handleMouseMove}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* Zoom lens overlay on desktop */}
          {zoom && activeImage && (
            <div
              className={styles.zoomLens}
              style={{
                backgroundImage: `url(${activeImage.url})`,
                backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
              }}
            />
          )}

          <Image
            src={activeImage?.url || "/placeholder-product.png"}
            alt={activeImage?.alt || productName}
            fill
            priority
            sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 45vw"
            style={{
              objectFit: "contain",
              padding: "1rem",
              opacity: zoom ? 0 : 1,
              transition: "opacity 0.15s",
            }}
          />

          {/* Zoom icon hint */}
          {!zoom && (
            <div className={styles.zoomHint} aria-hidden>
              <ZoomIn size={16} />
            </div>
          )}

          {/* Mobile prev/next arrows */}
          {sorted.length > 1 && (
            <>
              <button
                className={`${styles.mobileArrow} ${styles.mobileArrowPrev}`}
                onClick={() => goTo(activeIdx - 1)}
                disabled={activeIdx === 0}
                aria-label="Previous image"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                className={`${styles.mobileArrow} ${styles.mobileArrowNext}`}
                onClick={() => goTo(activeIdx + 1)}
                disabled={activeIdx === sorted.length - 1}
                aria-label="Next image"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          {/* Mobile image counter */}
          {sorted.length > 1 && (
            <div className={styles.mobileCounter}>
              {activeIdx + 1} / {sorted.length}
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile thumbnail strip — horizontal, below main ── */}
      {sorted.length > 1 && (
        <div className={styles.mobileThumbStrip}>
          {sorted.map((img, i) => (
            <button
              key={img.id}
              className={`${styles.mobileThumb} ${i === activeIdx ? styles.thumbActive : ""}`}
              onClick={() => goTo(i)}
              aria-label={`View image ${i + 1}`}
            >
              <Image
                src={img.url}
                alt={img.alt || productName}
                fill
                sizes="64px"
                style={{ objectFit: "contain", padding: "4px" }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
