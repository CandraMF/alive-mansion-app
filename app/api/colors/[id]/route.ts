import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, hexCodes } = body;

    if (!name || !hexCodes || hexCodes.length === 0) {
      return NextResponse.json({ error: "Name and at least one Hex Code are required" }, { status: 400 });
    }

    const updatedColor = await prisma.color.update({
      where: { id },
      data: { name, hexCodes }
    });
    
    return NextResponse.json(updatedColor);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update color." }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.color.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    // 🚀 P2003 Foreign Key Constraint
    if (error.code === 'P2003') {
      return NextResponse.json({ error: "Gagal: Warna ini sedang digunakan oleh produk dan tidak bisa dihapus." }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to delete color." }, { status: 500 });
  }
}