'use client';

import { useState, useEffect } from 'react';
import {
  getPromosAction,
  createPromoAction,
  togglePromoStatusAction,
  deletePromoAction
} from '@/app/actions/promo';
import { Plus, Trash2, AlertCircle, Loader2, Tag, Ticket, CheckCircle2, XCircle } from 'lucide-react';

const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
};

const formatDate = (dateString: string | Date) => {
  return new Intl.DateTimeFormat('en-US', { 
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  }).format(new Date(dateString));
};

export default function AdminPromosPage() {
  const [promos, setPromos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'PERCENTAGE',
    value: 0,
    audience: 'ALL_USERS',
    quotaTotal: 0, 
    maxClaimsPerUser: 1,
    startDate: '',
    endDate: '',
    // 🚀 STATE BARU
    minPurchase: 0,
    maxDiscount: '', // Gunakan string kosong agar bisa membedakan 0 dan "tidak ada batas"
  });

  const loadPromos = async () => {
    setIsLoading(true);
    try {
      const data = await getPromosAction();
      setPromos(data);
    } catch (err) {
      console.error("Failed to load promos");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPromos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (!formData.code || !formData.name || formData.value <= 0) {
      setError('Code, Name, and Discount Value are required.');
      setIsSubmitting(false);
      return;
    }

    const res = await createPromoAction({
      ...formData,
      value: Number(formData.value),
      quotaTotal: formData.quotaTotal > 0 ? Number(formData.quotaTotal) : null,
      maxClaimsPerUser: Number(formData.maxClaimsPerUser),
      startDate: formData.startDate || undefined,
      endDate: formData.endDate || undefined,
      // 🚀 DATA BARU UNTUK SERVER
      minPurchase: Number(formData.minPurchase),
      maxDiscount: formData.maxDiscount !== '' ? Number(formData.maxDiscount) : null,
    });

    if (res?.error) {
      setError(res.error);
    } else {
      setIsModalOpen(false);
      setFormData({ 
        code: '', name: '', type: 'PERCENTAGE', value: 0, audience: 'ALL_USERS', 
        quotaTotal: 0, maxClaimsPerUser: 1, startDate: '', endDate: '', minPurchase: 0, maxDiscount: '' 
      });
      loadPromos();
    }
    setIsSubmitting(false);
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    await togglePromoStatusAction(id, !currentStatus);
    loadPromos();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this promo permanently?")) {
      await deletePromoAction(id);
      loadPromos();
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto font-sans">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-2xl font-serif italic text-gray-900 mb-1 flex items-center gap-2">
            <Ticket className="w-6 h-6" /> Promo & Vouchers
          </h1>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">
            Manage your discount codes and user claims
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-black text-white px-6 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create Promo
        </button>
      </div>

      <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-100 text-[10px] uppercase tracking-widest text-gray-500 font-bold">
              <tr>
                <th className="px-6 py-4">Promo Details</th>
                <th className="px-6 py-4">Value & Conditions</th>
                <th className="px-6 py-4">Audience</th>
                <th className="px-6 py-4">Usage & Quota</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading data...
                  </td>
                </tr>
              ) : promos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
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
                      <div className="text-[9px] text-orange-600 uppercase tracking-widest mt-1">
                        {promo.endDate ? `Exp: ${formatDate(promo.endDate)}` : 'No Expiry'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold">
                        {promo.type === 'PERCENTAGE' ? `${promo.value}% OFF` :
                          promo.type === 'NOMINAL' ? formatRupiah(promo.value) : 'FREE SHIPPING'}
                      </div>
                      {/* 🚀 TAMPILKAN KONDISI MIN PURCHASE & MAX DISCOUNT */}
                      <div className="text-[9px] text-gray-400 uppercase tracking-widest mt-1 space-y-0.5">
                        <p>Min. {formatRupiah(promo.minPurchase)}</p>
                        {promo.maxDiscount && promo.type === 'PERCENTAGE' && (
                          <p className="text-blue-500">Max. {formatRupiah(promo.maxDiscount)}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block bg-gray-100 px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-gray-600 rounded-sm">
                        {promo.audience.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[10px] font-medium text-gray-900">
                        Claimed: {promo._count.claimedVouchers} {promo.quotaTotal ? `/ ${promo.quotaTotal}` : '(No Limit)'}
                      </div>
                      <div className="text-[9px] text-gray-500 uppercase tracking-widest mt-1">
                        Max {promo.maxClaimsPerUser} / user
                      </div>
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-white w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 rounded-lg my-8">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 sticky top-0 z-10">
              <h2 className="text-sm font-bold uppercase tracking-widest">Create New Promo</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-black text-xl">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 flex items-start gap-2 rounded-md">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] font-medium text-red-700">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Promo Code</label>
                  <input
                    type="text"
                    placeholder="e.g. WELCOME50"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full h-10 px-3 text-sm border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:border-black transition-colors uppercase rounded-md"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Campaign Name</label>
                  <input
                    type="text"
                    placeholder="e.g. New Year Sale"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-10 px-3 text-sm border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:border-black transition-colors rounded-md"
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
                    className="w-full h-10 px-3 text-sm border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:border-black transition-colors rounded-md"
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
                    className="w-full h-10 px-3 text-sm border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:border-black transition-colors rounded-md"
                    required
                  />
                </div>
              </div>

              {/* 🚀 TAMBAHAN: FIELD MIN PURCHASE & MAX DISCOUNT */}
              <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Min. Purchase (Rp)</label>
                  <input
                    type="number"
                    placeholder="e.g. 100000"
                    value={formData.minPurchase || ''}
                    onChange={(e) => setFormData({ ...formData, minPurchase: Number(e.target.value) })}
                    className="w-full h-10 px-3 text-sm border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:border-black transition-colors rounded-md"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    Max Discount (Rp) {formData.type !== 'PERCENTAGE' && '- Disabled'}
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 50000 (Empty = Uncapped)"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                    disabled={formData.type !== 'PERCENTAGE'}
                    className="w-full h-10 px-3 text-sm border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:border-black transition-colors rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Start Date (Optional)</label>
                  <input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full h-10 px-3 text-sm border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:border-black transition-colors rounded-md"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">End Date / Expiry (Optional)</label>
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full h-10 px-3 text-sm border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:border-black transition-colors rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 border-t border-gray-100 pt-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Target Audience</label>
                  <select
                    value={formData.audience}
                    onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                    className="w-full h-10 px-3 text-sm border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:border-black transition-colors rounded-md"
                  >
                    <option value="ALL_USERS">All Users</option>
                    <option value="NEW_USERS_ONLY">New Users Only</option>
                    <option value="SPECIFIC_USERS">Specific Users</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Total Quota (0 = Unlim)</label>
                  <input
                    type="number"
                    value={formData.quotaTotal || ''}
                    onChange={(e) => setFormData({ ...formData, quotaTotal: Number(e.target.value) })}
                    className="w-full h-10 px-3 text-sm border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:border-black transition-colors rounded-md"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Max Claims / User</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxClaimsPerUser}
                    onChange={(e) => setFormData({ ...formData, maxClaimsPerUser: Number(e.target.value) })}
                    className="w-full h-10 px-3 text-sm border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:border-black transition-colors rounded-md"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:bg-gray-100 transition-colors rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 bg-black text-white py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-900 transition-colors disabled:bg-gray-300 rounded-md"
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