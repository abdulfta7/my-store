"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface OrderStatusDropdownProps {
  orderId: string;
  initialStatus: string;
}

const statuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

export function OrderStatusDropdown({ orderId, initialStatus }: OrderStatusDropdownProps) {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error('Failed to update status');
      }
      
      router.refresh();
    } catch (error) {
      console.error(error);
      // Revert status on UI if error
      setStatus(initialStatus);
      alert('Failed to update order status');
    } finally {
      setLoading(false);
    }
  };

  const getColor = (s: string) => {
    switch(s) {
      case 'DELIVERED': return '#22c55e';
      case 'SHIPPED': return '#3b82f6';
      case 'CANCELLED': return '#ef4444';
      default: return '#eab308';
    }
  };

  const getBgColor = (s: string) => {
    switch(s) {
      case 'DELIVERED': return 'rgba(34, 197, 94, 0.1)';
      case 'SHIPPED': return 'rgba(59, 130, 246, 0.1)';
      case 'CANCELLED': return 'rgba(239, 68, 68, 0.1)';
      default: return 'rgba(234, 179, 8, 0.1)';
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <select 
        value={status} 
        onChange={handleStatusChange}
        disabled={loading}
        style={{
          padding: '0.25rem 0.75rem',
          borderRadius: '999px',
          fontSize: '0.75rem',
          fontWeight: 'bold',
          backgroundColor: getBgColor(status),
          color: getColor(status),
          border: `1px solid ${getColor(status)}`,
          cursor: loading ? 'not-allowed' : 'pointer',
          outline: 'none',
          appearance: 'none',
        }}
      >
        {statuses.map(s => (
          <option key={s} value={s} style={{ color: 'black', background: 'white' }}>{s}</option>
        ))}
      </select>
      {loading && <Loader2 size={14} className="animate-spin" style={{ color: 'var(--text-muted)' }} />}
    </div>
  );
}
