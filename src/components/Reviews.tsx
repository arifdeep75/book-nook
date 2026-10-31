
import { Star, Quote } from "lucide-react";

const reviews = [
  {
    name: "Sarah Ahmed",
    role: "Book Lover",
    initials: "SA",
    rating: 5,
    review:
      "BookNook made it easy to discover books I would never have found otherwise. The collection is lovely!",
  },
  {
    name: "Rahim Hasan",
    role: "Regular Reader",
    initials: "RH",
    rating: 5,
    review:
      "I really like the idea of sharing books with other readers. It makes reading feel more connected.",
  },
  {
    name: "Nusrat Jahan",
    role: "Avid Reader",
    initials: "NJ",
    rating: 5,
    review:
      "A clean and simple way to explore different genres. I found some great books for my reading list.",
  },
];

export default function Reviews() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-12 lg:px-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
            Reader Stories
          </p>

          <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            What Readers Say
          </h2>

          <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
            A few words from our reading community.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {reviews.map((review) => (
          <article
            key={review.name}
            className="rounded-xl border border-border bg-card p-5 transition hover:border-primary/20 hover:shadow-sm"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex gap-1 text-[#c9a65b]">
                {Array.from({ length: review.rating }).map((_, index) => (
                  <Star
                    key={index}
                    size={15}
                    fill="currentColor"
                    strokeWidth={1.5}
                  />
                ))}
              </div>

              <Quote size={20} className="text-primary/20" />
            </div>

            <p className="text-sm leading-6 text-muted-foreground">
              “{review.review}”
            </p>

            <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {review.initials}
              </div>

              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  {review.name}
                </h3>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  {review.role}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
