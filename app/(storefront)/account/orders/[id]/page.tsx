import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Package } from "lucide-react";

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  PENDING: { bg: "rgba(234,179,8,0.1)", color: "#ca8a04" },
  PROCESSING: { bg: "rgba(59,130,246,0.1)", color: "#2563eb" },
  SHIPPED: { bg: "rgba(139,92,246,0.1)", color: "#7c3aed" },
  DELIVERED: { bg: "rgba(34,197,94,0.1)", color: "#16a34a" },
  CANCELLED: { bg: "rgba(239,68,68,0.1)", color: "#dc2626" },
};

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const userId = (session.user as any).id as string;

  const order = await prisma.order.findFirst({
    where: { id: params.id, userId },
    include: {
      items: {
        include: {
          product: { include: { images: { where: { isPrimary: true } } } },
        },
      },
    },
  });

  if (!order) notFound();

  const statusStyle = STATUS_COLORS[order.status] ?? STATUS_COLORS.PENDING;

  return (
    <div>
      {/* Back link */}
      <Link href="/account/orders" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: "var(--primary)", fontWeight: 600, fontSize: "0.9375rem", marginBottom: "1.5rem" }}>
        <ArrowLeft size={16} /> Back to Orders
      </Link>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, margin: "0 0 0.25rem" }}>
            Order {order.orderNumber}
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: 0 }}>
            Placed on {new Date(order.createdAt).toLocaleDateString("en-EG", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <span style={{ padding: "0.4rem 1rem", borderRadius: "999px", fontSize: "0.875rem", fontWeight: 700, ...statusStyle }}>
          {order.status}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem" }}>

        {/* Items */}
        <div style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Package size={18} />
            <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>Order Items</h3>
          </div>
          <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {order.items.map((item) => {
              const img = item.product.images?.[0]?.url || "/placeholder-product.png";
              return (
                <div key={item.id} style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                  <div style={{ width: 72, height: 72, flexShrink: 0, border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden", background: "white", position: "relative" }}>
                    <Image src={img} alt={item.product.name} fill style={{ objectFit: "contain", padding: "0.25rem" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <Link href={`/product/${item.product.slug}`} style={{ fontWeight: 600, color: "var(--foreground)", fontSize: "0.9375rem" }}>
                      {item.product.name}
                    </Link>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", margin: "0.25rem 0 0" }}>
                      Qty: {item.quantity} × {item.price.toLocaleString()} EGP
                    </p>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: "0.9375rem", whiteSpace: "nowrap" }}>
                    {(item.price * item.quantity).toLocaleString()} EGP
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary + Address */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          {/* Order summary */}
          <div style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 12, padding: "1.5rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>Order Summary</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              {[
                ["Subtotal", `${order.subtotal.toLocaleString()} EGP`],
                ["Shipping", `${order.shipping.toLocaleString()} EGP`],
                ...(order.discount > 0 ? [["Discount", `- ${order.discount.toLocaleString()} EGP`]] : []),
              ].map(([label, value]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", color: "var(--text-muted)" }}>
                  <span>{label}</span><span>{value}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: "1.0625rem", borderTop: "1px solid var(--border)", paddingTop: "0.75rem", marginTop: "0.25rem" }}>
                <span>Total</span><span>{order.total.toLocaleString()} EGP</span>
              </div>
            </div>
            <div style={{ marginTop: "1rem", padding: "0.75rem", background: "var(--background)", borderRadius: 8, fontSize: "0.875rem" }}>
              <span style={{ color: "var(--text-muted)" }}>Payment: </span>
              <strong>{order.paymentMethod.replace("_", " ")}</strong>
            </div>
          </div>

          {/* Shipping address */}
          <div style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 12, padding: "1.5rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>Shipping Address</h3>
            <p style={{ fontSize: "0.9375rem", color: "var(--foreground)", lineHeight: 1.7, margin: 0 }}>
              <strong>{order.customerName}</strong><br />
              {order.shippingAddress}<br />
              {order.customerPhone && <>{order.customerPhone}<br /></>}
              {order.customerEmail}
            </p>
            {order.customerNotes && (
              <div style={{ marginTop: "1rem", padding: "0.75rem", background: "var(--background)", borderRadius: 8, fontSize: "0.875rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                Note: {order.customerNotes}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
