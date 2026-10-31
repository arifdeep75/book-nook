
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Camera,
  UserRound,
  Mail,
  CalendarDays,
  BookOpen,
  LogOut,
  Save,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

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

  return <ProfileEditor key={user.id} user={user} refetch={refetch} />;
}

function ProfileEditor({ user, refetch }: ProfileEditorProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user.name || "");
  const [imagePreview, setImagePreview] = useState(user.image || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Select profile picture
  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB.");
      event.target.value = "";
      return;
    }

    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // Upload image to backend
  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();

    formData.append("image", file);

    const response = await fetch(`${SERVER_URL}/upload`, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Image upload failed.");
    }

    return result.imageUrl;
  };

  // Save profile
  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Name cannot be empty.");
      return;
    }

    setIsSaving(true);

    try {
      let imageUrl = user?.image || "";

      // Upload selected image first
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      // Update Better Auth user
      const { error } = await authClient.updateUser({
        name: name.trim(),
        ...(imageFile ? { image: imageUrl } : {}),
      });

      if (error) {
        throw new Error(error.message || "Profile update failed.");
      }

      await refetch();

      if (imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }

      setImagePreview(imageUrl);
      setImageFile(null);

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
      await authClient.signOut();

      toast.success("Logged out successfully!");
      router.replace("/");
      router.refresh();
    } catch {
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

              <div className="relative">

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSaving}
                  aria-label="Change profile picture"
                  className="group relative h-28 w-28 overflow-hidden rounded-full border-4 border-card bg-muted shadow-md"
                >
                  {imagePreview ? (
                    <Image
                      src={imagePreview}
                      alt="Profile picture"
                      width={112}
                      height={112}
                      unoptimized
                      className="h-full w-full object-cover"
                      onError={() => setImagePreview("")}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <UserRound
                        size={42}
                        className="text-muted-foreground"
                      />
                    </div>
                  )}

                  <div className="absolute inset-0 flex items-center justify-center bg-black/55 text-white opacity-0 transition group-hover:opacity-100">
                    <Camera size={26} />
                  </div>
                </button>

                <span className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground">
                  <Camera size={15} />
                </span>
              </div>

              <div className="mt-3 text-center sm:mb-2 sm:mt-0 sm:text-left">
                <h2 className="text-xl font-semibold">
                  {user.name || "BookNook User"}
                </h2>

                <p className="text-sm text-muted-foreground">
                  {user.email}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Click your photo to change it
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
