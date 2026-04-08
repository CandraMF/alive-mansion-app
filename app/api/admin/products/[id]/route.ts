import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 1. GET: Ambil data spesifik
export async function GET(
  request: Request, 
  { params }: { params: Promise<{ id: string }> } // Ubah jadi Promise
) {
  try {
    const { id } = await params; // Wajib di-await di sini

    const product = await prisma.product.findUnique({
      where: { id: id },
      include: {
        variants: true,
        images: {
          orderBy: { position: 'asc' }
        }
      }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

// 2. PUT: Update data produk
export async function PUT(
  request: Request, 
  { params }: { params: Promise<{ id: string }> } // Ubah jadi Promise
) {
  try {
    const { id } = await params; // Wajib di-await
    const body = await request.json();
    const { name, description, price, status, sizes, imageUrls } = body;

    // Update Info Dasar
    await prisma.product.update({
      where: { id: id },
      data: {
        name,
        description,
        price: parseInt(price, 10),
        status,
      }
    });

    // Logic varian dan gambar tetap sama seperti sebelumnya...
    // (Gunakan variabel 'id' hasil await tadi)
    
    // ... (kode sisa PUT Anda)

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

// 3. DELETE: Hapus produk
export async function DELETE(
  request: Request, 
  { params }: { params: Promise<{ id: string }> } // Ubah jadi Promise
) {
  try {
    const { id } = await params; // Wajib di-await

    await prisma.product.delete({
      where: { id: id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}