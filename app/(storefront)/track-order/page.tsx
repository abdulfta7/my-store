import type { Metadata } from "next";
import { TrackOrderClient } from "./TrackOrderClient";

export const metadata: Metadata = {
  title: "تتبع طلبك | Zoma Tech",
  description: "تتبع حالة طلبك بسهولة من زوما تك.",
};

export default function TrackOrderPage() {
  return (
    <div style={{ backgroundColor: "var(--background)", minHeight: "60vh", padding: "4rem 1rem" }}>
      <div className="container" style={{ maxWidth: "600px", margin: "0 auto" }}>
        <h1 style={{ textAlign: "center", fontSize: "2rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
          تتبع طلبك
        </h1>
        <p style={{ textAlign: "center", color: "var(--text-muted)", marginBottom: "3rem" }}>
          أدخل رقم الطلب الخاص بك لمعرفة حالته الحالية.
        </p>
        
        <TrackOrderClient />
      </div>
    </div>
  );
}
