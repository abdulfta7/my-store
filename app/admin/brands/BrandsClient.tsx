"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Pencil } from "lucide-react";

interface Brand { id: string; name: string; slug: string; imageUrl: string | null; _count: { products: number } }

const empty = { name: "", slug: "", imageUrl: "" };

export function BrandsClient({ initialBrands }: { initialBrands: Brand[] }) {
  const [brands, setBrands] = useState(initialBrands);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({
      ...p,
      [name]: value,
      ...(name === "name" && !editing ? { slug: value.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") } : {}),
    }));
  };

  const openCreate = () => { setEditing(null); setForm(empty); setShowForm(true); };
  const openEdit   = (b: Brand) => { setEditing(b); setForm({ name: b.name, slug: b.slug, imageUrl: b.imageUrl || "" }); setShowForm(true); };
  const cancel     = () => { setShowForm(false); setEditing(null); setForm(empty); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url    = editing ? `/api/admin/brands/${editing.id}` : "/api/admin/brands";
      const method = editing ? "PUT" : "POST";
      const res    = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data   = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      if (editing) {
        setBrands((p) => p.map((b) => b.id === editing.id ? { ...b, ...data, _count: b._count } : b));
        toast.success("Brand updated");
      } else {
        setBrands((p) => [...p, { ...data, _count: { products: 0 } }].sort((a, b) => a.name.localeCompare(b.name)));
        toast.success(`Brand "${data.name}" created`);
      }
      cancel();
    } catch (err: any) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (brand: Brand) => {
    if (brand._count.products > 0) { toast.error(`Cannot delete — ${brand._count.products} products use this brand.`); return; }
    if (!confirm(`Delete brand "${brand.name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/brands/${brand.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error);
      setBrands((p) => p.filter((b) => b.id !== brand.id));
      toast.success(`Brand "${brand.name}" deleted`);
    } catch (err: any) { toast.error(err.message); }
  };

  const inputStyle: React.CSSProperties = { padding: "0.625rem 0.875rem", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "0.9375rem", width: "100%" };

  return (
    <div>
      <button onClick={openCreate} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.5rem", backgroundColor: "var(--primary)", color: "white", borderRadius: "8px", fontWeight: "bold", marginBottom: "1.5rem" }}>
        <Plus size={18} /> New Brand
      </button>

      {showForm && (
        <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 12, padding: "2rem", marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "1.5rem" }}>{editing ? "Edit Brand" : "Create Brand"}</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
              {[
                { name: "name",     label: "Name *",      placeholder: "e.g. HP"                     },
                { name: "slug",     label: "Slug *",      placeholder: "e.g. hp"                     },
                { name: "imageUrl", label: "Image URL",   placeholder: "https://...logo.png"          },
              ].map((f) => (
                <div key={f.name} style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  <label style={{ fontSize: "0.875rem", fontWeight: 600 }}>{f.label}</label>
                  <input name={f.name} required={f.name !== "imageUrl"} value={(form as any)[f.name]} onChange={handleChange} placeholder={f.placeholder} style={inputStyle} />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button type="submit" disabled={saving} style={{ padding: "0.75rem 1.5rem", backgroundColor: "var(--primary)", color: "white", borderRadius: "8px", fontWeight: "bold" }}>
                {saving ? "Saving…" : editing ? "Save Changes" : "Create Brand"}
              </button>
              <button type="button" onClick={cancel} style={{ padding: "0.75rem 1.5rem", border: "1px solid var(--border)", borderRadius: "8px", fontWeight: 600 }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ background: "white", borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "2px solid var(--border)" }}>
              {["Name", "Slug", "Products", "Actions"].map((h) => (
                <th key={h} style={{ padding: "0.875rem 1.25rem", fontSize: "0.8125rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {brands.map((brand) => (
              <tr key={brand.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "0.875rem 1.25rem", fontWeight: 700 }}>{brand.name}</td>
                <td style={{ padding: "0.875rem 1.25rem", color: "#64748b", fontFamily: "monospace", fontSize: "0.875rem" }}>{brand.slug}</td>
                <td style={{ padding: "0.875rem 1.25rem" }}>
                  <span style={{ background: "#f1f5f9", borderRadius: 999, padding: "0.2rem 0.6rem", fontSize: "0.8125rem", fontWeight: 600 }}>{brand._count.products}</span>
                </td>
                <td style={{ padding: "0.875rem 1.25rem" }}>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button onClick={() => openEdit(brand)} title="Edit" style={{ color: "#3b82f6", padding: "0.25rem" }}><Pencil size={17} /></button>
                    <button onClick={() => handleDelete(brand)} title="Delete" style={{ color: "#ef4444", padding: "0.25rem" }}><Trash2 size={17} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {brands.length === 0 && (
              <tr><td colSpan={4} style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>No brands yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
