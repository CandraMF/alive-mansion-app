'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Ticket, CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react';
import { claimVoucherAction } from '@/app/actions/voucher';
import { getCheckoutDataAction } from '@/app/actions/checkout';

const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
};

interface SummarySectionProps {
  checkoutItems: any[];
  subtotal: number;
  shippingCost: number;
  storeFees: any[];
  discountAmount: number;
  isShippingDiscount: boolean;
  totalAmount: number;
  
  availableVouchers: any[];
  selectedVoucher: any;
  onSelectVoucher: (v: any) => void;
  onRefreshVouchers: (vouchers: any[]) => void;
  
  onPayment: () => void;
  isProcessingPay: boolean;
  isReadyToPay: boolean;
}

export default function SummarySection({
  checkoutItems, subtotal, shippingCost, storeFees, discountAmount, isShippingDiscount, totalAmount,
  availableVouchers, selectedVoucher, onSelectVoucher, onRefreshVouchers,
  onPayment, isProcessingPay, isReadyToPay
}: SummarySectionProps) {
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [claimCode, setClaimCode] = useState('');
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimMessage, setClaimMessage] = useState<{type: 'error'|'success', text: string} | null>(null);

  useEffect(() => {
    const handlePopState = () => { if (isModalOpen) setIsModalOpen(false); };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isModalOpen]);

  const openModal = () => { window.history.pushState({ modal: 'voucher' }, ''); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); if (window.history.state?.modal) window.history.back(); };

  const handleApplyPromoCode = async () => {
    if (!claimCode) return;
    setIsClaiming(true); setClaimMessage(null);
    const cleanCode = claimCode.toUpperCase().replace(/\s+/g, '');

    const inWallet = availableVouchers.find(v => v.promo.code === cleanCode);
    if (inWallet) {
      if (subtotal >= inWallet.promo.minPurchase) {
        onSelectVoucher(inWallet); setClaimMessage({ type: 'success', text: 'Voucher applied!' }); setClaimCode('');
      } else {
        setClaimMessage({ type: 'error', text: `Min. spend ${formatRupiah(inWallet.promo.minPurchase)} required.` });
      }
      setIsClaiming(false); return;
    }

    const res = await claimVoucherAction(cleanCode);
    if (res.error) {
      setClaimMessage({ type: 'error', text: res.error });
    } else {
      const data = await getCheckoutDataAction();
      onRefreshVouchers(data.vouchers);
      const newlyClaimed = data.vouchers.find((v: any) => v.promo.code === cleanCode);
      if (newlyClaimed && subtotal >= newlyClaimed.promo.minPurchase) {
        onSelectVoucher(newlyClaimed); setClaimMessage({ type: 'success', text: 'Voucher claimed & applied!' });
      } else {
        setClaimMessage({ type: 'success', text: 'Voucher saved to wallet.' });
      }
      setClaimCode('');
    }
    setIsClaiming(false);
  };

  return (
    <>
      <div className="bg-white border border-gray-100 p-6 md:p-10 sticky top-32 shadow-sm">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] mb-8 border-b border-gray-50 pb-6">Order Summary</h2>
        
        <div className="space-y-6 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {checkoutItems.map((item) => (
            <div key={`${item.id}-${item.size}`} className="flex gap-4 items-center">
              <div className="w-14 aspect-[3/4] relative bg-gray-50 flex-shrink-0 border border-gray-100">
                <Image src={item.image} alt={item.name} fill className="object-cover" />
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <p className="text-[10px] font-bold uppercase tracking-wider">{item.name}</p>
                <p className="text-[9px] text-gray-400 uppercase mt-1">{item.color} &bull; {item.size} &bull; Qty: {item.quantity}</p>
              </div>
              <p className="text-[10px] font-bold self-center">{formatRupiah(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>

        {/* VOUCHER SECTION */}
        <div className="mb-8 border-t border-gray-50 pt-8">
          {selectedVoucher ? (
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-100 mb-4 animate-in fade-in duration-300">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-[10px] font-bold uppercase text-green-800 tracking-wider">{selectedVoucher.promo.code}</p>
                  <p className="text-[8px] uppercase tracking-[0.1em] text-green-600 mt-0.5">{selectedVoucher.promo.type === 'SHIPPING' ? 'Free Shipping Subsidy' : 'Voucher Applied'}</p>
                </div>
              </div>
              <button type="button" onClick={() => { onSelectVoucher(null); setClaimMessage(null); }} className="text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
            </div>
          ) : (
            <div className="mb-4 space-y-3">
              <div className="flex gap-2">
                <input type="text" placeholder="DISCOUNT CODE" value={claimCode} onChange={(e) => setClaimCode(e.target.value.toUpperCase())} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleApplyPromoCode(); } }} className="flex-1 h-12 px-4 border border-gray-200 bg-gray-50 outline-none focus:border-black text-[10px] font-bold tracking-widest uppercase" />
                <button type="button" onClick={handleApplyPromoCode} disabled={isClaiming || !claimCode} className="bg-black text-white px-6 h-12 text-[10px] font-bold tracking-widest uppercase disabled:bg-gray-200">{isClaiming ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}</button>
              </div>
              {claimMessage && (
                <div className={`flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest ${claimMessage.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>
                  {claimMessage.type === 'error' ? <AlertCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />} {claimMessage.text}
                </div>
              )}
            </div>
          )}
          {!selectedVoucher && (
            <button type="button" onClick={openModal} className="w-full flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black py-2">
              <span className="flex items-center gap-2"><Ticket className="w-4 h-4" /> View Wallet</span>
              {availableVouchers.length > 0 && <span className="text-[8px] bg-gray-100 px-1.5 py-0.5">{availableVouchers.length} Available</span>}
            </button>
          )}
        </div>

        {/* TOTALS */}
        <div className="space-y-4 mb-8 pt-4 border-t border-gray-50">
          <div className="flex justify-between text-[10px] uppercase tracking-[0.2em] text-gray-500"><span>Subtotal</span><span className="font-bold text-black">{formatRupiah(subtotal)}</span></div>
          <div className="flex justify-between text-[10px] uppercase tracking-[0.2em] text-gray-500">
            <span>Shipping</span>
            <div className="text-right">
              {isShippingDiscount && discountAmount > 0 && <span className="line-through text-gray-300 mr-2">{formatRupiah(shippingCost)}</span>}
              <span className="font-bold text-black">{shippingCost === 0 ? '-' : isShippingDiscount ? formatRupiah(Math.max(0, shippingCost - discountAmount)) : formatRupiah(shippingCost)}</span>
            </div>
          </div>
          {storeFees.map(fee => (
            <div key={fee.id} className="flex justify-between text-[10px] uppercase tracking-[0.2em] text-gray-500"><span>{fee.name}</span><span className="font-bold text-black">{formatRupiah(fee.calculatedAmount)}</span></div>
          ))}
          {!isShippingDiscount && discountAmount > 0 && (
            <div className="flex justify-between text-[10px] uppercase tracking-[0.2em] text-green-600 font-bold"><span>Voucher Discount</span><span>- {formatRupiah(discountAmount)}</span></div>
          )}
        </div>

        <div className="border-t border-black pt-6 mb-8 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-[0.3em]">Total</span>
          <span className="text-xl md:text-2xl font-serif italic font-bold">{formatRupiah(totalAmount)}</span>
        </div>
        
        {/* DESKTOP BUTTON */}
        <button type="button" onClick={onPayment} disabled={!isReadyToPay || isProcessingPay} className="hidden lg:flex justify-center w-full bg-black text-white text-center py-5 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-gray-800 disabled:bg-gray-300">
          {isProcessingPay ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Complete Order'}
        </button>
      </div>

      {/* VOUCHER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-4 md:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em]">My Voucher Wallet</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-black"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-4 md:p-6 max-h-[60vh] overflow-y-auto bg-gray-50 space-y-4">
              {availableVouchers.length === 0 ? (
                <div className="text-center py-12"><Ticket className="w-10 h-10 mx-auto text-gray-200 mb-4" /><p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Your wallet is empty</p></div>
              ) : (
                availableVouchers.map((v) => {
                  const isValid = subtotal >= v.promo.minPurchase;
                  return (
                    <div key={v.id} className={`p-4 md:p-6 border relative bg-white ${isValid ? 'border-gray-200' : 'opacity-60 grayscale'}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xl md:text-2xl font-serif italic text-black">{v.promo.type === 'PERCENTAGE' ? `${v.promo.value}% OFF` : v.promo.type === 'NOMINAL' ? formatRupiah(v.promo.value) : 'Free Shipping'}</p>
                          <h3 className="text-[10px] font-bold uppercase tracking-[0.1em] mt-1 text-gray-500">{v.promo.name}</h3>
                        </div>
                        {isValid && <button onClick={() => { onSelectVoucher(v); closeModal(); }} className="bg-black text-white px-5 py-2 text-[8px] font-bold uppercase tracking-widest">Use</button>}
                      </div>
                      <div className="pt-4 mt-4 border-t border-dashed flex justify-between text-[8px] text-gray-400 uppercase font-bold">
                        <span>Min. Spend: {formatRupiah(v.promo.minPurchase)}</span>
                        <span>{v.promo.maxDiscount ? `Up to ${formatRupiah(v.promo.maxDiscount)}` : 'Unlimited'}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}