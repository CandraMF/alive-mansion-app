'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { X, Ticket, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function PromoModal() {
  const { status } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenModal = sessionStorage.getItem('hasSeenPromoModal');

    if (status === 'unauthenticated' && !hasSeenModal) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('hasSeenPromoModal', 'true');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-500">
      <div className="bg-white w-full max-w-lg relative overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">

        {/* Tombol Close */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black z-10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Sisi Gambar / Visual */}
          <div className="md:w-2/5 bg-gray-100 relative min-h-[150px] md:min-h-full">
            <img
              src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop"
              alt="Promotion"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/10" />
          </div>

          {/* Konten Teks */}
          <div className="md:w-3/5 p-8 md:p-10 flex flex-col justify-center text-center md:text-left">
            <div className="flex justify-center md:justify-start mb-4">
              <div className="bg-black text-white p-2">
                <Ticket className="w-5 h-5" />
              </div>
            </div>

            <h2 className="text-2xl font-serif italic text-gray-900 mb-3">
              Unlock Your Welcome Gift
            </h2>

            <p className="text-xs text-gray-500 leading-relaxed mb-8 uppercase tracking-widest font-medium">
              Register now and receive an exclusive <span className="text-black font-bold">15% OFF</span> voucher for your first purchase.
            </p>

            <Link
              href="/register"
              onClick={handleClose}
              className="inline-flex items-center justify-center gap-2 bg-black text-white px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-all group"
            >
              Join the Mansion
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </Link>

            <button
              onClick={handleClose}
              className="mt-6 text-[9px] uppercase tracking-widest text-gray-400 hover:text-black font-bold transition-colors"
            >
              No thanks, I'll shop full price
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}