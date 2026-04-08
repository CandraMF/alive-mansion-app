'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function AboutPageClient() {
  return (
    <section className="relative h-[calc(100dvh-60px)] w-full flex items-center justify-center overflow-hidden">
      
      {/* 1. GAMBAR LATAR BELAKANG PENUH */}
      <Image
        src="" // Gambar latar premium (bisa diganti)
        alt="Alive Mansion About Background"
        fill
        sizes="100vw"
        priority
        className="object-cover object-center transition-transform duration-700 hover:scale-105" // Sedikit efek perbesaran saat di-hover
      />
      
      {/* OVERLAY SEMI-TRANSPARAN (Agar teks & logo lebih mudah dibaca) */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-10" />

      {/* 2. KONTEN DI TENGAH (Logo & Deskripsi) */}
      <div className="relative z-20 text-center text-white px-6 md:px-12 max-w-3xl flex flex-col items-center gap-10">
        
        {/* LOGO ANDA */}
        <div className="w-32 md:w-48 relative h-16">
          <Image 
            src="/logo-icon-white.png" // Menggunakan logo Anda (sebaiknya logo putih agar kontras)
            alt="Alive Mansion Logo"
            fill
            className="object-contain invert brightness-0" // Trik CSS untuk mengubah logo hitam menjadi putih agar kontras dengan latar gelap
          />
        </div>

        {/* DESKRIPSI SINGKAT */}
        <div className="flex flex-col gap-6 items-center">
          
          <p className="text-xs md:text-sm font-light text-white">
            ALIVE MANSION is where creativity and expression of self are celebrated. ALIVE MANSION is more than just a platform—it's a movement dedicated to celebrating the rawness and diversity of human expression. Every form of expression finds a welcoming home at ALIVE MANSION.
          </p>
        </div>
      </div>
    </section>
  );
}