'use client';

import { useCart } from '@/hooks/useCart';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Loader2, MapPin, Truck, FileText, Search, Ticket, CheckCircle2, AlertCircle } from 'lucide-react';
import { getCheckoutDataAction } from '@/app/actions/checkout';

const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
};

export default function CheckoutPage() {
  const cart = useCart();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  // ==========================================
  // STATE DATA CHECKOUT (API)
  // ==========================================
  const [availableVouchers, setAvailableVouchers] = useState<any[]>([]);
  const [storeFees, setStoreFees] = useState<any[]>([]);
  const [isCheckoutDataLoading, setIsCheckoutDataLoading] = useState(true);

  // ==========================================
  // STATE FORM & PENGIRIMAN
  // ==========================================
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', street: '', postalCode: '', notes: '' });
  
  const [searchKeyword, setSearchKeyword] = useState('');
  const [destinations, setDestinations] = useState<any[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<any>(null);

  // 🚀 STATE VOUCHER
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);

  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingShipping, setIsLoadingShipping] = useState(false);
  const [isProcessingPay, setIsProcessingPay] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // ==========================================
  // INITIAL LOAD
  // ==========================================
  useEffect(() => {
    setIsMounted(true);
    
    // Ambil Data Fees & Vouchers dari Database
    const fetchCheckoutData = async () => {
      try {
        const data = await getCheckoutDataAction();
        setStoreFees(data.fees);
        setAvailableVouchers(data.vouchers);
      } catch (error) {
        console.error("Gagal load checkout data", error);
      } finally {
        setIsCheckoutDataLoading(false);
      }
    };
    fetchCheckoutData();

    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ==========================================
  // LOGIKA PENCARIAN & ONGKIR (KOMERCE)
  // ==========================================
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchKeyword.length >= 3 && !selectedDestination) handleSearchLocation(searchKeyword);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchKeyword]);

  const handleSearchLocation = async (keyword: string) => {
    setIsSearching(true);
    try {
      const res = await fetch(`/api/rajaongkir/locations?keyword=${keyword}`);
      const data = await res.json();
      if (data.success) { setDestinations(data.data); setShowDropdown(true); }
    } catch (error) { console.error("Error search", error); } 
    finally { setIsSearching(false); }
  };

  const handleSelectDestination = (dest: any) => {
    setSelectedDestination(dest);
    setSearchKeyword(`${dest.subdistrict_name}, ${dest.city_name}, ${dest.province_name}`);
    setShowDropdown(false);
    handleCalculateShipping(dest.id);
  };

  const handleCalculateShipping = async (destinationId: string) => {
    setIsLoadingShipping(true);
    setShippingOptions([]);
    setSelectedShipping(null);
    try {
      const totalWeight = cart.items.reduce((total, item) => total + (500 * item.quantity), 0) || 500;
      const res = await fetch('/api/rajaongkir/cost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originCityId: '152', destinationCityId: destinationId, weightInGrams: totalWeight, courier: 'jne' })
      });
      const data = await res.json();
      if (data.success) setShippingOptions(data.data);
    } catch (error) { console.error("Error calc", error); } 
    finally { setIsLoadingShipping(false); }
  };

  // ==========================================
  // 🚀 KALKULASI TOTAL (Subtotal + Ongkir + Fee - Diskon)
  // ==========================================
  if (!isMounted) return null;

  const subtotal = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shippingCost = selectedShipping ? selectedShipping.cost : 0;

  // Hitung Fees (Biaya Layanan Admin)
  const calculatedFees = storeFees.map(fee => {
    const amount = fee.isPercentage ? (subtotal * (fee.amount / 100)) : fee.amount;
    return { ...fee, calculatedAmount: amount };
  });
  const totalFeesAmount = calculatedFees.reduce((acc, curr) => acc + curr.calculatedAmount, 0);

  // Hitung Diskon Voucher
  let discountAmount = 0;
  if (selectedVoucher) {
    const promo = selectedVoucher.promo;
    if (subtotal >= promo.minPurchase) {
      if (promo.type === 'PERCENTAGE') {
        let calc = subtotal * (promo.value / 100);
        discountAmount = (promo.maxDiscount && calc > promo.maxDiscount) ? promo.maxDiscount : calc;
      } else if (promo.type === 'NOMINAL') {
        discountAmount = promo.value;
      } else if (promo.type === 'SHIPPING') {
        let calc = shippingCost; // Gratis Ongkir
        discountAmount = (promo.maxDiscount && calc > promo.maxDiscount) ? promo.maxDiscount : calc;
      }
    } else {
      // Jika syarat minPurchase tidak terpenuhi (karena user menghapus item di keranjang)
      setSelectedVoucher(null); 
    }
  }

  // Jaring Pengaman: Total tidak boleh minus
  let totalAmount = (subtotal + shippingCost + totalFeesAmount) - discountAmount;
  if (totalAmount < 0) totalAmount = 0;

  // ==========================================
  // SUBMIT PAYMENT
  // ==========================================
  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShipping) return alert("Please select a shipping method.");
    setIsProcessingPay(true);
    
    // TAHAP SELANJUTNYA: DATABASE & XENDIT
    console.log("READY UNTUK XENDIT:", {
      formData, selectedDestination, selectedShipping, calculatedFees, selectedVoucher, 
      subtotal, shippingCost, totalFeesAmount, discountAmount, totalAmount
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-24 font-sans text-black relative">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <h1 className="text-3xl font-bold uppercase tracking-tighter mb-12">Checkout</h1>

        <form onSubmit={handlePayment} className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* KOLOM KIRI */}
          <div className="lg:col-span-7 space-y-12">
            
            {/* 1. Contact Information */}
            <section className="bg-white p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <FileText className="w-5 h-5" />
                <h2 className="text-xs font-bold uppercase tracking-[0.2em]">Contact Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Full Name</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full h-12 px-4 bg-gray-50 border-transparent focus:bg-white focus:border-black outline-none text-sm transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Email Address</label>
                  <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full h-12 px-4 bg-gray-50 border-transparent focus:bg-white focus:border-black outline-none text-sm transition-all" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Phone Number</label>
                  <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full h-12 px-4 bg-gray-50 border-transparent focus:bg-white focus:border-black outline-none text-sm transition-all" />
                </div>
              </div>
            </section>

            {/* 2. Shipping Destination */}
            <section className="bg-white p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <MapPin className="w-5 h-5" />
                <h2 className="text-xs font-bold uppercase tracking-[0.2em]">Delivery Destination</h2>
              </div>
              
              <div className="space-y-6">
                <div className="relative" ref={searchRef}>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Search District or City</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Type at least 3 characters (e.g. 'Kebayoran')" 
                      value={searchKeyword}
                      onChange={(e) => {
                        setSearchKeyword(e.target.value);
                        if (selectedDestination) setSelectedDestination(null);
                      }}
                      className="w-full h-12 pl-12 pr-4 bg-gray-50 border-transparent focus:bg-white focus:border-black outline-none text-sm transition-all"
                    />
                    {isSearching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />}
                  </div>

                  {/* Dropdown Komerce */}
                  {showDropdown && destinations.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-100 shadow-xl max-h-60 overflow-y-auto">
                      {destinations.map((dest) => (
                        <button 
                          key={dest.id} type="button" onClick={() => handleSelectDestination(dest)}
                          className="w-full text-left px-6 py-4 hover:bg-gray-50 border-b border-gray-50 last:border-0"
                        >
                          <p className="text-[11px] font-bold uppercase tracking-tight">{dest.subdistrict_name}, {dest.city_name}</p>
                          <p className="text-[9px] text-gray-500 uppercase tracking-widest mt-1">{dest.province_name} - {dest.zip_code}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Street Address & Details</label>
                  <textarea required rows={3} value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} className="w-full p-4 bg-gray-50 border-transparent focus:bg-white focus:border-black outline-none text-sm transition-all resize-none" placeholder="Jl. Sudirman No. 1, Apartment X..." />
                </div>
              </div>
            </section>

            {/* 3. Shipping Method */}
            {selectedDestination && (
              <section className="animate-in fade-in bg-white p-8 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                  <Truck className="w-5 h-5" />
                  <h2 className="text-xs font-bold uppercase tracking-[0.2em]">Shipping Method</h2>
                </div>

                {isLoadingShipping ? (
                  <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-200" /></div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {shippingOptions.map((opt, idx) => (
                      <label key={idx} className={`flex items-center justify-between p-5 border cursor-pointer transition-all ${selectedShipping?.service === opt.service ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-300 bg-white'}`}>
                        <input type="radio" name="shipping" className="hidden" onChange={() => setSelectedShipping(opt)} />
                        <div className="flex items-center gap-4">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedShipping?.service === opt.service ? 'border-black' : 'border-gray-200'}`}>
                            {selectedShipping?.service === opt.service && <div className="w-2 h-2 bg-black rounded-full" />}
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em]">JNE {opt.service || opt.name || 'REG'}</p>
                            <p className="text-[9px] text-gray-400 uppercase mt-1">Estimation: {opt.etd || '-'} Days</p>
                          </div>
                        </div>
                        <p className="text-sm font-bold">{formatRupiah(opt.cost)}</p>
                      </label>
                    ))}
                  </div>
                )}
              </section>
            )}

          </div>

          {/* KOLOM KANAN: SUMMARY */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-gray-100 p-10 sticky top-32 shadow-sm">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] mb-8 border-b border-gray-50 pb-6">Order Summary</h2>
              
              {/* Item List */}
              <div className="space-y-6 mb-8 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                {cart.items.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="flex gap-4">
                    <div className="w-14 aspect-[3/4] relative bg-gray-50 flex-shrink-0 border border-gray-100">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <p className="text-[10px] font-bold uppercase tracking-wider">{item.name}</p>
                      <p className="text-[9px] text-gray-400 uppercase mt-1">{item.size} &bull; Qty: {item.quantity}</p>
                    </div>
                    <p className="text-[10px] font-bold self-center">{formatRupiah(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              {/* 🚀 VOUCHER SECTION */}
              <div className="mb-8 border-t border-gray-50 pt-8">
                {isCheckoutDataLoading ? (
                  <div className="animate-pulse h-12 bg-gray-50 border border-gray-100 flex items-center px-4"><div className="h-2 w-24 bg-gray-200 rounded"></div></div>
                ) : selectedVoucher ? (
                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-100">
                    <div className="flex items-center gap-3">
                      <Ticket className="w-4 h-4 text-green-700" />
                      <div>
                        <p className="text-[10px] font-bold uppercase text-green-800">{selectedVoucher.promo.code}</p>
                        <p className="text-[8px] uppercase tracking-widest text-green-600 mt-0.5">Voucher Applied</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => setSelectedVoucher(null)} className="text-[9px] font-bold text-red-500 uppercase tracking-widest hover:underline">Remove</button>
                  </div>
                ) : (
                  <button type="button" onClick={() => setIsVoucherModalOpen(true)} className="w-full h-12 flex items-center justify-between px-4 border border-gray-200 bg-gray-50 hover:bg-white hover:border-black transition-colors group">
                    <span className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-gray-600 group-hover:text-black">
                      <Ticket className="w-4 h-4" /> Apply Promo / Voucher
                    </span>
                    <span className="text-[10px] bg-black text-white px-2 py-0.5">{availableVouchers.length} Available</span>
                  </button>
                )}
              </div>

              {/* Cost Calculation */}
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-[10px] uppercase tracking-[0.2em] text-gray-500">
                  <span>Subtotal</span>
                  <span className="font-bold text-black">{formatRupiah(subtotal)}</span>
                </div>
                
                <div className="flex justify-between text-[10px] uppercase tracking-[0.2em] text-gray-500">
                  <span>Shipping</span>
                  <span className="font-bold text-black">{shippingCost > 0 ? formatRupiah(shippingCost) : '-'}</span>
                </div>

                {/* 🚀 ADMIN FEES */}
                {calculatedFees.map(fee => (
                  <div key={fee.id} className="flex justify-between text-[10px] uppercase tracking-[0.2em] text-gray-500">
                    <span>{fee.name}</span>
                    <span className="font-bold text-black">{formatRupiah(fee.calculatedAmount)}</span>
                  </div>
                ))}

                {/* 🚀 DISCOUNT */}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[10px] uppercase tracking-[0.2em] text-green-600">
                    <span>Discount</span>
                    <span className="font-bold">- {formatRupiah(discountAmount)}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-black pt-6 mb-8 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-[0.3em]">Total</span>
                <span className="text-2xl font-serif italic">{formatRupiah(totalAmount)}</span>
              </div>
              
              <button 
                type="submit" 
                disabled={isProcessingPay || !selectedShipping}
                className="w-full bg-black text-white text-center py-6 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-gray-800 transition-all disabled:bg-gray-100 disabled:text-gray-400"
              >
                {isProcessingPay ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Complete Order'}
              </button>
            </div>
          </div>

        </form>
      </div>

      {/* 🚀 MODAL PILIH VOUCHER */}
      {isVoucherModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xs font-bold uppercase tracking-widest">My Wallet</h2>
              <button onClick={() => setIsVoucherModalOpen(false)} className="text-gray-400 hover:text-black">&times;</button>
            </div>
            
            <div className="p-6 max-h-[60vh] overflow-y-auto bg-gray-50 space-y-4">
              {availableVouchers.length === 0 ? (
                <div className="text-center py-8">
                  <Ticket className="w-8 h-8 mx-auto text-gray-300 mb-3" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">No vouchers available</p>
                </div>
              ) : (
                availableVouchers.map((v) => {
                  const isValid = subtotal >= v.promo.minPurchase;
                  
                  return (
                    <div key={v.id} className={`p-5 border relative transition-all bg-white ${isValid ? 'border-gray-200' : 'opacity-60 grayscale cursor-not-allowed'}`}>
                      <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-gray-50 rounded-full border-r border-gray-200"></div>
                      <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-gray-50 rounded-full border-l border-gray-200"></div>

                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-xl font-serif italic text-black">
                            {v.promo.type === 'PERCENTAGE' ? `${v.promo.value}% OFF` : v.promo.type === 'NOMINAL' ? formatRupiah(v.promo.value) : 'Free Shipping'}
                          </p>
                          <h3 className="text-[10px] font-bold uppercase tracking-widest mt-1 text-gray-500">{v.promo.name}</h3>
                        </div>
                        {isValid ? (
                           <button 
                             onClick={() => { setSelectedVoucher(v); setIsVoucherModalOpen(false); }}
                             className="bg-black text-white px-4 py-2 text-[8px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
                           >
                             Use
                           </button>
                        ) : (
                           <span className="text-[8px] font-bold uppercase tracking-widest text-red-500 bg-red-50 px-2 py-1">Min. Purchase Not Met</span>
                        )}
                      </div>
                      
                      <div className="pt-3 border-t border-dashed border-gray-100 flex justify-between items-center text-[9px] text-gray-400 uppercase tracking-widest">
                        <span>Min. Spend: {formatRupiah(v.promo.minPurchase)}</span>
                        <span>{v.promo.maxDiscount ? `Max: ${formatRupiah(v.promo.maxDiscount)}` : 'No Cap'}</span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}