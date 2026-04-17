'use client';

import React, { useState } from 'react';
import { 
  Search, Filter, Plus, Ticket, 
  Percent, Banknote, Truck, Clock, 
  CheckCircle2, XCircle, AlertCircle, Copy, MoreHorizontal 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// ==========================================
// MOCK DATA: Promo & Voucher
// ==========================================
const MOCK_PROMOS = [
  {
    id: "PRM-001",
    code: "SUMMER2026",
    name: "Summer Sale 2026",
    type: "PERCENTAGE", // PERCENTAGE, NOMINAL, SHIPPING
    value: 15, // 15%
    maxDiscount: 500000,
    minPurchase: 1000000,
    quota: { used: 142, max: 500 },
    period: { start: "01 Apr 2026", end: "30 Apr 2026" },
    status: "ACTIVE" // ACTIVE, SCHEDULED, EXPIRED, DEPLETED
  },
  {
    id: "PRM-002",
    code: "WELCOMEVIP",
    name: "New VIP Onboarding",
    type: "NOMINAL",
    value: 250000, // Rp 250.000
    maxDiscount: null,
    minPurchase: 2000000,
    quota: { used: 45, max: 100 },
    period: { start: "01 Jan 2026", end: "31 Des 2026" },
    status: "ACTIVE"
  },
  {
    id: "PRM-003",
    code: "FREESHIPJKT",
    name: "Gratis Ongkir Jakarta",
    type: "SHIPPING",
    value: 50000, // Max potongan ongkir Rp 50.000
    maxDiscount: null,
    minPurchase: 500000,
    quota: { used: 200, max: 200 },
    period: { start: "10 Apr 2026", end: "15 Apr 2026" },
    status: "DEPLETED" // Kuota Habis
  },
  {
    id: "PRM-004",
    code: "PAYDAYMAY",
    name: "Payday Spesial Mei",
    type: "PERCENTAGE",
    value: 20,
    maxDiscount: 1000000,
    minPurchase: 1500000,
    quota: { used: 0, max: 1000 },
    period: { start: "25 Mei 2026", end: "30 Mei 2026" },
    status: "SCHEDULED" // Belum mulai
  },
  {
    id: "PRM-005",
    code: "FLASH10",
    name: "Flash Sale 10.10",
    type: "NOMINAL",
    value: 100000,
    maxDiscount: null,
    minPurchase: 0,
    quota: { used: 5000, max: 5000 },
    period: { start: "10 Okt 2025", end: "12 Okt 2025" },
    status: "EXPIRED" // Sudah lewat
  }
];

export default function PromosPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // 🚀 Helper: Ikon & Warna Tipe Promo
  const getPromoTypeBadge = (type: string) => {
    switch(type) {
      case 'PERCENTAGE': return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"><Percent className="w-3 h-3 mr-1"/> Persentase</Badge>;
      case 'NOMINAL': return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200"><Banknote className="w-3 h-3 mr-1"/> Nominal Fix</Badge>;
      case 'SHIPPING': return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200"><Truck className="w-3 h-3 mr-1"/> Gratis Ongkir</Badge>;
      default: return <Badge>{type}</Badge>;
    }
  };

  // 🚀 Helper: Status Promo
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'ACTIVE': return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200"><CheckCircle2 className="w-3 h-3 mr-1"/> Aktif</Badge>;
      case 'SCHEDULED': return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200"><Clock className="w-3 h-3 mr-1"/> Terjadwal</Badge>;
      case 'DEPLETED': return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200"><AlertCircle className="w-3 h-3 mr-1"/> Kuota Habis</Badge>;
      case 'EXPIRED': return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200"><XCircle className="w-3 h-3 mr-1"/> Berakhir</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  // 🚀 Helper: Format Nilai Promo
  const formatPromoValue = (promo: any) => {
    if (promo.type === 'PERCENTAGE') {
      return (
        <div>
          <p className="font-bold text-gray-900 text-lg">{promo.value}% OFF</p>
          {promo.maxDiscount && <p className="text-[10px] text-gray-500">Max. Rp {promo.maxDiscount.toLocaleString('id-ID')}</p>}
        </div>
      );
    }
    return (
      <div>
        <p className="font-bold text-gray-900 text-sm">Rp {promo.value.toLocaleString('id-ID')}</p>
        <p className="text-[10px] text-gray-500">Potongan Fix</p>
      </div>
    );
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Ticket className="w-6 h-6 text-blue-600" /> Promos & Vouchers
          </h1>
          <p className="text-sm text-gray-500 mt-1">Kelola kode diskon, gratis ongkir, dan pantau penggunaannya.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="bg-black hover:bg-gray-800 text-white shadow-md">
            <Plus className="w-4 h-4 mr-2" /> Buat Promo Baru
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Promo Aktif', value: '12', trend: 'Sedang berjalan' },
          { label: 'Total Penggunaan', value: '8,432', trend: 'Bulan ini' },
          { label: 'Penjualan via Promo', value: 'Rp 450 Jt', trend: 'Bulan ini' },
          { label: 'Total Diskon Diberikan', value: 'Rp 42.5 Jt', trend: 'Bulan ini' },
        ].map((metric, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{metric.label}</p>
            <div className="mt-2">
              <h3 className="text-2xl font-black text-gray-900">{metric.value}</h3>
              <p className="text-[10px] font-medium text-gray-500 mt-1">{metric.trend}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Cari Nama Promo atau Kode Voucher..." 
            className="pl-9 bg-gray-50 border-transparent focus:border-gray-300 focus:bg-white transition-colors" 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button variant="outline" size="sm" className="w-full md:w-auto text-xs"><Filter className="w-3 h-3 mr-2" /> Tipe Promo</Button>
          <Button variant="outline" size="sm" className="w-full md:w-auto text-xs"><Clock className="w-3 h-3 mr-2" /> Status</Button>
        </div>
      </div>

      {/* Promos Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/80 text-[10px] uppercase tracking-widest text-gray-500 font-bold border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Detail Promo & Kode</th>
                <th className="px-6 py-4">Nilai Diskon</th>
                <th className="px-6 py-4">Syarat & Tipe</th>
                <th className="px-6 py-4">Kuota Penggunaan</th>
                <th className="px-6 py-4">Periode & Status</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {MOCK_PROMOS.map((promo) => {
                // Kalkulasi persentase kuota
                const quotaPercent = (promo.quota.used / promo.quota.max) * 100;
                const isNearingEmpty = quotaPercent >= 80 && promo.status === 'ACTIVE';

                return (
                  <tr key={promo.id} className="hover:bg-gray-50/50 transition-colors group">
                    
                    {/* Kolom 1: Nama & Kode */}
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900 mb-1">{promo.name}</p>
                      <div className="inline-flex items-center gap-2 bg-gray-100 border border-gray-200 rounded px-2 py-1">
                        <span className="font-mono text-xs font-bold tracking-wider text-blue-700">{promo.code}</span>
                        <button className="text-gray-400 hover:text-gray-700" title="Copy Code">
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </td>

                    {/* Kolom 2: Nilai */}
                    <td className="px-6 py-4">
                      {formatPromoValue(promo)}
                    </td>

                    {/* Kolom 3: Tipe & Syarat */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2 items-start">
                        {getPromoTypeBadge(promo.type)}
                        <p className="text-[10px] text-gray-500 font-medium">
                          Min. Belanja: {promo.minPurchase === 0 ? 'Tanpa Minimum' : `Rp ${promo.minPurchase.toLocaleString('id-ID')}`}
                        </p>
                      </div>
                    </td>

                    {/* Kolom 4: Kuota Progress Bar */}
                    <td className="px-6 py-4">
                      <div className="w-32">
                        <div className="flex justify-between text-[10px] mb-1">
                          <span className="font-bold text-gray-700">{promo.quota.used.toLocaleString('id-ID')} Terpakai</span>
                          <span className="text-gray-400">/ {promo.quota.max.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${isNearingEmpty ? 'bg-orange-500' : 'bg-blue-500'}`} 
                            style={{ width: `${Math.min(quotaPercent, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Kolom 5: Periode & Status */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2 items-start">
                        {getStatusBadge(promo.status)}
                        <p className="text-[10px] text-gray-500">
                          {promo.period.start} - {promo.period.end}
                        </p>
                      </div>
                    </td>

                    {/* Kolom 6: Aksi */}
                    <td className="px-6 py-4 text-center">
                      <Button variant="ghost" size="icon" className="text-gray-400 hover:text-black">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
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