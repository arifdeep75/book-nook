"use client";

import { useCallback, useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";

const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

type Book = {
  _id: string;
  title: string;
  author: string;
  category: string;
  image: string;
  description: string;
  contributorName: string;
  contributorEmail: string;
  totalCopies: number;
  availableCopies: number;
  addedAt: string;
};

type BookForm = {
  title: string;
  author: string;
  category: string;
  image: string;
  description: string;
  totalCopies: number;
};

const initialForm: BookForm = {
  title: "",
  author: "",
  category: "",
  image: "",
  description: "",
  totalCopies: 1,
};

export default function MyBooksPage() {
  const { data: session, isPending } = authClient.useSession();
  const userEmail = session?.user?.email;

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadedForEmail, setLoadedForEmail] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [form, setForm] = useState<BookForm>(initialForm);
  const [saving, setSaving] = useState(false);

  const [deletingBook, setDeletingBook] = useState<Book | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    document.title = "BookNook | My Books";
  }, []);

  const fetchMyBooks = useCallback(async () => {
    if (!userEmail) {
      throw new Error("Unable to identify your account email.");
    }

    // The public books endpoint returns the collection. The UI filters
    // it for the signed-in contributor; update/delete ownership is enforced
    // separately by the authenticated backend routes.
    const response = await fetch(`${SERVER_URL}/books`, {
      method: "GET",
      cache: "no-store",
    });
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Failed to load books.");
    }

    return (Array.isArray(result.books) ? result.books : []).filter(
      (book: Book) =>
        book.contributorEmail?.toLowerCase() === userEmail.toLowerCase()
    );
  }, [userEmail]);

  useEffect(() => {
    if (isPending || !userEmail) return;

    let active = true;

    fetchMyBooks()
      .then((myBooks) => {
        if (active) {
          setBooks(myBooks);
          setError("");
          setLoadedForEmail(userEmail);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Something went wrong."
          );
          setLoadedForEmail(userEmail);
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
  }, [isPending, userEmail, reloadKey, fetchMyBooks]);

  const handleEdit = (book: Book) => {
    setEditingBook(book);
    setForm({
      title: book.title,
      author: book.author,
      category: book.category,
      image: book.image || "",
      description: book.description,
      totalCopies: book.totalCopies,
    });
    setMessage("");
    setError("");
  };

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: name === "totalCopies" ? Number(value) : value,
    }));
  };

  const handleUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingBook) return;

    if (form.totalCopies < 1) {
      setError("Total copies must be at least 1.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const response = await fetch(`${SERVER_URL}/books/${editingBook._id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update book.");
      }

      setBooks((previous) =>
        previous.map((book) =>
          book._id === editingBook._id
            ? {
                ...book,
                ...form,
                availableCopies:
                  result.book?.availableCopies ?? book.availableCopies,
              }
            : book
        )
      );

      setEditingBook(null);
      setMessage("Book updated successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update book.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingBook) return;

    try {
      setDeleting(true);
      setError("");
      setMessage("");

      const response = await fetch(`${SERVER_URL}/books/${deletingBook._id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to delete book.");
      }

      setBooks((previous) =>
        previous.filter((book) => book._id !== deletingBook._id)
      );

      setDeletingBook(null);
      setMessage("Book deleted successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete book.");
    } finally {
      setDeleting(false);
    }
  };

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

  if (!session?.user) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#f8f7f2] px-5">
        <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <div className="text-5xl">🔒</div>
          <h1 className="mt-4 text-2xl font-bold text-[#173c2d]">
            Login Required
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Please sign in to manage your books.
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

  if (!userEmail) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#f8f7f2] px-5">
        <div
          role="alert"
          className="max-w-md rounded-2xl bg-white p-8 text-center text-sm text-red-700 shadow-sm"
        >
          Unable to identify your account email. Please sign in again.
        </div>
      </main>
    );
  }

  if (loading || loadedForEmail !== userEmail) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#f8f7f2]">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#dce5dc] border-t-[#245c45]" />
          <p className="mt-4 text-sm font-medium text-[#52665a]">
            Loading your books...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f7f2] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#64836e]">
              Your Collection
            </p>
            <h1 className="text-3xl font-bold text-[#173c2d] sm:text-4xl">
              My Books
            </h1>
            <p className="mt-3 text-sm text-gray-500 sm:text-base">
              Manage the books you have contributed to BookNook.
            </p>
          </div>
          <Link
            href="/add-book"
            className="inline-flex w-fit items-center gap-2 rounded-lg bg-[#245c45] px-5 py-3 font-semibold text-white transition hover:bg-[#194632]"
          >
            <span className="text-xl">+</span>
            Add New Book
          </Link>
        </div>

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

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
            <button
              onClick={() => {
                setLoading(true);
                setError("");
                setReloadKey((key) => key + 1);
              }}
              className="ml-3 font-bold underline"
            >
              Try again
            </button>
          </div>
        )}

        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-gray-500">Your contributed books</p>
          <span className="rounded-full bg-[#e5ede5] px-4 py-1.5 text-sm font-bold text-[#245c45]">
            {books.length} {books.length === 1 ? "Book" : "Books"}
          </span>
        </div>

        {books.length === 0 && !error ? (
          <div className="rounded-2xl border border-dashed border-[#cbd8cb] bg-white px-6 py-16 text-center">
            <div className="text-6xl">📚</div>
            <h2 className="mt-5 text-2xl font-bold text-[#173c2d]">
              No Books Yet
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">
              You haven&apos;t contributed any books yet. Add your first book
              and share it with the BookNook community.
            </p>
            <Link
              href="/add-book"
              className="mt-7 inline-block rounded-lg bg-[#245c45] px-6 py-3 font-semibold text-white transition hover:bg-[#194632]"
            >
              Add Your First Book
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {books.map((book) => (
              <article
                key={book._id}
                className="overflow-hidden rounded-2xl border border-[#e8e8df] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative h-60 bg-[#eef1e9]">
                  {book.image ? (
                    <Image
                      src={book.image}
                      alt={book.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-6xl">
                      📖
                    </div>
                  )}
                  <span className="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-[#245c45] shadow">
                    {book.category}
                  </span>
                </div>

                <div className="p-5">
                  <h2 className="line-clamp-1 text-xl font-bold text-[#173c2d]">
                    {book.title}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">by {book.author}</p>
                  <p className="mt-4 line-clamp-2 min-h-10 text-sm leading-5 text-gray-600">
                    {book.description}
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-[#f5f7f2] p-3">
                    <div>
                      <p className="text-xs text-gray-500">Total Copies</p>
                      <p className="mt-1 font-bold text-[#173c2d]">
                        {book.totalCopies}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Available</p>
                      <p className="mt-1 font-bold text-[#245c45]">
                        {book.availableCopies}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex gap-3">
                    <button
                      onClick={() => handleEdit(book)}
                      className="flex-1 rounded-lg border border-[#245c45] py-2.5 text-sm font-semibold text-[#245c45] transition hover:bg-[#245c45] hover:text-white"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeletingBook(book)}
                      className="flex-1 rounded-lg border border-red-200 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-600 hover:text-white"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {editingBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-auto w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#173c2d]">Edit Book</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Update your book information.
                </p>
              </div>
              <button
                onClick={() => setEditingBook(null)}
                disabled={saving}
                className="text-2xl text-gray-400 hover:text-gray-700"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Book Title
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#245c45]"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    Author
                  </label>
                  <input
                    name="author"
                    value={form.author}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#245c45]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    Category
                  </label>
                  <input
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#245c45]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Image URL
                </label>
                <input
                  name="image"
                  type="url"
                  value={form.image}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#245c45]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full resize-none rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#245c45]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Total Copies
                </label>
                <input
                  name="totalCopies"
                  type="number"
                  min="1"
                  value={form.totalCopies}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#245c45]"
                />
                <p className="mt-1 text-xs text-gray-400">
                  You cannot reduce copies below the number currently borrowed.
                </p>
              </div>

              <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setEditingBook(null)}
                  disabled={saving}
                  className="rounded-lg border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-[#245c45] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#194632] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-7 text-center shadow-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-3xl">
              🗑️
            </div>
            <h2 className="mt-5 text-2xl font-bold text-[#173c2d]">
              Delete This Book?
            </h2>
            <p className="mt-3 text-sm leading-6 text-gray-500">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-800">
                {deletingBook.title}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row">
              <button
                onClick={() => setDeletingBook(null)}
                disabled={deleting}
                className="flex-1 rounded-lg border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 rounded-lg bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
