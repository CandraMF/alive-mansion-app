'use client';

import LoadingScreen from '@/components/LoadingScreen';
import Image from 'next/image'; import Link from 'next/link';
import { useRef, useState } from 'react';

const products = [
  { label: "Tabi Boots", img: "/images/products/prod1.jpg", w: 400, h: 500 },
  { label: "Glam Slam Bag", img: "/images/products/prod2.jpg", w: 400, h: 500 },
  { label: "Replica Sneakers", img: "/images/products/prod3.jpg", w: 400, h: 500 },
  { label: "5AC Classique", img: "/images/products/prod4.jpg", w: 400, h: 500 },
  { label: "5AC Classique", img: "/images/products/prod5.jpg", w: 400, h: 500 },
];

export default function HomePage() {
  const [email, setEmail] = useState("");

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const scrollLeft = scrollContainerRef.current.scrollLeft;
    const itemWidth = scrollContainerRef.current.children[0].clientWidth;
    const index = Math.round(scrollLeft / itemWidth);
    setActiveIndex(index);
  };

  return (
    <main className="min-h-screen">

      <LoadingScreen />

      <section className="relative w-full h-[calc(100vh+68px)] overflow-hidden">
        <video
          src="/cinema.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        />


        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-center z-10">
          <p className="text-white text-xs tracking-[0.3em] uppercase mb-2">
            Fall Winter 2026
          </p>
          <a href="#" className="text-white text-xs font-semibold tracking-[0.2em] uppercase border-b border-white pb-0.5 hover:opacity-70 transition-opacity">
            Explore the Collection
          </a>
        </div>
      </section>

      <section className="py-20 md:py-32 px-6 md:px-10">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center justify-center">
          <div className='md:block flex justify-center w-full'>
            <img
              src="/images/post2.jpg"
              alt="Maison Margiela Artisanal"
              className="w-full max-w-md"
              loading="lazy"
              width={800}
              height={800}
            />
          </div>
          <div className="max-w-sm md:pl-20 text-left md:text-center">
            <p className="font-serif italic section-label mb-6">Alive Mansion/Artisanal</p>
            <p className="font-serif text-base md:text-lg leading-relaxed text-foreground/80 mb-4">
              Conceived by our hope to explore the ideas and values that shape us.
            </p>
            <p className="font-serif text-base leading-relaxed text-muted-foreground mb-8">
              Through a study of our archival DNA, we selected five house codes
              that will be explored across exhibitions and experiences in
              cities this April.
            </p>
            <a href="#" className="editorial-link border-b border-black pb-1 uppercase text-xs font-bold tracking-widest">Discover More</a>
          </div>
        </div>
      </section>

      <section className="relative w-full h-[120vh] flex overflow-hidden">

        <div className="w-1/2 h-full">
          <img
            src="/images/post4.jpg" alt="Spring Summer 2026 Women"
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        <div className="w-1/2 h-full">
          <img
            src="/images/post3.jpg" alt="Spring Summer 2026 Men"
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        <div className="absolute inset-0 bg-foreground/30" />

        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-center z-10 w-full">
          <p className="text-white text-[10px] tracking-[0.3em] uppercase mb-1">
            New Arrivals in Society
          </p>
          <p className="text-white font-serif text-xl md:text-2xl italic mb-4">
            Spring Summer 2026
          </p>
          <div className="flex items-center justify-center gap-4">
            <a href="#" className="text-white text-xs font-bold tracking-[0.15em] uppercase hover:opacity-70 transition-opacity">
              Women
            </a>
            <a href="#" className="text-white text-xs font-bold tracking-[0.15em] uppercase hover:opacity-70 transition-opacity">
              Men
            </a>
          </div>
        </div>

      </section>

      <section className="py-16 bg-secondary/50 w-full overflow-hidden">

        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory gap-4 px-6 md:px-0 pb-4 no-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-px-6 md:scroll-px-0"
        >
          {products.map((p, index) => (
            <a
              key={`${p.label}-${index}`}
              href="#"
              className="group block snap-start shrink-0 w-[80vw] md:w-[calc(20vw-0.8rem)]"
            >
              <div className="overflow-hidden mb-4 bg-gray-100">
                <img
                  src={p.img}
                  alt={p.label}
                  className="w-full aspect-[4/5] object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                  width={p.w}
                  height={p.h}
                />
              </div>
            </a>
          ))}
        </div>

        <div className="flex justify-center items-center gap-2 mt-6 md:hidden">
          {products.map((_, i) => (
            <div
              key={i}
              className={`h-1 transition-all duration-300 ease-in-out ${activeIndex === i
                ? 'w-8 bg-black'
                : 'w-2 bg-gray-300'
                }`}
            />
          ))}
        </div>

      </section>

      <section className="relative w-full h-[120vh] flex overflow-hidden">

        <div className="w-full h-full">
          <img
            src="/images/post3.jpg" alt="Spring Summer 2026 Men"
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        <div className="absolute inset-0 bg-foreground/30" />

        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-center z-10 w-full">
          <p className="text-white text-[10px] tracking-[0.3em] uppercase mb-1">
            New Arrivals in Society
          </p>
          <p className="text-white font-serif text-xl md:text-2xl italic mb-4">
            Spring Summer 2026
          </p>
          <div className="flex items-center justify-center gap-4">
            <a href="#" className="text-white text-xs font-bold tracking-[0.15em] uppercase hover:opacity-70 transition-opacity">
              DISCOVER MORE
            </a>
          </div>
        </div>

      </section>

      <section className="py-20 md:py-28 px-6 md:px-10">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center ">
          <div className='text-left md:text-center'>
            <p className="section-label mb-4 text-xs font-bold uppercase tracking-widest text-gray-400">Featured</p>
            <h2 className="font-serif text-xl md:text-2xl mb-4 italic">
              Alive Mansion × Gentle Monster
            </h2>
            <a href="#" className="editorial-link border-b border-black pb-1 uppercase text-[10px] font-bold tracking-widest">Discover the Collection</a>
          </div>
          <div className='md:block flex justify-center w-full'>
            <img
              src="/images/collab.jpg"
              alt="Collaboration bag"
              className="w-full max-w-md md:ml-auto bg-gray-50"
              loading="lazy"
              width={700}
              height={700}
            />
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 px-6 md:px-10 border-border">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className='md:block flex justify-center w-full'>
            <img
              src="/images/residence.jpg"
              alt="Alive Mansion Residences"
              className="w-full max-w-md bg-gray-50"
              loading="lazy"
              width={700}
              height={700}
            />
          </div>
          <div className="max-w-sm text-left md:text-center md:pl-20">
            <h2 className="font-serif text-xl md:text-2xl italic mb-4">
              Alive Mansion<br />Residences
            </h2>
            <p className="font-serif text- leading-relaxed text-muted-foreground mb-6">
              We are proud to share the Alive Mansion Residences, marking the
              house's first venture into residential living.
            </p>
            <a href="#" className="editorial-link border-b border-black pb-1 uppercase text-[10px] font-bold tracking-widest">Discover More</a>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 md:px-10 border-border">
        <div className="max-w-xl mx-auto text-center">
          <p className="font-serif text-xs text-muted-foreground leading-relaxed mb-6 tracking-widest">
            Alive Mansion is a Parisian haute couture house founded on ideas of anonymity and the elevation of
            artisan craft. Its collections underscore a focus on materials and construction to define a unique
            language of its own.
          </p>
          <h3 className="text-base font-medium tracking-wide mb-2">
            Receive the Newsletter
          </h3>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-6">
            Stay up to date with the latest collections, events and exclusive content
          </p>
          <div className="flex border-b border-foreground max-w-sm mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="flex-1 bg-transparent text-xs py-3 outline-none placeholder:text-muted-foreground tracking-widest"
            />
            <button className="text-xs font-semibold tracking-wider uppercase py-2 px-4 hover:opacity-60 transition-opacity">
              →
            </button>
          </div>
        </div>
      </section>

    </main>
  );
}