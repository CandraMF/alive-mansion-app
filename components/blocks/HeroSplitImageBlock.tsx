'use client';

import Image from 'next/image';
import { CMSBlockWrapper, CMSEditableText } from '@/components/cms/CMSHelpers';

export default function HeroSplitImageBlock({
  data, isCms, isActive, onSelect, onUpdate
}: {
  data: any, isCms?: boolean, isActive?: boolean, onSelect?: () => void, onUpdate?: (k: string, v: string) => void
}) {
  return (
    <CMSBlockWrapper isCms={isCms} isActive={isActive} onClick={onSelect}>
      <section className="relative w-full h-[120vh] flex overflow-hidden">

        <div className="w-1/2 h-full relative bg-gray-100">
          {data.imageLeft && <Image src={data.imageLeft} alt="Left" fill className="object-cover" />}
        </div>
        <div className="w-1/2 h-full relative bg-gray-200">
          {data.imageRight && <Image src={data.imageRight} alt="Right" fill className="object-cover" />}
        </div>

        <div className="absolute inset-0 bg-black/30 pointer-events-none" />

        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-center z-10 w-full px-4">
          <CMSEditableText tag="p" isCms={isCms} data={data} contentKey="overline" fallback="New Arrivals in Society" onUpdate={onUpdate} className="text-white text-[10px] tracking-[0.3em] uppercase mb-1" />
          <CMSEditableText tag="p" isCms={isCms} data={data} contentKey="title" fallback="Spring Summer 2026" onUpdate={onUpdate} className="text-white font-serif text-xl md:text-2xl italic mb-4" />

          <div className="flex items-center justify-center gap-6">
            <a href={isCms ? undefined : (data.link1Url || '#')} onClick={(e) => isCms && e.preventDefault()}>
              <CMSEditableText tag="span" isCms={isCms} data={data} contentKey="link1Text" fallback="Women" onUpdate={onUpdate} className="text-white text-xs font-bold tracking-[0.15em] uppercase hover:opacity-70 transition-opacity" />
            </a>
            <a href={isCms ? undefined : (data.link2Url || '#')} onClick={(e) => isCms && e.preventDefault()}>
              <CMSEditableText tag="span" isCms={isCms} data={data} contentKey="link2Text" fallback="Men" onUpdate={onUpdate} className="text-white text-xs font-bold tracking-[0.15em] uppercase hover:opacity-70 transition-opacity" />
            </a>
          </div>
        </div>

      </section>
    </CMSBlockWrapper>
  );
}