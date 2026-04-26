import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        variants: {
          where: { isArchived: false }, // 🚀 JANGAN tampilkan varian yang sudah di-archive
          include: { color: true, size: true }
        },
        images: {
          orderBy: { position: 'asc' }
        }
      }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product detail:', error);
    return NextResponse.json({ error: 'Failed to fetch product details.' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, status, categoryId, weight, variants, images } = body;

    if (!name || !variants || variants.length === 0 || !images || images.length === 0) {
      return NextResponse.json(
        { error: 'Name, variants (stock & price), and images are required.' },
        { status: 400 }
      );
    }

    const updatedProduct = await prisma.$transaction(async (tx) => {
      // 1. Update Product Induk
      const prod = await tx.product.update({
        where: { id },
        data: {
          name,
          description,
          weight: parseInt(weight, 10) || 500,
          status: status || 'PUBLISHED',
          categoryId: categoryId || null,
        }
      });

      // 2. Gambar aman untuk di-Hard Delete lalu Create ulang karena tidak terikat nota pesanan
      await tx.productImage.deleteMany({ where: { productId: id } });
      await tx.productImage.createMany({
        data: images.map((img: any) => ({
          productId: id,
          url: img.url,
          colorId: img.colorId || null,
          category: img.category || 'MAIN',
          position: img.position || 0
        }))
      });

      // 3. 🚀 UPSERT & ARCHIVE VARIANTS (ANTI MENGHILANGKAN DATA NOTA)
      // Ambil semua ID varian yang dikirim dari Frontend (yang masih dipertahankan Admin)
      const incomingVariantIds = variants.map((v: any) => v.id).filter(Boolean);

      // A. Archive varian lama yang TIDAK ADA di list kiriman Admin
      await tx.variant.updateMany({
        where: {
          productId: id,
          id: { notIn: incomingVariantIds }
        },
        data: { isArchived: true } // Soft delete
      });

      // B. Update varian yang sudah ada, atau Buat yang baru
      for (const v of variants) {
        const colorCode = v.colorId ? v.colorId.slice(-5).toUpperCase() : 'NOCL';
        const sizeCode = v.sizeId ? v.sizeId.slice(-5).toUpperCase() : 'NOSZ';
        const sku = `${name.replace(/\s+/g, '-').toUpperCase()}-${colorCode}-${sizeCode}`;

        if (v.id) {
          // Jika ID ada, update variannya
          await tx.variant.update({
            where: { id: v.id },
            data: {
              colorId: v.colorId,
              sizeId: v.sizeId,
              stock: parseInt(v.stock, 10) || 0,
              price: parseInt(v.price, 10) || 0,
              isMain: v.isMain || false,
              sku: sku,
              isArchived: false // Pastikan tidak ter-archive jika Admin memakainya lagi
            }
          });
        } else {
          // Jika tidak ada ID (Varian Baru Ditambahkan Admin), buat baru
          await tx.variant.create({
            data: {
              productId: id,
              colorId: v.colorId,
              sizeId: v.sizeId,
              stock: parseInt(v.stock, 10) || 0,
              price: parseInt(v.price, 10) || 0,
              isMain: v.isMain || false,
              sku: sku
            }
          });
        }
      }

      return prod;
    });

    return NextResponse.json({ success: true, data: updatedProduct, message: 'Product updated successfully.' }, { status: 200 });

  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product.' }, { status: 500 });
  }
}

// 🚀 SOFT DELETE PRODUCT
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Jangan hapus, cukup set status jadi ARCHIVED
    await prisma.product.update({
      where: { id },
      data: { status: 'ARCHIVED' }
    });

    return NextResponse.json({ success: true, message: 'Product archived successfully.' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to archive product.' }, { status: 500 });
  }
}