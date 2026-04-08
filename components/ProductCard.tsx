'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: string;
    images: string[];
    status: string; // 'available' atau 'sold_out'
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    let holdTimeout: NodeJS.Timeout;
    let autoPlayInterval: NodeJS.Timeout;

    if (isHovered && product.images.length > 1) {
      // TAHAN selama 500ms
      holdTimeout = setTimeout(() => {
        // PUTAR otomatis setiap 1200ms
        autoPlayInterval = setInterval(() => {
          setCurrentImgIndex((prev) => (prev + 1) % product.images.length);
        }, 1200);
      }, 500);
    } else {
      setCurrentImgIndex(0);
    }

    return () => {
      clearTimeout(holdTimeout);
      clearInterval(autoPlayInterval);
    };
  }, [isHovered, product.images.length]);

  return (
    <Link
      href={`/shop/${product.id}`}
      className="group flex flex-col cursor-pointer"
      onMouseEnter={() => {
        // Instan ganti ke gambar kedua saat kursor masuk
        if (product.images.length > 1) setCurrentImgIndex(1);
        setIsHovered(true);
      }}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="aspect-[3/4] md:aspect-square w-full relative bg-gray-50 overflow-hidden rounded-sm">
        {product.images.length > 0 ? (
          product.images.map((imgUrl, idx) => (
            <Image
              key={idx}
              src={imgUrl}
              alt={`${product.name} - View ${idx + 1}`}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className={`object-cover object-center transition-opacity duration-300 ease-in-out ${currentImgIndex === idx ? 'opacity-100' : 'opacity-0'
                }`}
              priority={idx < 2}
            />
          ))
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 uppercase font-bold tracking-widest">
            No Image
          </div>
        )}

        {/* Status Label (Sold Out / View Detail) */}
        <div className="absolute bottom-0 left-0 w-full translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out flex z-10">
          {product.status === 'sold_out' ? (
            <div className="w-full bg-gray-200 text-gray-500 text-center py-3 text-[10px] md:text-xs font-bold tracking-widest uppercase">
              Sold Out
            </div>
          ) : (
            <div className="w-full bg-white text-black text-center py-3 text-[10px] md:text-xs font-bold tracking-widest uppercase border-t border-gray-200 hover:bg-black hover:text-white transition-colors">
              View Detail
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 text-left">
        <h3 className="text-[11px] md:text-xs font-bold text-black uppercase tracking-[0.15em] mb-1 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-[11px] md:text-xs font-medium text-gray-500">
          {product.price}
        </p>
      </div>
    </Link>
  );
}