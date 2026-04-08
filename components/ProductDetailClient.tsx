'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { useCart } from '@/hooks/useCart';

export default function ProductDetailClient({ product, relatedProducts }: { product: any, relatedProducts: any[] }) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [openAccordion, setOpenAccordion] = useState<string | null>('desc');
  const [currentMainImageIndex, setCurrentMainImageIndex] = useState(0);

  // Memanggil hook keranjang belanja dari Zustand
  const cart = useCart();

  // Helper untuk format IDR
  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
    }).format(angka);
  };

  const toggleAccordion = (section: string) => {
    setOpenAccordion(openAccordion === section ? null : section);
  };

  const nextMainImage = () => {
    setCurrentMainImageIndex((prev) => (prev + 1) % product.images.length);
  };
  const prevMainImage = () => {
    setCurrentMainImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  if (!product) return <div className="min-h-screen flex items-center justify-center pt-20">Product Not Found</div>;

  return (
    <main className="min-h-screen bg-white">
      {/* SEKSI UTAMA DETAIL PRODUK */}
      <section className="pt-24 md:pt-24 pb-16 px-6 md:px-12 max-w-[1600px] mx-auto flex flex-col md:flex-row gap-10 md:gap-16">

        {/* --- KOLOM KIRI: GALERI --- */}
        <div className="w-full md:w-[60%] flex flex-col md:flex-row-reverse gap-4 md:gap-6 relative">

          {/* 1. GAMBAR UTAMA */}
          <div className="aspect-square w-full relative bg-gray-50 flex-grow border border-gray-100">
            {product.images.map((img: any, idx: number) => (
              <Image
                key={idx}
                src={img.url}
                alt={`${product.name} detail ${idx + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, 60vw"
                className={`object-cover object-center transition-opacity duration-300 ease-in-out ${currentMainImageIndex === idx ? 'opacity-100' : 'opacity-0'}`}
                priority={idx === 0}
              />
            ))}
            {product.images.length > 1 && (
              <>
                <button onClick={prevMainImage} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/60 p-2 rounded-full hover:bg-white transition-colors z-20">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                </button>
                <button onClick={nextMainImage} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/60 p-2 rounded-full hover:bg-white transition-colors z-20">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                </button>
              </>
            )}
          </div>

          {/* 2. THUMBNAILS / PREVIEW */}
          <div className="flex flex-row md:flex-col gap-2 md:gap-3 z-30 absolute top-4 left-4 md:static md:w-[15%] md:pt-2">
            {product.images.map((img: any, idx: number) => (
              <button
                key={idx}
                onClick={() => setCurrentMainImageIndex(idx)}
                className={`aspect-square w-12 md:w-full relative overflow-hidden bg-gray-100 border-2 transition-all duration-200 flex-shrink-0 ${currentMainImageIndex === idx ? 'border-gray-900' : 'border-transparent hover:border-gray-300'}`}
              >
                <Image src={img.url} alt={`Preview ${idx + 1}`} fill className="object-cover object-center" />
              </button>
            ))}
          </div>
        </div>

        {/* --- KOLOM KANAN: DETAIL INFO --- */}
        <div className="w-full md:w-[40%] relative">
          <div className="md:sticky md:top-32 flex flex-col">

            {/* Navigasi / Breadcrumb */}
            <div className="text-[10px] md:text-xs uppercase tracking-widest text-gray-500 font-medium mb-6">
              <Link href="/shop" className="hover:text-black transition-colors">SHOP</Link>
              <span className="mx-2">/</span>
              <span className="text-black">{product.name}</span>
            </div>

            {/* Judul & Harga */}
            <h1 className="text-2xl md:text-[32px] font-bold uppercase tracking-tight mb-3 leading-none text-black">
              {product.name}
            </h1>
            <p className="text-base md:text-lg font-medium text-black mb-10">
              {formatRupiah(product.price)}
            </p>

            {/* Pilihan Ukuran dengan Status Ketersediaan */}
            <div className="mb-12 border-t border-gray-200 pt-8 w-full">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[11px] font-bold uppercase tracking-widest text-black">Select Size</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {product.variants.map((v: any) => (
                  <button
                    key={v.id}
                    onClick={() => v.isAvailable && setSelectedSize(v.size)}
                    disabled={!v.isAvailable}
                    className={`py-3 flex flex-col items-center justify-center border transition-all duration-200 ${!v.isAvailable
                        ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                        : selectedSize === v.size
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 bg-white text-black hover:border-black'
                      }`}
                  >
                    <span className="text-xs font-bold uppercase">{v.size}</span>
                    <span className={`text-[8px] mt-1 tracking-[0.15em] uppercase font-bold ${!v.isAvailable ? 'text-gray-400' : selectedSize === v.size ? 'text-gray-300' : 'text-green-600'
                      }`}>
                      {v.isAvailable ? 'Available' : 'Sold Out'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tombol Add to Cart terintegrasi dengan Zustand */}
            <button
              onClick={() => {
                if (!selectedSize) return;

                // Masukkan data ke keranjang Zustand
                cart.addItem({
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  image: product.images[0]?.url || '',
                  size: selectedSize
                });

                alert(`Added ${product.name} (Size: ${selectedSize}) to Cart!`);
              }}
              className="w-full bg-black text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors mb-4 disabled:bg-gray-200 disabled:text-gray-400"
              disabled={!selectedSize}
            >
              {selectedSize ? 'ADD TO CART' : 'SELECT A SIZE'}
            </button>

            {/* Payment Options (Simulasi) */}
            <div className="flex items-center gap-2 mb-10 text-[10px] text-gray-500 uppercase tracking-wider font-medium">
              <span>Pay later with</span>
              <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-sm text-[8px] font-bold">ATOME</span>
              <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded-sm text-[8px] font-bold">SPAYLATER</span>
            </div>

            {/* Accordions (Hanya 2 Menu) */}
            <div className="border-t border-gray-200 w-full mt-4">

              {/* 1. Description & Specification */}
              <div className="border-b border-gray-200">
                <button onClick={() => toggleAccordion('desc')} className="w-full py-5 flex justify-between items-center text-xs font-bold uppercase tracking-widest text-black hover:text-gray-500">
                  <span>Description & Specification</span>
                  <span className="text-lg font-light">{openAccordion === 'desc' ? '-' : '+'}</span>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openAccordion === 'desc' ? 'max-h-[500px] pb-5 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="text-xs text-gray-600 font-light leading-relaxed">
                    <p className="mb-4 whitespace-pre-line">{product.description}</p>
                    <p className="font-bold mb-2">Specifications:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>100% Premium Cotton</li>
                      <li>Heavyweight Construction</li>
                      <li>Pre-shrunk to minimize shrinkage</li>
                      <li>Machine wash cold, tumble dry low</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 2. Size Chart (Tabel) */}
              <div className="border-b border-gray-200">
                <button onClick={() => toggleAccordion('size')} className="w-full py-5 flex justify-between items-center text-xs font-bold uppercase tracking-widest text-black hover:text-gray-500">
                  <span>Size Chart</span>
                  <span className="text-lg font-light">{openAccordion === 'size' ? '-' : '+'}</span>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openAccordion === 'size' ? 'max-h-[500px] pb-5 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <table className="w-full text-[10px] md:text-[11px] uppercase tracking-widest text-left mt-2">
                    <thead>
                      <tr className="border-b border-gray-300 text-gray-400">
                        <th className="py-2 font-bold w-1/3">Size</th>
                        <th className="py-2 font-bold w-1/3">Width</th>
                        <th className="py-2 font-bold w-1/3">Length</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-600 font-medium">
                      <tr className="border-b border-gray-100">
                        <td className="py-2.5">S</td>
                        <td className="py-2.5">50 cm</td>
                        <td className="py-2.5">70 cm</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2.5">M</td>
                        <td className="py-2.5">53 cm</td>
                        <td className="py-2.5">72 cm</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2.5">L</td>
                        <td className="py-2.5">56 cm</td>
                        <td className="py-2.5">74 cm</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2.5">XL</td>
                        <td className="py-2.5">59 cm</td>
                        <td className="py-2.5">76 cm</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* --- SEKSI: YOU MAY ALSO LIKE --- */}
      {relatedProducts.length > 0 && (
        <section className="bg-gray-50 border-t border-gray-200 px-6 md:px-12 py-16 md:py-24">
          <div className="max-w-[1600px] mx-auto">
            <h2 className="text-center text-xl md:text-3xl font-normal uppercase tracking-widest mb-12 md:mb-16 text-black">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-16">
              {relatedProducts.map((relProduct) => {
                const isSoldOut = relProduct.variants.length > 0 && !relProduct.variants.some((v: any) => v.isAvailable);

                return (
                  <ProductCard
                    key={relProduct.id}
                    product={{
                      id: relProduct.id,
                      name: relProduct.name,
                      price: formatRupiah(relProduct.price),
                      images: relProduct.images.map((i: any) => i.url),
                      status: isSoldOut ? 'sold_out' : 'available'
                    }}
                  />
                )
              })}
            </div>
          </div>
        </section>
      )}

    </main>
  );
}