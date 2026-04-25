'use client';

import { useCart } from '@/hooks/useCart';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  Loader2, MapPin, Truck, Search, 
  Ticket, CheckCircle2, AlertCircle, X, Plus, Home
} from 'lucide-react';

// Import Server Actions
import { getCheckoutDataAction } from '@/app/actions/checkout';
import { claimVoucherAction } from '@/app/actions/voucher';
import { getAddressesAction, addAddressAction, editAddressAction } from '@/app/actions/address';

const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
};

export default function CheckoutPage() {
  const cart = useCart();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  // ==========================================
  // STATE DATA DARI DATABASE
  // ==========================================
  const [userProfile, setUserProfile] = useState<any>(null);
  const [availableVouchers, setAvailableVouchers] = useState<any[]>([]);
  const [storeFees, setStoreFees] = useState<any[]>([]);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // ==========================================
  // STATE ALAMAT & PENGIRIMAN
  // ==========================================
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<any>(null);
  const [isLoadingShipping, setIsLoadingShipping] = useState(false);

  // ==========================================
  // STATE MODAL MANAJEMEN ALAMAT
  // ==========================================
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isAddAddressMode, setIsAddAddressMode] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  // State Form Alamat Baru/Edit
  const [newAddress, setNewAddress] = useState({ recipientName: '', phone: '', street: '', postalCode: '', isDefault: false });
  const [searchKeyword, setSearchKeyword] = useState('');
  const [destinations, setDestinations] = useState<any[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // ==========================================
  // STATE VOUCHER
  // ==========================================
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [claimCode, setClaimCode] = useState('');
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimMessage, setClaimMessage] = useState<{type: 'error'|'success', text: string} | null>(null);

  const [isProcessingPay, setIsProcessingPay] = useState(false);

  // ==========================================
  // 🚀 UX MAGIC: HANDLE MOBILE BACK BUTTON
  // ==========================================
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (isAddressModalOpen) {
        setIsAddressModalOpen(false);
        setIsAddAddressMode(false);
        setEditingAddressId(null);
      }
      if (isVoucherModalOpen) {
        setIsVoucherModalOpen(false);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAddressModalOpen, isVoucherModalOpen]);

  const openAddressModal = () => {
    window.history.pushState({ modal: 'address' }, '');
    setIsAddressModalOpen(true);
  };
  const closeAddressModal = () => {
    setIsAddressModalOpen(false);
    setIsAddAddressMode(false);
    setEditingAddressId(null);
    if (window.history.state?.modal) window.history.back();
  };
  const openVoucherModal = () => {
    window.history.pushState({ modal: 'voucher' }, '');
    setIsVoucherModalOpen(true);
  };
  const closeVoucherModal = () => {
    setIsVoucherModalOpen(false);
    if (window.history.state?.modal) window.history.back();
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================
  useEffect(() => {
    setIsMounted(true);
    const fetchInitialData = async () => {
      try {
        const [checkoutData, addresses] = await Promise.all([
          getCheckoutDataAction(),
          getAddressesAction()
        ]);
        
        setStoreFees(checkoutData.fees);
        setAvailableVouchers(checkoutData.vouchers);
        setSavedAddresses(addresses);
        setUserProfile(checkoutData.user);

        // AUTO-DETECT ALAMAT DEFAULT
        if (addresses.length > 0) {
          const defaultAddr = addresses.find((a: any) => a.isDefault) || addresses[0];
          handleSelectAddressForCheckout(defaultAddr);
        }
      } catch (err) {
        console.error("Gagal memuat data", err);
      } finally {
        setIsInitialLoading(false);
      }
    };
    fetchInitialData();

    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ==========================================
  // LOGIKA SHIPPING & RAJAONGKIR
  // ==========================================
  const handleSelectAddressForCheckout = (addr: any) => {
    setSelectedAddress(addr);
    closeAddressModal(); // Gunakan helper pembunuh modal
    handleCalculateShipping(addr.cityId);
  };

  const handleCalculateShipping = async (destinationCityId: string) => {
    setIsLoadingShipping(true);
    setShippingOptions([]);
    setSelectedShipping(null);
    try {
      const totalWeight = cart.items.reduce((total, item) => total + (500 * item.quantity), 0) || 500;
      const res = await fetch('/api/rajaongkir/cost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originCityId: '152', destinationCityId: destinationCityId, weightInGrams: totalWeight, courier: 'jne' })
      });
      const data = await res.json();
      if (data.success) setShippingOptions(data.data);
    } catch (error) { console.error("Error shipping cost", error); } 
    finally { setIsLoadingShipping(false); }
  };

  // ==========================================
  // LOGIKA MANAJEMEN ALAMAT (KOMERCE V2 & PRISMA)
  // ==========================================
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchKeyword.length >= 3 && !selectedDestination) {
        setIsSearchingLocation(true);
        fetch(`/api/rajaongkir/locations?keyword=${searchKeyword}`)
          .then(res => res.json())
          .then(data => { if (data.success) { setDestinations(data.data); setShowDropdown(true); } })
          .finally(() => setIsSearchingLocation(false));
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchKeyword]);

  const handleSelectDestination = (dest: any) => {
    setSelectedDestination(dest);
    setSearchKeyword(`${dest.subdistrict_name}, ${dest.city_name}, ${dest.province_name}`);
    setShowDropdown(false);
  };

  const handleEditAddress = (addr: any) => {
    setEditingAddressId(addr.id);
    setNewAddress({
      recipientName: addr.recipientName,
      phone: addr.phone,
      street: addr.street,
      postalCode: addr.postalCode,
      isDefault: addr.isDefault
    });
    // Mock destinasi agar submitNewAddress tidak tertahan validasi
    setSelectedDestination({
      id: addr.cityId,
      city_name: addr.cityName,
      province_id: addr.provinceId,
      province_name: addr.provinceName
    });
    setSearchKeyword(`${addr.cityName}, ${addr.provinceName}`);
    setIsAddAddressMode(true);
  };

  const submitNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDestination) return alert("Pilih kecamatan/kota dari dropdown pencarian!");
    
    setIsSavingAddress(true);
    const addressData = {
      recipientName: newAddress.recipientName,
      phone: newAddress.phone,
      street: newAddress.street,
      cityId: String(selectedDestination.id), // 🔥 FIX: Prisma Int vs String Error
      cityName: selectedDestination.city_name,
      provinceId: String(selectedDestination.province_id || "0"),
      provinceName: selectedDestination.province_name,
      postalCode: newAddress.postalCode,
      isDefault: newAddress.isDefault || savedAddresses.length === 0
    };

    let res;
    if (editingAddressId) {
      res = await editAddressAction(editingAddressId, addressData);
    } else {
      res = await addAddressAction(addressData);
    }

    if (res.success && res.address) {
      const updatedAddresses = await getAddressesAction();
      setSavedAddresses(updatedAddresses);
      
      setNewAddress({ recipientName: '', phone: '', street: '', postalCode: '', isDefault: false });
      setSearchKeyword('');
      setSelectedDestination(null);
      setEditingAddressId(null);
      
      handleSelectAddressForCheckout(res.address);
    } else {
      alert(res.error || "Gagal menyimpan alamat");
    }
    setIsSavingAddress(false);
  };

  // ==========================================
  // LOGIKA HYBRID VOUCHER (AUTO-APPLY)
  // ==========================================
  const handleApplyPromoCode = async () => {
    if (!claimCode) return;
    setIsClaiming(true);
    setClaimMessage(null);

    const cleanCode = claimCode.toUpperCase().replace(/\s+/g, '');
    const subtotal = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);

    const inWallet = availableVouchers.find(v => v.promo.code === cleanCode);
    if (inWallet) {
      if (subtotal >= inWallet.promo.minPurchase) {
        setSelectedVoucher(inWallet);
        setClaimMessage({ type: 'success', text: 'Voucher applied!' });
        setClaimCode('');
      } else {
        setClaimMessage({ type: 'error', text: `Min. spend ${formatRupiah(inWallet.promo.minPurchase)} required.` });
      }
      setIsClaiming(false);
      return;
    }

    const res = await claimVoucherAction(cleanCode);
    if (res.error) {
      setClaimMessage({ type: 'error', text: res.error });
    } else {
      const data = await getCheckoutDataAction();
      setAvailableVouchers(data.vouchers);
      const newlyClaimed = data.vouchers.find((v: any) => v.promo.code === cleanCode);
      if (newlyClaimed && subtotal >= newlyClaimed.promo.minPurchase) {
        setSelectedVoucher(newlyClaimed);
        setClaimMessage({ type: 'success', text: 'Voucher claimed & applied!' });
      } else {
        setClaimMessage({ type: 'success', text: 'Voucher saved to wallet.' });
      }
      setClaimCode('');
    }
    setIsClaiming(false);
  };

  // ==========================================
  // 🚀 PERHITUNGAN FINAL
  // ==========================================
  if (!isMounted) return null;

  const subtotal = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shippingCost = selectedShipping ? selectedShipping.cost : 0;

  const calculatedFees = storeFees.map(fee => ({
    ...fee,
    calculatedAmount: fee.isPercentage ? (subtotal * (fee.amount / 100)) : fee.amount
  }));
  const totalFeesAmount = calculatedFees.reduce((acc, curr) => acc + curr.calculatedAmount, 0);

  let discountAmount = 0;
  let isShippingDiscount = false;

  if (selectedVoucher) {
    const promo = selectedVoucher.promo;
    if (subtotal >= promo.minPurchase) {
      if (promo.type === 'PERCENTAGE') {
        let calc = subtotal * (promo.value / 100);
        discountAmount = promo.maxDiscount ? Math.min(calc, promo.maxDiscount) : calc;
      } else if (promo.type === 'NOMINAL') {
        discountAmount = Math.min(promo.value, subtotal);
      } else if (promo.type === 'SHIPPING') {
        isShippingDiscount = true;
        discountAmount = Math.min(promo.maxDiscount || promo.value, shippingCost);
      }
    } else {
      setSelectedVoucher(null);
    }
  }

  const totalAmount = Math.max(0, (subtotal + shippingCost + totalFeesAmount) - discountAmount);

  // ==========================================
  // SUBMIT PEMBAYARAN FINAL
  // ==========================================
  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAddress) return alert("Pilih alamat pengiriman terlebih dahulu!");
    if (!selectedShipping) return alert("Pilih metode pengiriman terlebih dahulu!");
    
    setIsProcessingPay(true);
    console.log("Ready to pay:", { totalAmount, selectedAddress, selectedShipping });
    // TODO: Kirim ke Database & Xendit
  };

  if (isInitialLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-300" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-24 font-sans text-black">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <h1 className="text-3xl font-bold uppercase tracking-tighter mb-12">Checkout</h1>

        <form onSubmit={handlePayment} className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* KOLOM KIRI */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* 1. KARTU ALAMAT PENGIRIMAN */}
            <section className="bg-white p-8 border border-gray-100 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-black" />
                  <h2 className="text-xs font-bold uppercase tracking-[0.2em]">Delivery Address</h2>
                </div>
                {savedAddresses.length > 0 && (
                  <button type="button" onClick={openAddressModal} className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-colors border border-gray-200 px-3 py-1.5">
                    Change Address
                  </button>
                )}
              </div>

              {!selectedAddress ? (
                <div className="text-center py-10 bg-gray-50 border border-dashed border-gray-200">
                  <Home className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                  <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-4 font-bold">No address selected</p>
                  <button 
                    type="button" 
                    onClick={() => { setIsAddAddressMode(true); openAddressModal(); }}
                    className="bg-black text-white px-6 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
                  >
                    Add New Address
                  </button>
                </div>
              ) : (
                <div className="p-5 border border-black bg-gray-50/50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold uppercase">{selectedAddress.recipientName}</span>
                    {selectedAddress.isDefault && <span className="bg-black text-white text-[8px] uppercase tracking-widest px-2 py-0.5 ml-2">Default</span>}
                  </div>
                  <p className="text-[11px] text-gray-600 mb-2">{selectedAddress.phone}</p>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    {selectedAddress.street}<br/>
                    {selectedAddress.cityName}, {selectedAddress.provinceName} {selectedAddress.postalCode}
                  </p>
                </div>
              )}
            </section>

            {/* 2. METODE PENGIRIMAN */}
            {selectedAddress && (
              <section className="animate-in fade-in bg-white p-8 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                  <Truck className="w-5 h-5" />
                  <h2 className="text-xs font-bold uppercase tracking-[0.2em]">Shipping Method</h2>
                </div>

                {isLoadingShipping ? (
                  <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-200" /></div>
                ) : shippingOptions.length === 0 ? (
                   <p className="text-[10px] text-center text-gray-400 uppercase tracking-widest py-8">No couriers available for this destination.</p>
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
                            <p className="text-[9px] text-gray-400 uppercase mt-1">Est. {opt.etd || '-'} Days</p>
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

          {/* KOLOM KANAN: SUMMARY & VOUCHER */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-gray-100 p-10 sticky top-32 shadow-sm">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] mb-10 border-b border-gray-50 pb-6">Order Summary</h2>
              
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

              {/* 🚀 HYBRID PROMO SECTION */}
              <div className="mb-8 border-t border-gray-50 pt-8">
                {selectedVoucher ? (
                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-100 mb-4 animate-in fade-in duration-300">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-[10px] font-bold uppercase text-green-800 tracking-wider">{selectedVoucher.promo.code}</p>
                        <p className="text-[8px] uppercase tracking-[0.1em] text-green-600 mt-0.5">
                          {selectedVoucher.promo.type === 'SHIPPING' ? 'Free Shipping Subsidy' : 'Voucher Applied'}
                        </p>
                      </div>
                    </div>
                    <button type="button" onClick={() => {setSelectedVoucher(null); setClaimMessage(null);}} className="text-gray-400 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <div className="mb-4 space-y-3">
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="DISCOUNT CODE" 
                        value={claimCode}
                        onChange={(e) => setClaimCode(e.target.value.toUpperCase())}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleApplyPromoCode(); } }}
                        className="flex-1 h-12 px-4 border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:border-black text-[10px] font-bold tracking-widest uppercase transition-all"
                      />
                      <button type="button" onClick={handleApplyPromoCode} disabled={isClaiming || !claimCode} className="bg-black text-white px-6 h-12 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 disabled:bg-gray-100 disabled:text-gray-400 transition-colors">
                        {isClaiming ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                      </button>
                    </div>
                    {claimMessage && (
                      <div className={`flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest ${claimMessage.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>
                        {claimMessage.type === 'error' ? <AlertCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                        {claimMessage.text}
                      </div>
                    )}
                  </div>
                )}

                {!selectedVoucher && (
                  <button type="button" onClick={openVoucherModal} className="w-full flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors group py-2">
                    <span className="flex items-center gap-2"><Ticket className="w-4 h-4" /> View Wallet</span>
                    {availableVouchers.length > 0 && <span className="text-[8px] bg-gray-100 group-hover:bg-black group-hover:text-white px-1.5 py-0.5 transition-colors">{availableVouchers.length} Available</span>}
                  </button>
                )}
              </div>

              {/* RINCIAN PERHITUNGAN */}
              <div className="space-y-4 mb-10 pt-4">
                <div className="flex justify-between text-[10px] uppercase tracking-[0.2em] text-gray-500">
                  <span>Subtotal</span>
                  <span className="font-bold text-black">{formatRupiah(subtotal)}</span>
                </div>
                
                <div className="flex justify-between text-[10px] uppercase tracking-[0.2em] text-gray-500">
                  <span>Shipping</span>
                  <div className="text-right">
                    {isShippingDiscount && discountAmount > 0 && <span className="line-through text-gray-300 mr-2">{formatRupiah(shippingCost)}</span>}
                    <span className="font-bold text-black">{shippingCost === 0 ? '-' : isShippingDiscount ? formatRupiah(Math.max(0, shippingCost - discountAmount)) : formatRupiah(shippingCost)}</span>
                  </div>
                </div>

                {calculatedFees.map(fee => (
                  <div key={fee.id} className="flex justify-between text-[10px] uppercase tracking-[0.2em] text-gray-500">
                    <span>{fee.name}</span>
                    <span className="font-bold text-black">{formatRupiah(fee.calculatedAmount)}</span>
                  </div>
                ))}

                {!isShippingDiscount && discountAmount > 0 && (
                  <div className="flex justify-between text-[10px] uppercase tracking-[0.2em] text-green-600 font-bold">
                    <span>Voucher Discount</span>
                    <span>- {formatRupiah(discountAmount)}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-black pt-8 mb-10 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-[0.3em]">Total</span>
                <span className="text-2xl font-serif italic">{formatRupiah(totalAmount)}</span>
              </div>
              
              <button type="submit" disabled={isProcessingPay || !selectedShipping || !selectedAddress} className="w-full bg-black text-white text-center py-6 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-gray-800 transition-all disabled:bg-gray-100 disabled:text-gray-400">
                {isProcessingPay ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Complete Order'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* ========================================== */}
      {/* 🚀 MODAL MANAJEMEN BUKU ALAMAT             */}
      {/* ========================================== */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em]">
                {isAddAddressMode ? (editingAddressId ? 'Edit Address' : 'Add New Address') : 'Select Delivery Address'}
              </h2>
              <button type="button" onClick={closeAddressModal} className="text-gray-400 hover:text-black"><X className="w-5 h-5"/></button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-white">
              {isAddAddressMode ? (
                // FORM TAMBAH / EDIT ALAMAT
                <form id="addAddressForm" onSubmit={submitNewAddress} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Recipient Name</label>
                      <input type="text" required value={newAddress.recipientName} onChange={e => setNewAddress({...newAddress, recipientName: e.target.value})} className="w-full h-10 px-3 border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:border-black text-sm" placeholder="John Doe" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Phone Number</label>
                      <input type="tel" required value={newAddress.phone} onChange={e => setNewAddress({...newAddress, phone: e.target.value})} className="w-full h-10 px-3 border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:border-black text-sm" placeholder="0812..." />
                    </div>
                  </div>

                  <div className="space-y-2 relative" ref={searchRef}>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">District / City</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="text" required placeholder="Type district or city name..." value={searchKeyword}
                        onChange={(e) => { setSearchKeyword(e.target.value); setSelectedDestination(null); }}
                        className="w-full h-10 pl-10 pr-4 border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:border-black text-sm"
                      />
                      {isSearchingLocation && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />}
                    </div>
                    {showDropdown && destinations.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 shadow-xl max-h-48 overflow-y-auto">
                        {destinations.map((dest) => (
                          <button key={dest.id} type="button" onClick={() => handleSelectDestination(dest)} className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50">
                            <p className="text-[11px] font-bold uppercase">{dest.subdistrict_name}, {dest.city_name}</p>
                            <p className="text-[9px] text-gray-500 uppercase mt-0.5">{dest.province_name} - {dest.zip_code}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Full Street Address</label>
                    <textarea required rows={3} value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} className="w-full p-3 border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:border-black text-sm resize-none" placeholder="House number, street, block..." />
                  </div>

                  <div className="grid grid-cols-2 gap-4 items-end">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Postal Code</label>
                      <input type="text" required value={newAddress.postalCode} onChange={e => setNewAddress({...newAddress, postalCode: e.target.value})} className="w-full h-10 px-3 border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:border-black text-sm" />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer pb-2">
                      <input type="checkbox" checked={newAddress.isDefault} onChange={e => setNewAddress({...newAddress, isDefault: e.target.checked})} className="w-4 h-4 accent-black" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Set as Default</span>
                    </label>
                  </div>
                </form>
              ) : (
                // LIST ALAMAT TERSIMPAN
                <div className="space-y-4">
                  {savedAddresses.map((addr) => (
                    <div key={addr.id} onClick={() => handleSelectAddressForCheckout(addr)} className={`p-5 border cursor-pointer transition-all ${selectedAddress?.id === addr.id ? 'border-black bg-gray-50/50' : 'border-gray-200 hover:border-gray-400 bg-white'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase">{addr.recipientName}</span>
                          {addr.isDefault && <span className="text-[8px] bg-black text-white px-2 py-0.5 uppercase tracking-widest">Default</span>}
                        </div>
                        <button type="button" onClick={(e) => { e.stopPropagation(); handleEditAddress(addr); }} className="text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:underline">
                          Edit
                        </button>
                      </div>
                      <p className="text-[11px] text-gray-600 mb-2">{addr.phone}</p>
                      <p className="text-[10px] text-gray-500 leading-relaxed">{addr.street}<br/>{addr.cityName}, {addr.provinceName} {addr.postalCode}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 shrink-0">
              {isAddAddressMode ? (
                <div className="flex gap-3 justify-end">
                  {savedAddresses.length > 0 && (
                    <button type="button" onClick={() => { setIsAddAddressMode(false); setEditingAddressId(null); }} className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:bg-gray-200 transition-colors">
                      Cancel
                    </button>
                  )}
                  <button form="addAddressForm" type="submit" disabled={isSavingAddress} className="bg-black text-white px-8 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 disabled:bg-gray-400 transition-colors flex items-center gap-2">
                    {isSavingAddress ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Address'}
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => setIsAddAddressMode(true)} className="w-full border border-black text-black bg-white py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" /> Add New Address
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 🚀 MODAL WALLET VOUCHER                    */}
      {/* ========================================== */}
      {isVoucherModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em]">My Voucher Wallet</h2>
              <button onClick={closeVoucherModal} className="text-gray-400 hover:text-black"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="p-6 max-h-[60vh] overflow-y-auto bg-gray-50 space-y-4">
              {availableVouchers.length === 0 ? (
                <div className="text-center py-12">
                  <Ticket className="w-10 h-10 mx-auto text-gray-200 mb-4" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Your wallet is currently empty</p>
                </div>
              ) : (
                availableVouchers.map((v) => {
                  const isValid = subtotal >= v.promo.minPurchase;
                  return (
                    <div key={v.id} className={`p-6 border relative transition-all bg-white ${isValid ? 'border-gray-200' : 'opacity-60 grayscale'}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-2xl font-serif italic text-black">
                            {v.promo.type === 'PERCENTAGE' ? `${v.promo.value}% OFF` : v.promo.type === 'NOMINAL' ? formatRupiah(v.promo.value) : 'Free Shipping'}
                          </p>
                          <h3 className="text-[10px] font-bold uppercase tracking-[0.1em] mt-1 text-gray-500">{v.promo.name}</h3>
                        </div>
                        {isValid && (
                           <button onClick={() => { setSelectedVoucher(v); closeVoucherModal(); }} className="bg-black text-white px-5 py-2 text-[8px] font-bold uppercase tracking-widest hover:bg-gray-800">Use</button>
                        )}
                      </div>
                      <div className="pt-4 mt-4 border-t border-dashed border-gray-100 flex justify-between text-[8px] text-gray-400 uppercase tracking-widest font-bold">
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

    </div>
  );
}