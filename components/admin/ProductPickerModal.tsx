'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Search, Loader2, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface ProductPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (productSnapshot: any) => void;
}

export function ProductPickerModal({ isOpen, onClose, onSelect }: ProductPickerModalProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [meta, setMeta] = useState({ totalItems: 0, totalPages: 1, currentPage: 1, limit: 5 });
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce Search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setMeta(prev => ({ ...prev, currentPage: 1 }));
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchProducts = useCallback(async () => {
    if (!isOpen) return;
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: meta.currentPage.toString(),
        limit: '5',
        search: debouncedSearch,
        status: 'PUBLISHED'
      });

      const res = await fetch(`/api/admin/products?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();

        const extractedProducts = json.data.map((p: any) => {
          // 1. Urutkan Gambar
          const sortedImages = (p.images || []).sort((a: any, b: any) => a.position - b.position).map((img: any) => img.url);

          // 2. Hitung Stok & Harga Dasar
          const totalStock = p.variants.reduce((acc: number, v: any) => acc + v.stock, 0);
          const basePrice = p.variants[0]?.price || 0;

          // 🚀 3. EKSTRAK WARNA UNIK (MULTI-HEX SUPPORT)
          const colorsMap = new Map();
          (p.variants || []).forEach((v: any) => {
            // Fallback jika v.color kosong dari relasi API
            const colorObj = v.color || { id: v.colorId || 'default', name: 'Default', hexCodes: ['#000000'] };

            console.log(v);

            if (!colorsMap.has(colorObj.id)) {
              let hexes = ['#000000']; // Default Hitam
              
              // 🚀 PERBAIKAN: Baca dari properti "hexCodes" sesuai skema Prisma
              if (Array.isArray(colorObj.hexCodes) && colorObj.hexCodes.length > 0) {
                hexes = colorObj.hexCodes;
              } 
              // (Hapus pengecekan split string koma karena Prisma Anda sudah pakai Array String murni)

              colorsMap.set(colorObj.id, {
                id: colorObj.id,
                name: colorObj.name || 'Unknown',
                hexes: hexes // Kita tetap simpan sebagai "hexes" untuk UI Carousel
              });
            }
          });
          const allColors = Array.from(colorsMap.values());

          return {
            id: p.id,
            productName: p.name,
            price: basePrice,
            stock: totalStock,
            images: sortedImages,
            imageUrl: sortedImages[0] || '',
            allColors: allColors // 🚀 Data ini akan dilempar ke CMS Builder!
          };
        });

        setProducts(extractedProducts);
        setMeta(json.meta);
      }
    } catch (error) {
      console.error("Gagal memuat katalog", error);
    } finally {
      setIsLoading(false);
    }
  }, [isOpen, meta.currentPage, debouncedSearch]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0 overflow-hidden bg-gray-50">
        <DialogHeader className="p-4 md:p-6 bg-white border-b border-gray-100 shrink-0">
          <DialogTitle className="text-xl">Pilih Produk</DialogTitle>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Cari berdasarkan nama produk..." className="pl-9 h-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow>
                  <TableHead className="w-[80px]"></TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-widest text-gray-500">Detail Produk</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-widest text-gray-500">Ketersediaan</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={4} className="h-40 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" /></TableCell></TableRow>
                ) : products.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="h-40 text-center text-gray-500">Produk tidak ditemukan.</TableCell></TableRow>
                ) : (
                  products.map((p) => (
                    <TableRow key={p.id} className="hover:bg-blue-50/50 transition-colors">
                      <TableCell>
                        <div className="w-12 h-16 relative bg-gray-100 rounded-md overflow-hidden border border-gray-200 shadow-sm">
                          {p.imageUrl ? <Image src={p.imageUrl} alt={p.productName} fill className="object-cover" /> : <ImageIcon className="w-4 h-4 absolute inset-0 m-auto text-gray-300" />}
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-bold text-sm text-gray-900 leading-tight">{p.productName}</p>
                        <div className="flex gap-2 items-center mt-1">
                          <span className="text-[10px] text-gray-400 uppercase">{p.images.length} Gambar</span>
                          <span className="text-gray-300">•</span>
                          <span className="text-[10px] text-blue-500 uppercase font-bold">{p.allColors.length} Varian Warna</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-bold font-mono text-xs text-gray-900">Rp {p.price.toLocaleString('id-ID')}</p>
                        <Badge variant="outline" className={`mt-1 text-[9px] px-1.5 py-0 ${p.stock > 0 ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'}`}>
                          {p.stock} Tersedia
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" className="w-full bg-gray-900 hover:bg-blue-600 transition-colors" onClick={() => { onSelect(p); onClose(); }}>
                          Pilih
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-white border-t border-gray-100 flex items-center justify-between shrink-0">
          <p className="text-xs text-gray-500">Hal. <span className="font-bold">{meta.currentPage}</span> dari <span className="font-bold">{meta.totalPages}</span></p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={meta.currentPage === 1} onClick={() => setMeta(p => ({ ...p, currentPage: p.currentPage - 1 }))}><ChevronLeft className="w-4 h-4" /></Button>
            <Button variant="outline" size="sm" disabled={meta.currentPage === meta.totalPages} onClick={() => setMeta(p => ({ ...p, currentPage: p.currentPage + 1 }))}><ChevronRight className="w-4 h-4" /></Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}