'use client';

import React from 'react';
import { cn } from "@/lib/utils";
import { Plus, Box, Layout, Settings, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CMS_COMPONENTS } from '@/lib/cms-registry';

// ==========================================
// RECURSIVE ENGINE: ATOMIC RENDERER
// ==========================================
const AtomicRenderer = ({ block, sectionId, activeItem, onSelectBlock, onUpdateBlockContent, onAddBlockInside }: any) => {
  const isActive = activeItem?.type === 'block' && activeItem.id === block.id;
  const data = block.content || {};

  const globalStyle: React.CSSProperties = {
    marginTop: data.marginTop ? `${data.marginTop}px` : '0px',
    marginBottom: data.marginBottom ? `${data.marginBottom}px` : (block.type === 'ATOMIC_CONTAINER' ? '0px' : '16px'),
    textAlign: data.align as any,
  };

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onSelectBlock(sectionId, block.id); }}
      className={cn(
        "relative transition-all cursor-pointer group/atom",
        block.type === 'ATOMIC_CONTAINER' ? "w-full" : "w-full",
        isActive ? "ring-2 ring-blue-500 ring-offset-2 z-30" : "ring-2 ring-transparent hover:ring-blue-300 hover:ring-offset-2 z-10"
      )}
    >
      {isActive && (
        <div className="absolute -top-7 left-0 bg-blue-500 text-white text-[9px] font-bold px-2 py-1 rounded-t-md uppercase tracking-widest shadow-md z-40">
          {CMS_COMPONENTS[block.type]?.name || 'Unknown'}
        </div>
      )}

      {block.type === 'ATOMIC_CONTAINER' && (
        <div 
          style={{
            ...globalStyle,
            display: data.display || 'flex',
            flexDirection: data.flexDirection || 'column',
            gridTemplateColumns: data.display === 'grid' ? (data.gridColumns || '1fr 1fr') : undefined,
            gap: data.gap ? `${data.gap}px` : '16px',
            padding: data.padding || '20px',
            backgroundColor: data.backgroundColor || 'transparent',
            borderRadius: data.borderRadius ? `${data.borderRadius}px` : '0px',
            alignItems: data.alignItems || 'flex-start',
            justifyContent: data.justifyContent || 'flex-start'
          }} 
          className={cn("transition-all relative", (isActive || !block.children?.length) && "min-h-[100px] border-2 border-dashed border-gray-300")}
        >
          {block.children?.map((child: any) => (
            <AtomicRenderer key={child.id} block={child} sectionId={sectionId} activeItem={activeItem} onSelectBlock={onSelectBlock} onUpdateBlockContent={onUpdateBlockContent} onAddBlockInside={onAddBlockInside} />
          ))}

          {(isActive || !block.children?.length) && (
            <div className="w-full flex justify-center py-2 mt-4 opacity-50 hover:opacity-100 transition-opacity">
              <Button variant="outline" size="sm" className="h-7 text-[10px] bg-white text-blue-600 border-blue-200" onClick={(e) => { e.stopPropagation(); onAddBlockInside(sectionId, block.id); }}>
                <Plus className="w-3 h-3 mr-1" /> Masukkan Elemen
              </Button>
            </div>
          )}
        </div>
      )}

      {/* RENDER KOMPONEN LAINNYA */}
      <div className="w-full">
        {block.type === 'ATOMIC_HEADING' && (
          <div style={globalStyle}>
            {React.createElement(data.tag || 'h2', { style: { fontSize: data.fontSize ? `${data.fontSize}px` : '36px', fontWeight: data.fontWeight || '700', color: data.color || '#111827', letterSpacing: data.letterSpacing ? `${data.letterSpacing}px` : 'normal' }, className: "transition-all leading-tight" }, data.text || 'Heading Baru')}
          </div>
        )}
        {block.type === 'ATOMIC_TEXT' && (
          <div style={{ ...globalStyle, fontSize: data.fontSize ? `${data.fontSize}px` : '16px', lineHeight: data.lineHeight || '1.6', color: data.color || '#4B5563' }} className="transition-all">
             {data.text || 'Teks paragraf baru.'}
          </div>
        )}
        {block.type === 'ATOMIC_IMAGE' && (
          <div style={globalStyle} className="w-full transition-all">
             <div style={{ width: data.width || '100%', height: data.height || 'auto', borderRadius: data.borderRadius ? `${data.borderRadius}px` : '0px' }} className={cn("bg-gray-100 relative overflow-hidden transition-all", !data.url && "border-2 border-dashed border-gray-300 flex items-center justify-center aspect-video")}>
               {data.url ? <img src={data.url} alt="atomic" style={{ objectFit: data.objectFit || 'cover' }} className="w-full h-full transition-all" /> : <div className="text-gray-400 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 h-full w-full"><ImageIcon className="w-4 h-4"/> Area Gambar</div>}
             </div>
          </div>
        )}
        {block.type === 'ATOMIC_BUTTON' && (
          <div style={{...globalStyle, display: 'flex', justifyContent: data.align || 'flex-start'}} className="w-full transition-all">
             <a href={data.url || '#'} style={{ backgroundColor: data.backgroundColor || '#000000', color: data.textColor || '#ffffff', fontSize: data.fontSize ? `${data.fontSize}px` : '14px', padding: data.padding || '12px 24px', borderRadius: data.borderRadius ? `${data.borderRadius}px` : '0px', borderWidth: data.borderWidth ? `${data.borderWidth}px` : '0px', borderColor: data.borderColor || 'transparent', borderStyle: 'solid' }} className="font-bold uppercase tracking-widest transition-all inline-flex items-center text-center">
               {data.label || 'KLIK DI SINI'}
             </a>
          </div>
        )}
        {block.type === 'ATOMIC_SPACER' && (
          <div style={{ height: data.height ? `${data.height}px` : '64px' }} className={cn("w-full transition-all", isActive ? "bg-blue-100/50 striped-bg" : "bg-transparent")}>
             {isActive && <div className="w-full h-full flex items-center justify-center text-[8px] font-mono text-blue-400 uppercase">Spacer Element</div>}
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// KANVAS UTAMA
// ==========================================
export default function PreviewRenderer({
  sections, activeItem, pageTitle = "Page Settings", onSelectPage, onSelectBlock, onSelectSection, onUpdateBlockContent, onAddSection, onAddBlock, onAddBlockInside
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
      <button onClick={(e) => { e.stopPropagation(); if (onSelectPage) onSelectPage(); }} className={cn("fixed top-0 right-0 text-[10px] text-white font-black px-4 py-2 z-[100] transition-all uppercase tracking-tighter flex items-center gap-1.5 rounded-bl-xl shadow-md cursor-pointer", isPageActive ? "bg-blue-600 opacity-100" : "bg-gray-900/90 backdrop-blur-sm opacity-60 hover:opacity-100")}><Settings className="w-3 h-3" /> {pageTitle}</button>

      {sections.map((section: any, sIdx: number) => {
        const isSectionActive = activeItem?.type === 'section' && activeItem.id === section.id;

        // PENGATURAN SECTION BARU
        const isCustomWidth = section.width === 'custom';
        const isCustomHeight = section.minHeight === 'custom';
        const isFullWidth = section.width === 'w-full';

        return (
          <section key={section.id} onClick={(e) => { e.stopPropagation(); if (onSelectSection) onSelectSection(section.id); }}
            style={{
              backgroundColor: section.backgroundColor && section.backgroundColor !== 'transparent' ? section.backgroundColor : undefined,
              maxWidth: isCustomWidth ? section.customWidth : undefined,
              minHeight: isCustomHeight ? section.customHeight : undefined,
            }}
            className={cn(
              "relative group/section transition-all duration-200 cursor-pointer flex flex-col",
              isSectionActive ? "ring-4 ring-blue-500 ring-inset z-30" : "ring-2 ring-transparent hover:ring-blue-300 hover:ring-inset hover:bg-blue-50/10 z-10",
              // Terapkan Tailwind Width Class jika bukan Custom
              !isCustomWidth ? (section.width || 'max-w-7xl') : 'w-full',
              // Tambahkan margin auto ke tengah layaknya container jika bukan full-width
              (!isFullWidth && !isCustomWidth) ? 'mx-auto' : '',
              // Terapkan Tailwind Height Class jika bukan Custom
              section.minHeight === 'min-h-screen' ? 'min-h-screen' : '',
              section.paddingY || 'py-20'
            )}
          >
            <div className={cn("absolute top-0 left-0 text-[10px] text-white font-black px-3 py-1.5 z-50 transition-all uppercase tracking-tighter flex items-center gap-1.5 rounded-br-lg shadow-sm", isSectionActive ? "bg-blue-600 opacity-100" : "bg-gray-900 opacity-0 group-hover/section:opacity-100")}><Layout className="w-3 h-3" /> {section.name || `Section ${sIdx + 1}`}</div>

            <div className="w-full relative z-20 flex flex-col h-full flex-1">
              {section.blocks.map((block: any) => {
                if (block.type.startsWith('ATOMIC_')) {
                  return <AtomicRenderer key={block.id} block={block} sectionId={section.id} activeItem={activeItem} onSelectBlock={onSelectBlock} onUpdateBlockContent={onUpdateBlockContent} onAddBlockInside={onAddBlockInside} />;
                }
                return null;
              })}
            </div>

            <div className="flex justify-center py-6 opacity-0 group-hover/section:opacity-100 transition-all relative z-20">
              <Button size="sm" variant="outline" className="rounded-full bg-white border-blue-200 text-blue-600 hover:bg-blue-50 shadow-sm gap-2 px-6 h-9" onClick={(e) => { e.stopPropagation(); if (onAddBlock) onAddBlock(section.id); }}><Box className="w-4 h-4" /> Tambah Root Elemen</Button>
            </div>
          </section>
        );
      })}
      <div className="h-40 w-full flex items-center justify-center"><Button onClick={onAddSection} variant="ghost" className="text-gray-400 hover:text-blue-500 uppercase text-[10px] font-bold tracking-[0.2em]">+ Tambah Section Baru</Button></div>
    </div>
  );
}