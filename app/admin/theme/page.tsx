// app/admin/theme/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, LayoutTemplate, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export default function ThemeSettingsPage() {
  const [settings, setSettings] = useState<any>({ navbar: { links: [] }, footer: {} });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 🚀 State untuk fitur Drag & Drop
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // 1. Ambil data saat halaman dimuat
  useEffect(() => {
    fetch('/api/theme')
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        setIsLoading(false);
      });
  }, []);

  // 2. Fungsi simpan ke database
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch('/api/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      alert('Theme Settings saved successfully!');
    } catch (error) {
      alert('Failed to save settings.');
    }
    setIsSaving(false);
  };

  // 3. Logika Manajemen Link Navbar
  const addNavLink = () => {
    const newLinks = [...(settings.navbar?.links || []), { label: 'NEW LINK', url: '#' }];
    setSettings({ ...settings, navbar: { ...settings.navbar, links: newLinks } });
  };

  const updateNavLink = (index: number, key: string, value: string) => {
    const newLinks = [...(settings.navbar?.links || [])];
    newLinks[index][key] = value;
    setSettings({ ...settings, navbar: { ...settings.navbar, links: newLinks } });
  };

  const removeNavLink = (index: number) => {
    const newLinks = [...(settings.navbar?.links || [])];
    newLinks.splice(index, 1);
    setSettings({ ...settings, navbar: { ...settings.navbar, links: newLinks } });
  };

  // 🚀 4. Logika NATIVE DRAG & DROP HTML5
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    // Efek visual saat di-drag
    e.dataTransfer.effectAllowed = 'move';
    // Trick agar elemen yang ditarik sedikit transparan
    setTimeout(() => { (e.target as HTMLElement).style.opacity = '0.5'; }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedIndex(null);
    (e.target as HTMLElement).style.opacity = '1';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault(); // Wajib agar onDrop bisa berjalan
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const newLinks = [...(settings.navbar?.links || [])];
    const draggedItem = newLinks[draggedIndex];

    // Hapus dari posisi lama
    newLinks.splice(draggedIndex, 1);
    // Masukkan ke posisi baru
    newLinks.splice(targetIndex, 0, draggedItem);

    setSettings({ ...settings, navbar: { ...settings.navbar, links: newLinks } });
    setDraggedIndex(null);
  };


  if (isLoading) return <div className="p-10 text-center flex flex-col items-center justify-center min-h-screen text-gray-500 animate-pulse"><LayoutTemplate className="w-10 h-10 mb-4 opacity-50" /> Memuat Pengaturan Tema...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 pb-32">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <LayoutTemplate className="w-6 h-6 text-blue-600" />
            Global Theme Settings
          </h1>
          <p className="text-gray-500 text-sm mt-1">Kelola logo, menu navigasi, dan elemen footer website Anda.</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 shadow-md">
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Menyimpan...' : 'Simpan Tema'}
        </Button>
      </div>

      <Tabs defaultValue="navbar" className="w-full">
        <TabsList className="mb-6 bg-gray-100 p-1 rounded-lg inline-flex">
          <TabsTrigger value="navbar" className="px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-widest">Navbar (Header)</TabsTrigger>
          <TabsTrigger value="footer" className="px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-widest">Footer</TabsTrigger>
        </TabsList>

        {/* TAB NAVBAR */}
        <TabsContent value="navbar" className="space-y-8 bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">

          {/* Logo Setting */}
          <div className="space-y-6">
            <div className="border-b border-gray-100 pb-2">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-800">1. Pengaturan Logo</h3>
              <p className="text-xs text-gray-500 mt-1">Tentukan logo utama dan logo saat menu mobile / scroll aktif.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <Label className="font-bold text-xs">Logo Utama (Desktop/Atas)</Label>
                <Input
                  value={settings.navbar?.logoUrl || ''}
                  onChange={e => setSettings({ ...settings, navbar: { ...settings.navbar, logoUrl: e.target.value } })}
                  placeholder="/logo-black.png"
                  className="bg-white"
                />
                {settings.navbar?.logoUrl && (
                  <div className="mt-3 h-16 bg-gray-200 rounded flex items-center justify-center p-2"><img src={settings.navbar.logoUrl} className="max-h-full object-contain" alt="Logo preview" /></div>
                )}
              </div>
              <div className="space-y-2 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <Label className="font-bold text-xs">Logo Ikon (Mobile/Scroll)</Label>
                <Input
                  value={settings.navbar?.logoIconUrl || ''}
                  onChange={e => setSettings({ ...settings, navbar: { ...settings.navbar, logoIconUrl: e.target.value } })}
                  placeholder="/logo-icon-black.webp"
                  className="bg-white"
                />
                {settings.navbar?.logoIconUrl && (
                  <div className="mt-3 h-16 bg-gray-200 rounded flex items-center justify-center p-2"><img src={settings.navbar.logoIconUrl} className="max-h-full object-contain" alt="Logo preview" /></div>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Links Setting (DENGAN DRAG & DROP) */}
          <div className="space-y-4 pt-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-800">2. Menu Navigasi Utama</h3>
                <p className="text-xs text-gray-500 mt-1">Tahan ikon 6-titik (grip) dan geser untuk mengatur urutan menu.</p>
              </div>
              <Button size="sm" onClick={addNavLink} className="h-8 text-xs bg-black hover:bg-gray-800 text-white">
                <Plus className="w-3 h-3 mr-1" /> Tambah Menu
              </Button>
            </div>

            <div className="space-y-3">
              {(settings.navbar?.links || []).map((link: any, idx: number) => (
                <div
                  key={idx}
                  draggable // 🚀 Aktifkan fitur drag HTML5
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDrop={(e) => handleDrop(e, idx)}
                  className={cn(
                    "flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-sm transition-all group",
                    draggedIndex === idx ? "border-blue-400 shadow-md ring-2 ring-blue-100" : "hover:border-gray-300"
                  )}
                >
                  {/* Grip Handle untuk Drag */}
                  <div className="cursor-grab active:cursor-grabbing p-2 text-gray-300 hover:text-gray-600 transition-colors">
                    <GripVertical className="w-5 h-5" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 flex-1">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase font-bold text-gray-500">Teks Label</Label>
                      <Input value={link.label} onChange={e => updateNavLink(idx, 'label', e.target.value)} className="h-9 text-xs font-bold" placeholder="Contoh: ABOUT US" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase font-bold text-gray-500">URL Tujuan</Label>
                      <Input value={link.url} onChange={e => updateNavLink(idx, 'url', e.target.value)} className="h-9 text-xs font-mono" placeholder="Contoh: /about" />
                    </div>
                  </div>

                  <Button variant="ghost" size="icon" onClick={() => removeNavLink(idx)} className="text-gray-400 hover:text-red-600 hover:bg-red-50 shrink-0 mt-5 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}

              {(settings.navbar?.links || []).length === 0 && (
                <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                  <p className="text-sm text-gray-400 italic">Belum ada menu navigasi. Klik tombol "Tambah Menu" di atas.</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* TAB FOOTER */}
        <TabsContent value="footer" className="space-y-8 bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
          <div className="space-y-4">
            <div className="border-b border-gray-100 pb-2">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-800">Teks Hak Cipta (Copyright)</h3>
            </div>
            <div className="space-y-2 max-w-md">
              <Label>Teks Footer Bawah</Label>
              <Input
                value={settings.footer?.copyright || ''}
                onChange={e => setSettings({ ...settings, footer: { ...settings.footer, copyright: e.target.value } })}
                placeholder="Copyright © 2026 ALIVE MANSION"
              />
              <p className="text-[10px] text-gray-400">Teks ini juga akan muncul di bagian bawah menu mobile (Drawer).</p>
            </div>
          </div>

          <div className="space-y-4 pt-6">
            <div className="border-b border-gray-100 pb-2 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-800">Kolom Tautan Footer</h3>
                <p className="text-[10px] text-gray-500 mt-1">Atur tautan untuk "Client Care" dan "Legal Information".</p>
              </div>
              <Button size="sm" onClick={() => {
                const newCols = [...(settings.footer?.columns || []), { title: 'Kolom Baru', links: [] }];
                setSettings({ ...settings, footer: { ...settings.footer, columns: newCols } });
              }} className="h-8 text-xs bg-black hover:bg-gray-800 text-white">
                <Plus className="w-3 h-3 mr-1" /> Tambah Kolom
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(settings.footer?.columns || []).map((col: any, colIdx: number) => (
                <div key={colIdx} className="p-4 bg-gray-50 border border-gray-200 rounded-xl relative group">
                  <button onClick={() => {
                    const newCols = [...settings.footer.columns];
                    newCols.splice(colIdx, 1);
                    setSettings({ ...settings, footer: { ...settings.footer, columns: newCols } });
                  }} className="absolute top-3 right-3 text-gray-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="space-y-2 mb-4 pr-8">
                    <Label className="text-xs font-bold">Judul Kolom</Label>
                    <Input
                      value={col.title}
                      onChange={e => {
                        const newCols = [...settings.footer.columns];
                        newCols[colIdx].title = e.target.value;
                        setSettings({ ...settings, footer: { ...settings.footer, columns: newCols } });
                      }}
                      className="h-8 text-xs font-bold"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold text-gray-500">Daftar Tautan</Label>
                    {(col.links || []).map((link: any, linkIdx: number) => (
                      <div key={linkIdx} className="flex items-center gap-2 mb-2">
                        <Input
                          placeholder="Label (Contoh: FAQ)"
                          value={link.label}
                          onChange={e => {
                            const newCols = [...settings.footer.columns];
                            newCols[colIdx].links[linkIdx].label = e.target.value;
                            setSettings({ ...settings, footer: { ...settings.footer, columns: newCols } });
                          }}
                          className="h-7 text-xs flex-1"
                        />
                        <Input
                          placeholder="URL (Contoh: /faq)"
                          value={link.url}
                          onChange={e => {
                            const newCols = [...settings.footer.columns];
                            newCols[colIdx].links[linkIdx].url = e.target.value;
                            setSettings({ ...settings, footer: { ...settings.footer, columns: newCols } });
                          }}
                          className="h-7 text-xs flex-1 font-mono"
                        />
                        <button onClick={() => {
                          const newCols = [...settings.footer.columns];
                          newCols[colIdx].links.splice(linkIdx, 1);
                          setSettings({ ...settings, footer: { ...settings.footer, columns: newCols } });
                        }} className="text-gray-400 hover:text-red-500">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={() => {
                      const newCols = [...settings.footer.columns];
                      if (!newCols[colIdx].links) newCols[colIdx].links = [];
                      newCols[colIdx].links.push({ label: '', url: '' });
                      setSettings({ ...settings, footer: { ...settings.footer, columns: newCols } });
                    }} className="w-full h-7 text-[10px] border-dashed">
                      + Tambah Link
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}