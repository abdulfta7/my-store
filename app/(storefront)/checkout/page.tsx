"use client";

import { useCartStore } from "@/lib/store";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import styles from "./Checkout.module.css";
import Link from "next/link";
import { Tag, X, CheckCircle } from "lucide-react";
import { EGYPT_GOVERNORATES, getShippingCost } from "@/lib/governorates";
import { useLang } from "@/lib/i18n/LanguageContext";

interface AppliedCoupon {
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  discountAmount: number;
}

export default function CheckoutPage() {
  const [mounted, setMounted] = useState(false);
  const cart = useCartStore();
  const router = useRouter();
  const { data: session } = useSession();
  const { t } = useLang();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);

  const [formData, setFormData] = useState({
    name: "", email: "", phone: "",
    street: "", city: "", governorate: "Cairo",
    notes: "", paymentMethod: "COD",
  });

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (session?.user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || session.user?.name || "",
        email: prev.email || session.user?.email || "",
      }));
    }
  }, [session]);

  if (!mounted) return (
    <div className="container" style={{ padding: "3rem 0" }}>{t("loading")}</div>
  );

  const { items, getTotal, clearCart } = cart;

  if (items.length === 0) {
    return (
      <div className={`container ${styles.container}`}>
        <h1 className={styles.title}>{t("checkoutTitle")}</h1>
        <div style={{ textAlign: "center", padding: "4rem", backgroundColor: "white", borderRadius: "12px" }}>
          <h2>{t("checkoutCartEmpty")}</h2>
          <p>{t("checkoutCartEmptyDesc")}</p>
          <Link href="/shop" style={{ color: "var(--primary)", fontWeight: "bold", display: "inline-block", marginTop: "1rem" }}>
            {t("returnToShop")}
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = getTotal();
  const shippingCost = getShippingCost(formData.governorate);
  const discountAmount = appliedCoupon?.discountAmount ?? 0;
  const total = subtotal + shippingCost - discountAmount;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError(null);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput.trim(), subtotal }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) { setCouponError(data.error || t("enterCouponCode")); return; }
      setAppliedCoupon({ code: data.code, type: data.type, value: data.value, discountAmount: data.discountAmount });
      setCouponInput("");
    } catch {
      setCouponError(t("unexpectedError"));
    } finally { setCouponLoading(false); }
  };

  const handleRemoveCoupon = () => { setAppliedCoupon(null); setCouponError(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          customerInfo: { name: formData.name, email: formData.email, phone: formData.phone, notes: formData.notes },
          shippingAddress: { street: formData.street, city: formData.city, governorate: formData.governorate },
          paymentMethod: formData.paymentMethod,
          subtotal, shippingCost, discountAmount, total,
          couponCode: appliedCoupon?.code ?? null,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || t("unexpectedError"));
      clearCart();
      router.push(`/checkout/success?orderId=${data.orderId}&orderNumber=${encodeURIComponent(data.orderNumber || data.orderId)}`);
    } catch (err: any) {
      setError(err.message || t("unexpectedError"));
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`container ${styles.container}`}>
      <h1 className={styles.title}>{t("checkoutTitle")}</h1>

      <form onSubmit={handleSubmit} className={styles.checkoutLayout}>
        {/* ===== LEFT ===== */}
        <div className={styles.forms}>

          {/* Contact */}
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>{t("contactInfo")}</h2>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>{t("fullName")} *</label>
                <input type="text" name="name" required className={styles.input} value={formData.name} onChange={handleChange} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>{t("emailAddress")} *</label>
                <input type="email" name="email" required className={styles.input} value={formData.email} onChange={handleChange} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>{t("phoneNumber")} *</label>
                <input type="tel" name="phone" required className={styles.input} value={formData.phone} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* Shipping */}
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>{t("shippingAddress")}</h2>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>{t("governorate")}</label>
                <select name="governorate" className={styles.select} value={formData.governorate} onChange={handleChange}>
                  {EGYPT_GOVERNORATES.map((gov) => (
                    <option key={gov} value={gov}>{gov}</option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>{t("cityDistrict")} *</label>
                <input type="text" name="city" required className={styles.input} value={formData.city} onChange={handleChange} />
              </div>
              <div className={`${styles.formGroup} ${styles.full}`}>
                <label className={styles.label}>{t("streetAddress")} *</label>
                <input type="text" name="street" required className={styles.input} value={formData.street} onChange={handleChange} />
              </div>
              <div className={`${styles.formGroup} ${styles.full}`}>
                <label className={styles.label}>{t("orderNotes")}</label>
                <textarea name="notes" className={styles.textarea} value={formData.notes} onChange={handleChange} placeholder={t("orderNotesPlaceholder")} />
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>{t("paymentMethod")}</h2>
            <div className={styles.paymentOptions}>

              <label className={styles.paymentOption} style={{ borderColor: formData.paymentMethod === "COD" ? "var(--primary)" : undefined }}>
                <input type="radio" name="paymentMethod" value="COD" checked={formData.paymentMethod === "COD"} onChange={handleChange} />
                <div style={{ flex: 1 }}>
                  <strong>{t("codTitle")}</strong>
                  <div style={{ fontSize: "0.875rem", color: "#64748b" }}>{t("codDesc")}</div>
                </div>
              </label>

              <label className={styles.paymentOption} style={{ borderColor: formData.paymentMethod === "INSTAPAY" ? "var(--primary)" : undefined }}>
                <input type="radio" name="paymentMethod" value="INSTAPAY" checked={formData.paymentMethod === "INSTAPAY"} onChange={handleChange} />
                <div style={{ flex: 1 }}>
                  <strong>{t("instapayTitle")}</strong>
                  <div style={{ fontSize: "0.875rem", color: "#64748b" }}>{t("instapayDesc")}</div>
                </div>
              </label>
              {formData.paymentMethod === "INSTAPAY" && (
                <div className={styles.paymentDetails}>
                  {t("instapayInstruction")} <strong>01554473748</strong>
                </div>
              )}

              <label className={styles.paymentOption} style={{ borderColor: formData.paymentMethod === "VODAFONE_CASH" ? "var(--primary)" : undefined }}>
                <input type="radio" name="paymentMethod" value="VODAFONE_CASH" checked={formData.paymentMethod === "VODAFONE_CASH"} onChange={handleChange} />
                <div style={{ flex: 1 }}>
                  <strong>{t("vodafoneTitle")}</strong>
                  <div style={{ fontSize: "0.875rem", color: "#64748b" }}>{t("vodafoneDesc")}</div>
                </div>
              </label>
              {formData.paymentMethod === "VODAFONE_CASH" && (
                <div className={styles.paymentDetails}>
                  {t("vodafoneInstruction")} <strong>01070217520</strong>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* ===== RIGHT: Summary ===== */}
        <div>
          <div className={styles.summary}>
            <h2 className={styles.summaryTitle}>{t("orderSummary")}</h2>

            <div style={{ marginBottom: "1.5rem" }}>
              {items.map((item) => (
                <div key={item.id} className={styles.summaryItem}>
                  <div className={styles.summaryItemName}>{item.quantity} × {item.name}</div>
                  <div className={styles.summaryItemPrice}>{(item.price * item.quantity).toLocaleString()} EGP</div>
                </div>
              ))}
            </div>

            <div className={styles.divider} />

            {/* Coupon */}
            {!appliedCoupon ? (
              <div className={styles.couponSection}>
                <label className={styles.couponLabel}>
                  <Tag size={15} /> {t("haveCoupon")}
                </label>
                <div className={styles.couponRow}>
                  <input
                    type="text"
                    placeholder={t("enterCouponCode")}
                    className={styles.couponInput}
                    value={couponInput}
                    onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(null); }}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleApplyCoupon(); } }}
                  />
                  <button type="button" className={styles.couponBtn} onClick={handleApplyCoupon} disabled={couponLoading || !couponInput.trim()}>
                    {couponLoading ? "…" : t("apply")}
                  </button>
                </div>
                {couponError && <p className={styles.couponError}>{couponError}</p>}
              </div>
            ) : (
              <div className={styles.couponApplied}>
                <div className={styles.couponAppliedInfo}>
                  <CheckCircle size={16} color="#16a34a" />
                  <span>
                    <strong>{appliedCoupon.code}</strong>{" "}
                    {appliedCoupon.type === "PERCENTAGE"
                      ? `(${appliedCoupon.value}% off)`
                      : `(${appliedCoupon.value.toLocaleString()} EGP off)`}
                  </span>
                </div>
                <button type="button" onClick={handleRemoveCoupon} className={styles.couponRemove} aria-label="Remove coupon">
                  <X size={16} />
                </button>
              </div>
            )}

            <div className={styles.divider} />

            <div className={styles.summaryRow}>
              <span>{t("subtotal")}</span>
              <span>{subtotal.toLocaleString()} EGP</span>
            </div>
            <div className={styles.summaryRow}>
              <span>{t("shipping")}</span>
              <span>{shippingCost.toLocaleString()} EGP</span>
            </div>
            {discountAmount > 0 && (
              <div className={`${styles.summaryRow} ${styles.discountRow}`}>
                <span>{t("discount")} ({appliedCoupon?.code})</span>
                <span>- {discountAmount.toLocaleString()} EGP</span>
              </div>
            )}
            <div className={styles.summaryTotal}>
              <span>{t("total")}</span>
              <span>{total.toLocaleString()} EGP</span>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
              {isSubmitting ? t("processing") : t("placeOrder")}
            </button>
            <p style={{ fontSize: "0.75rem", color: "#64748b", textAlign: "center", marginTop: "1rem" }}>
              {t("termsNote")}
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
