
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { BookPlus, ImagePlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

const categories = ["Fiction", "Science", "History", "Kids", "Others"];

const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

export default function AddBookPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Page Title
  useEffect(() => {
    document.title = "BookNook | Add Book";
  }, []);

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/login");
    }
  }, [isPending, session, router]);

  if (isPending || !session) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </main>
    );
  }

  const user = session.user;

  async function handleAddBook(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) return;

    const form = event.currentTarget;
    const formData = new FormData(form);

    const bookData = {
      title: String(formData.get("title") || "").trim(),
      author: String(formData.get("author") || "").trim(),
      category: String(formData.get("category") || ""),
      image: String(formData.get("image") || "").trim(),
      description: String(formData.get("description") || "").trim(),
      contributorName: user.name || "",
      contributorEmail: user.email || "",
      totalCopies: Number(formData.get("totalCopies")),
    };

    try {
      setIsSubmitting(true);

      const response = await fetch(`${SERVER_URL}/books`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Could not add the book.");
      }

      toast.success("Book added successfully!");
      form.reset();

      router.push("/books");
    } catch (error) {
      console.error("Add book error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
            Share a Story
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Add a New Book
          </h1>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Add a book to your collection and share it with the BookNook
            community.
          </p>
        </div>

        <form
          onSubmit={handleAddBook}
          className="space-y-6 rounded-2xl border border-border bg-card p-5 sm:p-8"
        >
          <div className="flex items-center gap-3 border-b border-border pb-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BookPlus size={22} />
            </div>

            <div>
              <h2 className="text-base font-semibold text-foreground">
                Book Information
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Enter the details of the book.
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Book Title
              </label>

              <input
                type="text"
                name="title"
                required
                placeholder="Enter book title"
                className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Author
              </label>

              <input
                type="text"
                name="author"
                required
                placeholder="Enter author name"
                className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Category
              </label>

              <select
                name="category"
                defaultValue=""
                required
                className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
              >
                <option value="" disabled>
                  Select a category
                </option>

                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Total Copies
              </label>

              <input
                type="number"
                name="totalCopies"
                min="1"
                step="1"
                required
                defaultValue={1}
                placeholder="Enter total copies"
                className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Book Image URL
            </label>

            <div className="relative">
              <ImagePlus
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />

              <input
                type="url"
                name="image"
                required
                placeholder="https://example.com/book-cover.jpg"
                className="h-11 w-full rounded-lg border border-border bg-background pl-10 pr-3 text-sm outline-none focus:border-primary"
              />
            </div>

            <p className="text-xs text-muted-foreground">
              Paste a direct URL to the book cover image.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Description
            </label>

            <textarea
              name="description"
              rows={5}
              required
              placeholder="Write a short description about the book..."
              className="w-full resize-y rounded-lg border border-border bg-background px-3 py-3 text-sm outline-none focus:border-primary"
            />
          </div>

          <div className="border-t border-border pt-5">
            <h3 className="mb-4 text-base font-semibold text-foreground">
              Contributor Information
            </h3>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Your Name
                </label>

                <input
                  type="text"
                  value={user.name || ""}
                  readOnly
                  className="h-11 w-full cursor-not-allowed rounded-lg border border-border bg-muted px-3 text-sm text-muted-foreground outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Your Email
                </label>

                <input
                  type="email"
                  value={user.email || ""}
                  readOnly
                  className="h-11 w-full cursor-not-allowed rounded-lg border border-border bg-muted px-3 text-sm text-muted-foreground outline-none"
                />
              </div>
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              Contributor details are taken from your account.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Adding Book...
              </>
            ) : (
              "Add Book"
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
