"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, Package, LayoutGrid, Tag, Users, Settings, Award, type LucideIcon } from "lucide-react";
import styles from "./AdminNav.module.css";

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
    <nav className={styles.nav}>
      {items.map((item) => {
        const Icon = ICON_MAP[item.icon];
        const active = isActive(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navItem} ${active ? styles.navItemActive : ""}`}
          >
            {Icon && <Icon size={18} />}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
