"use client";
import { Camera, UserRound } from "lucide-react";
import { useRef, useState } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  UserRound,
  Mail,
  CalendarDays,
  Camera,
  Save,
  LogOut,
  ArrowLeft,
  BookMarked,
} from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

export default function ProfilePage() {
  const router = useRouter();

  const { data: session, isPending, refetch } = authClient.useSession();
  const user = session?.user;

  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(user?.image || "");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setImage(user.image || "");
    }
  }, [user]);

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/login");
    }
  }, [isPending, session, router]);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Name cannot be empty.");
      return;
    }

    if (image.trim()) {
      try {
        new URL(image.trim());
      } catch {
        toast.error("Please enter a valid image URL.");
        return;
      }
    }

    try {
      setSaving(true);

      const { error } = await authClient.updateUser({
        name: name.trim(),
        image: image.trim() || null,
      });

      if (error) {
        toast.error(error.message || "Failed to update profile.");
        return;
      }

      await refetch();
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoggingOut(true);

      const { error } = await authClient.signOut();

      if (error) {
        toast.error(error.message || "Logout failed.");
        return;
      }

      toast.success("Logged out successfully.");
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Something went wrong.");
    } finally {
      setLoggingOut(false);
    }
  };

  if (isPending || !user) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-background">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
      </main>
    );
  }

  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Not available";

  return (
    <main className="min-h-screen bg-background px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-4xl">
        {/* Back */}
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-primary"
        >
          <ArrowLeft size={17} />
          Back to Home
        </Link>

        {/* Heading */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Account Settings
          </p>
          <h1 className="mt-2 text-3xl font-bold text-foreground">
            My Profile
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage your personal information and account details.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-[280px_1fr]">
          {/* Profile Card */}
          <aside className="h-fit rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
            <div className="mx-auto flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-primary/10 bg-primary/5">
              {image ? (
                <img
                  src={image}
                  alt={user.name || "Profile"}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <UserRound size={48} className="text-primary/70" />
              )}
            </div>

            <h2 className="mt-4 break-words text-lg font-bold text-foreground">
              {user.name}
            </h2>

            <p className="mt-1 break-all text-sm text-muted-foreground">
              {user.email}
            </p>

            <div className="mt-5 border-t border-border pt-5 text-left">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <CalendarDays size={17} className="text-primary" />
                <div>
                  <p className="text-xs">Member since</p>
                  <p className="mt-0.5 font-medium text-foreground">
                    {joinedDate}
                  </p>
                </div>
              </div>
            </div>

            <Link
              href="/my-books"
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/5"
            >
              <BookMarked size={17} />
              My Books
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
            >
              <LogOut size={17} />
              {loggingOut ? "Logging out..." : "Logout"}
            </button>
          </aside>

          {/* Edit Profile */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-foreground">
                Personal Information
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Update your profile details below.
              </p>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              {/* Full Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-semibold text-foreground"
                >
                  Full Name
                </label>

                <div className="relative">
                  <UserRound
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />

                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                    className="w-full rounded-lg border border-border bg-background py-3 pl-11 pr-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-foreground"
                >
                  Email Address
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />

                  <input
                    id="email"
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full cursor-not-allowed rounded-lg border border-border bg-muted py-3 pl-11 pr-4 text-sm text-muted-foreground outline-none"
                  />
                </div>

                <p className="mt-1.5 text-xs text-muted-foreground">
                  Your registered email address cannot be changed here.
                </p>
              </div>

              {/* Profile Image URL */}
              <div>
                <label
                  htmlFor="image"
                  className="mb-2 block text-sm font-semibold text-foreground"
                >
                  Profile Picture URL
                </label>

                <div className="relative">
                  <Camera
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />

                  <input
                    id="image"
                    type="url"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://example.com/profile.jpg"
                    className="w-full rounded-lg border border-border bg-background py-3 pl-11 pr-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </div>

                <p className="mt-1.5 text-xs text-muted-foreground">
                  Add an image URL to set your profile picture.
                </p>
              </div>

              {/* Image Preview */}
              {image.trim() && (
                <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
                  <img
                    src={image}
                    alt="Profile preview"
                    className="h-12 w-12 rounded-full border border-border object-cover"
                    onError={(e) => {
                      e.currentTarget.style.visibility = "hidden";
                    }}
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Profile preview
                    </p>
                    <p className="text-xs text-muted-foreground">
                      This image will be used as your avatar.
                    </p>
                  </div>
                </div>
              )}

              {/* Save */}
              <div className="border-t border-border pt-5">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  <Save size={17} />
                  {saving ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </form>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <BookOpen size={16} className="text-primary" />
          <span>BookNook — Your Little Corner of Books</span>
        </div>
      </div>
    </main>
  );
}
