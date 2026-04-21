'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { createPortal } from 'react-dom'; // <--- KITA GUNAKAN PORTAL

export default function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const cart = useCart();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Kunci scroll halaman belakang saat laci terbuka
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  if (!isMounted) return null;

  const totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  return (
    <>
      {/* 1. TOMBOL PEMICU (Tetap berada di dalam Navbar) */}
      <button
        onClick={() => setIsOpen(true)}
        className="hover:opacity-50 transition-opacity uppercase tracking-widest font-light text-[10px] md:text-xs"
      >
        MY BAG {totalItems > 0 ? `(${totalItems})` : ''}
      </button>

      {/* 2. PORTAL: Melempar Laci Keluar dari Navbar langsung ke <body> */}
      {createPortal(
        <>
          {/* OVERLAY DENGAN EFEK BLUR (Animasi memudar yang lebih mulus) */}
          <div
            className={`fixed inset-0 bg-black/20 backdrop-blur-md z-[100] transition-all duration-500 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
              }`}
            onClick={() => setIsOpen(false)}
          />

          {/* PANEL DRAWER FULL HEIGHT (Menggunakan 100dvh agar aman di HP) */}
          <div
            className={`fixed top-0 right-0 h-[100dvh] w-full md:w-[480px] bg-white z-[110] shadow-2xl transform transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'
              }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-black">
                Shopping Bag {totalItems > 0 && `(${totalItems})`}
              </h2>
              <button onClick={() => setIsOpen(false)} className="text-2xl font-light hover:opacity-50 transition-opacity">
                &times;
              </button>
            </div>

            {/* Isi Keranjang (Scrollable) */}
            <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
              {cart.items.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center gap-4">
                  <p className="text-[10px] uppercase tracking-widest text-gray-400">Your bag is empty.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  <ul className="flex flex-col gap-8">
                    {cart.items.map((item) => (
                      <li key={`${item.id}-${item.size}`} className="flex gap-4">
                        <div className="w-20 aspect-[3/4] relative bg-gray-50 flex-shrink-0 border border-gray-100">
                          <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
                        </div>
                        <div className="flex flex-col flex-1">
                          <div className="flex justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-widest">{item.name}</span>
                            <button onClick={() => cart.removeItem(item.id, item.size)} className="text-gray-400 hover:text-black">&times;</button>
                          </div>
                          <span className="text-[9px] text-gray-500 uppercase mt-1">Color: {item.color} &nbsp;|&nbsp; Size: {item.size}</span>
                          <div className="mt-auto flex justify-between items-center">
                            <div className="flex items-center border border-gray-200">
                              <button onClick={() => cart.updateQuantity(item.id, item.size, Math.max(1, item.quantity - 1))} className="px-2 py-1 text-[10px] hover:bg-gray-50">-</button>
                              <span className="px-2 text-[10px] font-bold">{item.quantity}</span>
                              <button onClick={() => cart.updateQuantity(item.id, item.size, item.quantity + 1)} className="px-2 py-1 text-[10px] hover:bg-gray-50">+</button>
                            </div>
                            <span className="text-[10px] font-bold">{formatRupiah(item.price * item.quantity)}</span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {/* BAGIAN REKOMENDASI PRODUK */}
                  <div className="pt-8 border-t border-gray-100">
                    <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] mb-6 text-gray-400">You May Also Like</h3>
                    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                      {/* Dummy Rekomendasi */}
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="min-w-[120px] group cursor-pointer">
                          <div className="aspect-[3/4] bg-gray-50 mb-2 relative overflow-hidden border border-gray-100">
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                          </div>
                          <p className="text-[8px] font-bold uppercase tracking-widest truncate">Essential Tee {i}</p>
                          <p className="text-[8px] text-gray-500 mt-1">Rp 349.000</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer dengan Tombol Bersampingan */}
            {cart.items.length > 0 && (
              <div className="p-8 border-t border-gray-100 bg-white">
                <div className="flex justify-between mb-6">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Subtotal</span>
                  <span className="text-sm font-bold">{formatRupiah(subtotal)}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/cart"
                    onClick={() => setIsOpen(false)}
                    className="w-full py-4 border border-black text-[10px] font-bold uppercase tracking-widest text-center hover:bg-black hover:text-white transition-all"
                  >
                    View Cart
                  </Link>
                  <Link
                    href="/checkout"
                    onClick={() => setIsOpen(false)}
                    className="w-full py-4 bg-black text-white text-[10px] font-bold uppercase tracking-widest text-center hover:bg-gray-800 transition-all"
                  >
                    Checkout
                  </Link>
                </div>
              </div>
            )}
          </div>
        </>,
        document.body
      )}
    </>
  );
}