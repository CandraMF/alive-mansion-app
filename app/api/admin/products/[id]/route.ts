import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 1. GET: Ambil data spesifik
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id: id },
      include: {
        variants: { orderBy: { size: 'asc' } },
        images: { orderBy: { position: 'asc' } }
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
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, price, status, sizes, imageUrls } = body;

    // A. Update Info Dasar
    await prisma.product.update({
      where: { id: id },
      data: {
        name,
        description,
        price: parseInt(price, 10),
        status,
      }
    });

    // B. Update Varian (Disesuaikan dengan kolom 'stock')
    for (const sizeObj of sizes) {
      const existingVariant = await prisma.variant.findFirst({
        where: { productId: id, size: sizeObj.size }
      });

      const stockValue = typeof sizeObj.stock !== 'undefined'
        ? parseInt(sizeObj.stock, 10)
        : (sizeObj.isAvailable ? 1 : 0);

      if (existingVariant) {
        await prisma.variant.update({
          where: { id: existingVariant.id },
          data: { stock: stockValue }
        });
      } else {
        await prisma.variant.create({
          data: {
            productId: id,
            size: sizeObj.size,
            stock: stockValue,
            // TAMBAHKAN KOLOM COLOR DI BAWAH INI
            color: sizeObj.color || "Black",
            sku: `${name.replace(/\s+/g, '-').toUpperCase()}-${sizeObj.size}`
          }
        });
      }
    }

    // C. Update Gambar ke Database
    await prisma.productImage.deleteMany({
      where: { productId: id }
    });

    if (imageUrls && imageUrls.length > 0) {
      await prisma.productImage.createMany({
        data: imageUrls.map((url: string, index: number) => ({
          productId: id,
          url: url,
          position: index
        }))
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

// 3. DELETE: Hapus produk
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.product.delete({
      where: { id: id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}