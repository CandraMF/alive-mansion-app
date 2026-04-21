'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // 🚀 Import Router
import { useSession } from 'next-auth/react'; // 🚀 Import useSession
import { ChevronDown } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { useCart } from '@/hooks/useCart';

// Interface
interface Variant {
  id: string;
  sizeId: string;
  size: { name: string };
  colorId: string;
  color: { id: string; name: string; hexCodes: string[] };
  stock: number;
  price: number;
}

interface ProductImage {
  url: string;
  colorId: string | null;
}

interface ProductDetailProps {
  product: {
    id: string;
    name: string;
    price: number;
    description: string;
    images: ProductImage[];
    variants: Variant[];
  };
  relatedProducts: any[];
}

export default function ProductDetailClient({ product, relatedProducts }: ProductDetailProps) {
  const cart = useCart();
  const router = useRouter(); // 🚀 Inisialisasi Router
  const { status } = useSession(); // 🚀 Cek status sesi (authenticated / unauthenticated)

  // State Management
  const [selectedColorId, setSelectedColorId] = useState<string>(product.variants[0]?.colorId || '');
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Refs
  const isScrollingRef = useRef(false);
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const cartSectionRef = useRef<HTMLDivElement>(null);

  // Filter logika (sama seperti sebelumnya)
  const availableColors = useMemo(() => {
    const uniqueColors = new Map();
    product.variants.forEach(v => {
      if (!uniqueColors.has(v.colorId)) {
        const safeColor = v.color || { id: v.colorId, name: 'Default', hexCodes: ['#000000'] };
        uniqueColors.set(v.colorId, safeColor);
      }
    });
    return Array.from(uniqueColors.values());
  }, [product.variants]);

  const filteredVariants = useMemo(() => {
    return product.variants.filter(v => v.colorId === selectedColorId);
  }, [selectedColorId, product.variants]);

  const activeVariant = useMemo(() => {
    return filteredVariants.find(v => v.sizeId === selectedSizeId);
  }, [filteredVariants, selectedSizeId]);

  const displayImages = useMemo(() => {
    const colorImages = product.images.filter(img => img.colorId === selectedColorId);
    return colorImages.length > 0 ? colorImages : product.images;
  }, [selectedColorId, product.images]);

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
    }).format(angka);
  };

  // 🚀 FUNGSI ADD TO CART YANG SUDAH DI-UPGRADE
  const handleAddToCart = () => {
    // 1. Cek apakah user sudah login
    if (status === 'unauthenticated') {
      const currentPath = window.location.pathname;
      router.push(`/register?callbackUrl=${encodeURIComponent(currentPath)}`);
      return;
    }

    if (!activeVariant) return;

    cart.addItem({
      id: activeVariant.id,
      name: product.name,
      price: activeVariant.price,
      image: displayImages[0]?.url || '',
      size: activeVariant.size.name,
      color: activeVariant.color.name
    });
    alert(`Added ${product.name} (${activeVariant.size.name}) to Bag`);
  };

  // --- Scroll & UI Effects (Sama seperti sebelumnya) ---
  const handleWheel = useCallback((e: WheelEvent) => {
    if (window.innerWidth < 768) return;
    e.preventDefault();
    if (isScrollingRef.current) return;
    if (Math.abs(e.deltaY) < 15) return;

    if (e.deltaY > 0 && activeImageIndex < displayImages.length - 1) {
      isScrollingRef.current = true;
      setActiveImageIndex((prev) => prev + 1);
    } else if (e.deltaY < 0 && activeImageIndex > 0) {
      isScrollingRef.current = true;
      setActiveImageIndex((prev) => prev - 1);
    }

    if (isScrollingRef.current) {
      setTimeout(() => { isScrollingRef.current = false; }, 400);
    }
  }, [activeImageIndex, displayImages.length]);

  useEffect(() => {
    const container = mainContainerRef.current;
    if (container && window.innerWidth >= 768) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }
    return () => {
      if (container) container.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);

  return (
    <main className="min-h-screen bg-white text-black relative pb-20 md:pb-0">

      {/* SEKSI UTAMA */}
      <section className="pt-0 pb-16 w-full px-4 md:px-8 lg:px-12 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 md:gap-12 items-start md:h-screen">

        {/* PANEL 1: THUMBNAILS (Desktop) */}
        <div className="hidden md:flex justify-center w-full h-full">
          <div className="w-20 flex flex-col gap-4 max-h-[70vh] overflow-y-auto no-scrollbar">
            {displayImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`aspect-[1024/1537] border transition-all ${activeImageIndex === idx ? 'border-black opacity-100' : 'border-transparent opacity-40'}`}
              >
                <Image src={img.url} alt="Thumb" width={100} height={150} className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* --- PANEL 2: TENGAH (GAMBAR UTAMA) --- */}
        <div className="w-full flex justify-center py-0 md:py-2 md:h-[calc(100vh-50px)] relative">
          {/* VERSI MOBILE */}
          <div className="md:hidden relative -mx-4 w-[calc(100%+2rem)] aspect-[1024/1537] bg-gray-50">
            <div
              className="w-full h-full flex overflow-x-auto snap-x snap-mandatory no-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              onScroll={(e) => {
                const scrollLeft = e.currentTarget.scrollLeft;
                const width = e.currentTarget.clientWidth;
                setActiveImageIndex(Math.round(scrollLeft / width));
              }}
            >
              {displayImages.map((img: any, idx: number) => (
                <div key={idx} className="w-full h-full shrink-0 snap-center relative">
                  <Image src={img.url} alt={`${product.name} ${idx}`} fill className="object-cover object-center" priority={idx === 0} />
                </div>
              ))}
            </div>
            <div className="absolute bottom-6 left-0 w-full flex justify-center gap-2 z-10">
              {displayImages.map((_, idx) => (
                <div key={idx} className={`h-[3px] transition-all duration-300 rounded-full ${activeImageIndex === idx ? 'w-6 bg-black' : 'w-2 bg-black/30'}`} />
              ))}
            </div>
          </div>

          {/* VERSI DESKTOP */}
          <div ref={mainContainerRef} className="hidden md:block h-full aspect-[1024/1537] relative overflow-hidden bg-gray-50 shadow-sm">
            <div
              className="w-full h-full flex flex-col transition-transform duration-[400ms] ease-[cubic-bezier(0.65,0,0.35,1)]"
              style={{ transform: `translateY(-${activeImageIndex * 100}%)` }}
            >
              {displayImages.map((img, idx) => (
                <div key={idx} className="w-full h-full shrink-0 relative">
                  <Image src={img.url} alt={product.name} fill className="object-cover" priority={idx === 0} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PANEL 3: INFO & SELECTIONS */}
        <div className="w-full max-w-sm flex flex-col">
          <h1 className="text-2xl font-serif italic mb-2">{product.name}</h1>
          <p className="text-sm font-medium mb-8">{formatRupiah(activeVariant?.price || product.price)}</p>

          {/* COLOR SELECTION */}
          <div className="mb-8">
            <span className="text-[10px] font-bold uppercase tracking-widest block mb-4">
              Color: {availableColors.find(c => c.id === selectedColorId)?.name}
            </span>
            <div className="flex flex-wrap gap-3">
              {availableColors.map((color) => {
                const hexes = color.hexCodes || ['#000000'];
                let background = hexes[0];
                if (hexes.length > 1) {
                  const stops = hexes.map((hex: string, i: number) => `${hex} ${(i / hexes.length) * 100}%, ${hex} ${((i + 1) / hexes.length) * 100}%`);
                  background = `linear-gradient(to right, ${stops.join(', ')})`;
                }
                return (
                  <button
                    key={color.id}
                    onClick={() => { setSelectedColorId(color.id); setSelectedSizeId(null); setActiveImageIndex(0); }}
                    className={`w-10 h-10 border transition-all ${selectedColorId === color.id ? 'border-black p-[2px]' : 'border-gray-200 hover:border-gray-400'}`}
                  >
                    <div className="w-full h-full" style={{ background }} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* CUSTOM SIZE SELECT */}
          <div className="mb-10 relative" ref={cartSectionRef}>
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest">Size</span>
              <button className="text-[9px] underline text-gray-400 uppercase">Size Guide</button>
            </div>
            <button
              onClick={() => setOpenAccordion(openAccordion === 'size' ? null : 'size')}
              className="w-full flex justify-between items-center py-4 border-b border-gray-200 text-[11px] uppercase tracking-widest"
            >
              <span>{activeVariant ? activeVariant.size.name : 'Choose Size'}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${openAccordion === 'size' ? 'rotate-180' : ''}`} />
            </button>
            <div className={`absolute top-full left-0 w-full bg-white z-50 border border-gray-100 shadow-xl transition-all ${openAccordion === 'size' ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
              {filteredVariants.map((v) => (
                <button
                  key={v.id}
                  disabled={v.stock <= 0}
                  onClick={() => { setSelectedSizeId(v.sizeId); setOpenAccordion(null); }}
                  className="w-full flex justify-between items-center px-4 py-4 text-[10px] uppercase tracking-widest hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed border-b border-gray-50 last:border-0"
                >
                  <span className={selectedSizeId === v.sizeId ? 'font-bold' : ''}>{v.size.name}</span>
                  <span className={v.stock <= 0 ? 'text-red-500' : 'text-gray-400'}>
                    {v.stock <= 0 ? 'Out of Stock' : `${v.stock} in stock`}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!selectedSizeId || (activeVariant?.stock || 0) <= 0}
            className="w-full bg-black text-white py-5 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-neutral-900 transition-all disabled:bg-gray-100 disabled:text-gray-300"
          >
            {selectedSizeId ? ((activeVariant?.stock || 0) > 0 ? 'ADD TO BAG' : 'OUT OF STOCK') : 'SELECT SIZE'}
          </button>

          {/* Description */}
          <div className="mt-12 space-y-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-3">Description</p>
              <p className={`text-[11px] text-gray-500 leading-relaxed ${isDescExpanded ? '' : 'line-clamp-3'}`}>
                {product.description}
              </p>
              <button onClick={() => setIsDescExpanded(!isDescExpanded)} className="text-[9px] underline uppercase mt-2">
                {isDescExpanded ? 'Read Less' : 'Read More'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* REKOMENDASI */}
      {relatedProducts.length > 0 && (
        <section className="bg-white border-t border-gray-100 px-4 md:px-12 py-20">
          <h2 className="text-center text-2xl font-serif italic mb-16 uppercase tracking-widest">You May Also Like</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((rel) => {
              const relColorsMap = new Map();
              (rel.variants || []).forEach((v: any) => {
                const colorObj = v.color || { id: v.colorId || 'default', name: 'Default', hexCodes: ['#000000'] };
                if (!relColorsMap.has(colorObj.id)) {
                  let hexes = ['#000000'];
                  if (Array.isArray(colorObj.hexCodes) && colorObj.hexCodes.length > 0) hexes = colorObj.hexCodes;
                  relColorsMap.set(colorObj.id, { id: colorObj.id, name: colorObj.name, hexCodes: hexes });
                }
              });
              const relAllColors = Array.from(relColorsMap.values());
              return (
                <ProductCard
                  key={rel.id}
                  product={{
                    id: rel.id,
                    name: rel.name,
                    price: rel.variants?.[0]?.price || rel.price,
                    images: rel.images?.map((i: any) => i.url) || [],
                    status: 'available',
                    allColors: relAllColors
                  }}
                />
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}