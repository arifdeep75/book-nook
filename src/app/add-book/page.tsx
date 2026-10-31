
import { BookPlus, ImagePlus } from "lucide-react";

const categories = [
  "Fiction",
  "Science",
  "History",
  "Kids",
  "Others",
];

export default function AddBookPage() {
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
            Add a book to your collection and share it with the BookNook community.
          </p>
        </div>

        <form className="space-y-6 rounded-2xl border border-border bg-card p-5 sm:p-8">
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
                placeholder="Enter author name"
                className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Category
            </label>

            <select
              defaultValue=""
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
              Book Image URL
            </label>

            <div className="relative">
              <ImagePlus
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />

              <input
                type="url"
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
              rows={5}
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
                  placeholder="Your name"
                  className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Your Email
                </label>

                <input
                  type="email"
                  placeholder="Your email"
                  className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            className="h-11 w-full rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Add Book
          </button>
        </form>
      </div>
    </main>
  );
}
