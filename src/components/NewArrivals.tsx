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
    <section className="bg-[#f8f7f2] px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Section Heading */}
        <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#64836e]">
              Fresh From Our Library
            </p>

            <h2 className="text-3xl font-bold text-[#173c2d] sm:text-4xl">
              New Arrivals
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
              Discover the latest additions to our collection and find your
              next favorite read.
            </p>
          </div>

          <span className="w-fit rounded-full bg-[#e5ede5] px-3 py-1.5 text-xs font-semibold text-[#245c45]">
            Latest 6 Books
          </span>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex min-h-56 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-[#dce5dc] border-t-[#245c45]" />

              <p className="mt-3 text-sm font-medium text-[#52665a]">
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
          <div className="rounded-2xl border border-dashed border-[#cbd8cb] bg-white px-6 py-12 text-center">
            <div className="text-4xl">📚</div>

            <h3 className="mt-3 text-lg font-bold text-[#173c2d]">
              No Books Available Yet
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              New books will appear here when they are added to our library.
            </p>
          </div>
        )}

        {/* Compact Books Grid */}
        {!loading && !error && books.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {books.map((book) => (
              <article
                key={book._id}
                className="group overflow-hidden rounded-xl border border-[#e8e8df] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#d8bd7a] hover:shadow-lg"
              >
                {/* Image */}
                <div className="relative h-44 overflow-hidden bg-[#eef1e9]">
                  {book.image ? (
                    <Image
                      src={book.image}
                      alt={book.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      unoptimized
                      className="object-contain transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-5xl">
                      📖
                    </div>
                  )}

                  <span className="absolute right-2.5 top-2.5 max-w-[70%] truncate rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold text-[#245c45] shadow-sm">
                    {book.category}
                  </span>
                </div>

                {/* Details */}
                <div className="p-3.5">
                  <h3 className="line-clamp-1 text-base font-bold text-[#173c2d] transition group-hover:text-[#245c45]">
                    {book.title}
                  </h3>

                  <p className="mt-1.5 truncate text-xs text-gray-500">
                    by {book.author}
                  </p>

                  <Link
                    href={`/books/${book._id}`}
                    className="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-[#245c45] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#194632]"
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
        <div className="mt-8 text-center">
          <Link
            href="/books"
            className="inline-flex items-center gap-2 rounded-lg border border-2 border-[#245c45] px-6 py-2.5 text-sm font-semibold text-[#245c45] transition hover:bg-[#245c45] hover:text-white"
          >
            See All Books
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}