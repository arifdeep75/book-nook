
"use client";

import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
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

const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

type SocialProvider = "google" | "github";

export default function SignupPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] =
    useState<SocialProvider | null>(null);

  // Google and GitHub Signup
  const handleSocialSignup = async (provider: SocialProvider) => {
    if (loading || socialLoading) return;

    try {
      setSocialLoading(provider);

      const { error } = await authClient.signIn.social({
        provider,
        callbackURL: "/",
      });

      if (error) {
        toast.error(
          error.message || `Failed to sign up with ${provider}.`
        );
        setSocialLoading(null);
      }
    } catch (error) {
      console.error(`${provider} signup error:`, error);
      toast.error("Something went wrong. Please try again.");
      setSocialLoading(null);
    }
  };

  // Handle profile image selection
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB.");
      e.target.value = "";
      return;
    }

    if (profileImage) {
      URL.revokeObjectURL(profileImage);
    }

    setImageFile(file);
    setProfileImage(URL.createObjectURL(file));
  };

  // Remove selected profile image
  const removeImage = () => {
    if (profileImage) {
      URL.revokeObjectURL(profileImage);
    }

    setProfileImage(null);
    setImageFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Email and Password Signup
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading || socialLoading) return;

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

      // Step 1: Create user account
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

      if (!data) {
        toast.error("Account creation failed.");
        return;
      }

      // Step 2: Upload profile picture
      if (imageFile) {
        const uploadData = new FormData();
        uploadData.append("image", imageFile);

        const uploadResponse = await fetch(`${SERVER_URL}/upload`, {
          method: "POST",
          body: uploadData,
        });

        const uploadResult = await uploadResponse.json();

        if (!uploadResponse.ok || !uploadResult.success) {
          console.error("Image upload failed:", uploadResult);
          toast.error(
            "Account created, but profile picture upload failed."
          );
          router.push("/");
          router.refresh();
          return;
        }

        // Step 3: Save image URL to Better Auth
        const { error: updateError } = await authClient.updateUser({
          image: uploadResult.imageUrl,
        });

        if (updateError) {
          console.error("Profile image update failed:", updateError);
          toast.error(
            "Account created, but profile picture could not be saved."
          );
          router.push("/");
          router.refresh();
          return;
        }
      }

      if (profileImage) {
        URL.revokeObjectURL(profileImage);
      }

      toast.success("Account created successfully!");
      router.push("/");
      router.refresh();
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

        {/* Logo */}
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

        {/* Heading */}
        <div className="mb-5 text-center">
          <h1 className="text-2xl font-semibold text-[#1c352b]">
            Create your account
          </h1>

          <p className="mt-1.5 text-sm text-gray-500">
            Join our community of book lovers.
          </p>
        </div>

        {/* Social Signup */}
        <div className="space-y-3">

          {/* Google */}
          <button
            type="button"
            onClick={() => handleSocialSignup("google")}
            disabled={loading || socialLoading !== null}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg
              viewBox="0 0 48 48"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"
                transform="translate(0 6)"
              />
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.73 7.18l7.62 5.91c4.45-4.11 7.15-10.16 7.15-17.56Z"
              />
              <path
                fill="#FBBC05"
                d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.54 2.56 10.78l7.97-6.19Z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.14 15.9-5.89l-7.62-5.91c-2.11 1.41-4.81 2.25-8.28 2.25-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"
              />
            </svg>

            {socialLoading === "google"
              ? "Connecting..."
              : "Continue with Google"}
          </button>

          {/* GitHub */}
          <button
            type="button"
            onClick={() => handleSocialSignup("github")}
            disabled={loading || socialLoading !== null}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.05c-3.34.73-4.04-1.42-4.04-1.42-.55-1.39-1.33-1.76-1.33-1.76-1.09-.75.08-.74.08-.74 1.2.08 1.83 1.23 1.83 1.23 1.07 1.83 2.8 1.3 3.49.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.38 1.23-3.22-.12-.3-.53-1.52.12-3.17 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.29-1.23 3.29-1.23.66 1.65.25 2.87.13 3.17.77.84 1.23 1.91 1.23 3.22 0 4.62-2.8 5.64-5.48 5.94.43.37.81 1.1.81 2.22v3.3c0 .32.22.69.83.57A12 12 0 0 0 12 .5Z" />
            </svg>

            {socialLoading === "github"
              ? "Connecting..."
              : "Continue with GitHub"}
          </button>
        </div>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />

          <span className="text-xs text-gray-400">
            OR SIGN UP WITH EMAIL
          </span>

          <div className="h-px flex-1 bg-gray-200" />
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
                <UserRound
                  size={42}
                  className="text-[#1c352b]/60"
                />
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

        {/* Email Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Full Name */}
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

          {/* Email */}
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

          {/* Password */}
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
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>

            <p className="mt-1 text-xs text-gray-400">
              Password must be at least 8 characters.
            </p>
          </div>

          {/* Confirm Password */}
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
                onClick={() =>
                  setShowConfirmPassword((prev) => !prev)
                }
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

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || socialLoading !== null}
            className="w-full rounded-lg bg-[#1c352b] py-2.5 text-sm font-semibold text-white transition hover:bg-[#294b3c] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        {/* Login Link */}
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
