
"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useState,
  type MouseEvent,
} from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";
import { authenticatedFetch } from "@/lib/authenticated-fetch";

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
          Loading book information...
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
  const userEmail = user?.email;

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

  // Update the document title.
  useEffect(() => {
    document.title = book
      ? `BookNook | ${book.title}`
      : "BookNook | Book Details";
  }, [book]);


  const fetchDetails = useCallback(
    async (signal?: AbortSignal) => {
      if (!userEmail) {
        throw new Error("User email is unavailable.");
      }

      const bookResponse = await fetch(
        `${SERVER_URL}/books/${bookId}`,
        { signal }
      );

      const bookData = await bookResponse.json();

      if (!bookResponse.ok || !bookData.success) {
        throw new Error(
          bookData.message || "Failed to load book information."
        );
      }

      const borrowResponse = await authenticatedFetch(
        `${SERVER_URL}/borrows?email=${encodeURIComponent(userEmail)}`,
        {
          cache: "no-store",
          signal,
        }
      );

      const borrowData = await borrowResponse.json();

      if (!borrowResponse.ok || !borrowData.success) {
        throw new Error(
          borrowData.message || "Failed to load borrowing information."
        );
      }

      setBook(bookData.book as Book);

      const borrows: Borrow[] = borrowData.borrows || [];

      const existingBorrow =
        borrows.find(
          (borrow) => String(borrow.bookId) === String(bookId)
        ) || null;

      setActiveBorrow(existingBorrow);
    },
    [bookId, userEmail]
  );

  // Check authentication and load page data.
  useEffect(() => {
    if (isPending) return;

    if (!session) {
      router.replace(
        `/login?callbackUrl=${encodeURIComponent(`/books/${bookId}`)}`
      );
      return;
    }

    if (!userEmail) return;

    const controller = new AbortController();

    async function load() {
      try {
        setLoading(true);
        setError("");

        await fetchDetails(controller.signal);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading the page."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => controller.abort();
  }, [
    bookId,
    session,
    isPending,
    router,
    userEmail,
    fetchDetails,
  ]);

  // Borrow a book.
  async function handleConfirmBorrow() {
    if (!book || !user?.email) {
      setActionError("User information is unavailable. Please log in again.");
      return;
    }

    if (activeBorrow) {
      setActionError("You have already borrowed this book.");
      return;
    }

    if (book.availableCopies <= 0) {
      setActionError("No copies of this book are currently available.");
      return;
    }

    if (returnDate < borrowDate) {
      setActionError("Return date cannot be earlier than borrow date.");
      return;
    }

    try {
      setBorrowing(true);
      setActionError("");
      setSuccessMessage("");

      const response = await authenticatedFetch(
        `${SERVER_URL}/borrows`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bookId: book._id,
            userEmail: user.email,
            borrowDate,
            returnDate,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to borrow this book.");
      }

      // Reload the borrow record.
      const borrowResponse = await authenticatedFetch(
        `${SERVER_URL}/borrows?email=${encodeURIComponent(user.email)}`,
        {
          cache: "no-store",
        }
      );

      const borrowData = await borrowResponse.json();

      if (!borrowResponse.ok || !borrowData.success) {
        throw new Error(
          borrowData.message ||
            "The book was borrowed, but updated information could not be loaded. Please refresh the page."
        );
      }

      const borrows: Borrow[] = borrowData.borrows || [];

      const newBorrow =
        borrows.find(
          (borrow) => String(borrow.bookId) === String(book._id)
        ) || null;

      if (!newBorrow) {
        throw new Error(
          "Borrow record not found. Please refresh the page."
        );
      }

      setActiveBorrow(newBorrow);

      setBook((currentBook) =>
        currentBook
          ? {
              ...currentBook,
              availableCopies: Math.max(
                0,
                currentBook.availableCopies - 1
              ),
            }
          : currentBook
      );

      setBorrowModalOpen(false);
      setSuccessMessage("Book borrowed successfully.");
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Something went wrong while borrowing the book."
      );
    } finally {
      setBorrowing(false);
    }
  }

  // Return a borrowed book.
  async function handleReturnBook() {
    if (!activeBorrow) return;

    try {
      setReturning(true);
      setActionError("");
      setSuccessMessage("");

      const response = await authenticatedFetch(
        `${SERVER_URL}/borrows/${activeBorrow._id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to return the book.");
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

      setSuccessMessage("Book returned successfully.");
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Something went wrong while returning the book."
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
            Book Not Found
          </h1>

          <p className="mb-6 wrap-break-word text-sm text-gray-600">
            {error || "The requested book information is unavailable."}
          </p>

          <Link
            href="/books"
            className="inline-flex rounded-lg bg-[#1d4735] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#153527]"
          >
            Browse All Books
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
          Back to All Books
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
            <div className="relative aspect-3/4 w-full max-w-70 overflow-hidden rounded-2xl bg-[#f0eee7] shadow-md">
              {book.image ? (
                <Image
                  src={book.image}
                  alt={book.title}
                  fill
                  sizes="280px"
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-6xl">
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
                <p className="mb-1 text-xs text-gray-500">
                  Available Copies
                </p>
                <p className="text-2xl font-bold text-[#1d4735]">
                  {book.availableCopies}
                </p>
              </div>
            </div>

            <div className="mb-7">
              <h2 className="mb-3 text-lg font-bold text-[#1d4735]">
                About This Book
              </h2>

              <p className="whitespace-pre-line text-sm leading-7 text-gray-600 sm:text-base">
                {book.description || "No description is available."}
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
                  ? "Available for Borrowing"
                  : "Currently Unavailable"}
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
                <p className="text-xs text-gray-500">Added By</p>

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
                    Confirm your borrowing details.
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
