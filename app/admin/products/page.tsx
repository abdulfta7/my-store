import { prisma } from "@/lib/prisma";

import Link from "next/link";
import Image from "next/image";
import { DeleteAction } from "@/components/admin/DeleteAction";
import { Pagination } from "@/components/Pagination";
import { Suspense } from "react";


const PAGE_SIZE = 15;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const page = Math.max(1, parseInt((searchParams.page as string) ?? "1") || 1);

  const [total, products] = await Promise.all([
    prisma.product.count(),
    prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        inventory: true,
        images: { where: { isPrimary: true } },
      },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

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
          Products Management
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
        <Link
          href="/admin/products/new"
          style={{
            backgroundColor: "var(--primary)",
            color: "white",
            padding: "0.75rem 1.5rem",
            borderRadius: "6px",
            fontWeight: "bold",
          }}
        >
          + Add New Product
        </Link>
      </div>

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
                <th style={{ padding: "1rem 1.5rem", fontWeight: "600" }}>
                  Product
                </th>
                <th style={{ padding: "1rem 1.5rem", fontWeight: "600" }}>
                  Category
                </th>
                <th style={{ padding: "1rem 1.5rem", fontWeight: "600" }}>
                  Price
                </th>
                <th style={{ padding: "1rem 1.5rem", fontWeight: "600" }}>
                  Stock
                </th>
                <th style={{ padding: "1rem 1.5rem", fontWeight: "600" }}>
                  Status
                </th>
                <th
                  style={{
                    padding: "1rem 1.5rem",
                    fontWeight: "600",
                    textAlign: "right",
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, idx) => {
                const primaryImg =
                  product.images[0]?.url || "/placeholder-product.png";
                return (
                  <tr
                    key={product.id}
                    style={{
                      borderTop: "1px solid var(--border)",
                      backgroundColor: idx % 2 === 0 ? "white" : "#fcfcfc",
                    }}
                  >
                    <td style={{ padding: "1rem 1.5rem" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "1rem",
                        }}
                      >
                        <div
                          style={{
                            width: "48px",
                            height: "48px",
                            position: "relative",
                            border: "1px solid var(--border)",
                            borderRadius: "6px",
                            overflow: "hidden",
                            backgroundColor: "white",
                            flexShrink: 0,
                          }}
                        >
                          <Image
                            src={primaryImg}
                            alt={product.name}
                            fill
                            style={{ objectFit: "contain", padding: "0.25rem" }}
                          />
                        </div>
                        <div>
                          <div style={{ fontWeight: "600" }}>{product.name}</div>
                          <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                            SKU: {product.sku}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "1rem 1.5rem", color: "#475569" }}>
                      {product.category?.name || "Uncategorized"}
                    </td>
                    <td
                      style={{ padding: "1rem 1.5rem", fontWeight: "bold" }}
                    >
                      {product.price.toLocaleString()} EGP
                    </td>
                    <td style={{ padding: "1rem 1.5rem" }}>
                      <span
                        style={{
                          color:
                            (product.inventory?.stock || 0) > 10
                              ? "#22c55e"
                              : (product.inventory?.stock || 0) > 0
                                ? "#eab308"
                                : "#ef4444",
                          fontWeight: "bold",
                        }}
                      >
                        {product.inventory?.stock || 0} in stock
                      </span>
                    </td>
                    <td style={{ padding: "1rem 1.5rem" }}>
                      <span
                        style={{
                          padding: "0.25rem 0.75rem",
                          borderRadius: "999px",
                          fontSize: "0.75rem",
                          fontWeight: "bold",
                          backgroundColor: product.isPublished
                            ? "rgba(34, 197, 94, 0.1)"
                            : "rgba(100, 116, 139, 0.1)",
                          color: product.isPublished ? "#22c55e" : "#64748b",
                        }}
                      >
                        {product.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "1rem 1.5rem",
                        textAlign: "right",
                        display: "flex",
                        gap: "1rem",
                        justifyContent: "flex-end",
                        alignItems: "center",
                      }}
                    >
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        style={{
                          color: "#3b82f6",
                          fontWeight: "bold",
                          fontSize: "0.875rem",
                          textDecoration: "none",
                        }}
                      >
                        Edit
                      </Link>
                      <DeleteAction
                        id={product.id}
                        endpoint="/api/admin/products"
                      />
                    </td>
                  </tr>
                );
              })}
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
