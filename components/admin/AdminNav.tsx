"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, Package, LayoutGrid, Tag, Users, Settings, Award, type LucideIcon } from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  ShoppingBag,
  Package,
  LayoutGrid,
  Tag,
  Users,
  Settings,
  Award,
};

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

export function AdminNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <nav style={{ flex: 1, padding: "0.75rem 0", overflowY: "auto" }}>
      {items.map((item) => {
        const Icon = ICON_MAP[item.icon];
        const active = isActive(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.7rem",
              padding: "0.7rem 1.5rem",
              color: active ? "white" : "rgba(255,255,255,0.65)",
              textDecoration: "none",
              fontSize: "0.9rem",
              fontWeight: active ? 700 : 500,
              backgroundColor: active ? "rgba(255,255,255,0.12)" : "transparent",
              borderLeft: active ? "3px solid var(--accent)" : "3px solid transparent",
              transition: "background 0.15s, color 0.15s",
            }}
          >
            {Icon && <Icon size={18} />}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
