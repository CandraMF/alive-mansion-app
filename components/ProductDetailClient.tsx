'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { useCart } from '@/hooks/useCart';

export default function ProductDetailClient({ product, relatedProducts }: { product: any, relatedProducts: any[] }) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('Black'); 
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  
  // State utama untuk mengontrol posisi gambar
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  // State untuk Floating Mobile Cart Bar
  const [showFloatingCart, setShowFloatingCart] = useState(false);
  
  // Refs
  const isScrollingRef = useRef(false);
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const cartSectionRef = useRef<HTMLDivElement>(null); 
  const cart = useCart();

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
    }).format(angka);
  };

  const toggleAccordion = (section: string) => {
    setOpenAccordion(openAccordion === section ? null : section);
  };

  const goToImage = useCallback((index: number) => {
    setActiveImageIndex(index);
  }, []);

  // --- LOGIKA CUSTOM SCROLL (DESKTOP SAJA) ---
  const handleWheel = useCallback((e: WheelEvent) => {
    if (window.innerWidth < 768) return;
    e.preventDefault();
    if (isScrollingRef.current) return;
    if (Math.abs(e.deltaY) < 15) return;

    if (e.deltaY > 0 && activeImageIndex < product.images.length - 1) {
      isScrollingRef.current = true;
      setActiveImageIndex((prev) => prev + 1);
    } else if (e.deltaY < 0 && activeImageIndex > 0) {
      isScrollingRef.current = true;
      setActiveImageIndex((prev) => prev - 1);
    }

    if (isScrollingRef.current) {
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 400); 
    }
  }, [activeImageIndex, product.images.length]);

  useEffect(() => {
    const container = mainContainerRef.current;
    if (container && window.innerWidth >= 768) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }
    return () => {
      if (container) container.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);

  // --- INTERSECTION OBSERVER (MOBILE FLOATING BAR) ---
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (window.innerWidth < 768) {
          setShowFloatingCart(!entry.isIntersecting);
        }
      },
      { root: null, threshold: 0 }
    );

    if (cartSectionRef.current) {
      observer.observe(cartSectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  if (!product) return <div className="min-h-screen flex items-center justify-center text-black uppercase tracking-widest text-xs">Product Not Found</div>;

  return (
    <main className="min-h-screen bg-white text-black relative pb-20 md:pb-0">
      
      {/* SEKSI UTAMA */}
      {/* Perubahan: md:h-screen untuk desktop, auto untuk mobile agar mengikuti aspect ratio */}
      <section className="pt-0 pb-16 w-full px-4 md:px-8 lg:px-12 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 md:gap-12 items-start md:h-screen">

        {/* --- PANEL 1: KIRI (Thumbnails - DESKTOP SAJA) --- */}
        <div className="hidden md:flex justify-center w-full h-full pt-16">
          <div className="w-20 lg:w-24 flex flex-col gap-4 max-h-[70vh] overflow-y-auto no-scrollbar pb-10">
            {product.images.map((img: any, idx: number) => (
              <button
                key={idx}
                onClick={() => goToImage(idx)}
                className={`aspect-[1024/1537] w-full relative overflow-hidden transition-all duration-500 border ${activeImageIndex === idx ? 'border-black opacity-100' : 'border-transparent opacity-40 hover:opacity-100'}`}
              >
                <Image src={img.url} alt={`Preview ${idx + 1}`} fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* --- PANEL 2: TENGAH (GAMBAR UTAMA) --- */}
        {/* Perubahan: Menghapus batasan h-[75vh] di mobile agar tinggi mengikuti rasio lebar layar */}
        <div className="w-full flex justify-center py-0 md:py-2 md:h-[calc(100vh-50px)] relative">
          
          {/* VERSI MOBILE: Swipe Horizontal Full Width & Aspect Ratio Tetap */}
          <div className="md:hidden relative -mx-4 w-[calc(100%+2rem)] aspect-[1024/1537] bg-gray-50">
            {/* Perbaikan: Menambahkan styling CSS inline (Tailwind Arbitrary) 
              untuk menjamin scrollbar horizontal hilang di Safari, Chrome, iOS & Android
            */}
            <div 
              className="w-full h-full flex overflow-x-auto snap-x snap-mandatory no-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              onScroll={(e) => {
                const scrollLeft = e.currentTarget.scrollLeft;
                const width = e.currentTarget.clientWidth;
                setActiveImageIndex(Math.round(scrollLeft / width));
              }}
            >
              {product.images.map((img: any, idx: number) => (
                <div key={idx} className="w-full h-full shrink-0 snap-center relative">
                  <Image src={img.url} alt={`${product.name} ${idx}`} fill className="object-cover object-center" priority={idx === 0} />
                </div>
              ))}
            </div>

            {/* Indikator Titik (Mobile) */}
            <div className="absolute bottom-6 left-0 w-full flex justify-center gap-2 z-10">
              {product.images.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`h-[3px] transition-all duration-300 rounded-full ${activeImageIndex === idx ? 'w-6 bg-black' : 'w-2 bg-black/30'}`} 
                />
              ))}
            </div>
          </div>

          {/* VERSI DESKTOP: Custom Scroll Vertikal */}
          <div ref={mainContainerRef} className="hidden md:block h-full aspect-[1024/1537] relative overflow-hidden bg-gray-50 shadow-sm">
            <div 
              className="w-full h-full flex flex-col transition-transform duration-[400ms] ease-[cubic-bezier(0.65,0,0.35,1)]"
              style={{ transform: `translateY(-${activeImageIndex * 100}%)` }}
            >
              {product.images.map((img: any, idx: number) => (
                <div key={idx} className="w-full h-full shrink-0 relative">
                  <Image src={img.url} alt={`${product.name} ${idx}`} fill className="object-cover object-center" priority={idx === 0} />
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* --- PANEL 3: KANAN (Product Info) --- */}
        <div className="w-full flex justify-center h-full pt-4 md:pt-16">
          <div className="w-full max-w-sm flex flex-col md:sticky md:top-16">
            
            <div className="text-[10px] text-center md:text-left uppercase tracking-[0.2em] text-gray-400 font-bold mb-4">
              <Link href="/shop" className="hover:text-black transition-colors">OUTERWEAR</Link>
            </div>

            <h1 className="text-2xl text-center md:text-left md:text-xl font-serif italic mb-2 leading-tight">
              {product.name}
            </h1>
            <p className="text-sm text-center md:text-left font-medium tracking-[0.1em] text-gray-600 mb-8 md:mb-10">
              {formatRupiah(product.price)}
            </p>

            <div className="mb-8">
              <div className="flex justify-center md:justify-start gap-4">
                <button onClick={() => setSelectedColor('Black')} className={`w-5 h-5 rounded-full bg-black ring-offset-2 transition-all ${selectedColor === 'Black' ? 'ring-2 ring-black' : ''}`} />
                <button onClick={() => setSelectedColor('White')} className={`w-5 h-5 rounded-full bg-white border border-gray-200 ring-offset-2 transition-all ${selectedColor === 'White' ? 'ring-2 ring-black' : ''}`} />
              </div>
            </div>

            {/* SEKSI TOMBOL */}
            <div ref={cartSectionRef} className="w-full">
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest">Select Size</span>
                  <button className="text-[9px] uppercase tracking-widest text-gray-400 underline hover:text-black">Size Guide</button>
                </div>
                <div className="relative">
                  <select
                    value={selectedSize || ''}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full appearance-none border-b border-gray-300 py-4 text-[11px] uppercase tracking-[0.2em] bg-transparent outline-none focus:border-black transition-colors cursor-pointer"
                  >
                    <option value="" disabled>Select Size</option>
                    {product.variants.map((v: any) => (
                      <option key={v.id} value={v.size} disabled={v.stock <= 0}>
                        {v.size} {v.stock <= 0 ? '— SOLD OUT' : ''}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  if (!selectedSize) return;
                  cart.addItem({ id: product.id, name: product.name, price: product.price, image: product.images[0]?.url || '', size: selectedSize });
                  alert(`Added to Bag`);
                }}
                disabled={!selectedSize}
                className="w-full bg-black text-white py-5 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-neutral-800 transition-all mb-10 disabled:bg-gray-100 disabled:text-gray-300"
              >
                {selectedSize ? 'ADD TO BAG' : 'CHOOSE YOUR SIZE'}
              </button>
            </div>

            <div className="mb-10">
              <p className="text-[10px] font-bold uppercase tracking-widest mb-4">Description</p>
              <div className={`text-xs text-gray-500 leading-relaxed font-light ${isDescExpanded ? '' : 'line-clamp-3'}`}>
                <p className="whitespace-pre-line">{product.description}</p>
              </div>
              <button onClick={() => setIsDescExpanded(!isDescExpanded)} className="text-[9px] uppercase tracking-widest text-black underline mt-3 hover:opacity-50">
                {isDescExpanded ? 'Read Less' : 'Read More'}
              </button>
            </div>

            <div className="border-t border-gray-100">
              {['Product Detail', 'Shipping & Returns'].map((item) => (
                <div key={item} className="border-b border-gray-100">
                  <button onClick={() => toggleAccordion(item)} className="w-full py-5 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                    <span>{item}</span>
                    <span className="text-sm font-light">{openAccordion === item ? '−' : '+'}</span>
                  </button>
                  <div className={`overflow-hidden transition-all duration-500 ${openAccordion === item ? 'max-h-40 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <p className="text-[11px] text-gray-500 font-light leading-relaxed">
                      Informasi terperinci mengenai {item.toLowerCase()} akan dipaparkan di sini.
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* --- FLOATING BOTTOM BAR (MOBILE ONLY) --- */}
      <div 
        className={`md:hidden fixed bottom-4 left-4 right-4 z-50 transition-all duration-500 ease-in-out ${
          showFloatingCart ? 'translate-y-0 opacity-100' : 'translate-y-[150%] opacity-0 pointer-events-none'
        }`}
      >
        <div className="bg-white/95 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 p-2 flex items-center gap-2">
          
          {/* Pilihan Warna (Kecil & Ramping) */}
          <div className="flex gap-2 px-2 border-r border-gray-200">
            <button 
              onClick={() => setSelectedColor('Black')} 
              className={`w-[14px] h-[14px] rounded-full bg-black ring-offset-1 transition-all ${selectedColor === 'Black' ? 'ring-1 ring-black' : ''}`} 
              aria-label="Black"
            />
            <button 
              onClick={() => setSelectedColor('White')} 
              className={`w-[14px] h-[14px] rounded-full bg-white border border-gray-200 ring-offset-1 transition-all ${selectedColor === 'White' ? 'ring-1 ring-black' : ''}`} 
              aria-label="White"
            />
          </div>

          {/* Pilihan Size */}
          <div className="relative w-[80px]">
            <select
              value={selectedSize || ''}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="w-full h-full appearance-none border border-gray-200 py-3 pl-3 pr-6 text-[10px] uppercase tracking-widest bg-transparent outline-none focus:border-black cursor-pointer"
            >
              <option value="" disabled>SIZE</option>
              {product.variants.map((v: any) => (
                <option key={v.id} value={v.size} disabled={v.stock <= 0}>{v.size}</option>
              ))}
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
            </div>
          </div>
          
          {/* Tombol Add to Bag */}
          <button
            onClick={() => {
              if (!selectedSize) return;
              cart.addItem({ id: product.id, name: product.name, price: product.price, image: product.images[0]?.url || '', size: selectedSize });
              alert(`Added to Bag`);
            }}
            disabled={!selectedSize}
            className="flex-1 bg-black text-white py-3 text-[10px] font-bold uppercase tracking-[0.2em] disabled:bg-gray-200 disabled:text-gray-400"
          >
            {selectedSize ? 'ADD TO BAG' : 'SELECT SIZE'}
          </button>
        </div>
      </div>

      {/* REKOMENDASI PRODUK */}
      {relatedProducts.length > 0 && (
        <section className="bg-white border-t border-gray-100 px-4 md:px-12 py-16 md:py-20 w-full">
          <div className="w-full">
            <h2 className="text-center text-2xl md:text-3xl font-serif italic mb-12 md:mb-16 uppercase tracking-widest">You May Also Like</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-12">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel.id} product={{ id: rel.id, name: rel.name, price: formatRupiah(rel.price), images: rel.images.map((i: any) => i.url), status: 'available' }} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}