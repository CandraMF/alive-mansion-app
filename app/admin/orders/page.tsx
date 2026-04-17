'use client';

import React, { useState } from 'react';
import { 
  Search, Filter, Download, MoreHorizontal, Package, 
  Truck, CreditCard, CheckCircle2, Clock, XCircle, ChevronDown, Eye 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// ==========================================
// MOCK DATA: Meniru Struktur API Xendit & RajaOngkir
// ==========================================
const MOCK_ORDERS = [
  {
    id: "ORD-AM-2604-001",
    customerName: "Anya Geraldine",
    customerEmail: "anya@example.com",
    date: "17 Apr 2026, 14:30 WIB",
    totalAmount: 4500000,
    itemsCount: 2,
    // Simulasi Data Xendit
    payment: {
      status: "PAID",
      method: "BCA Virtual Account",
      channel: "XENDIT",
      refId: "xnd_va_9823749823",
      paidAt: "17 Apr 2026, 14:35 WIB"
    },
    // Simulasi Data RajaOngkir
    shipping: {
      status: "SHIPPED",
      courier: "JNE",
      service: "YES", // Yakin Esok Sampai
      awb: "10293810293810", // Nomor Resi
      cost: 45000
    }
  },
  {
    id: "ORD-AM-2604-002",
    customerName: "Reza Rahadian",
    customerEmail: "reza.r@example.com",
    date: "17 Apr 2026, 15:10 WIB",
    totalAmount: 1250000,
    itemsCount: 1,
    payment: {
      status: "PENDING",
      method: "OVO E-Wallet",
      channel: "XENDIT",
      refId: "xnd_ew_1122334455",
      paidAt: null
    },
    shipping: {
      status: "PROCESSING",
      courier: "SICEPAT",
      service: "HALU",
      awb: null,
      cost: 15000
    }
  },
  {
    id: "ORD-AM-2604-003",
    customerName: "Tara Basro",
    customerEmail: "tara@example.com",
    date: "16 Apr 2026, 09:00 WIB",
    totalAmount: 8900000,
    itemsCount: 3,
    payment: {
      status: "EXPIRED",
      method: "Mandiri Virtual Account",
      channel: "XENDIT",
      refId: "xnd_va_5566778899",
      paidAt: null
    },
    shipping: {
      status: "CANCELLED",
      courier: "JNT",
      service: "EZ",
      awb: null,
      cost: 22000
    }
  }
];

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // Helpers untuk UI Badges
  const getPaymentBadge = (status: string) => {
    switch(status) {
      case 'PAID': return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200"><CheckCircle2 className="w-3 h-3 mr-1"/> Lunas</Badge>;
      case 'PENDING': return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200"><Clock className="w-3 h-3 mr-1"/> Menunggu</Badge>;
      case 'EXPIRED': return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200"><XCircle className="w-3 h-3 mr-1"/> Kadaluarsa</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const getShippingBadge = (status: string) => {
    switch(status) {
      case 'SHIPPED': return <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50"><Truck className="w-3 h-3 mr-1"/> Dikirim</Badge>;
      case 'PROCESSING': return <Badge variant="outline" className="text-gray-600 border-gray-200 bg-gray-50"><Package className="w-3 h-3 mr-1"/> Diproses</Badge>;
      case 'CANCELLED': return <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">Dibatalkan</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Orders Management</h1>
          <p className="text-sm text-gray-500 mt-1">Pantau transaksi Xendit dan pengiriman RajaOngkir.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="bg-white"><Download className="w-4 h-4 mr-2" /> Export CSV</Button>
          <Button className="bg-black hover:bg-gray-800 text-white">Buat Order Manual</Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Penjualan', value: 'Rp 14.650.000', trend: '+12.5%' },
          { label: 'Pesanan Aktif', value: '24', trend: '+4' },
          { label: 'Menunggu Pembayaran', value: '8', trend: '-2' },
          { label: 'Siap Dikirim', value: '12', trend: '+1' },
        ].map((metric, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{metric.label}</p>
            <div className="flex items-end gap-2 mt-2">
              <h3 className="text-2xl font-black text-gray-900">{metric.value}</h3>
              <span className={`text-xs font-medium mb-1 ${metric.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{metric.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Cari ID Pesanan, Nama, atau Resi..." className="pl-9 bg-gray-50 border-transparent focus:border-gray-300 focus:bg-white transition-colors" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button variant="outline" size="sm" className="w-full md:w-auto text-xs"><Filter className="w-3 h-3 mr-2" /> Status Pembayaran</Button>
          <Button variant="outline" size="sm" className="w-full md:w-auto text-xs"><Truck className="w-3 h-3 mr-2" /> Status Pengiriman</Button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/80 text-xs uppercase tracking-widest text-gray-500 font-bold border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Order Info</th>
                <th className="px-6 py-4">Pelanggan</th>
                <th className="px-6 py-4">Pembayaran (Xendit)</th>
                <th className="px-6 py-4">Pengiriman (RajaOngkir)</th>
                <th className="px-6 py-4 text-right">Total</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {MOCK_ORDERS.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900">{order.id}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{order.date}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900">{order.customerName}</p>
                    <p className="text-[11px] text-gray-500">{order.customerEmail}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5 items-start">
                      {getPaymentBadge(order.payment.status)}
                      <p className="text-[10px] font-mono text-gray-500 flex items-center bg-gray-100 px-1.5 py-0.5 rounded"><CreditCard className="w-3 h-3 mr-1" /> {order.payment.method}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5 items-start">
                      {getShippingBadge(order.shipping.status)}
                      <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">{order.shipping.courier} - {order.shipping.service}</p>
                      {order.shipping.awb && <p className="text-[9px] font-mono text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded cursor-pointer hover:bg-blue-100">Resi: {order.shipping.awb}</p>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="font-bold text-gray-900">Rp {order.totalAmount.toLocaleString('id-ID')}</p>
                    <p className="text-[10px] text-gray-400">{order.itemsCount} Item(s)</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-blue-600"><Eye className="w-4 h-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}