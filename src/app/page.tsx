import { Suspense } from "react";
import HeroSlider from "../components/HeroSlider";
import HowItWorks from "@/components/HowItWorks";

export default function Home() {
  return (
    <main>
      <Suspense
        fallback={
          <section className="mx-auto max-w-7xl px-4 pt-5 pb-8 sm:px-6 lg:px-8">
            <div
              className="relative flex h-80 items-center overflow-hidden rounded-2xl bg-cover bg-center px-6 sm:px-10 md:h-96 md:rounded-3xl md:px-12 lg:px-14"
              style={{ backgroundImage: 'url("/images/slide-1.avif")' }}
            >
              <div className="absolute inset-0 bg-linear-to-r from-[#14291f]/95 via-[#14291f]/75 to-[#14291f]/20" />
              <div className="relative z-10 max-w-xl text-white">
                <p className="mb-4 text-xs font-bold tracking-[2px] text-[#e4c987] md:text-sm">
                  WELCOME TO BOOKNOOK
                </p>
                <h2 className="max-w-lg text-3xl font-bold leading-tight tracking-tight md:text-4xl lg:text-5xl">
                  Discover Your Next Favorite
                </h2>
                <p className="mt-4 max-w-md text-sm leading-6 text-white/80 md:text-base md:leading-7">
                  Explore a world of stories, ideas, and inspiration. Your next
                  great read is waiting for you.
                </p>
              </div>
            </div>
          </section>
        }
      >
        <HeroSlider />
      </Suspense>
      <HowItWorks></HowItWorks>
    </main>
    
  );
}