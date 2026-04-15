import React from 'react';
import { cn } from "@/lib/utils";
import { useAtomicCss } from '@/hooks/useAtomicCss';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export const ContainerAtom = ({
  block, className, isPublic, childrenRenderer, sectionId, activeItem, onAddBlockInside
}: any) => {
  const { atomClass, baseInlineStyle, injectedCSS } = useAtomicCss(block);
  const isActive = !isPublic && activeItem?.type === 'block' && activeItem.id === block.id;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: injectedCSS }} />
      <div
        className={cn(
          atomClass,
          "transition-all relative",
          // Mode Admin: beri tanda border putus-putus jika sedang aktif atau kosong
          (!isPublic && (isActive || !block.children?.length)) && "min-h-[100px] border-2 border-dashed border-gray-300",
          className
        )}
        style={baseInlineStyle}
      >
        {/* Render anak secara rekursif melalui dispatcher luar */}
        {block.children?.map((child: any) => childrenRenderer(child))}

        {/* Tombol khusus editor untuk menambah elemen ke dalam container ini */}
        {(!isPublic && (isActive || !block.children?.length)) && (
          <div className="w-full flex justify-center py-2 mt-4 opacity-50 hover:opacity-100 transition-opacity">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-[10px] bg-white text-blue-600 border-blue-200"
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