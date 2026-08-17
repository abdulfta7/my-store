import { prisma } from "@/lib/prisma";

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { OrderStatusDropdown } from "@/components/admin/OrderStatusDropdown";



async function getOrderDetails(id: string) {
  const order = await prisma.order.findUnique({
    where: { id },
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
  return order;
}

export default async function AdminOrderDetailsPage({ params }: { params: { id: string } }) {
  const order = await getOrderDetails(params.id);

  if (!order) {
    notFound();
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/admin/orders" style={{ padding: '0.5rem', backgroundColor: 'white', borderRadius: '8px', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
            <ArrowLeft size={20} />
          </Link>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Order Details #{order.id.slice(-6).toUpperCase()}</h1>
        </div>
        <div>
          <OrderStatusDropdown orderId={order.id} initialStatus={order.status} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        
        {/* Left Column - Order Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border)', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Items Ordered</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {order.items.map(item => {
                const primaryImg = item.product.images?.[0]?.url || "/placeholder-product.png";
                
                return (
                  <div key={item.id} style={{ display: 'flex', gap: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ width: '80px', height: '80px', position: 'relative', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                      <Image src={primaryImg} alt={item.product.name} fill style={{ objectFit: 'contain', padding: '0.25rem' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{item.product.name}</div>
                      <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
                        Qty: {item.quantity} • {item.price.toLocaleString()} EGP
                      </div>
                    </div>
                    <div style={{ fontWeight: 'bold' }}>
                      {(item.price * item.quantity).toLocaleString()} EGP
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '250px' }}>
                <span style={{ color: '#64748b' }}>Subtotal</span>
                <span>{order.subtotal.toLocaleString()} EGP</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '250px' }}>
                <span style={{ color: '#64748b' }}>Shipping</span>
                <span>{order.shipping.toLocaleString()} EGP</span>
              </div>
              {order.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '250px', color: '#ef4444' }}>
                  <span>Discount</span>
                  <span>-{order.discount.toLocaleString()} EGP</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '250px', fontWeight: 'bold', fontSize: '1.125rem', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
                <span>Total</span>
                <span style={{ color: 'var(--primary)' }}>{order.total.toLocaleString()} EGP</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Customer Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border)', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>Customer Information</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9375rem' }}>
              <div><strong>Name:</strong> {order.customerName}</div>
              <div><strong>Phone:</strong> {order.customerPhone}</div>
              {order.customerEmail && <div><strong>Email:</strong> {order.customerEmail}</div>}
            </div>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border)', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>Shipping Details</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9375rem' }}>
              <div><strong>Address:</strong><br/>{order.shippingAddress}</div>
              {order.customerNotes && (
                <div>
                  <strong>Order Notes:</strong>
                  <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '6px', marginTop: '0.25rem', border: '1px dashed var(--border)' }}>
                    {order.customerNotes}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border)', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>Payment Information</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9375rem' }}>
              <div>
                <strong>Method: </strong> 
                <span style={{ backgroundColor: '#f1f5f9', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.875rem', fontWeight: 'bold' }}>
                  {order.paymentMethod}
                </span>
              </div>
              <div><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
