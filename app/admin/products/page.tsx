export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import DeleteProductButton from '@/components/DeleteProductButton'; // Kita buat ini di bawah

// Format angka ke Rupiah
const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(angka);
};

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      variants: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8">
      {/* Header & Action Button */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight mb-1">Products</h1>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">
            Manage your inventory
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-black text-white px-6 py-3 text-[11px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors text-center"
        >
          + Add New Product
        </Link>
      </div>

      {/* Tabel Daftar Produk */}
      <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase tracking-widest border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-bold">Product Name</th>
                <th className="px-6 py-4 font-bold">Price</th>
                <th className="px-6 py-4 font-bold">Total Stock</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 font-medium">
                    No products found. Click "Add New Product" to create one.
                  </td>
                </tr>
              )}

              {products.map((product) => {
                const isAvailable = product.variants.some(v => v.isAvailable);
                const variantCount = product.variants.length;

                return (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-bold text-black text-[13px]">{product.name}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
                        {variantCount} Variants
                      </p>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-700">
                      {formatRupiah(product.price)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[11px] font-bold uppercase tracking-widest ${isAvailable ? 'text-green-600' : 'text-red-500'}`}>
                        {isAvailable ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-sm text-[9px] font-bold uppercase tracking-widest ${
                        product.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                        product.status === 'DRAFT' ? 'bg-gray-200 text-gray-600' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:text-blue-800 mr-4"
                      >
                        Edit
                      </Link>
                      
                      {/* Komponen Button Delete */}
                      <DeleteProductButton productId={product.id} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}