import React from 'react';
import { cn } from "@/lib/utils";
import { useAtomicCss } from '@/hooks/useAtomicCss';

interface ButtonProps {
  block: any;
  className?: string;
  isPublic?: boolean;
}

export const ButtonCTA = ({ block, className, isPublic = false }: ButtonProps) => {
  const { atomClass, wrapperClass, baseInlineStyle, injectedCSS, getValue } = useAtomicCss(block);

  return (
    <div className={cn(wrapperClass, "w-full transition-all", className)}>
      <style dangerouslySetInnerHTML={{ __html: injectedCSS }} />
      <a
        href={getValue('url') || '#'}
        // Mencegah navigasi di iframe admin agar user tidak keluar dari editor
        onClick={(e) => { if (!isPublic) e.preventDefault(); }} 
        className={cn(
          atomClass, 
          "font-bold uppercase tracking-widest transition-all inline-flex items-center text-center",
          isPublic && "hover:opacity-80" // Efek hover sederhana untuk publik
        )}
        style={baseInlineStyle}
      >
        {getValue('label') || 'KLIK DI SINI'}
      </a>
    </div>
  );
};

export default ButtonCTA;