
"use client";

import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";
import { ArrowRight } from "lucide-react";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";

const slides = [
  {
    eyebrow: "WELCOME TO BOOKNOOK",
    title: "Discover Your Next Favorite",
    description:
      "Explore a world of stories, ideas, and inspiration. Your next great read is waiting for you.",
    button: "Explore Books",
    image: "/images/slide-1.avif",
  },
  {
    eyebrow: "ESCAPE INTO STORIES",
    title: "A World Beyond Pages",
    description:
      "Travel to magical places, meet unforgettable characters, and let your imagination wander.",
    button: "Find Your Story",
    image: "/images/slide-2.avif",
  },
  {
    eyebrow: "LEARN SOMETHING NEW",
    title: "Knowledge Starts Here",
    description:
      "From science to history, discover books that expand your mind and inspire new ideas.",
    button: "Browse Collection",
    image: "/images/slide-3.avif",
  },
  {
    eyebrow: "READ. SHARE. CONNECT.",
    title: "Share Stories, Build Connections",
    description:
      "Borrow books, share your favorites, and become part of a community that loves reading.",
    button: "Discover More",
    image: "/images/slide-4.avif",
  },
  {
    eyebrow: "YOUR JOURNEY BEGINS",
    title: "Every Book Opens a New Door",
    description:
      "Start your reading journey today. Find your next adventure in our growing library.",
    button: "Start Exploring",
    image: "/images/slide-5.avif",
  },
];

export default function HeroSlider() {
  return (
   <section className="mx-auto max-w-7xl px-4 pt-5 pb-8 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-2xl md:rounded-3xl">
        <Swiper
          modules={[Autoplay, EffectFade, Pagination]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          pagination={{ clickable: true }}
          loop
          className="hero-swiper"
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={slide.title}>
              <div
                className="relative flex h-80 items-center bg-cover bg-center px-6 sm:px-10 md:h-96 md:px-12 lg:px-14"
                style={{
                  backgroundImage: `url("${slide.image}")`,
                }}
              >
                <div className="absolute inset-0 bg-linear-to-r from-[#14291f]/95 via-[#14291f]/75 to-[#14291f]/20" />

                <div className="relative z-10 max-w-xl text-white">
                  <p className="mb-4 text-xs font-bold tracking-[2px] text-[#e4c987] md:text-sm">
                    {slide.eyebrow}
                  </p>

                  <h2 className="max-w-lg text-3xl font-bold leading-tight tracking-tight md:text-4xl lg:text-5xl">
                    {slide.title}
                  </h2>

                  <p className="mt-4 max-w-md text-sm leading-6 text-white/80 md:text-base md:leading-7">
                    {slide.description}
                  </p>

                  <Link
                    href="/books"
                    className="mt-6 inline-flex items-center gap-3 rounded-lg bg-[#dfc58d] px-5 py-3 text-sm font-bold text-[#1c352b] transition hover:bg-white"
                  >
                    {slide.button}
                    <ArrowRight size={18} />
                  </Link>

                  <p className="mt-6 text-xs font-medium tracking-widest text-white/60">
                    0{index + 1} <span className="mx-2">/</span> 05
                  </p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
