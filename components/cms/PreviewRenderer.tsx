'use client';

import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { Plus, Box, Layout, Settings, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CMS_COMPONENTS } from '@/lib/cms-registry';

// ==========================================
// SUB-KOMPONEN: SMART PRODUCT CARD
// ==========================================
const SmartProductCard = ({ item, index }: { item: any, index: number }) => {
  const [isHovered, setIsHovered] = useState(false);
  const displayImage = isHovered && item.hoverImage ? item.hoverImage : item.primaryImage;

  return (
    <div
      className="snap-start shrink-0 w-[80vw] md:w-[250px] group/card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="aspect-[3/4] bg-gray-100 overflow-hidden relative mb-3">
        {displayImage ? (
          <img src={displayImage} alt={`Product ${index}`} className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-400 font-bold uppercase tracking-widest border border-dashed border-gray-200">No Image</div>
        )}
      </div>
      <div className="text-center">
        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1">{item.variantId ? (isHovered ? 'Quick View' : 'Product Selected') : `Product Item ${index + 1}`}</h4>
        <p className="text-[9px] text-gray-400 uppercase tracking-widest">{item.variantId || 'None selected'}</p>
      </div>
    </div>
  );
};

// ==========================================
// RECURSIVE ENGINE: ATOMIC RENDERER
// ==========================================
const AtomicRenderer = ({ block, sectionId, activeItem, onSelectBlock, onUpdateBlockContent, onAddBlockInside }: any) => {
  const isActive = activeItem?.type === 'block' && activeItem.id === block.id;
  const data = block.content || {};
  const atomClass = `atom-${block.id}`;
  const wrapperClass = `wrap-${block.id}`;
  const imgClass = `img-${block.id}`;

  const baseInlineStyle: React.CSSProperties = {
    color: data.color || (block.type === 'ATOMIC_TEXT' ? '#4B5563' : '#111827'),
    fontFamily: data.fontFamily || 'inherit',
    fontWeight: data.fontWeight || (block.type === 'ATOMIC_HEADING' ? '700' : '400'),
  };

  if (block.type === 'ATOMIC_BUTTON') {
    baseInlineStyle.backgroundColor = data.backgroundColor || '#000000';
    baseInlineStyle.color = data.textColor || '#ffffff';
    baseInlineStyle.borderColor = data.borderColor || 'transparent';
    baseInlineStyle.borderWidth = data.borderWidth ? `${data.borderWidth}px` : '0px';
    baseInlineStyle.borderStyle = data.borderWidth ? 'solid' : 'none';
  }

  if (block.type === 'ATOMIC_CONTAINER' || block.type === 'ATOMIC_PRODUCT_CAROUSEL') {
    baseInlineStyle.backgroundColor = data.backgroundColor || 'transparent';
  }

  let mob = ''; let desk = ''; let wrapMob = ''; let wrapDesk = ''; let imgMob = ''; let imgDesk = '';

  const addCss = (key: string, prop: string, suffix = '') => {
    if (data[key] !== undefined && data[key] !== '') mob += `${prop}: ${data[key]}${suffix};\n`;
    if (data[`${key}Desktop`] !== undefined && data[`${key}Desktop`] !== '') desk += `${prop}: ${data[`${key}Desktop`]}${suffix};\n`;
  };

  addCss('marginTop', 'margin-top', 'px');
  if (block.type !== 'ATOMIC_CONTAINER' && block.type !== 'ATOMIC_PRODUCT_CAROUSEL' && data.marginBottom === undefined) mob += `margin-bottom: 16px;\n`;
  else addCss('marginBottom', 'margin-bottom', 'px');

  addCss('padding', 'padding');
  addCss('borderRadius', 'border-radius', 'px');

  if (block.type === 'ATOMIC_CONTAINER') {
    mob += `display: ${data.display || 'flex'};\n`;
    if (data.displayDesktop) desk += `display: ${data.displayDesktop};\n`;
    if (data.display === 'grid' || data.displayDesktop === 'grid') addCss('gridColumns', 'grid-template-columns');
    mob += `flex-direction: ${data.flexDirection || 'column'};\n`;
    if (data.flexDirectionDesktop) desk += `flex-direction: ${data.flexDirectionDesktop};\n`;
    mob += `gap: ${data.gap !== undefined ? data.gap : 16}px;\n`;
    if (data.gapDesktop !== undefined) desk += `gap: ${data.gapDesktop}px;\n`;
    addCss('alignItems', 'align-items');
    addCss('justifyContent', 'justify-content');
  }

  if (block.type === 'ATOMIC_HEADING') {
    mob += `font-size: ${data.fontSize || 36}px;\n`;
    if (data.fontSizeDesktop) desk += `font-size: ${data.fontSizeDesktop}px;\n`;
    addCss('letterSpacing', 'letter-spacing', 'px');
    addCss('align', 'text-align');
  }

  if (block.type === 'ATOMIC_TEXT') {
    mob += `font-size: ${data.fontSize || 16}px;\n`;
    if (data.fontSizeDesktop) desk += `font-size: ${data.fontSizeDesktop}px;\n`;
    mob += `line-height: ${data.lineHeight || 1.6};\n`;
    if (data.lineHeightDesktop) desk += `line-height: ${data.lineHeightDesktop};\n`;
    addCss('align', 'text-align');
  }

  if (block.type === 'ATOMIC_IMAGE') {
    mob += `width: ${data.width || '100%'};\n`;
    if (data.widthDesktop) desk += `width: ${data.widthDesktop};\n`;
    mob += `height: ${data.height || 'auto'};\n`;
    if (data.heightDesktop) desk += `height: ${data.heightDesktop};\n`;
    imgMob += `width: 100%; height: 100%; object-fit: ${data.objectFit || 'cover'};\n`;
    if (data.objectFitDesktop) imgDesk += `object-fit: ${data.objectFitDesktop};\n`;
  }

  if (block.type === 'ATOMIC_BUTTON') {
    mob += `font-size: ${data.fontSize || 14}px;\n`;
    if (data.fontSizeDesktop) desk += `font-size: ${data.fontSizeDesktop}px;\n`;
    if (!data.padding && !data.paddingDesktop) mob += `padding: 12px 24px;\n`;
    wrapMob += `display: flex; width: 100%; justify-content: ${data.align || 'flex-start'};\n`;
    if (data.alignDesktop) wrapDesk += `justify-content: ${data.alignDesktop};\n`;
  }

  const injectedCSS = `
    .${atomClass} { ${mob} }
    ${imgMob ? `.${imgClass} { ${imgMob} }` : ''}
    ${wrapMob ? `.${wrapperClass} { ${wrapMob} }` : ''}
    @media (min-width: 768px) {
      .${atomClass} { ${desk} }
      ${imgDesk ? `.${imgClass} { ${imgDesk} }` : ''}
      ${wrapDesk ? `.${wrapperClass} { ${wrapDesk} }` : ''}
    }
  `;

  return (
    <div onClick={(e) => { e.stopPropagation(); onSelectBlock(sectionId, block.id); }} className={cn("relative transition-all cursor-pointer group/atom", (block.type === 'ATOMIC_CONTAINER' || block.type === 'ATOMIC_PRODUCT_CAROUSEL') ? "w-full" : "w-full", isActive ? "ring-2 ring-blue-500 ring-offset-2 z-30" : "ring-2 ring-transparent hover:ring-blue-300 hover:ring-offset-2 z-10")}>
      <style dangerouslySetInnerHTML={{ __html: injectedCSS }} />
      {isActive && <div className="absolute -top-7 left-0 bg-blue-500 text-white text-[9px] font-bold px-2 py-1 rounded-t-md uppercase tracking-widest shadow-md z-40">{CMS_COMPONENTS[block.type]?.name || 'Unknown'}</div>}

      {block.type === 'ATOMIC_CONTAINER' && (
        <div className={cn(atomClass, "transition-all relative", (isActive || !block.children?.length) && "min-h-[100px] border-2 border-dashed border-gray-300")} style={baseInlineStyle}>
          {block.children?.map((child: any) => <AtomicRenderer key={child.id} block={child} sectionId={sectionId} activeItem={activeItem} onSelectBlock={onSelectBlock} onUpdateBlockContent={onUpdateBlockContent} onAddBlockInside={onAddBlockInside} />)}
          {(isActive || !block.children?.length) && <div className="w-full flex justify-center py-2 mt-4 opacity-50 hover:opacity-100 transition-opacity"><Button variant="outline" size="sm" className="h-7 text-[10px] bg-white text-blue-600 border-blue-200" onClick={(e) => { e.stopPropagation(); onAddBlockInside(sectionId, block.id); }}><Plus className="w-3 h-3 mr-1" /> Masukkan Elemen</Button></div>}
        </div>
      )}

      {block.type === 'ATOMIC_PRODUCT_CAROUSEL' && (
        <div className={cn(atomClass, "transition-all w-full overflow-hidden")} style={baseInlineStyle}>
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 px-4 pb-4 no-scrollbar">
            {(data.items && data.items.length > 0 ? data.items : [{}, {}, {}, {}]).map((item: any, idx: number) => (
              <SmartProductCard key={idx} item={item} index={idx} />
            ))}
          </div>
        </div>
      )}

      {block.type === 'ATOMIC_HEADING' && React.createElement(data.tag || 'h2', { className: cn(atomClass, "transition-all leading-tight"), style: baseInlineStyle }, data.text || 'Heading Baru')}
      {block.type === 'ATOMIC_TEXT' && <div className={cn(atomClass, "transition-all")} style={baseInlineStyle}>{data.text || 'Teks paragraf baru.'}</div>}

      {block.type === 'ATOMIC_IMAGE' && (
        <div className={cn(atomClass, "bg-gray-100 relative overflow-hidden transition-all", !data.url && "border-2 border-dashed border-gray-300 flex items-center justify-center aspect-video")} style={baseInlineStyle}>
          {data.url ? <img src={data.url} alt="atomic" className={cn(imgClass, "transition-all")} /> : <div className="text-gray-400 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 h-full w-full"><ImageIcon className="w-4 h-4" /> Area Gambar</div>}
        </div>
      )}

      {/* FITUR BARU: Mencegah Klik (Navigation) saat Preview di Admin */}
      {block.type === 'ATOMIC_BUTTON' && (
        <div className={cn(wrapperClass, "w-full transition-all")}>
          <a
            href={data.url || '#'}
            onClick={(e) => e.preventDefault()} // Mencegah reload/navigasi di iframe admin
            className={cn(atomClass, "font-bold uppercase tracking-widest transition-all inline-flex items-center text-center")}
            style={baseInlineStyle}
          >
            {data.label || 'KLIK DI SINI'}
          </a>
        </div>
      )}

      {block.type === 'ATOMIC_SPACER' && <div className={cn(atomClass, "w-full transition-all", isActive ? "bg-blue-100/50 striped-bg" : "bg-transparent")}><div className="w-full h-full flex items-center justify-center text-[8px] font-mono text-blue-400 uppercase opacity-0 group-hover/atom:opacity-100">Spacer</div></div>}
    </div>
  )
};

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
        <style dangerouslySetInnerHTML={{
          __html: customFonts.map((f: any) => `
            @font-face { font-family: '${f.name}'; src: url('${f.url}'); font-display: swap; }
          `).join('\n')
        }} />
      )}

      <button onClick={(e) => { e.stopPropagation(); if (onSelectPage) onSelectPage(); }} className={cn("fixed top-0 right-0 text-[10px] text-white font-black px-4 py-2 z-[100] transition-all uppercase tracking-tighter flex items-center gap-1.5 rounded-bl-xl shadow-md cursor-pointer", isPageActive ? "bg-blue-600 opacity-100" : "bg-gray-900/90 backdrop-blur-sm opacity-60 hover:opacity-100")}><Settings className="w-3 h-3" /> {pageTitle}</button>

      {sections.map((section: any, sIdx: number) => {
        const isSectionActive = activeItem?.type === 'section' && activeItem.id === section.id;

        // FITUR BARU: Menarik CSS murni dari section.content
        const secData = section.content || {};

        return (
          <section key={section.id} onClick={(e) => { e.stopPropagation(); if (onSelectSection) onSelectSection(section.id); }}
            style={{
              backgroundColor: secData.backgroundColor || 'transparent',
              maxWidth: secData.maxWidth || '1280px',
              minWidth: secData.minWidth || 'auto',
              minHeight: secData.minHeight || 'auto',
              maxHeight: secData.maxHeight || 'none',
              padding: secData.padding || '80px 20px',
              margin: secData.margin || '0px auto',
            }}
            className={cn(
              "relative group/section transition-all duration-200 cursor-pointer flex flex-col w-full mx-auto",
              isSectionActive ? "ring-4 ring-blue-500 ring-inset z-30" : "ring-2 ring-transparent hover:ring-blue-300 hover:ring-inset hover:bg-blue-50/10 z-10"
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