
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  Search,
  ArrowUpRight,
  Loader2,
  Library,
} from "lucide-react";

const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

interface Book {
  _id: string;
  title: string;
  author: string;
  category: string;
  image: string;
  description: string;
  totalCopies: number;
  availableCopies: number;
}

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  // Page Title
  useEffect(() => {
    document.title = "BookNook | All Books";
  }, []);

  // Fetch Books
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch(`${SERVER_URL}/books`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to fetch books");
        }

        setBooks(data.books || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const categories = [
    "All",
    ...new Set(books.map((book) => book.category)),
  ];

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.author.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      category === "All" || book.category === category;

    return matchesSearch && matchesCategory;
  });

  return (
    <main className="min-h-screen bg-[#F2F1E9] text-[#24352D]">
      {/* Hero Section */}
      <section className="px-4 pb-6 pt-6 sm:px-8 sm:pb-8 sm:pt-8">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-3xl bg-[#173F32] px-6 py-7 shadow-lg sm:px-9 sm:py-9 lg:px-12">
            {/* Decorative Circles */}
            <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full border-35px border-white/5" />
            <div className="absolute -bottom-36 right-36 h-72 w-72 rounded-full border-35px border-[#D8BD7A]/10" />

            {/* Hero Content */}
            <div className="relative z-10 max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#D8BD7A]/30 bg-white/5 px-4 py-2">
                <BookOpen className="h-4 w-4 text-[#D8BD7A]" />

                <span className="text-xs font-semibold tracking-[0.18em] text-[#E6D5A8]">
                  WELCOME TO BOOKNOOK
                </span>
              </div>

              <h1 className="font-serif text-3xl font-semibold leading-tight text-[#F7F5ED] sm:text-4xl lg:text-5xl">
                Discover Your
                <br />
                <span className="italic text-[#D8BD7A]">
                  Next Story.
                </span>
              </h1>

              <p className="mt-3 max-w-lg text-sm leading-6 text-[#D5E0D8] sm:text-base">
                Explore a thoughtfully curated collection of books.
                Find inspiration, gain knowledge, and fall in love
                with reading again.
              </p>

              {/* Statistics */}
              <div className="mt-6 flex flex-wrap items-center gap-7">
                <div>
                  <p className="font-serif text-3xl text-[#D8BD7A]">
                    {books.length.toString().padStart(2, "0")}
                  </p>

                  <p className="mt-1 text-[10px] tracking-wider text-white/60 sm:text-xs">
                    TOTAL BOOKS
                  </p>
                </div>

                <div className="h-10 w-px bg-white/20" />

                <div>
                  <p className="font-serif text-3xl text-[#D8BD7A]">
                    {books.reduce(
                      (sum, book) => sum + book.availableCopies,
                      0
                    )}
                  </p>

                  <p className="mt-1 text-[10px] tracking-wider text-white/60 sm:text-xs">
                    AVAILABLE COPIES
                  </p>
                </div>
              </div>
            </div>

            {/* Decorative Icon */}
            <div className="absolute bottom-5 right-8 hidden opacity-10 lg:block">
              <Library
                className="h-44 w-44 text-white"
                strokeWidth={0.8}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Books Collection */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-8">
        {/* Section Header */}
        <div className="mb-7 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#A18443]">
              EXPLORE THE LIBRARY
            </p>

            <h2 className="mt-2 font-serif text-3xl font-semibold text-[#173F32] sm:text-4xl">
              Our Collection
            </h2>

            <p className="mt-2 text-sm text-[#78847A]">
              Find the perfect book for your next reading journey.
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#829087]" />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title or author..."
              className="w-full rounded-xl border border-[#DCE0D5] bg-white px-12 py-3 text-sm text-[#24352D] outline-none transition placeholder:text-[#A0AAA1] focus:border-[#244B3C] focus:ring-2 focus:ring-[#244B3C]/10"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-7 flex flex-wrap gap-2">
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={`rounded-full px-4 py-2 text-xs font-medium transition-all sm:text-sm ${
                category === item
                  ? "bg-[#244B3C] text-white shadow-md shadow-[#244B3C]/15"
                  : "border border-[#D9DED5] bg-white text-[#66756A] hover:border-[#244B3C] hover:text-[#244B3C]"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <Loader2 className="h-9 w-9 animate-spin text-[#244B3C]" />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
            {error}
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="rounded-2xl border border-[#E0E3D9] bg-white px-5 py-16 text-center shadow-sm">
            <BookOpen className="mx-auto mb-4 h-12 w-12 text-[#B9A16A]" />

            <h3 className="font-serif text-2xl text-[#173F32]">
              No books found
            </h3>

            <p className="mt-2 text-sm text-[#78847A]">
              Try another title, author or category.
            </p>
          </div>
        ) : (
          <>
            {/* Result Count */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-[#78847A]">
                Showing{" "}
                <span className="font-semibold text-[#244B3C]">
                  {filteredBooks.length}
                </span>{" "}
                books
              </p>

              <p className="hidden text-xs font-medium tracking-wider text-[#A18443] sm:block">
                STORIES THAT STAY WITH YOU
              </p>
            </div>

            {/* Compact Book Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredBooks.map((book) => (
                <article
                  key={book._id}
                  className="group flex min-w-0 flex-col rounded-xl border border-[#E6E5DA] bg-white p-3 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#D8BD7A] hover:shadow-lg hover:shadow-[#244B3C]/5"
                >
                  {/* Book Cover */}
                  <div className="relative h-44 w-full overflow-hidden rounded-lg bg-[#E9E7DB]">
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
                      <div className="flex h-full items-center justify-center">
                        <BookOpen className="h-12 w-12 text-[#A18443]" />
                      </div>
                    )}
                  </div>

                  {/* Book Details */}
                  <div className="flex min-w-0 flex-1 flex-col py-2">
                    {/* Category & Availability */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="max-w-[55%] truncate rounded-full bg-[#F4F0E3] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#96763A]">
                        {book.category}
                      </span>

                      <span
                        className={`shrink-0 text-[10px] font-semibold ${
                          book.availableCopies > 0
                            ? "text-[#397456]"
                            : "text-red-500"
                        }`}
                      >
                        {book.availableCopies > 0
                          ? "● Available"
                          : "● Unavailable"}
                      </span>
                    </div>

                    {/* Title & Author */}
                    <div className="mt-2">
                      <h3 className="line-clamp-2 min-h-12 font-serif text-base font-semibold leading-snug text-[#173F32] transition group-hover:text-[#A18443]">
                        {book.title}
                      </h3>

                      <p className="mt-1 truncate text-xs font-medium text-[#879187]">
                        by {book.author}
                      </p>
                    </div>

                    {/* Description */}
                    <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-[#7A857C]">
                      {book.description}
                    </p>

                    {/* Copies & Details Button */}
                    <div className="mt-auto flex items-center justify-between gap-2 border-t border-[#EEF0E8] pt-3">
                      <div>
                        <p className="text-[9px] text-[#9AA49A]">
                          AVAILABLE COPIES
                        </p>

                        <p className="mt-0.5 text-sm font-bold text-[#244B3C]">
                          {book.availableCopies}{" "}
                          <span className="font-normal text-[#9AA49A]">
                            / {book.totalCopies}
                          </span>
                        </p>
                      </div>

                      <Link
                        href={`/books/${book._id}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-[#244B3C] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#173F32]"
                      >
                        Details
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
