'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Plus, Search, ArrowUpDown, MoreHorizontal, Edit, Trash2, 
  PackageOpen, ImageIcon, ChevronLeft, ChevronRight, Loader2, 
  ChevronDown, ChevronUp, Star, Maximize2, X
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
  const [previewProduct, setPreviewProduct] = useState<ProductList | null>(null);
  const [previewImgIndex, setPreviewImgIndex] = useState(0);

  // 1. Fetch Master Data
  useEffect(() => {
    Promise.all([
      fetch('/api/admin/categories').then(res => res.json()),
      fetch('/api/admin/colors').then(res => res.json()),
      fetch('/api/admin/sizes').then(res => res.json())
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
        limit: '15', // Menambah limit karena tampilan lebih compact
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
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-4 animate-in fade-in duration-500">

      {/* HEADER - Compact */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            Products
            {isRefetching && !isLoading && <Loader2 className="w-3 h-3 animate-spin text-gray-400" />}
          </h1>
        </div>
        <Link href="/admin/products/new">
          <Button size="sm" className="bg-gray-900 hover:bg-black shadow-sm h-8">
            <Plus className="w-3.5 h-3.5 mr-1.5" /> New
          </Button>
        </Link>
      </div>

      {/* TOOLBAR - Compact */}
      <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm flex flex-col xl:flex-row gap-2 items-center justify-between sticky top-14 z-20">
        <div className="relative w-full xl:w-72">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <Input
            placeholder="Search..."
            className="pl-8 h-8 text-xs bg-gray-50/50 focus-visible:ring-1"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-8 w-full sm:w-[140px] text-[11px] font-medium bg-white border-gray-200"><SelectValue placeholder="All Categories" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-[11px]">All Categories</SelectItem>
              {categories.map(c => <SelectItem key={c.id} value={c.id} className="text-[11px]">{c.parent ? `— ${c.name}` : c.name}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 w-full sm:w-[110px] text-[11px] font-medium bg-white border-gray-200"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-[11px]">All Status</SelectItem>
              <SelectItem value="PUBLISHED" className="text-[11px]">Published</SelectItem>
              <SelectItem value="DRAFT" className="text-[11px]">Draft</SelectItem>
            </SelectContent>
          </Select>

          <Separator orientation="vertical" className="h-4 hidden sm:block mx-1" />

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="h-8 w-full sm:w-[120px] text-[11px] font-medium bg-white border-gray-200"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="NEWEST" className="text-[11px]">Newest</SelectItem>
              <SelectItem value="OLDEST" className="text-[11px]">Oldest</SelectItem>
              <SelectItem value="NAME_ASC" className="text-[11px]">A-Z</SelectItem>
              <SelectItem value="NAME_DESC" className="text-[11px]">Z-A</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* TABLE - Compact */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden min-h-[300px]">
        <Table>
          <TableHeader className="bg-gray-50/80">
            <TableRow className="h-8">
              <TableHead className="w-[300px] text-[10px] font-bold uppercase tracking-wider text-gray-500 py-1">Product</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-gray-500 py-1">Category</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-gray-500 py-1">Price</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-gray-500 py-1">Weight</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-gray-500 py-1">Stock</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-gray-500 py-1">Status</TableHead>
              <TableHead className="w-[50px] py-1"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="h-32 text-center text-xs text-gray-400 animate-pulse font-medium">Loading catalog...</TableCell></TableRow>
            ) : products.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="h-48 text-center"><PackageOpen className="w-8 h-8 mx-auto text-gray-200 mb-2" /><p className="text-xs font-medium text-gray-400">No products found.</p></TableCell></TableRow>
            ) : (
              products.map((product) => {
                const { totalStock, priceDisplay } = getProductStats(product.variants);
                const coverImage = product.images?.[0]?.url;
                const isExpanded = expandedRowId === product.id;

                return (
                  <React.Fragment key={product.id}>
                    {/* BARIS UTAMA - Compact */}
                    <TableRow
                      className={cn("hover:bg-gray-50/50 transition-colors group cursor-pointer h-12", isRefetching && "opacity-50", isExpanded && "bg-gray-50/80")}
                      onClick={() => toggleExpandRow(product.id)}
                    >
                      <TableCell className="py-2">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn("w-8 h-10 shrink-0 bg-gray-50 rounded border border-gray-100 overflow-hidden relative shadow-sm group/img", coverImage ? "cursor-zoom-in" : "")}
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
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center"><Maximize2 className="w-3 h-3 text-white" /></div>
                              </>
                            ) : <ImageIcon className="w-3 h-3 text-gray-200 absolute inset-0 m-auto" />}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-xs text-gray-900 group-hover:text-blue-600 transition-colors leading-tight max-w-[180px] truncate" title={product.name}>{product.name}</span>
                            <span className="text-[9px] text-gray-400 font-mono tracking-tighter uppercase flex items-center gap-1 mt-0.5">
                              {isExpanded ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
                              {product.variants?.length} Vars
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="flex flex-col">
                          {product.category?.parent && <span className="text-[8px] text-gray-400 font-bold uppercase tracking-tighter mb-0.5">{product.category.parent.name}</span>}
                          <span className="text-[11px] font-medium text-gray-600">{product.category?.name || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-2 text-[11px] font-mono font-medium text-gray-900">{priceDisplay}</TableCell>
                      <TableCell className="py-2 text-[11px] font-mono font-medium text-gray-900">{product.weight}g</TableCell>
                      <TableCell className="py-2">
                        <Badge variant="outline" className={cn("font-mono text-[9px] px-1.5 py-0", totalStock > 0 ? "text-green-600 border-green-200 bg-green-50" : "text-red-600 border-red-200 bg-red-50")}>
                          {totalStock}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2">
                        <Badge variant="outline" className={cn("text-[8px] font-bold uppercase tracking-wider px-1.5", product.status === 'PUBLISHED' ? "text-blue-600 border-blue-200" : "text-gray-400 border-gray-200")}>
                          {product.status.substring(0, 3)}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2 text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6"><MoreHorizontal className="w-3.5 h-3.5 text-gray-400" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-36">
                            <DropdownMenuItem asChild><Link href={`/admin/products/${product.id}/edit`} className="cursor-pointer text-[11px] font-medium"><Edit className="w-3 h-3 mr-2" /> Edit</Link></DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(product.id)} className="text-red-600 focus:text-red-600 cursor-pointer text-[11px] font-medium"><Trash2 className="w-3 h-3 mr-2" /> Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>

                    {/* BARIS EKSPANSI (DETAIL VARIAN) - Compact */}
                    {isExpanded && (
                      <TableRow className="bg-slate-50/40 shadow-inner hover:bg-slate-50/40">
                        <TableCell colSpan={6} className="p-0 border-b">
                          <div className="p-3 pl-[52px] border-l-2 border-blue-400">
                            {/* Grid Varian - Sangat Padat */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                              {product.variants.map((v) => {
                                const color = masterColors.find(c => c.id === v.colorId);
                                const size = masterSizes.find(s => s.id === v.sizeId);

                                return (
                                  <div key={`${v.colorId}_${v.sizeId}`} className={cn("flex flex-col p-2 rounded-md border bg-white shadow-sm transition-all", v.isMain ? "border-gray-400 bg-gray-50/50" : "border-gray-200")}>
                                    <div className="flex items-center justify-between mb-1.5">
                                      <div className="flex items-center gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full border shadow-sm" style={{ background: color?.hexCodes.length === 1 ? color.hexCodes[0] : `linear-gradient(to right, ${color?.hexCodes[0]} 50%, ${color?.hexCodes[1]} 50%)` }} />
                                        <span className="text-[10px] font-semibold text-gray-800 leading-none">{color?.name}/{size?.name}</span>
                                      </div>
                                      {v.isMain && <Star className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" />}
                                    </div>
                                    <div className="flex justify-between items-end mt-1">
                                       <span className={cn("text-[10px] font-mono", v.stock > 0 ? "text-green-600" : "text-red-500")}>{v.stock}u</span>
                                       <span className="text-[10px] font-mono text-gray-700">Rp {(v.price/1000)}k</span>
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

        {/* SERVER-SIDE PAGINATION FOOTER - Compact */}
        {!isLoading && products.length > 0 && (
          <div className="px-4 py-3 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
            <p className="text-[10px] text-gray-500 font-medium">
              <span className="font-semibold text-gray-900">{(meta.currentPage - 1) * meta.limit + 1}-{Math.min(meta.currentPage * meta.limit, meta.totalItems)}</span> of <span className="font-semibold text-gray-900">{meta.totalItems}</span>
            </p>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" disabled={meta.currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="h-6 w-6 p-0"><ChevronLeft className="w-3 h-3" /></Button>
              <div className="flex items-center">
                {[...Array(meta.totalPages)].map((_, i) => {
                  const pageNumber = i + 1;
                  if (pageNumber === 1 || pageNumber === meta.totalPages || Math.abs(pageNumber - meta.currentPage) <= 1) {
                    return <Button key={i} variant={meta.currentPage === pageNumber ? "default" : "ghost"} size="sm" onClick={() => setCurrentPage(pageNumber)} className={cn("h-6 w-6 p-0 text-[10px] font-medium", meta.currentPage === pageNumber ? "bg-gray-900 h-6 w-6" : "")}>{pageNumber}</Button>;
                  } else if (pageNumber === meta.currentPage - 2 || pageNumber === meta.currentPage + 2) {
                    return <span key={i} className="text-gray-400 text-[10px] px-0.5">.</span>;
                  }
                  return null;
                })}
              </div>
              <Button variant="outline" size="sm" disabled={meta.currentPage === meta.totalPages} onClick={() => setCurrentPage(p => p + 1)} className="h-6 w-6 p-0"><ChevronRight className="w-3 h-3" /></Button>
            </div>
          </div>
        )}
      </div>

      {/* FULLSCREEN CAROUSEL LIGHTBOX - (Tetap sama, hanya penyesuaian minor jika diperlukan) */}
      {previewProduct && previewProduct.images && previewProduct.images.length > 0 && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-sm" onClick={() => setPreviewProduct(null)}>
          <button className="absolute top-4 right-4 text-white hover:text-red-500 transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-full z-50" onClick={() => setPreviewProduct(null)}>
            <X className="w-5 h-5" />
          </button>
          {/* ... Sisa logika Lightbox sama persis dengan sebelumnya ... */}
          <div className="absolute top-6 left-6 text-white/90 z-50 flex flex-col pointer-events-none">
            <span className="font-bold text-lg">{previewProduct.name}</span>
            <span className="text-xs text-white/50 font-mono tracking-widest uppercase">{previewProduct.category?.name || 'Uncategorized'}</span>
          </div>

          <div className="relative w-full max-w-5xl h-[70vh] flex items-center justify-center mt-8" onClick={(e) => e.stopPropagation()}>
            <Image src={previewProduct.images[previewImgIndex].url} alt="Fullscreen Preview" fill className="object-contain" />

            {previewProduct.images.length > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); setPreviewImgIndex(p => (p - 1 + previewProduct.images.length) % previewProduct.images.length); }} className="absolute left-0 sm:-left-12 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-full transition-all backdrop-blur-md">
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); setPreviewImgIndex(p => (p + 1) % previewProduct.images.length); }} className="absolute right-0 sm:-right-12 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-full transition-all backdrop-blur-md">
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </>
            )}

            <div className="absolute -bottom-12 left-0 right-0 flex justify-center gap-3 z-10">
              {Array.from(new Set(previewProduct.variants.map(v => v.colorId))).map(cId => {
                const color = masterColors.find(c => c.id === cId);
                const firstImgIdx = previewProduct.images.findIndex(img => img.colorId === cId);
                if (firstImgIdx === -1) return null;
                const isActive = previewProduct.images[previewImgIndex].colorId === cId;

                return (
                  <button
                    key={cId}
                    onClick={(e) => { e.stopPropagation(); setPreviewImgIndex(firstImgIdx); }}
                    className={cn(
                      "w-4 h-4 sm:w-5 sm:h-5 rounded-full border shadow-lg transition-all cursor-pointer",
                      isActive ? "ring-2 ring-white ring-offset-2 ring-offset-black/90 border-transparent scale-110" : "border-white/50 hover:scale-110 opacity-60 hover:opacity-100"
                    )}
                    style={{ background: color?.hexCodes.length === 1 ? color.hexCodes[0] : `linear-gradient(to right, ${color?.hexCodes[0]} 50%, ${color?.hexCodes[1]} 50%)` }}
                    title={color?.name}
                  />
                );
              })}
            </div>
          </div>
          <div className="text-white/40 mt-16 text-[10px] font-mono tracking-widest uppercase">
            Image {previewImgIndex + 1} / {previewProduct.images.length}
          </div>
        </div>
      )}

    </div>
  );
}