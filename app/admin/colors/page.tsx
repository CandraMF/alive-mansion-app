'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Color } from '@/types';

export default function MasterColorPage() {
  const [colors, setColors] = useState<Color[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [hexCodes, setHexCodes] = useState<string[]>(['#000000']);
  
  // 🚀 Tambahan State Edit
  const [editId, setEditId] = useState<string | null>(null);

  const fetchColors = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/colors');
      if (res.ok) {
        const data = await res.json();
        setColors(data);
      }
    } catch (error) {
      console.error("Failed to fetch colors", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchColors();
  }, []);

  const addHexInput = () => setHexCodes([...hexCodes, '#ffffff']);
  const updateHex = (index: number, value: string) => {
    const newHexCodes = [...hexCodes];
    newHexCodes[index] = value;
    setHexCodes(newHexCodes);
  };
  const removeHex = (index: number) => {
    setHexCodes(hexCodes.filter((_, i) => i !== index));
  };

  // 🚀 Fungsi Reset Form
  const resetForm = () => {
    setName('');
    setHexCodes(['#000000']);
    setEditId(null);
  };

  // 🚀 Masuk Mode Edit
  const handleEditClick = (color: Color) => {
    setName(color.name);
    setHexCodes([...color.hexCodes]); // Clone array
    setEditId(color.id);
  };

  // 🚀 Handle Save (Bisa POST atau PUT)
  const handleSave = async () => {
    if (!name.trim()) return alert("Color name is required!");

    setIsSaving(true);
    try {
      const url = editId ? `/api/admin/colors/${editId}` : '/api/admin/colors';
      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, hexCodes }),
      });

      if (res.ok) {
        resetForm();
        fetchColors();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save color");
      }
    } catch (error) {
      alert("An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this color?")) return;

    try {
      const res = await fetch(`/api/admin/colors/${id}`, { method: 'DELETE' });
      if (res.ok) {
        if (editId === id) resetForm();
        fetchColors();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete color");
      }
    } catch (error) {
      alert("An error occurred while deleting.");
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-black uppercase tracking-tight mb-1">Master Colors</h1>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">
          Manage product colors and hex combinations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* KIRI: TABEL */}
        <Card className="lg:col-span-2 shadow-sm border-gray-200">
          <CardHeader className="border-b border-gray-100 pb-4">
            <CardTitle className="text-xs font-bold uppercase tracking-widest">Active Colors</CardTitle>
          </CardHeader>
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                <TableHead className="text-[10px] font-bold text-gray-500 uppercase tracking-widest w-20">Preview</TableHead>
                <TableHead className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Color Name</TableHead>
                <TableHead className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Hex Codes</TableHead>
                <TableHead className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10 text-xs text-gray-500 tracking-widest uppercase">
                    Loading colors...
                  </TableCell>
                </TableRow>
              ) : colors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10 text-xs text-gray-500 tracking-widest uppercase">
                    No colors found. Create one!
                  </TableCell>
                </TableRow>
              ) : (
                colors.map((color) => (
                  <TableRow key={color.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="py-4">
                      <div
                        className="w-6 h-6 rounded-full shadow-sm border border-gray-200"
                        style={{
                          background: color.hexCodes.length === 1
                            ? color.hexCodes[0]
                            : `linear-gradient(135deg, ${color.hexCodes[0]} 50%, ${color.hexCodes[1] || 'transparent'} 50%)`
                        }}
                      />
                    </TableCell>
                    <TableCell className="font-bold text-xs uppercase tracking-widest">{color.name}</TableCell>
                    <TableCell className="text-[10px] text-gray-500 font-mono">
                      {color.hexCodes.join(', ')}
                    </TableCell>
                    <TableCell className="text-right flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(color)}
                        className="text-[10px] uppercase tracking-widest text-blue-500 hover:text-blue-700"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(color.id)}
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
            <CardTitle className="text-xs font-bold uppercase tracking-widest">
              {editId ? 'Edit Color' : 'Add New Color'}
            </CardTitle>
            {editId && (
              <CardDescription className="text-[10px] uppercase tracking-widest mt-1 text-blue-600 font-bold">
                Editing mode active
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="pt-6 flex flex-col gap-6">

            <div className="flex flex-col gap-3">
              <Label htmlFor="colorName" className="text-[10px] font-bold uppercase tracking-widest">Color Name</Label>
              <Input
                id="colorName"
                placeholder="e.g. Black / White"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-xs focus-visible:ring-black rounded-sm"
              />
            </div>

            <div className="flex flex-col gap-3">
              <Label className="text-[10px] font-bold uppercase tracking-widest flex justify-between items-center">
                <span>Hex Codes</span>
                <button type="button" onClick={addHexInput} className="text-gray-400 hover:text-black transition-colors underline">
                  + Add Hex
                </button>
              </Label>

              <div className="flex flex-col gap-2">
                {hexCodes.map((hex, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="relative w-10 h-10 rounded-sm overflow-hidden border border-gray-200 shrink-0">
                      <input
                        type="color"
                        value={hex}
                        onChange={(e) => updateHex(index, e.target.value)}
                        className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                      />
                    </div>
                    <Input
                      value={hex.toUpperCase()}
                      onChange={(e) => updateHex(index, e.target.value)}
                      className="font-mono text-xs focus-visible:ring-black rounded-sm uppercase"
                    />
                    {hexCodes.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeHex(index)}
                        className="shrink-0 text-gray-400 hover:text-red-500"
                      >
                        &times;
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Preview:</span>
              <div
                className="w-8 h-8 rounded-full shadow-sm border border-gray-200"
                style={{
                  background: hexCodes.length === 1
                    ? hexCodes[0]
                    : `linear-gradient(135deg, ${hexCodes[0]} 50%, ${hexCodes[1] || 'transparent'} 50%)`
                }}
              />
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <Button
                onClick={handleSave}
                disabled={isSaving || !name.trim()}
                className="w-full text-[10px] font-bold uppercase tracking-[0.2em] rounded-sm py-6 bg-black hover:bg-gray-800 disabled:opacity-50"
              >
                {isSaving ? 'SAVING...' : (editId ? 'UPDATE COLOR' : 'SAVE COLOR')}
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