import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { User, Package } from "lucide-react";
import { SignOutButton } from "@/components/SignOutButton";
import styles from "./AccountLayout.module.css";

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
      
      <div className={styles.accountContainer}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarInner}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', backgroundColor: '#f8fafc' }}>
              <div style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>{session.user.name}</div>
              <div style={{ color: '#64748b', fontSize: '0.875rem' }}>{session.user.email}</div>
            </div>
            <nav className={styles.nav}>
              <Link href="/account" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--border)', fontWeight: '500' }}>
                <User size={20} /> Dashboard
              </Link>
              <Link href="/account/orders" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--border)', fontWeight: '500' }}>
                <Package size={20} /> My Orders
              </Link>
              <div style={{ padding: '0.5rem 1rem' }}>
                <SignOutButton />
              </div>
            </nav>
          </div>
        </aside>
        
        <main className={styles.mainContent}>
          {children}
        </main>
      </div>
    </div>
  );
}
