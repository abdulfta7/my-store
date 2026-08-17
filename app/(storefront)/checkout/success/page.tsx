"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Suspense } from "react";
import { useLang } from "@/lib/i18n/LanguageContext";

function SuccessContent() {
  const searchParams = useSearchParams();
  const { t } = useLang();
  const orderId = searchParams.get("orderId");
  const orderNumber = searchParams.get("orderNumber") || orderId;

  return (
    <div style={{
      textAlign: "center", padding: "4rem 1.5rem",
      backgroundColor: "white", borderRadius: "12px",
      border: "1px solid var(--border)", maxWidth: "600px", margin: "3rem auto"
    }}>
      <CheckCircle size={60} color="var(--success)" style={{ margin: "0 auto 1.25rem" }} />
      <h1 style={{ fontSize: "clamp(1.375rem,4vw,2rem)", fontWeight: 800, marginBottom: "0.875rem" }}>
        {t("orderSuccess")}
      </h1>
      <p style={{ color: "#475569", marginBottom: "1.75rem", fontSize: "1rem", lineHeight: 1.6 }}>
        {t("orderSuccessDesc")}
      </p>

      {orderNumber && (
        <div style={{
          backgroundColor: "#f8fafc", padding: "1.25rem", borderRadius: "8px",
          marginBottom: "1.75rem", border: "1px dashed var(--border)"
        }}>
          <span style={{ display: "block", color: "#64748b", fontSize: "0.875rem", marginBottom: "0.4rem" }}>
            {t("orderNumber")}
          </span>
          <strong style={{ fontSize: "1.25rem", letterSpacing: "0.05em" }}>{orderNumber}</strong>
        </div>
      )}

      <div style={{ display: "flex", gap: "0.875rem", justifyContent: "center", flexWrap: "wrap" }}>
        <Link href="/shop" style={{
          backgroundColor: "var(--primary)", color: "white",
          padding: "0.75rem 1.5rem", borderRadius: "8px", fontWeight: 700
        }}>
          {t("continueShopping")}
        </Link>
        <Link href="/account/orders" style={{
          backgroundColor: "white", color: "var(--primary)",
          border: "1px solid var(--primary)",
          padding: "0.75rem 1.5rem", borderRadius: "8px", fontWeight: 700
        }}>
          {t("viewMyOrders")}
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  const { t } = useLang();
  return (
    <div className="container">
      <Suspense fallback={
        <div style={{ textAlign: "center", padding: "6rem 2rem" }}>{t("loading")}</div>
      }>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
