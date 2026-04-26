import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Fungsi bantuan untuk membuat slug dari nama kategori
const slugify = (text: string) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');

// 🚀 1. EDIT KATEGORI (PUT)
export async function PUT(
  request: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    
    const body = await request.json();
    const { name, parentId } = body;

    if (!name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    // 🛡️ Proteksi: Kategori tidak boleh menjadi parent bagi dirinya sendiri
    if (parentId === id) {
      return NextResponse.json({ error: "A category cannot be its own parent" }, { status: 400 });
    }

    const baseSlug = slugify(name);
    let finalSlug = baseSlug;
    let counter = 1;

    // 🛡️ Proteksi: Pastikan slug tetap unik saat diupdate
    while (true) {
      const existing = await prisma.category.findFirst({
        where: { slug: finalSlug, NOT: { id } }
      });
      if (!existing) break;
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug: finalSlug,
        parentId: parentId || null
      }
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error("PUT Category Error:", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

// 🚀 2. HAPUS KATEGORI (DELETE)
export async function DELETE(
  request: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    // 🛡️ Lapis 1: Cek apakah kategori ini punya anak (sub-kategori)
    const hasChildren = await prisma.category.count({
      where: { parentId: id }
    });

    if (hasChildren > 0) {
      return NextResponse.json(
        { error: "Gagal: Kategori ini memiliki sub-kategori. Hapus atau pindahkan sub-kategorinya terlebih dahulu." }, 
        { status: 400 }
      );
    }

    // Eksekusi Hapus
    await prisma.category.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "Category deleted successfully" });
  } catch (error: any) {
    // 🛡️ Lapis 2: Menangkap error P2003 (Kategori sedang dipakai oleh Produk)
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: "Gagal: Kategori ini sedang digunakan oleh produk dan tidak bisa dihapus." }, 
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}