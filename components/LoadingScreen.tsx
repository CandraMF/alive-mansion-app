'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function LoadingScreen() {
  const [isVisible, setIsVisible] = useState(true);
  
  // State untuk mengontrol tahapan animasi
  const [fadeVideo, setFadeVideo] = useState(false);
  const [wipeLogo, setWipeLogo] = useState(false);

  useEffect(() => {
    // Kunci scroll
    document.body.style.overflow = 'hidden';

    // Tahap 1: Mulai hilangkan video (Fade Out) setelah 1.5 detik
    const videoTimer = setTimeout(() => {
      setFadeVideo(true);
    }, 1500);

    // Tahap 2: Mulai hapus logo (Wipe) setelah 2 detik
    const logoTimer = setTimeout(() => {
      setWipeLogo(true);
    }, 2000);

    // Tahap 3: Hapus komponen dari DOM setelah semua animasi selesai (misal 3.5 detik total)
    const cleanupTimer = setTimeout(() => {
      setIsVisible(false);
      document.body.style.overflow = 'unset'; // Kembalikan scroll
    }, 3500);

    return () => {
      clearTimeout(videoTimer);
      clearTimeout(logoTimer);
      clearTimeout(cleanupTimer);
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black">
      
      {/* 1. VIDEO BACKGROUND (Efek Fade Out) */}
      <video
        src="/cinema.mp4" 
        autoPlay
        loop
        muted
        playsInline
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
          fadeVideo ? 'opacity-0' : 'opacity-40' // Berubah dari 40% menjadi 0%
        }`}
      />

      {/* 2. LOGO (Efek Wipe/Terhapus) */}
      {/* Container utama untuk mengatur posisi tengah */}
      <div className="relative z-10 flex items-center justify-center">
        
        {/* Container masking: 
          Tingginya (h) akan berubah dari penuh menjadi 0.
          overflow-hidden memastikan bagian logo yang di luar tinggi ini akan "terpotong" atau "terhapus".
        */}
        <div 
          className={`relative overflow-hidden transition-all duration-[1200ms] ease-[cubic-bezier(0.85,0,0.15,1)] ${
            wipeLogo ? 'h-0' : 'h-16 md:h-20' 
          }`}
          style={{ width: '200px' }} // Atur lebar fix agar mask tidak goyang
        >
          {/* Logo itu sendiri */}
          <div className="absolute top-0 left-0 w-full h-16 md:h-20 flex justify-center">
             <Image
              src="/logo-black.png" 
              alt="Alive Mansion Loading"
              fill
              className="object-contain invert brightness-0 animate-pulse" 
              priority
            />
          </div>
        </div>

      </div>

    </div>
  );
}