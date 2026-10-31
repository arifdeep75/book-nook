
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Github,
} from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

type SocialProvider = "google" | "github";

export default function LoginPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] =
    useState<SocialProvider | null>(null);

  // Google and GitHub login
  const handleSocialLogin = async (provider: SocialProvider) => {
    if (loading || socialLoading) return;

    try {
      setSocialLoading(provider);

      const { error } = await authClient.signIn.social({
        provider,
        callbackURL: "/",
      });

      if (error) {
        toast.error(error.message || `Failed to sign in with ${provider}.`);
        setSocialLoading(null);
      }
    } catch (error) {
      console.error(`${provider} login error:`, error);
      toast.error("Something went wrong. Please try again.");
      setSocialLoading(null);
    }
  };

  // Email and password login
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (loading || socialLoading) return;

    const formData = new FormData(e.currentTarget);

    const email = (formData.get("email") as string)
      .trim()
      .toLowerCase();

    const password = formData.get("password") as string;
    const rememberMe = formData.get("remember") === "on";

    try {
      setLoading(true);

      const { data, error } = await authClient.signIn.email({
        email,
        password,
        rememberMe,
        callbackURL: "/",
      });

      if (error) {
        toast.error(error.message || "Invalid email or password.");
        return;
      }

      if (data) {
        toast.success("Welcome back!");

        router.push("/");
        router.refresh();
      }
    } catch (error) {
      console.error("Login error:", error);
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
          className="mb-8 flex items-center justify-center gap-2"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1c352b] text-[#dfc58d]">
            <BookOpen size={21} />
          </span>

          <span className="text-2xl font-bold text-[#1c352b]">
            BookNook
          </span>
        </Link>

        {/* Heading */}
        <div className="mb-7 text-center">
          <h1 className="text-2xl font-semibold text-[#1c352b]">
            Welcome back!
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Sign in to continue your reading journey.
          </p>
        </div>

        {/* Social Login */}
        <div className="space-y-3">

          {/* Google */}
          <button
            type="button"
            onClick={() => handleSocialLogin("google")}
            disabled={loading || socialLoading !== null}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg
              viewBox="0 0 48 48"
              className="h-4.5 w-4.5"
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
                transform="translate(0 0)"
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
            onClick={() => handleSocialLogin("github")}
            disabled={loading || socialLoading !== null}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Github size={19} />

            {socialLoading === "github"
              ? "Connecting..."
              : "Continue with GitHub"}
          </button>
        </div>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs text-gray-400">
            OR CONTINUE WITH EMAIL
          </span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* Email Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Email address
            </label>

            <div className="relative">
              <Mail
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-3.5 text-sm outline-none transition focus:border-[#1c352b] focus:ring-2 focus:ring-[#1c352b]/10"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Password
              </label>

              <Link
                href="/forgot-password"
                className="text-xs font-medium text-[#1c352b] hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <div className="relative">
              <Lock
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-11 text-sm outline-none transition focus:border-[#1c352b] focus:ring-2 focus:ring-[#1c352b]/10"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#1c352b]"
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center gap-2">
            <input
              id="remember"
              name="remember"
              type="checkbox"
              defaultChecked
              className="h-4 w-4 accent-[#1c352b]"
            />

            <label
              htmlFor="remember"
              className="text-sm text-gray-600"
            >
              Remember me
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || socialLoading !== null}
            className="w-full rounded-lg bg-[#1c352b] py-2.5 text-sm font-semibold text-white transition hover:bg-[#294b3c] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Sign Up Link */}
        <p className="mt-7 text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-semibold text-[#1c352b] hover:underline"
          >
            Sign up
          </Link>
        </p>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-gray-400">
          Your next favorite book is waiting for you.
        </p>
      </div>
    </main>
  );
}
