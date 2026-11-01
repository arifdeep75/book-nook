"use client";

import { Suspense, useCallback, useEffect, useState, type MouseEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

type Book = {
  _id: string;
  title: string;
  author: string;
  category: string;
  image: string;
  description: string;
  contributorName?: string;
  contributorEmail?: string;
  totalCopies: number;
  availableCopies: number;
  addedAt?: string;
};

type Borrow = {
  _id: string;
  bookId: string;
  bookTitle: string;
  bookImage: string;
  userEmail?: string;
  borrowDate: string;
  returnDate: string;
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
} & T;

const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getTodayDate() {
  return formatLocalDate(new Date());
}

function getReturnDate() {
  const date = new Date();
  date.setDate(date.getDate() + 14);
  return formatLocalDate(date);
}

export default function BookDetailsPage() {
  return (
    <Suspense fallback={<BookDetailsLoading />}>
      <BookDetailsContent />
    </Suspense>
  );
}

function BookDetailsLoading() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-[#f7f5ef] px-4">
      <div className="text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#1d4735] border-t-transparent" />
        <p className="text-sm font-medium text-[#1d4735]">
          বইয়ের তথ্য লোড হচ্ছে...
        </p>
      </div>
    </main>
  );
}

function BookDetailsContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const bookId = params.id;

  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  const [book, setBook] = useState<Book | null>(null);
  const [activeBorrow, setActiveBorrow] = useState<Borrow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [borrowModalOpen, setBorrowModalOpen] = useState(false);
  const [borrowDate, setBorrowDate] = useState(getTodayDate);
  const [returnDate, setReturnDate] = useState(getReturnDate);

  const [borrowing, setBorrowing] = useState(false);
  const [returning, setReturning] = useState(false);
  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    document.title = book
      ? `BookNook | ${book.title}`
      : "BookNook | Book Details";
  }, [book]);

  const fetchDetails = useCallback(
    async (signal?: AbortSignal) => {
      const [bookResponse, borrowResponse] = await Promise.all([
        fetch(`${SERVER_URL}/books/${bookId}`, { signal }),
        fetch(`${SERVER_URL}/borrows`, {
          credentials: "include",
          cache: "no-store",
          signal,
        }),
      ]);

      const [bookData, borrowData] = await Promise.all([
        bookResponse.json(),
        borrowResponse.json(),
      ]);

      if (!bookResponse.ok || !bookData.success) {
        throw new Error(bookData.message || "বইয়ের তথ্য লোড করা যায়নি।");
      }

      if (!borrowResponse.ok || !borrowData.success) {
        throw new Error(
          borrowData.message || "Borrow information লোড করা যায়নি।"
        );
      }

      setBook(bookData.book as Book);

      const borrows: Borrow[] = borrowData.borrows || [];
      const existingBorrow =
        borrows.find((borrow) => String(borrow.bookId) === String(bookId)) ||
        null;

      setActiveBorrow(existingBorrow);
    },
    [bookId]
  );

  useEffect(() => {
    if (isPending) return;

    if (!session) {
      router.replace(
        `/login?callbackUrl=${encodeURIComponent(`/books/${bookId}`)}`
      );
      return;
    }

    const controller = new AbortController();

    async function load() {
      try {
        setLoading(true);
        setError("");
        await fetchDetails(controller.signal);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(
          err instanceof Error ? err.message : "তথ্য লোড করতে সমস্যা হয়েছে।"
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void load();
    return () => controller.abort();
  }, [bookId, session, isPending, router, fetchDetails]);

  async function handleConfirmBorrow() {
    if (!book || !user?.email) {
      setActionError("User information পাওয়া যায়নি। আবার login করো।");
      return;
    }

    if (activeBorrow) {
      setActionError("তুমি ইতোমধ্যে এই বইটি borrow করেছ।");
      return;
    }

    if (book.availableCopies <= 0) {
      setActionError("এই মুহূর্তে বইটির কোনো copy available নেই।");
      return;
    }

    if (returnDate < borrowDate) {
      setActionError("Return date borrow date-এর আগে হতে পারবে না।");
      return;
    }

    try {
      setBorrowing(true);
      setActionError("");
      setSuccessMessage("");

      const response = await fetch(`${SERVER_URL}/borrows`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId: book._id,
          borrowDate,
          returnDate,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "বই borrow করা যায়নি।");
      }

      // Fetch the borrow record created by the server.
      const borrowResponse = await fetch(`${SERVER_URL}/borrows`, {
        credentials: "include",
        cache: "no-store",
      });

      const borrowData = await borrowResponse.json();

      if (!borrowResponse.ok || !borrowData.success) {
        throw new Error(
          borrowData.message ||
            "Borrow হয়েছে, কিন্তু updated information পাওয়া যায়নি। পেজ refresh করো।"
        );
      }

      const borrows: Borrow[] = borrowData.borrows || [];
      const newBorrow =
        borrows.find((borrow) => String(borrow.bookId) === String(book._id)) ||
        null;

      if (!newBorrow) {
        throw new Error(
          "Borrow record পাওয়া যায়নি। পেজ refresh করে দেখো।"
        );
      }

      setActiveBorrow(newBorrow);
      setBook((currentBook) =>
        currentBook
          ? {
              ...currentBook,
              availableCopies: Math.max(0, currentBook.availableCopies - 1),
            }
          : currentBook
      );

      setBorrowModalOpen(false);
      setSuccessMessage("বইটি সফলভাবে borrow করা হয়েছে।");
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Borrow করতে সমস্যা হয়েছে।"
      );
    } finally {
      setBorrowing(false);
    }
  }

  async function handleReturnBook() {
    if (!activeBorrow) return;

    try {
      setReturning(true);
      setActionError("");
      setSuccessMessage("");

      const response = await fetch(
        `${SERVER_URL}/borrows/${activeBorrow._id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "বই return করা যায়নি।");
      }

      setActiveBorrow(null);
      setBook((currentBook) =>
        currentBook
          ? {
              ...currentBook,
              availableCopies: Math.min(
                currentBook.totalCopies,
                currentBook.availableCopies + 1
              ),
            }
          : currentBook
      );

      setSuccessMessage("বইটি সফলভাবে return করা হয়েছে।");
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "বই return করতে সমস্যা হয়েছে।"
      );
    } finally {
      setReturning(false);
    }
  }

  if (isPending || loading) {
    return <BookDetailsLoading />;
  }

  if (!session) {
    return <BookDetailsLoading />;
  }

  if (error || !book) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#f7f5ef] px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="mb-3 text-2xl">📚</p>
          <h1 className="mb-2 text-xl font-bold text-[#1d4735]">
            বইটি পাওয়া যায়নি
          </h1>
          <p className="mb-6 break-words text-sm text-gray-600">
            {error || "এই বইয়ের তথ্য পাওয়া যাচ্ছে না।"}
          </p>
          <Link
            href="/books"
            className="inline-flex rounded-lg bg-[#1d4735] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#153527]"
          >
            সব বই দেখুন
          </Link>
        </div>
      </main>
    );
  }

  const isAvailable = book.availableCopies > 0;
  const isBorrowedByUser = Boolean(activeBorrow);

  return (
    <main className="min-h-screen bg-[#f7f5ef] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/books"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[#1d4735] transition hover:text-[#b58b35]"
        >
          <span aria-hidden="true">←</span>
          Back to all books
        </Link>

        {successMessage && (
          <div
            role="status"
            className="mb-6 rounded-xl bg-green-100 px-4 py-3 text-sm font-medium text-green-800"
          >
            {successMessage}
          </div>
        )}

        {actionError && !borrowModalOpen && (
          <div
            role="alert"
            className="mb-6 rounded-xl bg-red-100 px-4 py-3 text-sm font-medium text-red-700"
          >
            {actionError}
          </div>
        )}

        <section className="grid gap-8 rounded-3xl bg-white p-5 shadow-sm sm:p-8 lg:grid-cols-[350px_1fr] lg:gap-12">
          <div className="flex items-start justify-center">
            <div className="w-full max-w-[280px] overflow-hidden rounded-2xl bg-[#f0eee7] shadow-md">
              {book.image ? (
                <img
                  src={book.image}
                  alt={book.title}
                  className="aspect-[3/4] w-full object-cover"
                />
              ) : (
                <div className="flex aspect-[3/4] items-center justify-center text-6xl">
                  📖
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <span className="mb-4 w-fit rounded-full bg-[#e8efe9] px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#1d4735]">
              {book.category}
            </span>

            <h1 className="mb-3 text-3xl font-bold leading-tight text-[#1d4735] sm:text-4xl">
              {book.title}
            </h1>

            <p className="mb-6 text-lg text-gray-600">
              by <span className="font-semibold">{book.author}</span>
            </p>

            <div className="mb-7 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-[#f7f5ef] p-4">
                <p className="mb-1 text-xs text-gray-500">Total Copies</p>
                <p className="text-2xl font-bold text-[#1d4735]">
                  {book.totalCopies}
                </p>
              </div>

              <div className="rounded-xl bg-[#f7f5ef] p-4">
                <p className="mb-1 text-xs text-gray-500">Available Copies</p>
                <p className="text-2xl font-bold text-[#1d4735]">
                  {book.availableCopies}
                </p>
              </div>
            </div>

            <div className="mb-7">
              <h2 className="mb-3 text-lg font-bold text-[#1d4735]">
                About this book
              </h2>
              <p className="whitespace-pre-line text-sm leading-7 text-gray-600 sm:text-base">
                {book.description || "এই বইয়ের কোনো বিবরণ দেওয়া হয়নি।"}
              </p>
            </div>

            <div className="mb-6">
              <span
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                  isAvailable
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-700"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    isAvailable ? "bg-green-600" : "bg-red-600"
                  }`}
                />
                {isAvailable
                  ? "Available for borrowing"
                  : "Currently unavailable"}
              </span>
            </div>

            <div className="mb-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={!isAvailable || isBorrowedByUser || borrowing}
                onClick={() => {
                  setActionError("");
                  setBorrowModalOpen(true);
                }}
                className="rounded-xl bg-[#1d4735] px-6 py-3.5 font-semibold text-white transition hover:bg-[#153527] disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {isBorrowedByUser
                  ? "Already Borrowed"
                  : isAvailable
                    ? "Borrow This Book"
                    : "Currently Unavailable"}
              </button>

              {isBorrowedByUser && (
                <button
                  type="button"
                  disabled={returning}
                  onClick={handleReturnBook}
                  className="rounded-xl border border-red-200 bg-red-50 px-6 py-3.5 font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {returning ? "Returning..." : "Return Book"}
                </button>
              )}
            </div>

            {activeBorrow && (
              <div className="mb-8 rounded-xl border border-[#e8efe9] bg-[#f7f5ef] p-4">
                <p className="mb-2 font-semibold text-[#1d4735]">
                  You have borrowed this book.
                </p>
                <div className="grid gap-2 text-sm text-gray-600 sm:grid-cols-2">
                  <p>
                    Borrow Date:{" "}
                    <span className="font-medium text-gray-800">
                      {activeBorrow.borrowDate}
                    </span>
                  </p>
                  <p>
                    Return Date:{" "}
                    <span className="font-medium text-gray-800">
                      {activeBorrow.returnDate}
                    </span>
                  </p>
                </div>
              </div>
            )}

            {book.contributorName && (
              <div className="mt-auto border-t border-gray-100 pt-5">
                <p className="text-xs text-gray-500">Added by</p>
                <p className="mt-1 font-semibold text-[#1d4735]">
                  {book.contributorName}
                </p>
              </div>
            )}
          </div>
        </section>

        {borrowModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6"
            onClick={() => {
              if (!borrowing) setBorrowModalOpen(false);
            }}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="borrow-modal-title"
              className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl sm:p-8"
              onClick={(event: MouseEvent<HTMLElement>) =>
                event.stopPropagation()
              }
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <h2
                    id="borrow-modal-title"
                    className="text-2xl font-bold text-[#1d4735]"
                  >
                    Borrow This Book
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Borrowing details confirm করো।
                  </p>
                </div>

                <button
                  type="button"
                  disabled={borrowing}
                  onClick={() => setBorrowModalOpen(false)}
                  aria-label="Close modal"
                  className="rounded-lg px-3 py-1 text-xl text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                >
                  ×
                </button>
              </div>

              <div className="mb-5 rounded-xl bg-[#f7f5ef] p-4">
                <p className="text-xs text-gray-500">Book</p>
                <p className="mt-1 font-semibold text-[#1d4735]">
                  {book.title}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="borrow-user-name"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Your Name
                  </label>
                  <input
                    id="borrow-user-name"
                    value={user?.name || ""}
                    readOnly
                    className="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-600"
                  />
                </div>

                <div>
                  <label
                    htmlFor="borrow-user-email"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Your Email
                  </label>
                  <input
                    id="borrow-user-email"
                    type="email"
                    value={user?.email || ""}
                    readOnly
                    className="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-600"
                  />
                </div>

                <div>
                  <label
                    htmlFor="borrow-date"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Borrow Date
                  </label>
                  <input
                    id="borrow-date"
                    type="date"
                    value={borrowDate}
                    min={getTodayDate()}
                    onChange={(event) => setBorrowDate(event.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="return-date"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Return Date
                  </label>
                  <input
                    id="return-date"
                    type="date"
                    value={returnDate}
                    min={borrowDate}
                    onChange={(event) => setReturnDate(event.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm"
                  />
                </div>
              </div>

              {actionError && (
                <p
                  role="alert"
                  className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {actionError}
                </p>
              )}

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={borrowing}
                  onClick={() => setBorrowModalOpen(false)}
                  className="rounded-lg border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={
                    borrowing ||
                    !isAvailable ||
                    !user?.email ||
                    returnDate < borrowDate
                  }
                  onClick={handleConfirmBorrow}
                  className="rounded-lg bg-[#1d4735] px-5 py-3 text-sm font-semibold text-white hover:bg-[#153527] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {borrowing ? "Processing..." : "Confirm Borrow"}
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
