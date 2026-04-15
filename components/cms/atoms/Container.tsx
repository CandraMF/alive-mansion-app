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
    <>
      <style dangerouslySetInnerHTML={{ __html: injectedCSS }} />
      <div
        className={cn(
          atomClass,
          "transition-all relative",
          // 1. Tampilan Admin Standar (Jika Kosong / Aktif)
          (!isPublic && (isActive || isEmpty)) && "min-h-[100px] border-2 border-dashed border-gray-300",
          // 2. ANTI-GHOSTING ABSOLUTE: Paksa ada wujudnya di Editor jika kosong!
          (!isPublic && isAbsolute && isEmpty) && "min-w-[200px] bg-blue-500/20 backdrop-blur-sm z-50 flex items-center justify-center outline-dashed outline-2 outline-blue-500 shadow-xl",
          className
        )}
        style={baseInlineStyle}
      >
        {block.children?.map((child: any) => childrenRenderer(child))}

        {(!isPublic && (isActive || isEmpty)) && (
          <div className="w-full flex justify-center py-2 mt-4 opacity-50 hover:opacity-100 transition-opacity">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-[10px] bg-white text-blue-600 border-blue-200 shadow-sm"
              onClick={(e) => { e.stopPropagation(); onAddBlockInside(sectionId, block.id); }}
            >
              <Plus className="w-3 h-3 mr-1" /> Masukkan Elemen
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default ContainerAtom;