import React from 'react';
import { cn } from "@/lib/utils";
import { useAtomicCss } from '@/hooks/useAtomicCss';
import { ImageIcon } from 'lucide-react';

interface ImageProps {
  block: any;
  className?: string;
}

/**
 * ImageAtom
 * Komponen untuk merender gambar dengan dukungan object-fit dan placeholder admin.
 */
export const ImageAtom = ({ block, className }: ImageProps) => {
  // Ekstrak CSS. Perhatikan kita mengambil `imgClass` untuk tag <img> nya
  const { atomClass, imgClass, baseInlineStyle, injectedCSS, getValue } = useAtomicCss(block);

  const url = getValue('url');

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: injectedCSS }} />

      <div
        className={cn(
          atomClass,
          "bg-gray-100 relative overflow-hidden transition-all",
          // Jika tidak ada URL, paksa tampilkan border putus-putus
          !url && "border-2 border-dashed border-gray-300 flex items-center justify-center aspect-video",
          className
        )}
        style={baseInlineStyle}
      >
        {url ? (
          <img
            src={url}
            alt="Content"
            className={cn(imgClass, "transition-all")}
          />
        ) : (
          <div className="text-gray-400 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 h-full w-full">
            <ImageIcon className="w-4 h-4" /> Area Gambar
          </div>
        )}
      </div>
    </>
  );
};

export default ImageAtom;