import { prisma } from "@/lib/prisma";

import Link from "next/link";
import { AdminDashboardClient } from "./AdminDashboardClient";


export default async function AdminDashboardPage() {
  const [
    totalOrders,
    totalProducts,
    totalCustomers,
    recentOrders,
    revenueData,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.product.count(),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.order.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { user: true } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: 'DELIVERED' } }),
  ]);

  // Low stock: products where stock <= lowStockAlert threshold
  const lowStockProducts = await prisma.product.findMany({
    where: { isPublished: true, inventory: { stock: { lte: 5 } } },
    include: { inventory: true },
    orderBy: { inventory: { stock: "asc" } },
    take: 10,
  });

  const totalRevenue = revenueData._sum.total || 0;

  return (
    <AdminDashboardClient
      totalOrders={totalOrders}
      totalProducts={totalProducts}
      totalCustomers={totalCustomers}
      recentOrders={recentOrders}
      totalRevenue={totalRevenue}
      lowStockProducts={lowStockProducts}
    />
  );
}
