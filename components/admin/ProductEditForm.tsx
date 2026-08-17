"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, UploadCloud, Loader2 } from "lucide-react";

interface ProductEditFormProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    oldPrice: number | null;
    discount: number | null;
    sku: string;
    categoryId: string;
    inventory: { stock: number } | null;
    images: { url: string }[];
    specs: { id: string; name: string; value: string }[];
  };
}

export function ProductEditForm({ product }: ProductEditFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);

  const initialPreviews = [null, null, null, null].map((_, i) => product.images[i]?.url || null);

  const [imageFiles, setImageFiles] = useState<(File | null)[]>([null, null, null, null]);
  const [imagePreviews, setImagePreviews] = useState<(string | null)[]>(initialPreviews);

  const [formData, setFormData] = useState({
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price.toString(),
    oldPrice: product.oldPrice ? product.oldPrice.toString() : "",
    discount: product.discount ? product.discount.toString() : "",
    sku: product.sku,
    stock: product.inventory?.stock.toString() || "0",
    isPublished: product.isPublished
  });

  const [specs, setSpecs] = useState<{ id?: string, name: string, value: string }[]>(
    product.specs || []
  );

  const handleAddSpec = () => {
    setSpecs([...specs, { name: "", value: "" }]);
  };

  const handleRemoveSpec = (index: number) => {
    setSpecs(specs.filter((_, i) => i !== index));
  };

  const handleSpecChange = (index: number, field: 'name' | 'value', value: string) => {
    const newSpecs = [...specs];
    newSpecs[index][field] = value;
    setSpecs(newSpecs);
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (err) {
        console.error("Failed to fetch categories");
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newFiles = [...imageFiles];
      newFiles[index] = file;
      setImageFiles(newFiles);

      const reader = new FileReader();
      reader.onloadend = () => {
        const newPreviews = [...imagePreviews];
        newPreviews[index] = reader.result as string;
        setImagePreviews(newPreviews);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number) => {
    const newFiles = [...imageFiles];
    newFiles[index] = null;
    setImageFiles(newFiles);

    const newPreviews = [...imagePreviews];
    newPreviews[index] = null;
    setImagePreviews(newPreviews);
  };

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Failed to upload image");
    const data = await res.json();
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let imageUrls = undefined; // Don't send if no new images

      const hasNewImages = imageFiles.some(file => file !== null);

      if (hasNewImages) {
        const validImageFiles = imageFiles.filter(file => file !== null) as File[];
        if (validImageFiles.length !== 4) {
          throw new Error("If you are replacing images, exactly 4 images are required.");
        }
        imageUrls = await Promise.all(validImageFiles.map(file => uploadImage(file)));
      }

      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          imageUrls,
          specs: specs.filter(s => s.name.trim() !== "" && s.value.trim() !== ""),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update product");
      }

      router.push("/admin/products");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/admin/products" style={{ padding: '0.5rem', backgroundColor: 'var(--card-bg)', borderRadius: '8px', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
            <ArrowLeft size={20} />
          </Link>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Edit Product: {product.name}</h1>
        </div>
      </div>

      {error && (
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: '500' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

        {/* Basic Info */}
        <div style={{ backgroundColor: 'var(--card-bg)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem' }}>Basic Information</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Product Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className="form-input" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Category *</label>
              <select name="categoryId" value={formData.categoryId} onChange={handleChange} required className="form-input">
                <option value="">Select a Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Slug *</label>
              <input type="text" name="slug" value={formData.slug} onChange={handleChange} required className="form-input" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>SKU *</label>
              <input type="text" name="sku" value={formData.sku} onChange={handleChange} required className="form-input" />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Description (English) *</label>
            <textarea name="description" value={formData.description} onChange={handleChange} required className="form-input" rows={4} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>الوصف بالعربية <span style={{ fontWeight: 400, color: '#64748b' }}>(اختياري — يظهر لو اللغة عربية)</span></label>
            <textarea name="descriptionAr" value={(formData as any).descriptionAr || ''} onChange={handleChange} className="form-input" rows={4} dir="rtl" placeholder="أدخل الوصف بالعربية هنا..." />
          </div>
        </div>

        {/* Pricing and Inventory */}
        <div style={{ backgroundColor: 'var(--card-bg)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem' }}>Pricing & Inventory</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Price (EGP) *</label>
              <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} required className="form-input" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Old Price</label>
              <input type="number" step="0.01" name="oldPrice" value={formData.oldPrice} onChange={handleChange} className="form-input" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Discount</label>
              <input type="number" step="0.01" name="discount" value={formData.discount} onChange={handleChange} className="form-input" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Stock Quantity *</label>
              <input type="number" name="stock" value={formData.stock} onChange={handleChange} required className="form-input" />
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input type="checkbox" id="isPublished" name="isPublished" checked={formData.isPublished} onChange={handleChange} style={{ width: '1.25rem', height: '1.25rem' }} />
            <label htmlFor="isPublished" style={{ fontWeight: '600' }}>Publish Product (Visible on Storefront)</label>
          </div>
        </div>

        {/* Product Images */}
        <div style={{ backgroundColor: 'var(--card-bg)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Product Images</h2>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>To change images, replace all 4 slots. Otherwise, leave as is.</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            {[0, 1, 2, 3].map((index) => (
              <div key={index} style={{
                border: '2px dashed var(--border)',
                borderRadius: '8px',
                height: '150px',
                textAlign: 'center',
                backgroundColor: 'var(--background)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {imagePreviews[index] ? (
                  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <img src={imagePreviews[index] as string} alt={`Preview ${index}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    <button type="button" onClick={() => removeImage(index)} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.5)', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>X</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '0.5rem' }}>
                    <UploadCloud size={24} style={{ color: 'var(--text-muted)' }} />
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Image {index + 1}</div>
                    <input type="file" accept="image/*" onChange={(e) => handleImageChange(index, e)} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Specifications */}
        <div style={{ backgroundColor: 'var(--card-bg)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Specifications</h2>
            <button type="button" onClick={handleAddSpec} className="btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
              + Add Specification
            </button>
          </div>

          {specs.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontStyle: 'italic' }}>No specifications added.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {specs.map((spec, index) => (
                <div key={index} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <input
                      type="text"
                      value={spec.name}
                      onChange={(e) => handleSpecChange(index, 'name', e.target.value)}
                      placeholder="Name"
                      className="form-input"
                      required
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <input
                      type="text"
                      value={spec.value}
                      onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                      placeholder="Value"
                      className="form-input"
                      required
                    />
                  </div>
                  <button type="button" onClick={() => handleRemoveSpec(index)} style={{ padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>
                    X
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <Link href="/admin/products" className="btn-outline">Cancel</Link>
          <button type="submit" disabled={loading} className="btn-primary" style={{ minWidth: '150px' }}>
            {loading ? <Loader2 size={20} className="animate-spin" /> : <><Save size={20} /> Update Product</>}
          </button>
        </div>
      </form>
    </div>
  );
}
