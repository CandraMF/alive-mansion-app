import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { name, sortOrder } = await request.json();

    const updatedSize = await prisma.size.update({
      where: { id },
      data: { name, sortOrder: parseInt(sortOrder) || 0 }
    });

    return NextResponse.json(updatedSize);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update size." }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.size.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    // 🚀 P2003 adalah kode error Prisma untuk Foreign Key Constraint Failed
    if (error.code === 'P2003') {
      return NextResponse.json({ error: "Gagal: Ukuran ini sedang digunakan oleh produk dan tidak bisa dihapus." }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to delete size." }, { status: 500 });
  }
}