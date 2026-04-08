import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';

// Fungsi helper format rupiah
const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(angka);
};

export default async function ShopPage() {
  // Ambil hanya produk yang statusnya PUBLISHED
  const products = await prisma.product.findMany({
    where: {
      status: 'PUBLISHED',
    },
    include: {
      images: {
        orderBy: { position: 'asc' },
        take: 1, // Ambil gambar pertama saja sebagai cover
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Judul & Info */}
      <div className="flex flex-col mb-10 border-b border-gray-100 pb-6">
        <h1 className="text-4xl font-black uppercase tracking-tighter">Collections</h1>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mt-2">
          Showing {products.length} products
        </p>
      </div>

      {/* Grid Produk */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-8 md:gap-y-16">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/shop/${product.id}`}
            className="group flex flex-col gap-4"
          >
            {/* Wadah Gambar (Rasio 1:1) */}
            <div className="aspect-[3/4] md:aspect-square relative bg-gray-100 overflow-hidden rounded-sm">
              {product.images.length > 0 ? (
                <Image
                  src={product.images[0].url}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 uppercase font-bold tracking-widest">
                  No Image
                </div>
              )}

              {/* Overlay Cepat (Optional) */}
              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Info Produk */}
            <div className="flex flex-col gap-1">
              <h3 className="text-[13px] font-bold uppercase tracking-tight text-gray-900 leading-tight group-hover:underline decoration-1 underline-offset-4">
                {product.name}
              </h3>
              <p className="text-[11px] font-medium text-gray-600">
                {formatRupiah(product.price)}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Jika Belum Ada Produk */}
      {products.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
            No products available at the moment.
          </p>
        </div>
      )}
    </div>
  );
}