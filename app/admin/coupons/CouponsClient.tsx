"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, ToggleLeft, ToggleRight, Tag } from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  type: string;
  value: number;
  minOrder: number | null;
  usageLimit: number | null;
  usageCount: number;
  expiresAt: string | null;
  isActive: boolean;
}

const emptyForm = {
  code: "",
  type: "PERCENTAGE",
  value: "",
  minOrder: "",
  usageLimit: "",
  expiresAt: "",
};

export function CouponsClient({ initialCoupons }: { initialCoupons: Coupon[] }) {
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: formData.code.trim().toUpperCase(),
          type: formData.type,
          value: formData.value,
          minOrder: formData.minOrder || null,
          usageLimit: formData.usageLimit || null,
          expiresAt: formData.expiresAt || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create coupon");

      setCoupons((prev) => [data, ...prev]);
      setFormData(emptyForm);
      setShowForm(false);
      toast.success(`Coupon "${data.code}" created!`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (coupon: Coupon) => {
    try {
      const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !coupon.isActive }),
      });
      if (!res.ok) throw new Error("Failed to update");
      setCoupons((prev) =>
        prev.map((c) =>
          c.id === coupon.id ? { ...c, isActive: !coupon.isActive } : c
        )
      );
      toast.success(
        `Coupon ${!coupon.isActive ? "activated" : "deactivated"}`
      );
    } catch {
      toast.error("Failed to update coupon");
    }
  };

  const handleDelete = async (coupon: Coupon) => {
    if (!confirm(`Delete coupon "${coupon.code}"? This cannot be undone.`))
      return;
    try {
      const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      setCoupons((prev) => prev.filter((c) => c.id !== coupon.id));
      toast.success(`Coupon "${coupon.code}" deleted`);
    } catch {
      toast.error("Failed to delete coupon");
    }
  };

  const formatExpiry = (date: string | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-EG");
  };

  const isExpired = (date: string | null) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  return (
    <div>
      {/* Create Button */}
      <div style={{ marginBottom: "1.5rem" }}>
        <button
          onClick={() => setShowForm((v) => !v)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.75rem 1.5rem",
            backgroundColor: "var(--primary)",
            color: "white",
            borderRadius: "8px",
            fontWeight: "bold",
            fontSize: "0.9375rem",
          }}
        >
          <Plus size={18} />
          {showForm ? "Cancel" : "New Coupon"}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div
          style={{
            backgroundColor: "white",
            border: "1px solid var(--border)",
            borderRadius: "12px",
            padding: "2rem",
            marginBottom: "2rem",
          }}
        >
          <h2
            style={{
              fontSize: "1.125rem",
              fontWeight: "700",
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Tag size={18} /> Create New Coupon
          </h2>
          <form onSubmit={handleCreate}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "1rem",
                marginBottom: "1.5rem",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <label style={{ fontSize: "0.875rem", fontWeight: "600" }}>
                  Code *
                </label>
                <input
                  name="code"
                  required
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="e.g. SUMMER20"
                  style={inputStyle}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <label style={{ fontSize: "0.875rem", fontWeight: "600" }}>
                  Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount (EGP)</option>
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <label style={{ fontSize: "0.875rem", fontWeight: "600" }}>
                  Value *{" "}
                  <span style={{ fontWeight: "400", color: "#64748b" }}>
                    {formData.type === "PERCENTAGE" ? "(1–100)" : "(EGP)"}
                  </span>
                </label>
                <input
                  name="value"
                  type="number"
                  required
                  min={1}
                  max={formData.type === "PERCENTAGE" ? 100 : undefined}
                  value={formData.value}
                  onChange={handleChange}
                  placeholder={formData.type === "PERCENTAGE" ? "20" : "500"}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <label style={{ fontSize: "0.875rem", fontWeight: "600" }}>
                  Min Order (EGP)
                </label>
                <input
                  name="minOrder"
                  type="number"
                  min={0}
                  value={formData.minOrder}
                  onChange={handleChange}
                  placeholder="Optional"
                  style={inputStyle}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <label style={{ fontSize: "0.875rem", fontWeight: "600" }}>
                  Usage Limit
                </label>
                <input
                  name="usageLimit"
                  type="number"
                  min={1}
                  value={formData.usageLimit}
                  onChange={handleChange}
                  placeholder="Unlimited"
                  style={inputStyle}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <label style={{ fontSize: "0.875rem", fontWeight: "600" }}>
                  Expiry Date
                </label>
                <input
                  name="expiresAt"
                  type="date"
                  value={formData.expiresAt}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              style={{
                padding: "0.75rem 2rem",
                backgroundColor: "var(--primary)",
                color: "white",
                borderRadius: "8px",
                fontWeight: "bold",
              }}
            >
              {saving ? "Creating..." : "Create Coupon"}
            </button>
          </form>
        </div>
      )}

      {/* Coupons Table */}
      {coupons.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "4rem",
            backgroundColor: "white",
            borderRadius: "12px",
            border: "1px solid var(--border)",
            color: "#64748b",
          }}
        >
          <Tag size={48} strokeWidth={1} style={{ marginBottom: "1rem", opacity: 0.4 }} />
          <p>No coupons yet. Create your first one above.</p>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            border: "1px solid var(--border)",
            overflow: "hidden",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid var(--border)" }}>
                {["Code", "Type", "Value", "Min Order", "Usage", "Expires", "Status", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      style={{
                        padding: "0.875rem 1rem",
                        textAlign: "left",
                        fontSize: "0.8125rem",
                        fontWeight: "700",
                        color: "#64748b",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => {
                const expired = isExpired(coupon.expiresAt);
                return (
                  <tr
                    key={coupon.id}
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    <td style={cellStyle}>
                      <span
                        style={{
                          fontFamily: "monospace",
                          fontWeight: "700",
                          fontSize: "0.9375rem",
                          backgroundColor: "#f1f5f9",
                          padding: "0.25rem 0.5rem",
                          borderRadius: "4px",
                        }}
                      >
                        {coupon.code}
                      </span>
                    </td>
                    <td style={cellStyle}>
                      <span
                        style={{
                          fontSize: "0.8125rem",
                          padding: "0.2rem 0.6rem",
                          borderRadius: "999px",
                          backgroundColor:
                            coupon.type === "PERCENTAGE" ? "#eff6ff" : "#f0fdf4",
                          color:
                            coupon.type === "PERCENTAGE" ? "#1d4ed8" : "#16a34a",
                          fontWeight: "600",
                        }}
                      >
                        {coupon.type === "PERCENTAGE" ? "%" : "EGP"}
                      </span>
                    </td>
                    <td style={cellStyle}>
                      {coupon.type === "PERCENTAGE"
                        ? `${coupon.value}%`
                        : `${coupon.value.toLocaleString()} EGP`}
                    </td>
                    <td style={cellStyle}>
                      {coupon.minOrder
                        ? `${coupon.minOrder.toLocaleString()} EGP`
                        : "—"}
                    </td>
                    <td style={cellStyle}>
                      {coupon.usageCount}
                      {coupon.usageLimit ? ` / ${coupon.usageLimit}` : " / ∞"}
                    </td>
                    <td
                      style={{
                        ...cellStyle,
                        color: expired ? "#ef4444" : "inherit",
                        fontWeight: expired ? "600" : "normal",
                      }}
                    >
                      {expired ? `⚠ ${formatExpiry(coupon.expiresAt)}` : formatExpiry(coupon.expiresAt)}
                    </td>
                    <td style={cellStyle}>
                      <span
                        style={{
                          fontSize: "0.8125rem",
                          padding: "0.2rem 0.75rem",
                          borderRadius: "999px",
                          backgroundColor: coupon.isActive && !expired ? "#dcfce7" : "#fee2e2",
                          color: coupon.isActive && !expired ? "#16a34a" : "#dc2626",
                          fontWeight: "600",
                        }}
                      >
                        {coupon.isActive && !expired ? "Active" : expired ? "Expired" : "Inactive"}
                      </span>
                    </td>
                    <td style={cellStyle}>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          onClick={() => handleToggle(coupon)}
                          title={coupon.isActive ? "Deactivate" : "Activate"}
                          style={{
                            color: coupon.isActive ? "#16a34a" : "#64748b",
                            padding: "0.25rem",
                          }}
                        >
                          {coupon.isActive ? (
                            <ToggleRight size={22} />
                          ) : (
                            <ToggleLeft size={22} />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(coupon)}
                          title="Delete"
                          style={{ color: "#ef4444", padding: "0.25rem" }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "0.625rem 0.875rem",
  border: "1px solid #e2e8f0",
  borderRadius: "6px",
  fontSize: "0.9375rem",
  width: "100%",
};

const cellStyle: React.CSSProperties = {
  padding: "0.875rem 1rem",
  fontSize: "0.9375rem",
  color: "var(--foreground)",
  verticalAlign: "middle",
};
