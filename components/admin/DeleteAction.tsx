"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface DeleteActionProps {
  id: string;
  endpoint: string; // e.g. "/api/admin/products"
}

export function DeleteAction({ id, endpoint }: DeleteActionProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this item? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);

    try {
      const res = await fetch(`${endpoint}/${id}`, {
        method: "DELETE"
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete");
      }

      router.refresh();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "An error occurred while deleting.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      style={{ 
        color: '#ef4444', 
        fontWeight: 'bold', 
        fontSize: '0.875rem', 
        backgroundColor: 'transparent', 
        border: 'none', 
        cursor: isDeleting ? 'not-allowed' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem'
      }}
    >
      {isDeleting ? <Loader2 size={14} className="animate-spin" /> : "Delete"}
    </button>
  );
}
