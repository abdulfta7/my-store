import { prisma } from "@/lib/prisma";

import Link from "next/link";
import { Plus } from "lucide-react";
import Image from "next/image";
import { DeleteAction } from "@/components/admin/DeleteAction";



export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { products: true }
      }
    }
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Categories</h1>
        <Link href="/admin/categories/new" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={20} /> Add Category
        </Link>
      </div>
      
      <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', color: '#64748b', fontSize: '0.875rem' }}>
                <th style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>Image</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>Category Name</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>Slug</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>Products Count</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category, idx) => (
                <tr key={category.id} style={{ borderTop: '1px solid var(--border)', backgroundColor: idx % 2 === 0 ? 'white' : '#fcfcfc' }}>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ width: '50px', height: '50px', position: 'relative', border: '1px solid var(--border)', borderRadius: '6px', overflow: 'hidden', backgroundColor: 'var(--background)' }}>
                      {category.imageUrl ? (
                        <Image src={category.imageUrl} alt={category.name} fill style={{ objectFit: 'contain', padding: '0.25rem' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.75rem' }}>No Img</div>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 'bold' }}>{category.name}</td>
                  <td style={{ padding: '1rem 1.5rem', color: '#64748b' }}>{category.slug}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{ backgroundColor: '#f1f5f9', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                      {category._count.products}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <Link href={`/admin/categories/${category.id}/edit`} style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.875rem', textDecoration: 'none' }}>
                      Edit
                    </Link>
                    <DeleteAction id={category.id} endpoint="/api/admin/categories" />
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                    No categories found. Click "Add Category" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
