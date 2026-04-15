'use client';

import React, { useState } from 'react';
import { cn } from "@/lib/utils";

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
          <img src={displayImage} alt={`Product ${index}`} className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105" />
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

const AtomicPublicRenderer = ({ block }: { block: any }) => {
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
    <div className={cn((block.type === 'ATOMIC_CONTAINER' || block.type === 'ATOMIC_PRODUCT_CAROUSEL') ? "w-full" : "w-full")}>
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

      {block.type === 'ATOMIC_HEADING' && React.createElement(data.tag || 'h2', { className: cn(atomClass, "leading-tight"), style: baseInlineStyle }, data.text || '')}
      {block.type === 'ATOMIC_TEXT' && <div className={cn(atomClass)} style={baseInlineStyle}>{data.text || ''}</div>}

      {block.type === 'ATOMIC_IMAGE' && data.url && (
        <div className={cn(atomClass, "relative overflow-hidden")} style={baseInlineStyle}>
          <img src={data.url} alt="Content" className={cn(imgClass)} />
        </div>
      )}

      {block.type === 'ATOMIC_BUTTON' && (
        <div className={cn(wrapperClass, "w-full")}>
          <a href={data.url || '#'} className={cn(atomClass, "font-bold uppercase tracking-widest inline-flex items-center text-center transition-opacity hover:opacity-80")} style={baseInlineStyle}>
            {data.label || 'KLIK DI SINI'}
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
        // FITUR BARU: Menarik CSS Murni dari section.content (Sama seperti Admin Preview)
        const secData = section.content || {};

        return (
          <section
            key={section.id}
            style={{
              backgroundColor: secData.backgroundColor || 'transparent',
              maxWidth: secData.maxWidth || '1280px',
              minWidth: secData.minWidth || 'auto',
              minHeight: secData.minHeight || 'auto',
              maxHeight: secData.maxHeight || 'none',
              padding: secData.padding || '80px 20px',
              margin: secData.margin || '0px auto',
            }}
            className="relative flex flex-col w-full mx-auto"
          >
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