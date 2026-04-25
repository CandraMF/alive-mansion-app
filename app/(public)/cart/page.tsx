'use client';

import { useCart } from '@/hooks/useCart';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ChevronLeft } from 'lucide-react';

export default function CartPage() {
  const cart = useCart();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  // 🚀 HITUNG HANYA BARANG YANG DICENTANG
  const selectedCartItems = cart.items.filter(item => cart.selectedItems.includes(`${item.id}-${item.size}`));
  const subtotal = selectedCartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const isAllSelected = cart.items.length > 0 && cart.selectedItems.length === cart.items.length;
  const selectedCount = cart.selectedItems.length;

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  const handleCheckout = () => {
    if (selectedCount > 0) router.push('/checkout');
  };

  return (
    <div className="bg-gray-50 min-h-screen pt-28 pb-32 md:pb-20 font-sans text-black relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
        <div className="mb-8">
          <Link href="/shop" className="inline-flex items-center text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" /> Lanjut Belanja
          </Link>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tighter mb-8 md:mb-12">Your Shopping Bag</h1>

        {cart.items.length === 0 ? (
          <div className="py-20 bg-white border border-gray-100 text-center flex flex-col items-center gap-6 shadow-sm">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">Keranjang Anda masih kosong.</p>
            <Link href="/shop" className="text-[10px] font-bold uppercase tracking-widest border border-black px-6 py-3 hover:bg-black hover:text-white transition-colors">Belanja Sekarang</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

            {/* KOLOM KIRI: List Item */}
            <div className="lg:col-span-8 bg-white border border-gray-100 shadow-sm">
              {/* Header Tabel (Desktop) */}
              <div className="hidden md:grid grid-cols-12 p-6 border-b border-gray-100 text-[10px] font-bold uppercase tracking-widest text-gray-400 items-center">
                <div className="col-span-6 flex items-center gap-4">
                  <input type="checkbox" checked={isAllSelected} onChange={(e) => cart.toggleSelectAll(e.target.checked)} className="w-4 h-4 accent-black cursor-pointer" />
                  <span>Product</span>
                </div>
                <div className="col-span-3 text-center">Quantity</div>
                <div className="col-span-3 text-right">Total</div>
              </div>

              {/* Header "Pilih Semua" (Mobile) */}
              <div className="md:hidden p-4 border-b border-gray-100 flex items-center gap-3">
                <input type="checkbox" checked={isAllSelected} onChange={(e) => cart.toggleSelectAll(e.target.checked)} className="w-4 h-4 accent-black cursor-pointer" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Pilih Semua ({cart.items.length})</span>
              </div>

              {/* List Produk */}
              <div className="flex flex-col">
                {cart.items.map((item) => {
                  const itemKey = `${item.id}-${item.size}`;
                  const isSelected = cart.selectedItems.includes(itemKey);

                  return (
                    <div key={itemKey} className={`p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 items-center border-b border-gray-50 last:border-0 transition-colors ${isSelected ? 'bg-gray-50/50' : 'bg-white'}`}>

                      {/* Produk Detail */}
                      <div className="col-span-1 md:col-span-6 flex items-start gap-3 md:gap-4">
                        <div className="pt-2">
                          <input type="checkbox" checked={isSelected} onChange={() => cart.toggleSelect(item.id, item.size)} className="w-4 h-4 md:w-5 md:h-5 accent-black cursor-pointer" />
                        </div>
                        <div className="w-20 md:w-24 aspect-[3/4] relative bg-gray-50 flex-shrink-0 border border-gray-100">
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        </div>
                        <div className="flex flex-col flex-1 py-1">
                          <h3 className="text-[11px] md:text-xs font-bold uppercase tracking-wider leading-tight">{item.name}</h3>
                          <p className="text-[9px] md:text-[10px] text-gray-500 uppercase mt-1.5 md:mt-2">{item.color} &nbsp;|&nbsp; {item.size}</p>
                          <p className="md:hidden text-xs font-bold mt-3">{formatRupiah(item.price)}</p>
                        </div>
                      </div>

                      {/* Quantity Control */}
                      <div className="col-span-1 md:col-span-3 flex items-center justify-between md:justify-center pl-7 md:pl-0">
                        <div className="flex items-center border border-gray-200 bg-white">
                          <button onClick={() => cart.updateQuantity(item.id, item.size, Math.max(1, item.quantity - 1))} className="w-8 h-8 md:w-10 md:h-10 text-lg hover:bg-gray-50 transition-colors">-</button>
                          <span className="w-8 md:w-10 text-center text-[11px] md:text-xs font-bold">{item.quantity}</span>
                          <button onClick={() => cart.updateQuantity(item.id, item.size, item.quantity + 1)} className="w-8 h-8 md:w-10 md:h-10 text-lg hover:bg-gray-50 transition-colors">+</button>
                        </div>
                        <button onClick={() => cart.removeItem(item.id, item.size)} className="md:hidden text-[9px] font-bold uppercase tracking-widest text-gray-400 hover:text-red-500">Hapus</button>
                      </div>

                      {/* Harga Total Baris */}
                      <div className="hidden md:flex col-span-3 flex-col items-end gap-2">
                        <span className="font-bold text-sm">{formatRupiah(item.price * item.quantity)}</span>
                        <button onClick={() => cart.removeItem(item.id, item.size)} className="text-[9px] font-bold uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors">Hapus</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* KOLOM KANAN: Summary (Hanya tampil di Desktop) */}
            <div className="hidden lg:block lg:col-span-4 bg-white border border-gray-100 p-8 shadow-sm sticky top-32">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-8 border-b border-gray-50 pb-4">Order Summary</h2>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-[10px] uppercase tracking-widest">
                  <span className="text-gray-500">Total Produk ({selectedCount})</span>
                  <span className="font-bold">{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[10px] uppercase tracking-widest">
                  <span className="text-gray-500">Ongkos Kirim</span>
                  <span className="text-gray-400 italic">Dihitung di checkout</span>
                </div>
              </div>
              <div className="border-t border-black pt-6 mb-8 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest">Total</span>
                <span className="text-xl font-serif italic font-bold">{formatRupiah(subtotal)}</span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={selectedCount === 0}
                className="w-full bg-black text-white text-center py-5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-800 disabled:bg-gray-300 transition-colors"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 🚀 STICKY BOTTOM BAR (Khusus Mobile - ala Shopee) */}
      {cart.items.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-[0_-4px_15px_rgba(0,0,0,0.05)] animate-in slide-in-from-bottom-full">
          <div className="flex items-center justify-between px-4 sm:px-6 h-[72px]">
            {/* Bagian Kiri: Checkbox Semua */}
            <label className="flex items-center gap-3 cursor-pointer h-full py-4">
              <input type="checkbox" checked={isAllSelected} onChange={(e) => cart.toggleSelectAll(e.target.checked)} className="w-5 h-5 accent-black" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Semua</span>
            </label>

            {/* Bagian Kanan: Total & Tombol */}
            <div className="flex items-center gap-4 h-full">
              <div className="flex flex-col items-end justify-center">
                <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Total</span>
                <span className="text-sm font-bold text-black">{formatRupiah(subtotal)}</span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={selectedCount === 0}
                className="h-full bg-black text-white px-6 sm:px-8 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 disabled:bg-gray-300 transition-colors flex items-center justify-center"
              >
                Checkout ({selectedCount})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}