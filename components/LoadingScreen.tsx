'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function LoadingScreen() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [fadeVideo, setFadeVideo] = useState(false);
  const [wipeLogo, setWipeLogo] = useState(false);

  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const isHomePage = pathname === '/' || pathname === '/home';

    if (!isHomePage) {
      setIsVisible(false);

      document.body.style.overflow = 'unset';
      return;
    }
    
    setIsVisible(true);
    setFadeVideo(false);
    setWipeLogo(false);
    setIsFadingOut(false);
    document.body.style.overflow = 'hidden';


    const containerFadeDuration = 1000;


    const videoTimer = setTimeout(() => setFadeVideo(true), 1500);
    const logoTimer = setTimeout(() => setWipeLogo(true), 2000);


    const fadeTriggerTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 3500);


    const finalCleanupTimer = setTimeout(() => {
      setIsVisible(false);
      document.body.style.overflow = 'unset';
    }, 3500 + containerFadeDuration);

    return () => {
      clearTimeout(videoTimer);
      clearTimeout(logoTimer);
      clearTimeout(fadeTriggerTimer);
      clearTimeout(finalCleanupTimer);

      document.body.style.overflow = 'unset';
    };
  }, [pathname]);


  if (!isVisible || (pathname !== '/' && pathname !== '/home')) return null;

  return (

    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black transition-opacity ease-in-out ${isFadingOut ? 'opacity-0' : 'opacity-100'
        }`}
      style={{ transitionDuration: '1000ms' }}
    >

      {/* 1. VIDEO BACKGROUND */}
      <video
        src="/cinema.mp4"
        autoPlay
        loop
        muted
        playsInline
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${fadeVideo ? 'opacity-0' : 'opacity-40'
          }`}
      />

      {/* 2. LOGO */}
      <div className="relative z-10 flex items-center justify-center">
        <div
          className={`relative overflow-hidden transition-all duration-[1200ms] ease-[cubic-bezier(0.85,0,0.15,1)] ${wipeLogo ? 'h-0' : 'h-16 md:h-20'
            }`}
          style={{ width: '200px' }}
        >
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