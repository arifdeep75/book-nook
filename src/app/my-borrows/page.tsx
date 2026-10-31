
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";

const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

type Borrow = {
  _id: string;
  bookId: string;
  bookTitle: string;
  bookImage: string;
  userEmail: string;
  borrowDate: string;
  returnDate: string;
};

export default function MyBorrowsPage() {
  const { data: session, isPending } = authClient.useSession();

  const [borrows, setBorrows] = useState<Borrow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [selectedBorrow, setSelectedBorrow] = useState<Borrow | null>(null);
  const [returning, setReturning] = useState(false);

  const userEmail = session?.user?.email;

  // Fetch user's borrowed books
  useEffect(() => {
    if (isPending || !userEmail) return;

    const email = userEmail;
    let active = true;

    async function fetchMyBorrows() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${SERVER_URL}/borrows?email=${encodeURIComponent(email)}`
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load borrowed books.");
        }

        if (active) {
          setBorrows(result.borrows || []);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Something went wrong."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void fetchMyBorrows();

    return () => {
      active = false;
    };
  }, [isPending, userEmail, reloadKey]);

  // Return book
  const handleReturn = async () => {
    if (!selectedBorrow) return;

    try {
      setReturning(true);
      setError("");
      setMessage("");

      const response = await fetch(
        `${SERVER_URL}/borrows/${selectedBorrow._id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to return book.");
      }

      setBorrows((prev) =>
        prev.filter((borrow) => borrow._id !== selectedBorrow._id)
      );

      setSelectedBorrow(null);
      setMessage(`"${selectedBorrow.bookTitle}" returned successfully!`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to return book."
      );
    } finally {
      setReturning(false);
    }
  };

  // Loading session
  if (isPending) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#f8f7f2]">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#dce5dc] border-t-[#245c45]" />
          <p className="mt-4 text-sm font-medium text-[#52665a]">
            Loading your account...
          </p>
        </div>
      </main>
    );
  }

  // Login required
  if (!session?.user) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#f8f7f2] px-5">
        <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <div className="text-5xl">🔒</div>
          <h1 className="mt-4 text-2xl font-bold text-[#173c2d]">
            Login Required
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Please sign in to see your borrowed books.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block rounded-lg bg-[#245c45] px-6 py-3 font-semibold text-white transition hover:bg-[#194632]"
          >
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  // Loading books
  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#f8f7f2]">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#dce5dc] border-t-[#245c45]" />
          <p className="mt-4 text-sm font-medium text-[#52665a]">
            Loading your borrowed books...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f7f2] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#64836e]">
              Your Reading Shelf
            </p>

            <h1 className="text-3xl font-bold text-[#173c2d] sm:text-4xl">
              My Borrows
            </h1>

            <p className="mt-3 text-sm text-gray-500 sm:text-base">
              Keep track of the books you have borrowed from BookNook.
            </p>
          </div>

          <Link
            href="/books"
            className="inline-flex w-fit items-center gap-2 rounded-lg bg-[#245c45] px-5 py-3 font-semibold text-white transition hover:bg-[#194632]"
          >
            <span className="text-xl">+</span>
            Browse Books
          </Link>
        </div>

        {/* Success Message */}
        {message && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-[#d5e5d8] bg-[#edf5ed] px-5 py-3 text-sm font-medium text-[#245c45]">
            <span>{message}</span>
            <button
              onClick={() => setMessage("")}
              className="ml-4 text-lg"
              aria-label="Close message"
            >
              ×
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
            <button
              onClick={() => {
                setError("");
                setLoading(true);
                setReloadKey((key) => key + 1);
              }}
              className="ml-3 font-bold underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Borrow Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Currently borrowed books
          </p>

          <span className="rounded-full bg-[#e5ede5] px-4 py-1.5 text-sm font-bold text-[#245c45]">
            {borrows.length} {borrows.length === 1 ? "Book" : "Books"}
          </span>
        </div>

        {/* Empty State */}
        {borrows.length === 0 && !error ? (
          <div className="rounded-2xl border border-dashed border-[#cbd8cb] bg-white px-6 py-16 text-center">
            <div className="text-6xl">📚</div>

            <h2 className="mt-5 text-2xl font-bold text-[#173c2d]">
              No Borrowed Books
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">
              You haven&apos;t borrowed any books yet. Explore our collection
              and find something interesting to read.
            </p>

            <Link
              href="/books"
              className="mt-7 inline-block rounded-lg bg-[#245c45] px-6 py-3 font-semibold text-white transition hover:bg-[#194632]"
            >
              Explore Books
            </Link>
          </div>
        ) : (
          /* Borrowed Books Grid */
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {borrows.map((borrow) => (
              <article
                key={borrow._id}
                className="overflow-hidden rounded-2xl border border-[#e8e8df] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                {/* Book Image */}
                <div className="relative h-60 bg-[#eef1e9]">
                  {borrow.bookImage ? (
                    <Image
                      src={borrow.bookImage}
                      alt={borrow.bookTitle}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      unoptimized
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-6xl">
                      📖
                    </div>
                  )}

                  <span className="absolute right-3 top-3 rounded-full bg-[#245c45] px-3 py-1 text-xs font-semibold text-white shadow">
                    Borrowed
                  </span>
                </div>

                {/* Book Details */}
                <div className="p-5">
                  <h2 className="line-clamp-1 text-xl font-bold text-[#173c2d]">
                    {borrow.bookTitle}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Active Borrow
                  </p>

                  {/* Dates */}
                  <div className="mt-5 space-y-3 rounded-xl bg-[#f5f7f2] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-gray-500">
                        Borrow Date
                      </span>
                      <span className="text-sm font-semibold text-[#173c2d]">
                        {new Date(borrow.borrowDate).toLocaleDateString(
                          "en-GB"
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-gray-500">
                        Return Date
                      </span>
                      <span className="text-sm font-semibold text-[#245c45]">
                        {new Date(borrow.returnDate).toLocaleDateString(
                          "en-GB"
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Return Button */}
                  <button
                    onClick={() => setSelectedBorrow(borrow)}
                    className="mt-5 w-full rounded-lg border border-red-200 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-600 hover:text-white"
                  >
                    Return Book
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Return Confirmation Modal */}
      {selectedBorrow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-7 text-center shadow-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#edf5ed] text-3xl">
              📖
            </div>

            <h2 className="mt-5 text-2xl font-bold text-[#173c2d]">
              Return This Book?
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              Are you sure you want to return{" "}
              <span className="font-semibold text-gray-800">
                {selectedBorrow.bookTitle}
              </span>
              ?
            </p>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row">
              <button
                onClick={() => setSelectedBorrow(null)}
                disabled={returning}
                className="flex-1 rounded-lg border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={handleReturn}
                disabled={returning}
                className="flex-1 rounded-lg bg-[#245c45] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#194632] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {returning ? "Returning..." : "Yes, Return"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
