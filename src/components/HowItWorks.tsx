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
      "Explore books across different genres and discover stories worth your time.",
    icon: Search,
  },
  {
    number: "02",
    title: "Share Your Collection",
    description:
      "Add a book to BookNook and let another reader enjoy its story.",
    icon: BookPlus,
  },
  {
    number: "03",
    title: "Borrow & Enjoy",
    description:
      "Choose a book, borrow it, and begin your next reading adventure.",
    icon: BookOpen,
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-[#f8f7f2] px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Section Heading */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="h-px w-7 bg-[#b99b5d]" />

              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#64836e]">
                The BookNook Experience
              </p>
            </div>

            <h2 className="text-3xl font-bold leading-tight tracking-tight text-[#173c2d] sm:text-4xl">
              Reading Made
              <span className="ml-2 font-serif font-normal italic text-[#a18443]">
                Simple.
              </span>
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500">
              Discover books, share your collection, and connect with
              a community of readers in just a few steps.
            </p>
          </div>

          <Link
            href="/books"
            className="inline-flex w-fit items-center gap-2 rounded-lg bg-[#1c352b] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#245c45]"
          >
            Explore Library
            <ArrowUpRight size={16} />
          </Link>
        </div>

        {/* Step Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <article
                key={step.number}
                className="group relative overflow-hidden rounded-2xl border border-[#e5e6dc] bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-[#d8c58f] hover:shadow-lg hover:shadow-[#1c352b]/5 sm:p-6"
              >
                {/* Step Number */}
                <span className="absolute right-4 top-3 font-serif text-5xl font-bold text-[#1c352b]/[0.04] transition group-hover:text-[#b99b5d]/15">
                  {step.number}
                </span>

                {/* Icon */}
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[#edf2eb] text-[#245c45] transition group-hover:bg-[#1c352b] group-hover:text-[#dfc58d]">
                  <Icon size={21} strokeWidth={1.8} />
                </div>

                {/* Content */}
                <h3 className="text-base font-bold text-[#173c2d] transition group-hover:text-[#a18443] sm:text-lg">
                  {step.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  {step.description}
                </p>

                {/* Bottom Accent */}
                <div className="mt-5 h-1 w-8 rounded-full bg-[#dfc58d] transition-all duration-300 group-hover:w-14" />
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}