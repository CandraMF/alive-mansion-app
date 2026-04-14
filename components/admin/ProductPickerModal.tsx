'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Search, Loader2, Image as ImageIcon, ChevronLeft, ChevronRight, Check } from 'lucide-react';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface ProductPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (variant: { variantId: string; sku: string; productName: string; imageUrl: string }) => void;
}

export function ProductPickerModal({ isOpen, onClose, onSelect }: ProductPickerModalProps) {
  const [variants, setVariants] = useState<any[]>([]);
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

  // Fetch Data Produk & Ekstrak menjadi list Varian
  const fetchProducts = useCallback(async () => {
    if (!isOpen) return;
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: meta.currentPage.toString(),
        limit: '5', // Tampilkan 5 produk per halaman agar modal tidak terlalu panjang
        search: debouncedSearch,
        status: 'PUBLISHED' // Hanya tampilkan produk yang sudah rilis
      });

      const res = await fetch(`/api/admin/products?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();

        // Ekstrak (Flatten) data: 1 Produk dengan 2 Warna akan menjadi 2 Baris di Modal
        const extractedVariants: any[] = [];
        json.data.forEach((p: any) => {
          p.variants.forEach((v: any) => {
            // Coba cari gambar spesifik untuk warna ini, jika tidak ada, gunakan gambar utama produk
            const specificImage = p.images?.find((img: any) => img.colorId === v.colorId);
            const fallbackImage = p.images?.[0];

            extractedVariants.push({
              variantId: v.id,
              productName: p.name,
              sku: v.sku,
              price: v.price,
              stock: v.stock,
              colorName: p.category?.name, // Jika Anda punya data color.name, masukkan di sini
              imageUrl: specificImage?.url || fallbackImage?.url || ''
            });
          });
        });

        setVariants(extractedVariants);
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
          <DialogTitle className="text-xl">Pilih Varian Produk</DialogTitle>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Cari berdasarkan nama produk..."
              className="pl-9 h-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow>
                  <TableHead className="w-[80px]"></TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-widest text-gray-500">Detail Produk</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-widest text-gray-500">Stok & Harga</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={4} className="h-40 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" /></TableCell></TableRow>
                ) : variants.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="h-40 text-center text-gray-500">Produk tidak ditemukan.</TableCell></TableRow>
                ) : (
                  variants.map((v) => (
                    <TableRow key={v.variantId} className="hover:bg-blue-50/50 transition-colors">
                      <TableCell>
                        <div className="w-12 h-16 relative bg-gray-100 rounded-md overflow-hidden border border-gray-200 shadow-sm">
                          {v.imageUrl ? <Image src={v.imageUrl} alt={v.productName} fill className="object-cover" /> : <ImageIcon className="w-4 h-4 absolute inset-0 m-auto text-gray-300" />}
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-bold text-sm text-gray-900 leading-tight">{v.productName}</p>
                        <p className="text-[10px] font-mono text-gray-500 mt-1 uppercase">{v.sku}</p>
                      </TableCell>
                      <TableCell>
                        <p className="font-bold font-mono text-xs text-gray-900">Rp {v.price.toLocaleString('id-ID')}</p>
                        <Badge variant="outline" className={`mt-1 text-[9px] px-1.5 py-0 ${v.stock > 0 ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'}`}>
                          {v.stock} Tersedia
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          className="w-full bg-gray-900 hover:bg-blue-600 transition-colors"
                          onClick={() => {
                            onSelect(v);
                            onClose();
                          }}
                        >
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