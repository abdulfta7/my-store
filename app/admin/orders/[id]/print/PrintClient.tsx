"use client";

import { useEffect } from "react";
import { Printer } from "lucide-react";

export function PrintClient() {
  useEffect(() => {
    // Automatically trigger print dialog when page loads
    const timer = setTimeout(() => {
      window.print();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <button
      onClick={() => window.print()}
      style={{
        padding: "0.75rem 1.5rem",
        backgroundColor: "var(--primary)",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "bold",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        fontSize: "1rem"
      }}
    >
      <Printer size={20} />
      طباعة الفاتورة
    </button>
  );
}
