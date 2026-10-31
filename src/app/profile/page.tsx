
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  UserRound,
  Mail,
  CalendarDays,
  BookOpen,
  LogOut,
  Save,
  Loader2,
  ArrowLeft,
  ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

type ProfileUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  createdAt: Date | string;
};

type ProfileEditorProps = {
  user: ProfileUser;
  refetch: () => Promise<unknown>;
};

export default function ProfilePage() {
  const router = useRouter();

  const { data: session, isPending, refetch } =
    authClient.useSession();

  const user = session?.user;

  useEffect(() => {
    if (!isPending && !user) {
      router.replace("/login");
    }
  }, [isPending, user, router]);

  if (isPending || !user) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="animate-spin" size={30} />
      </div>
    );
  }

  return (
    <ProfileEditor
      key={user.id}
      user={user}
      refetch={refetch}
    />
  );
}

function ProfileEditor({ user, refetch }: ProfileEditorProps) {
  const router = useRouter();

  const [name, setName] = useState(user.name || "");
  const [imageUrl, setImageUrl] = useState(user.image || "");
  const [imageError, setImageError] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Save profile
  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Name cannot be empty.");
      return;
    }

    const trimmedImageUrl = imageUrl.trim();

    // Validate image URL
    if (trimmedImageUrl) {
      try {
        const parsedUrl = new URL(trimmedImageUrl);

        if (
          parsedUrl.protocol !== "http:" &&
          parsedUrl.protocol !== "https:"
        ) {
          throw new Error("Invalid URL");
        }
      } catch {
        toast.error("Please enter a valid image URL.");
        return;
      }
    }

    setIsSaving(true);

    try {
      const { error } = await authClient.updateUser({
        name: name.trim(),
        image: trimmedImageUrl || null,
      });

      if (error) {
        throw new Error(error.message || "Profile update failed.");
      }

      await refetch();

      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Profile update error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      const { error } = await authClient.signOut();

      if (error) {
        throw new Error(error.message || "Logout failed.");
      }

      toast.success("Logged out successfully!");

      router.replace("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-3xl">

        {/* Back to Home */}
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-primary"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        {/* Header */}
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium uppercase tracking-widest text-primary">
            Account Settings
          </p>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            My Profile
          </h1>

          <p className="mt-2 text-muted-foreground">
            Manage your personal information and account.
          </p>
        </div>

        {/* Profile Card */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">

          {/* Cover */}
          <div className="h-32 bg-linear-to-r from-primary/20 via-primary/10 to-transparent" />

          <div className="px-6 pb-8 sm:px-8">

            {/* Avatar */}
            <div className="-mt-14 mb-8 flex flex-col items-center sm:flex-row sm:items-end sm:gap-5">

              <div className="h-28 w-28 shrink-0 overflow-hidden rounded-full border-4 border-card bg-muted shadow-md">
                {imageUrl.trim() && !imageError ? (
                  <Image
                    src={imageUrl.trim()}
                    alt="Profile picture"
                    width={112}
                    height={112}
                    unoptimized
                    className="h-full w-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <UserRound
                      size={42}
                      className="text-muted-foreground"
                    />
                  </div>
                )}
              </div>

              <div className="mt-3 text-center sm:mb-2 sm:mt-0 sm:text-left">
                <h2 className="text-xl font-semibold">
                  {user.name || "BookNook User"}
                </h2>

                <p className="text-sm text-muted-foreground">
                  {user.email}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Your profile picture is managed through an image URL.
                </p>
              </div>
            </div>

            {/* Profile Form */}
            <div className="space-y-6">

              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium"
                >
                  Full Name
                </label>

                <div className="relative">
                  <UserRound
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />

                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </div>
              </div>

              {/* Profile Picture URL */}
              <div>
                <label
                  htmlFor="imageUrl"
                  className="mb-2 block text-sm font-medium"
                >
                  Profile Picture URL
                </label>

                <div className="relative">
                  <ImageIcon
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />

                  <input
                    id="imageUrl"
                    type="url"
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      setImageError(false);
                    }}
                    placeholder="https://example.com/profile.jpg"
                    className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </div>

                <p className="mt-2 text-xs text-muted-foreground">
                  Paste a direct image URL. Supported formats include JPG,
                  PNG and WebP.
                </p>

                {imageError && imageUrl.trim() && (
                  <p className="mt-2 text-xs text-red-500">
                    Could not load this image. Please check the URL.
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium"
                >
                  Email Address
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />

                  <input
                    id="email"
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full cursor-not-allowed rounded-xl border border-border bg-muted py-3 pl-10 pr-4 text-sm text-muted-foreground outline-none"
                  />
                </div>

                <p className="mt-2 text-xs text-muted-foreground">
                  Email address cannot be changed here.
                </p>
              </div>

              {/* Account Information */}
              <div className="rounded-xl border border-border bg-background p-4">
                <h3 className="mb-4 font-semibold">
                  Account Information
                </h3>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <CalendarDays size={19} />
                  </div>

                  <div>
                    <p className="text-sm font-medium">
                      Member Since
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }
                          )
                        : "Not available"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || !name.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}
              </button>

            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">

          {/* My Books */}
          <Link
            href="/my-books"
            className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition hover:border-primary/50"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <BookOpen size={21} />
            </div>

            <div>
              <h3 className="font-semibold">My Books</h3>
              <p className="text-sm text-muted-foreground">
                Manage your books
              </p>
            </div>
          </Link>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 text-left transition hover:border-red-500/50"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
              {isLoggingOut ? (
                <Loader2 size={21} className="animate-spin" />
              ) : (
                <LogOut size={21} />
              )}
            </div>

            <div>
              <h3 className="font-semibold">Logout</h3>
              <p className="text-sm text-muted-foreground">
                Sign out of your account
              </p>
            </div>
          </button>

        </div>
      </div>
    </main>
  );
}
