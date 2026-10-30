
"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { BookOpen, Menu, X } from "lucide-react";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "All Books", href: "/books" },
  { name: "Add Book", href: "/add-book" },
  { name: "My Books", href: "/my-books" },
  { name: "My Borrows", href: "/my-borrows" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <BookOpen size={23} />
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight text-primary">
              BookNook
            </h1>
            <p className="text-[9px] tracking-[1.5px] text-muted-foreground">
              YOUR LITTLE CORNER OF BOOKS
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-base transition-colors hover:text-primary ${
                isActive(link.href)
                  ? "font-bold text-primary"
                  : "font-medium text-foreground/75"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Auth Buttons */}
        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-base font-semibold text-primary transition hover:bg-primary/5"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="rounded-lg bg-primary px-5 py-2.5 text-base font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-lg p-2 text-primary hover:bg-muted lg:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={isOpen}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="border-t border-border bg-background px-5 py-5 lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`rounded-lg px-4 py-3 text-sm transition ${
                  isActive(link.href)
                    ? "bg-primary/5 font-bold text-primary"
                    : "font-medium text-foreground hover:bg-muted hover:text-primary"
                }`}
              >
                {link.name}
              </Link>
            ))}

            <div className="mt-3 flex gap-3 border-t border-border pt-4">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="flex-1 rounded-lg border border-border py-3 text-center text-sm font-semibold text-primary"
              >
                Login
              </Link>

              <Link
                href="/register"
                onClick={() => setIsOpen(false)}
                className="flex-1 rounded-lg bg-primary py-3 text-center text-sm font-semibold text-primary-foreground"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
