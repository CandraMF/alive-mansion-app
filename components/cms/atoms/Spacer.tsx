import React from 'react';
import { cn } from "@/lib/utils";
import { useAtomicCss } from '@/hooks/useAtomicCss';

export const SpacerAtom = ({ block, className, isPublic = false }: any) => {
  const { atomClass, injectedCSS } = useAtomicCss(block);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: injectedCSS }} />
      <div
        className={cn(
          atomClass,
          "w-full transition-all",
          // Visual khusus editor: efek zebra/striped agar spacer terlihat
          !isPublic && "hover:bg-blue-100/50 striped-bg group/spacer",
          className
        )}
      >
        {!isPublic && (
          <div className="w-full h-full flex items-center justify-center text-[8px] font-mono text-blue-400 uppercase opacity-0 group-hover/spacer:opacity-100">
            Spacer
          </div>
        )}
      </div>
    </>
  );
};

export default SpacerAtom;