'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Save, Loader2, Plus, GripVertical, Trash2, Link as LinkIcon, FileText, Globe, Settings
} from 'lucide-react';
import Link from 'next/link';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function NavigationPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [availablePages, setAvailablePages] = useState<any[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMenu, setNewMenu] = useState({ label: '', type: 'page', url: '' });

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [resSet, resPages] = await Promise.all([
          fetch('/api/admin/settings'),
          fetch('/api/admin/pages')
        ]);
        const dataSet = await resSet.json();
        const dataPages = await resPages.json();
        setSettings(dataSet.data);
        setAvailablePages(Array.isArray(dataPages) ? dataPages : (dataPages.data || []));
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      alert("Navigasi berhasil diperbarui!");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDragStart = (e: any, index: number) => {
    dragItem.current = index;
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = (e: any) => {
    e.target.style.opacity = '1';
    if (dragItem.current !== null && dragOverItem.current !== null) {
      const newNav = [...(settings.header.navigation)];
      const draggedItemContent = newNav.splice(dragItem.current, 1)[0];
      newNav.splice(dragOverItem.current, 0, draggedItemContent);
      setSettings({ ...settings, header: { ...settings.header, navigation: newNav } });
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const handleAddMenu = () => {
    if (!newMenu.label || !newMenu.url) return;
    const newNav = [...(settings.header.navigation), { ...newMenu, id: Date.now().toString() }];
    setSettings({ ...settings, header: { ...settings.header, navigation: newNav } });
    setIsModalOpen(false);
    setNewMenu({ label: '', type: 'page', url: '' });
  };

  if (isLoading || !settings) return <div className="h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Navigation Builder</h1>
          <p className="text-sm text-gray-500">Atur struktur menu utama dan hubungkan dengan halaman CMS.</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Simpan Navigasi
        </Button>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
            <Globe className="w-3 h-3" /> Main Menu Structure
          </span>
          <Button size="sm" variant="outline" onClick={() => setIsModalOpen(true)} className="h-8 text-xs font-bold">
            <Plus className="w-3 h-3 mr-1" /> Tambah Menu
          </Button>
        </div>

        <div className="p-4 space-y-2">
          {settings.header.navigation.map((item: any, index: number) => (
            <div
              key={item.id || `menu-${index}`}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnter={() => (dragOverItem.current = index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
              className="flex items-center justify-between p-3 bg-white border rounded-lg hover:border-blue-500 transition-all cursor-move group"
            >
              <div className="flex items-center gap-3">
                <GripVertical className="w-4 h-4 text-gray-300 group-hover:text-gray-500" />
                <div>
                  <p className="text-sm font-bold">{item.label}</p>
                  <p className="text-[10px] text-gray-400 font-mono uppercase">{item.type} — {item.url}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {item.type === 'page' && (
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-blue-600 hover:bg-blue-50" asChild>
                    <Link href={`/admin/cms?slug=${item.url.replace('/', '')}`}>
                      <Settings className="w-3 h-3 mr-1" /> <span className="text-[10px] font-bold uppercase">Edit Layout</span>
                    </Link>
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-300 hover:text-red-500" onClick={() => {
                  const newNav = settings.header.navigation.filter((_: any, i: number) => i !== index);
                  setSettings({ ...settings, header: { ...settings.header, navigation: newNav } });
                }}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-white">
          <DialogHeader><DialogTitle className="text-sm font-bold uppercase tracking-widest">Tambah Navigasi</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1"><Label className="text-xs">Label Menu</Label><Input value={newMenu.label} onChange={(e) => setNewMenu({ ...newMenu, label: e.target.value })} placeholder="Contoh: Koleksi Terbaru" /></div>
            <div className="space-y-1">
              <Label className="text-xs">Tipe Link</Label>
              <Select value={newMenu.type} onValueChange={(val) => setNewMenu({ ...newMenu, type: val, url: '' })}>
                <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="page">Halaman CMS</SelectItem><SelectItem value="custom">URL Kustom</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Tujuan</Label>
              {newMenu.type === 'page' ? (
                <Select value={newMenu.url} onValueChange={(val) => setNewMenu({ ...newMenu, url: val })}>
                  <SelectTrigger className="text-xs"><SelectValue placeholder="Pilih Halaman..." /></SelectTrigger>
                  <SelectContent>{availablePages.map((p) => <SelectItem key={p.slug} value={`/${p.slug}`}>{p.title}</SelectItem>)}</SelectContent>
                </Select>
              ) : (
                <Input value={newMenu.url} onChange={(e) => setNewMenu({ ...newMenu, url: e.target.value })} placeholder="/shop atau https://..." />
              )}
            </div>
          </div>
          <DialogFooter><Button onClick={handleAddMenu} className="bg-black text-xs font-bold uppercase tracking-widest">Tambahkan</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}