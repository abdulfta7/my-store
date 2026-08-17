import { prisma } from "@/lib/prisma";

import { Package, DollarSign, Users, ShoppingCart, AlertTriangle } from "lucide-react";
import Link from "next/link";



export default async function AdminDashboardPage() {
  const [
    totalOrders,
    totalProducts,
    totalCustomers,
    recentOrders,
    revenueData,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.product.count(),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.order.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { user: true } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: 'DELIVERED' } }),
  ]);

  // Low stock: products where stock <= lowStockAlert threshold
  const lowStockProducts = await prisma.product.findMany({
    where: { isPublished: true, inventory: { stock: { lte: 5 } } },
    include: { inventory: true },
    orderBy: { inventory: { stock: "asc" } },
    take: 10,
  });

  const totalRevenue = revenueData._sum.total || 0;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Dashboard Overview</h1>
        <Link href="/admin/products/new" style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '6px', fontWeight: 'bold' }}>
          + Add Product
        </Link>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Total Revenue</div>
              <div style={{ fontSize: '1.875rem', fontWeight: 'bold', marginTop: '0.5rem' }}>{totalRevenue.toLocaleString()} EGP</div>
            </div>
            <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', padding: '0.75rem', borderRadius: '8px', color: '#22c55e' }}>
              <DollarSign size={24} />
            </div>
          </div>
          <div style={{ fontSize: '0.875rem', color: '#64748b' }}>From delivered orders</div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Orders</div>
              <div style={{ fontSize: '1.875rem', fontWeight: 'bold', marginTop: '0.5rem' }}>{totalOrders}</div>
            </div>
            <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '0.75rem', borderRadius: '8px', color: '#3b82f6' }}>
              <ShoppingCart size={24} />
            </div>
          </div>
          <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Total orders placed</div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Products</div>
              <div style={{ fontSize: '1.875rem', fontWeight: 'bold', marginTop: '0.5rem' }}>{totalProducts}</div>
            </div>
            <div style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)', padding: '0.75rem', borderRadius: '8px', color: '#a855f7' }}>
              <Package size={24} />
            </div>
          </div>
          <div style={{ fontSize: '0.875rem', color: '#64748b' }}>In catalog</div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Customers</div>
              <div style={{ fontSize: '1.875rem', fontWeight: 'bold', marginTop: '0.5rem' }}>{totalCustomers}</div>
            </div>
            <div style={{ backgroundColor: 'rgba(249, 115, 22, 0.1)', padding: '0.75rem', borderRadius: '8px', color: '#f97316' }}>
              <Users size={24} />
            </div>
          </div>
          <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Registered users</div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #fca5a5', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden', marginBottom: '2rem' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #fca5a5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff7f7' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={18} color="#ef4444" />
              <h2 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#dc2626' }}>Low Stock Alert — {lowStockProducts.length} product{lowStockProducts.length !== 1 ? 's' : ''}</h2>
            </div>
            <Link href="/admin/products" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#dc2626' }}>Manage Stock</Link>
          </div>
          <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {lowStockProducts.map((p) => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link href={`/admin/products/${p.id}/edit`} style={{ fontWeight: 600, color: 'var(--foreground)', fontSize: '0.9375rem' }}>{p.name}</Link>
                <span style={{
                  padding: '0.2rem 0.75rem', borderRadius: 999, fontSize: '0.8125rem', fontWeight: 700,
                  backgroundColor: (p.inventory?.stock ?? 0) === 0 ? 'rgba(239,68,68,0.1)' : 'rgba(234,179,8,0.1)',
                  color: (p.inventory?.stock ?? 0) === 0 ? '#dc2626' : '#ca8a04',
                }}>
                  {(p.inventory?.stock ?? 0) === 0 ? 'OUT OF STOCK' : `${p.inventory?.stock} left`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders Table */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Recent Orders</h2>
          <Link href="/admin/orders" style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.875rem' }}>View All</Link>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', color: '#64748b', fontSize: '0.875rem' }}>
                <th style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>Order ID</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>Customer</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>Date</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>Amount</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order, idx) => (
                <tr key={order.id} style={{ borderTop: '1px solid var(--border)', backgroundColor: idx % 2 === 0 ? 'white' : '#fcfcfc' }}>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: '500' }}>#{order.orderNumber}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div>{order.customerName}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{order.customerEmail}</div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: '#64748b' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 'bold' }}>{order.total.toLocaleString()} EGP</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      backgroundColor: order.status === 'DELIVERED' ? 'rgba(34, 197, 94, 0.1)' :
                        order.status === 'SHIPPED' ? 'rgba(59, 130, 246, 0.1)' :
                          order.status === 'CANCELLED' ? 'rgba(239, 68, 68, 0.1)' :
                            'rgba(234, 179, 8, 0.1)',
                      color: order.status === 'DELIVERED' ? '#22c55e' :
                        order.status === 'SHIPPED' ? '#3b82f6' :
                          order.status === 'CANCELLED' ? '#ef4444' :
                            '#eab308'
                    }}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
