'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

interface ShopFilterUIProps {
  categories: any[];
  colors: any[];
  sizes: any[];
  currentCategoryHierarchy: any[];
  totalProducts: number;
}

export default function ShopFilterUI({
  categories,
  colors,
  sizes,
  currentCategoryHierarchy,
  totalProducts
}: ShopFilterUIProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Extract current URL parameters
  const currentCategorySlug = searchParams.get('category') || '';
  const currentSizes = searchParams.get('sizes')?.split(',').filter(Boolean) || [];
  const currentColors = searchParams.get('colors')?.split(',').filter(Boolean) || [];
  
  // Calculate total active filters
  const activeFiltersCount = (currentCategorySlug ? 1 : 0) + currentSizes.length + currentColors.length;

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isDrawerOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isDrawerOpen]);

  // Handle URL updates
  const updateFilter = (type: 'category' | 'sizes' | 'colors', value: string | null) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    
    if (type === 'category') {
      if (value) current.set('category', value);
      else current.delete('category');
    } else {
      let activeArr = type === 'sizes' ? [...currentSizes] : [...currentColors];
      
      if (value) {
        if (activeArr.includes(value)) activeArr = activeArr.filter(i => i !== value);
        else activeArr.push(value);
      } else {
         activeArr = []; // Clear all
      }

      if (activeArr.length > 0) current.set(type, activeArr.join(','));
      else current.delete(type);
    }

    current.delete('page'); // Reset to page 1 on filter change
    router.push(`${pathname}?${current.toString()}`, { scroll: false });
  };

  // Build the hierarchical breadcrumb string (e.g., WOMEN / READY-TO-WEAR / COATS)
  const breadcrumbText = currentCategoryHierarchy.length > 0 
    ? currentCategoryHierarchy.map(c => c.name.toUpperCase()).join(' / ')
    : 'ALL COLLECTIONS';

  // Determine the display title
  const displayTitle = currentCategoryHierarchy.length > 0 
    ? currentCategoryHierarchy[currentCategoryHierarchy.length - 1].name
    : 'Collections';

  return (
    <div className="mb-12">
      {/* 1. BREADCRUMBS & TITLE (Centered) */}
      <div className="text-center mb-8">
        <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">
          {breadcrumbText}
        </p>
        <h1 className="text-3xl md:text-5xl font-serif text-black">{displayTitle}</h1>
      </div>

      {/* 2. FILTER CONTROLS & PRODUCT COUNT */}
      <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-6">
        <button 
          onClick={() => setIsDrawerOpen(true)}
          className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 transition-colors px-4 py-2 text-[10px] md:text-xs font-bold uppercase tracking-widest"
        >
          Refine {activeFiltersCount > 0 && <span className="bg-black text-white rounded-full w-4 h-4 flex items-center justify-center text-[8px]">{activeFiltersCount}</span>}
        </button>
        <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-black">
          {totalProducts} Items
        </span>
      </div>

      {/* 3. ACTIVE FILTER BADGES */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          {currentCategorySlug && (
            <button onClick={() => updateFilter('category', null)} className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-[10px] uppercase tracking-widest transition-colors">
               {displayTitle} &times;
            </button>
          )}
          {currentSizes.map(sizeId => {
            const s = sizes.find(s => s.id === sizeId);
            return s && (
              <button key={sizeId} onClick={() => updateFilter('sizes', sizeId)} className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-[10px] uppercase tracking-widest transition-colors">
                Size {s.name} &times;
              </button>
            )
          })}
          {currentColors.map(colorId => {
            const c = colors.find(c => c.id === colorId);
            return c && (
              <button key={colorId} onClick={() => updateFilter('colors', colorId)} className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-[10px] uppercase tracking-widest transition-colors">
                {c.name} &times;
              </button>
            )
          })}
        </div>
      )}

      {/* 4. FILTER DRAWER (Left side) */}
      <div className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-[100] transition-opacity duration-300 ${isDrawerOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={() => setIsDrawerOpen(false)} />
      <div className={`fixed top-0 left-0 h-[100dvh] w-[85vw] md:w-[400px] bg-white z-[110] shadow-2xl transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-6 py-6 border-b border-gray-100">
          <h2 className="text-xs font-bold uppercase tracking-widest text-black">Refine Selection</h2>
          <button onClick={() => setIsDrawerOpen(false)} className="text-2xl font-light hover:opacity-50">&times;</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar space-y-8">
          {/* Categories */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Category</h3>
            <div className="space-y-3">
              <button onClick={() => updateFilter('category', null)} className={`block text-xs uppercase tracking-widest hover:text-gray-500 ${!currentCategorySlug ? 'font-bold text-black' : 'text-gray-500'}`}>All Collections</button>
              {categories.filter(c => !c.parentId).map(parent => (
                <div key={parent.id} className="space-y-2">
                  <button onClick={() => updateFilter('category', parent.slug)} className={`block text-xs uppercase tracking-widest hover:text-gray-500 ${currentCategorySlug === parent.slug ? 'font-bold text-black' : 'text-gray-500'}`}>{parent.name}</button>
                  {categories.filter(c => c.parentId === parent.id).map(child => (
                     <button key={child.id} onClick={() => updateFilter('category', child.slug)} className={`block pl-4 text-[10px] uppercase tracking-widest hover:text-gray-500 ${currentCategorySlug === child.slug ? 'font-bold text-black' : 'text-gray-500'}`}>- {child.name}</button>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div className="border-t border-gray-100 pt-8">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Size</h3>
            <div className="flex flex-wrap gap-2">
              {sizes.map(size => (
                <button 
                  key={size.id} 
                  onClick={() => updateFilter('sizes', size.id)}
                  className={`border px-3 py-2 text-[10px] uppercase font-bold transition-colors ${currentSizes.includes(size.id) ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-200 hover:border-black'}`}
                >
                  {size.name}
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className="border-t border-gray-100 pt-8">
             <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Color</h3>
             <div className="flex flex-wrap gap-2">
               {colors.map(color => (
                 <button 
                   key={color.id} 
                   onClick={() => updateFilter('colors', color.id)}
                   className={`border px-3 py-2 text-[10px] uppercase font-bold transition-colors flex items-center gap-2 ${currentColors.includes(color.id) ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-200 hover:border-black'}`}
                 >
                   <span className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: color.hexCodes[0] || '#000' }} />
                   {color.name}
                 </button>
               ))}
             </div>
          </div>
        </div>
        
        {/* Footer actions */}
        <div className="p-6 border-t border-gray-100">
           <button onClick={() => setIsDrawerOpen(false)} className="w-full bg-black text-white text-[10px] py-4 uppercase font-bold tracking-widest hover:bg-gray-800 transition-colors">View Results</button>
        </div>
      </div>
    </div>
  );
}