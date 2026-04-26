'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

function FilterUIContent({ categories, colors, sizes, currentCategoryHierarchy, totalProducts }: any) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // ==========================================
  // 1. STATE URL (Aman dari Infinite Loop)
  // ==========================================
  const urlCategory = searchParams.get('category') || '';
  const urlSizes = searchParams.get('sizes') || '';
  const urlColors = searchParams.get('colors') || '';

  const activeSizes = urlSizes ? urlSizes.split(',') : [];
  const activeColors = urlColors ? urlColors.split(',') : [];
  const activeFiltersCount = (urlCategory ? 1 : 0) + activeSizes.length + activeColors.length;

  // ==========================================
  // 2. STATE DRAF (Khusus di dalam laci)
  // ==========================================
  const [draftCategory, setDraftCategory] = useState<string | null>(null);
  const [draftSizes, setDraftSizes] = useState<string[]>([]);
  const [draftColors, setDraftColors] = useState<string[]>([]);

  // Sinkronisasi URL ke Draf saat laci dibuka
  useEffect(() => {
    if (isDrawerOpen) {
      setDraftCategory(urlCategory || null);
      setDraftSizes(urlSizes ? urlSizes.split(',') : []);
      setDraftColors(urlColors ? urlColors.split(',') : []);

      document.body.style.overflow = 'hidden';
      window.history.pushState({ panel: 'filter' }, '');
      
      const handlePopState = () => setIsDrawerOpen(false);
      window.addEventListener('popstate', handlePopState);
      
      return () => window.removeEventListener('popstate', handlePopState);
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isDrawerOpen, urlCategory, urlSizes, urlColors]);

  // Fungsi Tutup Laci Manual (X & Overlay)
  const handleManualClose = () => {
    if (window.history.state?.panel === 'filter') window.history.back();
    else setIsDrawerOpen(false);
  };

  // ==========================================
  // 3. LOGIKA UPDATE URL
  // ==========================================
  
  // A. Di luar Laci (Bisa di-undo dengan back button)
  const updateFilterImmediate = (type: string, value: string | null) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (type === 'category') {
      if (value) current.set('category', value); else current.delete('category');
    } else {
      let activeArr = type === 'sizes' ? [...activeSizes] : [...activeColors];
      if (value) {
        activeArr = activeArr.includes(value) ? activeArr.filter(i => i !== value) : [...activeArr, value];
      } else activeArr = [];
      if (activeArr.length > 0) current.set(type, activeArr.join(',')); else current.delete(type);
    }
    current.delete('page');
    // Gunakan push agar klik badge/breadcrumb bisa di-undo
    router.push(`${pathname}?${current.toString()}`, { scroll: false });
  };

  // 🚀 B. Terapkan Draf (Fix Bug Gagal Filter)
  const applyFilters = () => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    
    if (draftCategory) current.set('category', draftCategory);
    else current.delete('category');

    if (draftSizes.length > 0) current.set('sizes', draftSizes.join(','));
    else current.delete('sizes');

    if (draftColors.length > 0) current.set('colors', draftColors.join(','));
    else current.delete('colors');

    current.delete('page');

    // 1. Tutup state React (Jangan panggil history.back di sini!)
    setIsDrawerOpen(false); 
    
    // 2. Gunakan replace untuk menimpa history "panel: filter" dengan URL baru
    router.replace(`${pathname}?${current.toString()}`, { scroll: false }); 
  };

  const displayTitle = currentCategoryHierarchy?.length > 0 
    ? currentCategoryHierarchy[currentCategoryHierarchy.length - 1].name
    : 'Collections';

  return (
    <div className="mb-12">
      
      {/* BREADCRUMBS */}
      <div className="text-center mb-8">
        <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
          <button onClick={() => updateFilterImmediate('category', null)} className="hover:text-black transition-colors">
            ALL COLLECTIONS
          </button>
          {currentCategoryHierarchy?.map((cat: any, index: number) => (
            <div key={cat.id} className="flex items-center gap-2">
              <span>/</span>
              <button onClick={() => updateFilterImmediate('category', cat.slug)} className={`hover:text-black transition-colors ${index === currentCategoryHierarchy.length - 1 ? 'text-black' : ''}`}>
                {cat.name}
              </button>
            </div>
          ))}
        </div>
        <h1 className="text-3xl md:text-5xl font-serif text-black">{displayTitle}</h1>
      </div>

      {/* FILTER CONTROLS */}
      <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-6">
        <button onClick={() => setIsDrawerOpen(true)} className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors px-5 py-2.5 text-[10px] md:text-xs font-bold uppercase tracking-widest">
          Filter {activeFiltersCount > 0 && <span className="bg-black text-white rounded-full w-4 h-4 flex items-center justify-center text-[8px]">{activeFiltersCount}</span>}
        </button>
        <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-black">{totalProducts} Items</span>
      </div>

      {/* ACTIVE BADGES */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-8">
          {urlCategory && (
            <button onClick={() => updateFilterImmediate('category', null)} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-red-50 hover:text-red-600 hover:border-red-200 border border-gray-200 text-[10px] font-bold uppercase tracking-widest transition-colors group">
               {displayTitle} <span className="text-gray-400 group-hover:text-red-600">&times;</span>
            </button>
          )}
          {activeSizes.map(sizeId => {
            const s = sizes.find((s: any) => s.id === sizeId);
            return s && (
              <button key={sizeId} onClick={() => updateFilterImmediate('sizes', sizeId)} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-red-50 hover:text-red-600 hover:border-red-200 border border-gray-200 text-[10px] font-bold uppercase tracking-widest transition-colors group">
                Size {s.name} <span className="text-gray-400 group-hover:text-red-600">&times;</span>
              </button>
            )
          })}
          {activeColors.map(colorId => {
            const c = colors.find((c: any) => c.id === colorId);
            return c && (
              <button key={colorId} onClick={() => updateFilterImmediate('colors', colorId)} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-red-50 hover:text-red-600 hover:border-red-200 border border-gray-200 text-[10px] font-bold uppercase tracking-widest transition-colors group">
                {c.name} <span className="text-gray-400 group-hover:text-red-600">&times;</span>
              </button>
            )
          })}
        </div>
      )}

      {/* DRAWER LACI */}
      <div className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-[100] transition-opacity duration-300 ${isDrawerOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={handleManualClose} />
      <div className={`fixed top-0 left-0 h-[100dvh] w-[85vw] md:w-[400px] bg-white z-[110] shadow-2xl transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
          <h2 className="text-xs font-black uppercase tracking-widest text-black">Refine Selection</h2>
          <button onClick={handleManualClose} className="text-2xl font-light hover:opacity-50">&times;</button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar space-y-10">
          
          {/* Category Draft */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-6">Category</h3>
            <div className="space-y-5">
              <button 
                onClick={() => setDraftCategory(null)} 
                className={`block text-xs uppercase tracking-widest transition-all ${!draftCategory ? 'font-black text-black scale-105 origin-left' : 'text-gray-500 hover:text-black'}`}
              >
                All Collections
              </button>
              
              {categories.filter((c: any) => !c.parentId).map((parent: any) => {
                const children = categories.filter((c: any) => c.parentId === parent.id);
                const isParentActive = draftCategory === parent.slug;
                const isChildActive = children.some((c: any) => c.slug === draftCategory);

                return (
                  <div key={parent.id} className="space-y-3">
                    <button 
                      onClick={() => setDraftCategory(parent.slug)} 
                      className={`block text-xs uppercase tracking-widest transition-all ${(isParentActive || isChildActive) ? 'font-black text-black' : 'text-gray-500 hover:text-black'}`}
                    >
                      {parent.name}
                    </button>
                    
                    {children.length > 0 && (
                      <div className="pl-4 space-y-3 border-l-2 border-gray-100 ml-1 mt-3">
                        {children.map((child: any) => (
                          <button 
                            key={child.id} 
                            onClick={() => setDraftCategory(child.slug)} 
                            className={`block text-[10px] uppercase tracking-widest transition-all ${draftCategory === child.slug ? 'font-bold text-black' : 'text-gray-400 hover:text-black'}`}
                          >
                            {child.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Sizes Draft */}
          <div className="border-t border-gray-100 pt-10">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-6">Size</h3>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size: any) => (
                <button 
                  key={size.id} 
                  onClick={() => setDraftSizes(prev => prev.includes(size.id) ? prev.filter(i => i !== size.id) : [...prev, size.id])}
                  className={`border min-w-[3rem] px-3 py-2 text-[10px] uppercase font-bold transition-all ${draftSizes.includes(size.id) ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-200 hover:border-black hover:text-black'}`}
                >
                  {size.name}
                </button>
              ))}
            </div>
          </div>

          {/* Colors Draft */}
          <div className="border-t border-gray-100 pt-10 pb-4">
             <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-6">Color</h3>
             <div className="flex flex-wrap gap-3">
               {colors.map((color: any) => (
                 <button 
                   key={color.id} 
                   onClick={() => setDraftColors(prev => prev.includes(color.id) ? prev.filter(i => i !== color.id) : [...prev, color.id])}
                   className={`border px-3 py-2 text-[10px] uppercase font-bold transition-all flex items-center gap-2 ${draftColors.includes(color.id) ? 'bg-black text-white border-black shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:border-black hover:text-black'}`}
                 >
                   <span className="w-3.5 h-3.5 rounded-full border border-gray-300" style={{ backgroundColor: color.hexCodes[0] || '#000' }} />
                   {color.name}
                 </button>
               ))}
             </div>
          </div>
        </div>
        
        <div className="p-8 border-t border-gray-100 bg-white">
           <button onClick={applyFilters} className="w-full bg-black text-white text-[10px] py-4 uppercase font-bold tracking-widest hover:bg-gray-800 transition-colors">
             Apply & Close
           </button>
        </div>
      </div>
    </div>
  );
}

// 🚀 BUNGKUS DENGAN SUSPENSE AGAR NEXT.JS BISA MEMBACA SEARCHPARAMS SECARA OPTIMAL
export default function ShopFilterUI(props: any) {
  return (
    <Suspense fallback={<div className="h-20 w-full animate-pulse bg-gray-50 mb-12" />}>
      <FilterUIContent {...props} />
    </Suspense>
  );
}