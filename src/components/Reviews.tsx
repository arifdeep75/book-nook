
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  Star,
  MessageSquare,
  Send,
  Loader2,
  UserRound,
} from "lucide-react";

const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

interface Review {
  _id: string;
  userName: string;
  userEmail: string;
  userImage?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function Reviews() {
  const router = useRouter();

  const { data: session, isPending } = authClient.useSession();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<
    "success" | "error" | ""
  >("");

  // Fetch reviews
  const fetchReviews = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${SERVER_URL}/reviews`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load reviews.");
      }

      setReviews(data.reviews || []);
    } catch (error) {
      console.error("Fetch reviews error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // Calculate average rating
  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((total, review) => total + review.rating, 0) /
          reviews.length
        ).toFixed(1)
      : "0.0";

  // Check if current user already reviewed
  const hasReviewed = reviews.some(
    (review) =>
      review.userEmail.toLowerCase() ===
      session?.user?.email?.toLowerCase()
  );

  // Submit review
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setMessage("");
    setMessageType("");

    if (!session?.user) {
      router.push("/login");
      return;
    }

    if (comment.trim().length < 10 || comment.trim().length > 500) {
      setMessage("Review must be between 10 and 500 characters.");
      setMessageType("error");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(`${SERVER_URL}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userName: session.user.name || "BookNook User",
          userEmail: session.user.email,
          userImage: session.user.image || "",
          rating,
          comment: comment.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit review.");
      }

      setReviews((previousReviews) => [
        data.review,
        ...previousReviews,
      ]);

      setComment("");
      setRating(5);
      setMessage("Thank you! Your review has been submitted.");
      setMessageType("success");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
      setMessageType("error");

      // Refresh in case the review was saved despite a network error
      fetchReviews();
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <section className="bg-[#f8f7f2] py-20">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        {/* Heading */}
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-[0.2em] text-[#64836e]">
            Community Voices
          </span>

          <h2 className="text-3xl font-bold text-[#1c352b] sm:text-4xl">
            What Our Readers Say
          </h2>

          <p className="mt-4 text-gray-600">
            Real experiences from people who love discovering books
            with BookNook.
          </p>
        </div>

        {/* Rating Summary */}
        <div className="mb-12 flex flex-col items-center justify-center gap-4 rounded-2xl border border-[#e8e4d9] bg-white p-7 sm:flex-row sm:gap-8">
          <div className="text-center">
            <h3 className="text-5xl font-bold text-[#1c352b]">
              {averageRating}
            </h3>

            <div className="mt-2 flex justify-center text-[#d5a84d]">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={17}
                  fill={
                    star <= Math.round(Number(averageRating))
                      ? "currentColor"
                      : "none"
                  }
                />
              ))}
            </div>

            <p className="mt-2 text-sm text-gray-500">
              Average Rating
            </p>
          </div>

          <div className="hidden h-16 w-px bg-[#e8e4d9] sm:block" />

          <div className="text-center">
            <h3 className="text-3xl font-bold text-[#1c352b]">
              {reviews.length}
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Total Reviews
            </p>
          </div>
        </div>

        {/* Review Form */}
        <div className="mb-14 rounded-2xl border border-[#e8e4d9] bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-[#eaf0e9] p-3 text-[#245c45]">
              <MessageSquare size={22} />
            </div>

            <div>
              <h3 className="text-xl font-bold text-[#1c352b]">
                Share Your Experience
              </h3>

              <p className="text-sm text-gray-500">
                Your feedback helps our reading community grow.
              </p>
            </div>
          </div>

          {isPending ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="animate-spin" size={18} />
              Checking your account...
            </div>
          ) : hasReviewed ? (
            <div className="rounded-xl bg-[#eaf0e9] p-4 text-sm text-[#245c45]">
              You have already submitted a review. Thank you for
              sharing your experience!
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* User Info */}
              {session?.user && (
                <div className="mb-5 flex items-center gap-3">
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      className="h-11 w-11 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eaf0e9] text-[#245c45]">
                      <UserRound size={21} />
                    </div>
                  )}

                  <div>
                    <p className="font-semibold text-[#1c352b]">
                      {session.user.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {session.user.email}
                    </p>
                  </div>
                </div>
              )}

              {/* Rating */}
              <div className="mb-5">
                <label className="mb-2 block text-sm font-semibold text-[#1c352b]">
                  Your Rating
                </label>

                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      aria-label={`Rate ${star} out of 5`}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        size={29}
                        className={
                          star <= (hoverRating || rating)
                            ? "fill-[#d5a84d] text-[#d5a84d]"
                            : "text-gray-300"
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div className="mb-5">
                <label
                  htmlFor="review"
                  className="mb-2 block text-sm font-semibold text-[#1c352b]"
                >
                  Your Review
                </label>

                <textarea
                  id="review"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience with BookNook..."
                  rows={4}
                  maxLength={500}
                  required
                  minLength={10}
                  className="w-full resize-none rounded-xl border border-[#e3e1d9] bg-[#fdfcf9] p-4 text-sm text-gray-700 outline-none transition focus:border-[#64836e] focus:ring-2 focus:ring-[#64836e]/20"
                />

                <p className="mt-1 text-right text-xs text-gray-400">
                  {comment.length}/500
                </p>
              </div>

              {/* Login Notice */}
              {!session?.user && (
                <p className="mb-4 text-sm text-gray-500">
                  Please log in to submit your review.
                </p>
              )}

              {/* Feedback */}
              {message && (
                <p
                  className={`mb-4 rounded-lg p-3 text-sm ${
                    messageType === "success"
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting || isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-[#1c352b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#245c45] disabled:cursor-not-allowed disabled:opacity-60"
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

              {!session?.user && (
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="ml-3 text-sm font-semibold text-[#245c45] underline underline-offset-4"
                >
                  Login first
                </button>
              )}
            </form>
          )}
        </div>

        {/* Review Cards */}
        <div className="mb-7 flex items-center justify-between">
          <h3 className="text-2xl font-bold text-[#1c352b]">
            Reader Reviews
          </h3>

          <span className="text-sm text-gray-500">
            {reviews.length} reviews
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2
              size={30}
              className="animate-spin text-[#245c45]"
            />
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#d9d5c9] py-14 text-center">
            <MessageSquare
              size={35}
              className="mx-auto mb-3 text-[#64836e]"
            />

            <h4 className="font-semibold text-[#1c352b]">
              No reviews yet
            </h4>

            <p className="mt-2 text-sm text-gray-500">
              Be the first to share your experience!
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => (
              <article
                key={review._id}
                className="rounded-2xl border border-[#e8e4d9] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[#d5a84d]">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={15}
                        fill={
                          star <= review.rating
                            ? "currentColor"
                            : "none"
                        }
                      />
                    ))}
                  </div>

                  <span className="text-xs text-gray-400">
                    {formatDate(review.createdAt)}
                  </span>
                </div>

                <p className="mb-6 min-h-20 text-sm leading-7 text-gray-600">
                  &ldquo;{review.comment}&rdquo;
                </p>

                <div className="flex items-center gap-3 border-t border-[#eeeae1] pt-4">
                  {review.userImage ? (
                    <img
                      src={review.userImage}
                      alt={review.userName}
                      className="h-11 w-11 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eaf0e9] text-[#245c45]">
                      <UserRound size={20} />
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-bold text-[#1c352b]">
                      {review.userName}
                    </h4>

                    <p className="text-xs text-gray-500">
                      BookNook Reader
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
