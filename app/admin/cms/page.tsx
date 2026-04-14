'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Save, Settings, Loader2, Monitor, Smartphone, Globe,
  PanelRightClose, PanelRightOpen, ImageIcon, UploadCloud, ChevronRight, Box,
  ArrowUp, ArrowDown, Trash2, CheckCircle2, AlertTriangle, XCircle, Activity,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  MoveHorizontal,
  Type,
  Palette
} from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { CMS_COMPONENTS, CMSField } from '@/lib/cms-registry';
import PreviewRenderer from "@/components/cms/PreviewRenderer";
import { ProductPickerModal } from "@/components/admin/ProductPickerModal";
import { ProductImagePickerModal } from "@/components/admin/ProductImagePickerModal";
import { cn } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const IFrameWrapper = ({ children }: { children: React.ReactNode }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeBody, setIframeBody] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument;
    if (!doc) return;

    const meta = doc.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    doc.head.appendChild(meta);

    const styles = document.head.querySelectorAll('style, link[rel="stylesheet"]');
    styles.forEach((style) => doc.head.appendChild(style.cloneNode(true)));

    doc.body.className = document.body.className;
    doc.body.style.margin = '0';
    doc.body.style.padding = '0';
    doc.body.style.backgroundColor = 'transparent';
    doc.body.style.minHeight = '100vh';
    doc.documentElement.style.overflowX = 'hidden';
    doc.body.style.overflowX = 'hidden';
    doc.body.style.width = '100%';

    setIframeBody(doc.body);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeName === 'STYLE' || node.nodeName === 'LINK') doc.head.appendChild(node.cloneNode(true));
        });
      });
    });
    observer.observe(document.head, { childList: true });

    return () => observer.disconnect();
  }, []);

  return (
    <iframe ref={iframeRef} className="w-full h-full border-0 bg-white block" title="CMS Preview Canvas">
      {iframeBody && createPortal(children, iframeBody)}
    </iframe>
  );
};

export default function CMSBuilderPage() {
  const [slug, setSlug] = useState('home');
  const [isInitialized, setIsInitialized] = useState(false);
  const [allPages, setAllPages] = useState<any[]>([]);
  const [pageData, setPageData] = useState<any>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);
  const [activeItem, setActiveItem] = useState<{ type: 'page' | 'section' | 'block', id: string, sectionId?: string } | null>(null);

  const [pickerTarget, setPickerTarget] = useState<any>(null);
  const [imagePickerTarget, setImagePickerTarget] = useState<any>(null);
  const [uploadTarget, setUploadTarget] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isBlockPickerOpen, setIsBlockPickerOpen] = useState(false);
  const [targetSectionId, setTargetSectionId] = useState<string | null>(null);
  const [targetParentId, setTargetParentId] = useState<string | null>(null);

  const workspaceRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(1);

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
  }, [viewMode, isInspectorOpen]);

  useEffect(() => {
    if (!isInitialized) return;
    const fetchPage = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/admin/pages/${slug}`);
        const data = await res.json();
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

  const getSeoAnalysis = () => {
    if (!pageData) return { score: 0, items: [], structure: [] };
    let score = 100;
    const items: { type: 'success' | 'warning' | 'error', text: string }[] = [];
    const structure: { tag: string, text: string }[] = [];

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

    let wordCount = 0;
    let hasH1 = false;

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
    const newSection = {
      id: `sec-${Date.now()}`,
      name: `New Section`,
      width: 'max-w-7xl',
      minHeight: 'auto',
      paddingY: 'py-20',
      backgroundColor: 'transparent',
      blocks: []
    };
    setPageData({ ...pageData, sections: [...pageData.sections, newSection] });
    setActiveItem({ type: 'section', id: newSection.id });
    setIsInspectorOpen(true);
  };

  // FUNGSI BARU UNTUK UPDATE PROPERTI SECTION SECARA DINAMIS
  const updateSection = (sectionId: string, key: string, value: any) => {
    setPageData((prev: any) => ({
      ...prev,
      sections: prev.sections.map((sec: any) => sec.id === sectionId ? { ...sec, [key]: value } : sec)
    }));
  };

  const handleAddBlock = (type: string) => {
    if (!targetSectionId) return;
    const newBlock = { id: `blk-${Date.now()}`, type: type, content: {}, children: [] };

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
    setPageData((prev: any) => ({
      ...prev,
      sections: prev.sections.map((sec: any) => sec.id === sectionId ? { ...sec, blocks: updateRecursive(sec.blocks) } : sec)
    }));
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

  const renderField = (field: CMSField, sectionId: string, block: any, parentKey?: string, index?: number) => {
    let val = block.content[field.key] || '';
    if (parentKey && index !== undefined) val = block.content[parentKey]?.[index]?.[field.key] || '';

    const onChange = (v: any) => {
      if (parentKey && index !== undefined) {
        const newArr = [...(block.content[parentKey] || [])];
        if (!newArr[index]) newArr[index] = {};
        newArr[index][field.key] = v;
        updateBlockContent(sectionId, block.id, parentKey, newArr);
      } else updateBlockContent(sectionId, block.id, field.key, v);
    };

    switch (field.type) {
      case 'text': case 'video':
        return <div key={field.key} className="space-y-1.5"><Label className="text-[10px] uppercase font-bold text-gray-400">{field.label}</Label><Input value={val} onChange={(e) => onChange(e.target.value)} className="h-8 text-xs" /></div>;

      case 'textarea':
        return <div key={field.key} className="space-y-1.5"><Label className="text-[10px] uppercase font-bold text-gray-400">{field.label}</Label><Textarea value={val} onChange={(e) => onChange(e.target.value)} className="text-xs min-h-[100px]" /></div>;

      case 'number':
        return (
          <div key={field.key} className="space-y-1.5">
            <Label className="text-[10px] uppercase font-bold text-gray-400">{field.label}</Label>
            <Input type="number" value={val} onChange={(e) => onChange(e.target.value)} placeholder="0" className="h-8 text-xs font-mono" />
          </div>
        );

      case 'color':
        return (
          <div key={field.key} className="space-y-1.5">
            <Label className="text-[10px] uppercase font-bold text-gray-400">{field.label}</Label>
            <div className="flex gap-2 items-center">
              <input type="color" value={val || '#000000'} onChange={(e) => onChange(e.target.value)} className="w-8 h-8 p-0 border-0 rounded cursor-pointer overflow-hidden shadow-sm" />
              <Input type="text" value={val || '#000000'} onChange={(e) => onChange(e.target.value)} className="h-8 text-xs font-mono uppercase flex-1" />
            </div>
          </div>
        );

      case 'select':
        return (
          <div key={field.key} className="space-y-1.5">
            <Label className="text-[10px] uppercase font-bold text-gray-400">{field.label}</Label>
            <Select value={val} onValueChange={onChange}>
              <SelectTrigger className="h-8 text-xs bg-white border-gray-200">
                <SelectValue placeholder="Pilih..." />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((opt) => <SelectItem key={opt.value} value={opt.value} className="text-xs">{opt.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        );

      case 'align':
        return (
          <div key={field.key} className="space-y-1.5">
            <Label className="text-[10px] uppercase font-bold text-gray-400">{field.label}</Label>
            <div className="flex bg-gray-100/80 p-1 rounded-lg gap-1 border border-gray-200/50">
              {field.options?.map((opt) => {
                let Icon = AlignLeft;
                const lbl = opt.label.toLowerCase();
                if (lbl.includes('tengah') || opt.value === 'center') Icon = AlignCenter;
                if (lbl.includes('kanan') || opt.value.includes('right') || opt.value.includes('end')) Icon = AlignRight;
                if (lbl.includes('rata') || opt.value.includes('justify') || opt.value.includes('space')) Icon = AlignJustify;

                const isActive = val === opt.value || (!val && (opt.value.includes('left') || opt.value.includes('start')));

                return (
                  <button
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    title={opt.label}
                    className={cn("p-1.5 rounded-md flex-1 flex items-center justify-center transition-all", isActive ? "bg-white shadow-sm text-blue-600 font-bold" : "text-gray-400 hover:text-gray-900 hover:bg-gray-200/50")}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 'image': return (
        <div key={field.key} className="space-y-2 p-3 bg-gray-50 border rounded-md">
          <Label className="text-[10px] uppercase font-bold text-gray-400">{field.label}</Label>
          {val && <div className="h-20 bg-gray-200 rounded overflow-hidden relative"><img src={val} alt="preview" className="w-full h-full object-cover" /></div>}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 text-[10px] h-7" onClick={() => setImagePickerTarget({ sectionId, blockId: block.id, key: field.key, parentKey, index })}><ImageIcon className="w-3 h-3 mr-1" /> Katalog</Button>
            <Button variant="outline" size="sm" className="flex-1 text-[10px] h-7" onClick={() => { setUploadTarget({ sectionId, blockId: block.id, key: field.key, parentKey, index }); fileInputRef.current?.click(); }} disabled={isUploading}><UploadCloud className="w-3 h-3 mr-1" /> Upload</Button>
          </div>
        </div>
      );
      default: return null;
    }
  };

  if (isLoading || !pageData) return <div className="h-screen flex flex-col items-center justify-center bg-white"><Loader2 className="w-8 h-8 animate-spin text-gray-400 mb-4" /><p className="text-xs uppercase tracking-widest text-gray-400 font-bold">Memuat Kanvas...</p></div>;

  let activeData: any = null, activeSecIndex = -1, activeBlkIndex = -1;

  const findBlockRecursive = (blocks: any[], id: string): any => {
    for (let b of blocks) {
      if (b.id === id) return b;
      if (b.children) {
        const found = findBlockRecursive(b.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  if (activeItem?.type === 'page') activeData = pageData;
  if (activeItem?.type === 'section') {
    activeSecIndex = pageData.sections.findIndex((s: any) => s.id === activeItem.id);
    activeData = pageData.sections[activeSecIndex];
  }
  if (activeItem?.type === 'block' && activeItem.sectionId) {
    const sec = pageData.sections.find((s: any) => s.id === activeItem.sectionId);
    if (sec) activeData = findBlockRecursive(sec.blocks, activeItem.id);
  }

  const seoData = getSeoAnalysis();

  return (
    <div className="flex h-screen bg-[#E5E5E5] overflow-hidden font-sans">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />

      <div className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-14 bg-white border-b px-6 flex items-center justify-between shrink-0 z-20 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 rounded-md text-white font-bold text-xs shadow-sm"><Globe className="w-3.5 h-3.5" /> ALIVE BUILDER</div>
            <Select value={slug} onValueChange={(val) => { setSlug(val); setActiveItem(null); }}>
              <SelectTrigger className="w-[180px] h-8 text-xs bg-gray-50 border-gray-200"><SelectValue placeholder="Pilih Halaman" /></SelectTrigger>
              <SelectContent>{allPages.map((p) => <SelectItem key={p.slug} value={p.slug}>{p.title} <span className="text-[10px] text-gray-400 ml-1">/{p.slug}</span></SelectItem>)}</SelectContent>
            </Select>
            <Tabs value={viewMode} onValueChange={(v: any) => setViewMode(v)}>
              <TabsList className="h-8 bg-gray-100">
                <TabsTrigger value="desktop" className="text-[10px] uppercase font-bold px-3 h-6"><Monitor className="w-3 h-3 mr-1.5" /> Desktop</TabsTrigger>
                <TabsTrigger value="mobile" className="text-[10px] uppercase font-bold px-3 h-6"><Smartphone className="w-3 h-3 mr-1.5" /> Mobile</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" className="h-8 text-xs font-bold bg-blue-600 hover:bg-blue-700 shadow-md" onClick={handleSave} disabled={isSaving}>{isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3 mr-1.5" />} Publish</Button>
            <Separator orientation="vertical" className="h-6 mx-2" />
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-black hover:bg-gray-100" onClick={() => setIsInspectorOpen(!isInspectorOpen)}>{isInspectorOpen ? <PanelRightClose className="w-5 h-5" /> : <PanelRightOpen className="w-5 h-5" />}</Button>
          </div>
        </header>

        <div ref={workspaceRef} className="flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-10 flex flex-col items-center custom-scrollbar">
          <div
            className="pb-32 transition-transform duration-300 ease-out origin-top flex justify-center w-full"
            style={{ transform: `scale(${previewScale})`, width: viewMode === 'desktop' ? '1280px' : '375px' }}
          >
            <div className={cn(
              "bg-white shadow-2xl shrink-0 transition-all origin-top flex flex-col",
              viewMode === 'desktop' ? "w-full min-h-[800px] border border-gray-200" : "w-full h-[812px] rounded-[40px] border-[14px] border-gray-900 overflow-hidden relative"
            )}>
              <IFrameWrapper>
                <PreviewRenderer
                  sections={pageData.sections} activeItem={activeItem}
                  pageTitle={pageData.title}
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

      <aside className={cn("bg-white border-l border-gray-200 shadow-2xl flex flex-col shrink-0 z-30 transition-all duration-300 ease-in-out", isInspectorOpen ? "w-[380px]" : "w-0 overflow-hidden border-l-0 opacity-0")}>
        <header className="h-14 border-b px-5 flex items-center gap-2 bg-gray-50 text-gray-900 shrink-0 w-[380px]">
          <Settings className="w-4 h-4 text-gray-500" />
          <h2 className="text-[11px] font-black uppercase tracking-widest text-gray-600">Inspector Properties</h2>
        </header>

        <div className="flex-1 overflow-y-auto p-6 w-[380px] custom-scrollbar">
          {!activeData ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-10">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4"><Settings className="w-6 h-6 text-gray-300" /></div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pilih elemen di preview.</p>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="pb-4 border-b border-gray-100">
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="secondary" className="text-[9px] uppercase tracking-widest text-gray-500 bg-gray-100">{activeItem?.type}</Badge>
                  {activeItem?.type !== 'page' && (
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-black" onClick={() => moveItem(activeItem!.type as any, activeItem!.id, 'up', activeItem?.sectionId)}><ArrowUp className="w-3 h-3" /></Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-black" onClick={() => moveItem(activeItem!.type as any, activeItem!.id, 'down', activeItem?.sectionId)}><ArrowDown className="w-3 h-3" /></Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-red-600 hover:bg-red-50" onClick={() => deleteItem(activeItem!.type as any, activeItem!.id, activeItem?.sectionId)}><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-bold leading-tight text-gray-900">
                  {activeItem?.type === 'block' ? CMS_COMPONENTS[activeData.type]?.name : (activeItem?.type === 'section' ? "Layout Section" : "Page Settings")}
                </h3>
              </div>

              {/* ========================================== */}
              {/* TAMPILAN INSPECTOR JIKA BLOCK */}
              {/* ========================================== */}
              {activeItem?.type === 'block' && activeItem.sectionId && (
                <div className="space-y-6">

                  {/* MESIN GROUPING ACCORDION */}
                  <Accordion type="multiple" defaultValue={['content', 'layout', 'spacing', 'typography', 'background']} className="w-full">

                    {/* FUNGSI HELPER UNTUK RENDER GRUP */}
                    {[
                      { id: 'content', title: 'Content & Data', icon: AlignLeft },
                      { id: 'layout', title: 'Layout & Position', icon: MoveHorizontal },
                      { id: 'spacing', title: 'Size & Spacing', icon: Box },
                      { id: 'typography', title: 'Typography', icon: Type },
                      { id: 'background', title: 'Background & Border', icon: Palette }
                    ].map((group) => {
                      const groupFields = CMS_COMPONENTS[activeData.type]?.fields.filter(f => f.group === group.id) || [];

                      // Jika grup ini tidak punya field untuk komponen ini, sembunyikan
                      if (groupFields.length === 0) return null;

                      return (
                        <AccordionItem key={group.id} value={group.id} className="border-b border-gray-100">
                          <AccordionTrigger className="hover:no-underline py-3">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-700">
                              <group.icon className="w-4 h-4 text-gray-400" />
                              {group.title}
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pb-4">
                            <div className="grid grid-cols-2 gap-x-3 gap-y-5 pt-2">
                              {groupFields.map(f => {
                                const isFullWidth = ['textarea', 'image', 'object_array', 'variant_picker'].includes(f.type) || f.key === 'text' || f.key === 'url' || f.key === 'label' || f.key === 'gridColumns' || f.key === 'padding';

                                return (
                                  <div key={f.key} className={isFullWidth ? "col-span-2" : "col-span-1"}>
                                    {renderField(f, activeItem.sectionId!, activeData)}
                                  </div>
                                );
                              })}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>

                  {/* GANTI KOMPONEN */}
                  <div className="pt-6 border-t border-dashed mt-8">
                    <Label className="text-[10px] uppercase font-bold text-gray-400 mb-2 block">Ganti Tipe Komponen</Label>
                    <Select value={activeData.type} onValueChange={(val) => {
                      const changeTypeRecursive = (blocks: any[], targetId: string): any[] => {
                        return blocks.map(b => {
                          if (b.id === targetId) return { ...b, type: val, content: {} };
                          if (b.children) return { ...b, children: changeTypeRecursive(b.children, targetId) };
                          return b;
                        });
                      };
                      const newSecs = pageData.sections.map((s: any) => s.id === activeItem.sectionId ? { ...s, blocks: changeTypeRecursive(s.blocks, activeData.id) } : s);
                      setPageData({ ...pageData, sections: newSecs });
                    }}>
                      <SelectTrigger className="h-8 text-xs bg-gray-50"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(CMS_COMPONENTS).map(([key, data]) => (
                          <SelectItem key={key} value={key}>{data.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* ========================================== */}
              {/* TAMPILAN INSPECTOR JIKA SECTION */}
              {/* ========================================== */}
              {activeItem?.type === 'section' && (
                <div className="space-y-5">
                  <div className="space-y-1.5"><Label className="text-[10px] uppercase font-bold text-gray-400">Section Label</Label><Input value={activeData.name} onChange={(e) => updateSection(activeData.id, 'name', e.target.value)} className="h-8 text-xs" /></div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase font-bold text-gray-400">Lebar Maksimal</Label>
                      <Select value={activeData.width || 'max-w-7xl'} onValueChange={(val) => updateSection(activeData.id, 'width', val)}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="max-w-3xl">Max 3XL (Kecil)</SelectItem>
                          <SelectItem value="max-w-5xl">Max 5XL (Sedang)</SelectItem>
                          <SelectItem value="max-w-7xl">Max 7XL (Besar)</SelectItem>
                          <SelectItem value="w-full">Full Width (100%)</SelectItem>
                          <SelectItem value="custom">Custom Size</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase font-bold text-gray-400">Tinggi Minimum</Label>
                      <Select value={activeData.minHeight || 'auto'} onValueChange={(val) => updateSection(activeData.id, 'minHeight', val)}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">Auto (Ikut Isi)</SelectItem>
                          <SelectItem value="min-h-screen">Full Screen (100vh)</SelectItem>
                          <SelectItem value="custom">Custom Size</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Input Custom Size (Hanya Muncul Jika Dipilih) */}
                  {activeData.width === 'custom' && (
                    <div className="space-y-1.5 animate-in fade-in zoom-in-95"><Label className="text-[10px] uppercase font-bold text-gray-400">Custom Width (px/%)</Label><Input value={activeData.customWidth || '1200px'} onChange={(e) => updateSection(activeData.id, 'customWidth', e.target.value)} className="h-8 text-xs font-mono" /></div>
                  )}

                  {activeData.minHeight === 'custom' && (
                    <div className="space-y-1.5 animate-in fade-in zoom-in-95"><Label className="text-[10px] uppercase font-bold text-gray-400">Custom Min-Height (px/vh)</Label><Input value={activeData.customHeight || '600px'} onChange={(e) => updateSection(activeData.id, 'customHeight', e.target.value)} className="h-8 text-xs font-mono" /></div>
                  )}

                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase font-bold text-gray-400">Warna Background</Label>
                    <div className="flex gap-2 items-center">
                      <input type="color" value={activeData.backgroundColor || '#ffffff'} onChange={(e) => updateSection(activeData.id, 'backgroundColor', e.target.value)} className="w-8 h-8 p-0 border-0 rounded cursor-pointer overflow-hidden shadow-sm" />
                      <Input type="text" value={activeData.backgroundColor || 'transparent'} onChange={(e) => updateSection(activeData.id, 'backgroundColor', e.target.value)} className="h-8 text-xs font-mono uppercase flex-1" />
                    </div>
                  </div>

                  <div className="space-y-1.5"><Label className="text-[10px] uppercase font-bold text-gray-400">Padding Vertikal (Internal)</Label><Select value={activeData.paddingY || 'py-20'} onValueChange={(val) => updateSection(activeData.id, 'paddingY', val)}><SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="py-0">Tidak Ada (0px)</SelectItem><SelectItem value="py-12">Kecil</SelectItem><SelectItem value="py-20">Sedang</SelectItem><SelectItem value="py-32">Besar</SelectItem></SelectContent></Select></div>
                </div>
              )}

              {/* ========================================== */}
              {/* TAMPILAN TABS PAGE SETTINGS & SEO ANALYZER */}
              {/* ========================================== */}
              {activeItem?.type === 'page' && (
                <Tabs defaultValue="general" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6 h-9">
                    <TabsTrigger value="general" className="text-[10px] uppercase tracking-widest font-bold">General</TabsTrigger>
                    <TabsTrigger value="seo" className="text-[10px] uppercase tracking-widest font-bold">SEO & Meta</TabsTrigger>
                  </TabsList>

                  <TabsContent value="general" className="space-y-4 animate-in fade-in">
                    <div className="space-y-1">
                      <Label className="text-xs font-bold">Judul Halaman (Internal)</Label>
                      <Input value={activeData.title} onChange={(e) => setPageData({ ...pageData, title: e.target.value })} className="h-8 text-xs" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-bold">URL Slug</Label>
                      <Input value={`/${activeData.slug}`} disabled className="h-8 text-xs bg-gray-50 text-gray-500" />
                      <p className="text-[9px] text-gray-400 mt-1">Slug hanya dapat diubah dari menu "All Pages".</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="seo" className="space-y-6 animate-in fade-in">
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-5">
                      <div className="flex items-center justify-between border-b pb-3">
                        <div className="flex items-center gap-2 text-gray-900">
                          <Activity className="w-4 h-4 text-blue-500" />
                          <h4 className="text-xs font-bold uppercase tracking-widest">SEO Health</h4>
                        </div>
                        <Badge variant="outline" className={cn("text-xs font-black px-2 py-0.5", seoData.score >= 80 ? "text-green-600 border-green-200 bg-green-50" : seoData.score >= 50 ? "text-yellow-600 border-yellow-200 bg-yellow-50" : "text-red-600 border-red-200 bg-red-50")}>
                          {seoData.score} / 100
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        {seoData.items.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-[10px] leading-tight">
                            {item.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />}
                            {item.type === 'warning' && <AlertTriangle className="w-3.5 h-3.5 text-yellow-500 shrink-0 mt-0.5" />}
                            {item.type === 'error' && <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />}
                            <span className={cn(item.type === 'error' ? "text-red-700" : item.type === 'warning' ? "text-yellow-700" : "text-gray-600")}>
                              {item.text}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2 mb-3">
                          <AlignLeft className="w-3 h-3 text-gray-400" />
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Struktur Heading</h4>
                        </div>
                        <div className="bg-white border rounded-lg p-3 space-y-2.5 shadow-sm">
                          {seoData.structure.length === 0 ? (
                            <p className="text-[10px] text-gray-400 italic text-center py-2">Belum ada komponen di halaman ini.</p>
                          ) : (
                            seoData.structure.map((item, idx) => (
                              <div key={idx} className={cn("flex items-center gap-2 text-[10px]", item.tag === 'H1' ? 'ml-0' : 'ml-4')}>
                                <Badge variant="outline" className={cn("text-[8px] px-1 py-0 h-4 font-mono rounded-sm", item.tag === 'H1' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-gray-50 text-gray-500 border-gray-200')}>
                                  {item.tag}
                                </Badge>
                                <span className={cn("truncate", item.tag === 'H1' ? 'font-bold text-gray-900' : 'text-gray-600')}>
                                  {item.text}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Meta Tags</h4>
                        <Button variant="outline" size="sm" className="h-6 px-2 text-[9px] font-bold text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => { const firstTitle = pageData.sections?.[0]?.blocks?.[0]?.content?.title || activeData.title; const firstDesc = pageData.sections?.[0]?.blocks?.[0]?.content?.description || ""; setPageData({ ...pageData, metaTitle: firstTitle, metaDescription: firstDesc.substring(0, 160) }); }}>Auto-Fill</Button>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-1">
                          <Label className="text-xs font-bold">Meta Title</Label>
                          <Input value={activeData.metaTitle || ""} onChange={(e) => setPageData({ ...pageData, metaTitle: e.target.value })} className="h-8 text-xs" placeholder="Judul di pencarian Google..." />
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between items-end">
                            <Label className="text-xs font-bold">Meta Description</Label>
                            <span className={cn("text-[9px] font-mono", (activeData.metaDescription?.length || 0) > 160 ? "text-red-500 font-bold" : "text-gray-400")}>
                              {activeData.metaDescription?.length || 0}/160
                            </span>
                          </div>
                          <Textarea value={activeData.metaDescription || ""} onChange={(e) => setPageData({ ...pageData, metaDescription: e.target.value })} className="text-xs min-h-[80px]" placeholder="Penjelasan singkat halaman ini..." />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-bold">OG Image (Social Share)</Label>
                          <Button variant="outline" className="w-full h-8 text-[10px] border-dashed" onClick={() => { setUploadTarget({ sectionId: 'page', key: 'ogImage' }); fileInputRef.current?.click(); }}>{activeData.ogImage ? "Ganti Gambar Thumbnail" : "Upload Thumbnail Sosmed"}</Button>
                          {activeData.ogImage && (<div className="mt-2 aspect-video relative rounded-md overflow-hidden border"><img src={activeData.ogImage} className="object-cover w-full h-full" alt="og" /></div>)}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* MODALS */}
      <Dialog open={isBlockPickerOpen} onOpenChange={setIsBlockPickerOpen}>
        <DialogContent className="max-w-2xl bg-white shadow-2xl"><DialogHeader><DialogTitle className="text-center text-sm font-bold uppercase tracking-widest text-gray-900">Pilih Komponen</DialogTitle></DialogHeader><div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">{Object.entries(CMS_COMPONENTS).map(([key, blueprint]) => (<button key={key} onClick={() => handleAddBlock(key)} className="group flex flex-col items-center p-4 border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all text-center bg-gray-50 hover:bg-white"><div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors"><Box className="w-5 h-5 text-gray-400 group-hover:text-blue-600" /></div><span className="font-bold text-[10px] uppercase tracking-widest mb-1 text-gray-900">{blueprint.name}</span><span className="text-[9px] text-gray-500 line-clamp-2">{blueprint.description}</span></button>))}</div></DialogContent>
      </Dialog>
      <ProductPickerModal isOpen={!!pickerTarget} onClose={() => setPickerTarget(null)} onSelect={(v) => { if (!pickerTarget) return; if (pickerTarget.parentKey && pickerTarget.index !== undefined) { const newArr = [...(activeData?.content[pickerTarget.parentKey] || [])]; newArr[pickerTarget.index][pickerTarget.key] = v.variantId; if (v.imageUrl) newArr[pickerTarget.index]['primaryImage'] = v.imageUrl; updateBlockContent(pickerTarget.sectionId, pickerTarget.blockId, pickerTarget.parentKey, newArr); } else updateBlockContent(pickerTarget.sectionId, pickerTarget.blockId, pickerTarget.key, v.variantId); }} />
      <ProductImagePickerModal isOpen={!!imagePickerTarget} onClose={() => setImagePickerTarget(null)} onSelect={(url) => { if (!imagePickerTarget) return; if (imagePickerTarget.sectionId === 'page') setPageData({ ...pageData, [imagePickerTarget.key]: url }); else if (imagePickerTarget.parentKey && imagePickerTarget.index !== undefined) { const newArr = [...(activeData?.content[imagePickerTarget.parentKey] || [])]; newArr[imagePickerTarget.index][imagePickerTarget.key] = url; updateBlockContent(imagePickerTarget.sectionId, imagePickerTarget.blockId, imagePickerTarget.parentKey, newArr); } else updateBlockContent(imagePickerTarget.sectionId, imagePickerTarget.blockId, imagePickerTarget.key, url); }} />
    </div>
  );
}