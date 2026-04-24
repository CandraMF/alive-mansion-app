'use client';

import { useState, useEffect } from 'react';
import { getFeesAction, createFeeAction, toggleFeeStatusAction, deleteFeeAction } from '@/app/actions/fee';
import { Plus, Trash2, AlertCircle, Loader2, Receipt, CheckCircle2, XCircle } from 'lucide-react';

const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
};

export default function AdminFeesPage() {
  const [fees, setFees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    isPercentage: false
  });

  const loadFees = async () => {
    setIsLoading(true);
    try {
      const data = await getFeesAction();
      setFees(data);
    } catch (err) {
      console.error("Failed to load fees");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFees();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (!formData.name || !formData.amount || Number(formData.amount) <= 0) {
      setError('Fee name and amount are required.');
      setIsSubmitting(false);
      return;
    }

    const res = await createFeeAction({
      name: formData.name,
      amount: Number(formData.amount),
      isPercentage: formData.isPercentage,
    });

    if (res?.error) {
      setError(res.error);
    } else {
      setIsModalOpen(false);
      setFormData({ name: '', amount: '', isPercentage: false });
      loadFees();
    }
    setIsSubmitting(false);
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    await toggleFeeStatusAction(id, !currentStatus);
    loadFees();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this fee permanently? It will not affect past orders.")) {
      await deleteFeeAction(id);
      loadFees();
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto font-sans">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-2xl font-serif italic text-gray-900 mb-1 flex items-center gap-2">
            <Receipt className="w-6 h-6" /> Store Fees
          </h1>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">
            Manage additional service and handling charges
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-black text-white px-6 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add New Fee
        </button>
      </div>

      <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-100 text-[10px] uppercase tracking-widest text-gray-500 font-bold">
              <tr>
                <th className="px-6 py-4">Fee Name</th>
                <th className="px-6 py-4">Charge Value</th>
                <th className="px-6 py-4">Type</th>
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
              ) : fees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    <Receipt className="w-8 h-8 mx-auto mb-3 opacity-20" />
                    <p className="uppercase tracking-widest text-[10px] font-bold">No active fees.</p>
                  </td>
                </tr>
              ) : (
                fees.map((fee) => (
                  <tr key={fee.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-black">{fee.name}</td>
                    <td className="px-6 py-4 font-bold">
                      {fee.isPercentage ? `${fee.amount}%` : formatRupiah(fee.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block bg-gray-100 px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-gray-600 rounded-sm">
                        {fee.isPercentage ? 'Percentage' : 'Fixed Amount'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleToggleStatus(fee.id, fee.isActive)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest rounded-sm transition-colors ${
                          fee.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        {fee.isActive ? <><CheckCircle2 className="w-3 h-3"/> Active</> : <><XCircle className="w-3 h-3"/> Inactive</>}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDelete(fee.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors p-2"
                        title="Delete Fee"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 rounded-lg">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-sm font-bold uppercase tracking-widest">Create New Fee</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-black text-xl">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 flex items-start gap-2 rounded-md">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] font-medium text-red-700">{error}</p>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Fee Name (e.g. Service Fee)</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full h-10 px-3 text-sm border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:border-black transition-colors rounded-md"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Fee Type</label>
                  <select 
                    value={formData.isPercentage ? 'true' : 'false'}
                    onChange={(e) => setFormData({...formData, isPercentage: e.target.value === 'true'})}
                    className="w-full h-10 px-3 text-sm border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:border-black transition-colors rounded-md"
                  >
                    <option value="false">Nominal (Rp)</option>
                    <option value="true">Percentage (%)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Value</label>
                  <input 
                    type="number" 
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    placeholder={formData.isPercentage ? "e.g. 5" : "e.g. 2500"}
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
                  {isSubmitting ? 'Saving...' : 'Save Fee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}