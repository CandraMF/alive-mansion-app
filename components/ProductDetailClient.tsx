'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';

export default function ProductDetailClient({ product, relatedProducts }: any) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [openAccordion, setOpenAccordion] = useState<string | null>('desc');
  const [currentMainImageIndex, setCurrentMainImageIndex] = useState(0);

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
    }).format(angka);
  };

  const nextMainImage = () => {
    setCurrentMainImageIndex((prev) => (prev + 1) % product.images.length);
  };
  const prevMainImage = () => {
    setCurrentMainImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  return (
    <>
      <section className="pt-24 md:pt-32 pb-16 px-6 md:px-12 max-w-[1600px] mx-auto flex flex-col md:flex-row gap-10 md:gap-16">
        
        {/* KOLOM KIRI: GALERI */}
        <div className="w-full md:w-[60%] flex flex-col md:flex-row-reverse gap-4 md:gap-6 relative">
          <div className="aspect-square w-full relative bg-gray-50 flex-grow border border-gray-100">
            {product.images.map((img: any, idx: number) => (
              <Image
                key={idx}
                src={img.url}
                alt={product.name}
                fill
                className={`object-cover transition-opacity duration-300 ${currentMainImageIndex === idx ? 'opacity-100' : 'opacity-0'}`}
                priority={idx === 0}
              />
            ))}
            <button onClick={prevMainImage} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/60 p-2 rounded-full hover:bg-white z-20">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
            </button>
            <button onClick={nextMainImage} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/60 p-2 rounded-full hover:bg-white z-20">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
            </button>
          </div>

          <div className="flex flex-row md:flex-col gap-2 z-30 absolute top-4 left-4 md:static md:w-[15%] md:pt-2">
            {product.images.map((img: any, idx: number) => (
              <button
                key={idx}
                onClick={() => setCurrentMainImageIndex(idx)}
                className={`aspect-square w-12 md:w-full relative border-2 transition-all ${currentMainImageIndex === idx ? 'border-black' : 'border-gray-200'}`}
              >
                <Image src={img.url} alt="preview" fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* KOLOM KANAN: INFO */}
        <div className="w-full md:w-[40%]">
          <div className="md:sticky md:top-32 flex flex-col">
            <div className="text-[10px] md:text-xs uppercase tracking-widest text-gray-500 font-medium mb-6">
              <Link href="/shop" className="hover:text-black">SHOP</Link>
              <span className="mx-2">/</span>
              <span className="text-black">{product.name}</span>
            </div>

            <h1 className="text-2xl md:text-[32px] font-bold uppercase tracking-tight mb-3 text-black leading-none">{product.name}</h1>
            <p className="text-base md:text-lg font-medium text-black mb-10">{formatRupiah(product.price)}</p>

            {/* Sizes */}
            <div className="mb-12 border-t border-gray-200 pt-8">
              <span className="text-[11px] font-bold uppercase tracking-widest text-black mb-4 block">Select Size</span>
              <div className="grid grid-cols-4 gap-2">
                {product.variants.map((v: any) => (
                  <button
                    key={v.id}
                    onClick={() => v.isAvailable && setSelectedSize(v.size)}
                    disabled={!v.isAvailable}
                    className={`py-3 flex flex-col items-center border transition-all ${
                      !v.isAvailable ? 'bg-gray-50 text-gray-300' : 
                      selectedSize === v.size ? 'bg-black text-white border-black' : 'hover:border-black'
                    }`}
                  >
                    <span className="text-xs font-bold uppercase">{v.size}</span>
                    <span className="text-[8px] uppercase tracking-widest">{v.isAvailable ? 'Available' : 'Sold Out'}</span>
                  </button>
                ))}
              </div>
            </div>

            <button 
              className="w-full bg-black text-white py-4 text-xs font-bold tracking-widest hover:bg-gray-800 disabled:bg-gray-200 mb-10"
              disabled={!selectedSize}
              onClick={() => alert("Added to cart!")}
            >
              {selectedSize ? 'ADD TO CART' : 'SELECT A SIZE'}
            </button>

            {/* Accordions */}
            <div className="border-t border-gray-200">
              <div className="border-b border-gray-200">
                <button onClick={() => setOpenAccordion(openAccordion === 'desc' ? null : 'desc')} className="w-full py-5 flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                  <span>Description</span>
                  <span>{openAccordion === 'desc' ? '-' : '+'}</span>
                </button>
                <div className={`overflow-hidden transition-all ${openAccordion === 'desc' ? 'max-h-96 pb-5' : 'max-h-0'}`}>
                  <p className="text-xs text-gray-600 leading-relaxed">{product.description}</p>
                </div>
              </div>
              <div className="border-b border-gray-200">
                <button onClick={() => setOpenAccordion(openAccordion === 'size' ? null : 'size')} className="w-full py-5 flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                  <span>Shipping & Returns</span>
                  <span>{openAccordion === 'size' ? '-' : '+'}</span>
                </button>
                <div className={`overflow-hidden transition-all ${openAccordion === 'size' ? 'max-h-96 pb-5' : 'max-h-0'}`}>
                  <p className="text-xs text-gray-600">Standard shipping 2-3 business days. Free returns within 7 days.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RELATED PRODUCTS */}
      <section className="bg-gray-50 border-t border-gray-200 px-6 md:px-12 py-16 md:py-24">
        <div className="max-w-[1600px] mx-auto">
          <h2 className="text-center text-xl md:text-3xl font-normal uppercase tracking-widest mb-16">You May Also Like</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((rel: any) => (
              <ProductCard key={rel.id} product={{
                ...rel,
                images: rel.images.map((i: any) => i.url), // Menyesuaikan prop ProductCard
                price: formatRupiah(rel.price)
              }} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}