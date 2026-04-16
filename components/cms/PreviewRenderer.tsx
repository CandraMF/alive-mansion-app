'use client';

import React from 'react';
import { cn } from "@/lib/utils";
import { Plus, Box, Layout, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CMS_COMPONENTS } from '@/lib/cms-registry';
import { ATOMIC_MAP } from './atoms';

// ==========================================
// DISPATCHER: Pusat Pendistribusi Komponen Admin
// ==========================================
const AtomicPreviewDispatcher = ({ block, sectionId, activeItem, onSelectBlock, onUpdateBlockContent, onAddBlockInside }: any) => {
  const isActive = activeItem?.type === 'block' && activeItem.id === block.id;
  const Component = ATOMIC_MAP[block.type];

  const isAbsolute = block.content?.position === 'absolute';

  if (!Component) return null;

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onSelectBlock(sectionId, block.id); }}
      className={cn(
        "transition-all cursor-pointer group/atom",
        isAbsolute ? "static" : "relative",
        (block.type === 'ATOMIC_CONTAINER' || block.type === 'ATOMIC_PRODUCT_CAROUSEL') ? "w-full" : "",
        isActive ? "outline outline-[1.5px] outline-blue-500 outline-offset-[-1px] z-30" : "outline outline-[1.5px] outline-transparent hover:outline-blue-300 outline-offset-[-1px] z-10"
      )}
    >
      {/* Label Inspect Element Style */}
      {isActive && !isAbsolute && (
        <div className="absolute -top-6 left-[-1.5px] bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-t-sm uppercase tracking-wider shadow-sm z-40 whitespace-nowrap pointer-events-none">
          {CMS_COMPONENTS[block.type]?.name || 'Unknown'}
        </div>
      )}

      <Component
        block={block}
        isPublic={false}
        sectionId={sectionId}
        activeItem={activeItem}
        onSelectBlock={onSelectBlock}
        onUpdateBlockContent={onUpdateBlockContent}
        onAddBlockInside={onAddBlockInside}
        childrenRenderer={(child: any) => (
          <AtomicPreviewDispatcher
            key={child.id}
            block={child}
            sectionId={sectionId}
            activeItem={activeItem}
            onSelectBlock={onSelectBlock}
            onUpdateBlockContent={onUpdateBlockContent}
            onAddBlockInside={onAddBlockInside}
          />
        )}
      />
    </div>
  );
};

// ==========================================
// RENDERER KANVAS UTAMA (ADMIN)
// ==========================================
export default function PreviewRenderer({
  sections, activeItem, pageTitle = "Page Settings", customFonts = [], onSelectPage, onSelectBlock, onSelectSection, onUpdateBlockContent, onAddSection, onAddBlock, onAddBlockInside
}: any) {
  const isPageActive = activeItem?.type === 'page';

  if (!sections || sections.length === 0) {
    return (
      <div className="w-full h-[600px] flex flex-col items-center justify-center border-4 border-dashed border-gray-100 bg-gray-50/50 m-4 rounded-3xl transition-all relative">
        <button onClick={onSelectPage} className="absolute top-0 right-0 bg-gray-900 text-[10px] text-white font-black px-4 py-2 z-[100] uppercase tracking-tighter flex items-center gap-1.5 rounded-bl-xl shadow-md hover:bg-blue-600 transition-colors"><Settings className="w-3 h-3" /> {pageTitle}</button>
        <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4"><Plus className="w-8 h-8 text-gray-300" /></div>
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-6">Kanvas Kosong</p>
        <Button onClick={onAddSection} variant="outline" className="bg-white shadow-sm border-gray-200 hover:bg-gray-50">Mulai Bangun Halaman</Button>
      </div>
    );
  }

  return (
    <div className="w-full bg-white text-black shadow-none flex flex-col pointer-events-auto min-h-screen overflow-x-hidden relative pb-32">
      <style dangerouslySetInnerHTML={{
        __html: `
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&family=Playfair+Display:wght@400;500;700;900&family=Poppins:wght@400;500;700;900&display=swap');
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          .striped-bg { background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(59, 130, 246, 0.05) 10px, rgba(59, 130, 246, 0.05) 20px); }
        `
      }} />

      {customFonts && customFonts.length > 0 && (
        <style dangerouslySetInnerHTML={{ __html: customFonts.map((f: any) => `@font-face { font-family: '${f.name}'; src: url('${f.url}'); font-display: swap; }`).join('\n') }} />
      )}

      <button onClick={(e) => { e.stopPropagation(); if (onSelectPage) onSelectPage(); }} className={cn("fixed top-0 right-0 text-[10px] text-white font-black px-4 py-2 z-[100] transition-all uppercase tracking-tighter flex items-center gap-1.5 rounded-bl-xl shadow-md cursor-pointer", isPageActive ? "bg-blue-600 opacity-100" : "bg-gray-900/90 backdrop-blur-sm opacity-60 hover:opacity-100")}><Settings className="w-3 h-3" /> {pageTitle}</button>

      {sections.map((section: any, sIdx: number) => {
        const isSectionActive = activeItem?.type === 'section' && activeItem.id === section.id;
        const secData = section.content || {};
        const bgImageStyle = secData.backgroundImage ? { backgroundImage: `url(${secData.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {};

        const secClass = `sec-${section.id}`;
        const padMob = secData.padding !== undefined && secData.padding !== '' ? secData.padding : '80px 20px';
        const padDesk = secData.paddingDesktop !== undefined && secData.paddingDesktop !== '' ? secData.paddingDesktop : padMob;
        const minHMob = secData.minHeight !== undefined && secData.minHeight !== '' ? secData.minHeight : 'auto';
        const minHDesk = secData.minHeightDesktop !== undefined && secData.minHeightDesktop !== '' ? secData.minHeightDesktop : minHMob;

        const secCSS = `.${secClass} { padding: ${padMob}; min-height: ${minHMob}; } @media (min-width: 768px) { .${secClass} { padding: ${padDesk}; min-height: ${minHDesk}; } }`;

        return (
          <section key={section.id} onClick={(e) => { e.stopPropagation(); if (onSelectSection) onSelectSection(section.id); }}
            style={{ backgroundColor: secData.backgroundColor || 'transparent', overflow: secData.overflow || 'hidden', ...bgImageStyle }}
            className={cn(secClass, "relative group/section transition-all duration-200 cursor-pointer flex flex-col w-full", isSectionActive ? "ring-4 ring-blue-500 ring-inset z-30" : "ring-2 ring-transparent hover:ring-blue-300 hover:ring-inset hover:bg-blue-50/10 z-10")}
          >
            <style dangerouslySetInnerHTML={{ __html: secCSS }} />
            {secData.backgroundVideo && <video src={secData.backgroundVideo} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none" />}

            <div className={cn("absolute top-0 left-0 text-[10px] text-white font-black px-3 py-1.5 z-50 transition-all uppercase tracking-tighter flex items-center gap-1.5 rounded-br-lg shadow-sm", isSectionActive ? "bg-blue-600 opacity-100" : "bg-gray-900 opacity-0 group-hover/section:opacity-100")}><Layout className="w-3 h-3" /> {section.name || `Section ${sIdx + 1}`}</div>

            <div className="w-full relative z-20 flex flex-col h-full flex-1">
              {section.blocks.map((block: any) => (
                <AtomicPreviewDispatcher
                  key={block.id} block={block} sectionId={section.id} activeItem={activeItem}
                  onSelectBlock={onSelectBlock} onUpdateBlockContent={onUpdateBlockContent} onAddBlockInside={onAddBlockInside}
                />
              ))}
            </div>

            {/* 🔥 PERBAIKAN: Tombol sekarang Absolute melayang di atas segalanya */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover/section:opacity-100 transition-all z-50">
              <Button size="sm" variant="outline" className="rounded-full bg-white border-blue-200 text-blue-600 hover:bg-blue-50 shadow-xl gap-2 px-6 h-9" onClick={(e) => { e.stopPropagation(); if (onAddBlock) onAddBlock(section.id); }}><Box className="w-4 h-4" /> Tambah Root Elemen</Button>
            </div>
          </section>
        );
      })}
      <div className="h-40 w-full flex items-center justify-center"><Button onClick={onAddSection} variant="ghost" className="text-gray-400 hover:text-blue-500 uppercase text-[10px] font-bold tracking-[0.2em]">+ Tambah Section Baru</Button></div>
    </div>
  );
}