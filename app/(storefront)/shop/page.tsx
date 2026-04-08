import { prisma } from '@/lib/prisma';
import ProductCard from '@/components/ProductCard';

// Fungsi helper format rupiah
const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(angka);
};

export default async function ShopPage() {
  // Ambil produk dan SEMUA gambarnya
  const products = await prisma.product.findMany({
    where: {
      status: 'PUBLISHED',
    },
    include: {
      images: {
        orderBy: { position: 'asc' },
        // HAPUS 'take: 1' agar semua gambar terbawa
      },
      variants: true, // Ambil varian untuk mengecek stok
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

      {/* Grid Produk menggunakan ProductCard */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-8 md:gap-y-16">
        {products.map((product) => {
          // Cek apakah semua varian sold out
          const isSoldOut = product.variants.length > 0 && !product.variants.some(v => v.stock > 0);

          return (
            <ProductCard
              key={product.id}
              product={{
                id: product.id,
                name: product.name,
                price: formatRupiah(product.price),
                // Ubah array objek image menjadi array string URL saja
                images: product.images.map(img => img.url),
                status: isSoldOut ? 'sold_out' : 'available'
              }}
            />
          );
        })}
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