
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import {
  FaFacebookF,
  FaInstagram,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";

const footerColumns = [
  {
    title: "About Us",
    links: [
      { name: "Our Story", href: "/#about" },
      { name: "How It Works", href: "/#how-it-works" },
      { name: "Explore Books", href: "/books" },
      { name: "Contact Us", href: "mailto:hello@booknook.com" },
    ],
  },
  {
    title: "Explore",
    links: [
      { name: "All Books", href: "/books" },
      { name: "Latest Books", href: "/#latest-books" },
      { name: "Add a Book", href: "/add-book" },
      { name: "My Library", href: "/my-books" },
    ],
  },
  {
    title: "Features",
    links: [
      { name: "Book Collection", href: "/books" },
      { name: "My Books", href: "/my-books" },
      { name: "My Borrows", href: "/my-borrows" },
      { name: "Borrow Books", href: "/books" },
    ],
  },
];

const socialLinks = [
  {
    name: "Instagram",
    icon: FaInstagram,
    href: "https://www.instagram.com/",
  },
  {
    name: "Facebook",
    icon: FaFacebookF,
    href: "https://www.facebook.com/",
  },
  {
    name: "X",
    icon: FaXTwitter,
    href: "https://x.com/",
  },
  {
    name: "YouTube",
    icon: FaYoutube,
    href: "https://www.youtube.com/",
  },
];

async function CopyrightYear() {
  await connection();
  return new Date().getFullYear();
}

export default function Footer() {
  return (
    <footer className="bg-[#1c352b] text-white">
      <div className="mx-auto max-w-360 px-6 pb-8 pt-16 md:px-12 lg:px-16 lg:pt-20">

        {/* Main Footer */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] lg:gap-16">

          {/* Brand Section */}
          <div className="max-w-md">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#D6B878] text-[#102F38]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-8 w-8"
                >
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
                  <path d="M8 7h8M8 11h8" />
                </svg>
              </div>

              <span className="text-3xl font-bold tracking-tight">
                BookNook
              </span>
            </Link>

            <p className="mt-7 max-w-108 text-[15px] leading-7 text-white/70">
              Your little corner of books. Discover new stories,
              explore different worlds, and find your next favorite
              read. Every book has a story waiting for you.
            </p>

            {/* Social Links */}
            <div className="mt-8 flex items-center gap-6">
              {socialLinks.map((social) => {
                const Icon = social.icon;

                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    className="text-white/85 transition-all duration-200 hover:-translate-y-1 hover:text-[#D6B878]"
                  >
                    <Icon size={21} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Link Columns */}
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="mb-7 text-base font-semibold tracking-wide">
                {column.title}
              </h3>

              <ul className="space-y-5">
                {column.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-[15px] text-white/70 transition-colors duration-200 hover:text-[#D6B878]"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Footer */}
        <div className="mt-12 flex flex-col items-start justify-between gap-5 border-t border-white/15 pt-7 md:flex-row md:items-center">

          <p className="text-sm text-white/65">
            Copyright ©{" "}
            <Suspense fallback={<span aria-hidden="true" className="inline-block w-[2.5ch]" />}>
              <CopyrightYear />
            </Suspense>{" "}
            BookNook.
            All rights reserved.
          </p>

          <div className="flex flex-wrap items-center gap-7">
            <a
              href="mailto:hello@booknook.com"
              className="text-sm text-white/65 transition hover:text-[#D6B878]"
            >
              Contact
            </a>

            <Link
              href="/books"
              className="text-sm text-white/65 transition hover:text-[#D6B878]"
            >
              Browse Library
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
