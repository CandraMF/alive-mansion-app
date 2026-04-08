'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

// Data Dummy Gambar Fashion Terang (dari Unsplash)
const images = {
  // Portrait Hero
  hero: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1600&auto=format&fit=crop",
  // Seksi "The 5AC bag" (Dua square)
  bag1: "https://images.unsplash.com/photo-1619134711684-60c04a08866a?q=80&w=800&auto=format&fit=crop",
  bag2: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800&auto=format&fit=crop",
  // Seksi "Ready-to-wear" (Dua square)
  wear1: "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?q=80&w=800&auto=format&fit=crop",
  wear2: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop",
  // Grid Produk (Empat square)
  prod1: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=600&auto=format&fit=crop",
  prod2: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=600&auto=format&fit=crop",
  prod3: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=600&auto=format&fit=crop",
  prod4: "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?q=80&w=600&auto=format&fit=crop",
};

const products = [
  { img: images.prod1, label: "Ready to Wear", w: 640, h: 800 },
  { img: images.prod2, label: "Bags", w: 640, h: 800 },
  { img: images.prod3, label: "Shoes", w: 640, h: 800 },
  { img: images.prod4, label: "Jewelry", w: 640, h: 800 },
];


export default function HomePage() {

  const [email, setEmail] = useState("");

  return (
    <main className="min-h-screen">

      <section className="relative w-full h-screen overflow-hidden">
        <img
          src={images.hero}
          alt="Fall Winter 2026 Collection"
          className="w-full h-full object-cover"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-foreground/20" />
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-center">
          <p className="text-primary-foreground text-xs tracking-[0.3em] uppercase mb-2">
            Fall Winter 2026
          </p>
          <a href="#" className="text-primary-foreground text-xs font-semibold tracking-[0.2em] uppercase border-b border-primary-foreground pb-0.5 hover:opacity-70 transition-opacity">
            Explore the Collection
          </a>
        </div>
      </section>

      <section className="py-20 md:py-32 px-6 md:px-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
          <div>
            <img
              src={images.wear1}
              alt="Maison Margiela Artisanal"
              className="w-full max-w-md"
              loading="lazy"
              width={800}
              height={800}
            />
          </div>
          <div className="max-w-sm">
            <p className="section-label mb-6">Maison Margiela | Artisanal</p>
            <p className="font-serif text-base md:text-lg leading-relaxed text-foreground/80 mb-4">
              Conceived by our hope to explore the ideas and values that shape us.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground mb-8">
              Through a study of our archival DNA, we selected five house codes
              that will be explored across exhibitions and experiences in
              cities this April.
            </p>
            <a href="#" className="editorial-link">Discover More</a>
          </div>
        </div>
      </section>

      <section className="relative w-full">
        <img
          src={images.hero}
          alt="Spring Summer 2026 Runway"
          className="w-full h-[70vh] object-cover"
          loading="lazy"
          width={1920}
          height={900}
        />
        <div className="absolute inset-0 bg-foreground/30" />
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-center">
          <p className="text-primary-foreground text-[10px] tracking-[0.3em] uppercase mb-1">
            New Arrivals in Society
          </p>
          <p className="text-primary-foreground font-serif text-xl md:text-2xl italic mb-4">
            Spring Summer 2026
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-primary-foreground text-xs font-bold tracking-[0.15em] uppercase hover:opacity-70 transition-opacity">
              Women
            </a>
            <a href="#" className="text-primary-foreground text-xs font-bold tracking-[0.15em] uppercase hover:opacity-70 transition-opacity">
              Men
            </a>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 md:px-10 bg-secondary">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map((p) => (
            <a key={p.label} href="#" className="group block">
              <div className="overflow-hidden mb-4">
                <img
                  src={p.img}
                  alt={p.label}
                  className="w-full aspect-[4/5] object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                  width={p.w}
                  height={p.h}
                />
              </div>
              <p className="section-label text-center">{p.label}</p>
              <p className="text-center mt-1">
                <span className="editorial-link text-[10px]">Discover More</span>
              </p>
            </a>
          ))}
        </div>
      </section>

      <>
        {/* Collaboration */}
        <section className="py-20 md:py-28 px-6 md:px-10">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="section-label mb-4">Featured</p>
              <h2 className="font-serif text-xl md:text-2xl mb-4">
                Maison Margiela × Gentle Monster
              </h2>
              <a href="#" className="editorial-link">Discover the Collection</a>
            </div>
            <div>
              <img
                src={images.bag2}
                alt="Collaboration sunglasses"
                className="w-full max-w-md ml-auto"
                loading="lazy"
                width={700}
                height={700}
              />
            </div>
          </div>
        </section>

        {/* Residences */}
        <section className="py-20 md:py-28 px-6 md:px-10 border-t border-border">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src={images.wear2}
                alt="Maison Margiela Residences"
                className="w-full max-w-md"
                loading="lazy"
                width={700}
                height={700}
              />
            </div>
            <div className="max-w-sm">
              <h2 className="font-serif text-xl md:text-2xl italic mb-4">
                Maison Margiela<br />Residences
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground mb-6">
                We are proud to share the Maison Margiela Residences, marking the
                house's first venture into residential living.
              </p>
              <a href="#" className="editorial-link">Discover More</a>
            </div>
          </div>
        </section>
      </>

      <section className="py-16 px-6 md:px-10 border-t border-border">
        <div className="max-w-xl mx-auto text-center">
          <p className="text-xs text-muted-foreground leading-relaxed mb-6">
            Maison Margiela is a Parisian haute couture house founded on ideas of anonymity and the elevation of
            artisan craft. Its collections underscore a focus on materials and construction to define a unique
            language of its own.
          </p>
          <h3 className="font-serif text-base font-medium tracking-wide mb-2">
            Receive the Newsletter
          </h3>
          <p className="text-xs text-muted-foreground mb-6">
            Stay up to date with the latest collections, events and exclusive content
          </p>
          <div className="flex border-b border-foreground max-w-sm mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="flex-1 bg-transparent text-sm py-2 outline-none placeholder:text-muted-foreground"
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