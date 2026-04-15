'use client';

import React, { useState } from 'react';
import { Globe, Layers, ChevronDown, Layout, Box, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CMS_COMPONENTS } from '@/lib/cms-registry';

interface NavigatorSidebarProps {
  isNavigatorOpen: boolean;
  pageData: any;
  setPageData: React.Dispatch<React.SetStateAction<any>>;
  activeItem: any;
  setActiveItem: (item: any) => void;
  setIsInspectorOpen: (isOpen: boolean) => void;
  expandedNodes: Set<string>;
  toggleNode: (id: string, e: React.MouseEvent) => void;
  addSection: () => void;
  // Fungsi baru untuk modal picker
  onAddBlock: (sectionId: string) => void;
  onAddBlockInside: (sectionId: string, parentId: string) => void;
}

type DropPosition = 'before' | 'after' | 'inside';

export default function NavigatorSidebar({
  isNavigatorOpen, pageData, setPageData, activeItem, setActiveItem, setIsInspectorOpen, expandedNodes, toggleNode, addSection,
  onAddBlock, onAddBlockInside // Ambil props baru
}: NavigatorSidebarProps) {

  // ==========================================
  // STATE DRAG & DROP
  // ==========================================
  const [dragState, setDragState] = useState<{ id: string, type: 'section' | 'block' } | null>(null);
  const [dropState, setDropState] = useState<{ id: string, position: DropPosition } | null>(null);

  // ==========================================
  // HANDLERS DRAG & DROP
  // ==========================================
  const handleDragStart = (e: React.DragEvent, id: string, type: 'section' | 'block') => {
    e.stopPropagation();
    e.dataTransfer.effectAllowed = 'move';
    setDragState({ id, type });
  };

  const handleDragOver = (e: React.DragEvent, targetId: string, targetType: 'section' | 'block', isContainer: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragState || dragState.id === targetId) return;

    if (dragState.type === 'block' && targetType === 'section') {
      setDropState({ id: targetId, position: 'inside' });
      return;
    }

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const y = e.clientY - rect.top;
    const threshold = rect.height / 4;

    let position: DropPosition = 'inside';
    if (y < threshold) position = 'before';
    else if (y > rect.height - threshold) position = 'after';
    else position = isContainer ? 'inside' : 'after';

    setDropState({ id: targetId, position });
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDropState(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string, targetType: 'section' | 'block') => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragState || !dropState) return;

    setPageData((prev: any) => {
      const newData = JSON.parse(JSON.stringify(prev));
      let extractedNode: any = null;

      const removeNode = (blocks: any[]): boolean => {
        for (let i = 0; i < blocks.length; i++) {
          if (blocks[i].id === dragState.id) {
            extractedNode = blocks.splice(i, 1)[0];
            return true;
          }
          if (blocks[i].children && removeNode(blocks[i].children)) return true;
        }
        return false;
      };

      const isDescendant = (node: any, idToCheck: string): boolean => {
        if (!node) return false;
        if (node.id === idToCheck) return true;
        if (node.children) return node.children.some((child: any) => isDescendant(child, idToCheck));
        return false;
      };

      if (dragState.type === 'section' && targetType === 'section') {
        const secIndex = newData.sections.findIndex((s: any) => s.id === dragState.id);
        const targetIndex = newData.sections.findIndex((s: any) => s.id === targetId);
        if (secIndex > -1 && targetIndex > -1) {
          const [sec] = newData.sections.splice(secIndex, 1);
          const insertIdx = dropState.position === 'before' ? targetIndex : targetIndex + 1;
          newData.sections.splice(insertIdx, 0, sec);
        }
        return newData;
      }

      for (const sec of newData.sections) { if (removeNode(sec.blocks)) break; }
      if (!extractedNode) return prev;
      if (isDescendant(extractedNode, targetId)) return prev;

      const insertNode = (blocks: any[]): boolean => {
        for (let i = 0; i < blocks.length; i++) {
          if (blocks[i].id === targetId) {
            if (dropState.position === 'before') {
              blocks.splice(i, 0, extractedNode);
            } else if (dropState.position === 'after') {
              blocks.splice(i + 1, 0, extractedNode);
            } else if (dropState.position === 'inside') {
              blocks[i].children = blocks[i].children || [];
              blocks[i].children.push(extractedNode);
            }
            return true;
          }
          if (blocks[i].children && insertNode(blocks[i].children)) return true;
        }
        return false;
      };

      for (const sec of newData.sections) {
        if (targetType === 'section' && sec.id === targetId && dropState.position === 'inside') {
          sec.blocks.push(extractedNode);
          break;
        } else if (insertNode(sec.blocks)) {
          break;
        }
      }

      return newData;
    });

    setDragState(null);
    setDropState(null);
  };

  // ==========================================
  // RENDERER REKURSIF
  // ==========================================
  const renderNavBlock = (block: any, sectionId: string, depth = 0) => {
    const isSelected = activeItem?.type === 'block' && activeItem.id === block.id;
    const hasChildren = block.children && block.children.length > 0;
    const isExpanded = expandedNodes.has(block.id);
    const isContainer = block.type === 'ATOMIC_CONTAINER' || block.type === 'ATOMIC_PRODUCT_CAROUSEL';
    
    const isDragTarget = dropState?.id === block.id;

    return (
      <div key={block.id} className="w-full">
        <div
          draggable
          onDragStart={(e) => handleDragStart(e, block.id, 'block')}
          onDragOver={(e) => handleDragOver(e, block.id, 'block', isContainer)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, block.id, 'block')}
          className={cn(
            "group flex items-center gap-1.5 py-1.5 px-2 rounded-md cursor-grab transition-all text-xs select-none border border-transparent relative",
            isSelected ? "bg-blue-100 text-blue-700 font-bold" : "hover:bg-gray-100 text-gray-700",
            dragState?.id === block.id && "opacity-30",
            isDragTarget && dropState?.position === 'before' && "border-t-blue-500 rounded-none",
            isDragTarget && dropState?.position === 'after' && "border-b-blue-500 rounded-none",
            isDragTarget && dropState?.position === 'inside' && "bg-blue-50 border-blue-400 ring-2 ring-blue-400/20"
          )}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={(e) => { e.stopPropagation(); setActiveItem({ type: 'block', id: block.id, sectionId }); setIsInspectorOpen(true); }}
        >
          <div className="w-4 flex items-center justify-center shrink-0">
            {hasChildren && (<button onClick={(e) => toggleNode(block.id, e)} className="hover:bg-gray-200 p-0.5 rounded text-gray-400 hover:text-gray-700"><ChevronDown className={cn("w-3 h-3 transition-transform", !isExpanded && "-rotate-90")} /></button>)}
          </div>
          <Box className={cn("w-3 h-3 shrink-0 pointer-events-none", isSelected ? "text-blue-500" : "text-gray-400")} />
          <span className="truncate flex-1 pointer-events-none">{CMS_COMPONENTS[block.type]?.name || 'Unknown'}</span>
          
          {/* FITUR BARU: TOMBOL ADD (+) MUNCUL SAAT HOVER JIKA INI ADALAH CONTAINER */}
          {isContainer && (
             <button 
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-blue-200 hover:text-blue-700 rounded text-gray-400 transition-opacity"
                onClick={(e) => { 
                   e.stopPropagation(); 
                   onAddBlockInside(sectionId, block.id); 
                   // Ekspansi otomatis node jika belum diekspansi agar user bisa melihat elemen yang baru ditambahkan
                   if (!isExpanded) toggleNode(block.id, e); 
                }}
             >
                <Plus className="w-3 h-3" />
             </button>
          )}
        </div>
        
        {/* Render Anak Rekursif */}
        {hasChildren && isExpanded && (
          <div className="w-full border-l border-gray-100 ml-2">
            {block.children.map((child: any) => renderNavBlock(child, sectionId, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className={cn("bg-white border-r border-gray-200 shadow-sm flex flex-col shrink-0 z-30 transition-all duration-300 ease-in-out", isNavigatorOpen ? "w-[260px]" : "w-0 overflow-hidden border-r-0 opacity-0")}>
      <header className="h-14 border-b px-4 flex items-center gap-2 bg-gray-50 text-gray-900 shrink-0">
        <Layers className="w-4 h-4 text-blue-500" />
        <h2 className="text-[11px] font-black uppercase tracking-widest text-gray-700">Navigator</h2>
      </header>

      <div 
        className="flex-1 overflow-y-auto p-3 pb-24 custom-scrollbar"
        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'none'; }}
      >
        <div className={cn("flex items-center gap-2 px-2 py-2 mb-2 rounded-md cursor-pointer transition-colors text-xs font-bold", activeItem?.type === 'page' ? "bg-gray-900 text-white shadow-md" : "hover:bg-gray-100 text-gray-800")} onClick={() => { setActiveItem({ type: 'page', id: pageData?.id }); setIsInspectorOpen(true); }}>
          <Globe className={cn("w-4 h-4", activeItem?.type === 'page' ? "text-blue-400" : "text-gray-400")} />
          <span className="truncate uppercase tracking-widest text-[10px]">Page Body</span>
        </div>

        <div className="space-y-0.5">
          {pageData?.sections?.map((section: any, sIdx: number) => {
            const isSectionSelected = activeItem?.type === 'section' && activeItem.id === section.id;
            const isExpanded = expandedNodes.has(section.id);
            const hasBlocks = section.blocks && section.blocks.length > 0;
            const isDragTarget = dropState?.id === section.id;

            return (
              <div key={section.id} className="w-full">
                <div 
                  draggable
                  onDragStart={(e) => handleDragStart(e, section.id, 'section')}
                  onDragOver={(e) => handleDragOver(e, section.id, 'section', true)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, section.id, 'section')}
                  className={cn(
                    "group flex items-center gap-1.5 py-1.5 px-2 rounded-md cursor-grab transition-all text-xs border border-transparent", 
                    isSectionSelected ? "bg-blue-100 text-blue-800 font-bold" : "hover:bg-gray-100 text-gray-800 font-medium",
                    dragState?.id === section.id && "opacity-30",
                    isDragTarget && dropState?.position === 'before' && "border-t-blue-500 rounded-none",
                    isDragTarget && dropState?.position === 'after' && "border-b-blue-500 rounded-none",
                    isDragTarget && dropState?.position === 'inside' && "bg-blue-50 border-blue-400 ring-2 ring-blue-400/20"
                  )} 
                  onClick={(e) => { e.stopPropagation(); setActiveItem({ type: 'section', id: section.id }); setIsInspectorOpen(true); }}
                >
                  <div className="w-4 flex items-center justify-center shrink-0">
                    <button onClick={(e) => toggleNode(section.id, e)} className="hover:bg-gray-200 p-0.5 rounded text-gray-500 hover:text-gray-900"><ChevronDown className={cn("w-3.5 h-3.5 transition-transform", !isExpanded && "-rotate-90")} /></button>
                  </div>
                  <Layout className={cn("w-3.5 h-3.5 shrink-0 pointer-events-none", isSectionSelected ? "text-blue-600" : "text-gray-500")} />
                  <span className="truncate flex-1 pointer-events-none">{section.name || `Section ${sIdx + 1}`}</span>

                  {/* FITUR BARU: TOMBOL ADD (+) MUNCUL SAAT HOVER PADA SECTION */}
                  <button 
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-blue-200 hover:text-blue-700 rounded text-gray-400 transition-opacity"
                    onClick={(e) => { 
                       e.stopPropagation(); 
                       onAddBlock(section.id);
                       if (!isExpanded) toggleNode(section.id, e); 
                    }}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                
                {/* Render Child Blocks */}
                {isExpanded && (
                  <div className="w-full mt-0.5 pl-2 border-l border-gray-100 ml-2">
                    {section.blocks.map((block: any) => renderNavBlock(block, section.id, 0))}
                    
                    {/* Empty Drop Zone for Section */}
                    {!hasBlocks && (
                      <div className="py-2 pl-4 border-l border-dashed border-gray-300 text-[9px] text-gray-400 uppercase tracking-widest font-bold">
                        Section Kosong
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <Button onClick={addSection} variant="ghost" className="w-full mt-4 text-[10px] uppercase font-bold tracking-widest text-gray-400 hover:text-blue-600 border border-dashed border-gray-200">+ Add Section</Button>
      </div>
    </aside>
  );
}