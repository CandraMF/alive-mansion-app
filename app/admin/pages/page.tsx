'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus, Loader2, FileText, Settings, Search, MoreHorizontal, Globe
} from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export default function PagesDashboard() {
  const [pages, setPages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // State Modal Create Page
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newPage, setNewPage] = useState({ title: '', slug: '' });

  // Fetch Data
  const fetchPages = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/pages');
      if (res.ok) {
        const data = await res.json();
        setPages(Array.isArray(data) ? data : (data.data || []));
      }
    } catch (error) {
      console.error("Gagal memuat halaman", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchPages(); }, []);

  // Auto-generate slug dari title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setNewPage({ title, slug });
  };

  const handleCreatePage = async () => {
    if (!newPage.title || !newPage.slug) return;
    setIsCreating(true);
    try {
      const res = await fetch('/api/admin/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPage),
      });

      const result = await res.json();
      if (res.ok) {
        setIsModalOpen(false);
        setNewPage({ title: '', slug: '' });
        fetchPages(); // Refresh tabel
      } else {
        alert(result.error || "Gagal membuat halaman");
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem.");
    } finally {
      setIsCreating(false);
    }
  };

  // Filter pencarian
  const filteredPages = pages.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto py-10 px-6">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-serif italic text-gray-900">Pages</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola semua halaman statis dan landing page website Anda.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-black hover:bg-gray-800">
          <Plus className="w-4 h-4 mr-2" /> Tambah Halaman
        </Button>
      </div>

      {/* TOOLBAR */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Cari halaman..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs bg-white"
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                <TableHead className="text-xs font-bold uppercase tracking-widest text-gray-500">Judul Halaman</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-widest text-gray-500">Status</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-widest text-gray-500">Terakhir Diubah</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={4} className="h-32 text-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto" /></TableCell></TableRow>
              ) : filteredPages.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="h-32 text-center text-gray-500 text-sm">Tidak ada halaman ditemukan.</TableCell></TableRow>
              ) : (
                filteredPages.map((page) => (
                  <TableRow key={page.id} className="group hover:bg-gray-50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center text-gray-400 group-hover:text-blue-500 group-hover:bg-blue-50 transition-colors">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-gray-900">{page.title}</p>
                          <p className="text-[10px] font-mono text-gray-500 mt-0.5">/{page.slug}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {page.slug === 'home' ? (
                        <Badge variant="secondary" className="bg-blue-50 text-blue-600 hover:bg-blue-50 text-[10px] tracking-widest uppercase font-bold"><Globe className="w-3 h-3 mr-1" /> Frontpage</Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-500 text-[10px] tracking-widest uppercase font-bold">Published</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">
                      {new Date(page.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-8 text-blue-600 hover:bg-blue-50 hover:text-blue-700" asChild>
                        <Link href={`/admin/cms?slug=${page.slug}`}>
                          <Settings className="w-3.5 h-3.5 mr-1.5" /> <span className="text-[10px] font-bold uppercase tracking-widest">Builder</span>
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* MODAL CREATE PAGE */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-white sm:max-w-[425px]">
          <DialogHeader><DialogTitle className="text-sm font-bold uppercase tracking-widest">Buat Halaman Baru</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Judul Halaman</Label>
              <Input
                placeholder="Contoh: About Us"
                value={newPage.title}
                onChange={handleTitleChange}
                className="h-9"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest">URL Slug</Label>
              <div className="flex items-center">
                <span className="bg-gray-50 border border-r-0 border-gray-200 text-gray-500 px-3 h-9 flex items-center text-xs rounded-l-md font-mono">
                  /
                </span>
                <Input
                  value={newPage.slug}
                  onChange={(e) => setNewPage({ ...newPage, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                  className="h-9 rounded-l-none font-mono text-xs focus-visible:ring-0 focus-visible:border-gray-300"
                  placeholder="about-us"
                />
              </div>
              <p className="text-[10px] text-gray-400">Ini akan menjadi alamat URL halaman Anda.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button onClick={handleCreatePage} disabled={isCreating} className="bg-black">
              {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Buat Halaman"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}