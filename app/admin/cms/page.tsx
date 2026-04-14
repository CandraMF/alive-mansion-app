'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Save, Settings, Loader2, Monitor, Smartphone, Globe,
  PanelRightClose, PanelRightOpen, ImageIcon, UploadCloud, ChevronRight, Box
} from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { CMS_COMPONENTS, CMSField } from '@/lib/cms-registry';
import PreviewRenderer from "@/components/cms/PreviewRenderer";
import { ProductPickerModal } from "@/components/admin/ProductPickerModal";
import { ProductImagePickerModal } from "@/components/admin/ProductImagePickerModal";
import { cn } from "@/lib/utils";

export default function CMSBuilderPage() {
  const [slug, setSlug] = useState('home');
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

  // ==========================================
  // FITUR BARU: AUTO-SCALING KANVAS (RESIZE OBSERVER)
  // ==========================================
  const workspaceRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(1);

  useEffect(() => {
    // Fungsi ini akan terus mengukur lebar layar yang tersisa di tengah
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const availableWidth = entry.contentRect.width;

        // Target lebar asli browser: 1280px (Desktop) atau 375px (Mobile)
        const targetWidth = viewMode === 'desktop' ? 1280 : 375;

        // Memberikan spasi kiri-kanan (padding visual)
        const padding = viewMode === 'desktop' ? 80 : 40;

        if (availableWidth === 0) return;

        // Hitung skala: Jika layar sisa 800px, maka skalanya menjadi 0.625 (62.5%)
        const calculatedScale = (availableWidth - padding) / targetWidth;

        // Membatasi zoom maksimal 100% agar tidak pecah/terlalu besar
        setPreviewScale(Math.min(1, calculatedScale));
      }
    });

    if (workspaceRef.current) {
      resizeObserver.observe(workspaceRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [viewMode, isInspectorOpen]); // Trigger ulang ketika Inspector ditutup/buka


  // --- FETCH DATA HALAMAN ---
  useEffect(() => {
    const fetchPage = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/admin/pages/${slug}`);
        const data = await res.json();
        setPageData(data);
        setActiveItem({ type: 'page', id: data?.id });
      } catch (error) {
        console.error("Gagal memuat halaman", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPage();
  }, [slug]);

  // --- FUNGSI SIMPAN KE DATABASE ---
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/pages/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pageData),
      });
      if (res.ok) alert("Perubahan berhasil dipublikasikan secara live!");
    } catch (error) {
      alert("Gagal menyimpan perubahan.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- MANIPULASI DATA KANVAS ---
  const addSection = () => {
    const newSection = { id: `sec-${Date.now()}`, name: `New Section`, layout: 'CONTAINER', paddingY: 'py-20', blocks: [] };
    setPageData({ ...pageData, sections: [...pageData.sections, newSection] });
    setActiveItem({ type: 'section', id: newSection.id });
    setIsInspectorOpen(true);
  };

  const openBlockPicker = (sectionId: string) => {
    setTargetSectionId(sectionId);
    setIsBlockPickerOpen(true);
  };

  const handleAddBlock = (type: string) => {
    if (!targetSectionId) return;
    const newBlock = { id: `blk-${Date.now()}`, type: type, content: {} };
    setPageData((prev: any) => ({
      ...prev,
      sections: prev.sections.map((s: any) => s.id === targetSectionId ? { ...s, blocks: [...s.blocks, newBlock] } : s)
    }));
    setIsBlockPickerOpen(false);
    setTargetSectionId(null);
    setActiveItem({ type: 'block', id: newBlock.id, sectionId: targetSectionId });
    setIsInspectorOpen(true);
  };

  const updateBlockContent = (sectionId: string, blockId: string, key: string, value: any) => {
    setPageData((prev: any) => ({
      ...prev,
      sections: prev.sections.map((sec: any) => sec.id === sectionId ? {
        ...sec, blocks: sec.blocks.map((blk: any) => blk.id === blockId ? { ...blk, content: { ...blk.content, [key]: value } } : blk)
      } : sec)
    }));
  };

  const triggerUpload = (sectionId: string, blockId: string, key: string, parentKey?: string, index?: number) => {
    setUploadTarget({ sectionId, blockId, key, parentKey, index });
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadTarget) return;
    setIsUploading(true);
    try {
      const res = await fetch(`/api/admin/upload?filename=${file.name}`, { method: 'POST', body: file });
      const blob = await res.json();

      if (uploadTarget.parentKey && uploadTarget.index !== undefined) {
        const sec = pageData.sections.find((s: any) => s.id === uploadTarget.sectionId);
        const blk = sec.blocks.find((b: any) => b.id === uploadTarget.blockId);
        const newArr = [...(blk.content[uploadTarget.parentKey] || [])];
        newArr[uploadTarget.index][uploadTarget.key] = blob.url;
        updateBlockContent(uploadTarget.sectionId, uploadTarget.blockId, uploadTarget.parentKey, newArr);
      } else {
        updateBlockContent(uploadTarget.sectionId, uploadTarget.blockId, uploadTarget.key, blob.url);
      }
    } finally {
      setIsUploading(false);
      setUploadTarget(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // --- RENDERER FORM INSPECTOR ---
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
      case 'text':
      case 'video': return <div key={field.key} className="space-y-1"><Label className="text-[10px] uppercase font-bold text-gray-400">{field.label}</Label><Input value={val} onChange={(e) => onChange(e.target.value)} className="h-8 text-xs" /></div>;
      case 'textarea': return <div key={field.key} className="space-y-1"><Label className="text-[10px] uppercase font-bold text-gray-400">{field.label}</Label><Textarea value={val} onChange={(e) => onChange(e.target.value)} className="text-xs min-h-[100px]" /></div>;
      case 'image': return (
        <div key={field.key} className="space-y-2 p-3 bg-gray-50 border rounded-md">
          <Label className="text-[10px] uppercase font-bold text-gray-400">{field.label}</Label>
          {val && <div className="h-20 bg-gray-200 rounded overflow-hidden relative"><img src={val} alt="preview" className="w-full h-full object-cover" /></div>}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 text-[10px] h-7" onClick={() => setImagePickerTarget({ sectionId, blockId: block.id, key: field.key, parentKey, index })}><ImageIcon className="w-3 h-3 mr-1" /> Katalog</Button>
            <Button variant="outline" size="sm" className="flex-1 text-[10px] h-7" onClick={() => triggerUpload(sectionId, block.id, field.key, parentKey, index)} disabled={isUploading}><UploadCloud className="w-3 h-3 mr-1" /> Upload</Button>
          </div>
        </div>
      );
      case 'variant_picker': return (
        <div key={field.key} className="space-y-1">
          <Label className="text-[10px] uppercase font-bold text-gray-400">{field.label}</Label>
          <Button variant="outline" className="w-full h-8 text-xs justify-between" onClick={() => setPickerTarget({ sectionId, blockId: block.id, key: field.key, parentKey, index })}>
            {val ? <span className="truncate">Terpilih: {val}</span> : "Cari Produk..."}
            <ChevronRight className="w-3 h-3 text-gray-400" />
          </Button>
        </div>
      );
      case 'object_array':
        const items = block.content[field.key] || [];
        return (
          <div key={field.key} className="space-y-4 pt-4 border-t mt-4">
            <div className="flex items-center justify-between"><Label className="font-bold text-xs">{field.label}</Label><Button variant="ghost" size="sm" className="h-6 text-[10px] text-blue-600" disabled={items.length >= (field.limit || 10)} onClick={() => onChange([...items, {}])}>+ Add Item</Button></div>
            {items.map((_: any, idx: number) => (
              <div key={idx} className="p-3 border rounded-lg space-y-3 relative bg-white shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <Badge variant="secondary" className="text-[9px]">Item {idx + 1}</Badge>
                  <button onClick={() => onChange(items.filter((__: any, i: number) => i !== idx))} className="text-red-500 hover:underline text-[10px]">Hapus</button>
                </div>
                {field.subFields?.map(sub => renderField(sub, sectionId, block, field.key, idx))}
              </div>
            ))}
          </div>
        );
      default: return null;
    }
  };

  if (isLoading || !pageData) return <div className="h-screen flex flex-col items-center justify-center bg-white"><Loader2 className="w-8 h-8 animate-spin text-gray-400 mb-4" /><p className="text-xs uppercase tracking-widest text-gray-400 font-bold">Memuat Kanvas...</p></div>;

  let activeData: any = null;
  if (activeItem?.type === 'page') activeData = pageData;
  if (activeItem?.type === 'section') activeData = pageData.sections.find((s: any) => s.id === activeItem.id);
  if (activeItem?.type === 'block' && activeItem.sectionId) {
    const sec = pageData.sections.find((s: any) => s.id === activeItem.sectionId);
    activeData = sec?.blocks.find((b: any) => b.id === activeItem.id);
  }

  return (
    <div className="flex h-screen bg-[#E5E5E5] overflow-hidden font-sans">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />

      {/* ========================================== */}
      {/* KIRI: KANVAS VISUAL (LIVE PREVIEW) */}
      {/* ========================================== */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-14 bg-white border-b px-6 flex items-center justify-between shrink-0 z-20 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 rounded-md text-white font-bold text-xs shadow-sm"><Globe className="w-3.5 h-3.5" /> ALIVE BUILDER</div>
            <Tabs value={viewMode} onValueChange={(v: any) => setViewMode(v)}>
              <TabsList className="h-8 bg-gray-100">
                <TabsTrigger value="desktop" className="text-[10px] uppercase font-bold px-3 h-6"><Monitor className="w-3 h-3 mr-1.5" /> Desktop</TabsTrigger>
                <TabsTrigger value="mobile" className="text-[10px] uppercase font-bold px-3 h-6"><Smartphone className="w-3 h-3 mr-1.5" /> Mobile</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" className="h-8 text-xs font-bold bg-blue-600 hover:bg-blue-700 shadow-md" onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3 mr-1.5" />} Publish
            </Button>
            <Separator orientation="vertical" className="h-6 mx-2" />
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-black hover:bg-gray-100" onClick={() => setIsInspectorOpen(!isInspectorOpen)}>
              {isInspectorOpen ? <PanelRightClose className="w-5 h-5" /> : <PanelRightOpen className="w-5 h-5" />}
            </Button>
          </div>
        </header>

        {/* CONTAINER UTAMA YANG DIPANTAU OLEH RESIZEOBSERVER */}
        <div
          ref={workspaceRef}
          className="flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-10 flex flex-col items-center custom-scrollbar"
        >
          {/* PEMBUNGKUS SCALE DINAMIS */}
          <div
            className="pb-32 transition-transform duration-300 ease-out origin-top flex justify-center w-full"
            style={{
              transform: `scale(${previewScale})`,
              // Mengubah width fisik wadah ini agar sesuai dengan simulasi
              width: viewMode === 'desktop' ? '1280px' : '375px',
            }}
          >
            <div className={cn(
              "bg-white shadow-2xl shrink-0 transition-all w-full",
              viewMode === 'desktop'
                ? "min-h-[800px] border border-gray-200"
                : "rounded-[40px] border-[12px] border-gray-900 min-h-[700px] overflow-hidden"
            )}>
              <PreviewRenderer
                sections={pageData.sections}
                activeItem={activeItem}
                onSelectBlock={(sId, bId) => { setActiveItem({ type: 'block', id: bId, sectionId: sId }); setIsInspectorOpen(true); }}
                onSelectSection={(sId) => { setActiveItem({ type: 'section', id: sId }); setIsInspectorOpen(true); }}
                onUpdateBlockContent={updateBlockContent}
                onAddSection={addSection}
                onAddBlock={openBlockPicker}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* KANAN: INSPECTOR PROPERTIES */}
      {/* ========================================== */}
      <aside className={cn(
        "bg-white border-l border-gray-200 shadow-2xl flex flex-col shrink-0 z-30 transition-all duration-300 ease-in-out",
        isInspectorOpen ? "w-[380px]" : "w-0 overflow-hidden border-l-0 opacity-0"
      )}>
        <header className="h-14 border-b px-5 flex items-center gap-2 bg-gray-50 text-gray-900 shrink-0 w-[380px]">
          <Settings className="w-4 h-4 text-gray-500" />
          <h2 className="text-[11px] font-black uppercase tracking-widest text-gray-600">Inspector Properties</h2>
        </header>

        <div className="flex-1 overflow-y-auto p-6 w-[380px] custom-scrollbar">
          {!activeData ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-10">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4"><Settings className="w-6 h-6 text-gray-300" /></div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pilih elemen di preview untuk melihat propertinya.</p>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="pb-4 border-b border-gray-100">
                <Badge variant="secondary" className="text-[9px] uppercase mb-2 tracking-widest text-gray-500 bg-gray-100">{activeItem?.type}</Badge>
                <h3 className="text-lg font-bold leading-tight text-gray-900">
                  {activeItem?.type === 'block' ? CMS_COMPONENTS[activeData.type]?.name : (activeItem?.type === 'section' ? "Layout Section" : "Page Settings")}
                </h3>
                {activeItem?.type === 'block' && <p className="text-[10px] text-gray-500 mt-1 line-clamp-2">{CMS_COMPONENTS[activeData.type]?.description}</p>}
              </div>

              {activeItem?.type === 'block' && activeItem.sectionId && (
                <div className="space-y-6">
                  {CMS_COMPONENTS[activeData.type]?.fields.map(f => renderField(f, activeItem.sectionId!, activeData))}
                  <div className="pt-6 border-t border-dashed mt-8">
                    <Label className="text-[10px] uppercase font-bold text-gray-400 mb-2 block">Ganti Tipe Komponen</Label>
                    <Select value={activeData.type} onValueChange={(val) => {
                      const newSecs = pageData.sections.map((s: any) => s.id === activeItem.sectionId ? { ...s, blocks: s.blocks.map((b: any) => b.id === activeData.id ? { ...b, type: val, content: {} } : b) } : s);
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

              {activeItem?.type === 'section' && (
                <div className="space-y-4">
                  <div className="space-y-1"><Label className="text-[10px] uppercase font-bold text-gray-400">Section Label</Label><Input value={activeData.name} onChange={(e) => { const newSecs = pageData.sections.map((s: any) => s.id === activeData.id ? { ...s, name: e.target.value } : s); setPageData({ ...pageData, sections: newSecs }); }} className="h-8 text-xs" /></div>
                  <div className="space-y-1"><Label className="text-[10px] uppercase font-bold text-gray-400">Layout Width</Label><Select value={activeData.layout} onValueChange={(val) => { const newSecs = pageData.sections.map((s: any) => s.id === activeData.id ? { ...s, layout: val } : s); setPageData({ ...pageData, sections: newSecs }); }}><SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="CONTAINER">Container (Max-Width)</SelectItem><SelectItem value="FULL_WIDTH">Full Width (Edge-to-edge)</SelectItem></SelectContent></Select></div>
                  <div className="space-y-1"><Label className="text-[10px] uppercase font-bold text-gray-400">Vertical Spacing (Padding Y)</Label><Select value={activeData.paddingY} onValueChange={(val) => { const newSecs = pageData.sections.map((s: any) => s.id === activeData.id ? { ...s, paddingY: val } : s); setPageData({ ...pageData, sections: newSecs }); }}><SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="py-0">No Padding (py-0)</SelectItem><SelectItem value="py-12">Small (py-12)</SelectItem><SelectItem value="py-20">Medium (py-20)</SelectItem><SelectItem value="py-32">Large (py-32)</SelectItem></SelectContent></Select></div>
                </div>
              )}

              {activeItem?.type === 'page' && (
                <div className="space-y-4">
                  <div className="space-y-1"><Label className="text-[10px] uppercase font-bold text-gray-400">Page Title</Label><Input value={activeData.title} onChange={(e) => setPageData({ ...pageData, title: e.target.value })} className="h-8 text-xs" /></div>
                  <div className="space-y-1"><Label className="text-[10px] uppercase font-bold text-gray-400">URL Slug</Label><Input value={activeData.slug} disabled className="bg-gray-50 text-gray-400 h-8 text-xs" /></div>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* ========================================== */}
      {/* MODAL PICKERS */}
      {/* ========================================== */}
      <Dialog open={isBlockPickerOpen} onOpenChange={setIsBlockPickerOpen}>
        <DialogContent className="max-w-2xl bg-white shadow-2xl">
          <DialogHeader><DialogTitle className="text-center text-sm font-bold uppercase tracking-widest text-gray-900">Pilih Komponen</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
            {Object.entries(CMS_COMPONENTS).map(([key, blueprint]) => (
              <button key={key} onClick={() => handleAddBlock(key)} className="group flex flex-col items-center p-4 border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all text-center bg-gray-50 hover:bg-white">
                <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors"><Box className="w-5 h-5 text-gray-400 group-hover:text-blue-600" /></div>
                <span className="font-bold text-[10px] uppercase tracking-widest mb-1 text-gray-900">{blueprint.name}</span>
                <span className="text-[9px] text-gray-500 line-clamp-2">{blueprint.description}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <ProductPickerModal isOpen={!!pickerTarget} onClose={() => setPickerTarget(null)} onSelect={(v) => { if (!pickerTarget) return; if (pickerTarget.parentKey && pickerTarget.index !== undefined) { const newArr = [...(activeData?.content[pickerTarget.parentKey] || [])]; newArr[pickerTarget.index][pickerTarget.key] = v.variantId; if (v.imageUrl) newArr[pickerTarget.index]['primaryImage'] = v.imageUrl; updateBlockContent(pickerTarget.sectionId, pickerTarget.blockId, pickerTarget.parentKey, newArr); } else { updateBlockContent(pickerTarget.sectionId, pickerTarget.blockId, pickerTarget.key, v.variantId); } }} />
      {/* 3. Modal Pilih Gambar dari Katalog */}
      <ProductImagePickerModal
        isOpen={!!imagePickerTarget}
        onClose={() => setImagePickerTarget(null)}
        onSelect={(url) => {
          if (!imagePickerTarget) return;
          if (imagePickerTarget.parentKey && imagePickerTarget.index !== undefined) {
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