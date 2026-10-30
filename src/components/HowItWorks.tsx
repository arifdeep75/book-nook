
import Link from "next/link";
import {
  Search,
  BookPlus,
  BookOpen,
  ArrowUpRight,
} from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Find Your Next Read",
    description:
      "Explore a growing collection of books across different genres and discover stories worth your time.",
    icon: Search,
  },
  {
    number: "02",
    title: "Share Your Collection",
    description:
      "Have a book worth sharing? Add it to BookNook and let another reader enjoy its story.",
    icon: BookPlus,
  },
  {
    number: "03",
    title: "Borrow & Enjoy",
    description:
      "Choose a book, borrow it from the library, and make time for your next reading adventure.",
    icon: BookOpen,
  },
];

export default function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
      <div className="relative overflow-hidden rounded-2xl bg-[#1c352b] px-6 py-10 text-white sm:px-10 md:px-12 md:py-14 lg:px-14">
        {/* Decorative background */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full border border-white/10" />

        <div className="relative grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          {/* Left content */}
          <div className="flex flex-col justify-center">
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-8 bg-[#dfc58d]" />
              <p className="text-xs font-bold tracking-[3px] text-[#dfc58d]">
                THE BOOKNOOK EXPERIENCE
              </p>
            </div>

            <h2 className="max-w-md text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
              A Better Way to
              <span className="block font-serif font-normal italic text-[#dfc58d]">
                Discover Books.
              </span>
            </h2>

            <p className="mt-6 max-w-md text-sm leading-7 text-white/65 md:text-base">
              Great stories are meant to be shared. BookNook makes it
              simple to discover books, share your collection, and
              connect with a community of readers.
            </p>

            <div className="mt-8">
              <Link
                href="/books"
                className="inline-flex items-center gap-3 rounded-lg bg-[#dfc58d] px-5 py-3 text-sm font-bold text-[#1c352b] transition hover:bg-white"
              >
                Explore the Library
                <ArrowUpRight size={18} />
              </Link>
            </div>

            <p className="mt-10 text-xs font-medium tracking-widest text-white/35">
              READ MORE. DISCOVER MORE.
            </p>
          </div>

          {/* Right steps */}
          <div className="flex flex-col justify-center">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.number}
                  className={`group flex gap-5 py-6 sm:gap-7 ${
                    index !== steps.length - 1
                      ? "border-b border-white/15"
                      : ""
                  }`}
                >
                  <div className="flex shrink-0 flex-col items-center gap-3">
                    <span className="text-sm font-semibold tracking-widest text-[#dfc58d]">
                      {step.number}
                    </span>

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-[#dfc58d] transition group-hover:border-[#dfc58d]/50 group-hover:bg-[#dfc58d]/10">
                      <Icon size={22} strokeWidth={1.7} />
                    </div>
                  </div>

                  <div className="pt-1">
                    <h3 className="text-lg font-semibold tracking-tight text-white transition group-hover:text-[#dfc58d] md:text-xl">
                      {step.title}
                    </h3>

                    <p className="mt-2 max-w-md text-sm leading-7 text-white/55">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
