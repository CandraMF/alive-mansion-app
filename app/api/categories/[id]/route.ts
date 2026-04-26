import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: Request, 
  { params }: { params: Promise<{ id: string }> } // 🚀 FIX 1: Ubah jadi Promise
) {
  const resolvedParams = await params; // 🚀 FIX 2: Await params-nya
  const id = resolvedParams.id;

  try {

    await prisma.category.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error: any) {
    // Jika kategori ini punya anak (sub-kategori) atau dipakai di produk
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: "Cannot delete this category. Please remove its sub-categories or products first." },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}