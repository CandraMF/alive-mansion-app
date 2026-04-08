'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CartDrawer from '@/components/CartDrawer'; 

export default function Navbar() {
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsNavVisible(false);
      } else {
        setIsNavVisible(true);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

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
        className={`fixed top-0 left-0 w-full z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-transform duration-500 ease-in-out ${isNavVisible ? 'translate-y-0' : '-translate-y-full'
          }`}
      >
        <nav className="flex justify-between items-center px-6 py-5 md:px-12 max-w-[1600px] mx-auto">
          {/* Bagian Kiri: Hamburger Menu */}
          <div className="flex-1">
            <button onClick={() => setIsMenuOpen(true)} className="p-2 -ml-2 focus:outline-none hover:opacity-60 flex flex-col gap-[5px]" aria-label="Menu">
              <div className="w-6 h-[1px] bg-black"></div>
              <div className="w-6 h-[1px] bg-black"></div>
            </button>
          </div>

          {/* Bagian Tengah: Logo */}
          <div className="flex-1 text-center">
            <Link href="/" className="text-xl md:text-2xl font-light tracking-[0.2em] uppercase whitespace-nowrap">
              Alive Mansion
            </Link>
          </div>

          {/* Bagian Kanan: Menu Kanan */}
          <div className="flex-1 flex justify-end gap-4 md:gap-8 text-[10px] md:text-xs uppercase tracking-widest font-light items-center">
            <button className="hover:opacity-50 transition-opacity hidden md:block">Search</button>
            <Link href="#" className="hover:opacity-50 transition-opacity hidden md:block">Account</Link>

            {/* CartDrawer menggantikan <Link> My Bag */}
            <CartDrawer />
          </div>
        </nav>
      </header>

      {/* Overlay transparan untuk mendeteksi klik di luar menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-transparent" onClick={() => setIsMenuOpen(false)} />
      )}

      {/* Drawer Menu Mobile (Kiri) */}
      <div 
        className={`fixed top-0 left-0 h-[100dvh] w-[80vw] md:w-[400px] bg-black/80 backdrop-blur-md text-white z-[60] transform transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Header Drawer (Hanya ikon X) */}
        <div className="px-8 py-6 flex justify-end items-center">
          <button onClick={() => setIsMenuOpen(false)} className="text-3xl font-light hover:opacity-50 transition-opacity">&times;</button>
        </div>
        
        {/* Menu Navigasi Utama */}
        <div className="flex flex-col gap-6 p-8 text-lg font-light tracking-wide uppercase mt-4">
          <Link href="/" onClick={() => setIsMenuOpen(false)} className="hover:translate-x-2 transition-transform">HOME</Link>
          <Link href="/shop" onClick={() => setIsMenuOpen(false)} className="hover:translate-x-2 transition-transform">SHOP</Link>
          <Link href="/about" onClick={() => setIsMenuOpen(false)} className="hover:translate-x-2 transition-transform">ABOUT</Link>
        </div>
        
        {/* Footer Drawer (Menu Tambahan & Copyright) */}
        <div className="mt-auto p-8 flex flex-col gap-8">
          <div className="flex flex-col gap-4 text-[10px] md:text-xs font-light tracking-widest uppercase">
            <Link href="#" onClick={() => setIsMenuOpen(false)} className="hover:text-white transition-colors">FAQs</Link>
            <Link href="#" onClick={() => setIsMenuOpen(false)} className="hover:text-white transition-colors">Careers</Link>
            <Link href="/contact" onClick={() => setIsMenuOpen(false)} className="hover:text-white transition-colors">Contact Us</Link>
          </div>
          
          <div className="pt-6 border-white/20">
            <p className="text-[9px] tracking-[0.2em] uppercase font-light">
              &copy; 2026 ALIVE MANSION
            </p>
          </div>
        </div>
      </div>
    </>
  );
}