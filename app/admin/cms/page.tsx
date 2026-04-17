'use client';

import { useState, useEffect, useRef } from 'react';
import { Save, Loader2, Monitor, Smartphone, Globe, PanelRightClose, PanelRightOpen, Layers, ExternalLink } from 'lucide-react';

// UI Components
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

// CMS Partials & Modals
import IFrameWrapper from '@/components/cms/IFrameWrapper';
import NavigatorSidebar from '@/components/cms/NavigatorSidebar';
import InspectorSidebar from '@/components/cms/InspectorSidebar';
import ComponentPickerModal from '@/components/cms/ComponentPickerModal';
import { ProductPickerModal } from "@/components/admin/ProductPickerModal";
import { ProductImagePickerModal } from "@/components/admin/ProductImagePickerModal";

import { CMS_TEMPLATES } from '@/lib/cms-templates';
import { cn } from "@/lib/utils";

import dynamic from 'next/dynamic';

// Memaksa PreviewRenderer menjadi murni SPA (Client-Side Only)
const PreviewRenderer = dynamic(() => import("@/components/cms/PreviewRenderer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] flex flex-col items-center justify-center bg-gray-50/50 m-4 rounded-3xl border-2 border-dashed border-gray-200">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-xs uppercase tracking-widest text-gray-400 font-bold animate-pulse">Memuat Kanvas SPA...</p>
    </div>
  )
});

export default function CMSBuilderPage() {
  // ==========================================
  // STATE MANAGEMENT (Single Source of Truth)
  // ==========================================
  const [slug, setSlug] = useState('home');
  const [isInitialized, setIsInitialized] = useState(false);
  const [allPages, setAllPages] = useState<any[]>([]);
  const [pageData, setPageData] = useState<any>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);
  const [isNavigatorOpen, setIsNavigatorOpen] = useState(true);
  const [activeItem, setActiveItem] = useState<{ type: 'page' | 'section' | 'block', id: string, sectionId?: string } | null>(null);

  const [pickerTarget, setPickerTarget] = useState<any>(null);
  const [imagePickerTarget, setImagePickerTarget] = useState<any>(null);
  const [uploadTarget, setUploadTarget] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const fontInputRef = useRef<HTMLInputElement>(null);

  const [isBlockPickerOpen, setIsBlockPickerOpen] = useState(false);
  const [targetSectionId, setTargetSectionId] = useState<string | null>(null);
  const [targetParentId, setTargetParentId] = useState<string | null>(null);

  const workspaceRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(1);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // ==========================================
  // EFFECTS & INITIALIZATION
  // ==========================================
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slugParam = params.get('slug');
    if (slugParam) setSlug(slugParam);
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    const fetchAllPages = async () => {
      const res = await fetch('/api/admin/pages');
      if (res.ok) {
        const data = await res.json();
        setAllPages(Array.isArray(data) ? data : (data.data || []));
      }
    };
    fetchAllPages();
  }, []);

  useEffect(() => {
    const updateScale = () => {
      if (!workspaceRef.current) return;
      const width = workspaceRef.current.clientWidth;
      const targetWidth = viewMode === 'desktop' ? 1280 : 375;
      const padding = viewMode === 'desktop' ? 80 : 40;
      if (width === 0) return;
      setPreviewScale(Math.min(1, (width - padding) / targetWidth));
    };

    updateScale();
    const resizeObserver = new ResizeObserver(() => updateScale());
    if (workspaceRef.current) resizeObserver.observe(workspaceRef.current);

    let animationFrameId: number;
    const startTime = performance.now();
    const syncWithSidebarAnimation = (currentTime: number) => {
      updateScale();
      if (currentTime - startTime < 350) animationFrameId = requestAnimationFrame(syncWithSidebarAnimation);
    };
    animationFrameId = requestAnimationFrame(syncWithSidebarAnimation);

    return () => { resizeObserver.disconnect(); cancelAnimationFrame(animationFrameId); };
  }, [viewMode, isInspectorOpen, isNavigatorOpen]);

  useEffect(() => {
    if (!isInitialized) return;
    const fetchPage = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/admin/pages/${slug}`);
        const data = await res.json();

        // Sinkronisasi Custom Fonts Global
        const globalFonts = JSON.parse(localStorage.getItem('alive_cms_fonts') || '[]');
        const mergedFonts = [...(data.customFonts || [])];
        globalFonts.forEach((gf: any) => {
          if (!mergedFonts.find((f: any) => f.name === gf.name)) mergedFonts.push(gf);
        });
        data.customFonts = mergedFonts;

        setPageData(data);
        setActiveItem({ type: 'page', id: data?.id });
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPage();
  }, [slug, isInitialized]);

  // ==========================================
  // CORE LOGIC & HANDLERS
  // ==========================================
  const toggleNode = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getSeoAnalysis = () => {
    if (!pageData) return { score: 0, items: [], structure: [] };
    let score = 100;
    const items: { type: 'success' | 'warning' | 'error', text: string }[] = [];
    const structure: { tag: string, text: string }[] = [];
    let wordCount = 0; let hasH1 = false;

    const tLen = pageData.metaTitle?.length || 0;
    if (tLen === 0) { items.push({ type: 'error', text: 'Meta Title kosong.' }); score -= 20; }
    else if (tLen < 30 || tLen > 60) { items.push({ type: 'warning', text: `Meta Title: ${tLen} karakter. (Ideal: 30-60)` }); score -= 5; }
    else { items.push({ type: 'success', text: 'Panjang Meta Title ideal.' }); }

    const dLen = pageData.metaDescription?.length || 0;
    if (dLen === 0) { items.push({ type: 'error', text: 'Meta Description kosong.' }); score -= 20; }
    else if (dLen < 120 || dLen > 160) { items.push({ type: 'warning', text: `Meta Desc: ${dLen} karakter. (Ideal: 120-160)` }); score -= 10; }
    else { items.push({ type: 'success', text: 'Panjang Meta Description ideal.' }); }

    if (!pageData.ogImage) { items.push({ type: 'warning', text: 'OG Image belum diatur.' }); score -= 10; }
    else { items.push({ type: 'success', text: 'OG Image sudah terpasang.' }); }

    pageData.sections?.forEach((sec: any) => {
      const scanBlocks = (blocks: any[]) => {
        blocks.forEach((blk: any) => {
          if (blk.type === 'ATOMIC_HEADING') {
            structure.push({ tag: (blk.content?.tag || 'h2').toUpperCase(), text: blk.content?.text || 'Heading' });
            if (blk.content?.tag === 'h1') hasH1 = true;
          }
          Object.values(blk.content || {}).forEach((val: any) => {
            if (typeof val === 'string') wordCount += val.split(/\s+/).filter(w => w.length > 1).length;
          });
          if (blk.children) scanBlocks(blk.children);
        });
      };
      scanBlocks(sec.blocks || []);
    });

    if (!hasH1) { items.push({ type: 'error', text: 'Tidak ada Hero/Heading utama (H1).' }); score -= 15; }
    else { items.push({ type: 'success', text: 'Heading Utama (H1) terdeteksi.' }); }
    if (wordCount < 50) { items.push({ type: 'error', text: `Konten terlalu tipis (Est. ${wordCount} kata).` }); score -= 20; }
    else if (wordCount < 150) { items.push({ type: 'warning', text: `Konten cukup tipis (Est. ${wordCount} kata).` }); score -= 5; }
    else { items.push({ type: 'success', text: `Kepadatan konten baik (Est. ${wordCount} kata).` }); }

    return { score: Math.max(0, score), items, structure };
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch(`/api/admin/pages/${slug}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(pageData) });
      alert("Perubahan dipublikasikan!");
    } finally { setIsSaving(false); }
  };

  const addSection = () => {
    const newSection = { id: `sec-${Date.now()}`, name: `New Section`, width: 'max-w-7xl', minHeight: 'auto', paddingY: 'py-20', backgroundColor: 'transparent', blocks: [] };
    setPageData({ ...pageData, sections: [...pageData.sections, newSection] });
    setActiveItem({ type: 'section', id: newSection.id });
    setIsInspectorOpen(true);
    setExpandedNodes(prev => new Set(prev).add(newSection.id));
  };

  const updateSection = (sectionId: string, key: string, value: any) => {
    setPageData((prev: any) => ({ ...prev, sections: prev.sections.map((sec: any) => sec.id === sectionId ? { ...sec, [key]: value } : sec) }));
  };

  const injectTemplate = (blockTemplate: any): any => {
    const newId = `blk-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    return { ...blockTemplate, id: newId, children: blockTemplate.children ? blockTemplate.children.map((child: any) => injectTemplate(child)) : [] };
  };

  const handleAddTemplate = (templateKey: string) => {
    if (!targetSectionId) return;
    const template = CMS_TEMPLATES[templateKey];
    if (!template) return;

    // Fungsi bawaan Anda untuk generate ID
    const newBlock = injectTemplate(template.block);

    setPageData((prev: any) => {
      const newSecs = [...prev.sections];
      const secIdx = newSecs.findIndex(s => s.id === targetSectionId);
      if (secIdx === -1) return prev;

      // 🚀 FITUR BARU: Suntikkan properti Section dari Template (seperti Video Background & 100vh)
      if (template.sectionContent) {
        newSecs[secIdx] = {
          ...newSecs[secIdx],
          content: {
            ...(newSecs[secIdx].content || {}), // Pertahankan data lama jika ada
            ...template.sectionContent          // Timpa dengan data dari template
          }
        };
      }

      if (targetParentId) {
        const addRecursive = (blocks: any[]): any[] => {
          return blocks.map(b => {
            if (b.id === targetParentId) return { ...b, children: [...(b.children || []), newBlock] };
            if (b.children) return { ...b, children: addRecursive(b.children) };
            return b;
          });
        };
        newSecs[secIdx] = { ...newSecs[secIdx], blocks: addRecursive(newSecs[secIdx].blocks) };
      } else {
        newSecs[secIdx] = { ...newSecs[secIdx], blocks: [...newSecs[secIdx].blocks, newBlock] };
      }

      return { ...prev, sections: newSecs };
    });

    setIsBlockPickerOpen(false);
    setTargetSectionId(null);
    setTargetParentId(null);
    setActiveItem({ type: 'block', id: newBlock.id, sectionId: targetSectionId });
    setExpandedNodes(prev => new Set(prev).add(newBlock.id));
    setIsInspectorOpen(true);
  };

  const handleAddBlock = (type: string) => {
    if (!targetSectionId) return;
    const newBlock = { id: `blk-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`, type: type, content: {}, children: [] };

    setPageData((prev: any) => {
      const newSecs = [...prev.sections];
      const secIdx = newSecs.findIndex(s => s.id === targetSectionId);
      if (secIdx === -1) return prev;

      if (targetParentId) {
        const addRecursive = (blocks: any[]): any[] => {
          return blocks.map(b => {
            if (b.id === targetParentId) return { ...b, children: [...(b.children || []), newBlock] };
            if (b.children) return { ...b, children: addRecursive(b.children) };
            return b;
          });
        };
        newSecs[secIdx] = { ...newSecs[secIdx], blocks: addRecursive(newSecs[secIdx].blocks) };
      } else {
        newSecs[secIdx] = { ...newSecs[secIdx], blocks: [...newSecs[secIdx].blocks, newBlock] };
      }
      return { ...prev, sections: newSecs };
    });

    setIsBlockPickerOpen(false);
    setTargetSectionId(null);
    setTargetParentId(null);
    setActiveItem({ type: 'block', id: newBlock.id, sectionId: targetSectionId });
    if (targetParentId) setExpandedNodes(prev => new Set(prev).add(targetParentId));
    setIsInspectorOpen(true);
  };

  const updateBlockContent = (sectionId: string, blockId: string, key: string, value: any) => {
    const updateRecursive = (blocks: any[]): any[] => {
      return blocks.map(b => {
        if (b.id === blockId) return { ...b, content: { ...b.content, [key]: value } };
        if (b.children) return { ...b, children: updateRecursive(b.children) };
        return b;
      });
    };
    setPageData((prev: any) => ({ ...prev, sections: prev.sections.map((sec: any) => sec.id === sectionId ? { ...sec, blocks: updateRecursive(sec.blocks) } : sec) }));
  };

  const deleteItem = (type: 'section' | 'block', id: string, sectionId?: string) => {
    if (!confirm(`Hapus item ini?`)) return;
    const deleteRecursive = (blocks: any[]): any[] => {
      return blocks.filter(b => b.id !== id).map(b => {
        if (b.children) return { ...b, children: deleteRecursive(b.children) };
        return b;
      });
    };
    setPageData((prev: any) => {
      let newSecs = [...prev.sections];
      if (type === 'section') newSecs = newSecs.filter(s => s.id !== id);
      if (type === 'block' && sectionId) {
        newSecs = newSecs.map(s => s.id === sectionId ? { ...s, blocks: deleteRecursive(s.blocks) } : s);
      }
      return { ...prev, sections: newSecs };
    });
    setActiveItem({ type: 'page', id: pageData.id });
  };

  const moveItem = (type: 'section' | 'block', id: string, direction: 'up' | 'down', sectionId?: string) => {
    const moveRecursive = (blocks: any[], targetId: string): any[] => {
      const idx = blocks.findIndex(b => b.id === targetId);
      if (idx !== -1) {
        const newB = [...blocks];
        if (direction === 'up' && idx > 0) [newB[idx - 1], newB[idx]] = [newB[idx], newB[idx - 1]];
        if (direction === 'down' && idx < newB.length - 1) [newB[idx + 1], newB[idx]] = [newB[idx], newB[idx + 1]];
        return newB;
      }
      return blocks.map(b => {
        if (b.children) return { ...b, children: moveRecursive(b.children, targetId) };
        return b;
      });
    };
    setPageData((prev: any) => {
      const newSecs = [...prev.sections];
      if (type === 'section') {
        const idx = newSecs.findIndex(s => s.id === id);
        if (direction === 'up' && idx > 0) [newSecs[idx - 1], newSecs[idx]] = [newSecs[idx], newSecs[idx - 1]];
        if (direction === 'down' && idx < newSecs.length - 1) [newSecs[idx + 1], newSecs[idx]] = [newSecs[idx], newSecs[idx + 1]];
      } else if (type === 'block' && sectionId) {
        const secIdx = newSecs.findIndex(s => s.id === sectionId);
        if (secIdx !== -1) newSecs[secIdx] = { ...newSecs[secIdx], blocks: moveRecursive(newSecs[secIdx].blocks, id) };
      }
      return { ...prev, sections: newSecs };
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadTarget) return;
    setIsUploading(true);
    try {
      const res = await fetch(`/api/admin/upload?filename=${file.name}`, { method: 'POST', body: file });
      const blob = await res.json();
      if (uploadTarget.sectionId === 'page') setPageData({ ...pageData, [uploadTarget.key]: blob.url });
      else updateBlockContent(uploadTarget.sectionId, uploadTarget.blockId, uploadTarget.key, blob.url);
    } finally {
      setIsUploading(false); setUploadTarget(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const res = await fetch(`/api/admin/upload?filename=${file.name}`, { method: 'POST', body: file });
      const blob = await res.json();
      const rawName = file.name.split('.')[0];
      const fontName = rawName.replace(/[^a-zA-Z0-9]/g, '');
      const newFont = { name: fontName, url: blob.url };
      const updatedPageData = { ...pageData, customFonts: [...(pageData?.customFonts || []), newFont] };
      setPageData(updatedPageData);
      localStorage.setItem('alive_cms_fonts', JSON.stringify(updatedPageData.customFonts));
      await fetch(`/api/admin/pages/${slug}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedPageData) });
    } finally {
      setIsUploading(false);
      if (fontInputRef.current) fontInputRef.current.value = '';
    }
  };

  // ==========================================
  // DATA FINDERS FOR CHILDREN
  // ==========================================
  let activeData: any = null;
  const seoData = getSeoAnalysis();

  if (activeItem?.type === 'page') activeData = pageData;
  if (activeItem?.type === 'section') {
    const activeSecIndex = pageData?.sections?.findIndex((s: any) => s.id === activeItem.id);
    if (activeSecIndex !== undefined && activeSecIndex !== -1) activeData = pageData.sections[activeSecIndex];
  }
  if (activeItem?.type === 'block' && activeItem.sectionId) {
    const sec = pageData?.sections?.find((s: any) => s.id === activeItem.sectionId);
    if (sec) {
      const findBlockRecursive = (blocks: any[], id: string): any => {
        for (let b of blocks) {
          if (b.id === id) return b;
          if (b.children) { const found = findBlockRecursive(b.children, id); if (found) return found; }
        }
        return null;
      };
      activeData = findBlockRecursive(sec.blocks, activeItem.id);
    }
  }

  // ==========================================
  // RENDER MAIN
  // ==========================================
  if (isLoading || !pageData) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400 mb-4" />
        <p className="text-xs uppercase tracking-widest text-gray-400 font-bold">Memuat Kanvas...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#E5E5E5] overflow-hidden font-sans">
      {/* Hidden Inputs for File/Font Uploads */}
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
      <input type="file" ref={fontInputRef} className="hidden" accept=".ttf,.otf,.woff,.woff2" onChange={handleFontUpload} />

      {/* 1. LEFT SIDEBAR: NAVIGATOR */}
      <NavigatorSidebar
        isNavigatorOpen={isNavigatorOpen}
        pageData={pageData}
        setPageData={setPageData}
        activeItem={activeItem}
        setActiveItem={setActiveItem}
        setIsInspectorOpen={setIsInspectorOpen}
        expandedNodes={expandedNodes}
        toggleNode={toggleNode}
        addSection={addSection}
        onAddBlock={(sId: string) => { setTargetSectionId(sId); setTargetParentId(null); setIsBlockPickerOpen(true); }}
        onAddBlockInside={(sId: string, pId: string) => { setTargetSectionId(sId); setTargetParentId(pId); setIsBlockPickerOpen(true); }}
      />

      {/* 2. CENTER AREA: CANVAS PREVIEW */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-14 bg-white border-b px-4 flex items-center justify-between shrink-0 z-20 shadow-sm overflow-x-auto no-scrollbar gap-6">

          {/* BAGIAN KIRI */}
          <div className="flex items-center gap-3 shrink-0">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-black bg-gray-50 border border-gray-200 shrink-0" onClick={() => setIsNavigatorOpen(!isNavigatorOpen)}>
              <Layers className="w-4 h-4" />
            </Button>

            <Separator orientation="vertical" className="h-6" />

            <Select value={slug} onValueChange={(val) => { setSlug(val); setActiveItem(null); }}>
              <SelectTrigger className="w-[160px] h-8 text-xs bg-gray-50 border-gray-200 shrink-0">
                <SelectValue placeholder="Pilih Halaman" />
              </SelectTrigger>
              <SelectContent>
                {allPages.map((p) => (
                  <SelectItem key={p.slug} value={p.slug}>
                    {p.title} <span className="text-[10px] text-gray-400 ml-1">/{p.slug}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Tabs value={viewMode} onValueChange={(v: any) => setViewMode(v)} className="shrink-0">
              <TabsList className="h-8 bg-gray-100">
                <TabsTrigger value="desktop" className="text-[10px] uppercase font-bold px-3 h-6"><Monitor className="w-3 h-3 mr-1.5" /> Desktop</TabsTrigger>
                <TabsTrigger value="mobile" className="text-[10px] uppercase font-bold px-3 h-6"><Smartphone className="w-3 h-3 mr-1.5" /> Mobile</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* BAGIAN KANAN */}
          <div className="flex items-center gap-2 shrink-0">

            {/* FITUR BARU: TOMBOL LIHAT WEB PUBLIK */}
            <Button variant="outline" size="sm" className="h-8 text-xs font-bold text-gray-600 bg-white border-gray-200 shadow-sm hover:text-blue-600 hover:border-blue-200 shrink-0" asChild>
              <a href={`/${slug}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-3 h-3 mr-1.5" /> Lihat Web
              </a>
            </Button>

            <Button size="sm" className="h-8 text-xs font-bold bg-blue-600 hover:bg-blue-700 shadow-md shrink-0" onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3 mr-1.5" />} Publish
            </Button>

            <Separator orientation="vertical" className="h-6 mx-1" />

            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-black bg-gray-50 border border-gray-200 shrink-0" onClick={() => setIsInspectorOpen(!isInspectorOpen)}>
              {isInspectorOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
            </Button>
          </div>

        </header>

        <div ref={workspaceRef} className="flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-10 flex flex-col items-center custom-scrollbar">
          <div className="pb-32 transition-transform duration-300 ease-out origin-top flex justify-center w-full" style={{ transform: `scale(${previewScale})`, width: viewMode === 'desktop' ? '1280px' : '375px' }}>
            <div className={cn("bg-white shadow-2xl shrink-0 transition-all origin-top flex flex-col", viewMode === 'desktop' ? "w-full min-h-[800px] border border-gray-200" : "w-full h-[812px] rounded-[40px] border-[14px] border-gray-900 overflow-hidden relative")}>
              <IFrameWrapper>
                <PreviewRenderer
                  sections={pageData.sections}
                  activeItem={activeItem}
                  pageTitle={pageData.title}
                  customFonts={pageData.customFonts}
                  onSelectPage={() => { setActiveItem({ type: 'page', id: pageData.id }); setIsInspectorOpen(true); }}
                  onSelectBlock={(sId: string, bId: string) => { setActiveItem({ type: 'block', id: bId, sectionId: sId }); setIsInspectorOpen(true); }}
                  onSelectSection={(sId: string) => { setActiveItem({ type: 'section', id: sId }); setIsInspectorOpen(true); }}
                  onUpdateBlockContent={updateBlockContent}
                  onAddSection={addSection}
                  onAddBlock={(sId: string) => { setTargetSectionId(sId); setTargetParentId(null); setIsBlockPickerOpen(true); }}
                  onAddBlockInside={(sId: string, pId: string) => { setTargetSectionId(sId); setTargetParentId(pId); setIsBlockPickerOpen(true); }}
                />
              </IFrameWrapper>
            </div>
          </div>
        </div>
      </div>

      {/* 3. RIGHT SIDEBAR: INSPECTOR */}
      <InspectorSidebar
        isInspectorOpen={isInspectorOpen}
        activeItem={activeItem}
        activeData={activeData}
        pageData={pageData}
        setPageData={setPageData}
        viewMode={viewMode}
        seoData={seoData}
        isUploading={isUploading}
        updateSection={updateSection}
        updateBlockContent={updateBlockContent}
        moveItem={moveItem}
        deleteItem={deleteItem}
        setImagePickerTarget={setImagePickerTarget}
        setUploadTarget={setUploadTarget}
        setPickerTarget={setPickerTarget}
        fontInputRef={fontInputRef}
        fileInputRef={fileInputRef}
        slug={slug}
      />

      {/* 4. MODALS */}
      <ComponentPickerModal
        isOpen={isBlockPickerOpen}
        onOpenChange={setIsBlockPickerOpen}
        handleAddBlock={handleAddBlock}
        handleAddTemplate={handleAddTemplate}
      />

      <ProductPickerModal
        isOpen={!!pickerTarget}
        onClose={() => setPickerTarget(null)}
        onSelect={(v) => {
          if (!pickerTarget) return;

          if (pickerTarget.parentKey && pickerTarget.index !== undefined) {
            const newArr = [...(activeData?.content[pickerTarget.parentKey] || [])];
            if (!newArr[pickerTarget.index]) newArr[pickerTarget.index] = {};

            // 1. Simpan snapshot data produk utuh
            newArr[pickerTarget.index][pickerTarget.key] = v;

            // 2. 🚀 AUTO-FILL: Ambil warna dari varian pertama & gambar
            const firstColor = v.allColors?.[0];
            newArr[pickerTarget.index]['activeColorId'] = firstColor?.id || '';
            newArr[pickerTarget.index]['primaryImage'] = v.images?.[0] || '';
            newArr[pickerTarget.index]['hoverImage'] = v.images?.[1] || '';

            updateBlockContent(pickerTarget.sectionId, pickerTarget.blockId, pickerTarget.parentKey, newArr);
          } else {
            updateBlockContent(pickerTarget.sectionId, pickerTarget.blockId, pickerTarget.key, v);
          }
        }}
      />

      <ProductImagePickerModal
        isOpen={!!imagePickerTarget}
        onClose={() => setImagePickerTarget(null)}
        onSelect={(url) => {
          if (!imagePickerTarget) return;
          if (imagePickerTarget.sectionId === 'page') {
            setPageData({ ...pageData, [imagePickerTarget.key]: url });
          } else if (imagePickerTarget.parentKey && imagePickerTarget.index !== undefined) {
            const newArr = [...(activeData?.content[imagePickerTarget.parentKey] || [])];
            newArr[imagePickerTarget.index][imagePickerTarget.key] = url;
            updateBlockContent(imagePickerTarget.sectionId, imagePickerTarget.blockId, imagePickerTarget.parentKey, newArr);
          } else {
            updateBlockContent(imagePickerTarget.sectionId, imagePickerTarget.blockId, imagePickerTarget.key, url);
          }
        }}
      />

    </div>
  );
}