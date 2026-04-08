'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function NewProductPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State Formulir Dasar
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    status: 'PUBLISHED',
  });

  const [sizes, setSizes] = useState([
    { size: 'S', isAvailable: true },
    { size: 'M', isAvailable: true },
    { size: 'L', isAvailable: true },
    { size: 'XL', isAvailable: true },
  ]);

  // State untuk Gambar (Menyimpan URL dari Vercel Blob)
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Fungsi Upload Gambar ke Vercel Blob
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Batasi maksimal 4 gambar
    if (images.length >= 4) {
      alert("Maximum 4 images allowed.");
      return;
    }

    setIsUploading(true);
    
    try {
      // Panggil API upload yang baru saja kita buat
      const response = await fetch(`/api/admin/upload?filename=${file.name}`, {
        method: 'POST',
        body: file,
      });

      const newBlob = await response.json();

      if (!response.ok) throw new Error(newBlob.error || 'Upload failed');

      // Masukkan URL gambar yang sukses di-upload ke dalam state array images
      setImages((prev) => [...prev, newBlob.url]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUploading(false);
      // Reset input file agar bisa memilih file yang sama lagi jika perlu
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
  };

  // Fungsi Submit Utama (Menyimpan Teks + URL Gambar ke Database)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (images.length === 0) {
      setError("Please upload at least 1 image.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          sizes,
          imageUrls: images, // Kirim array URL gambar ke API Database
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Something went wrong');

      router.push('/admin/products');
      router.refresh();

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-20">
      <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
        <Link href="/admin/products" className="text-gray-400 hover:text-black">&lt; Back</Link>
        <h1 className="text-2xl font-black uppercase tracking-tight">Add New Product</h1>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md text-sm font-medium border border-red-200">
          Error: {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        
        {/* BAGIAN 1: INFO UMUM (Tetap sama) */}
        <div className="bg-white p-6 md:p-8 border border-gray-200 shadow-sm rounded-md flex flex-col gap-6">
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2 border-b border-gray-100 pb-2">General Information</h2>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-widest">Product Name *</label>
            <input required type="text" className="border border-gray-300 p-3 text-sm focus:border-black focus:outline-none" placeholder="e.g. Work Jacket 2.0" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}/>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-widest">Description</label>
            <textarea rows={4} className="border border-gray-300 p-3 text-sm focus:border-black focus:outline-none resize-y" placeholder="Product details..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}/>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-widest">Price (IDR) *</label>
            <input required type="number" min="0" className="border border-gray-300 p-3 text-sm focus:border-black focus:outline-none" placeholder="850000" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})}/>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-widest">Status</label>
            <select className="border border-gray-300 p-3 text-sm focus:border-black focus:outline-none bg-white" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
              <option value="PUBLISHED">Published (Visible)</option>
              <option value="DRAFT">Draft (Hidden)</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>

        {/* BAGIAN BARU: UPLOAD GAMBAR */}
        <div className="bg-white p-6 md:p-8 border border-gray-200 shadow-sm rounded-md flex flex-col gap-6">
          <div className="flex justify-between items-end border-b border-gray-100 pb-2 mb-2">
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-500">Product Images (Max 4)</h2>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{images.length} / 4 Uploaded</span>
          </div>
          
          {/* Grid Preview Gambar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((url, idx) => (
              <div key={idx} className="aspect-square relative border border-gray-200 bg-gray-50 group overflow-hidden rounded-sm">
                <Image src={url} alt={`Preview ${idx + 1}`} fill className="object-cover" />
                <button 
                  type="button" 
                  onClick={() => removeImage(idx)}
                  className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  X
                </button>
                {/* Badge Gambar Utama */}
                {idx === 0 && <span className="absolute bottom-2 left-2 bg-black text-white text-[8px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm">Main</span>}
              </div>
            ))}
            
            {/* Tombol Upload (Hanya muncul jika gambar < 4) */}
            {images.length < 4 && (
              <div 
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className={`aspect-square border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 rounded-sm transition-colors ${isUploading ? 'bg-gray-100 cursor-wait' : 'hover:bg-gray-50 hover:border-black cursor-pointer'}`}
              >
                {isUploading ? (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Uploading...</span>
                ) : (
                  <>
                    <span className="text-2xl text-gray-400">+</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Add Image</span>
                  </>
                )}
                <input 
                  type="file" 
                  accept="image/jpeg, image/png, image/webp" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                />
              </div>
            )}
          </div>
        </div>

        {/* BAGIAN 3: VARIAN (Sama seperti sebelumnya) */}
        <div className="bg-white p-6 md:p-8 border border-gray-200 shadow-sm rounded-md flex flex-col gap-6">
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2 border-b border-gray-100 pb-2">Sizes & Availability</h2>
          <div className="grid grid-cols-2 gap-4">
            {sizes.map((sizeObj, index) => (
              <div key={sizeObj.size} className="flex items-center justify-between border border-gray-200 p-4 rounded-sm">
                <span className="font-bold text-sm uppercase">{sizeObj.size}</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${sizeObj.isAvailable ? 'text-green-600' : 'text-red-500'}`}>{sizeObj.isAvailable ? 'Available' : 'Sold Out'}</span>
                  <input type="checkbox" checked={sizeObj.isAvailable} onChange={(e) => {
                    const newSizes = [...sizes];
                    newSizes[index].isAvailable = e.target.checked;
                    setSizes(newSizes);
                  }} className="w-4 h-4 accent-black cursor-pointer"/>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-4">
          <button type="button" onClick={() => router.push('/admin/products')} className="px-6 py-3 border border-gray-300 text-xs font-bold uppercase tracking-widest hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={isLoading} className="bg-black text-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 disabled:bg-gray-400">{isLoading ? 'Saving...' : 'Save Product'}</button>
        </div>

      </form>
    </div>
  );
}