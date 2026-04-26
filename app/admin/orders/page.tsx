'use client';

import { useState, useEffect } from 'react';
import { getAdminOrdersAction } from '@/app/actions/admin-order';
import Link from 'next/link';
import { Download, Eye, Loader2, Package, Search } from 'lucide-react';

const formatRupiah = (angka: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      const res = await getAdminOrdersAction();
      if (res.success && res.data) {
        setOrders(res.data);
      }
      setIsLoading(false);
    };
    fetchOrders();
  }, []);

  // 🚀 FITUR EXPORT CSV
  const handleExportCSV = () => {
    if (orders.length === 0) return alert("Tidak ada data untuk diexport");

    const headers = ["Order ID", "Tanggal", "Nama Customer", "Email", "Total Belanja", "Status Pembayaran", "Status Pengiriman", "Kurir", "No. Resi"];
    
    const rows = orders.map(order => [
      order.id,
      new Date(order.createdAt).toLocaleString('id-ID'),
      order.user?.name || '-',
      order.user?.email || '-',
      order.totalAmount,
      order.paymentStatus,
      order.orderStatus,
      `${order.courier} - ${order.courierService}`,
      order.resiNumber || '-'
    ]);

    // Menggabungkan header dan row menjadi format CSV standar
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(item => `"${item}"`).join(",")) // Dibungkus tanda kutip agar koma di dalam alamat/nama tidak merusak kolom
    ].join("\n");

    // Memicu download di browser
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `Data_Pesanan_Alive_Mansion_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    order.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-tighter">Order Management</h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Kelola pesanan dan pengiriman pelanggan</p>
        </div>
        <button 
          onClick={handleExportCSV}
          className="bg-black text-white px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
        >
          <Download className="w-3 h-3" /> Export CSV
        </button>
      </div>

      <div className="bg-white border border-gray-200">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Cari Order ID, Nama, atau Email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs outline-none bg-transparent"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-[9px] font-bold uppercase tracking-widest text-gray-500">
                <th className="p-4 whitespace-nowrap">Order ID & Date</th>
                <th className="p-4 whitespace-nowrap">Customer</th>
                <th className="p-4 whitespace-nowrap">Total</th>
                <th className="p-4 whitespace-nowrap">Payment</th>
                <th className="p-4 whitespace-nowrap">Status</th>
                <th className="p-4 whitespace-nowrap text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-300" /></td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-16 text-center">
                    <Package className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Tidak ada pesanan ditemukan.</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <p className="text-[11px] font-bold uppercase">#{order.id.slice(-8)}</p>
                      <p className="text-[9px] text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-xs font-bold uppercase">{order.user?.name || 'Guest'}</p>
                      <p className="text-[10px] text-gray-500">{order.user?.email || '-'}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-xs font-bold">{formatRupiah(order.totalAmount)}</p>
                      <p className="text-[9px] text-gray-400 uppercase mt-0.5">{order.items.length} Items</p>
                    </td>
                    <td className="p-4">
                      <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 ${order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 ${
                        order.orderStatus === 'DELIVERED' ? 'bg-blue-100 text-blue-700' :
                        order.orderStatus === 'SHIPPED' ? 'bg-purple-100 text-purple-700' :
                        order.orderStatus === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Link 
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center justify-center bg-white border border-gray-200 text-black w-8 h-8 hover:bg-gray-50 hover:border-black transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}