'use client';

import React from 'react';
import { cn } from "@/lib/utils";
import { Plus, Box, Layout } from 'lucide-react';
import { Button } from '@/components/ui/button';

// --- IMPORT KOMPONEN ASLI WEBSITE ---
import HeroVideoBlock from '@/components/blocks/HeroVideoBlock';
import EditorialSplitBlock from '@/components/blocks/EditorialSplitBlock';
import HeroSplitImageBlock from '@/components/blocks/HeroSplitImageBlock';
import ProductCarouselBlock from '@/components/blocks/ProductCarouselBlock';
import NewsletterBlock from '@/components/blocks/NewsletterBlock';

interface PreviewRendererProps {
  sections: any[];
  // KITA UBAH PROPS INI: Menerima seluruh object activeItem agar tahu yang aktif Section atau Block
  activeItem?: { type: 'page' | 'section' | 'block', id: string, sectionId?: string } | null;
  onSelectBlock: (sectionId: string, blockId: string) => void;
  // FUNGSI BARU: Untuk mendeteksi klik pada Section
  onSelectSection?: (sectionId: string) => void;
  onUpdateBlockContent: (sectionId: string, blockId: string, key: string, value: string) => void;
  onAddSection?: () => void;
  onAddBlock?: (sectionId: string) => void;
}

export default function PreviewRenderer({
  sections,
  activeItem,
  onSelectBlock,
  onSelectSection,
  onUpdateBlockContent,
  onAddSection,
  onAddBlock
}: PreviewRendererProps) {

  if (!sections || sections.length === 0) {
    return (
      <div className="w-full h-[600px] flex flex-col items-center justify-center border-4 border-dashed border-gray-100 bg-gray-50/50 m-4 rounded-3xl transition-all">
        <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
          <Plus className="w-8 h-8 text-gray-300" />
        </div>
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-6">Kanvas Kosong</p>
        <Button onClick={onAddSection} variant="outline" className="bg-white shadow-sm border-gray-200 hover:bg-gray-50">
          Mulai Bangun Halaman
        </Button>
      </div>
    );
  }

  return (
    <div className="w-[1280px] bg-white text-black shadow-2xl flex flex-col pointer-events-auto min-h-screen">
      {sections.map((section, sIdx) => {
        // Cek apakah section ini sedang diklik/diinspeksi
        const isSectionActive = activeItem?.type === 'section' && activeItem.id === section.id;

        return (
          <section
            key={section.id}
            // DETEKSI KLIK PADA SECTION
            onClick={(e) => {
              e.stopPropagation(); // Mencegah klik bocor ke pembungkus luar
              if (onSelectSection) onSelectSection(section.id);
            }}
            className={cn(
              "relative group/section transition-all duration-200 cursor-pointer",
              // EFEK BORDER SAAT HOVER & KLIK
              isSectionActive
                ? "ring-4 ring-blue-500 ring-inset z-30" // Biru tebal jika sedang diklik
                : "ring-2 ring-transparent hover:ring-blue-300 hover:ring-inset hover:bg-blue-50/10 z-10", // Biru muda saat di-hover
              section.layout === 'FULL_WIDTH' ? 'w-full' : 'max-w-7xl mx-auto',
              section.paddingY,
              section.background
            )}
          >
            {/* Label Section (Sekarang berubah warna jadi biru jika section sedang aktif) */}
            <div className={cn(
              "absolute top-0 left-0 text-[10px] text-white font-black px-3 py-1.5 z-50 transition-all uppercase tracking-tighter flex items-center gap-1.5 rounded-br-lg shadow-sm",
              isSectionActive ? "bg-blue-600 opacity-100" : "bg-gray-900 opacity-0 group-hover/section:opacity-100"
            )}>
              <Layout className="w-3 h-3" />
              {section.name || `Section ${sIdx + 1}`}
            </div>

            <div className="w-full space-y-0 relative z-20">
              {section.blocks.map((block: any) => {
                const isBlockActive = activeItem?.type === 'block' && activeItem.id === block.id;

                const cmsProps = {
                  data: block.content,
                  isCms: true,
                  isActive: isBlockActive,
                  onSelect: () => onSelectBlock(section.id, block.id),
                  onUpdate: (key: string, val: string) => onUpdateBlockContent(section.id, block.id, key, val)
                };

                // PENTING: Block hover effect (ring-2) sudah diurus secara otomatis 
                // oleh komponen CMSBlockWrapper di masing-masing komponen block.
                switch (block.type) {
                  case 'HERO_VIDEO': return <HeroVideoBlock key={block.id} {...cmsProps} />;
                  case 'EDITORIAL_SPLIT': return <EditorialSplitBlock key={block.id} {...cmsProps} />;
                  case 'HERO_SPLIT_IMAGE': return <HeroSplitImageBlock key={block.id} {...cmsProps} />;
                  case 'PRODUCT_CAROUSEL': return <ProductCarouselBlock key={block.id} {...cmsProps} />;
                  case 'NEWSLETTER': return <NewsletterBlock key={block.id} {...cmsProps} />;
                  default: return <div key={block.id} className="p-4 bg-red-50 text-red-500 text-center text-xs font-bold border-2 border-dashed border-red-200 m-4">Unknown Block: {block.type}</div>;
                }
              })}
            </div>

            {/* TOMBOL TAMBAH BLOCK DI DALAM SECTION */}
            <div className="flex justify-center py-8 opacity-0 group-hover/section:opacity-100 transition-all relative z-20">
              <Button
                size="sm"
                variant="outline"
                className="rounded-full bg-white border-blue-200 text-blue-600 hover:bg-blue-50 shadow-sm gap-2 px-6 h-9"
                onClick={(e) => {
                  e.stopPropagation(); // Mencegah klik tombol ini memicu klik Section
                  if (onAddBlock) onAddBlock(section.id);
                }}
              >
                <Box className="w-4 h-4" />
                Add Component to {section.name || 'this section'}
              </Button>
            </div>
          </section>
        );
      })}

      <div className="h-40 w-full bg-gray-50/30 flex items-center justify-center">
        <Button onClick={onAddSection} variant="ghost" className="text-gray-400 hover:text-blue-500 uppercase text-[10px] font-bold tracking-[0.2em]">
          + Add Another Section
        </Button>
      </div>
    </div>
  );
}