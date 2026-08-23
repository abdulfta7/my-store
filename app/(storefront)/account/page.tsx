import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

import Link from "next/link";
import { Package, Clock, CheckCircle, Shield } from "lucide-react";
import { AccountDashboardClient } from "./AccountDashboardClient";

export default async function AccountDashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return null;

  const recentOrders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 3,
  });

  const orderStats = await prisma.order.groupBy({
    by: ['status'],
    where: { userId },
    _count: true,
  });

  const getStat = (status: string) => orderStats.find(s => s.status === status)?._count || 0;

  const pendingOrders = getStat('PENDING');
  const deliveredOrders = getStat('DELIVERED');
  const isAdmin = (session?.user as any)?.role === 'SUPER_ADMIN' || (session?.user as any)?.role === 'ADMIN';

  return (
    <AccountDashboardClient
      recentOrders={recentOrders}
      totalOrders={recentOrders.length > 0 ? await prisma.order.count({ where: { userId } }) : 0}
      pendingOrders={pendingOrders}
      deliveredOrders={deliveredOrders}
      isAdmin={isAdmin}
    />
  );
}
