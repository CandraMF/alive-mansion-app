'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Search, Loader2, ImageIcon, X } from 'lucide-react';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ProductImagePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (imageUrl: string) => void;
  defaultSearch?: string; // 🚀 Prop baru untuk Auto-Search
}

export function ProductImagePickerModal({ isOpen, onClose, onSelect, defaultSearch }: ProductImagePickerModalProps) {
  const [images, setImages] = useState<{ url: string, productName: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // 🚀 Auto-Search saat modal dibuka
  useEffect(() => {
    if (isOpen && defaultSearch) {
      setSearchQuery(defaultSearch);
      setDebouncedSearch(defaultSearch); // Langsung eksekusi tanpa menunggu delay 500ms
    } else if (isOpen) {
      setSearchQuery('');
      setDebouncedSearch('');
    }
  }, [isOpen, defaultSearch]);

  // Debounce Search untuk ketikan manual
  useEffect(() => {
    if (!isOpen) return;
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery, isOpen]);

  // Fetch Data Produk & Ekstrak Gambar (Biarkan sama persis seperti sebelumnya)
  const fetchImages = useCallback(async () => {
    if (!isOpen) return;
    setIsLoading(true);
    try {
      // Kita ambil lebih banyak limit agar galerinya penuh
      const params = new URLSearchParams({
        page: '1',
        limit: '20',
        search: debouncedSearch,
        status: 'PUBLISHED'
      });

      const res = await fetch(`/api/admin/products?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();

        // Ekstrak semua gambar dari semua produk yang ditemukan
        const extractedImages: { url: string, productName: string }[] = [];
        json.data.forEach((p: any) => {
          if (p.images && p.images.length > 0) {
            p.images.forEach((img: any) => {
              extractedImages.push({
                url: img.url,
                productName: p.name
              });
            });
          }
        });

        setImages(extractedImages);
      }
    } catch (error) {
      console.error("Gagal memuat galeri gambar", error);
    } finally {
      setIsLoading(false);
    }
  }, [isOpen, debouncedSearch]);

  useEffect(() => { fetchImages(); }, [fetchImages]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0 overflow-hidden bg-gray-50">

        <DialogHeader className="p-4 md:p-6 bg-white border-b border-gray-100 shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">Pilih Gambar dari Katalog</DialogTitle>
          </div>
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
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin mb-4" />
              <p className="text-sm font-medium">Memuat galeri...</p>
            </div>
          ) : images.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <ImageIcon className="w-10 h-10 mb-4 opacity-50" />
              <p className="text-sm font-medium">Tidak ada gambar ditemukan.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {images.map((img, idx) => (
                <div
                  key={`${img.url}-${idx}`}
                  className="group relative aspect-[3/4] bg-gray-200 rounded-xl overflow-hidden border border-gray-200 cursor-pointer shadow-sm hover:ring-4 hover:ring-blue-500/50 transition-all"
                  onClick={() => {
                    onSelect(img.url);
                    onClose();
                  }}
                >
                  <Image
                    src={img.url}
                    alt={img.productName}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Overlay Nama Produk */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[10px] text-white font-bold tracking-widest uppercase line-clamp-2 leading-tight">
                      {img.productName}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </DialogContent>
    </Dialog>
  );
}