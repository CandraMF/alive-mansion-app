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
        variants: true,
        images: {
          orderBy: { position: 'asc' }
        }
      }
    });

    if (!product) {
      return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product detail:', error);
    return NextResponse.json({ error: 'Gagal mengambil detail produk' }, { status: 500 });
  }
}


export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; 
    const body = await request.json();
    const { name, description, status, categoryId, variants, images } = body;

    if (!name || !variants || variants.length === 0 || !images || images.length === 0) {
      return NextResponse.json(
        { error: 'Nama, varian (stok & harga), dan gambar wajib diisi.' },
        { status: 400 }
      );
    }

    const updatedProduct = await prisma.$transaction(async (tx) => {

      
      const prod = await tx.product.update({
        where: { id },
        data: {
          name,
          description,
          status: status || 'PUBLISHED',
          categoryId: categoryId || null,
        }
      });

      
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

      
      await tx.variant.deleteMany({ where: { productId: id } });
      await tx.variant.createMany({
        data: variants.map((v: any) => {
          const colorCode = v.colorId ? v.colorId.slice(-5).toUpperCase() : 'NOCL';
          const sizeCode = v.sizeId ? v.sizeId.slice(-5).toUpperCase() : 'NOSZ';
          return {
            productId: id,
            colorId: v.colorId,
            sizeId: v.sizeId,
            stock: parseInt(v.stock, 10) || 0,
            price: parseInt(v.price, 10) || 0,
            isMain: v.isMain || false,
            sku: `${name.replace(/\s+/g, '-').toUpperCase()}-${colorCode}-${sizeCode}`
          };
        })
      });

      return prod;
    });

    return NextResponse.json({ success: true, data: updatedProduct }, { status: 200 });

  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Gagal memperbarui produk' }, { status: 500 });
  }
}


export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; 
    await prisma.product.delete({
      where: { id }
    });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Gagal menghapus produk' }, { status: 500 });
  }
}