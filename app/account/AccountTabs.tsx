'use client';

import { useState, useEffect, useRef } from 'react';
import { Package, Ticket, Clock, Tag, Loader2 } from 'lucide-react';

// Helper Format Rupiah & Tanggal
const formatRupiah = (angka: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
const formatDate = (date: Date) => new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(date));

export default function AccountTabs({ orders, vouchers }: { orders: any[], vouchers: any[] }) {
  const [activeTab, setActiveTab] = useState<'orders' | 'vouchers'>('orders');
  const [voucherFilter, setVoucherFilter] = useState('ALL');

  // 🚀 STATE UNTUK PAGINATION (Jumlah item yang ditampilkan)
  const [visibleOrders, setVisibleOrders] = useState(5);
  const [visibleVouchers, setVisibleVouchers] = useState(4);

  // 🚀 REF UNTUK MENDETEKSI SCROLL MENTOK BAWAH
  const loaderRef = useRef<HTMLDivElement>(null);

  // Logika Filter Voucher
  const filteredVouchers = vouchers.filter(v => {
    if (voucherFilter === 'ALL') return true;
    return v.promo.type === voucherFilter;
  });

  // 🚀 DATA YANG SUDAH DI-SLICE (DIPOTONG SESUAI LIMIT)
  const displayedOrders = orders.slice(0, visibleOrders);
  const displayedVouchers = filteredVouchers.slice(0, visibleVouchers);

  // Cek apakah masih ada sisa data yang belum ditampilkan
  const hasMoreOrders = visibleOrders < orders.length;
  const hasMoreVouchers = visibleVouchers < filteredVouchers.length;

  // 🚀 LOGIKA INFINITE SCROLL (INTERSECTION OBSERVER)
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const target = entries[0];
      if (target.isIntersecting) {
        // Jika elemen loader terlihat di layar, tambah limit data!
        // Beri jeda 500ms agar animasi loading terlihat natural
        setTimeout(() => {
          if (activeTab === 'orders') {
            setVisibleOrders(prev => prev + 5);
          } else {
            setVisibleVouchers(prev => prev + 4);
          }
        }, 500);
      }
    }, { threshold: 0.1 });

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [activeTab, visibleOrders, visibleVouchers]);

  // Reset limit voucher setiap kali filter diubah
  useEffect(() => {
    setVisibleVouchers(4);
  }, [voucherFilter]);

  return (
    <div className="space-y-8">
      {/* NAVIGATION TABS */}
      <div className="flex border-b border-gray-100 gap-8">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative ${activeTab === 'orders' ? 'text-black' : 'text-gray-400 hover:text-black'
            }`}
        >
          Order History ({orders.length})
          {activeTab === 'orders' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black animate-in slide-in-from-left-full"></div>}
        </button>
        <button
          onClick={() => setActiveTab('vouchers')}
          className={`pb-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative ${activeTab === 'vouchers' ? 'text-black' : 'text-gray-400 hover:text-black'
            }`}
        >
          My Vouchers ({vouchers.filter(v => v.status === 'AVAILABLE').length})
          {activeTab === 'vouchers' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black animate-in slide-in-from-left-full"></div>}
        </button>
      </div>

      {/* CONTENT: ORDER HISTORY */}
      {activeTab === 'orders' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          {orders.length === 0 ? (
            <div className="bg-gray-50 p-16 text-center border border-dashed border-gray-200">
              <Clock className="w-8 h-8 text-gray-300 mx-auto mb-4" />
              <p className="text-[10px] text-gray-400 uppercase tracking-widest">No transactions found.</p>
            </div>
          ) : (
            displayedOrders.map((order) => (
              <div key={order.id} className="border border-gray-100 p-6 hover:shadow-md transition-all bg-white">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6 pb-4 border-b border-gray-50">
                  <div className="flex gap-6">
                    <div>
                      <p className="text-[8px] text-gray-400 uppercase tracking-widest mb-1">Ref</p>
                      <p className="text-[10px] font-bold">#{order.id.slice(-8).toUpperCase()}</p>
                    </div>
                    <div>
                      <p className="text-[8px] text-gray-400 uppercase tracking-widest mb-1">Date</p>
                      <p className="text-[10px] font-bold">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-[8px] text-gray-400 uppercase tracking-widest mb-1">Total</p>
                      <p className="text-[11px] font-bold">{formatRupiah(order.totalAmount)}</p>
                    </div>
                    <span className={`px-2 py-1 text-[8px] font-bold uppercase tracking-widest border ${order.status === 'PAID' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-gray-50 text-gray-500'
                      }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center text-[10px]">
                      <p className="text-gray-600 tracking-tight uppercase font-medium">{item.quantity}x {item.variant.product.name} ({item.variant.size.name})</p>
                      <p className="font-bold">{formatRupiah(item.priceAt)}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}

          {/* 🚀 INDIKATOR LOADING / OBSERVER (ORDERS) */}
          {hasMoreOrders && (
            <div ref={loaderRef} className="py-8 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
            </div>
          )}
        </div>
      )}

      {/* CONTENT: VOUCHERS */}
      {activeTab === 'vouchers' && (
        <div className="animate-in fade-in duration-500">
          <div className="flex gap-4 mb-8 overflow-x-auto pb-2 no-scrollbar">
            {['ALL', 'PERCENTAGE', 'NOMINAL', 'SHIPPING'].map((type) => (
              <button
                key={type}
                onClick={() => setVoucherFilter(type)}
                className={`px-4 py-2 text-[9px] font-bold uppercase tracking-widest border transition-all ${voucherFilter === type ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-200 hover:border-black'
                  }`}
              >
                {type.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredVouchers.length === 0 ? (
              <div className="col-span-full py-12 text-center bg-gray-50 rounded-sm">
                <Tag className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                <p className="text-[9px] text-gray-400 uppercase tracking-widest">No vouchers match the filter.</p>
              </div>
            ) : (
              displayedVouchers.map((v) => (
                <div key={v.id} className={`p-6 border relative transition-all ${v.status === 'AVAILABLE' ? 'border-gray-200 bg-white hover:border-black' : 'opacity-50 grayscale bg-gray-100'}`}>
                  <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white md:bg-gray-50 rounded-full border-r border-gray-200"></div>
                  <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white md:bg-gray-50 rounded-full border-l border-gray-200"></div>

                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-[10px] font-bold uppercase tracking-widest mb-1">{v.promo.name}</h3>
                      <p className="text-xl font-serif italic">
                        {v.promo.type === 'PERCENTAGE' ? `${v.promo.value}% OFF` :
                          v.promo.type === 'NOMINAL' ? formatRupiah(v.promo.value) : 'Free Shipping'}
                      </p>
                    </div>
                    <span className={`text-[8px] font-bold uppercase px-2 py-1 ${v.status === 'AVAILABLE' ? 'bg-green-50 text-green-700' : 'bg-gray-200'}`}>
                      {v.status}
                    </span>
                  </div>

                  <div className="pt-4 border-t border-dashed border-gray-100 flex justify-between items-center">
                    <div>
                      <p className="text-[8px] text-gray-400 uppercase mb-1">Expires On</p>
                      <p className="text-[9px] font-bold">{v.promo.endDate ? formatDate(v.promo.endDate) : 'No Expiry'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] text-gray-400 uppercase mb-1">Code</p>
                      <p className="text-[10px] font-mono font-bold tracking-widest">{v.promo.code}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 🚀 INDIKATOR LOADING / OBSERVER (VOUCHERS) */}
          {hasMoreVouchers && (
            <div ref={loaderRef} className="py-8 mt-4 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}