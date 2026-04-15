'use client';

import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { CMS_COMPONENTS } from '@/lib/cms-registry';

// ==========================================
// SUB-KOMPONEN: SMART PRODUCT CARD (PUBLIC)
// ==========================================
const PublicProductCard = ({ item, index }: { item: any, index: number }) => {
  const [isHovered, setIsHovered] = useState(false);
  const displayImage = isHovered && item.hoverImage ? item.hoverImage : item.primaryImage;

  return (
    <a
      href={item.variantId ? `/products/${item.variantId}` : '#'}
      className="snap-start shrink-0 w-[80vw] md:w-[250px] group/card block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="aspect-[3/4] bg-gray-100 overflow-hidden relative mb-3">
        {displayImage ? (
          <img
            src={displayImage}
            alt={`Product ${index}`}
            className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105"
          />
        ) : null}
      </div>
      <div className="text-center">
        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1 text-gray-900 transition-colors group-hover/card:text-blue-600">
          {item.variantId ? 'View Product' : `Product Item ${index + 1}`}
        </h4>
      </div>
    </a>
  );
};

// ==========================================
// RECURSIVE ENGINE: ATOMIC PUBLIC RENDERER
// ==========================================
const AtomicPublicRenderer = ({ block }: { block: any }) => {
  const data = block.content || {};
  const atomClass = `atom-${block.id}`;
  const wrapperClass = `wrap-${block.id}`;
  const imgClass = `img-${block.id}`;

  const getDefault = (key: string) => CMS_COMPONENTS[block.type]?.fields?.find(f => f.key === key)?.defaultValue;
  const getValue = (key: string) => (data[key] !== undefined && data[key] !== '') ? data[key] : getDefault(key);

  const baseInlineStyle: React.CSSProperties = {
    color: getValue('color') || (block.type === 'ATOMIC_TEXT' ? '#4B5563' : '#111827'),
    fontFamily: getValue('fontFamily') || 'inherit',
    fontWeight: getValue('fontWeight') || (block.type === 'ATOMIC_HEADING' ? '700' : '400'),
  };

  if (block.type === 'ATOMIC_BUTTON') {
    baseInlineStyle.backgroundColor = getValue('backgroundColor') || '#000000';
    baseInlineStyle.color = getValue('textColor') || '#ffffff';
    baseInlineStyle.borderColor = getValue('borderColor') || 'transparent';
    const bw = getValue('borderWidth');
    baseInlineStyle.borderWidth = bw ? `${bw}px` : '0px';
    baseInlineStyle.borderStyle = bw ? 'solid' : 'none';
  }

  if (block.type === 'ATOMIC_CONTAINER' || block.type === 'ATOMIC_PRODUCT_CAROUSEL') {
    baseInlineStyle.backgroundColor = getValue('backgroundColor') || 'transparent';
  }

  let mob = ''; let desk = ''; let wrapMob = ''; let wrapDesk = ''; let imgMob = ''; let imgDesk = '';

  const addCss = (key: string, prop: string, suffix = '') => {
    const v = getValue(key);
    if (v !== undefined && v !== '') mob += `${prop}: ${v}${suffix};\n`;
    if (data[`${key}Desktop`] !== undefined && data[`${key}Desktop`] !== '') desk += `${prop}: ${data[`${key}Desktop`]}${suffix};\n`;
  };

  addCss('position', 'position');
  addCss('top', 'top');
  addCss('bottom', 'bottom');
  addCss('left', 'left');
  addCss('right', 'right');
  addCss('transform', 'transform');
  addCss('zIndex', 'z-index');
  addCss('maxWidth', 'max-width');

  addCss('marginTop', 'margin-top', 'px');
  addCss('marginBottom', 'margin-bottom', 'px');
  addCss('margin', 'margin');
  addCss('padding', 'padding');
  addCss('borderRadius', 'border-radius', 'px');

  if (block.type === 'ATOMIC_CONTAINER') {
    mob += `display: ${getValue('display') || 'flex'};\n`;
    if (data.displayDesktop) desk += `display: ${data.displayDesktop};\n`;
    if (data.display === 'grid' || data.displayDesktop === 'grid') addCss('gridColumns', 'grid-template-columns');
    mob += `flex-direction: ${getValue('flexDirection') || 'column'};\n`;
    if (data.flexDirectionDesktop) desk += `flex-direction: ${data.flexDirectionDesktop};\n`;
    addCss('gap', 'gap', 'px');
    addCss('alignItems', 'align-items');
    addCss('justifyContent', 'justify-content');
  }

  if (block.type === 'ATOMIC_HEADING') {
    addCss('fontSize', 'font-size', 'px');
    addCss('letterSpacing', 'letter-spacing', 'px');
    addCss('align', 'text-align');
  }

  if (block.type === 'ATOMIC_TEXT') {
    addCss('fontSize', 'font-size', 'px');
    addCss('lineHeight', 'line-height');
    addCss('align', 'text-align');
  }

  if (block.type === 'ATOMIC_IMAGE') {
    addCss('width', 'width');
    addCss('height', 'height');
    imgMob += `width: 100%; height: 100%; object-fit: ${getValue('objectFit') || 'cover'};\n`;
    if (data.objectFitDesktop) imgDesk += `object-fit: ${data.objectFitDesktop};\n`;
  }

  if (block.type === 'ATOMIC_BUTTON') {
    addCss('fontSize', 'font-size', 'px');
    if (!data.padding && !data.paddingDesktop) mob += `padding: ${getValue('padding') || '12px 24px'};\n`;
    wrapMob += `display: flex; width: 100%; justify-content: ${getValue('align') || 'flex-start'};\n`;
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
    // 🚀 FITUR: CABUT "w-full" JIKA BUKAN CONTAINER!
    <div className={cn((block.type === 'ATOMIC_CONTAINER' || block.type === 'ATOMIC_PRODUCT_CAROUSEL') ? "w-full" : "")}>
      <style dangerouslySetInnerHTML={{ __html: injectedCSS }} />

      {block.type === 'ATOMIC_CONTAINER' && (
        <div className={cn(atomClass, "relative")} style={baseInlineStyle}>
          {block.children?.map((child: any) => <AtomicPublicRenderer key={child.id} block={child} />)}
        </div>
      )}

      {block.type === 'ATOMIC_PRODUCT_CAROUSEL' && (
        <div className={cn(atomClass, "w-full overflow-hidden")} style={baseInlineStyle}>
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 px-4 pb-4 no-scrollbar">
            {(data.items && data.items.length > 0 ? data.items : []).map((item: any, idx: number) => (
              <PublicProductCard key={idx} item={item} index={idx} />
            ))}
          </div>
        </div>
      )}

      {block.type === 'ATOMIC_HEADING' && React.createElement(getValue('tag') || 'h2', { className: cn(atomClass, "leading-tight"), style: baseInlineStyle }, getValue('text') || '')}

      {block.type === 'ATOMIC_TEXT' && <div className={cn(atomClass)} style={baseInlineStyle}>{getValue('text') || ''}</div>}

      {block.type === 'ATOMIC_IMAGE' && data.url && (
        <div className={cn(atomClass, "relative overflow-hidden")} style={baseInlineStyle}>
          <img src={data.url} alt="Content" className={cn(imgClass)} />
        </div>
      )}

      {block.type === 'ATOMIC_BUTTON' && (
        <div className={cn(wrapperClass, "w-full")}>
          <a href={getValue('url') || '#'} className={cn(atomClass, "font-bold uppercase tracking-widest inline-flex items-center text-center transition-opacity hover:opacity-80")} style={baseInlineStyle}>
            {getValue('label') || 'KLIK DI SINI'}
          </a>
        </div>
      )}

      {block.type === 'ATOMIC_SPACER' && <div className={cn(atomClass, "w-full")} />}
    </div>
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
        <style dangerouslySetInnerHTML={{
          __html: pageData.customFonts.map((f: any) => `
            @font-face { font-family: '${f.name}'; src: url('${f.url}'); font-display: swap; }
          `).join('\n')
        }} />
      )}

      {pageData.sections.map((section: any) => {
        const secData = section.content || {};

        const bgImageStyle = secData.backgroundImage ? { backgroundImage: `url(${secData.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {};

        return (
          <section
            key={section.id}
            style={{
              backgroundColor: secData.backgroundColor || 'transparent',
              minHeight: secData.minHeight !== undefined && secData.minHeight !== '' ? secData.minHeight : 'auto',
              padding: secData.padding !== undefined && secData.padding !== '' ? secData.padding : '80px 20px',
              overflow: secData.overflow || 'hidden',
              ...bgImageStyle
            }}
            className="relative flex flex-col w-full"
          >
            {secData.backgroundVideo && (
              <video
                src={secData.backgroundVideo}
                autoPlay loop muted playsInline
                className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
              />
            )}

            <div className="w-full relative z-20 flex flex-col h-full flex-1">
              {section.blocks.map((block: any) => (
                <AtomicPublicRenderer key={block.id} block={block} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}