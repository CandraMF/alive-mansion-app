'use client';

import { useState, useEffect } from 'react';
import { getAdminOrdersAction } from '@/app/actions/admin-order';
import Link from 'next/link';
import { Download, Eye, Loader2, Package, Search, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

const formatRupiah = (angka: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // 🚀 PARAMETER STATE
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState(''); // Untuk delay search
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const totalPages = Math.ceil(totalOrders / limit);

  // Fungsi Fetch Data Utama
  const fetchOrders = async () => {
    setIsLoading(true);
    const res = await getAdminOrdersAction({
      page, limit, search: searchQuery, status: statusFilter, 
      paymentStatus: paymentFilter, sortBy, sortOrder
    }) as any;
    
    if (res.success && res.data) {
      setOrders(res.data);
      setTotalOrders(res.total || 0);
    }
    setIsLoading(false);
  };

  // Trigger Fetch setiap kali parameter berubah
  useEffect(() => {
    fetchOrders();
  }, [page, limit, searchQuery, statusFilter, paymentFilter, sortBy, sortOrder]);

  // Debounce Search (Agar tidak hit database tiap ketik 1 huruf)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(1); // Reset ke halaman 1 tiap kali mencari
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchInput]);

  // 🚀 FITUR EXPORT CSV (Ambil Semua Data Sesuai Filter, Tanpa Limit)
  const handleExportCSV = async () => {
    setIsExporting(true);
    
    const res = await getAdminOrdersAction({
      search: searchQuery, status: statusFilter, 
      paymentStatus: paymentFilter, sortBy, sortOrder,
      fetchAll: true // <--- Kunci utamanya di sini
    }) as any;

    if (!res.success || !res.data || res.data.length === 0) {
      alert("Tidak ada data untuk diexport");
      setIsExporting(false);
      return;
    }

    const headers = ["Order ID", "Tanggal", "Nama Customer", "Email", "Total Belanja", "Status Pembayaran", "Status Pengiriman", "Kurir", "No. Resi"];
    
    const rows = res.data.map((order: any) => [
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

    const csvContent = [
      headers.join(","),
      ...rows.map((row: any) => row.map((item: any) => `"${item}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `Data_Pesanan_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setIsExporting(false);
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto font-sans space-y-6 animate-in fade-in duration-500">
      {/* HEADER & EXPORT */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-tighter">Order Management</h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Total {totalOrders} pesanan ditemukan</p>
        </div>
        <button 
          onClick={handleExportCSV}
          disabled={isExporting || totalOrders === 0}
          className="bg-black text-white px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2 shrink-0"
        >
          {isExporting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />} 
          {isExporting ? 'Exporting...' : 'Export Filtered CSV'}
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white border border-gray-200 p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 shadow-sm">
        <div className="flex items-center gap-2 border border-gray-200 px-3 h-10 bg-gray-50">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input 
            type="text" 
            placeholder="Cari ID, Nama, Email..." 
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full text-xs outline-none bg-transparent"
          />
        </div>

        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="h-10 border border-gray-200 px-3 text-[10px] font-bold uppercase outline-none focus:border-black">
          <option value="ALL">All Delivery Status</option>
          <option value="PENDING">Pending</option>
          <option value="PROCESSING">Processing</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        <select value={paymentFilter} onChange={e => { setPaymentFilter(e.target.value); setPage(1); }} className="h-10 border border-gray-200 px-3 text-[10px] font-bold uppercase outline-none focus:border-black">
          <option value="ALL">All Payment Status</option>
          <option value="UNPAID">Unpaid</option>
          <option value="PAID">Paid</option>
          <option value="EXPIRED">Expired</option>
        </select>

        <select value={`${sortBy}-${sortOrder}`} onChange={e => { 
          const [sBy, sOrder] = e.target.value.split('-');
          setSortBy(sBy); setSortOrder(sOrder); setPage(1);
        }} className="h-10 border border-gray-200 px-3 text-[10px] font-bold uppercase outline-none focus:border-black">
          <option value="createdAt-desc">Newest First</option>
          <option value="createdAt-asc">Oldest First</option>
          <option value="totalAmount-desc">Highest Amount</option>
          <option value="totalAmount-asc">Lowest Amount</option>
        </select>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Show:</span>
          <select value={limit} onChange={e => { setLimit(Number(e.target.value)); setPage(1); }} className="h-10 border border-gray-200 px-3 text-[10px] font-bold uppercase outline-none focus:border-black w-full">
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-gray-200 overflow-hidden shadow-sm">
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
                  <td colSpan={6} className="p-16 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-300" /></td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-16 text-center">
                    <Package className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Tidak ada pesanan ditemukan.</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <p className="text-[11px] font-bold uppercase">#{order.id.slice(-8)}</p>
                      <p className="text-[9px] text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' })}</p>
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

        {/* PAGINATION */}
        {!isLoading && totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center border border-gray-200 bg-white hover:border-black disabled:opacity-50 disabled:hover:border-gray-200 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 flex items-center justify-center border border-gray-200 bg-white hover:border-black disabled:opacity-50 disabled:hover:border-gray-200 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}