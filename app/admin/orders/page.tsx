import { prisma } from "@/lib/prisma";

import { OrderStatusDropdown } from "@/components/admin/OrderStatusDropdown";
import { Pagination } from "@/components/Pagination";
import Link from "next/link";
import { Suspense } from "react";


const PAGE_SIZE = 20;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const page = Math.max(1, parseInt((searchParams.page as string) ?? "1") || 1);

  const [total, orders] = await Promise.all([
    prisma.order.count(),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <h1
        style={{
          fontSize: "1.875rem",
          fontWeight: "bold",
          marginBottom: "2rem",
        }}
      >
        Order Management
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

      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          border: "1px solid var(--border)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          overflow: "hidden",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: "#f8fafc",
                  color: "#64748b",
                  fontSize: "0.875rem",
                }}
              >
                {[
                  "Order ID",
                  "Customer",
                  "Contact",
                  "Date",
                  "Amount",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    style={{ padding: "1rem 1.5rem", fontWeight: "600" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((order, idx) => (
                <tr
                  key={order.id}
                  style={{
                    borderTop: "1px solid var(--border)",
                    backgroundColor: idx % 2 === 0 ? "white" : "#fcfcfc",
                  }}
                >
                  <td style={{ padding: "1rem 1.5rem", fontWeight: "500" }}>
                    #{order.id.slice(-6).toUpperCase()}
                  </td>
                  <td style={{ padding: "1rem 1.5rem" }}>
                    {order.customerName}
                  </td>
                  <td style={{ padding: "1rem 1.5rem" }}>
                    <div style={{ fontSize: "0.875rem" }}>
                      {order.customerPhone}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                      {order.shippingAddress}
                    </div>
                  </td>
                  <td style={{ padding: "1rem 1.5rem", color: "#64748b" }}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "1rem 1.5rem", fontWeight: "bold" }}>
                    {order.total.toLocaleString()} EGP
                  </td>
                  <td style={{ padding: "1rem 1.5rem" }}>
                    <OrderStatusDropdown
                      orderId={order.id}
                      initialStatus={order.status}
                    />
                  </td>
                  <td style={{ padding: "1rem 1.5rem" }}>
                    <Link
                      href={`/admin/orders/${order.id}`}
                      style={{
                        color: "var(--primary)",
                        fontWeight: "bold",
                        fontSize: "0.875rem",
                        textDecoration: "none",
                      }}
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ padding: "0 1.5rem" }}>
          <Suspense fallback={null}>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={total}
              pageSize={PAGE_SIZE}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
