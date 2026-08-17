"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import styles from "./ReviewSection.module.css";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: {
    name: string | null;
  };
}

interface ReviewSectionProps {
  productId: string;
  initialReviews?: Review[];
}

export function ReviewSection({ productId, initialReviews = [] }: ReviewSectionProps) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Fetch reviews if not provided initially
    if (initialReviews.length === 0) {
      fetch(`/api/products/${productId}/reviews`)
        .then(res => res.json())
        .then(data => {
          if (data.reviews) setReviews(data.reviews);
        })
        .catch(console.error);
    }
  }, [productId, initialReviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      toast.error("You must be logged in to submit a review.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit review");
      }

      const data = await res.json();
      setReviews([data.review, ...reviews]);
      setComment("");
      setRating(5);
      toast.success("Review submitted successfully!");
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Customer Reviews</h3>

      <div className={styles.reviewsList}>
        {reviews.length === 0 ? (
          <p className={styles.empty}>No reviews yet. Be the first to review this product!</p>
        ) : (
          reviews.map(review => (
            <div key={review.id} className={styles.reviewCard}>
              <div className={styles.reviewHeader}>
                <div className={styles.reviewerInfo}>
                  <span className={styles.reviewerName}>{review.user.name || "Anonymous User"}</span>
                  <span className={styles.reviewDate}>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className={styles.stars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      size={16} 
                      fill={star <= review.rating ? "var(--warning)" : "none"} 
                      color={star <= review.rating ? "var(--warning)" : "#cbd5e1"} 
                    />
                  ))}
                </div>
              </div>
              {review.comment && <p className={styles.comment}>{review.comment}</p>}
            </div>
          ))
        )}
      </div>

      <div className={styles.formContainer}>
        <h4 className={styles.formTitle}>Write a Review</h4>
        {session ? (
          <form onSubmit={handleSubmit} className={styles.form}>
            
            <div className={styles.formGroup}>
              <label>Rating</label>
              <div className={styles.ratingSelect}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={styles.starBtn}
                    onClick={() => setRating(star)}
                  >
                    <Star 
                      size={24} 
                      fill={star <= rating ? "var(--warning)" : "none"} 
                      color={star <= rating ? "var(--warning)" : "#cbd5e1"} 
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="comment">Comment (Optional)</label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className={styles.textarea}
                rows={4}
                placeholder="Share your experience with this product..."
              />
            </div>

            <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        ) : (
          <p className={styles.loginPrompt}>
            Please <a href="/login" style={{ color: "var(--primary)", textDecoration: "underline" }}>log in</a> to write a review.
          </p>
        )}
      </div>
    </div>
  );
}
