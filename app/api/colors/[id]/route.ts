// app/api/colors/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    await prisma.color.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Color deleted successfully" });
  } catch (error: any) {
    // P2003 adalah kode error Prisma jika warna ini sedang dipakai oleh suatu baju (Restricted)
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: "Cannot delete this color because it is currently used by a product variant." },
        { status: 400 }
      );
    }

    console.error("DELETE Color Error:", error);
    return NextResponse.json({ error: "Failed to delete color" }, { status: 500 });
  }
}