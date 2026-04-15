'use client';

import React, { useState } from 'react';
import {
  Settings, ArrowUp, ArrowDown, Trash2, Box, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Type, MoveHorizontal, Palette, ImageIcon, UploadCloud, Plus, XCircle, CheckCircle2, AlertTriangle, Activity, Upload,
  Loader2, ChevronDown
} from 'lucide-react';
import { Monitor, Smartphone } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { CMS_COMPONENTS, CMSField } from '@/lib/cms-registry';

interface InspectorSidebarProps {
  isInspectorOpen: boolean;
  activeItem: any;
  activeData: any;
  pageData: any;
  setPageData: (data: any) => void;
  viewMode: 'desktop' | 'mobile';
  seoData: any;
  isUploading: boolean;
  updateSection: (id: string, key: string, value: any) => void;
  updateBlockContent: (sectionId: string, blockId: string, key: string, value: any) => void;
  moveItem: (type: 'section' | 'block', id: string, direction: 'up' | 'down', sectionId?: string) => void;
  deleteItem: (type: 'section' | 'block', id: string, sectionId?: string) => void;
  setImagePickerTarget: (target: any) => void;
  setUploadTarget: (target: any) => void;
  setPickerTarget: (target: any) => void;
  fontInputRef: React.RefObject<HTMLInputElement | null>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  slug: string;
}

export default function InspectorSidebar({
  isInspectorOpen, activeItem, activeData, pageData, setPageData, viewMode, seoData, isUploading,
  updateSection, updateBlockContent, moveItem, deleteItem,
  setImagePickerTarget, setUploadTarget, setPickerTarget, fontInputRef, fileInputRef, slug
}: InspectorSidebarProps) {

  const [openGroups, setOpenGroups] = useState<string[]>(['content', 'layout', 'spacing', 'typography', 'background']);

  const toggleGroup = (groupId: string) => {
    setOpenGroups(prev => prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]);
  };

  const handleDataChange = (key: string, value: any, parentKey?: string, index?: number) => {
    if (activeItem.type === 'section') {
      const newContent = { ...activeData.content, [key]: value };
      updateSection(activeData.id, 'content', newContent);
    } else {
      if (parentKey && index !== undefined) {
        const newArr = [...(activeData.content[parentKey] || [])];
        if (!newArr[index]) newArr[index] = {};
        newArr[index][key] = value;
        updateBlockContent(activeItem.sectionId, activeData.id, parentKey, newArr);
      } else {
        updateBlockContent(activeItem.sectionId, activeData.id, key, value);
      }
    }
  };

  const renderField = (field: CMSField, sectionId: string, blockOrSection: any, parentKey?: string, index?: number) => {
    const dataKey = (field.responsive && viewMode === 'desktop') ? `${field.key}Desktop` : field.key;

    let val = blockOrSection.content?.[dataKey];
    if (parentKey && index !== undefined) val = blockOrSection.content?.[parentKey]?.[index]?.[dataKey];

    if (val === undefined || val === '') {
      val = field.defaultValue ?? '';
    }

    const LabelContent = (
      <Label className="text-[10px] uppercase font-bold text-gray-400 flex justify-between w-full items-center">
        {field.label}
        {field.responsive && (
          <span className={cn("text-[8px] px-1 py-0.5 rounded flex items-center gap-1", viewMode === 'desktop' ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-600")}>
            {viewMode === 'desktop' ? <Monitor className="w-2.5 h-2.5" /> : <Smartphone className="w-2.5 h-2.5" />}
          </span>
        )}
      </Label>
    );

    const getPlaceholder = () => {
      if (field.key.includes('padding')) return '80px 20px';
      if (field.key.includes('margin')) return '0px auto';
      if (field.key.includes('Width') || field.key.includes('Height')) return '100%, 800px, 100vh';
      return '';
    };

    switch (field.type) {
      case 'text': case 'video':
        return <div key={field.key} className="space-y-1.5 w-full min-w-0">{LabelContent}<Input value={val} onChange={(e) => handleDataChange(dataKey, e.target.value, parentKey, index)} placeholder={getPlaceholder()} className="h-8 text-xs w-full min-w-0" /></div>;
      case 'textarea':
        return <div key={field.key} className="space-y-1.5 w-full min-w-0">{LabelContent}<Textarea value={val} onChange={(e) => handleDataChange(dataKey, e.target.value, parentKey, index)} className="text-xs min-h-[100px] w-full min-w-0" /></div>;
      case 'number':
        return <div key={field.key} className="space-y-1.5 w-full min-w-0">{LabelContent}<Input type="number" value={val} onChange={(e) => handleDataChange(dataKey, e.target.value, parentKey, index)} placeholder="0" className="h-8 text-xs font-mono w-full min-w-0" /></div>;
      case 'color':
        return (
          <div key={field.key} className="space-y-1.5 w-full min-w-0">
            {LabelContent}
            <div className="flex gap-2 items-center w-full min-w-0">
              <input type="color" value={val || '#000000'} onChange={(e) => handleDataChange(dataKey, e.target.value, parentKey, index)} className="w-8 h-8 p-0 border-0 rounded cursor-pointer overflow-hidden shadow-sm shrink-0" />
              <Input type="text" value={val || ''} placeholder="#FFFFFF" onChange={(e) => handleDataChange(dataKey, e.target.value, parentKey, index)} className="h-8 text-xs font-mono uppercase flex-1 min-w-0" />
            </div>
          </div>
        );
      case 'select':
        return (
          <div key={field.key} className="space-y-1.5 w-full min-w-0">
            {LabelContent}
            <Select value={val} onValueChange={(v) => handleDataChange(dataKey, v, parentKey, index)}>
              <SelectTrigger className="h-8 text-xs bg-white border-gray-200 w-full min-w-0"><SelectValue placeholder="Pilih..." className="truncate" /></SelectTrigger>
              <SelectContent>{field.options?.map((opt) => <SelectItem key={opt.value} value={opt.value} className="text-xs">{opt.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        );
      case 'font_select':
        const allFonts = [{ label: 'Default Sistem', value: 'inherit' }, { label: 'Inter', value: "'Inter', sans-serif" }, { label: 'Playfair Display', value: "'Playfair Display', serif" }, { label: 'Poppins', value: "'Poppins', sans-serif" }, ...(pageData?.customFonts || []).map((f: any) => ({ label: `✨ ${f.name}`, value: `'${f.name}', sans-serif` }))];
        return (
          <div key={field.key} className="space-y-1.5 w-full min-w-0">
            {LabelContent}
            <Select value={val || 'inherit'} onValueChange={(v) => handleDataChange(dataKey, v, parentKey, index)}>
              <SelectTrigger className="h-8 text-xs bg-white border-gray-200 w-full min-w-0"><SelectValue placeholder="Pilih Font..." className="truncate" /></SelectTrigger>
              <SelectContent>{allFonts.map((opt) => <SelectItem key={opt.value} value={opt.value} className="text-xs">{opt.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        );
      case 'align':
        return (
          <div key={field.key} className="space-y-1.5 w-full min-w-0">
            {LabelContent}
            <div className="flex bg-gray-100/80 p-1 rounded-lg gap-1 border border-gray-200/50 w-full min-w-0 overflow-hidden">
              {field.options?.map((opt) => {
                let Icon = AlignLeft;
                const lbl = opt.label.toLowerCase();
                if (lbl.includes('tengah') || opt.value === 'center') Icon = AlignCenter;
                if (lbl.includes('kanan') || opt.value.includes('right') || opt.value.includes('end')) Icon = AlignRight;
                if (lbl.includes('rata') || opt.value.includes('justify') || opt.value.includes('space')) Icon = AlignJustify;
                const isActive = val === opt.value;
                return (<button key={opt.value} onClick={() => handleDataChange(dataKey, opt.value, parentKey, index)} className={cn("p-1.5 rounded-md flex-1 flex items-center justify-center transition-all", isActive ? "bg-white shadow-sm text-blue-600 font-bold" : "text-gray-400 hover:text-gray-900 hover:bg-gray-200/50")}><Icon className="w-4 h-4" /></button>);
              })}
            </div>
          </div>
        );
      case 'image':
        return (
          <div key={field.key} className="space-y-2 p-3 bg-gray-50 border rounded-md w-full min-w-0">
            {LabelContent}
            {val && <div className="h-20 bg-gray-200 rounded overflow-hidden relative w-full"><img src={val} alt="preview" className="w-full h-full object-cover" /></div>}
            <div className="flex gap-2 w-full min-w-0">
              <Button variant="outline" size="sm" className="flex-1 text-[10px] h-7 min-w-0" onClick={() => setImagePickerTarget({ sectionId: activeItem.sectionId || activeData.id, blockId: blockOrSection.id, key: dataKey, parentKey, index })}><ImageIcon className="w-3 h-3 mr-1 shrink-0" /> <span className="truncate">Katalog</span></Button>
              <Button variant="outline" size="sm" className="flex-1 text-[10px] h-7 min-w-0" onClick={() => { setUploadTarget({ sectionId: activeItem.sectionId || activeData.id, blockId: blockOrSection.id, key: dataKey, parentKey, index }); fileInputRef.current?.click(); }} disabled={isUploading}><UploadCloud className="w-3 h-3 mr-1 shrink-0" /> <span className="truncate">Upload</span></Button>
            </div>
          </div>
        );
      case 'variant_picker':
        return (
          <div key={field.key} className="space-y-1.5 w-full">
            {LabelContent}
            <div className="flex items-center gap-2 w-full">
              <Input value={val || ''} readOnly placeholder="Pilih Produk..." className="h-8 text-xs bg-white flex-1 font-mono text-gray-500 min-w-0" />
              <Button variant="default" size="sm" className="h-8 text-[10px] whitespace-nowrap shrink-0 bg-indigo-600 hover:bg-indigo-700" onClick={() => setPickerTarget({ sectionId: activeItem.sectionId || activeData.id, blockId: blockOrSection.id, key: dataKey, parentKey, index })}>Pilih</Button>
            </div>
          </div>
        );
      case 'object_array':
        const items = Array.isArray(val) ? val : [];
        return (
          <div key={field.key} className="space-y-3 border-t border-gray-200 pt-4 mt-2 w-full min-w-0 col-span-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">{LabelContent}</div>
              <Badge variant="secondary" className="text-[9px] shrink-0">{items.length} Item</Badge>
            </div>
            <div className="flex flex-col gap-4 w-full max-h-[380px] overflow-y-auto pr-2 pb-2 custom-scrollbar">
              {items.map((item: any, i: number) => (
                <div key={i} className="relative p-3 pt-5 bg-gray-50 border border-gray-200 rounded-lg w-full min-w-0">
                  <div className="absolute -top-2.5 -right-2.5 bg-white rounded-full z-10">
                    <Button variant="outline" size="icon" className="h-6 w-6 text-red-500 hover:bg-red-50 rounded-full shadow-sm" onClick={() => { const newArr = [...items]; newArr.splice(i, 1); handleDataChange(dataKey, newArr); }}><XCircle className="w-3.5 h-3.5" /></Button>
                  </div>
                  <Badge className="absolute -top-2 -left-2 text-[8px] px-1.5 py-0 bg-gray-800 z-10">Item {i + 1}</Badge>
                  <div className="grid grid-cols-1 gap-y-4 w-full min-w-0">
                    {field.subFields?.map(subF => (<div key={subF.key} className="w-full min-w-0">{renderField(subF, sectionId, blockOrSection, dataKey, i)}</div>))}
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="w-full h-8 text-[10px] border-dashed text-indigo-600 border-indigo-200 hover:bg-indigo-50" onClick={() => { if (field.limit && items.length >= field.limit) return alert(`Limit ${field.limit}`); handleDataChange(dataKey, [...items, {}]); }}><Plus className="w-3 h-3 mr-1" /> Tambah {field.label}</Button>
          </div>
        );
      default: return null;
    }
  };

  // FITUR BARU: MURNI HANYA UNTUK SECTION (Background Luar, Tinggi, Overflows)
  const SECTION_FIELDS: CMSField[] = [
    { key: 'minHeight', label: 'Tinggi Minimum (auto, 100vh)', type: 'text', group: 'layout', responsive: true, defaultValue: 'auto' },
    { key: 'overflow', label: 'Overflow (Potong isi keluar batas)', type: 'select', group: 'layout', defaultValue: 'hidden', options: [{ label: 'Terlihat (Visible)', value: 'visible' }, { label: 'Terpotong (Hidden)', value: 'hidden' }, { label: 'Auto Scroll', value: 'auto' }] },

    { key: 'padding', label: 'Padding Dalam (CSS)', type: 'text', group: 'spacing', responsive: true, defaultValue: '80px 20px' },

    { key: 'backgroundColor', label: 'Warna Latar', type: 'color', group: 'background', defaultValue: 'transparent' },
    { key: 'backgroundImage', label: 'Gambar Latar (Background Image)', type: 'image', group: 'background' },
    { key: 'backgroundVideo', label: 'Video Latar (URL .mp4)', type: 'text', group: 'background' }, // Mendukung input link mp4 eksternal/internal
  ];

  return (
    <aside className={cn("bg-white border-l border-gray-200 shadow-2xl flex flex-col shrink-0 z-30 transition-all duration-300 ease-in-out", isInspectorOpen ? "w-[380px]" : "w-0 overflow-hidden opacity-0")}>
      <header className="h-14 border-b px-5 flex items-center gap-2 bg-gray-50 text-gray-900 shrink-0">
        <Settings className="w-4 h-4 text-gray-500" />
        <h2 className="text-[11px] font-black uppercase tracking-widest text-gray-600">Inspector Properties</h2>
      </header>

      <div className="flex-1 overflow-y-auto p-6 pb-32 w-[380px] custom-scrollbar">
        {!activeData ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-10"><div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4"><Settings className="w-6 h-6 text-gray-300" /></div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pilih elemen di kanvas.</p></div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 w-full min-w-0">
            <div className="pb-4 border-b border-gray-100">
              <div className="flex items-start justify-between mb-2">
                <Badge variant="secondary" className="text-[9px] uppercase tracking-widest text-gray-500 bg-gray-100">{activeItem?.type}</Badge>
                {activeItem?.type !== 'page' && (
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-black" onClick={() => moveItem(activeItem!.type as any, activeItem!.id, 'up', activeItem?.sectionId)}><ArrowUp className="w-3 h-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-black" onClick={() => moveItem(activeItem!.type as any, activeItem!.id, 'down', activeItem?.sectionId)}><ArrowDown className="w-3 h-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-red-600" onClick={() => deleteItem(activeItem!.type as any, activeItem!.id, activeItem?.sectionId)}><Trash2 className="w-3 h-3" /></Button>
                  </div>
                )}
              </div>
              <h3 className="text-lg font-bold leading-tight text-gray-900">
                {activeItem?.type === 'block' ? (CMS_COMPONENTS[activeData.type]?.name || 'Unknown Block') : (activeItem?.type === 'section' ? "Section Layout" : "Page Settings")}
              </h3>
            </div>

            {(activeItem?.type === 'block' || activeItem?.type === 'section') && (
              <div className="space-y-4 w-full min-w-0">
                {[
                  { id: 'content', title: 'Content & Data', icon: AlignLeft },
                  { id: 'layout', title: 'Layout & Dimensions', icon: MoveHorizontal },
                  { id: 'spacing', title: 'Spacing', icon: Box },
                  { id: 'typography', title: 'Typography', icon: Type },
                  { id: 'background', title: 'Background', icon: Palette }
                ].map((group) => {
                  const fields = activeItem.type === 'block'
                    ? (CMS_COMPONENTS[activeData.type]?.fields.filter(f => f.group === group.id) || [])
                    : (SECTION_FIELDS.filter(f => f.group === group.id) || []);

                  if (fields.length === 0) return null;
                  const isOpen = openGroups.includes(group.id);

                  return (
                    <div key={group.id} className="border-b border-gray-100 w-full min-w-0 pb-1">
                      <button onClick={() => toggleGroup(group.id)} className="flex items-center justify-between w-full py-3 text-left">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-700">
                          <group.icon className="w-4 h-4 text-gray-400" />{group.title}
                        </div>
                        <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform", isOpen ? "rotate-180" : "")} />
                      </button>
                      {isOpen && (
                        <div className="pb-5 pt-2 grid grid-cols-2 gap-x-3 gap-y-5 w-full min-w-0 animate-in slide-in-from-top-1 fade-in duration-200">
                          {fields.map(f => {
                            const isFullWidth = ['textarea', 'image', 'object_array', 'variant_picker'].includes(f.type) || f.key === 'text' || f.key === 'padding' || f.key === 'margin' || f.key.includes('Width') || f.key.includes('Height');
                            return (<div key={f.key} className={cn(isFullWidth ? "col-span-2" : "col-span-1", "w-full min-w-0")}>{renderField(f, activeItem.sectionId || activeData.id, activeData)}</div>);
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}

                {activeItem.type === 'block' && (
                  <div className="pt-6 border-t border-dashed mt-8 w-full min-w-0">
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
                      <SelectTrigger className="h-8 text-xs bg-gray-50 w-full min-w-0"><SelectValue /></SelectTrigger>
                      <SelectContent>{Object.entries(CMS_COMPONENTS).map(([key, data]) => (<SelectItem key={key} value={key}>{data.name}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}

            {activeItem?.type === 'page' && (
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="flex w-full mb-6 h-9"><TabsTrigger value="general" className="flex-1 text-[9px] uppercase font-bold">Gen.</TabsTrigger><TabsTrigger value="seo" className="flex-1 text-[9px] uppercase font-bold">SEO</TabsTrigger><TabsTrigger value="fonts" className="flex-1 text-[9px] uppercase font-bold text-blue-600">Fonts</TabsTrigger></TabsList>
                <TabsContent value="general" className="space-y-4 animate-in fade-in"><div className="space-y-1"><Label className="text-xs font-bold">Judul Halaman (Internal)</Label><Input value={activeData.title} onChange={(e) => setPageData({ ...pageData, title: e.target.value })} className="h-8 text-xs" /></div></TabsContent>
                <TabsContent value="seo" className="space-y-6 animate-in fade-in">
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-4">
                    <div className="flex items-center justify-between border-b pb-2"><div className="flex items-center gap-2 text-gray-900 font-bold text-xs uppercase tracking-widest"><Activity className="w-4 h-4 text-blue-500" /> SEO Health</div><Badge className={cn("text-[10px]", seoData.score >= 80 ? "bg-green-500" : "bg-yellow-500")}>{seoData.score} / 100</Badge></div>
                    <div className="space-y-2">{seoData.items.map((it, idx) => (<div key={idx} className="flex items-start gap-2 text-[10px] leading-tight"><CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" /><span>{it.text}</span></div>))}</div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1"><Label className="text-xs font-bold">Meta Title</Label><Input value={activeData.metaTitle || ""} onChange={(e) => setPageData({ ...pageData, metaTitle: e.target.value })} className="h-8 text-xs" /></div>
                    <div className="space-y-1"><Label className="text-xs font-bold">Meta Description</Label><Textarea value={activeData.metaDescription || ""} onChange={(e) => setPageData({ ...pageData, metaDescription: e.target.value })} className="text-xs min-h-[80px]" /></div>
                  </div>
                </TabsContent>
                <TabsContent value="fonts" className="space-y-6 animate-in fade-in">
                  <div className="bg-gray-50 border border-dashed border-gray-300 p-6 rounded-xl text-center space-y-3">
                    <Type className="w-10 h-10 mx-auto text-blue-500 opacity-20" />
                    <p className="text-xs font-bold">Upload Brand Font (.ttf, .otf, .woff2)</p>
                    <Button size="sm" onClick={() => fontInputRef.current?.click()} disabled={isUploading} className="h-8 text-xs w-full bg-blue-600 hover:bg-blue-700">{isUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3 mr-2" />} Pilih File Font</Button>
                  </div>
                  <div className="space-y-2">
                    {pageData.customFonts?.map((f: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm w-full min-w-0">
                        <div className="min-w-0 flex items-center gap-2">
                          <div className="w-6 h-6 bg-blue-50 rounded text-blue-600 flex items-center justify-center font-serif text-[10px] font-bold shrink-0">Aa</div>
                          <p className="text-[10px] font-bold truncate">{f.name}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 shrink-0" onClick={() => {/* Logika hapus */ }}><Trash2 className="w-3 h-3" /></Button>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}