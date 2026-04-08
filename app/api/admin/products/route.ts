import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Tangkap imageUrls dari frontend
    const { name, description, price, status, sizes, imageUrls } = body;

    if (!name || !price || !sizes || sizes.length === 0 || !imageUrls || imageUrls.length === 0) {
      return NextResponse.json(
        { error: 'Name, price, sizes, and at least 1 image are required.' },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseInt(price, 10), 
        status: status || 'PUBLISHED',
        
        // Simpan Varian Ukuran
        variants: {
          create: sizes.map((sizeObj: any) => ({
            size: sizeObj.size,
            isAvailable: sizeObj.isAvailable,
            sku: `${name.replace(/\s+/g, '-').toUpperCase()}-${sizeObj.size}`
          }))
        },

        // Simpan Galeri Gambar
        images: {
          create: imageUrls.map((url: string, index: number) => ({
            url: url,
            position: index // Gambar pertama akan jadi position 0 (Main Image)
          }))
        }
      },
      include: {
        variants: true,
        images: true // Kembalikan data gambar untuk memastikan sukses
      }
    });

    return NextResponse.json({ success: true, data: product }, { status: 201 });

  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product. Check server logs.' },
      { status: 500 }
    );
  }
}