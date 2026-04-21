'use client';

import { useCart } from '@/hooks/useCart';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function CartPage() {
  const cart = useCart();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const subtotal = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 pt-32 pb-20">
      <h1 className="text-3xl font-bold uppercase tracking-tighter mb-12">Your Shopping Bag</h1>

      {cart.items.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center gap-6">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">Your bag is currently empty.</p>
          <Link href="/shop" className="text-xs font-bold uppercase tracking-widest border-b border-black pb-1">Continue Shopping</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* List Item */}
          <div className="lg:col-span-2 space-y-8">
            <div className="hidden md:grid grid-cols-4 pb-4 border-b border-gray-100 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              <div className="col-span-2">Product</div>
              <div>Quantity</div>
              <div className="text-right">Total</div>
            </div>

            {cart.items.map((item) => (
              <div key={`${item.id}-${item.size}`} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center border-b border-gray-100 pb-8">
                <div className="col-span-2 flex gap-6">
                  <div className="w-24 aspect-[3/4] relative bg-gray-50 flex-shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <h3 className="text-xs font-bold uppercase tracking-wider">{item.name}</h3>
                    <p className="text-[10px] text-gray-500 uppercase mt-2">Color: {item.color} &nbsp;|&nbsp; Size: {item.size}</p>
                    <button onClick={() => cart.removeItem(item.id, item.size)} className="text-[9px] uppercase tracking-widest text-red-500 mt-4 text-left">Remove</button>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="flex items-center border border-gray-200">
                    <button onClick={() => cart.updateQuantity(item.id, item.size, Math.max(1, item.quantity - 1))} className="px-4 py-2 text-xs">-</button>
                    <span className="px-4 text-xs font-bold">{item.quantity}</span>
                    <button onClick={() => cart.updateQuantity(item.id, item.size, item.quantity + 1)} className="px-4 py-2 text-xs">+</button>
                  </div>
                </div>

                <div className="text-right font-bold text-sm">
                  {formatRupiah(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-gray-50 p-8 h-fit">
            <h2 className="text-xs font-bold uppercase tracking-widest mb-8">Order Summary</h2>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-xs uppercase tracking-widest">
                <span className="text-gray-500">Subtotal</span>
                <span>{formatRupiah(subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs uppercase tracking-widest">
                <span className="text-gray-500">Shipping</span>
                <span className="text-[10px]">Calculated at checkout</span>
              </div>
            </div>
            <div className="border-t border-gray-200 pt-6 mb-8 flex justify-between">
              <span className="text-xs font-bold uppercase tracking-widest">Total</span>
              <span className="text-lg font-bold">{formatRupiah(subtotal)}</span>
            </div>
            <Link href="/checkout" className="w-full block bg-black text-white text-center py-5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors">
              Proceed to Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}