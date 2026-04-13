'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ChevronLeft, UploadCloud, X, Info, Layers, ImageIcon, 
  Eye, GripVertical, Maximize2, Palette, Star, RefreshCcw
} from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

import { Category, Color, Size } from '@/types';
import { cn } from '@/lib/utils';

type ProductImageData = { id: string; url: string; colorId: string; category: string };

const DRAFT_KEY = 'alive_new_product_draft'; // Kunci untuk Local Storage

export default function NewProductPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- MASTER DATA ---
  const [categories, setCategories] = useState<Category[]>([]);
  const [masterColors, setMasterColors] = useState<Color[]>([]);
  const [masterSizes, setMasterSizes] = useState<Size[]>([]);
  const [isFetchingMasters, setIsFetchingMasters] = useState(true);
  
  // FITUR BARU: Flag untuk memastikan data LocalStorage sudah dimuat
  const [isHydrated, setIsHydrated] = useState(false);

  // --- FORM STATE ---
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', status: 'PUBLISHED', categoryId: '' });

  // --- VARIANTS & MATRIX ---
  const [selectedColorIds, setSelectedColorIds] = useState<string[]>([]);
  const [selectedSizeIds, setSelectedSizeIds] = useState<string[]>([]);
  type ActiveVariant = { key: string, colorId: string, sizeId: string };
  const [activeVariants, setActiveVariants] = useState<ActiveVariant[]>([]);
  const [variantMatrix, setVariantMatrix] = useState<Record<string, { stock: string; price: string }>>({});
  const [mainVariantKey, setMainVariantKey] = useState<string>('');

  const dragVariantIdx = useRef<number | null>(null);
  const dragOverVariantIdx = useRef<number | null>(null);

  // --- MEDIA KANBAN & LIGHTBOX ---
  const [images, setImages] = useState<ProductImageData[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // ==========================================
  // 1. LOAD DATA & HYDRATE DRAFT
  // ==========================================
  useEffect(() => {
    const loadData = async () => {
      try {
        const [cats, cols, szs] = await Promise.all([
          fetch('/api/categories').then(res => res.json()),
          fetch('/api/colors').then(res => res.json()),
          fetch('/api/sizes').then(res => res.json())
        ]);
        setCategories(cats); setMasterColors(cols); setMasterSizes(szs);

        // FITUR BARU: Membaca Draft dari Local Storage
        const savedDraft = localStorage.getItem(DRAFT_KEY);
        if (savedDraft) {
          try {
            const parsed = JSON.parse(savedDraft);
            if (parsed.formData) setFormData(parsed.formData);
            if (parsed.selectedColorIds) setSelectedColorIds(parsed.selectedColorIds);
            if (parsed.selectedSizeIds) setSelectedSizeIds(parsed.selectedSizeIds);
            if (parsed.activeVariants) setActiveVariants(parsed.activeVariants);
            if (parsed.variantMatrix) setVariantMatrix(parsed.variantMatrix);
            if (parsed.mainVariantKey) setMainVariantKey(parsed.mainVariantKey);
            if (parsed.images) setImages(parsed.images);
          } catch (e) {
            console.error("Gagal membaca draft", e);
          }
        }
      } catch (err) { 
        setError("Gagal memuat data master."); 
      } finally { 
        setIsFetchingMasters(false); 
        setIsHydrated(true); // Tandai bahwa pemulihan data selesai
      }
    };
    loadData();
  }, []);

  // ==========================================
  // 2. AUTO-SAVE DRAFT KE LOCAL STORAGE
  // ==========================================
  useEffect(() => {
    // Jangan simpan apapun jika data awal belum selesai dimuat (menghindari overwrite)
    if (!isHydrated) return; 

    const draftData = {
      formData,
      selectedColorIds,
      selectedSizeIds,
      activeVariants,
      variantMatrix,
      mainVariantKey,
      images
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
  }, [formData, selectedColorIds, selectedSizeIds, activeVariants, variantMatrix, mainVariantKey, images, isHydrated]);


  // ==========================================
  // LOGIKA VARIAN & MATRIX
  // ==========================================
  useEffect(() => {
    if (!isHydrated) return; // Jangan jalankan logika ini saat sedang memulihkan data

    const theoreticalCombinations: ActiveVariant[] = [];
    selectedColorIds.forEach(cId => {
      selectedSizeIds.forEach(sId => theoreticalCombinations.push({ key: `${cId}_${sId}`, colorId: cId, sizeId: sId }));
    });

    let newActiveVariants = activeVariants.filter(v => selectedColorIds.includes(v.colorId) && selectedSizeIds.includes(v.sizeId));
    theoreticalCombinations.forEach(tc => {
      if (!newActiveVariants.find(v => v.key === tc.key)) newActiveVariants.push(tc);
    });

    setActiveVariants(newActiveVariants);

    if (newActiveVariants.length > 0) {
      if (!newActiveVariants.find(v => v.key === mainVariantKey)) {
        setMainVariantKey(newActiveVariants[0].key);
      }
    } else {
      setMainVariantKey('');
    }
  }, [selectedColorIds, selectedSizeIds]); 

  const toggleColor = (id: string) => setSelectedColorIds(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  const toggleSize = (id: string) => setSelectedSizeIds(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  const handleMatrixChange = (key: string, field: 'stock' | 'price', value: string) => setVariantMatrix(prev => ({ ...prev, [key]: { ...(prev[key] || { stock: '', price: '' }), [field]: value } }));

  const handleVariantDragEnd = () => {
    if (dragVariantIdx.current === null || dragOverVariantIdx.current === null) return;
    const newVariants = [...activeVariants];
    const draggedItem = newVariants.splice(dragVariantIdx.current, 1)[0];
    newVariants.splice(dragOverVariantIdx.current, 0, draggedItem);
    setActiveVariants(newVariants);
    dragVariantIdx.current = null; dragOverVariantIdx.current = null;
  };

  // ==========================================
  // MEDIA KANBAN LOGIC
  // ==========================================
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setIsUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const response = await fetch(`/api/admin/upload?filename=${file.name}`, { method: 'POST', body: file });
        const newBlob = await response.json();
        if (!response.ok) throw new Error(newBlob.error || 'Upload failed');
        return newBlob.url;
      });
      const uploadedUrls = await Promise.all(uploadPromises);
      const newImages = uploadedUrls.map(url => ({ id: Math.random().toString(36).substring(7), url, colorId: '', category: 'MAIN' }));
      setImages(prev => [...prev, ...newImages]);
    } catch (err: any) { setError(err.message); }
    finally { setIsUploading(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const handleImageDragStart = (e: React.DragEvent, imageId: string) => e.dataTransfer.setData('imageId', imageId);
  const handleImageDrop = (e: React.DragEvent, targetColorId: string, targetImageId: string | null = null) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('imageId');
    if (!sourceId) return;

    setImages(prev => {
      const newImages = [...prev];
      const sourceIndex = newImages.findIndex(img => img.id === sourceId);
      if (sourceIndex === -1) return prev;

      const [draggedImg] = newImages.splice(sourceIndex, 1);
      draggedImg.colorId = targetColorId;

      if (targetImageId) {
        const targetIndex = newImages.findIndex(img => img.id === targetImageId);
        newImages.splice(targetIndex, 0, draggedImg);
      } else {
        newImages.push(draggedImg);
      }
      return newImages;
    });
  };

  const updateImageCategory = (id: string, category: string) => setImages(prev => prev.map(img => img.id === id ? { ...img, category } : img));
  const removeImage = (id: string) => setImages(prev => prev.filter(img => img.id !== id));

  // FITUR BARU: Fungsi untuk menghapus draft secara manual jika user ingin mulai dari awal
  const handleClearDraft = () => {
    if (confirm("Apakah Anda yakin ingin mereset formulir ini? Semua perubahan akan hilang.")) {
      localStorage.removeItem(DRAFT_KEY);
      window.location.reload();
    }
  };

  // ==========================================
  // SUBMIT
  // ==========================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) return setError("Unggah setidaknya satu gambar.");
    if (activeVariants.length === 0) return setError("Pilih setidaknya satu kombinasi warna dan ukuran.");

    setIsLoading(true); setError(null);

    const variantsPayload = activeVariants.map(v => ({
      colorId: v.colorId, sizeId: v.sizeId,
      stock: variantMatrix[v.key]?.stock || 0, price: variantMatrix[v.key]?.price || 0,
      isMain: v.key === mainVariantKey 
    }));

    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, variants: variantsPayload, images: images.map((img, idx) => ({ ...img, position: idx })) }),
      });
      if (!response.ok) throw new Error((await response.json()).error || 'Gagal menyimpan');
      
      // FITUR BARU: Bersihkan memori draft setelah produk berhasil disimpan ke Database
      localStorage.removeItem(DRAFT_KEY);
      
      router.push('/admin/products'); router.refresh();
    } catch (err: any) { setError(err.message); setIsLoading(false); }
  };

  if (isFetchingMasters) return <div className="p-20 text-center animate-pulse">Memuat workspace...</div>;

  // Render Kanban Column
  const renderMediaColumn = (colorId: string, title: string, hexCodes: string[] | null) => {
    const columnImages = images.filter(img => img.colorId === colorId);
    return (
      <div key={colorId} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleImageDrop(e, colorId)} className="min-w-[320px] w-[320px] bg-gray-50/50 rounded-xl border border-gray-200 flex flex-col max-h-[600px] shrink-0">
        <div className="p-4 border-b border-gray-200 bg-white/50 backdrop-blur rounded-t-xl flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            {hexCodes ? (
              <div className="w-4 h-4 rounded-full border shadow-sm" style={{ background: hexCodes.length === 1 ? hexCodes[0] : `linear-gradient(to right, ${hexCodes[0]} 50%, ${hexCodes[1]} 50%)` }} />
            ) : <Palette className="w-4 h-4 text-gray-400" />}
            <h3 className="font-bold text-sm text-gray-900">{title}</h3>
          </div>
          <span className="text-[10px] font-bold bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{columnImages.length}</span>
        </div>
        <div className="p-3 flex-1 overflow-y-auto space-y-3 min-h-[150px]">
          {columnImages.length === 0 && <div className="h-full min-h-[100px] border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-400 font-medium">Drag gambar ke sini</div>}
          {columnImages.map((img) => (
            <div key={img.id} draggable onDragStart={(e) => handleImageDragStart(e, img.id)} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.stopPropagation(); handleImageDrop(e, colorId, img.id); }} className="group flex gap-3 p-2 border border-gray-200 bg-white rounded-lg shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing relative">
              <div className="relative w-20 h-28 shrink-0 bg-gray-100 rounded-md overflow-hidden border border-gray-100 group">
                <Image src={img.url} alt="Media" fill className="object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-[1px]">
                  <button type="button" onClick={() => setPreviewImage(img.url)} className="bg-white text-black p-1.5 rounded-full hover:scale-110 transition-transform"><Maximize2 className="w-3 h-3" /></button>
                  <button type="button" onClick={() => removeImage(img.id)} className="bg-red-500 text-white p-1.5 rounded-full hover:scale-110 transition-transform"><X className="w-3 h-3" /></button>
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-center gap-2">
                <div className="flex items-center gap-1 text-gray-400 mb-1"><GripVertical className="w-3 h-3" /><span className="text-[9px] uppercase tracking-widest font-bold">Drag to Move</span></div>
                <Label className="text-[10px] text-gray-500 font-semibold">Kategori Foto</Label>
                <Select value={img.category} onValueChange={(val) => updateImageCategory(img.id, val)}>
                  <SelectTrigger className="h-8 text-xs font-medium"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="MAIN">Main Shot</SelectItem><SelectItem value="WITH_MODEL">With Model</SelectItem><SelectItem value="DETAIL">Detail Shot</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const mainVariantData = activeVariants.find(v => v.key === mainVariantKey);
  const mainColorIdForPreview = mainVariantData?.colorId || '';
  const mainColorImages = images.filter(img => img.colorId === mainColorIdForPreview);
  const previewCoverImage = mainColorImages.length > 0 ? mainColorImages[0].url : (images.length > 0 ? images[0].url : null);
  const previewPrice = variantMatrix[mainVariantKey]?.price || '0';

  return (
    <div className="w-full max-w-[1600px] mx-auto flex flex-col gap-8 pb-24 px-4 sm:px-6 lg:px-8">

      {/* --- HEADER --- */}
      <div className="flex items-center justify-between sticky top-16 bg-white/90 backdrop-blur-md z-30 py-4 border-b border-gray-100">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <Link href="/admin/products" className="flex items-center text-sm text-gray-500 hover:text-black mb-1"><ChevronLeft className="w-4 h-4 mr-1" /> Kembali</Link>
            {/* Indikator Auto-Save */}
            {formData.name && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest mb-1 flex items-center gap-1"><RefreshCcw className="w-3 h-3"/> Draft Tersimpan</span>}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Add New Product</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" type="button" onClick={handleClearDraft} className="text-red-500 hover:text-red-600 hover:bg-red-50">Reset Form</Button>
          <Button variant="outline" type="button" onClick={() => router.push('/admin/products')}>Batal</Button>
          <Button onClick={handleSubmit} disabled={isLoading || isUploading} className="bg-gray-900 hover:bg-black">{isLoading ? 'Menyimpan...' : 'Simpan Produk'}</Button>
        </div>
      </div>

      {error && <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 items-start">

        {/* KOLOM KIRI (INFO & MATRIX) */}
        <div className="xl:col-span-3 flex flex-col gap-8">
          <Card className="shadow-sm border-gray-200">
            <CardHeader><CardTitle className="text-lg">Info Umum</CardTitle></CardHeader><Separator />
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2"><Label>Nama Produk</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
                <div className="space-y-2">
                  <Label>Kategori</Label>
                  <Select value={formData.categoryId} onValueChange={(val) => setFormData({ ...formData, categoryId: val })}>
                    <SelectTrigger><SelectValue placeholder="Pilih Kategori" /></SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.parent ? <span className="text-gray-400 mr-1">{cat.parent.name} &gt;</span> : null}<span className={cat.parent ? "font-normal" : "font-bold"}>{cat.name}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2"><Label>Deskripsi</Label><Textarea rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-200">
            <CardHeader><CardTitle className="text-lg">Varian & Harga Spesifik</CardTitle></CardHeader><Separator />
            <CardContent className="pt-6 space-y-8">
              <div className="space-y-3"><Label className="text-xs uppercase">Pilih Warna</Label>
                <div className="flex flex-wrap gap-3">
                  {masterColors.map(color => (
                    <div key={color.id} className={cn("flex items-center space-x-2 border px-3 py-2 rounded-md", selectedColorIds.includes(color.id) && "bg-gray-50 border-gray-900")}>
                      <Checkbox id={`col-${color.id}`} checked={selectedColorIds.includes(color.id)} onCheckedChange={() => toggleColor(color.id)} />
                      <label htmlFor={`col-${color.id}`} className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                        <div className="w-4 h-4 rounded-full border" style={{ background: color.hexCodes.length === 1 ? color.hexCodes[0] : `linear-gradient(to right, ${color.hexCodes[0]} 50%, ${color.hexCodes[1] || 'transparent'} 50%)` }} />
                        {color.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3"><Label className="text-xs uppercase">Pilih Ukuran</Label>
                <div className="flex flex-wrap gap-3">
                  {masterSizes.map(size => (
                    <div key={size.id} className={cn("flex items-center space-x-2 border px-3 py-2 rounded-md", selectedSizeIds.includes(size.id) && "bg-gray-50 border-gray-900")}>
                      <Checkbox id={`sz-${size.id}`} checked={selectedSizeIds.includes(size.id)} onCheckedChange={() => toggleSize(size.id)} />
                      <label htmlFor={`sz-${size.id}`} className="text-sm font-medium cursor-pointer">{size.name}</label>
                    </div>
                  ))}
                </div>
              </div>

              {activeVariants.length > 0 && (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="w-10"></TableHead>
                        <TableHead className="text-xs uppercase text-center w-24">Utama <Star className="w-3 h-3 inline-block ml-1 text-yellow-500" /></TableHead>
                        <TableHead className="text-xs uppercase">Kombinasi</TableHead>
                        <TableHead className="text-xs uppercase w-32">Stok</TableHead>
                        <TableHead className="text-xs uppercase w-48">Harga (IDR)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeVariants.map((variant, index) => {
                        const color = masterColors.find(c => c.id === variant.colorId); const size = masterSizes.find(s => s.id === variant.sizeId);
                        const isMain = variant.key === mainVariantKey;
                        return (
                          <TableRow key={variant.key} draggable onDragStart={() => { dragVariantIdx.current = index }} onDragEnter={() => { dragOverVariantIdx.current = index }} onDragEnd={handleVariantDragEnd} onDragOver={(e) => e.preventDefault()} className={cn("bg-white hover:bg-gray-50", isMain && "bg-yellow-50/30 hover:bg-yellow-50/50")}>
                            <TableCell className="cursor-grab text-gray-300"><GripVertical className="w-4 h-4" /></TableCell>
                            <TableCell className="text-center">
                              <input
                                type="radio"
                                name="mainVariant"
                                checked={isMain}
                                onChange={() => setMainVariantKey(variant.key)}
                                className="w-4 h-4 accent-gray-900 cursor-pointer"
                              />
                            </TableCell>
                            <TableCell><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full border" style={{ background: color?.hexCodes.length === 1 ? color.hexCodes[0] : `linear-gradient(to right, ${color?.hexCodes[0]} 50%, ${color?.hexCodes[1]} 50%)` }} /><span className={cn("text-sm", isMain ? "font-bold text-gray-900" : "font-semibold")}>{color?.name}</span><span className="text-gray-300">/</span><span className={cn("text-sm", isMain ? "font-black" : "font-bold")}>{size?.name}</span></div></TableCell>
                            <TableCell><Input type="number" placeholder="0" className="h-8 font-mono text-xs" value={variantMatrix[variant.key]?.stock || ''} onChange={(e) => handleMatrixChange(variant.key, 'stock', e.target.value)} /></TableCell>
                            <TableCell><div className="relative"><span className="absolute left-2.5 top-2 text-[10px] text-gray-400 font-bold">Rp</span><Input type="number" placeholder="0" className={cn("pl-7 h-8 font-mono text-xs", isMain && "border-gray-400 font-bold")} value={variantMatrix[variant.key]?.price || ''} onChange={(e) => handleMatrixChange(variant.key, 'price', e.target.value)} /></div></TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* KOLOM KANAN (PREVIEW & STATUS) */}
        <div className="flex flex-col gap-8 sticky top-36">
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="pb-4"><CardTitle className="text-sm">Status Visibilitas</CardTitle></CardHeader>
            <CardContent>
              <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="PUBLISHED">Published</SelectItem><SelectItem value="DRAFT">Draft (Hidden)</SelectItem></SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-gray-200 overflow-hidden">
            <CardHeader className="bg-gray-900 text-white py-3 px-4"><CardTitle className="text-xs uppercase flex items-center gap-2"><Eye className="w-3.5 h-3.5" /> Live Preview</CardTitle></CardHeader>
            <CardContent className="p-0 bg-gray-50 flex justify-center py-6">
              <div className="w-[85%] bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <div className="w-full aspect-[3/4] relative bg-gray-100">
                  {previewCoverImage ? <Image src={previewCoverImage} alt="Preview" fill className="object-cover" /> : <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300"><ImageIcon className="w-8 h-8 mb-2 opacity-50" /><span className="text-[10px] uppercase font-bold tracking-widest">No Image</span></div>}
                  {formData.status === 'DRAFT' && <div className="absolute top-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">DRAFT</div>}
                </div>
                <div className="p-3">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-1 truncate">{categories.find(c => c.id === formData.categoryId)?.name || 'CATEGORY'}</p>
                  <h3 className="text-sm font-bold text-gray-900 leading-tight mb-2 truncate">{formData.name || 'Nama Produk'}</h3>
                  <p className="text-xs font-mono font-black text-gray-900 mb-3">Rp {parseInt(previewPrice).toLocaleString('id-ID')}</p>
                  {selectedColorIds.length > 0 && (
                    <div className="flex gap-1.5">{selectedColorIds.map(cId => {
                      const color = masterColors.find(c => c.id === cId);
                      const isMainColor = cId === mainColorIdForPreview;
                      return <div key={cId} className={cn("w-3.5 h-3.5 rounded-full border transition-all", isMainColor ? "ring-2 ring-offset-1 ring-gray-900 border-gray-300" : "border-gray-200 opacity-60")} style={{ background: color?.hexCodes.length === 1 ? color.hexCodes[0] : `linear-gradient(to right, ${color?.hexCodes[0]} 50%, ${color?.hexCodes[1]} 50%)` }} />;
                    })}</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* MEDIA KANBAN BOARD */}
        <Card className="col-span-full border-gray-200 shadow-sm mt-4 overflow-hidden bg-gray-50/30">
          <CardHeader className="bg-white border-b border-gray-200 flex flex-row items-center justify-between py-5">
            <div>
              <CardTitle className="text-xl flex items-center gap-2"><ImageIcon className="w-5 h-5 text-gray-400" /> Pengelola Media (Kanban)</CardTitle>
              <CardDescription className="mt-1">Unggah gambar dan <b>Drag & Drop</b> antar kolom untuk mengelompokkannya berdasarkan warna.</CardDescription>
            </div>
            <Button type="button" onClick={() => !isUploading && fileInputRef.current?.click()} className="bg-blue-600 hover:bg-blue-700 text-white">
              <UploadCloud className="w-4 h-4 mr-2" /> {isUploading ? 'Mengunggah...' : 'Unggah Foto Baru'}
            </Button>
            <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex gap-6 overflow-x-auto pb-4 snap-x">
              {renderMediaColumn('', 'Belum Dialokasikan', null)}
              {selectedColorIds.map(cId => {
                const color = masterColors.find(c => c.id === cId);
                return color ? renderMediaColumn(cId, color.name, color.hexCodes) : null;
              })}
            </div>
          </CardContent>
        </Card>

      </div>

      {/* FULLSCREEN LIGHTBOX MODAL */}
      {previewImage && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setPreviewImage(null)}>
          <button className="absolute top-6 right-6 text-white hover:text-red-500 transition-colors bg-white/10 p-2 rounded-full" onClick={() => setPreviewImage(null)}><X className="w-6 h-6" /></button>
          <div className="relative w-full max-w-4xl h-[90vh]" onClick={(e) => e.stopPropagation()}><Image src={previewImage} alt="Fullscreen Preview" fill className="object-contain" /></div>
        </div>
      )}

    </div>
  );
}