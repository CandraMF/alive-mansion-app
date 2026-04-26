'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import { Category } from '@/types';

export default function MasterCategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState<string>('none');
  
  // 🚀 Tambahan State Edit
  const [editId, setEditId] = useState<string | null>(null);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // 🚀 Fungsi Reset Form
  const resetForm = () => {
    setName('');
    setParentId('none');
    setEditId(null);
  };

  // 🚀 Masuk Mode Edit
  const handleEditClick = (cat: any) => {
    setName(cat.name);
    setParentId(cat.parentId || 'none');
    setEditId(cat.id);
  };

  // 🚀 Handle Save (Bisa POST atau PUT)
  const handleSave = async () => {
    if (!name.trim()) return alert("Name is required!");
    setIsSaving(true);
    try {
      const url = editId ? `/api/admin/categories/${editId}` : '/api/admin/categories';
      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          parentId: parentId === 'none' ? null : parentId
        }),
      });

      if (res.ok) {
        resetForm();
        fetchCategories();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save category");
      }
    } catch (error) {
      alert("Error saving category.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        if (editId === id) resetForm();
        fetchCategories();
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (error) {
      alert("Error deleting category.");
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-black uppercase tracking-tight mb-1">Master Categories</h1>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">
          Manage product categories and sub-categories
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* KIRI: TABEL */}
        <Card className="lg:col-span-2 shadow-sm border-gray-200">
          <CardHeader className="border-b border-gray-100 pb-4">
            <CardTitle className="text-xs font-bold uppercase tracking-widest">Active Categories</CardTitle>
          </CardHeader>
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                <TableHead className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Name</TableHead>
                <TableHead className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Slug</TableHead>
                <TableHead className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Parent</TableHead>
                <TableHead className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-10 text-xs text-gray-500 uppercase">Loading...</TableCell></TableRow>
              ) : categories.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-10 text-xs text-gray-500 uppercase">No categories found.</TableCell></TableRow>
              ) : (
                categories.map((cat: any) => (
                  <TableRow key={cat.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="font-bold text-xs uppercase tracking-widest">{cat.name}</TableCell>
                    <TableCell className="text-[10px] text-gray-500 font-mono">{cat.slug}</TableCell>
                    <TableCell>
                      {cat.parent ? (
                        <Badge variant="secondary" className="text-[9px] uppercase tracking-widest">{cat.parent.name}</Badge>
                      ) : (
                        <span className="text-[10px] text-gray-400 italic">None (Top Level)</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditClick(cat)} className="text-[10px] uppercase tracking-widest text-blue-500 hover:text-blue-700">Edit</Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(cat.id)} className="text-[10px] uppercase tracking-widest text-red-500 hover:text-red-700">Delete</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        {/* KANAN: FORM */}
        <Card className="shadow-sm border-gray-200 sticky top-24">
          <CardHeader className="border-b border-gray-100 pb-4">
            <CardTitle className="text-xs font-bold uppercase tracking-widest">
              {editId ? 'Edit Category' : 'Add Category'}
            </CardTitle>
            {editId && (
              <CardDescription className="text-[10px] uppercase tracking-widest mt-1 text-blue-600 font-bold">
                Editing mode active
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="pt-6 flex flex-col gap-6">

            <div className="flex flex-col gap-3">
              <Label className="text-[10px] font-bold uppercase tracking-widest">Category Name</Label>
              <Input
                placeholder="e.g. Outerwear"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-xs focus-visible:ring-black rounded-sm"
              />
            </div>

            <div className="flex flex-col gap-3">
              <Label className="text-[10px] font-bold uppercase tracking-widest">Parent Category (Optional)</Label>
              <Select value={parentId} onValueChange={setParentId}>
                <SelectTrigger className="text-xs rounded-sm focus:ring-black">
                  <SelectValue placeholder="Select a parent category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="text-xs italic text-gray-500">None (Make it a Top-Level Category)</SelectItem>
                  {/* 🚀 Filter kategori agar tidak bisa memilih dirinya sendiri sebagai parent */}
                  {categories.filter(cat => cat.id !== editId).map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.id} className="text-xs uppercase tracking-widest">
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <Button
                onClick={handleSave}
                disabled={isSaving || !name.trim()}
                className="w-full text-[10px] font-bold uppercase tracking-[0.2em] rounded-sm py-6 bg-black hover:bg-gray-800 disabled:opacity-50"
              >
                {isSaving ? 'SAVING...' : (editId ? 'UPDATE CATEGORY' : 'SAVE CATEGORY')}
              </Button>

              {editId && (
                <Button
                  onClick={resetForm}
                  variant="outline"
                  className="w-full text-[10px] font-bold uppercase tracking-[0.2em] rounded-sm py-6 border-gray-200 hover:bg-gray-50"
                >
                  CANCEL EDIT
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}