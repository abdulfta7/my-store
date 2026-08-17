import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";



export default async function OrdersPage() {
  const session = await getServerSession(authOptions);

  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) redirect("/login");

  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { where: { isPrimary: true } }
            }
          }
        }
      }
    }
  });

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0 0 1.5rem' }}>My Orders</h2>

      {orders.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {orders.map(order => (
            <div key={order.id} style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'white' }}>
              {/* Order Header */}
              <div style={{ backgroundColor: '#f8fafc', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '2rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '0.25rem' }}>Order Placed</div>
                    <div>{new Date(order.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '0.25rem' }}>Total</div>
                    <div>{order.total.toLocaleString()} EGP</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '0.25rem' }}>Status</div>
                    <div style={{
                      color: order.status === 'DELIVERED' ? '#22c55e' :
                        order.status === 'CANCELLED' ? '#ef4444' :
                          order.status === 'SHIPPED' ? '#3b82f6' : '#eab308',
                      fontWeight: 'bold'
                    }}>
                      {order.status}
                    </div>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '0.25rem', textAlign: 'right' }}>Order Number</div>
                  <div style={{ fontWeight: 707 }}>{order.orderNumber}</div>
                </div>
                <Link href={`/account/orders/${order.id}`} style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--primary)", whiteSpace: "nowrap" }}>
                  View Details →
                </Link>
              </div>

              {/* Order Items */}
              <div style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {order.items.map(item => {
                    const primaryImg = item.product.images?.[0]?.url || "/placeholder-product.png";

                    return (
                      <div key={item.id} style={{ display: 'flex', gap: '1.5rem' }}>
                        <div style={{ width: '80px', height: '80px', position: 'relative', border: '1px solid var(--border)', borderRadius: '6px', overflow: 'hidden' }}>
                          <Image src={primaryImg} alt={item.product.name} fill style={{ objectFit: 'contain', padding: '0.25rem' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{item.product.name}</div>
                          <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
                            Qty: {item.quantity} • {item.price.toLocaleString()} EGP
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed var(--border)', color: '#64748b' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--foreground)' }}>No Orders Found</h3>
          <p>You haven&apos;t placed any orders yet. Once you do, they will appear here.</p>
        </div>
      )}
    </div>
  );
}
