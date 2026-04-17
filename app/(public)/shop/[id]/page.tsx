import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ProductDetailClient from '@/components/ProductDetailClient';

export default async function ProductDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;

  // 1. Ambil data produk utama
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: {
        orderBy: { position: 'asc' }
      },
      variants: {
        // Ubah orderBy menggunakan sizeId atau biarkan default jika relasi kompleks
        orderBy: { sizeId: 'asc' },
        include: {
          color: true,
          size: true
        }
      },
    },
  });

  if (!product) notFound();

  // 2. Ambil 4 produk lain untuk "You May Also Like"
  const relatedProducts = await prisma.product.findMany({
    where: {
      id: { not: id },
      status: 'PUBLISHED'
    },
    take: 4,
    include: {
      images: { orderBy: { position: 'asc' } },
      variants: {
        include: {
          color: true,
          size: true
        }
      }
    }
  });

  return (
    <ProductDetailClient
      product={product as any}
      relatedProducts={relatedProducts as any}
    />
  );
}