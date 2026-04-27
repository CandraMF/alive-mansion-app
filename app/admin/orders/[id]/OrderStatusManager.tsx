'use client';

import { useState } from 'react';
import { updateOrderStatusAction, syncOrderWithXenditAction } from '@/app/actions/admin-order';
import { Loader2, Check, RefreshCw } from 'lucide-react';

interface OrderStatusManagerProps {
  orderId: string;
  currentStatus: string;
  currentResi: string | null;
}

export default function OrderStatusManager({ orderId, currentStatus, currentResi }: OrderStatusManagerProps) {
  const [status, setStatus] = useState(currentStatus);
  const [resi, setResi] = useState(currentResi || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Fungsi Update Status & Resi
  const handleUpdate = async () => {
    setIsUpdating(true);
    const res = await updateOrderStatusAction(orderId, status, resi) as any;
    if (!res.success) {
      alert(res.error);
    } else {
      alert("Order updated successfully!");
    }
    setIsUpdating(false);
  };

  // Fungsi Sync Manual dengan Xendit
  const handleSyncXendit = async () => {
    setIsSyncing(true);
    const res = await syncOrderWithXenditAction(orderId) as any;
    if (!res.success) {
      alert(res.error);
    } else {
      alert(res.message);
    }
    setIsSyncing(false);
  };

  return (
    <div className="flex flex-col gap-4 w-full md:w-auto">
      {/* Tombol Sync Manual */}
      <button
        onClick={handleSyncXendit}
        disabled={isSyncing}
        className="flex items-center justify-end md:justify-end gap-2 text-[9px] font-bold uppercase tracking-widest text-blue-600 hover:text-blue-800 transition-colors"
      >
        {isSyncing ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
        Check Payment Status (Xendit)
      </button>

      <div className="bg-gray-50 border border-gray-200 p-4 flex flex-col sm:flex-row items-end gap-4 shadow-sm w-full md:w-[500px]">
        {/* Pilihan Status Pengiriman */}
        <div className="space-y-1 flex-1 w-full">
          <label className="text-[8px] font-bold uppercase tracking-widest text-gray-400">Order Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full h-9 bg-white border border-gray-200 px-3 text-[10px] font-bold uppercase outline-none focus:border-black transition-colors"
          >
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {/* Input No Resi */}
        <div className="space-y-1 flex-1 w-full">
          <label className="text-[8px] font-bold uppercase tracking-widest text-gray-400">Waybill / Resi</label>
          <input
            type="text"
            value={resi}
            onChange={(e) => setResi(e.target.value)}
            placeholder="ENTER RESI..."
            className="w-full h-9 bg-white border border-gray-200 px-3 text-[10px] font-bold uppercase outline-none focus:border-black transition-colors"
          />
        </div>

        {/* Tombol Update Status & Resi */}
        <button
          onClick={handleUpdate}
          disabled={isUpdating}
          className="h-9 bg-black text-white px-6 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 disabled:bg-gray-400 transition-all flex items-center justify-center gap-2 w-full sm:w-auto shrink-0"
        >
          {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Update
        </button>
      </div>
    </div>
  );
}