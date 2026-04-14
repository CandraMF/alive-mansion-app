'use client';

import React from 'react';
import { cn } from "@/lib/utils";

// 1. WRAPPER UNTUK SECTION (Menangani klik dan kotak biru pembatas)
export function CMSBlockWrapper({ 
  children, isCms, isActive, onClick 
}: { 
  children: React.ReactNode, isCms?: boolean, isActive?: boolean, onClick?: () => void 
}) {
  if (!isCms) return <>{children}</>; // Di halaman publik, render polos

  return (
    <div 
      onClick={(e) => { e.stopPropagation(); onClick && onClick(); }}
      className={cn(
        "relative transition-all duration-200 cursor-pointer group/block",
        isActive ? "ring-4 ring-blue-500 ring-inset z-40" : "hover:ring-2 hover:ring-blue-400/50 hover:ring-inset z-10"
      )}
    >
      {/* Label transparan yang muncul saat di-hover admin */}
      {!isActive && (
        <div className="absolute top-0 left-0 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 opacity-0 group-hover/block:opacity-100 transition-opacity z-50">
          Klik untuk Edit
        </div>
      )}
      {children}
    </div>
  );
}

// 2. WRAPPER UNTUK TEKS (Menangani Inline Editing)
export function CMSEditableText({ 
  tag: Tag, data, contentKey, fallback, className, isCms, onUpdate 
}: { 
  tag: keyof JSX.IntrinsicElements, data: any, contentKey: string, fallback: string, className?: string, isCms?: boolean, onUpdate?: (key: string, val: string) => void
}) {
  const content = data[contentKey] || fallback;

  if (!isCms) return <Tag className={className}>{content}</Tag>; // Di publik, render HTML biasa

  return (
    <Tag 
      contentEditable
      suppressContentEditableWarning
      onClick={(e: React.MouseEvent) => e.stopPropagation()} // Cegah event klik lari ke wrapper Section
      onBlur={(e: React.FocusEvent<HTMLElement>) => {
        if (onUpdate) onUpdate(contentKey, e.currentTarget.textContent || '');
      }}
      className={cn(
        className, 
        "outline-none hover:ring-2 hover:ring-dashed hover:ring-blue-400 hover:bg-blue-50/50 transition-all cursor-text empty:before:content-['Ketik_disini...'] empty:before:text-gray-300"
      )}
    >
      {content}
    </Tag>
  );
}