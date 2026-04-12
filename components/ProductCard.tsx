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
    status: string;
    color?: string; // Contoh: 'BLACK'
    colorsCount?: number;
    colorHex?: string; // Tambah ini untuk kod warna (cth: '#000000')
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

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
              className={`object-cover object-center ${currentImgIndex === idx ? 'opacity-100' : 'opacity-0'
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


        {/* Nama Produk / Warna */}
        <h3 className="text-[10px] md:text-[11px] font-bold text-black uppercase tracking-[0.2em] mb-1.5 line-clamp-1">
          {isHovered ? (product.color || 'BLACK') : product.name}
        </h3>
        {/* Elemen Warna Bulat - Muncul Hanya Saat Hover */}
        <div
          className={`mb-3 transition-all duration-500 ease-in-out ${isHovered ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-2 pointer-events-none'
            }`}
        >
          <div
            className="w-3 h-3 rounded-full border border-gray-200 shadow-sm"
            style={{ backgroundColor: product.colorHex || 'black' }} // Menggunakan colorHex jika ada
          />
        </div>
      </div>
    </Link>
  );
}