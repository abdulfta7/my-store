import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LayoutDashboard, ShoppingBag, Package, LayoutGrid, Tag, Users, Settings, Globe, Award } from "lucide-react";
import { SignOutButton } from "@/components/SignOutButton";
import { AdminNav } from "@/components/admin/AdminNav";
import styles from "./AdminLayout.module.css";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (
    !session?.user ||
    ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPER_ADMIN")
  ) {
    redirect("/");
  }

  const navItems = [
    { href: "/admin", label: "لوحة القيادة", icon: "LayoutDashboard" },
    { href: "/admin/orders", label: "الطلبات", icon: "ShoppingBag" },
    { href: "/admin/products", label: "المنتجات", icon: "Package" },
    { href: "/admin/categories", label: "الأقسام", icon: "LayoutGrid" },
    { href: "/admin/brands", label: "العلامات التجارية", icon: "Award" },
    { href: "/admin/coupons", label: "الكوبونات", icon: "Tag" },
    { href: "/admin/customers", label: "العملاء", icon: "Users" },
    { href: "/admin/reviews", label: "التقييمات", icon: "Star" },
    { href: "/admin/settings", label: "الإعدادات", icon: "Settings" },
  ];

  return (
    <div className={styles.adminContainer}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div>
            <h1 style={{ fontSize: "1.375rem", fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>
              Zoma <span style={{ color: "var(--accent)" }}>Admin</span>
            </h1>
            <div style={{ fontSize: "0.8125rem", opacity: 0.65, marginTop: "0.2rem" }}>
              {session.user.name}
            </div>
          </div>
          <div style={{ filter: "brightness(0) invert(1)", opacity: 0.7, alignItems: "center" }} className={styles.mobileSignout}>
            <SignOutButton />
          </div>
        </div>

        {/* Nav — client component for active highlighting */}
        <AdminNav items={navItems} />

        <div style={{ padding: "1rem", borderTop: "1px solid rgba(255,255,255,0.1)", marginTop: "auto" }} className={styles.desktopFooter}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.65rem 1rem", color: "rgba(255,255,255,0.75)", backgroundColor: "rgba(255,255,255,0.07)", borderRadius: "8px", justifyContent: "center", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 600 }}>
            <Globe size={17} /> عرض المتجر
          </a>
          <div style={{ filter: "brightness(0) invert(1)", opacity: 0.7 }}>
            <SignOutButton />
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}
