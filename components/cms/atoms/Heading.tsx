import React from 'react';
import { cn } from "@/lib/utils";
import { useAtomicCss } from '@/hooks/useAtomicCss';

interface HeadingProps {
  block: any;
  className?: string;
}

/**
 * HeadingAtom
 * Komponen untuk merender elemen judul (h1-h4) dengan tipografi dinamis.
 */
export const HeadingAtom = ({ block, className }: HeadingProps) => {
  const { atomClass, baseInlineStyle, injectedCSS, getValue } = useAtomicCss(block);

  // Mengambil tag HTML (h1, h2, h3, h4) dari data konten, default ke h2
  const Tag = getValue('tag') || 'h2';

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: injectedCSS }} />
      {React.createElement(
        Tag,
        {
          className: cn(atomClass, "transition-all leading-tight", className),
          style: baseInlineStyle
        },
        getValue('text') || 'Heading Baru'
      )}
    </>
  );
};

export default HeadingAtom;