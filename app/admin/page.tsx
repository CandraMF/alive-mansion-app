'use client';

import React, { useState } from 'react';
import {
  TrendingUp, Users, ShoppingBag, DollarSign,
  ArrowUpRight, ArrowDownRight, Package,
  Activity, Calendar, ChevronRight, Store, ArrowRight
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// 🚀 Import Recharts
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// ==========================================
// MOCK DATA
// ==========================================
const MOCK_METRICS = [
  { label: 'Total Pendapatan', value: 'Rp 128.500.000', trend: '+15.2%', isPositive: true, icon: DollarSign },
  { label: 'Total Pesanan', value: '342', trend: '+8.1%', isPositive: true, icon: ShoppingBag },
  { label: 'Pelanggan Aktif', value: '1,248', trend: '+12.5%', isPositive: true, icon: Users },
  { label: 'Tingkat Konversi', value: '2.4%', trend: '-1.2%', isPositive: false, icon: Activity },
];

const MOCK_RECENT_ORDERS = [
  { id: "ORD-001", customer: "Anya Geraldine", total: 4500000, status: "PAID", time: "10 menit yang lalu" },
  { id: "ORD-002", customer: "Reza Rahadian", total: 1250000, status: "PENDING", time: "32 menit yang lalu" },
  { id: "ORD-003", customer: "Tara Basro", total: 8900000, status: "PAID", time: "1 jam yang lalu" },
  { id: "ORD-004", customer: "Nicholas Saputra", total: 3200000, status: "PAID", time: "3 jam yang lalu" },
];

const MOCK_TOP_PRODUCTS = [
  { name: "Tabi Leather Boots", sales: 124, revenue: 86800000, stock: 12 },
  { name: "5AC Classique Bag", sales: 86, revenue: 215000000, stock: 4 },
  { name: "Replica Sneakers", sales: 215, revenue: 129000000, stock: 45 },
];

// 🚀 FORMAT DATA RECHARTS
const CHART_DATA = [
  { name: 'H-6', revenue: 40000000 },
  { name: 'H-5', revenue: 65000000 },
  { name: 'H-4', revenue: 45000000 },
  { name: 'H-3', revenue: 80000000 },
  { name: 'H-2', revenue: 55000000 },
  { name: 'H-1', revenue: 90000000 },
  { name: 'Hari Ini', revenue: 75000000 },
];

// Tooltip Kustom untuk Grafik
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 text-white text-xs py-2 px-3 rounded-lg shadow-xl font-bold">
        {`Rp ${(payload[0].value / 1000000).toFixed(1)} Jt`}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const [timeframe, setTimeframe] = useState('7D');

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-32">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Pusat Komando</h1>
          <p className="text-sm text-gray-500 mt-1">Selamat datang kembali. Berikut adalah ringkasan bisnis Anda hari ini.</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm shrink-0">
          {['Hari Ini', '7D', '30D', 'Tahun Ini'].map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${timeframe === t ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              {t}
            </button>
          ))}
          <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400"><Calendar className="w-4 h-4" /></Button>
        </div>
      </div>

      {/* Metrics KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {MOCK_METRICS.map((metric, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                <metric.icon className="w-5 h-5" />
              </div>
              <Badge variant="outline" className={`flex items-center gap-1 ${metric.isPositive ? 'text-green-600 border-green-200 bg-green-50' : 'text-red-600 border-red-200 bg-red-50'}`}>
                {metric.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {metric.trend}
              </Badge>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{metric.label}</p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">{metric.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Chart & Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Kiri: Grafik & Order Terbaru (Porsi 2/3) */}
        <div className="lg:col-span-2 space-y-8 min-w-0">

          {/* 🚀 RECHARTS IMPLEMENTATION */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm w-full">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-800">Tren Pendapatan</h3>
                <p className="text-xs text-gray-400 mt-1">7 Hari Terakhir</p>
              </div>
              <h2 className="text-2xl font-black text-green-600">Rp 84.200.000</h2>
            </div>

            {/* Wrapper Grafik dengan Tinggi Tetap */}
            <div className="h-[250px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={CHART_DATA} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                  {/* Sumbu X: Nama Hari */}
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 'bold' }}
                    dy={10}
                  />

                  {/* Efek Hover Tooltip */}
                  <Tooltip
                    cursor={{ fill: '#F3F4F6', radius: [4, 4, 0, 0] }}
                    content={<CustomTooltip />}
                  />

                  {/* Batang Grafik */}
                  <Bar dataKey="revenue" radius={[4, 4, 0, 0]} maxBarSize={60}>
                    {CHART_DATA.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        // Warna biru pekat untuk 'Hari Ini' (data terakhir), sisanya biru muda
                        fill={index === CHART_DATA.length - 1 ? '#2563EB' : '#DBEAFE'}
                        className="transition-colors duration-300 hover:fill-blue-500"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tabel Pesanan Terbaru */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden w-full">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-800">Pesanan Terbaru</h3>
              <Button variant="ghost" size="sm" className="text-xs text-blue-600 h-8">Lihat Semua <ArrowRight className="w-3 h-3 ml-1" /></Button>
            </div>
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-sm text-gray-600 whitespace-nowrap">
                <thead className="bg-gray-50/50 text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                  <tr>
                    <th className="px-6 py-3">Order ID</th>
                    <th className="px-6 py-3">Pelanggan</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {MOCK_RECENT_ORDERS.map((order, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-3 font-medium text-gray-900">{order.id}</td>
                      <td className="px-6 py-3">
                        <p className="font-bold text-gray-900">{order.customer}</p>
                        <p className="text-[10px] text-gray-400">{order.time}</p>
                      </td>
                      <td className="px-6 py-3">
                        <Badge variant="outline" className={order.status === 'PAID' ? 'text-green-600 border-green-200 bg-green-50' : 'text-yellow-600 border-yellow-200 bg-yellow-50'}>
                          {order.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-3 text-right font-bold text-gray-900">
                        Rp {order.total.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Kanan: Top Produk & Aksi Cepat (Porsi 1/3) */}
        <div className="space-y-8 min-w-0">

          {/* Top Produk */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm w-full">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-800 mb-6 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" /> Produk Terlaris
            </h3>
            <div className="space-y-5">
              {MOCK_TOP_PRODUCTS.map((prod, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center font-bold text-gray-400 shrink-0 border border-gray-200">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">{prod.name}</p>
                    <p className="text-[10px] text-gray-500 mt-1">{prod.sales} terjual</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-green-600">Rp {(prod.revenue / 1000000).toFixed(1)}Jt</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-6 text-xs text-gray-500 border-dashed">Lihat Inventaris</Button>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-900 p-6 rounded-xl shadow-lg text-white relative overflow-hidden w-full">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-600/30 rounded-full blur-2xl"></div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-300 mb-6">Aksi Cepat</h3>
            <div className="space-y-3 relative z-10">
              <button className="w-full flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors group">
                <div className="flex items-center gap-3">
                  <Package className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold">Tambah Produk</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
              </button>
              <button className="w-full flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors group">
                <div className="flex items-center gap-3">
                  <Store className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold">Buka CMS Builder</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}