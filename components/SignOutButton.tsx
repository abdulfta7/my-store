"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <div 
      onClick={() => signOut({ callbackUrl: '/' })}
      style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--danger)', cursor: 'pointer', fontWeight: '500' }}
    >
      <LogOut size={20} /> Sign Out
    </div>
  );
}
