'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image'; 
import CartDrawer from '@/components/CartDrawer';
import { User, Search, Loader2 } from 'lucide-react'; 

const formatRupiah = (angka: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);

export default function Navbar({ data, session }: { data?: any, session?: any }) {
  // States Navbar
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // States Search Modal
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const logoUrl = data?.logoUrl || '/logo-black.png';
  const logoIconUrl = data?.logoIconUrl || '/logo-icon-black.webp';
  const navLinks = data?.links || [
    { label: 'HOME', url: '/' },
    { label: 'SHOP', url: '/shop' },
    { label: 'ABOUT', url: '/about' }
  ];

  // Efek Scroll
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Kunci Scroll Body
  useEffect(() => {
    if (isMenuOpen || isSearchOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
  }, [isMenuOpen, isSearchOpen]);

  // 🚀 LOGIKA BARU: Sync History & PopState Tanpa "Trap/Jebakan" Navigasi
  useEffect(() => {
    if (isMenuOpen || isSearchOpen) {
      const panelType = isMenuOpen ? 'menu' : 'search';
      window.history.pushState({ panel: panelType }, '');

      const handlePopState = () => {
        setIsMenuOpen(false);
        setIsSearchOpen(false);
      };

      window.addEventListener('popstate', handlePopState);
      
      return () => {
        window.removeEventListener('popstate', handlePopState);
        // 🛡️ KITA HAPUS history.back() DARI SINI AGAR TIDAK BENTROK DENGAN NEXT.JS ROUTER
      };
    } else {
      // Bersihkan pencarian hanya jika modal search benar-benar tertutup
      if (!isSearchOpen && searchQuery !== '') {
        setSearchQuery('');
        setSearchResults([]);
      }
    }
  }, [isMenuOpen, isSearchOpen]);

  // 🚀 FUNGSI TUTUP MANUAL KHUSUS UNTUK TOMBOL "X" DAN OVERLAY BACKGROUND
  const handleManualClose = () => {
    if (window.history.state?.panel === 'menu' || window.history.state?.panel === 'search') {
      window.history.back(); // Biarkan popstate yang mengubah state jadi false
    } else {
      setIsMenuOpen(false);
      setIsSearchOpen(false);
    }
  };

  // EFEK DEBOUNCE UNTUK LIVE SEARCH
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        setIsSearching(true);
        try {
          const res = await fetch(`/api/products/search?q=${encodeURIComponent(searchQuery)}`);
          if (res.ok) {
            const data = await res.json();
            setSearchResults(data);
          }
        } catch (error) {
          console.error("Search error", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500); 

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-40 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <nav className="flex justify-between items-center px-6 md:px-12 max-w-[1600px] mx-auto h-12">

          {/* Kiri: Hamburger */}
          <div className="flex-1">
            <button onClick={() => setIsMenuOpen(true)} className="p-2 focus:outline-none cursor-pointer hover:opacity-60 flex flex-col gap-[5px]" aria-label="Menu">
              <div className="w-6 h-[2px] bg-black"></div>
              <div className="w-6 h-[2px] bg-black"></div>
              <div className="w-6 h-[2px] bg-black"></div>
            </button>
          </div>

          {/* Tengah: Logo */}
          <div className="flex-1 flex justify-center overflow-hidden h-full">
            <Link href="/" className="relative h-full flex items-center justify-center w-32 md:w-40">
              <div className={`absolute w-full h-full flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] ${isScrolled ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
                <img src={logoUrl} alt="Main Logo" className="h-10 md:h-12 object-contain" />
              </div>
              <div className={`absolute w-full h-full flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] ${isScrolled ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
                <img src={logoIconUrl} alt="Icon Logo" className="h-10 md:h-14 object-contain" />
              </div>
            </Link>
          </div>

          {/* Kanan: Search, Auth & Cart */}
          <div className="flex-1 flex justify-end gap-4 md:gap-6 text-[10px] md:text-xs uppercase tracking-widest font-light items-center">
            <button onClick={() => setIsSearchOpen(true)} className="hover:opacity-50 transition-opacity hidden md:block">SEARCH</button>
            <button onClick={() => setIsSearchOpen(true)} className="hover:opacity-50 transition-opacity md:hidden"><Search className="w-4 h-4" /></button>

            <div className="hidden md:flex items-center gap-4 border-l border-gray-200 pl-4">
              {session ? (
                <Link href="/account" className="flex items-center gap-1.5 hover:opacity-50 transition-opacity">
                  <User className="w-3.5 h-3.5" />
                  <span>{session.user?.name?.split(' ')[0] || 'ACCOUNT'}</span>
                </Link>
              ) : (
                <Link href="/register" className="hover:opacity-50 transition-opacity">SIGN IN</Link>
              )}
            </div>
            <CartDrawer />
          </div>
        </nav>
      </header>

      {/* 🚀 LAYAR PENCARIAN (SEARCH OVERLAY) LIVE */}
      <div className={`fixed inset-0 z-[100] bg-white backdrop-blur-md flex flex-col pt-6 md:pt-12 transition-all duration-500 ${isSearchOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-4'}`}>
        <div className="flex justify-end px-6 md:px-12 shrink-0">
          <button onClick={handleManualClose} className="text-3xl font-light hover:opacity-50 transition-opacity">&times;</button>
        </div>

        <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-6 md:px-12 mt-4 md:mt-0">

          <form onSubmit={(e) => e.preventDefault()} className="w-full flex items-center border-b border-black pb-2 shrink-0">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH PRODUCTS..."
              autoFocus={isSearchOpen}
              className="w-full bg-transparent text-xl md:text-3xl lg:text-4xl font-light outline-none uppercase tracking-widest placeholder:text-gray-300"
            />
            <div className="p-2">
              {isSearching ? <Loader2 className="w-6 h-6 md:w-8 md:h-8 animate-spin text-gray-400" /> : <Search className="w-6 h-6 md:w-8 md:h-8" />}
            </div>
          </form>

          <div className="flex-1 overflow-y-auto custom-scrollbar mt-8 pb-12">

            {searchQuery.trim().length <= 1 && (
              <div className="flex flex-wrap gap-4 justify-center text-[10px] md:text-xs uppercase tracking-widest text-gray-500 mt-12">
                <span>Popular:</span>
                <button onClick={() => setSearchQuery('t-shirt')} className="hover:text-black">T-Shirt</button>
                <button onClick={() => setSearchQuery('jacket')} className="hover:text-black">Jacket</button>
                <button onClick={() => setSearchQuery('pants')} className="hover:text-black">Pants</button>
              </div>
            )}

            {searchQuery.trim().length > 1 && !isSearching && searchResults.length === 0 && (
              <div className="text-center text-[10px] md:text-xs uppercase tracking-widest text-gray-400 mt-12">
                No products found for "{searchQuery}"
              </div>
            )}

            {searchResults.length > 0 && !isSearching && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8">
                {searchResults.map((p) => (
                  <Link
                    href={`/shop/${p.id}`}
                    key={p.id}
                    onClick={() => setIsSearchOpen(false)} 
                    className="group flex flex-col cursor-pointer"
                  >
                    <div className="aspect-[3/4] bg-gray-50 relative overflow-hidden mb-3 border border-gray-100">
                      <Image
                        src={p.image}
                        alt={p.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                    <h3 className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest group-hover:text-gray-500 transition-colors">
                      {p.name}
                    </h3>
                    <p className="text-[9px] md:text-[10px] text-gray-500 mt-1">
                      {formatRupiah(p.price)}
                    </p>
                  </Link>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* DRAWER MENU MOBILE */}
      {isMenuOpen && <div className="fixed inset-0 z-50 bg-transparent" onClick={handleManualClose} />}

      <div className={`fixed top-0 left-0 h-[100dvh] w-[80vw] md:w-[400px] bg-black/70 backdrop-blur-md text-white z-[60] transform transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="px-8 py-6 flex justify-end items-center">
          <button onClick={handleManualClose} className="text-3xl font-light hover:opacity-50 transition-opacity">&times;</button>
        </div>

        <div className="flex flex-col gap-4 p-8 text-md font-light tracking-wide uppercase mt-4">
          {navLinks.map((link: any, idx: number) => (
            <Link key={idx} href={link.url} onClick={() => setIsMenuOpen(false)} className="transition-transform hover:text-gray-300">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="mt-auto p-8 flex flex-col gap-8">
          <div className="md:hidden flex flex-col gap-4 text-[10px] md:text-xs font-light tracking-widest uppercase border-b border-white/20 pb-6">
            {session ? (
              <Link href="/account" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 hover:text-gray-300 transition-colors">
                <User className="w-4 h-4" /> My Account
              </Link>
            ) : (
              <Link href="/register" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 hover:text-gray-300 transition-colors">
                <User className="w-4 h-4" /> Sign In / Register
              </Link>
            )}
          </div>

          <div className="flex flex-col gap-4 text-[10px] md:text-xs font-light tracking-widest">
            <Link href="/faq" onClick={() => setIsMenuOpen(false)} className="hover:text-white transition-colors">FAQs</Link>
            <Link href="/careers" onClick={() => setIsMenuOpen(false)} className="hover:text-white transition-colors">Careers</Link>
            <Link href="/contact" onClick={() => setIsMenuOpen(false)} className="hover:text-white transition-colors">Contact Us</Link>
          </div>

          <div className="pt-6 border-white/20">
            <p className="text-[9px] tracking-[0.2em] uppercase font-light">
              {data?.copyright || `© ${new Date().getFullYear()} ALIVE MANSION`}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}