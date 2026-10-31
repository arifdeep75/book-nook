
"use client";

import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Camera,
  Eye,
  EyeOff,
  ImagePlus,
  Trash2,
  UserRound,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function SignupPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB.");
      return;
    }

    if (profileImage) URL.revokeObjectURL(profileImage);

    setProfileImage(URL.createObjectURL(file));
  };

  const removeImage = () => {
    if (profileImage) URL.revokeObjectURL(profileImage);

    setProfileImage(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;

    const formData = new FormData(e.currentTarget);

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        callbackURL: "/",
      });

      if (error) {
        toast.error(error.message || "Failed to create account.");
        return;
      }

      if (data) {
        toast.success("Account created successfully!");

        if (profileImage) URL.revokeObjectURL(profileImage);

        router.push("/");
        router.refresh();
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f7f2] px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-[#e7e5dc] bg-white p-6 shadow-sm sm:p-8">
        <Link
          href="/"
          className="mb-6 flex items-center justify-center gap-2"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1c352b] text-[#dfc58d]">
            <BookOpen size={21} />
          </span>

          <span className="text-2xl font-bold text-[#1c352b]">
            BookNook
          </span>
        </Link>

        <div className="mb-5 text-center">
          <h1 className="text-2xl font-semibold text-[#1c352b]">
            Create your account
          </h1>

          <p className="mt-1.5 text-sm text-gray-500">
            Join our community of book lovers.
          </p>
        </div>

        {/* Profile Picture */}
        <div className="mb-6 flex flex-col items-center">
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-[#e9eee9] bg-[#edf1ed]">
              {profileImage ? (
                <Image
                  src={profileImage}
                  alt="Profile preview"
                  width={96}
                  height={96}
                  unoptimized
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserRound size={42} className="text-[#1c352b]/60" />
              )}
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Upload profile picture"
              className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#1c352b] text-white transition hover:bg-[#294b3c]"
            >
              <Camera size={15} />
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />

          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 text-sm font-medium text-[#1c352b] hover:underline"
            >
              <ImagePlus size={15} />
              {profileImage ? "Change photo" : "Upload photo"}
            </button>

            {profileImage && (
              <button
                type="button"
                onClick={removeImage}
                className="flex items-center gap-1 text-sm text-red-500 hover:underline"
              >
                <Trash2 size={14} />
                Remove
              </button>
            )}
          </div>

          <p className="mt-1.5 text-xs text-gray-400">
            Optional · JPG, PNG · Maximum 5MB
          </p>
        </div>

        {/* Sign Up Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Full name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your full name"
              required
              autoComplete="name"
              className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-[#1c352b] focus:ring-2 focus:ring-[#1c352b]/10"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Email address
            </label>

            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              autoComplete="email"
              className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-[#1c352b] focus:ring-2 focus:ring-[#1c352b]/10"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Password
            </label>

            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                minLength={8}
                required
                autoComplete="new-password"
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 pr-11 text-sm outline-none transition focus:border-[#1c352b] focus:ring-2 focus:ring-[#1c352b]/10"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label="Toggle password visibility"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#1c352b]"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <p className="mt-1 text-xs text-gray-400">
              Password must be at least 8 characters.
            </p>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Confirm password
            </label>

            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                minLength={8}
                required
                autoComplete="new-password"
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 pr-11 text-sm outline-none transition focus:border-[#1c352b] focus:ring-2 focus:ring-[#1c352b]/10"
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label="Toggle confirm password visibility"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#1c352b]"
              >
                {showConfirmPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#1c352b] py-2.5 text-sm font-semibold text-white transition hover:bg-[#294b3c] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-[#1c352b] hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
