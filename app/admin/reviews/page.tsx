import { prisma } from "@/lib/prisma";
import { ReviewsClient } from "./ReviewsClient";

export const metadata = {
  title: "التقييمات | Admin",
};

export default async function AdminReviewsPage() {
  const initialReviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      product: { select: { name: true, id: true, slug: true } },
    },
  });

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "2rem" }}>
        إدارة التقييمات
      </h1>
      <ReviewsClient initialReviews={initialReviews} />
    </div>
  );
}
