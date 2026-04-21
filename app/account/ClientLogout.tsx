'use client';

import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';
import { useCart } from '@/hooks/useCart'; // 🚀 1. Import useCart

export default function ClientLogout() {
  const cart = useCart(); // 🚀 2. Inisialisasi cart

  const handleLogout = async () => {
    cart.clearCart();

    await signOut({ callbackUrl: '/' });
  };

  return (
    <button
      onClick={handleLogout} // 🚀 Gunakan fungsi yang baru dibuat
      className="flex items-center gap-2 px-6 py-3 w-full md:w-auto justify-center bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 font-bold uppercase tracking-widest text-[10px] transition-colors"
    >
      <LogOut className="w-4 h-4" />
      Sign Out
    </button>
  );
}