'use client';

import { Truck, Loader2 } from 'lucide-react';

const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
};

interface ShippingSectionProps {
  selectedAddress: any;
  shippingOptions: any[];
  selectedShipping: any;
  onSelectShipping: (opt: any) => void;
  isLoading: boolean;
}

export default function ShippingSection({ selectedAddress, shippingOptions, selectedShipping, onSelectShipping, isLoading }: ShippingSectionProps) {
  if (!selectedAddress) return null;

  return (
    <section className="animate-in fade-in bg-white p-6 md:p-8 border border-gray-100 shadow-sm">
      <div className="flex items-center gap-3 mb-8">
        <Truck className="w-5 h-5" />
        <h2 className="text-xs font-bold uppercase tracking-[0.2em]">Shipping Method</h2>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-200" /></div>
      ) : shippingOptions.length === 0 ? (
         <p className="text-[10px] text-center text-gray-400 uppercase tracking-widest py-8">No couriers available for this destination.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {shippingOptions.map((opt, idx) => {
            const courierName = opt.name ? opt.name.split(' ')[0].toUpperCase() : 'KURIR';
            
            // 🚀 FIX: Bikin variabel pengecekan yang Unik (Nama Kurir + Layanan)
            const isSelected = selectedShipping?.name === opt.name && selectedShipping?.service === opt.service;

            return (
              <label key={idx} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-5 border cursor-pointer transition-all ${isSelected ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-300 bg-white'}`}>
                
                {/* Tambahkan checked attribute agar sinkron dengan DOM */}
                <input 
                  type="radio" 
                  name="shipping" 
                  className="hidden" 
                  checked={isSelected}
                  onChange={() => onSelectShipping(opt)} 
                />
                
                <div className="flex items-center gap-4 mb-2 sm:mb-0">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'border-black' : 'border-gray-200'}`}>
                    {isSelected && <div className="w-2 h-2 bg-black rounded-full" />}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em]">{courierName} {opt.service || 'REG'}</p>
                    <p className="text-[9px] text-gray-400 uppercase mt-1">Est. {opt.etd || '-'} Days</p>
                  </div>
                </div>
                <p className="text-sm font-bold pl-8 sm:pl-0">{formatRupiah(opt.cost)}</p>
              </label>
            );
          })}
        </div>
      )}
    </section>
  );
}