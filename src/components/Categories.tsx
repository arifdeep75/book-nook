
import Link from "next/link";
import {
  ArrowUpRight,
  Atom,
  BookOpen,
  Landmark,
  Layers3,
  Sparkles,
} from "lucide-react";

const categories = [
  {
    name: "Fiction",
    description: "Stories and imagination",
    icon: BookOpen,
    href: "/books?category=Fiction",
  },
  {
    name: "Science",
    description: "Discover how things work",
    icon: Atom,
    href: "/books?category=Science",
  },
  {
    name: "History",
    description: "Stories from the past",
    icon: Landmark,
    href: "/books?category=History",
  },
  {
    name: "Kids",
    description: "Books for young readers",
    icon: Sparkles,
    href: "/books?category=Kids",
  },
  {
    name: "Others",
    description: "Explore something different",
    icon: Layers3,
    href: "/books?category=Others",
  },
];

export default function Categories() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-12 lg:px-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
            Browse by genre
          </p>

          <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Explore Categories
          </h2>

          <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
            Find your next favorite book from our collection.
          </p>
        </div>

        <Link
          href="/books"
          className="mb-1 inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary transition hover:gap-2.5"
        >
          All Books
          <ArrowUpRight size={16} />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const Icon = category.icon;

          return (
            <Link
              key={category.name}
              href={category.href}
              className="group flex items-center gap-4 rounded-xl border border-border bg-card px-4 py-4 transition hover:border-primary/30 hover:bg-primary/5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon size={20} strokeWidth={1.8} />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-base font-semibold text-foreground transition group-hover:text-primary">
                  {category.name}
                </h3>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {category.description}
                </p>
              </div>

              <ArrowUpRight
                size={17}
                className="shrink-0 text-muted-foreground transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
