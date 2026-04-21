'use client';

import { useState, useEffect } from 'react';
import {
  getPromosAction,
  createPromoAction,
  togglePromoStatusAction,
  deletePromoAction
} from '@/app/actions/promo';
import { Plus, Trash2, AlertCircle, Loader2, Tag, Ticket, CheckCircle2, XCircle } from 'lucide-react';

// Format Rupiah
const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
};

export default function AdminPromosPage() {
  const [promos, setPromos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form States
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'PERCENTAGE',
    value: 0,
    minPurchase: 0,
    audience: 'ALL_USERS',
  });

  // Load Data
  const loadPromos = async () => {
    setIsLoading(true);
    try {
      const data = await getPromosAction();
      setPromos(data);
    } catch (err) {
      console.error("Gagal memuat promo");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPromos();
  }, []);

  // Handle Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Validasi sederhana
    if (!formData.code || !formData.name || formData.value <= 0) {
      setError('Kode, Nama, dan Nilai Diskon wajib diisi dengan benar.');
      setIsSubmitting(false);
      return;
    }

    const res = await createPromoAction({
      ...formData,
      value: Number(formData.value),
      minPurchase: Number(formData.minPurchase),
    });

    if (res.error) {
      setError(res.error);
    } else {
      setIsModalOpen(false);
      setFormData({ code: '', name: '', type: 'PERCENTAGE', value: 0, minPurchase: 0, audience: 'ALL_USERS' }); // Reset form
      loadPromos(); // Refresh tabel
    }
    setIsSubmitting(false);
  };

  // Handle Toggle Status
  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    await togglePromoStatusAction(id, !currentStatus);
    loadPromos(); // Refresh tabel
  };

  // Handle Delete
  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus voucher ini permanen?")) {
      await deletePromoAction(id);
      loadPromos(); // Refresh tabel
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto font-sans">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-2xl font-serif italic text-gray-900 mb-1 flex items-center gap-2">
            <Ticket className="w-6 h-6" /> Promo & Vouchers
          </h1>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">
            Manage your discount codes and marketing campaigns
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-black text-white px-6 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create Promo
        </button>
      </div>

      {/* Tabel Data */}
      <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-100 text-[10px] uppercase tracking-widest text-gray-500 font-bold">
              <tr>
                <th className="px-6 py-4">Promo Code</th>
                <th className="px-6 py-4">Value</th>
                <th className="px-6 py-4">Target Audience</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading data...
                  </td>
                </tr>
              ) : promos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    <Tag className="w-8 h-8 mx-auto mb-3 opacity-20" />
                    <p className="uppercase tracking-widest text-[10px] font-bold">No promos found.</p>
                  </td>
                </tr>
              ) : (
                promos.map((promo) => (
                  <tr key={promo.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-black text-sm">{promo.code}</div>
                      <div className="text-[10px] text-gray-500">{promo.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold">
                        {promo.type === 'PERCENTAGE' ? `${promo.value}% OFF` :
                          promo.type === 'NOMINAL' ? formatRupiah(promo.value) : 'FREE SHIPPING'}
                      </div>
                      <div className="text-[9px] text-gray-400 uppercase tracking-widest mt-1">
                        Min. {formatRupiah(promo.minPurchase)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block bg-gray-100 px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-gray-600 rounded-sm">
                        {promo.audience.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(promo.id, promo.isActive)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest rounded-sm transition-colors ${promo.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }`}
                      >
                        {promo.isActive ? <><CheckCircle2 className="w-3 h-3" /> Active</> : <><XCircle className="w-3 h-3" /> Inactive</>}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(promo.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors p-2"
                        title="Delete Promo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Buat Promo Baru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-sm font-bold uppercase tracking-widest">Create New Promo</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-black text-xl">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] font-medium text-red-700">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2 md:col-span-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Promo Code</label>
                  <input
                    type="text"
                    placeholder="e.g. WELCOME50"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full h-10 px-3 text-sm border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:border-black transition-colors uppercase"
                    required
                  />
                </div>
                <div className="space-y-1.5 col-span-2 md:col-span-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Campaign Name</label>
                  <input
                    type="text"
                    placeholder="e.g. New Year Sale"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-10 px-3 text-sm border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:border-black transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Discount Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full h-10 px-3 text-sm border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:border-black transition-colors"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="NOMINAL">Nominal (Rp)</option>
                    <option value="SHIPPING">Free Shipping</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Value</label>
                  <input
                    type="number"
                    placeholder={formData.type === 'PERCENTAGE' ? "e.g. 20" : "e.g. 50000"}
                    value={formData.value || ''}
                    onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                    className="w-full h-10 px-3 text-sm border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:border-black transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Target Audience</label>
                <select
                  value={formData.audience}
                  onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                  className="w-full h-10 px-3 text-sm border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:border-black transition-colors"
                >
                  <option value="ALL_USERS">All Users</option>
                  <option value="NEW_USERS_ONLY">New Users Only</option>
                  <option value="SPECIFIC_USERS">Specific Users (Voucher Apology / VIP)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Minimum Purchase (Rp)</label>
                <input
                  type="number"
                  value={formData.minPurchase || ''}
                  onChange={(e) => setFormData({ ...formData, minPurchase: Number(e.target.value) })}
                  className="w-full h-10 px-3 text-sm border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:border-black transition-colors"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:bg-gray-100 transition-colors border border-transparent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-black text-white py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-900 transition-colors disabled:bg-gray-300"
                >
                  {isSubmitting ? 'Saving...' : 'Save Promo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}