'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CartDrawer from '@/components/CartDrawer';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMenuOpen]);

  return (
    <>
      <header
        className="fixed top-0 left-0 w-full z-40 bg-white/90 backdrop-blur-md border-b border-gray-100"
      >
        {/* PERUBAHAN 1: Menghapus py-2 dan mengubah tinggi menjadi h-12 secara global */}
        <nav className="flex justify-between items-center px-6 md:px-12 max-w-[1600px] mx-auto h-12">

          {/* Bagian Kiri: Hamburger Menu */}
          <div className="flex-1">
            <button onClick={() => setIsMenuOpen(true)} className="p-2 focus:outline-none cursor-pointer hover:opacity-60 flex flex-col gap-[5px]" aria-label="Menu">
              <div className="w-6 h-[2px] bg-black"></div>
              <div className="w-6 h-[2px] bg-black"></div>
              <div className="w-6 h-[2px] bg-black"></div>
            </button>
          </div>

          {/* Bagian Tengah: Logo */}
          {/* PERUBAHAN 2: Menghapus py-2 di container logo agar ruang luncur 100% penuh */}
          <div className="flex-1 flex justify-center overflow-hidden h-full">
            <Link href="/" className="relative h-full flex items-center justify-center w-32 md:w-40">

              {/* Logo Utama (Tulisan) */}
              <div
                className={`absolute w-full h-full flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] ${isScrolled ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'
                  }`}
              >
                <img
                  src="/logo-black.png"
                  alt="Alive Mansion Logo"
                  className="h-10 md:h-12 object-contain" // Sedikit dikecilkan agar pas di dalam h-12
                />
              </div>

              {/* Logo Icon (WebP) */}
              <div
                className={`absolute w-full h-full flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] ${isScrolled ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
                  }`}
              >
                <img
                  src="/logo-icon-black.webp"
                  alt="Alive Mansion Icon"
                  className="h-10 md:h-14 object-contain"
                />
              </div>
            </Link>
          </div>

          {/* Bagian Kanan: Menu Kanan */}
          <div className="flex-1 flex justify-end gap-4 md:gap-8 text-[10px] md:text-xs uppercase tracking-widest font-light items-center">
            <button className="hover:opacity-50 transition-opacity hidden md:block">SEARCH</button>
            <CartDrawer />
          </div>
        </nav>
      </header>

      {/* Overlay & Drawer tetap sama... */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-transparent" onClick={() => setIsMenuOpen(false)} />
      )}

      <div
        className={`fixed top-0 left-0 h-[100dvh] w-[80vw] md:w-[400px] bg-black/70 backdrop-blur-md text-white z-[60] transform transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="px-8 py-6 flex justify-end items-center">
          <button onClick={() => setIsMenuOpen(false)} className="text-3xl font-light hover:opacity-50 transition-opacity">&times;</button>
        </div>

        <div className="flex flex-col gap-4 p-8 text-md font-light tracking-wide uppercase mt-4">
          <Link href="/" onClick={() => setIsMenuOpen(false)} className="transition-transform">HOME</Link>
          <Link href="/shop" onClick={() => setIsMenuOpen(false)} className="transition-transform">SHOP</Link>
          <Link href="/about" onClick={() => setIsMenuOpen(false)} className="transition-transform">ABOUT</Link>
        </div>

        <div className="mt-auto p-8 flex flex-col gap-8">
          <div className="flex flex-col gap-4 text-[10px] md:text-xs font-light tracking-widest">
            <Link href="#" onClick={() => setIsMenuOpen(false)} className="hover:text-white transition-colors">FAQs</Link>
            <Link href="#" onClick={() => setIsMenuOpen(false)} className="hover:text-white transition-colors">Careers</Link>
            <Link href="/contact" onClick={() => setIsMenuOpen(false)} className="hover:text-white transition-colors">Contact Us</Link>
          </div>

          <div className="pt-6 border-white/20">
            <p className="text-[9px] tracking-[0.2em] uppercase font-light">
              &copy; {new Date().getFullYear()} ALIVE MANSION
            </p>
          </div>
        </div>
      </div>
    </>
  );
}