
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  Menu,
  X,
  UserRound,
  ChevronDown,
  LogOut,
  BookMarked,
  UserCircle,
} from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "All Books", href: "/books" },
  { name: "Add Book", href: "/add-book" },
  { name: "My Books", href: "/my-books" },
  { name: "My Borrows", href: "/my-borrows" },
];

const subscribeToNothing = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

type ProfileMenuProps = {
  userName: string | null | undefined;
  userEmail: string | undefined;
  userImage: string | null | undefined;
  isProfileOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onLogout: () => Promise<void>;
};

function ProfileMenu({
  userName,
  userEmail,
  userImage,
  isProfileOpen,
  onToggle,
  onClose,
  onLogout,
}: ProfileMenuProps) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        aria-label="Open profile menu"
        aria-expanded={isProfileOpen}
        className="flex items-center gap-2 rounded-full border border-border p-1.5 transition hover:bg-muted"
      >
        {userImage ? (
          <Image
            src={userImage}
            alt={userName || "Profile"}
            width={36}
            height={36}
            unoptimized
            className="h-9 w-9 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UserRound size={21} />
          </div>
        )}

        <ChevronDown
          size={16}
          className={`mr-1 text-muted-foreground transition-transform ${
            isProfileOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isProfileOpen && (
        <div className="absolute right-0 top-14 z-50 w-64 overflow-hidden rounded-xl border border-border bg-background shadow-lg">
          <div className="border-b border-border px-4 py-4">
            <p className="truncate text-sm font-semibold text-foreground">
              {userName || "BookNook User"}
            </p>
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {userEmail}
            </p>
          </div>

          <div className="p-2">
            <Link
              href="/profile"
              onClick={onClose}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition hover:bg-muted"
            >
              <UserCircle size={18} />
              My Profile
            </Link>

            <Link
              href="/my-books"
              onClick={onClose}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition hover:bg-muted"
            >
              <BookMarked size={18} />
              My Books
            </Link>

            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-600 transition hover:bg-red-50"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const isMounted = useSyncExternalStore(
    subscribeToNothing,
    getClientSnapshot,
    getServerSnapshot,
  );

  const { data: session, isPending } = authClient.useSession();

  const user = session?.user;
  const isAuthPending = !isMounted || isPending;

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const handleLogout = async () => {
    try {
      const { error } = await authClient.signOut();

      if (error) {
        toast.error(error.message || "Failed to logout.");
        return;
      }

      setIsProfileOpen(false);
      setIsOpen(false);

      toast.success("Logged out successfully.");

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Something went wrong.");
    }
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

        {/* Desktop Authentication */}
        <div className="hidden items-center gap-3 lg:flex">
          {isAuthPending ? (
            <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
          ) : user ? (
            <ProfileMenu
              userName={user.name}
              userEmail={user.email}
              userImage={user.image}
              isProfileOpen={isProfileOpen}
              onToggle={() => setIsProfileOpen((prev) => !prev)}
              onClose={() => setIsProfileOpen(false)}
              onLogout={handleLogout}
            />
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-4 py-2 text-base font-semibold text-primary transition hover:bg-primary/5"
              >
                Login
              </Link>

              <Link
                href="/signup"
                className="rounded-lg bg-primary px-5 py-2.5 text-base font-semibold text-primary-foreground transition hover:opacity-90"
              >
                Get Started
              </Link>
            </>
          )}
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

            <div className="mt-3 border-t border-border pt-4">
              {isAuthPending ? (
                <div className="h-10 animate-pulse rounded-lg bg-muted" />
              ) : user ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 px-3 py-2">
                    {user.image ? (
                      <Image
                        src={user.image}
                        alt={user.name || "Profile"}
                        width={40}
                        height={40}
                        unoptimized
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <UserRound size={21} />
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {user.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm hover:bg-muted"
                  >
                    <UserCircle size={18} />
                    My Profile
                  </Link>

                  <Link
                    href="/my-books"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm hover:bg-muted"
                  >
                    <BookMarked size={18} />
                    My Books
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 rounded-lg border border-border py-3 text-center text-sm font-semibold text-primary"
                  >
                    Login
                  </Link>

                  <Link
                    href="/signup"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 rounded-lg bg-primary py-3 text-center text-sm font-semibold text-primary-foreground"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
