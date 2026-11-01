
"use client";

import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";
import Image from "next/image";
import {
  Star,
  Loader2,
  MessageSquare,
  Send,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useSession } from "@/lib/auth-client";
import { authenticatedFetch } from "../lib/authenticated-fetch";

interface Review {
  _id: string;
  userName: string;
  userEmail: string;
  userImage?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ReviewsResponse {
  success: boolean;
  reviews: Review[];
  message?: string;
}

interface MyReviewResponse {
  hasReviewed: boolean;
}

const API_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

export default function Reviews() {
  const { data: session, isPending: sessionLoading } = useSession();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  const [hasReviewed, setHasReviewed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isLoggedIn = Boolean(session?.user);

  const loadReviews = useCallback(async () => {
    const response = await fetch(`${API_URL}/reviews`, {
      method: "GET",
      cache: "no-store",
    });

    const data: ReviewsResponse = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Failed to load reviews.");
    }

    return Array.isArray(data.reviews) ? data.reviews : [];
  }, []);

  const loadMyReviewStatus = useCallback(async () => {
    const response = await authenticatedFetch(`${API_URL}/reviews/me`, {
      method: "GET",
      cache: "no-store",
    });

    const data: MyReviewResponse = await response.json();

    if (!response.ok) {
      throw new Error("Failed to check review status.");
    }

    return data.hasReviewed;
  }, []);

  useEffect(() => {
    let active = true;

    loadReviews()
      .then((loadedReviews) => {
        if (active) {
          setReviews(loadedReviews);
          setCurrentIndex(0);
          setError("");
        }
      })
      .catch((err: unknown) => {
        if (active) {
          console.error("Reviews fetch error:", err);
          setError("Unable to load reviews. Please try again later.");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [loadReviews]);

  useEffect(() => {
    if (sessionLoading || !isLoggedIn) return;

    let active = true;

    loadMyReviewStatus()
      .then((reviewStatus) => {
        if (active) {
          setHasReviewed(reviewStatus);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          console.error("Review status error:", err);
        }
      });

    return () => {
      active = false;
    };
  }, [sessionLoading, isLoggedIn, loadMyReviewStatus]);

  // Calculate average rating
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((total, review) => total + review.rating, 0) /
        reviews.length
      : 0;

  // Carousel navigation
  const nextReview = () => {
    if (reviews.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const previousReview = () => {
    if (reviews.length <= 1) return;

    setCurrentIndex((prev) =>
      prev === 0 ? reviews.length - 1 : prev - 1
    );
  };

  // Auto slide every 5 seconds
  useEffect(() => {
    if (reviews.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [reviews.length]);

  // Submit review
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!isLoggedIn) {
      setError("Please sign in to submit a review.");
      return;
    }

    if (rating < 1 || rating > 5) {
      setError("Please select a rating.");
      return;
    }

    if (!comment.trim()) {
      setError("Please write your review.");
      return;
    }

    if (hasReviewed) {
      setError("You have already submitted a review.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await authenticatedFetch(`${API_URL}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating,
          comment: comment.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to submit review.");
      }

      setMessage("Your review has been submitted successfully!");
      setComment("");
      setRating(0);
      setHoverRating(0);
      setHasReviewed(true);

      const loadedReviews = await loadReviews();
      setReviews(loadedReviews);
      setCurrentIndex(0);

      const reviewStatus = await loadMyReviewStatus();
      setHasReviewed(reviewStatus);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const currentReview = reviews[currentIndex];

  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section Heading */}
        <div className="mb-10 text-center">
          <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#dfc58d]/20 px-4 py-2 text-sm font-medium text-[#8a6b35]">
            <MessageSquare size={16} />
            Reader Feedback
          </span>

          <h2 className="text-3xl font-bold text-[#1c352b] sm:text-4xl">
            What Readers Say
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm text-gray-500 sm:text-base">
            Discover what our readers think about their BookNook experience.
          </p>
        </div>

        {/* Rating Summary */}
        <div className="mb-10 rounded-2xl border border-[#dfc58d]/40 bg-[#f8f7f2] p-6 text-center">
          <p className="text-sm font-medium text-gray-500">
            Overall Reader Rating
          </p>

          <div className="mt-3 flex items-center justify-center gap-2">
            <span className="text-4xl font-bold text-[#1c352b]">
              {averageRating.toFixed(1)}
            </span>

            <div className="flex gap-1">
              {Array.from({ length: 5 }, (_, index) => (
                <Star
                  key={index}
                  size={20}
                  className={
                    index < Math.round(averageRating)
                      ? "fill-[#dfc58d] text-[#dfc58d]"
                      : "text-gray-300"
                  }
                />
              ))}
            </div>
          </div>

          <p className="mt-2 text-sm text-gray-500">
            Based on {reviews.length}{" "}
            {reviews.length === 1 ? "review" : "reviews"}
          </p>
        </div>

        {/* Review Form */}
        {!sessionLoading && (
          <div className="mb-12 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <h3 className="mb-5 text-xl font-semibold text-[#1c352b]">
              Share Your Experience
            </h3>

            {!isLoggedIn ? (
              <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
                Please sign in to write a review.
              </p>
            ) : hasReviewed ? (
              <p className="rounded-lg bg-green-50 p-4 text-sm text-green-700">
                Thank you! You have already submitted your review.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Star Rating */}
                <div>
                  <p className="mb-3 text-sm font-medium text-gray-700">
                    Your Rating
                  </p>

                  <div className="flex gap-2">
                    {Array.from({ length: 5 }, (_, index) => {
                      const starValue = index + 1;

                      return (
                        <button
                          key={starValue}
                          type="button"
                          aria-label={`Rate ${starValue} out of 5`}
                          onClick={() => setRating(starValue)}
                          onMouseEnter={() => setHoverRating(starValue)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            size={28}
                            className={
                              starValue <= (hoverRating || rating)
                                ? "fill-[#dfc58d] text-[#dfc58d]"
                                : "text-gray-300"
                            }
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label
                    htmlFor="review-comment"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Your Review
                  </label>

                  <textarea
                    id="review-comment"
                    rows={4}
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    placeholder="Share your thoughts about BookNook..."
                    maxLength={1000}
                    className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-[#1c352b] focus:ring-2 focus:ring-[#1c352b]/10"
                  />

                  <p className="mt-1 text-right text-xs text-gray-400">
                    {comment.length}/1000
                  </p>
                </div>

                {/* Error and Success */}
                {error && (
                  <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                    {error}
                  </p>
                )}

                {message && (
                  <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
                    {message}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1c352b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#294b3c] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Submit Review
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Reviews Carousel */}
        <div>
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-[#1c352b]">
              Recent Reviews
            </h3>

            {reviews.length > 1 && !loading && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={previousReview}
                  aria-label="Previous review"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-[#1c352b] transition hover:bg-[#1c352b] hover:text-white"
                >
                  <ChevronLeft size={20} />
                </button>

                <button
                  type="button"
                  onClick={nextReview}
                  aria-label="Next review"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1c352b] text-white transition hover:bg-[#294b3c]"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2
                className="animate-spin text-[#1c352b]"
                size={30}
              />
            </div>
          ) : reviews.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 py-12 text-center">
              <MessageSquare
                size={32}
                className="mx-auto mb-3 text-gray-400"
              />
              <p className="font-medium text-gray-600">No reviews yet.</p>
              <p className="mt-1 text-sm text-gray-400">
                Be the first to share your experience!
              </p>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl">
              <AnimatePresence mode="wait">
                {currentReview && (
                  <motion.article
                    key={currentReview._id}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{
                      duration: 0.35,
                      ease: "easeInOut",
                    }}
                    className="min-h-52 rounded-2xl border border-[#dfc58d]/40 bg-[#f8f7f2] p-6 shadow-sm sm:p-8"
                  >
                    {/* User Information */}
                    <div className="mb-5 flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        {currentReview.userImage ? (
                          <Image
                            src={currentReview.userImage}
                            alt={`${currentReview.userName}'s profile`}
                            width={48}
                            height={48}
                            unoptimized
                            className="h-12 w-12 shrink-0 rounded-full border border-gray-200 object-cover"
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#1c352b] text-lg font-semibold text-white">
                            {currentReview.userName?.charAt(0).toUpperCase() || "U"}
                          </div>
                        )}

                        <div className="min-w-0">
                          <h4 className="truncate font-semibold text-[#1c352b]">
                            {currentReview.userName}
                          </h4>

                          <p className="text-xs text-gray-400">
                            {new Date(
                              currentReview.createdAt
                            ).toLocaleDateString("en-US", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="flex shrink-0 gap-0.5">
                        {Array.from({ length: 5 }, (_, index) => (
                          <Star
                            key={index}
                            size={16}
                            className={
                              index < currentReview.rating
                                ? "fill-[#dfc58d] text-[#dfc58d]"
                                : "text-gray-300"
                            }
                          />
                        ))}
                      </div>
                    </div>

                    {/* Review Comment */}
                    <p className="text-sm leading-7 text-gray-600 sm:text-base">
                      {currentReview.comment}
                    </p>
                  </motion.article>
                )}
              </AnimatePresence>

              {/* Pagination Dots */}
              {reviews.length > 1 && (
                <div className="mt-6 flex items-center justify-center gap-2">
                  {reviews.map((review, index) => (
                    <button
                      key={review._id}
                      type="button"
                      onClick={() => setCurrentIndex(index)}
                      aria-label={`Go to review ${index + 1}`}
                      aria-current={
                        currentIndex === index ? "true" : undefined
                      }
                      className={`h-2.5 rounded-full transition-all duration-300 ${
                        currentIndex === index
                          ? "w-7 bg-[#1c352b]"
                          : "w-2.5 bg-gray-300 hover:bg-[#dfc58d]"
                      }`}
                    />
                  ))}
                </div>
              )}

              <p className="mt-3 text-center text-xs text-gray-400">
                {currentIndex + 1} of {reviews.length} reviews
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
