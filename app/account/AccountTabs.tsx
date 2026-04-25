'use client';

import { useState, useEffect, useRef } from 'react';
import { Clock, Tag, Loader2, ExternalLink, Package, CheckCircle2, Ticket, Plus } from 'lucide-react';
import Link from 'next/link';
import { claimVoucherAction } from '@/app/actions/voucher';

const formatRupiah = (angka: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
const formatDate = (date: Date) => new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(date));

export default function AccountTabs({ orders, vouchers }: { orders: any[], vouchers: any[] }) {
  const [activeTab, setActiveTab] = useState<'orders' | 'vouchers'>('orders');
  
  const [orderStatusTab, setOrderStatusTab] = useState<'ACTIVE' | 'DONE'>('ACTIVE');
  const [voucherStatusTab, setVoucherStatusTab] = useState<'AVAILABLE' | 'USED'>('AVAILABLE');
  const [voucherFilter, setVoucherFilter] = useState('ALL');
  
  const [visibleOrders, setVisibleOrders] = useState(5);
  const [visibleVouchers, setVisibleVouchers] = useState(4);
  const loaderRef = useRef<HTMLDivElement>(null);

  const [claimCode, setClaimCode] = useState('');
  const [isClaiming, setIsClaiming] = useState(false);

  // ==========================================
  // ORDERS LOGIC
  // ==========================================
  const filteredOrders = orders.filter(order => {
    const isActive = ['PENDING', 'PROCESSING', 'SHIPPED'].includes(order.orderStatus) || order.paymentStatus === 'UNPAID';
    const isDone = ['DELIVERED', 'CANCELLED'].includes(order.orderStatus) || order.paymentStatus === 'EXPIRED';
    if (orderStatusTab === 'ACTIVE') return isActive;
    return isDone;
  });
  const displayedOrders = filteredOrders.slice(0, visibleOrders);
  const hasMoreOrders = visibleOrders < filteredOrders.length;

  // ==========================================
  // VOUCHERS LOGIC (GROUPING)
  // ==========================================
  const groupedVouchersMap = vouchers.reduce((acc: any, curr: any) => {
    const key = `${curr.promoId}-${curr.status}`;
    if (!acc[key]) {
      acc[key] = { ...curr, count: 1 };
    } else {
      acc[key].count += 1;
    }
    return acc;
  }, {});

  const filteredVouchers = Object.values(groupedVouchersMap).filter((v: any) => {
    if (v.status !== voucherStatusTab) return false;
    if (voucherFilter === 'ALL') return true;
    return v.promo.type === voucherFilter;
  });

  const displayedVouchers = filteredVouchers.slice(0, visibleVouchers);
  const hasMoreVouchers = visibleVouchers < filteredVouchers.length;

  // ==========================================
  // CLAIM ACTION
  // ==========================================
  const handleClaim = async () => {
    if (!claimCode) return;
    setIsClaiming(true);
    const res = await claimVoucherAction(claimCode);
    if (res.success) {
      alert(res.message);
      setClaimCode('');
    } else {
      alert(res.error);
    }
    setIsClaiming(false);
  };

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setTimeout(() => {
          if (activeTab === 'orders') setVisibleOrders(prev => prev + 5);
          else setVisibleVouchers(prev => prev + 4);
        }, 500);
      }
    }, { threshold: 0.1 });

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [activeTab, visibleOrders, visibleVouchers]);

  useEffect(() => { setVisibleOrders(5); }, [orderStatusTab]);
  useEffect(() => { setVisibleVouchers(4); }, [voucherFilter, voucherStatusTab]);

  return (
    <div className="space-y-8">
      {/* TABS UTAMA */}
      <div className="flex border-b border-gray-100 gap-8 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-4 text-[10px] whitespace-nowrap font-bold uppercase tracking-[0.2em] transition-all relative ${activeTab === 'orders' ? 'text-black' : 'text-gray-400 hover:text-black'}`}
        >
          Orders ({orders.length})
          {activeTab === 'orders' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black animate-in slide-in-from-left-full"></div>}
        </button>
        <button
          onClick={() => setActiveTab('vouchers')}
          className={`pb-4 text-[10px] whitespace-nowrap font-bold uppercase tracking-[0.2em] transition-all relative ${activeTab === 'vouchers' ? 'text-black' : 'text-gray-400 hover:text-black'}`}
        >
          Vouchers ({vouchers.filter(v => v.status === 'AVAILABLE').length})
          {activeTab === 'vouchers' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black animate-in slide-in-from-left-full"></div>}
        </button>
      </div>

      {/* -------------------- ORDERS TAB -------------------- */}
      {activeTab === 'orders' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="flex gap-6 mb-2">
            {[
              { id: 'ACTIVE', label: 'Active', icon: Clock },
              { id: 'DONE', label: 'Completed', icon: CheckCircle2 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setOrderStatusTab(tab.id as any)}
                className={`flex items-center gap-2 pb-2 text-[10px] font-bold uppercase tracking-widest transition-all relative ${
                  orderStatusTab === tab.id ? 'text-black' : 'text-gray-400 hover:text-black'
                }`}
              >
                <tab.icon className="w-3 h-3" />
                {tab.label}
                {orderStatusTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black"></div>}
              </button>
            ))}
          </div>

          {filteredOrders.length === 0 ? (
            <div className="bg-gray-50 p-16 text-center border border-dashed border-gray-200">
              <Package className="w-8 h-8 text-gray-300 mx-auto mb-4" />
              <p className="text-[10px] text-gray-400 uppercase tracking-widest">No {orderStatusTab.toLowerCase()} orders found.</p>
            </div>
          ) : (
            displayedOrders.map((order) => (
              <div key={order.id} className="border border-gray-100 p-6 hover:border-gray-300 transition-all bg-white relative">
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
                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest border ${
                        order.paymentStatus === 'PAID' ? 'bg-green-50 border-green-100 text-green-700' : 
                        order.paymentStatus === 'UNPAID' ? 'bg-orange-50 border-orange-100 text-orange-700' : 'bg-red-50 border-red-100 text-red-700'
                      }`}>
                        {order.paymentStatus === 'PAID' ? order.orderStatus : order.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {order.items.slice(0, 2).map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center text-[10px]">
                      <p className="text-gray-600 tracking-tight uppercase font-medium truncate pr-4">
                        {item.quantity}x {item.name} ({item.color}, {item.size})
                      </p>
                      <p className="font-bold shrink-0">{formatRupiah(item.price)}</p>
                    </div>
                  ))}
                  {order.items.length > 2 && (
                     <p className="text-[9px] text-gray-400 italic">...and {order.items.length - 2} other items</p>
                  )}
                </div>

                <div className="flex justify-end">
                  <Link 
                    href={`/orders/${order.id}`}
                    className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-black hover:text-blue-600 transition-colors"
                  >
                    View Details <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))
          )}

          {hasMoreOrders && (
            <div ref={loaderRef} className="py-8 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
            </div>
          )}
        </div>
      )}

      {/* -------------------- VOUCHERS TAB -------------------- */}
      {activeTab === 'vouchers' && (
        <div className="animate-in fade-in duration-500">
          
          {/* CLAIM SECTION */}
          <div className="mb-12 bg-black p-8 rounded-sm text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                <Ticket className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest">Have a Secret Code?</h3>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest">Enter it here to unlock exclusive rewards</p>
              </div>
            </div>
            <div className="flex w-full md:w-auto gap-2">
              <input 
                type="text" 
                placeholder="ENTER CODE..."
                value={claimCode}
                onChange={(e) => setClaimCode(e.target.value.toUpperCase())}
                className="bg-white/5 border border-white/20 px-4 py-3 text-xs font-mono tracking-[0.2em] focus:outline-none focus:border-white w-full md:w-64 transition-colors"
              />
              <button 
                onClick={handleClaim}
                disabled={isClaiming || !claimCode}
                className="bg-white text-black px-6 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-200 disabled:bg-gray-600 transition-all flex items-center gap-2"
              >
                {isClaiming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Claim
              </button>
            </div>
          </div>

          <div className="flex gap-6 mb-6 border-b border-gray-50">
            {[
              { id: 'AVAILABLE', label: 'Available' },
              { id: 'USED', label: 'Used' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setVoucherStatusTab(tab.id as any)}
                className={`pb-2 text-[10px] font-bold uppercase tracking-widest transition-all relative ${
                  voucherStatusTab === tab.id ? 'text-black' : 'text-gray-400 hover:text-black'
                }`}
              >
                {tab.label}
                {voucherStatusTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black"></div>}
              </button>
            ))}
          </div>

          <div className="flex gap-4 mb-8 overflow-x-auto pb-2 no-scrollbar">
            {['ALL', 'PERCENTAGE', 'NOMINAL', 'SHIPPING'].map((type) => (
              <button
                key={type}
                onClick={() => setVoucherFilter(type)}
                className={`px-4 py-2 text-[9px] font-bold uppercase tracking-widest border transition-all ${
                  voucherFilter === type ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-200 hover:border-black'
                }`}
              >
                {type.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* GRID VOUCHERS: DESAIN CLEAN TANPA BULATAN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayedVouchers.length === 0 ? (
              <div className="col-span-full py-12 text-center bg-gray-50 rounded-sm border border-dashed border-gray-200">
                <Tag className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                <p className="text-[9px] text-gray-400 uppercase tracking-widest">No vouchers found.</p>
              </div>
            ) : (
              displayedVouchers.map((v: any) => (
                <div 
                  key={v.id} 
                  className={`p-6 border relative transition-colors duration-300 ${
                    v.status === 'AVAILABLE' ? 'border-gray-200 bg-white hover:border-black' : 'opacity-60 grayscale bg-gray-50 border-gray-200'
                  }`}
                >
                  
                  {/* 🚀 BADGE UNTUK VOUCHER GANDA (Bertumpuk Logika) */}
                  {v.count > 1 && (
                    <div className="absolute top-0 right-0 bg-black text-white text-[9px] font-bold px-3 py-1.5 tracking-widest">
                      x{v.count}
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-4">
                    <div className={v.count > 1 ? "pr-8" : ""}>
                      <h3 className="text-[10px] font-bold uppercase tracking-widest mb-1">{v.promo.name}</h3>
                      <p className="text-2xl font-serif italic">
                        {v.promo.type === 'PERCENTAGE' ? `${v.promo.value}% OFF` :
                          v.promo.type === 'NOMINAL' ? formatRupiah(v.promo.value) : 'FREE SHIPPING'}
                      </p>
                    </div>
                    {/* Badge Status disembunyikan jika ada badge x2 agar tidak tabrakan */}
                    {v.count === 1 && (
                      <span className={`text-[8px] font-bold uppercase px-2 py-1 mt-1 ${v.status === 'AVAILABLE' ? 'bg-green-50 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                        {v.status}
                      </span>
                    )}
                  </div>

                  <div className="pt-5 border-t border-dashed border-gray-200 flex justify-between items-center">
                    <div>
                      <p className="text-[8px] text-gray-400 uppercase tracking-widest mb-1">Expires On</p>
                      <p className="text-[10px] font-bold">{v.promo.endDate ? formatDate(v.promo.endDate) : 'No Expiry'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] text-gray-400 uppercase tracking-widest mb-1">Code</p>
                      <p className="text-[11px] font-mono font-bold tracking-widest">{v.promo.code}</p>
                    </div>
                  </div>

                  {v.status === 'AVAILABLE' && (
                    <div className="mt-6 pt-5 border-t border-gray-100">
                      <Link 
                        href="/" 
                        className="w-full flex items-center justify-center gap-2 bg-black text-white py-3 text-[9px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-all"
                      >
                        Use Now <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

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