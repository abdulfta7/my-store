"use client";

import { useWishlistStore } from "@/lib/store";
import { Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface WishlistButtonProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    image: string;
    stock: number;
  };
  className?: string;
  style?: React.CSSProperties;
}

export function WishlistButton({ product, className, style }: WishlistButtonProps) {
  const { addItem, removeItem, hasItem } = useWishlistStore();
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    setIsWishlisted(hasItem(product.id));
  }, [hasItem, product.id]);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isWishlisted) {
      removeItem(product.id);
      setIsWishlisted(false);
      toast.info(`${product.name} removed from wishlist`);
    } else {
      addItem(product);
      setIsWishlisted(true);
      toast.success(`${product.name} added to wishlist`);
    }
  };

  return (
    <button 
      className={className} 
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"} 
      style={{ ...style, color: isWishlisted ? 'var(--primary)' : '' }}
      onClick={handleToggle}
    >
      <Heart size={24} fill={isWishlisted ? "currentColor" : "none"} />
    </button>
  );
}
