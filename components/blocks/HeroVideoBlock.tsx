'use client';

import { CMSBlockWrapper, CMSEditableText } from '@/components/cms/CMSHelpers';

export default function HeroVideoBlock({
  data, isCms, isActive, onSelect, onUpdate
}: {
  data: any, isCms?: boolean, isActive?: boolean, onSelect?: () => void, onUpdate?: (k: string, v: string) => void
}) {
  return (
    <CMSBlockWrapper isCms={isCms} isActive={isActive} onClick={onSelect}>
      <section className="relative w-full h-[calc(100vh+68px)] overflow-hidden bg-black">
        {data.videoUrl ? (
          <video src={data.videoUrl} autoPlay loop muted playsInline className={`w-full h-full object-cover ${isCms ? 'pointer-events-none' : ''}`} />
        ) : (
          <div className="absolute inset-0 bg-gray-900 flex items-center justify-center text-gray-500 font-mono text-xs tracking-widest">
            VIDEO PLACEHOLDER
          </div>
        )}

        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-center z-10 w-full px-4">
          <CMSEditableText
            tag="p" isCms={isCms} data={data} contentKey="overline" fallback="Fall Winter 2026" onUpdate={onUpdate}
            className="text-white text-xs tracking-[0.3em] uppercase mb-2"
          />
          <a href={isCms ? undefined : (data.buttonUrl || '#')} onClick={(e) => isCms && e.preventDefault()} className="inline-block">
            <CMSEditableText
              tag="span" isCms={isCms} data={data} contentKey="buttonText" fallback="Explore the Collection" onUpdate={onUpdate}
              className="text-white text-xs font-semibold tracking-[0.2em] uppercase border-b border-white pb-0.5 hover:opacity-70 transition-opacity"
            />
          </a>
        </div>
      </section>
    </CMSBlockWrapper>
  );
}