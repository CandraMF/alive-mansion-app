'use client';

import React, { useState } from 'react';
import {
  Search, Filter, Download, UserPlus,
  Mail, Phone, Star, ShieldAlert, ArrowRight
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// ==========================================
// MOCK DATA: Pelanggan
// ==========================================
const MOCK_CUSTOMERS = [
  {
    id: "CUST-001",
    name: "Anya Geraldine",
    email: "anya@example.com",
    phone: "+62 812-3456-7890",
    segment: "VIP",
    totalOrders: 12,
    totalSpent: 45500000,
    lastActive: "1 Hari yang lalu",
    status: "ACTIVE"
  },
  {
    id: "CUST-002",
    name: "Reza Rahadian",
    email: "reza.r@example.com",
    phone: "+62 811-2233-4455",
    segment: "REGULAR",
    totalOrders: 3,
    totalSpent: 3750000,
    lastActive: "5 Hari yang lalu",
    status: "ACTIVE"
  },
  {
    id: "CUST-003",
    name: "Pengguna Fiktif",
    email: "scammer99@fake.com",
    phone: "+62 899-0000-1111",
    segment: "NEW",
    totalOrders: 0,
    totalSpent: 0,
    lastActive: "2 Bulan yang lalu",
    status: "BANNED"
  }
];

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const getSegmentBadge = (segment: string) => {
    switch (segment) {
      case 'VIP': return <Badge className="bg-purple-100 text-purple-700 border-purple-200"><Star className="w-3 h-3 mr-1 fill-purple-700" /> VIP Client</Badge>;
      case 'REGULAR': return <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">Regular</Badge>;
      case 'NEW': return <Badge variant="outline" className="text-gray-500 border-gray-200 bg-gray-50">New</Badge>;
      default: return <Badge variant="outline">{segment}</Badge>;
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Customers Database</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola data pelanggan dan Lifetime Value (LTV).</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="bg-white"><Download className="w-4 h-4 mr-2" /> Export Data</Button>
          <Button className="bg-black hover:bg-gray-800 text-white"><UserPlus className="w-4 h-4 mr-2" /> Tambah Pelanggan</Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Pelanggan', value: '1,248', trend: '+12% bulan ini' },
          { label: 'Rata-rata Pembelanjaan (AOV)', value: 'Rp 2.450.000', trend: '+5% bulan ini' },
          { label: 'Pelanggan VIP', value: '86', trend: 'Penyumbang 60% Revenue' },
        ].map((metric, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{metric.label}</p>
            <div className="mt-4">
              <h3 className="text-3xl font-black text-gray-900">{metric.value}</h3>
              <p className="text-xs text-gray-500 font-medium mt-1">{metric.trend}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Cari Nama, Email, atau Telepon..." className="pl-9 bg-gray-50 border-transparent focus:border-gray-300 focus:bg-white transition-colors" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button variant="outline" size="sm" className="w-full md:w-auto text-xs"><Filter className="w-3 h-3 mr-2" /> Segmen</Button>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/80 text-xs uppercase tracking-widest text-gray-500 font-bold border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Profil Pelanggan</th>
                <th className="px-6 py-4">Kontak</th>
                <th className="px-6 py-4">Segmen</th>
                <th className="px-6 py-4 text-right">Total Transaksi</th>
                <th className="px-6 py-4 text-right">Total Pembelanjaan</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {MOCK_CUSTOMERS.map((customer) => (
                <tr key={customer.id} className={`transition-colors group ${customer.status === 'BANNED' ? 'bg-red-50/30' : 'hover:bg-gray-50/50'}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold font-serif shrink-0">
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <p className={`font-bold ${customer.status === 'BANNED' ? 'text-red-700 line-through' : 'text-gray-900'}`}>{customer.name}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">ID: {customer.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5">
                      <p className="text-xs flex items-center text-gray-600"><Mail className="w-3 h-3 mr-2 text-gray-400" /> {customer.email}</p>
                      <p className="text-xs flex items-center text-gray-600"><Phone className="w-3 h-3 mr-2 text-gray-400" /> {customer.phone}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {customer.status === 'BANNED' ? (
                      <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100"><ShieldAlert className="w-3 h-3 mr-1" /> Suspend</Badge>
                    ) : (
                      getSegmentBadge(customer.segment)
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="font-bold text-gray-900">{customer.totalOrders} Pesanan</p>
                    <p className="text-[10px] text-gray-400">Aktif: {customer.lastActive}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="font-bold text-green-600">Rp {customer.totalSpent.toLocaleString('id-ID')}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-black"><ArrowRight className="w-4 h-4" /></Button>
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