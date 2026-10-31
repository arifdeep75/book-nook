
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

type Book = {
  _id: string;
  title: string;
  author: string;
  category: string;
  image: string;
};

export default function NewArrivals() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function fetchLatestBooks() {
      try {
        const response = await fetch(`${SERVER_URL}/books/latest`);
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load latest books.");
        }

        if (active) {
          setBooks(result.books || []);
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

    void fetchLatestBooks();

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="bg-[#f8f7f2] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Section Heading */}
        <div className="mb-9 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-[#64836e]">
              Fresh From Our Library
            </p>

            <h2 className="text-3xl font-bold text-[#173c2d] sm:text-4xl">
              New Arrivals
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">
              Discover the latest additions to our collection and find your
              next favorite read.
            </p>
          </div>

          <span className="w-fit rounded-full bg-[#e5ede5] px-4 py-2 text-sm font-semibold text-[#245c45]">
            Latest 6 Books
          </span>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex min-h-64 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-[#dce5dc] border-t-[#245c45]" />
              <p className="mt-4 text-sm font-medium text-[#52665a]">
                Discovering new books...
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-center text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && books.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#cbd8cb] bg-white px-6 py-14 text-center">
            <div className="text-5xl">📚</div>
            <h3 className="mt-4 text-xl font-bold text-[#173c2d]">
              No Books Available Yet
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              New books will appear here when they are added to our library.
            </p>
          </div>
        )}

        {/* Books Grid */}
        {!loading && !error && books.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {books.map((book) => (
              <article
                key={book._id}
                className="group overflow-hidden rounded-2xl border border-[#e8e8df] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                {/* Image */}
                <div className="relative h-64 overflow-hidden bg-[#eef1e9]">
                  {book.image ? (
                    <Image
                      src={book.image}
                      alt={book.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      unoptimized
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-6xl">
                      📖
                    </div>
                  )}

                  <span className="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-[#245c45] shadow-sm">
                    {book.category}
                  </span>
                </div>

                {/* Details */}
                <div className="p-5">
                  <h3 className="line-clamp-1 text-xl font-bold text-[#173c2d] transition group-hover:text-[#245c45]">
                    {book.title}
                  </h3>

                  <p className="mt-2 text-sm text-gray-500">
                    by {book.author}
                  </p>

                  <Link
                    href={`/books/${book._id}`}
                    className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-[#245c45] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#194632]"
                  >
                    View Details
                    <span className="ml-2 transition group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* See All Books */}
        <div className="mt-10 text-center">
          <Link
            href="/books"
            className="inline-flex items-center gap-2 rounded-lg border-2 border-[#245c45] px-7 py-3 font-semibold text-[#245c45] transition hover:bg-[#245c45] hover:text-white"
          >
            See All Books
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
