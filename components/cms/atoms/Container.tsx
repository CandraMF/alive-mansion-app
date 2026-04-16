import React from 'react';
import { cn } from "@/lib/utils";
import { useAtomicCss } from '@/hooks/useAtomicCss';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export const ContainerAtom = ({
  block, className, isPublic, childrenRenderer, sectionId, activeItem, onAddBlockInside
}: any) => {
  const { atomClass, baseInlineStyle, injectedCSS, getValue } = useAtomicCss(block);

  const isActive = !isPublic && activeItem?.type === 'block' && activeItem.id === block.id;
  const isEmpty = !block.children || block.children.length === 0;
  const isAbsolute = getValue('position') === 'absolute';

  return (
    <div
      className={cn(
        atomClass,
        "transition-all relative",
        (!isPublic && (isActive || isEmpty)) && "min-h-[100px] border-2 border-dashed border-gray-300",
        (!isPublic && isAbsolute && isEmpty) && "min-w-[200px] bg-blue-500/20 backdrop-blur-sm z-50 flex items-center justify-center outline-dashed outline-2 outline-blue-500 shadow-xl",
        className
      )}
      style={baseInlineStyle}
      suppressHydrationWarning
    >
      {/* 🔥 HYDRATION FIX: Gunakan teks langsung yang sudah di-minify & suppress warning */}
      <style suppressHydrationWarning>{injectedCSS}</style>

      {block.children?.map((child: any) => childrenRenderer(child))}

      {(!isPublic && (isActive || isEmpty)) && (
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover/atom:opacity-100 hover:opacity-100 transition-opacity z-50">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-[10px] bg-white text-blue-600 border-blue-200 shadow-md"
            onClick={(e) => { e.stopPropagation(); onAddBlockInside(sectionId, block.id); }}
          >
            <Plus className="w-3 h-3 mr-1" /> Masukkan Elemen
          </Button>
        </div>
      )}
    </div>
  );
};

export default ContainerAtom;