"use client";

import { useState } from "react";
import { Search, Package, CheckCircle, Truck, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";

interface OrderData {
  orderNumber: string;
  status: string;
  createdAt: string;
  total: number;
  shippingAddress: string;
  items: { quantity: number; product: { name: string } }[];
}

export function TrackOrderClient() {
  const [orderNumber, setOrderNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [orderData, setOrderData] = useState<OrderData | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) {
      toast.error("يرجى إدخال رقم الطلب");
      return;
    }

    setIsLoading(true);
    setOrderData(null);

    try {
      const res = await fetch(`/api/orders/track?orderNumber=${encodeURIComponent(orderNumber)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "حدث خطأ");
      }

      setOrderData(data.order);
    } catch (err: any) {
      toast.error(err.message === "Order not found" ? "لم يتم العثور على طلب بهذا الرقم" : "حدث خطأ أثناء البحث");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "PENDING": return { label: "قيد المراجعة", icon: <Clock size={24} />, color: "#eab308" };
      case "PROCESSING": return { label: "جاري التجهيز", icon: <Package size={24} />, color: "#3b82f6" };
      case "SHIPPED": return { label: "تم الشحن", icon: <Truck size={24} />, color: "#8b5cf6" };
      case "DELIVERED": return { label: "تم التوصيل", icon: <CheckCircle size={24} />, color: "#22c55e" };
      case "CANCELLED": return { label: "ملغي", icon: <XCircle size={24} />, color: "#ef4444" };
      default: return { label: status, icon: <Clock size={24} />, color: "#64748b" };
    }
  };

  return (
    <div>
      <form onSubmit={handleTrack} style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem" }}>
        <input
          type="text"
          placeholder="رقم الطلب (مثال: ORD-12345678-1234)"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          style={{ flex: 1, padding: "1rem", borderRadius: "8px", border: "1px solid var(--border)", outline: "none", fontSize: "1rem" }}
          required
        />
        <button
          type="submit"
          disabled={isLoading}
          style={{ padding: "0 1.5rem", backgroundColor: "var(--primary)", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", display: "flex", alignItems: "center", gap: "0.5rem" }}
        >
          {isLoading ? "جاري البحث..." : <><Search size={20} /> تتبع</>}
        </button>
      </form>

      {orderData && (
        <div style={{ backgroundColor: "white", padding: "2rem", borderRadius: "12px", border: "1px solid var(--border)", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", borderBottom: "1px solid var(--border)", paddingBottom: "1rem" }}>
            <div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", margin: 0 }}>طلب #{orderData.orderNumber}</h2>
              <p style={{ color: "var(--text-muted)", margin: "0.5rem 0 0" }}>
                التاريخ: {new Date(orderData.createdAt).toLocaleDateString("ar-EG")}
              </p>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", color: getStatusDisplay(orderData.status).color }}>
                {getStatusDisplay(orderData.status).icon}
                <span style={{ fontWeight: "bold" }}>{getStatusDisplay(orderData.status).label}</span>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "bold", marginBottom: "0.75rem" }}>المنتجات:</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {orderData.items.map((item, idx) => (
                <li key={idx} style={{ display: "flex", gap: "0.5rem", padding: "0.5rem", backgroundColor: "#f8fafc", borderRadius: "6px" }}>
                  <span style={{ fontWeight: "bold", color: "var(--primary)" }}>{item.quantity}x</span>
                  <span>{item.product.name}</span>
                </li>
              ))}
            </ul>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: "1.5rem" }}>
            <div>
              <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.9rem" }}>العنوان: {orderData.shippingAddress}</p>
            </div>
            <div style={{ fontSize: "1.25rem", fontWeight: "bold", color: "var(--primary)" }}>
              {orderData.total.toLocaleString()} EGP
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
