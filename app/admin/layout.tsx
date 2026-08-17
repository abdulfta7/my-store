import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LayoutDashboard, ShoppingBag, Package, LayoutGrid, Tag, Users, Settings, Globe, Award } from "lucide-react";
import { SignOutButton } from "@/components/SignOutButton";
import { AdminNav } from "@/components/admin/AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (
    !session?.user ||
    ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPER_ADMIN")
  ) {
    redirect("/");
  }

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: "LayoutDashboard" },
    { href: "/admin/orders", label: "Orders", icon: "ShoppingBag" },
    { href: "/admin/products", label: "Products", icon: "Package" },
    { href: "/admin/categories", label: "Categories", icon: "LayoutGrid" },
    { href: "/admin/brands", label: "Brands", icon: "Award" },
    { href: "/admin/coupons", label: "Coupons", icon: "Tag" },
    { href: "/admin/customers", label: "Customers", icon: "Users" },
    { href: "/admin/settings", label: "Settings", icon: "Settings" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f1f5f9" }}>
      {/* Sidebar */}
      <aside style={{ width: "240px", backgroundColor: "var(--primary)", color: "white", flexShrink: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <h1 style={{ fontSize: "1.375rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
            Zoma <span style={{ color: "var(--accent)" }}>Admin</span>
          </h1>
          <div style={{ fontSize: "0.8125rem", opacity: 0.65, marginTop: "0.2rem" }}>
            {session.user.name}
          </div>
        </div>

        {/* Nav — client component for active highlighting */}
        <AdminNav items={navItems} />

        <div style={{ padding: "1rem", borderTop: "1px solid rgba(255,255,255,0.1)", marginTop: "auto" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.65rem 1rem", color: "rgba(255,255,255,0.75)", backgroundColor: "rgba(255,255,255,0.07)", borderRadius: "8px", justifyContent: "center", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 600 }}>
            <Globe size={17} /> View Store
          </a>
          <div style={{ filter: "brightness(0) invert(1)", opacity: 0.7 }}>
            <SignOutButton />
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: "2rem", overflowY: "auto", minHeight: "100vh" }}>
        {children}
      </main>
    </div>
  );
}
