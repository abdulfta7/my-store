"use client";

import { useState } from "react";
import { Star, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  isApproved: boolean;
  createdAt: Date;
  user: { name: string | null; email: string | null };
  product: { id: string; name: string; slug: string };
}

export function ReviewsClient({ initialReviews }: { initialReviews: Review[] }) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const toggleApproval = async (id: string, currentStatus: boolean) => {
    setIsLoading(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: !currentStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      
      setReviews(reviews.map(r => r.id === id ? { ...r, isApproved: !currentStatus } : r));
      toast.success(currentStatus ? "تم إخفاء التقييم" : "تمت الموافقة على التقييم");
    } catch (err) {
      toast.error("حدث خطأ أثناء التحديث");
    } finally {
      setIsLoading(null);
    }
  };

  const deleteReview = async (id: string) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا التقييم نهائياً؟")) return;
    setIsLoading(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      
      setReviews(reviews.filter(r => r.id !== id));
      toast.success("تم الحذف بنجاح");
    } catch (err) {
      toast.error("حدث خطأ أثناء الحذف");
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div style={{ backgroundColor: "white", borderRadius: "8px", border: "1px solid var(--border)", overflow: "hidden" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right" }}>
          <thead>
            <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid var(--border)" }}>
              <th style={{ padding: "1rem", fontWeight: "600", color: "#64748b" }}>المنتج</th>
              <th style={{ padding: "1rem", fontWeight: "600", color: "#64748b" }}>العميل</th>
              <th style={{ padding: "1rem", fontWeight: "600", color: "#64748b" }}>التقييم</th>
              <th style={{ padding: "1rem", fontWeight: "600", color: "#64748b" }}>التعليق</th>
              <th style={{ padding: "1rem", fontWeight: "600", color: "#64748b" }}>التاريخ</th>
              <th style={{ padding: "1rem", fontWeight: "600", color: "#64748b" }}>الحالة</th>
              <th style={{ padding: "1rem", fontWeight: "600", color: "#64748b" }}>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map(review => (
              <tr key={review.id} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.2s" }}>
                <td style={{ padding: "1rem" }}>
                  <Link href={`/product/${review.product.slug}`} target="_blank" style={{ color: "var(--primary)", fontWeight: "600", textDecoration: "underline" }}>
                    {review.product.name}
                  </Link>
                </td>
                <td style={{ padding: "1rem" }}>
                  <div>{review.user.name || "مستخدم مجهول"}</div>
                  <div style={{ fontSize: "0.875rem", color: "#64748b" }}>{review.user.email}</div>
                </td>
                <td style={{ padding: "1rem" }}>
                  <div style={{ display: "flex", gap: "2px" }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} size={16} fill={star <= review.rating ? "var(--warning)" : "none"} color={star <= review.rating ? "var(--warning)" : "#cbd5e1"} />
                    ))}
                  </div>
                </td>
                <td style={{ padding: "1rem", maxWidth: "250px" }}>
                  <div style={{ fontSize: "0.9375rem" }}>{review.comment || "-"}</div>
                </td>
                <td style={{ padding: "1rem", fontSize: "0.9375rem", color: "#64748b" }}>
                  {new Date(review.createdAt).toLocaleDateString("ar-EG")}
                </td>
                <td style={{ padding: "1rem" }}>
                  {review.isApproved ? (
                    <span style={{ backgroundColor: "#dcfce7", color: "#166534", padding: "4px 8px", borderRadius: "999px", fontSize: "0.75rem", fontWeight: "bold" }}>منشور</span>
                  ) : (
                    <span style={{ backgroundColor: "#fef08a", color: "#854d0e", padding: "4px 8px", borderRadius: "999px", fontSize: "0.75rem", fontWeight: "bold" }}>مخفي</span>
                  )}
                </td>
                <td style={{ padding: "1rem" }}>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      onClick={() => toggleApproval(review.id, review.isApproved)}
                      disabled={isLoading === review.id}
                      style={{ padding: "0.4rem", backgroundColor: "#f1f5f9", border: "none", borderRadius: "4px", cursor: "pointer", color: "var(--foreground)" }}
                      title={review.isApproved ? "إخفاء" : "نشر"}
                    >
                      {review.isApproved ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    <button
                      onClick={() => deleteReview(review.id)}
                      disabled={isLoading === review.id}
                      style={{ padding: "0.4rem", backgroundColor: "#fee2e2", border: "none", borderRadius: "4px", cursor: "pointer", color: "#ef4444" }}
                      title="حذف"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {reviews.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
                  لا توجد تقييمات حتى الآن.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
