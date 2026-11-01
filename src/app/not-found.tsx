import Link from "next/link";
import { BookOpen, Home } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-[#f8f7f2] px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#1c352b] text-[#dfc58d]">
          <BookOpen size={36} />
        </div>

        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#a18443]">
          Error 404
        </p>

        <h1 className="mb-3 text-3xl font-bold text-[#1c352b]">
          Page Not Found
        </h1>

        <p className="mb-8 text-sm leading-6 text-[#1c352b]/70">
          Sorry, the page you are looking for doesn&apos;t exist or may have
          been moved.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-[#1c352b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#294b3d]"
        >
          <Home size={18} />
          Back to Home
        </Link>
      </div>
    </main>
  );
}