'use client';

import { CMSBlockWrapper, CMSEditableText } from '@/components/cms/CMSHelpers';

export default function NewsletterBlock({
  data, isCms, isActive, onSelect, onUpdate
}: {
  data: any, isCms?: boolean, isActive?: boolean, onSelect?: () => void, onUpdate?: (k: string, v: string) => void
}) {
  return (
    <CMSBlockWrapper isCms={isCms} isActive={isActive} onClick={onSelect}>
      <section className="py-16 px-6 md:px-10 border-t border-gray-100">
        <div className="max-w-xl mx-auto text-center">
          <CMSEditableText tag="p" isCms={isCms} data={data} contentKey="description" fallback="Alive Mansion is a Parisian haute couture house..." onUpdate={onUpdate} className="font-serif text-xs text-gray-500 leading-relaxed mb-6 tracking-widest" />

          <CMSEditableText tag="h3" isCms={isCms} data={data} contentKey="title" fallback="Receive the Newsletter" onUpdate={onUpdate} className="text-base font-medium tracking-wide mb-2 text-black" />

          <CMSEditableText tag="p" isCms={isCms} data={data} contentKey="subtitle" fallback="Stay up to date with the latest collections..." onUpdate={onUpdate} className="text-[10px] uppercase tracking-widest text-gray-400 mb-6" />

          <div className="flex border-b border-black max-w-sm mx-auto transition-opacity hover:opacity-70">
            <input
              type="email"
              disabled={isCms}
              placeholder={data.placeholder || 'Email address'}
              className="flex-1 bg-transparent text-xs py-3 outline-none placeholder:text-gray-400 tracking-widest text-black disabled:cursor-not-allowed"
            />
            <button disabled={isCms} className="text-xs font-semibold tracking-wider uppercase py-2 px-4 hover:opacity-60 transition-opacity text-black">
              →
            </button>
          </div>
        </div>
      </section>
    </CMSBlockWrapper>
  );
}