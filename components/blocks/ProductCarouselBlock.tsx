'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CMSBlockWrapper } from '@/components/cms/CMSHelpers';

// ==========================================
// 1. SUB-KOMPONEN KARTU PRODUK
// Dipisahkan agar setiap kartu punya useState (hover) sendiri-sendiri,
// sehingga tidak melanggar "Rules of Hooks" di dalam map().
// ==========================================
function CarouselCard({ p, isCms, index }: { p: any, isCms?: boolean, index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const currentImg = isHovered && p.hoverImage ? p.hoverImage : p.primaryImage;

  const CardContent = (
    <div
      className="group block snap-start shrink-0 w-[80vw] md:w-[calc(20vw-0.8rem)] cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="overflow-hidden mb-4 bg-gray-100 aspect-[4/5] relative">
        {currentImg ? (
          <Image src={currentImg} alt={`Product ${index}`} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-400 font-bold uppercase tracking-widest border border-dashed border-gray-200">No Image</div>
        )}
      </div>

      <div className="text-center mt-4">
        <h3 className="text-[10px] md:text-[11px] font-bold text-black uppercase tracking-[0.2em] mb-1.5 truncate">
          {p.variantId ? (isHovered ? 'COLOR SELECTED' : 'PRODUCT SELECTED') : `PRODUCT ${index + 1}`}
        </h3>
      </div>
    </div>
  );

  if (isCms) return <div>{CardContent}</div>;
  return <Link href={`/shop/${p.variantId || ''}`}>{CardContent}</Link>;
}

// ==========================================
// 2. KOMPONEN UTAMA (BLOCK)
// ==========================================
export default function ProductCarouselBlock({
  data, isCms, isActive, onSelect
}: {
  data: any, isCms?: boolean, isActive?: boolean, onSelect?: () => void
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const items = data.items && data.items.length > 0 ? data.items : [{}, {}, {}, {}, {}]; // Dummy placeholders

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const scrollLeft = scrollContainerRef.current.scrollLeft;
    const itemWidth = scrollContainerRef.current.children[0].clientWidth;
    const index = Math.round(scrollLeft / itemWidth);
    setActiveIndex(index);
  };

  return (
    <CMSBlockWrapper isCms={isCms} isActive={isActive} onClick={onSelect}>
      <section className="py-16 bg-gray-50/50 w-full overflow-hidden">

        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory gap-4 px-6 md:px-10 pb-4 no-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {items.map((p: any, index: number) => (
            // Kita panggil sub-komponennya di sini! Bersih dan bebas error.
            <CarouselCard key={index} p={p} isCms={isCms} index={index} />
          ))}
        </div>

        {/* Indikator Titik Mobile */}
        <div className="flex justify-center items-center gap-2 mt-6 md:hidden">
          {items.map((_: any, i: number) => (
            <div key={i} className={`h-1 transition-all duration-300 ease-in-out ${activeIndex === i ? 'w-8 bg-black' : 'w-2 bg-gray-300'}`} />
          ))}
        </div>

      </section>
    </CMSBlockWrapper>
  );
}