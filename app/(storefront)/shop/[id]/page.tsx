import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ProductDetailClient from '@/components/ProductDetailClient';

export default async function ProductDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { position: 'asc' } },
      variants: { orderBy: { size: 'asc' } },
    },
  });

  if (!product) notFound();

  // Ambil produk terkait (produk lain kecuali yang sedang dibuka)
  const relatedProducts = await prisma.product.findMany({
    where: { 
      id: { not: id },
      status: 'PUBLISHED' 
    },
    take: 4,
    include: { images: { orderBy: { position: 'asc' } } }
  });

  return (
    <main className="min-h-screen bg-white">
      <ProductDetailClient 
        product={product as any} 
        relatedProducts={relatedProducts as any} 
      />
    </main>
  );
}