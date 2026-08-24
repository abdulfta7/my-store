import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PrintClient } from "./PrintClient";

async function getOrderDetails(id: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: {
            select: { name: true, sku: true }
          }
        }
      }
    }
  });
  return order;
}

export default async function PrintInvoicePage({ params }: { params: { id: string } }) {
  const order = await getOrderDetails(params.id);
  if (!order) notFound();

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", padding: "2rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
      
      {/* CSS to handle printing cleanly */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-invoice, #printable-invoice * {
            visibility: visible;
          }
          #printable-invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0;
            margin: 0;
            box-shadow: none !important;
          }
          /* Hide the print button when printing */
          .no-print {
            display: none !important;
          }
        }
      `}} />

      <div style={{ width: "100%", maxWidth: "800px", marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }} className="no-print">
        <h1 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>Invoice Preview</h1>
        <PrintClient />
      </div>

      <div id="printable-invoice" dir="rtl" style={{ width: "100%", maxWidth: "800px", backgroundColor: "white", padding: "40px", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", color: "black", fontFamily: "sans-serif" }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #eee", paddingBottom: "20px", marginBottom: "30px" }}>
          <div>
            <h2 style={{ fontSize: "2rem", fontWeight: "900", margin: 0, color: "#0B1F3A" }}>Zoma Tech</h2>
            <p style={{ margin: "5px 0 0", color: "#555", fontSize: "0.9rem" }}>لجميع الأجهزة الإلكترونية وكل حاجة في مكان واحد</p>
          </div>
          <div style={{ textAlign: "left" }}>
            <h1 style={{ fontSize: "2.5rem", margin: 0, color: "#eee", fontWeight: "900", textTransform: "uppercase" }}>Invoice</h1>
            <p style={{ margin: "5px 0 0", fontWeight: "bold" }}>رقم الطلب: {order.orderNumber}</p>
            <p style={{ margin: "5px 0 0", color: "#666" }}>التاريخ: {new Date(order.createdAt).toLocaleDateString('ar-EG')}</p>
          </div>
        </div>

        {/* Info */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "40px" }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: "1.1rem", borderBottom: "1px solid #eee", paddingBottom: "5px", marginBottom: "10px", color: "#0B1F3A" }}>فاتورة إلى:</h3>
            <p style={{ margin: "3px 0", fontWeight: "bold" }}>{order.customerName}</p>
            <p style={{ margin: "3px 0" }}>{order.shippingAddress}</p>
            <p style={{ margin: "3px 0" }}>{order.customerPhone}</p>
            {order.customerEmail && <p style={{ margin: "3px 0" }}>{order.customerEmail}</p>}
          </div>
          <div style={{ flex: 1, paddingRight: "40px" }}>
            <h3 style={{ fontSize: "1.1rem", borderBottom: "1px solid #eee", paddingBottom: "5px", marginBottom: "10px", color: "#0B1F3A" }}>معلومات الدفع:</h3>
            <p style={{ margin: "3px 0" }}><strong>الطريقة:</strong> {order.paymentMethod}</p>
            <p style={{ margin: "3px 0" }}><strong>حالة الدفع:</strong> {order.paymentStatus === 'PAID' ? 'مدفوع' : 'غير مدفوع'}</p>
            <p style={{ margin: "3px 0" }}><strong>حالة الطلب:</strong> {order.status}</p>
          </div>
        </div>

        {/* Table */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "40px" }}>
          <thead>
            <tr style={{ backgroundColor: "#0B1F3A", color: "white" }}>
              <th style={{ padding: "10px", textAlign: "right" }}>المنتج</th>
              <th style={{ padding: "10px", textAlign: "center" }}>الكمية</th>
              <th style={{ padding: "10px", textAlign: "left" }}>السعر</th>
              <th style={{ padding: "10px", textAlign: "left" }}>الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, index) => (
              <tr key={item.id} style={{ borderBottom: "1px solid #eee", backgroundColor: index % 2 === 0 ? "#fafafa" : "white" }}>
                <td style={{ padding: "12px 10px" }}>
                  <div style={{ fontWeight: "bold" }}>{item.product.name}</div>
                  <div style={{ fontSize: "0.8rem", color: "#666" }}>SKU: {item.product.sku}</div>
                </td>
                <td style={{ padding: "12px 10px", textAlign: "center" }}>{item.quantity}</td>
                <td style={{ padding: "12px 10px", textAlign: "left" }}>{item.price.toLocaleString()} EGP</td>
                <td style={{ padding: "12px 10px", textAlign: "left", fontWeight: "bold" }}>{(item.price * item.quantity).toLocaleString()} EGP</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <div style={{ width: "300px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0" }}>
              <span>المجموع الفرعي:</span>
              <span>{order.subtotal.toLocaleString()} EGP</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0" }}>
              <span>تكلفة الشحن:</span>
              <span>{order.shipping.toLocaleString()} EGP</span>
            </div>
            {order.discount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", color: "#ef4444" }}>
                <span>الخصم:</span>
                <span>-{order.discount.toLocaleString()} EGP</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", marginTop: "10px", borderTop: "2px solid #0B1F3A", fontWeight: "bold", fontSize: "1.2rem" }}>
              <span>الإجمالي:</span>
              <span>{order.total.toLocaleString()} EGP</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: "50px", textAlign: "center", color: "#666", fontSize: "0.9rem", borderTop: "1px solid #eee", paddingTop: "20px" }}>
          <p style={{ margin: "5px 0" }}>شكراً لتسوقكم من Zoma Tech!</p>
          <p style={{ margin: "5px 0" }}>لأي استفسارات، يرجى التواصل معنا عبر الواتساب أو البريد الإلكتروني.</p>
        </div>

      </div>
    </div>
  );
}
