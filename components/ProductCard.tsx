'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price?: string | number;
    images: string[];
    status?: string;
    
    // 🚀 Data Warna Baru (Wajib dikirim dari API Shop Anda)
    allColors?: {
      id: string;
      name: string;
      hexCodes: string[];
    }[];
    selectedColorId?: string; // Untuk menandai warna apa yang aktif di card ini
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-play gambar saat di-hover
  useEffect(() => {
    let holdTimeout: NodeJS.Timeout;
    let autoPlayInterval: NodeJS.Timeout;

    if (isHovered && product.images.length > 1) {
      holdTimeout = setTimeout(() => {
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

  // 🚀 Tentukan warna aktif (dari props, atau default ambil warna pertama)
  const activeColorId = product.selectedColorId || product.allColors?.[0]?.id;
  const activeColorName = product.allColors?.find(c => c.id === activeColorId)?.name || 'COLOR';

  // 🚀 FUNGSI MAGIC: Render Kotak Multi-Hex / Solid
  const renderColorBox = (color: any) => {
    const isSelected = color.id === activeColorId;
    const hexes = color.hexCodes || ['#000000'];
    
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
        className={`w-3 h-3 border transition-all duration-300 relative ${
          isSelected ? "border-gray-900 scale-125 z-10 shadow-sm" : "border-gray-200"
        }`}
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
    <Link
      href={`/shop/${product.id}`}
      className="group flex flex-col cursor-pointer"
      onMouseEnter={() => {
        if (product.images.length > 1) setCurrentImgIndex(1);
        setIsHovered(true);
      }}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Bingkai Imej dengan Rasio Konsisten */}
      <div className="aspect-[1024/1537] w-full relative bg-gray-50 overflow-hidden">
        {product.images.length > 0 ? (
          product.images.map((imgUrl, idx) => (
            <Image
              key={idx}
              src={imgUrl}
              alt={`${product.name} - View ${idx + 1}`}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className={`object-cover object-center transition-opacity duration-700 ease-in-out ${
                currentImgIndex === idx ? 'opacity-100' : 'opacity-0'
              }`}
              priority={idx < 2}
            />
          ))
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 uppercase font-bold tracking-widest">
            No Image
          </div>
        )}
      </div>

      {/* Bahagian Teks & Warna (Dipusatkan) */}
      <div className="mt-5 text-center flex flex-col items-center">

        {/* Nama Produk / Nama Warna (Berganti saat Hover) */}
        <h3 className="text-[10px] md:text-[11px] font-bold text-black uppercase tracking-[0.2em] mb-2 line-clamp-1">
          {isHovered ? activeColorName : product.name}
        </h3>

        {/* List Warna Produk - Muncul Hanya Saat Hover */}
        <div
          className={`transition-all duration-500 ease-in-out flex gap-1.5 h-4 items-center ${
            isHovered ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-2 pointer-events-none'
          }`}
        >
          {product.allColors && product.allColors.length > 0 ? (
            product.allColors.map(color => renderColorBox(color))
          ) : (
            // Fallback kotak statis jika data allColors belum dilempar dari API Server
            <div className="w-3 h-3 rounded-full border border-gray-200 shadow-sm" style={{ backgroundColor: '#000000' }} />
          )}
        </div>
      </div>
    </Link>
  );
}