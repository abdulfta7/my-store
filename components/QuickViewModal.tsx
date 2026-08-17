"use client";

import { useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import styles from "./QuickViewModal.module.css";
import { AddToCartDetails } from "./AddToCartDetails";
import { WishlistButton } from "./WishlistButton";
import Link from "next/link";

interface QuickViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    oldPrice: number | null;
    discount: number | null;
    image: string;
    stock: number;
    category?: string;
  } | null;
}

export function QuickViewModal({ isOpen, onClose, product }: QuickViewModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen || !product) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={24} />
        </button>
        
        <div className={styles.content}>
          <div className={styles.imageContainer}>
            <Image 
              src={product.image} 
              alt={product.name} 
              fill 
              style={{ objectFit: 'contain' }}
            />
          </div>
          
          <div className={styles.details}>
            {product.category && <div className={styles.category}>{product.category}</div>}
            <h2 className={styles.title}>{product.name}</h2>
            
            <div className={styles.priceContainer}>
              <span className={styles.price}>{product.price.toLocaleString()} EGP</span>
              {product.oldPrice && <span className={styles.oldPrice}>{product.oldPrice.toLocaleString()} EGP</span>}
              {product.discount && <span className={styles.discount}>Save {product.discount} EGP</span>}
            </div>
            
            <div className={styles.stock}>
              <span style={{ color: product.stock ? 'var(--success)' : 'var(--danger)', fontWeight: 'bold' }}>
                {product.stock ? '✓ In Stock' : '✗ Out of Stock'}
              </span>
            </div>

            <div className={styles.actions}>
              <div style={{ flex: 1 }}>
                <AddToCartDetails product={product} />
              </div>
              <WishlistButton 
                product={product} 
                className={styles.wishlistBtn}
                style={{ height: '3.5rem', width: '3.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', borderRadius: '8px' }}
              />
            </div>
            
            <Link href={`/product/${product.slug}`} className={styles.viewFullBtn} onClick={onClose}>
              View Full Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
