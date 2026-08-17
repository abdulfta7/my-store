import { prisma } from "@/lib/prisma";

import { CouponsClient } from "./CouponsClient";
import { Pagination } from "@/components/Pagination";
import { Suspense } from "react";


const PAGE_SIZE = 20;

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const page = Math.max(1, parseInt((searchParams.page as string) ?? "1") || 1);

  const [total, rawCoupons] = await Promise.all([
    prisma.coupon.count(),
    prisma.coupon.findMany({
      orderBy: { id: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  // Serialize Date fields to strings for the client component
  const coupons = rawCoupons.map((c) => ({
    ...c,
    expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
  }));

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <h1 style={{ fontSize: "1.875rem", fontWeight: "bold" }}>
          Coupons
          <span
            style={{
              fontSize: "1rem",
              fontWeight: "normal",
              color: "#64748b",
              marginLeft: "0.75rem",
            }}
          >
            ({total} total)
          </span>
        </h1>
      </div>

      <CouponsClient initialCoupons={coupons} />

      {totalPages > 1 && (
        <Suspense fallback={null}>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={total}
            pageSize={PAGE_SIZE}
          />
        </Suspense>
      )}
    </div>
  );
}
