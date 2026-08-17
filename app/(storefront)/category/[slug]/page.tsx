import { prisma } from "@/lib/prisma";

import { notFound } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";



async function getCategoryData(slug: string) {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      products: {
        where: { isPublished: true },
        include: {
          images: { where: { isPrimary: true } },
          brand: true
        }
      }
    }
  });

  return category;
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = await getCategoryData(params.slug);

  if (!category) {
    notFound();
  }

  return (
    <div style={{ backgroundColor: 'var(--background)', minHeight: '100vh', paddingBottom: '5rem' }}>
      {/* Category Header */}
      <div style={{ backgroundColor: 'var(--card-bg)', borderBottom: '1px solid var(--border-light)', padding: '3rem 0' }}>
        <div className="container">
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '1.5rem', textDecoration: 'none', fontWeight: 500 }}>
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--foreground)', marginBottom: '1rem' }}>
            {category.name}
          </h1>
          {category.description && (
            <p style={{ fontSize: '1.125rem', color: 'var(--text-muted)', maxWidth: '800px' }}>
              {category.description}
            </p>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div className="container" style={{ marginTop: '3rem' }}>
        {category.products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', backgroundColor: 'var(--card-bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
            <h3 style={{ fontSize: '1.5rem', color: 'var(--foreground)', marginBottom: '1rem', fontWeight: 600 }}>No products found</h3>
            <p style={{ color: 'var(--text-muted)' }}>We are currently restocking our {category.name}. Check back later!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
            {category.products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
