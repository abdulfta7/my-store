import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import styles from "./ProductDetails.module.css";
import type { Metadata } from "next";
import { AddToCartDetails } from "@/components/AddToCartDetails";
import { WishlistButton } from "@/components/WishlistButton";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductTabs } from "@/components/ProductTabs";
import { ProductCarousel } from "@/components/ProductCarousel";
import { ProductViewTracker } from "@/components/ProductViewTracker";
import { ProductInfoClient } from "@/components/ProductInfoClient";
import { ProductDescription } from "@/components/ProductDescription";

export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    select: {
      name: true,
      description: true,
      images: { where: { isPrimary: true }, take: 1 },
    },
  });
  if (!product) return { title: "Product Not Found | Zoma Tech" };
  const image = product.images[0]?.url;
  const desc = product.description.slice(0, 160);
  return {
    title: `${product.name} | Zoma Tech`,
    description: desc,
    openGraph: {
      title: product.name,
      description: desc,
      images: image ? [{ url: image }] : [],
      type: "website",
    },
  };
}

async function getProduct(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      images: true,
      specs: true,
      brand: true,
      category: true,
      inventory: true,
    },
  });
}

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  const primaryImage =
    product.images.find((img) => img.isPrimary) || product.images[0];

  const similarProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      isPublished: true,
    },
    take: 8,
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      brand: true,
      category: true,
      inventory: true,
    },
  });

  const whatsappMessage = encodeURIComponent(
    `Hello Zoma Tech, I am interested in ${product.name}. Is it available?`
  );
  const whatsappUrl = `https://wa.me/201554473748?text=${whatsappMessage}`;

  const stock = product.inventory?.stock ?? 0;
  const primaryImgUrl = primaryImage?.url || "/placeholder-product.png";

  const cartProduct = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    image: primaryImgUrl,
    stock,
  };

  return (
    <div className={`container ${styles.container}`}>
      <ProductViewTracker
        product={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          oldPrice: product.oldPrice,
          discount: product.discount,
          image: primaryImgUrl,
          category: { name: product.category.name },
          brand: product.brand ? { name: product.brand.name } : null,
          stock,
        }}
      />

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: product.category.name, href: `/shop?category=${product.category.slug}` },
          { label: product.name },
        ]}
      />

      {/* ── 2-column layout ── */}
      <div className={styles.productLayout}>
        {/* Left: Gallery */}
        <ProductGallery images={product.images} productName={product.name} />

        {/* Right: Info */}
        <div className={styles.info}>
          {product.brand && (
            <div className={styles.brand}>{product.brand.name}</div>
          )}
          <h1 className={styles.title}>{product.name}</h1>

          {/* Price */}
          <div className={styles.priceContainer}>
            <span className={styles.price}>{product.price.toLocaleString()} EGP</span>
            {product.oldPrice && (
              <span className={styles.oldPrice}>{product.oldPrice.toLocaleString()} EGP</span>
            )}
          </div>

          {/* Short description — switches EN/AR automatically */}
          <ProductDescription
            description={product.description}
            descriptionAr={(product as any).descriptionAr}
          />

          {/* Qty + Add to Cart + Wishlist */}
          <div style={{ display: "flex", gap: "0.75rem", marginBottom: "0.875rem", alignItems: "stretch" }}>
            <div style={{ flex: 1 }}>
              <AddToCartDetails product={cartProduct} />
            </div>
            <WishlistButton
              product={cartProduct}
              className={styles.wishlist}
              style={{ height: "48px", alignSelf: "flex-start" }}
            />
          </div>
          {/* Sentinel — sticky bar appears when this scrolls off screen */}
          <div id="product-actions-sentinel" />

          {/* Meta — stock + SKU + WhatsApp + trust badges (client, translated) */}
          <ProductInfoClient
            whatsappUrl={whatsappUrl}
            inStock={stock > 0}
            stock={stock}
            sku={product.sku}
            discount={product.discount}
          />
        </div>
      </div>

      {/* ── Tabs / Specs / Reviews ── */}
      <ProductTabs productId={product.id} specs={product.specs} />

      {/* ── Similar products ── */}
      {similarProducts.length > 0 && (
        <div style={{ marginTop: "3rem" }}>
          <ProductCarousel
            title={product.category.name}
            categorySlug={product.category.slug}
            products={similarProducts}
          />
        </div>
      )}

      {/* ── Sticky bar (mobile only) ── */}
      <StickyAddToCart product={cartProduct} />
    </div>
  );
}

/* ── Sticky bar is a separate client import ── */
import { StickyAddToCart } from "@/components/StickyAddToCart";
