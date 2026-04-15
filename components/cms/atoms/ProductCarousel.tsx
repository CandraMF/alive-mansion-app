import React, { useState, useRef } from 'react';
import { cn } from "@/lib/utils";
import { useAtomicCss } from '@/hooks/useAtomicCss';

// Sub-komponen kartu produk internal
const InternalProductCard = ({ item, index, isPublic }: any) => {
  const [isHovered, setIsHovered] = useState(false);
  const displayImage = isHovered && item.hoverImage ? item.hoverImage : item.primaryImage;

  const content = (
    <div className="group/card block">
      <div className="aspect-[4/5] bg-green-100 overflow-hidden relative mb-4">
        {displayImage ? (
          <img src={displayImage} alt={`Prod-${index}`} className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-400 font-bold uppercase tracking-widest border border-dashed border-gray-200">No Image</div>
        )}
      </div>
      <div className="text-center px-2">
        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1 text-gray-900 transition-colors group-hover/card:text-blue-600">
          {item.variantId ? (isPublic ? 'View Product' : (isHovered ? 'Quick View' : 'Product Selected')) : `Product Item ${index + 1}`}
        </h4>
      </div>
    </div>
  );

  return (
    <div
      className="snap-start shrink-0 w-[80vw] md:w-[calc(20vw-0.8rem)]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isPublic ? <a href={item.variantId ? `/products/${item.variantId}` : '#'}>{content}</a> : content}
    </div>
  );
};

export const ProductCarousel = ({ block, className, isPublic }: any) => {
  const { atomClass, baseInlineStyle, injectedCSS, getValue } = useAtomicCss(block);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollLeft = scrollRef.current.scrollLeft;
    const itemWidth = scrollRef.current.children[0]?.clientWidth || 1;
    setActiveIndex(Math.round(scrollLeft / itemWidth));
  };

  const items = getValue('items') || (isPublic ? [] : [{}, {}, {}, {}, {}]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: injectedCSS }} />
      <div className={cn(atomClass, "transition-all w-full overflow-hidden", className)} style={baseInlineStyle}>
        <div ref={scrollRef} onScroll={handleScroll} className="flex overflow-x-auto snap-x snap-mandatory gap-4 px-6 md:px-0 pb-4 no-scrollbar scroll-px-6 md:scroll-px-0">
          {items.map((item: any, idx: number) => (
            <InternalProductCard key={idx} item={item} index={idx} isPublic={isPublic} />
          ))}
        </div>
        {/* Indikator dots untuk mobile */}
        <div className="flex justify-center items-center gap-2 mt-2 md:hidden pb-4">
          {items.map((_: any, i: number) => (
            <div key={i} className={`h-1 transition-all duration-300 ${activeIndex === i ? 'w-8 bg-black' : 'w-2 bg-gray-300'}`} />
          ))}
        </div>
      </div>
    </>
  );
};

export default ProductCarousel;