'use client';

import React from 'react';
import { cn } from "@/lib/utils";
import { ATOMIC_MAP } from './atoms';

// ==========================================
// DISPATCHER: Pusat Pendistribusi Komponen Publik
// ==========================================
const AtomicPublicDispatcher = ({ block }: { block: any }) => {
  const Component = ATOMIC_MAP[block.type];

  if (!Component) return null;

  return (
    <Component
      block={block}
      isPublic={true}
      childrenRenderer={(child: any) => <AtomicPublicDispatcher key={child.id} block={child} />}
    />
  );
};

// ==========================================
// RENDERER KANVAS UTAMA (PUBLIC)
// ==========================================
export default function PublicRenderer({ pageData }: { pageData: any }) {
  if (!pageData || !pageData.sections) return null;

  return (
    <div className="w-full bg-white text-black min-h-screen overflow-x-hidden font-sans flex flex-col">
      <style dangerouslySetInnerHTML={{
        __html: `
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&family=Playfair+Display:wght@400;500;700;900&family=Poppins:wght@400;500;700;900&display=swap');
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `
      }} />

      {pageData.customFonts && pageData.customFonts.length > 0 && (
        <style dangerouslySetInnerHTML={{ __html: pageData.customFonts.map((f: any) => `@font-face { font-family: '${f.name}'; src: url('${f.url}'); font-display: swap; }`).join('\n') }} />
      )}

      {pageData.sections.map((section: any) => {
        const secData = section.content || {};
        const bgImageStyle = secData.backgroundImage ? { backgroundImage: `url(${secData.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {};

        const secClass = `sec-${section.id}`;

        // 🚀 DESKTOP-FIRST CSS UNTUK SECTION
        const padDesk = secData.padding !== undefined && secData.padding !== '' ? secData.padding : '80px 20px';
        const padMob = secData.paddingMobile !== undefined && secData.paddingMobile !== '' ? secData.paddingMobile : padDesk;

        const minHDesk = secData.minHeight !== undefined && secData.minHeight !== '' ? secData.minHeight : 'auto';
        const minHMob = secData.minHeightMobile !== undefined && secData.minHeightMobile !== '' ? secData.minHeightMobile : minHDesk;

        const secCSS = `
          .${secClass} { padding: ${padDesk}; min-height: ${minHDesk}; } 
          @media (max-width: 767px) { 
            .${secClass} { padding: ${padMob}; min-height: ${minHMob}; } 
          }
        `;

        return (
          <section
            key={section.id}
            style={{ backgroundColor: secData.backgroundColor || 'transparent', overflow: secData.overflow || 'hidden', ...bgImageStyle }}
            className={cn(secClass, "relative flex flex-col w-full")}
          >
            <style dangerouslySetInnerHTML={{ __html: secCSS }} />

            {secData.backgroundVideo && (
              <video src={secData.backgroundVideo} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none" />
            )}

            <div className="w-full relative z-20 flex flex-col h-full flex-1">
              {section.blocks.map((block: any) => (
                <AtomicPublicDispatcher key={block.id} block={block} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}