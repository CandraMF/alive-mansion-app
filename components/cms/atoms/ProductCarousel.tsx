'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from "@/lib/utils";
import { useAtomicCss } from '@/hooks/useAtomicCss';

export const ProductCarousel = ({ block, isPublic = false }: any) => {
  const { atomClass, wrapperClass, injectedCSS, getValue } = useAtomicCss(block);

  const items = getValue('items') || [];
  const showDetails = getValue('showDetails') !== 'no';

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
    <div className={cn(wrapperClass, "w-full overflow-hidden")}>
      <style suppressHydrationWarning>{injectedCSS}</style>
      <div className={atomClass}>
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory gap-4 px-6 md:px-0 pb-4 no-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-px-6 md:scroll-px-0"
        >
          {items.map((item: any, index: number) => (
            <CarouselCard
              key={index}
              item={item}
              showDetails={showDetails}
              isPublic={isPublic}
            />
          ))}
        </div>

        {/* Pagination Dots (Mobile) */}
        <div className="flex justify-center items-center gap-2 mt-6 md:hidden">
          {items.map((_: any, i: number) => (
            <div
              key={i}
              className={`h-1 transition-all duration-300 ease-in-out ${activeIndex === i ? 'w-8 bg-black' : 'w-2 bg-gray-300'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// SUB-KOMPONEN: KARTU CAROUSEL INDIVIDUAL
// ==========================================
const CarouselCard = ({ item, showDetails, isPublic }: any) => {
  const [isHovered, setIsHovered] = useState(false);

  const product = item.productData || {};
  const activeColorId = item.activeColorId; // Warna yang ditandai untuk item ini
  const primaryImage = item.primaryImage || '';
  const hoverImage = item.hoverImage || '';
  const url = item.customUrl ? item.customUrl : (product.id ? `/shop/${product.id}` : '#');

  const CardWrapper = isPublic ? Link : 'div';

  // Mendapatkan nama warna yang sedang aktif
  const activeColorName = product.allColors?.find((c: any) => c.id === activeColorId)?.name || 'COLOR';

  // 🚀 FUNGSI MAGIC: Render Kotak Multi-Hex / Solid
  const renderColorBox = (color: any) => {
    const isSelected = color.id === activeColorId;
    const hexes = color.hexes || ['#000000'];

    // Jika hex lebih dari 1 (misal Hitam/Putih), buat gradient membelah vertikal!
    let background = hexes[0];
    if (hexes.length > 1) {
      const stops = hexes.map((hex: string, i: number) => {
        const start = (i / hexes.length) * 100;
        const end = ((i + 1) / hexes.length) * 100;
        return `${hex} ${start}%, ${hex} ${end}%`;
      });
      // to right = pembagian vertikal (kolom-kolom)
      background = `linear-gradient(to right, ${stops.join(', ')})`;
    }

    return (
      <div
        key={color.id}
        className={cn(
          "w-3 h-3 border transition-all duration-300 relative",
          isSelected ? "border-gray-900 scale-125 z-10 shadow-sm" : "border-gray-200"
        )}
        style={{ background }}
        title={color.name}
      >
        {/* Titik putih/hitam di tengah untuk menandai bahwa ini aktif */}
        {isSelected && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[3px] h-[3px] bg-white rounded-full mix-blend-difference" />
          </div>
        )}
      </div>
    );
  };

  return (
    <CardWrapper
      href={isPublic ? url : undefined}
      className="group flex flex-col cursor-pointer snap-start shrink-0 w-[80vw] md:w-[calc(20vw-0.8rem)]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* AREA GAMBAR */}
      <div className="aspect-[1024/1537] w-full relative bg-gray-50 overflow-hidden">
        {primaryImage ? (
          <>
            <Image
              src={primaryImage}
              alt={product.productName || 'Product Image'}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className={`object-cover object-center transition-opacity duration-700 ease-in-out ${isHovered && hoverImage ? 'opacity-0' : 'opacity-100'}`}
            />
            {hoverImage && (
              <Image
                src={hoverImage}
                alt={`${product.productName || 'Product'} Hover`}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className={`object-cover object-center transition-opacity duration-700 ease-in-out ${isHovered ? 'opacity-100' : 'opacity-0'}`}
              />
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 uppercase font-bold tracking-widest bg-gray-100 border border-dashed border-gray-300">
            No Image
          </div>
        )}
      </div>

      {/* AREA TEKS & KOTAK WARNA */}
      {showDetails && (
        <div className="mt-5 text-center flex flex-col items-center">
          <h3 className="text-[10px] md:text-[11px] font-bold text-black uppercase tracking-[0.2em] mb-2 line-clamp-1">
            {isHovered ? activeColorName : (product.productName || 'NAMA PRODUK')}
          </h3>

          <div className={`transition-all duration-500 ease-in-out flex gap-1.5 h-4 items-center ${isHovered ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-2 pointer-events-none'}`}>
            {/* Loop semua warna unik milik produk ini */}
            {product.allColors?.map((color: any) => renderColorBox(color))}
          </div>
        </div>
      )}
    </CardWrapper>
  );
};

export default ProductCarousel;