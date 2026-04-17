'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Plus, Search, SlidersHorizontal, ArrowUpDown,
  MoreHorizontal, Edit, Trash2, PackageOpen, ImageIcon,
  ChevronLeft, ChevronRight, Loader2, ChevronDown, ChevronUp, Star, Maximize2, X
} from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import { Category, Color, Size } from '@/types';
import { cn } from '@/lib/utils';

type ProductList = {
  id: string;
  name: string;
  status: string;
  categoryId: string | null;
  category: (Category & { parent: Category | null }) | null;
  images: { url: string; colorId: string | null; position: number }[];
  variants: { colorId: string; sizeId: string; stock: number; price: number; isMain: boolean; sku: string }[];
  createdAt: string;
};

type PaginationMeta = {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductList[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ totalItems: 0, totalPages: 1, currentPage: 1, limit: 10 });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);

  // --- MASTER DATA ---
  const [categories, setCategories] = useState<Category[]>([]);
  const [masterColors, setMasterColors] = useState<Color[]>([]);
  const [masterSizes, setMasterSizes] = useState<Size[]>([]);

  // --- SERVER-SIDE STATE ---
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('NEWEST');
  const [currentPage, setCurrentPage] = useState(1);

  // --- UI INTERACTION STATE ---
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // FITUR BARU: State Modal Carousel Fullscreen
  const [previewProduct, setPreviewProduct] = useState<ProductList | null>(null);
  const [previewImgIndex, setPreviewImgIndex] = useState(0);

  // 1. Fetch Master Data
  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then(res => res.json()),
      fetch('/api/colors').then(res => res.json()),
      fetch('/api/sizes').then(res => res.json())
    ]).then(([cats, cols, szs]) => {
      setCategories(cats);
      setMasterColors(cols);
      setMasterSizes(szs);
    });
  }, []);

  // 2. Debounce Search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => { setCurrentPage(1); }, [statusFilter, categoryFilter, sortBy]);

  // 3. Fetch Data Produk (SERVER-SIDE)
  const fetchProducts = useCallback(async () => {
    setIsRefetching(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: debouncedSearch,
        status: statusFilter,
        category: categoryFilter,
        sort: sortBy
      });

      const res = await fetch(`/api/admin/products?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setProducts(json.data);
        setMeta(json.meta);
      }
    } catch (error) {
      console.error("Gagal memuat produk", error);
    } finally {
      setIsLoading(false);
      setIsRefetching(false);
    }
  }, [currentPage, debouncedSearch, statusFilter, categoryFilter, sortBy]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // 4. Helper UI
  const getProductStats = (variants: ProductList['variants']) => {
    if (!variants || variants.length === 0) return { totalStock: 0, priceDisplay: 'Rp 0' };
    const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
    const prices = variants.map(v => v.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return {
      totalStock,
      priceDisplay: min === max ? `Rp ${min.toLocaleString('id-ID')}` : `Rp ${min.toLocaleString('id-ID')} - ${max.toLocaleString('id-ID')}`
    };
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus produk secara permanen?')) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    if (res.ok) fetchProducts();
  };

  const toggleExpandRow = (id: string) => setExpandedRowId(expandedRowId === id ? null : id);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            Products Inventory
            {isRefetching && !isLoading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage your catalog, stock, and tiered pricing.</p>
        </div>
        <Link href="/admin/products/new">
          <Button className="bg-gray-900 hover:bg-black shadow-sm px-6">
            <Plus className="w-4 h-4 mr-2" /> New Product
          </Button>
        </Link>
      </div>

      {/* TOOLBAR */}
      <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex flex-col xl:flex-row gap-4 items-center justify-between sticky top-16 z-20">
        <div className="relative w-full xl:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Cari nama produk..."
            className="pl-9 h-10 text-sm bg-gray-50/50 focus-visible:ring-1"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-10 w-full sm:w-[160px] text-xs font-semibold bg-white border-gray-200"><SelectValue placeholder="All Categories" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Kategori</SelectItem>
              {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.parent ? `— ${c.name}` : c.name}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-10 w-full sm:w-[130px] text-xs font-semibold bg-white border-gray-200"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Status</SelectItem>
              <SelectItem value="PUBLISHED">Published</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
            </SelectContent>
          </Select>

          <Separator orientation="vertical" className="h-6 hidden sm:block mx-1" />

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="h-10 w-full sm:w-[150px] text-xs font-semibold bg-white border-gray-200"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="NEWEST">Terbaru</SelectItem>
              <SelectItem value="OLDEST">Terlama</SelectItem>
              <SelectItem value="NAME_ASC">Nama (A-Z)</SelectItem>
              <SelectItem value="NAME_DESC">Nama (Z-A)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[400px]">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead className="w-[350px] text-[11px] font-bold uppercase tracking-widest text-gray-400">Product Details</TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Category Hierarchy</TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Price Range</TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Total Stock</TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Status</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="h-40 text-center text-sm text-gray-400 animate-pulse font-medium">Loading catalog...</TableCell></TableRow>
            ) : products.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="h-60 text-center"><PackageOpen className="w-10 h-10 mx-auto text-gray-200 mb-2" /><p className="text-sm font-medium text-gray-400">Tidak ada produk ditemukan.</p></TableCell></TableRow>
            ) : (
              products.map((product) => {
                const { totalStock, priceDisplay } = getProductStats(product.variants);
                const coverImage = product.images?.[0]?.url;
                const isExpanded = expandedRowId === product.id;

                return (
                  <React.Fragment key={product.id}>
                    {/* BARIS UTAMA */}
                    <TableRow
                      className={cn("hover:bg-gray-50/50 transition-colors group cursor-pointer", isRefetching && "opacity-50", isExpanded && "bg-gray-50/80")}
                      onClick={() => toggleExpandRow(product.id)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-4">
                          {/* FITUR BARU: Trigger Modal Lightbox Multi-Image */}
                          <div
                            className={cn("w-12 h-16 shrink-0 bg-gray-50 rounded-lg border border-gray-100 overflow-hidden relative shadow-sm group/img", coverImage ? "cursor-zoom-in" : "")}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (product.images && product.images.length > 0) {
                                setPreviewProduct(product);
                                setPreviewImgIndex(0);
                              }
                            }}
                          >
                            {coverImage ? (
                              <>
                                <Image src={coverImage} alt={product.name} fill className="object-cover group-hover/img:scale-105 transition-transform duration-300" />
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center"><Maximize2 className="w-4 h-4 text-white" /></div>
                              </>
                            ) : <ImageIcon className="w-4 h-4 text-gray-200 absolute inset-0 m-auto" />}
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="font-bold text-sm text-gray-900 group-hover:text-blue-600 transition-colors leading-tight max-w-[200px] truncate" title={product.name}>{product.name}</span>
                            <span className="text-[10px] text-gray-400 font-mono tracking-tighter uppercase flex items-center gap-1">
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              {product.variants?.length} Combinations
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          {product.category?.parent && <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mb-0.5">{product.category.parent.name}</span>}
                          <span className="text-sm font-semibold text-gray-600">{product.category?.name || 'Uncategorized'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-mono font-bold text-gray-900">{priceDisplay}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("font-mono text-[10px] px-2 py-0", totalStock > 0 ? "text-green-600 border-green-200 bg-green-50" : "text-red-600 border-red-200 bg-red-50")}>
                          {totalStock} UNITS
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("text-[9px] font-black uppercase tracking-widest px-2", product.status === 'PUBLISHED' ? "text-blue-600 border-blue-200" : "text-gray-400 border-gray-200")}>
                          {product.status}
                        </Badge>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4 text-gray-400" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem asChild><Link href={`/admin/products/${product.id}/edit`} className="cursor-pointer text-xs font-semibold"><Edit className="w-3.5 h-3.5 mr-2" /> Edit Details</Link></DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(product.id)} className="text-red-600 focus:text-red-600 cursor-pointer text-xs font-semibold"><Trash2 className="w-3.5 h-3.5 mr-2" /> Permanent Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>

                    {/* BARIS EKSPANSI (DETAIL VARIAN) */}
                    {isExpanded && (
                      <TableRow className="bg-slate-50/50 shadow-inner hover:bg-slate-50/50">
                        <TableCell colSpan={6} className="p-0 border-b">
                          <div className="p-4 pl-[80px] pr-8 border-l-2 border-blue-500 bg-gradient-to-r from-blue-50/30 to-transparent">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
                              Rincian Matrix Inventaris <Badge variant="secondary" className="text-[9px] h-4 px-1.5">{product.variants.length}</Badge>
                            </h4>

                            {/* Grid Varian */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                              {product.variants.map((v) => {
                                const color = masterColors.find(c => c.id === v.colorId);
                                const size = masterSizes.find(s => s.id === v.sizeId);

                                return (
                                  <div key={`${v.colorId}_${v.sizeId}`} className={cn("flex flex-col p-3 rounded-lg border bg-white shadow-sm transition-all", v.isMain ? "border-gray-900 ring-1 ring-gray-900" : "border-gray-200 hover:border-gray-300")}>
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full border shadow-sm" style={{ background: color?.hexCodes.length === 1 ? color.hexCodes[0] : `linear-gradient(to right, ${color?.hexCodes[0]} 50%, ${color?.hexCodes[1]} 50%)` }} />
                                        <span className="text-xs font-bold text-gray-900">{color?.name} / {size?.name}</span>
                                      </div>
                                      {v.isMain && <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />}
                                    </div>
                                    <div className="flex items-end justify-between mt-auto pt-2 border-t border-gray-50">
                                      <div className="flex flex-col">
                                        <span className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-0.5">Stok</span>
                                        <span className={cn("text-xs font-mono font-bold", v.stock > 0 ? "text-green-600" : "text-red-500")}>{v.stock} unit</span>
                                      </div>
                                      <div className="flex flex-col text-right">
                                        <span className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-0.5">Harga</span>
                                        <span className="text-xs font-mono font-bold text-gray-900">Rp {v.price.toLocaleString('id-ID')}</span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* SERVER-SIDE PAGINATION FOOTER */}
        {!isLoading && products.length > 0 && (
          <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-500 font-medium tracking-tight">
              Showing <span className="font-bold text-gray-900">{(meta.currentPage - 1) * meta.limit + 1}</span> to <span className="font-bold text-gray-900">{Math.min(meta.currentPage * meta.limit, meta.totalItems)}</span> of <span className="font-bold text-gray-900">{meta.totalItems}</span> products
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={meta.currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="h-8 w-8 p-0"><ChevronLeft className="w-4 h-4" /></Button>
              <div className="flex items-center gap-1">
                {[...Array(meta.totalPages)].map((_, i) => {
                  const pageNumber = i + 1;
                  if (pageNumber === 1 || pageNumber === meta.totalPages || Math.abs(pageNumber - meta.currentPage) <= 1) {
                    return <Button key={i} variant={meta.currentPage === pageNumber ? "default" : "outline"} size="sm" onClick={() => setCurrentPage(pageNumber)} className={cn("h-8 w-8 p-0 text-[11px] font-bold", meta.currentPage === pageNumber ? "bg-gray-900" : "")}>{pageNumber}</Button>;
                  } else if (pageNumber === meta.currentPage - 2 || pageNumber === meta.currentPage + 2) {
                    return <span key={i} className="text-gray-400 text-xs px-1">...</span>;
                  }
                  return null;
                })}
              </div>
              <Button variant="outline" size="sm" disabled={meta.currentPage === meta.totalPages} onClick={() => setCurrentPage(p => p + 1)} className="h-8 w-8 p-0"><ChevronRight className="w-4 h-4" /></Button>
            </div>
          </div>
        )}
      </div>

      {/* ==========================================
          FITUR BARU: FULLSCREEN CAROUSEL LIGHTBOX
      ========================================== */}
      {previewProduct && previewProduct.images && previewProduct.images.length > 0 && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-sm" onClick={() => setPreviewProduct(null)}>

          {/* Tombol Tutup */}
          <button className="absolute top-6 right-6 text-white hover:text-red-500 transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-full z-50" onClick={() => setPreviewProduct(null)}>
            <X className="w-6 h-6" />
          </button>

          {/* Info Header */}
          <div className="absolute top-6 left-6 text-white/90 z-50 flex flex-col pointer-events-none">
            <span className="font-bold text-lg">{previewProduct.name}</span>
            <span className="text-xs text-white/50 font-mono tracking-widest uppercase">{previewProduct.category?.name || 'Uncategorized'}</span>
          </div>

          <div className="relative w-full max-w-5xl h-[70vh] flex items-center justify-center mt-8" onClick={(e) => e.stopPropagation()}>
            {/* Gambar Utama */}
            <Image src={previewProduct.images[previewImgIndex].url} alt="Fullscreen Preview" fill className="object-contain" />

            {/* Navigasi Kiri / Kanan (Chevron) */}
            {previewProduct.images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); setPreviewImgIndex(p => (p - 1 + previewProduct.images.length) % previewProduct.images.length); }}
                  className="absolute left-0 sm:-left-16 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-all backdrop-blur-md"
                >
                  <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setPreviewImgIndex(p => (p + 1) % previewProduct.images.length); }}
                  className="absolute right-0 sm:-right-16 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-all backdrop-blur-md"
                >
                  <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
                </button>
              </>
            )}

            {/* Indikator Titik Warna (Bawah Tengah) */}
            <div className="absolute -bottom-16 left-0 right-0 flex justify-center gap-4 z-10">
              {/* Filter warna unik dari varian */}
              {Array.from(new Set(previewProduct.variants.map(v => v.colorId))).map(cId => {
                const color = masterColors.find(c => c.id === cId);

                // Cari apakah ada gambar untuk warna ini
                const firstImgIdx = previewProduct.images.findIndex(img => img.colorId === cId);
                if (firstImgIdx === -1) return null; // Jika warna ini belum punya foto, jangan tampilkan titiknya

                // Cek apakah gambar yang SEDANG TAMPIL memiliki warna ini
                const isActive = previewProduct.images[previewImgIndex].colorId === cId;

                return (
                  <button
                    key={cId}
                    onClick={(e) => {
                      e.stopPropagation();
                      // Lompat ke foto pertama yang memiliki warna ini
                      setPreviewImgIndex(firstImgIdx);
                    }}
                    className={cn(
                      "w-5 h-5 sm:w-6 sm:h-6 rounded-full border shadow-lg transition-all cursor-pointer",
                      isActive ? "ring-2 ring-white ring-offset-4 ring-offset-black/90 border-transparent scale-110" : "border-white/50 hover:scale-110 opacity-60 hover:opacity-100"
                    )}
                    style={{ background: color?.hexCodes.length === 1 ? color.hexCodes[0] : `linear-gradient(to right, ${color?.hexCodes[0]} 50%, ${color?.hexCodes[1]} 50%)` }}
                    title={color?.name}
                  />
                );
              })}
            </div>
          </div>

          <div className="text-white/40 mt-24 text-xs font-mono tracking-widest uppercase">
            Gambar {previewImgIndex + 1} dari {previewProduct.images.length}
          </div>
        </div>
      )}

    </div>
  );
}