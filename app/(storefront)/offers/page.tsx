import { prisma } from "@/lib/prisma";

import { ProductCard } from "@/components/ProductCard";
import styles from "./Offers.module.css";
import { Tag } from "lucide-react";



async function getOffers() {
  const products = await prisma.product.findMany({
    where: {
      isPublished: true,
      oldPrice: { not: null },
    },
    include: {
      images: { where: { isPrimary: true } },
      brand: true,
      category: true,
      inventory: true,
    },
    orderBy: { discount: "desc" },
  });
  return products;
}

export const metadata = {
  title: "Special Offers | Zoma Tech",
  description: "Best deals and discounts on laptops, monitors, PCs, and more.",
};

export default async function OffersPage() {
  const products = await getOffers();

  return (
    <div>
      {/* Hero Banner */}
      <div className={styles.hero}>
        <div className={`container ${styles.heroContent}`}>
          <div className={styles.heroHeader}>
            <div className={styles.heroIcon}>
              <Tag size={24} />
            </div>
            <h1 className={styles.heroTitle}>Special Offers</h1>
          </div>
          <p className={styles.heroSubtitle}>
            Unbeatable prices on top tech — limited stock available.
          </p>
        </div>
      </div>

      {/* Products */}
      <div className="container" style={{ padding: "3rem 0" }}>
        {products.length > 0 ? (
          <>
            <p style={{ marginBottom: "2rem", color: "var(--text-muted)" }}>
              {products.length} deal{products.length !== 1 ? "s" : ""} available
            </p>
            <div className="product-grid">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        ) : (
          <div className={styles.empty}>
            <Tag size={64} strokeWidth={1} color="var(--text-muted)" />
            <h2>No offers right now</h2>
            <p>Check back soon — new deals drop regularly.</p>
          </div>
        )}
      </div>
    </div>
  );
}
