import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { DollarSign, ShoppingBag, Users, Package, AlertCircle, ArrowRight, TrendingUp } from 'lucide-react';

const formatRupiah = (angka: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);

export default async function AdminDashboardPage() {
  // 🚀 Fetch semua metrik secara paralel agar loadingnya instan!
  const [
    paidOrders,
    totalOrdersCount,
    totalCustomersCount,
    activeProductsCount,
    recentOrders,
    lowStockVariants
  ] = await Promise.all([
    // 1. Ambil semua order yang sudah LUNAS untuk dihitung pendapatannya
    prisma.order.findMany({
      where: { paymentStatus: 'PAID' },
      select: { totalAmount: true }
    }),
    // 2. Total semua transaksi masuk
    prisma.order.count(),
    // 3. Total pelanggan yang mendaftar
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    // 4. Total produk yang aktif
    prisma.product.count({ where: { status: 'PUBLISHED' } }),
    // 5. Ambil 5 pesanan terbaru
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } }
    }),
    // 6. Ambil 5 varian barang yang stoknya di bawah 5 (Peringatan Restock)
    prisma.variant.findMany({
      where: { stock: { lt: 5 } },
      take: 5,
      orderBy: { stock: 'asc' },
      include: {
        product: { select: { name: true } },
        color: { select: { name: true } },
        size: { select: { name: true } }
      }
    })
  ]);

  // Hitung Total Pendapatan
  const totalRevenue = paidOrders.reduce((sum, order) => sum + order.totalAmount, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-black uppercase tracking-tighter">Overview</h1>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mt-1">
          Welcome back to Alive Mansion Command Center
        </p>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-black text-white p-6 border border-gray-800 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Total Revenue</h3>
            <DollarSign className="w-4 h-4 text-green-400" />
          </div>
          <div>
            <p className="text-2xl font-black">{formatRupiah(totalRevenue)}</p>
            <p className="text-[9px] uppercase tracking-widest text-gray-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-green-400" /> From all paid orders
            </p>
          </div>
        </div>

        <div className="bg-white p-6 border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Total Orders</h3>
            <ShoppingBag className="w-4 h-4 text-black" />
          </div>
          <div>
            <p className="text-2xl font-black">{totalOrdersCount}</p>
            <p className="text-[9px] uppercase tracking-widest text-gray-400 mt-1">Lifetime transactions</p>
          </div>
        </div>

        <div className="bg-white p-6 border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Customers</h3>
            <Users className="w-4 h-4 text-black" />
          </div>
          <div>
            <p className="text-2xl font-black">{totalCustomersCount}</p>
            <p className="text-[9px] uppercase tracking-widest text-gray-400 mt-1">Registered accounts</p>
          </div>
        </div>

        <div className="bg-white p-6 border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Active Products</h3>
            <Package className="w-4 h-4 text-black" />
          </div>
          <div>
            <p className="text-2xl font-black">{activeProductsCount}</p>
            <p className="text-[9px] uppercase tracking-widest text-gray-400 mt-1">Published items</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* RECENT ORDERS TABLE */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-gray-400" /> Recent Orders
            </h2>
            <Link href="/admin/orders" className="text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="bg-white border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[9px] font-bold uppercase tracking-widest text-gray-500">
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-xs text-gray-400 uppercase tracking-widest">No orders yet</td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <Link href={`/admin/orders/${order.id}`} className="text-[11px] font-bold uppercase hover:underline">
                          #{order.id.slice(-8)}
                        </Link>
                      </td>
                      <td className="p-4">
                        <p className="text-[11px] font-bold uppercase">{order.user?.name || 'Guest'}</p>
                        <p className="text-[9px] text-gray-500">{order.user?.email || '-'}</p>
                      </td>
                      <td className="p-4">
                        <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 ${order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="text-[11px] font-bold">{formatRupiah(order.totalAmount)}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* LOW STOCK ALERTS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" /> Low Stock Alerts
            </h2>
            <Link href="/admin/products" className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors">
              Manage
            </Link>
          </div>

          <div className="bg-white border border-gray-200 shadow-sm p-4">
            {lowStockVariants.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">All stocks are healthy! 🌿</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {lowStockVariants.map((variant) => (
                  <div key={variant.id} className="py-3 flex justify-between items-center">
                    <div>
                      <p className="text-[11px] font-bold uppercase">{variant.product.name}</p>
                      <p className="text-[9px] text-gray-500 uppercase tracking-widest mt-0.5">
                        {variant.color.name} - Size {variant.size.name}
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 ${variant.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                      {variant.stock} Left
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}