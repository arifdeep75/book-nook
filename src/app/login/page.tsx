
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Eye, EyeOff, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;

    const formData = new FormData(e.currentTarget);

    const email = (formData.get("email") as string).trim().toLowerCase();
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
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
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

        {/* Login Form */}
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
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#1c352b]"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <div className="flex items-center gap-2">
            <input
              id="remember"
              name="remember"
              type="checkbox"
              defaultChecked
              className="h-4 w-4 accent-[#1c352b]"
            />

            <label htmlFor="remember" className="text-sm text-gray-600">
              Remember me
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
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
