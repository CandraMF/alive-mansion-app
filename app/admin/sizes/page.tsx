'use client';

import { useState, useEffect } from 'react';
import { Size } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function MasterSizePage() {
  const [sizes, setSizes] = useState<Size[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [sortOrder, setSortOrder] = useState('0');

  // State penanda mode Edit (Jika null = Mode Tambah, Jika ada ID = Mode Edit)
  const [editId, setEditId] = useState<string | null>(null);

  const fetchSizes = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/sizes');
      if (res.ok) {
        const data = await res.json();
        setSizes(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSizes();
  }, []);

  // --- FUNGSI RESET FORM ---
  const resetForm = () => {
    setName('');
    setSortOrder('0');
    setEditId(null);
  };

  // --- FUNGSI MASUK MODE EDIT ---
  const handleEditClick = (size: Size) => {
    setName(size.name);
    setSortOrder(size.sortOrder.toString());
    setEditId(size.id);
  };

  // --- FUNGSI SAVE (POST / PUT) ---
  const handleSave = async () => {
    if (!name.trim()) return alert("Size name is required!");
    setIsSaving(true);

    try {
      // Jika editId ada, gunakan method PUT, jika tidak gunakan POST
      const url = editId ? `/api/sizes/${editId}` : '/api/sizes';
      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, sortOrder }),
      });

      if (res.ok) {
        resetForm();
        fetchSizes();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save size");
      }
    } catch (error) {
      alert("Error saving size.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- FUNGSI DELETE ---
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this size?")) return;
    try {
      const res = await fetch(`/api/sizes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        // Jika sedang mengedit data yang dihapus, reset formnya
        if (editId === id) resetForm();
        fetchSizes();
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (error) {
      alert("Error deleting size.");
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">

      <div>
        <h1 className="text-2xl font-black uppercase tracking-tight mb-1">Master Sizes</h1>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">
          Manage product dimensions and ordering
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* KIRI: TABEL */}
        <Card className="lg:col-span-2 shadow-sm border-gray-200">
          <CardHeader className="border-b border-gray-100 pb-4">
            <CardTitle className="text-xs font-bold uppercase tracking-widest">Active Sizes</CardTitle>
          </CardHeader>
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                <TableHead className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Size Name</TableHead>
                <TableHead className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Sort Order</TableHead>
                <TableHead className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={3} className="text-center py-10 text-xs text-gray-500 uppercase">Loading...</TableCell></TableRow>
              ) : sizes.length === 0 ? (
                <TableRow><TableCell colSpan={3} className="text-center py-10 text-xs text-gray-500 uppercase">No sizes found.</TableCell></TableRow>
              ) : (
                sizes.map((size) => (
                  <TableRow key={size.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="font-bold text-xs uppercase tracking-widest">{size.name}</TableCell>
                    <TableCell className="text-xs text-gray-500 font-mono">{size.sortOrder}</TableCell>
                    <TableCell className="text-right flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(size)}
                        className="text-[10px] uppercase tracking-widest text-blue-500 hover:text-blue-700"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(size.id)}
                        className="text-[10px] uppercase tracking-widest text-red-500 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        {/* KANAN: FORM TAMBAH/EDIT */}
        <Card className="shadow-sm border-gray-200 sticky top-24">
          <CardHeader className="border-b border-gray-100 pb-4">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-black">
              {editId ? 'Edit Size' : 'Add New Size'}
            </CardTitle>
            {editId && (
              <CardDescription className="text-[10px] uppercase tracking-widest mt-1 text-blue-600 font-bold">
                Editing mode active
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="pt-6 flex flex-col gap-6">

            <div className="flex flex-col gap-3">
              <Label className="text-[10px] font-bold uppercase tracking-widest">Size Name</Label>
              <Input
                placeholder="e.g. S, M, L, OS"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-xs focus-visible:ring-black rounded-sm"
              />
            </div>

            <div className="flex flex-col gap-3">
              <Label className="text-[10px] font-bold uppercase tracking-widest">Sort Order (Number)</Label>
              <Input
                type="number"
                placeholder="e.g. 1"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="text-xs focus-visible:ring-black rounded-sm"
              />
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <Button
                onClick={handleSave}
                disabled={isSaving || !name.trim()}
                className="w-full text-[10px] font-bold uppercase tracking-[0.2em] rounded-sm py-6 bg-black hover:bg-gray-800 disabled:opacity-50"
              >
                {isSaving ? 'SAVING...' : (editId ? 'UPDATE SIZE' : 'SAVE SIZE')}
              </Button>

              {/* Tombol Cancel hanya muncul jika sedang dalam mode Edit */}
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