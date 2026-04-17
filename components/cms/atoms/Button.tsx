import React from 'react';
import { cn } from "@/lib/utils";
import { useAtomicCss } from '@/hooks/useAtomicCss';
import Link from 'next/link';

interface ButtonProps {
  block: any;
  className?: string;
  isPublic?: boolean;
}

export const ButtonCTA = ({ block, className, isPublic = false }: ButtonProps) => {
  const { atomClass, wrapperClass, baseInlineStyle, injectedCSS, getValue } = useAtomicCss(block);

  const url = getValue('url') || '#';
  // Deteksi apakah ini link internal (dimulai dengan "/")
  const isInternal = url.startsWith('/') && !url.startsWith('//');

  const content = getValue('label') || 'KLIK DI SINI';
  const finalClass = cn(
    atomClass,
    "font-bold uppercase tracking-widest transition-all inline-flex items-center justify-center text-center",
    isPublic && "hover:opacity-80"
  );

  return (
    <div className={cn(wrapperClass, "transition-all", className)}>
      <style suppressHydrationWarning>{injectedCSS}</style>

      {isInternal ? (
        <Link
          href={url}
          prefetch={isPublic ? undefined : false}
          onClick={(e) => { if (!isPublic) e.preventDefault(); }}
          className={finalClass}
          style={baseInlineStyle}
        >
          {content}
        </Link>
      ) : (
        <a
          href={url}
          target={url.startsWith('http') ? "_blank" : undefined}
          rel={url.startsWith('http') ? "noopener noreferrer" : undefined}
          onClick={(e) => { if (!isPublic) e.preventDefault(); }}
          className={finalClass}
          style={baseInlineStyle}
        >
          {content}
        </a>
      )}
    </div>
  );
};

export default ButtonCTA;