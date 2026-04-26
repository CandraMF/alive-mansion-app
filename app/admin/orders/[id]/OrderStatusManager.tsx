'use client';

import { useState } from 'react';
import { updateOrderStatusAction } from '@/app/actions/admin-order';
import { Loader2, Check } from 'lucide-react';

export default function OrderStatusManager({ orderId, currentStatus, currentResi }: { orderId: string, currentStatus: string, currentResi: string }) {
  const [status, setStatus] = useState(currentStatus);
  const [resi, setResi] = useState(currentResi);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    setIsUpdating(true);
    const res = await updateOrderStatusAction(orderId, status, resi);
    if (!res.success) alert(res.error);
    else alert("Order updated successfully!");
    setIsUpdating(false);
  };

  return (
    <div className="bg-gray-50 border border-gray-200 p-4 flex flex-col sm:flex-row items-end gap-4 shadow-sm">
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

      <button 
        onClick={handleUpdate}
        disabled={isUpdating}
        className="h-9 bg-black text-white px-6 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 disabled:bg-gray-400 transition-all flex items-center gap-2"
      >
        {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Update
      </button>
    </div>
  );
}