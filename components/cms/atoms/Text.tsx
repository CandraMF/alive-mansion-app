import React from 'react';
import { cn } from "@/lib/utils";
import { useAtomicCss } from '@/hooks/useAtomicCss';

interface TextProps {
  block: any;
  className?: string;
}

/**
 * TextAtom
 * Komponen untuk merender teks paragraf standar dengan kontrol line-height dan alignment.
 */
export const TextAtom = ({ block, className }: TextProps) => {
  // 1. Ekstrak CSS dan Data dari Hook
  const { atomClass, baseInlineStyle, injectedCSS, getValue } = useAtomicCss(block);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: injectedCSS }} />

      <div
        className={cn(atomClass, "transition-all", className)}
        style={baseInlineStyle}
      >
        {getValue('text') || 'Teks paragraf baru.'}
      </div>
    </>
  );
};

export default TextAtom;