'use client';

import React from 'react';
import { Globe, Layers, ChevronDown, Layout, Box } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CMS_COMPONENTS } from '@/lib/cms-registry';

interface NavigatorSidebarProps {
  isNavigatorOpen: boolean;
  pageData: any;
  activeItem: any;
  setActiveItem: (item: any) => void;
  setIsInspectorOpen: (isOpen: boolean) => void;
  expandedNodes: Set<string>;
  toggleNode: (id: string, e: React.MouseEvent) => void;
  addSection: () => void;
}

export default function NavigatorSidebar({
  isNavigatorOpen, pageData, activeItem, setActiveItem, setIsInspectorOpen, expandedNodes, toggleNode, addSection
}: NavigatorSidebarProps) {

  const renderNavBlock = (block: any, sectionId: string, depth = 0) => {
    const isSelected = activeItem?.type === 'block' && activeItem.id === block.id;
    const hasChildren = block.children && block.children.length > 0;
    const isExpanded = expandedNodes.has(block.id);

    return (
      <div key={block.id} className="w-full">
        <div
          className={cn("flex items-center gap-1.5 py-1.5 px-2 rounded-md cursor-pointer transition-colors text-xs select-none", isSelected ? "bg-blue-100 text-blue-700 font-bold" : "hover:bg-gray-100 text-gray-700")}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={(e) => { e.stopPropagation(); setActiveItem({ type: 'block', id: block.id, sectionId }); setIsInspectorOpen(true); }}
        >
          <div className="w-4 flex items-center justify-center shrink-0">
            {hasChildren && (<button onClick={(e) => toggleNode(block.id, e)} className="hover:bg-gray-200 p-0.5 rounded text-gray-400 hover:text-gray-700"><ChevronDown className={cn("w-3 h-3 transition-transform", !isExpanded && "-rotate-90")} /></button>)}
          </div>
          <Box className={cn("w-3 h-3 shrink-0", isSelected ? "text-blue-500" : "text-gray-400")} />
          <span className="truncate flex-1">{CMS_COMPONENTS[block.type]?.name || 'Unknown'}</span>
        </div>
        {hasChildren && isExpanded && (<div className="w-full">{block.children.map((child: any) => renderNavBlock(child, sectionId, depth + 1))}</div>)}
      </div>
    );
  };

  return (
    <aside className={cn("bg-white border-r border-gray-200 shadow-sm flex flex-col shrink-0 z-30 transition-all duration-300 ease-in-out", isNavigatorOpen ? "w-[260px]" : "w-0 overflow-hidden border-r-0 opacity-0")}>
      <header className="h-14 border-b px-4 flex items-center gap-2 bg-gray-50 text-gray-900 shrink-0">
        <Layers className="w-4 h-4 text-blue-500" />
        <h2 className="text-[11px] font-black uppercase tracking-widest text-gray-700">Navigator</h2>
      </header>

      <div className="flex-1 overflow-y-auto p-3 pb-24 custom-scrollbar">
        <div className={cn("flex items-center gap-2 px-2 py-2 mb-2 rounded-md cursor-pointer transition-colors text-xs font-bold", activeItem?.type === 'page' ? "bg-gray-900 text-white shadow-md" : "hover:bg-gray-100 text-gray-800")} onClick={() => { setActiveItem({ type: 'page', id: pageData?.id }); setIsInspectorOpen(true); }}>
          <Globe className={cn("w-4 h-4", activeItem?.type === 'page' ? "text-blue-400" : "text-gray-400")} />
          <span className="truncate uppercase tracking-widest text-[10px]">Page Body</span>
        </div>

        <div className="space-y-0.5">
          {pageData?.sections?.map((section: any, sIdx: number) => {
            const isSectionSelected = activeItem?.type === 'section' && activeItem.id === section.id;
            const isExpanded = expandedNodes.has(section.id);
            const hasBlocks = section.blocks && section.blocks.length > 0;

            return (
              <div key={section.id} className="w-full">
                <div className={cn("flex items-center gap-1.5 py-1.5 px-2 rounded-md cursor-pointer transition-colors text-xs", isSectionSelected ? "bg-blue-100 text-blue-800 font-bold" : "hover:bg-gray-100 text-gray-800 font-medium")} onClick={(e) => { e.stopPropagation(); setActiveItem({ type: 'section', id: section.id }); setIsInspectorOpen(true); }}>
                  <div className="w-4 flex items-center justify-center shrink-0">
                    {hasBlocks && (<button onClick={(e) => toggleNode(section.id, e)} className="hover:bg-gray-200 p-0.5 rounded text-gray-500 hover:text-gray-900"><ChevronDown className={cn("w-3.5 h-3.5 transition-transform", !isExpanded && "-rotate-90")} /></button>)}
                  </div>
                  <Layout className={cn("w-3.5 h-3.5 shrink-0", isSectionSelected ? "text-blue-600" : "text-gray-500")} />
                  <span className="truncate flex-1">{section.name || `Section ${sIdx + 1}`}</span>
                </div>
                {hasBlocks && isExpanded && (<div className="w-full mt-0.5">{section.blocks.map((block: any) => renderNavBlock(block, section.id, 0))}</div>)}
              </div>
            );
          })}
        </div>
        <Button onClick={addSection} variant="ghost" className="w-full mt-4 text-[10px] uppercase font-bold tracking-widest text-gray-400 hover:text-blue-600 border border-dashed border-gray-200">+ Add Section</Button>
      </div>
    </aside>
  );
}