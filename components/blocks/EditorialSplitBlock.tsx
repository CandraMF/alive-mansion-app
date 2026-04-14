'use client';

import Image from 'next/image';
import { CMSBlockWrapper, CMSEditableText } from '@/components/cms/CMSHelpers';
import { cn } from '@/lib/utils';

export default function EditorialSplitBlock({
  data, isCms, isActive, onSelect, onUpdate
}: {
  data: any, isCms?: boolean, isActive?: boolean, onSelect?: () => void, onUpdate?: (k: string, v: string) => void
}) {
  const isImageRight = data.imagePosition === 'right';
  const isTextCenter = data.imagePosition === 'center';

  return (
    <CMSBlockWrapper isCms={isCms} isActive={isActive} onClick={onSelect}>
      <section className="py-20 md:py-32 px-6 md:px-10 border-b border-gray-100 last:border-0">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center justify-center">

          <div className={cn("flex justify-center w-full", isImageRight ? "md:order-2" : "")}>
            <div className="w-full max-w-md bg-gray-50 aspect-[4/5] relative group overflow-hidden">
              {data.imageUrl ? (
                <Image src={data.imageUrl} alt="Editorial" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-[10px] font-bold uppercase tracking-widest border border-dashed border-gray-200">Image Placeholder</div>
              )}
            </div>
          </div>

          <div className={cn("max-w-sm", isTextCenter ? "md:text-center mx-auto" : "text-left md:pl-20", isImageRight ? "md:order-1" : "")}>
            <CMSEditableText tag="p" isCms={isCms} data={data} contentKey="overline" fallback="Alive Mansion/Editorial" onUpdate={onUpdate} className="font-serif italic text-gray-400 mb-6 text-sm" />
            <CMSEditableText tag="h2" isCms={isCms} data={data} contentKey="title" fallback="Judul Kolaborasi atau Koleksi" onUpdate={onUpdate} className="font-serif text-xl md:text-2xl leading-relaxed text-black mb-4 italic" />
            <CMSEditableText tag="p" isCms={isCms} data={data} contentKey="description" fallback="Deskripsi cerita koleksi di sini..." onUpdate={onUpdate} className="font-serif text-base leading-relaxed text-gray-500 mb-8" />

            <a href={isCms ? undefined : (data.buttonUrl || '#')} onClick={(e) => isCms && e.preventDefault()}>
              <CMSEditableText tag="span" isCms={isCms} data={data} contentKey="buttonText" fallback="Discover More" onUpdate={onUpdate} className="border-b border-black pb-1 uppercase text-[10px] font-bold tracking-widest hover:opacity-60 transition-opacity" />
            </a>
          </div>

        </div>
      </section>
    </CMSBlockWrapper>
  );
}