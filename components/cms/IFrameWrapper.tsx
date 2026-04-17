'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export default function IFrameWrapper({ children }: { children: React.ReactNode }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeBody, setIframeBody] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument;
    if (!doc) return;

    // 1. Meta Viewport
    const meta = doc.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    doc.head.appendChild(meta);

    // 🚀 2. FIX FONT: Masukkan Google Fonts langsung ke Head Iframe
    // Ini menyelesaikan masalah @import yang diabaikan browser di dalam body
    const fontLink = doc.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&family=Playfair+Display:wght@400;500;700;900&family=Poppins:wght@400;500;700;900&display=swap';
    fontLink.rel = 'stylesheet';
    doc.head.appendChild(fontLink);

    // 3. Salin semua style dari parent
    const styles = document.head.querySelectorAll('style, link[rel="stylesheet"]');
    styles.forEach((style) => doc.head.appendChild(style.cloneNode(true)));

    // 🚀 4. FIX ROOT CSS VARIABLES (Variabel Font Next.js)
    // Next.js menyimpan font variables (--font-inter dll) di tag <html>
    doc.documentElement.className = document.documentElement.className;
    doc.documentElement.style.cssText = document.documentElement.style.cssText;

    // 5. Salin class dari body parent (Tailwind classes)
    doc.body.className = document.body.className;
    doc.body.style.margin = '0';
    doc.body.style.padding = '0';
    doc.body.style.backgroundColor = 'transparent';
    doc.body.style.minHeight = '100vh';
    
    // 🚀 6. FORCE FALLBACK FONT: Pastikan Iframe memiliki font-family bawaan jika Tailwind gagal
    doc.body.style.fontFamily = 'Inter, ui-sans-serif, system-ui, sans-serif'; 

    doc.documentElement.style.overflowX = 'hidden';
    doc.body.style.overflowX = 'hidden';
    doc.body.style.width = '100%';

    setIframeBody(doc.body);

    // Observer untuk menangkap style Tailwind yang baru digenerate saat runtime
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeName === 'STYLE' || node.nodeName === 'LINK') {
            doc.head.appendChild(node.cloneNode(true));
          }
        });
      });
    });
    observer.observe(document.head, { childList: true });

    return () => observer.disconnect();
  }, []);

  return (
    <iframe ref={iframeRef} className="w-full h-full border-0 bg-white block" title="CMS Preview Canvas">
      {iframeBody && createPortal(children, iframeBody)}
    </iframe>
  );
}