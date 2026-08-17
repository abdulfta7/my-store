import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

import Link from "next/link";
import { Package, Clock, CheckCircle, Shield } from "lucide-react";



export default async function AccountDashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return null;

  const recentOrders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 3,
  });

  const orderStats = await prisma.order.groupBy({
    by: ['status'],
    where: { userId },
    _count: true,
  });

  const getStat = (status: string) => orderStats.find(s => s.status === status)?._count || 0;

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0 0 1.5rem' }}>Account Dashboard</h2>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '50%', color: '#3b82f6' }}>
            <Package size={24} />
          </div>
          <div>
            <div style={{ color: '#64748b', fontSize: '0.875rem' }}>Total Orders</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{recentOrders.length > 0 ? await prisma.order.count({ where: { userId } }) : 0}</div>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ backgroundColor: 'rgba(234, 179, 8, 0.1)', padding: '1rem', borderRadius: '50%', color: '#eab308' }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ color: '#64748b', fontSize: '0.875rem' }}>Pending</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{getStat('PENDING')}</div>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', padding: '1rem', borderRadius: '50%', color: '#22c55e' }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <div style={{ color: '#64748b', fontSize: '0.875rem' }}>Delivered</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{getStat('DELIVERED')}</div>
          </div>
        </div>
      </div>

      {/* Admin Link if applicable */}
      {((session?.user as any)?.role === 'SUPER_ADMIN' || (session?.user as any)?.role === 'ADMIN') ? (
        <div style={{ backgroundColor: 'rgba(10, 37, 64, 0.05)', border: '1px solid var(--primary)', borderRadius: '8px', padding: '1.5rem', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Shield size={32} color="var(--primary)" />
            <div>
              <h3 style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>Admin Access</h3>
              <p style={{ color: '#475569', fontSize: '0.875rem' }}>You have administrative privileges on this store.</p>
            </div>
          </div>
          <Link href="/admin" style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '6px', fontWeight: 'bold' }}>
            Go to Admin Dashboard
          </Link>
        </div>
      ) : null}

      {/* Recent Orders */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Recent Orders</h3>
          <Link href="/account/orders" style={{ color: 'var(--primary)', fontWeight: '500' }}>View All</Link>
        </div>

        {recentOrders.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recentOrders.map(order => (
              <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', border: '1px solid var(--border)', borderRadius: '8px', backgroundColor: 'white' }}>
                <div>
                  <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Order #{order.id.slice(-6).toUpperCase()}</div>
                  <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
                    {new Date(order.createdAt).toLocaleDateString()} • {order.paymentMethod}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{order.total.toLocaleString()} EGP</div>
                  <div style={{
                    display: 'inline-block',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    marginTop: '0.5rem',
                    backgroundColor: order.status === 'DELIVERED' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                    color: order.status === 'DELIVERED' ? '#22c55e' : '#eab308'
                  }}>
                    {order.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed var(--border)', color: '#64748b' }}>
            You haven&apos;t placed any orders yet.
          </div>
        )}
      </div>
    </div>
  );
}
