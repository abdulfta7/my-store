import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { User, Package } from "lucide-react";
import { SignOutButton } from "@/components/SignOutButton";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="container" style={{ padding: '3rem 0' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>My Account</h1>
      
      <div style={{ display: 'flex', gap: '2rem', flexDirection: 'column' }}>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <aside style={{ width: '250px', flexShrink: 0 }}>
            <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', backgroundColor: '#f8fafc' }}>
                <div style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>{session.user.name}</div>
                <div style={{ color: '#64748b', fontSize: '0.875rem' }}>{session.user.email}</div>
              </div>
              <nav style={{ display: 'flex', flexDirection: 'column' }}>
                <Link href="/account" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--border)', fontWeight: '500' }}>
                  <User size={20} /> Dashboard
                </Link>
                <Link href="/account/orders" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--border)', fontWeight: '500' }}>
                  <Package size={20} /> My Orders
                </Link>
                <SignOutButton />
              </nav>
            </div>
          </aside>
          
          <main style={{ flex: 1, backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '2rem' }}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
