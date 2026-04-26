'use client';

import { useCart } from '@/hooks/useCart';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ChevronLeft } from 'lucide-react';

import { getCheckoutDataAction } from '@/app/actions/checkout';
import { getAddressesAction } from '@/app/actions/address';
import { createOrderAction } from '@/app/actions/order';

import AddressSection from './components/AddressSection';
import ShippingSection from './components/ShippingSection';
import SummarySection from './components/SummarySection';

const formatRupiah = (angka: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);

export default function CheckoutPage() {
  const cart = useCart();
  const router = useRouter();

  const [isMounted, setIsMounted] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const checkoutItems = cart.items.filter(item => cart.selectedItems.includes(`${item.id}-${item.size}`));

  const [storeSettings, setStoreSettings] = useState<any>(null);
  const [storeFees, setStoreFees] = useState<any[]>([]);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [availableVouchers, setAvailableVouchers] = useState<any[]>([]);

  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<any>(null);
  const [isLoadingShipping, setIsLoadingShipping] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);

  const [isProcessingPay, setIsProcessingPay] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (checkoutItems.length === 0) { router.push('/cart'); return; }

    const fetchInitialData = async () => {
      try {
        const [checkoutData, addresses] = await Promise.all([
          getCheckoutDataAction(),
          getAddressesAction()
        ]);

        setStoreFees(checkoutData.fees);
        setAvailableVouchers(checkoutData.vouchers);
        setSavedAddresses(addresses);
        setStoreSettings(checkoutData.settings);

        if (addresses.length > 0) {
          const defaultAddr = addresses.find((a: any) => a.isDefault) || addresses[0];
          setSelectedAddress(defaultAddr);
          handleCalculateShipping(defaultAddr.cityId, checkoutData.settings, checkoutItems);
        }
      } catch (err) { console.error("Failed to load data", err); }
      finally { setIsInitialLoading(false); }
    };
    fetchInitialData();
  }, []);

  const handleCalculateShipping = async (destinationCityId: string, settings: any, itemsToCalculate: any[]) => {
    if (!settings) return;
    
    setIsLoadingShipping(true); 
    setShippingOptions([]); 
    setSelectedShipping(null);

    try {
      const totalWeight = itemsToCalculate.reduce((total, item) => total + ((item.weight || 500) * item.quantity), 0);
      
      const res = await fetch('/api/rajaongkir/cost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          originCityId: settings.originCityId || '152', 
          destinationCityId, 
          weightInGrams: totalWeight, 
          courier: settings.activeCouriers || 'jne,jnt,sicepat' 
        })
      });
      
      const data = await res.json();
      if (data.success) {
         setShippingOptions(data.data);
      }
      
    } catch (error) { 
      console.error(error); 
    } finally {
      setIsLoadingShipping(false);
    }
  };

  const subtotal = checkoutItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shippingCost = selectedShipping ? selectedShipping.cost : 0;

  const calculatedFees = storeFees.map(fee => ({
    ...fee, calculatedAmount: fee.isPercentage ? (subtotal * (fee.amount / 100)) : fee.amount
  }));
  const totalFeesAmount = calculatedFees.reduce((acc, curr) => acc + curr.calculatedAmount, 0);

  let discountAmount = 0; let isShippingDiscount = false;
  if (selectedVoucher) {
    const promo = selectedVoucher.promo;
    if (subtotal >= promo.minPurchase) {
      if (promo.type === 'PERCENTAGE') discountAmount = promo.maxDiscount ? Math.min(subtotal * (promo.value / 100), promo.maxDiscount) : subtotal * (promo.value / 100);
      else if (promo.type === 'NOMINAL') discountAmount = Math.min(promo.value, subtotal);
      else if (promo.type === 'SHIPPING') { isShippingDiscount = true; discountAmount = Math.min(promo.maxDiscount || promo.value, shippingCost); }
    } else { setSelectedVoucher(null); }
  }

  const totalAmount = Math.max(0, (subtotal + shippingCost + totalFeesAmount) - discountAmount);
  const isReadyToPay = selectedAddress !== null && selectedShipping !== null;

  const handlePayment = async () => {
    if (!selectedAddress) return alert("Please select a delivery address first!");
    if (!selectedShipping) return alert("Please select a shipping method first!");

    setIsProcessingPay(true);

    try {
      const orderPayload = {
        addressId: selectedAddress.id,
        recipientName: selectedAddress.recipientName,
        phone: selectedAddress.phone,
        shippingAddress: `${selectedAddress.recipientName} - ${selectedAddress.phone} - ${selectedAddress.street}, ${selectedAddress.cityName}, ${selectedAddress.provinceName} ${selectedAddress.postalCode}`,

        subtotal: subtotal,
        shippingCost: shippingCost,
        discountAmount: discountAmount,
        taxAmount: totalFeesAmount,
        totalAmount: totalAmount,

        courier: selectedShipping.name,
        courierService: selectedShipping.service,
        voucherCode: selectedVoucher ? selectedVoucher.promo.code : null,

        items: checkoutItems.map((item: any) => ({
          productId: item.productId || null,
          variantId: item.id, name: item.name,
          price: item.price,
          quantity: item.quantity,
          color: item.color,
          size: item.size,
          image: item.image,
          sku: item.sku || 'SKU-000'
        }))
      };

      const res = await createOrderAction(orderPayload);

      if (res.success && res.paymentUrl) {
        for (const item of checkoutItems) {
          await cart.removeItem(item.id, item.size);
        }

        window.location.href = res.paymentUrl;
      } else {
        alert(res.error || "An error occurred while processing your payment.");
        setIsProcessingPay(false);
      }
    } catch (error) {
      console.error(error);
      alert("System is busy. Please try again.");
      setIsProcessingPay(false);
    }
  };

  if (isInitialLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-300" /></div>;
  if (!isMounted || checkoutItems.length === 0) return null;

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-32 md:pb-24 font-sans text-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">

        <div className="mb-6">
          <Link href="/cart" className="inline-flex items-center text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Cart
          </Link>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tighter mb-8 md:mb-12">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">

          <div className="lg:col-span-7 space-y-8">
            <AddressSection
              savedAddresses={savedAddresses}
              selectedAddress={selectedAddress}
              onSelectAddress={(addr) => { setSelectedAddress(addr); handleCalculateShipping(addr.cityId, storeSettings, checkoutItems); }}
              onRefreshAddresses={setSavedAddresses}
            />
            <ShippingSection
              selectedAddress={selectedAddress}
              shippingOptions={shippingOptions}
              selectedShipping={selectedShipping}
              onSelectShipping={setSelectedShipping}
              isLoading={isLoadingShipping}
            />
          </div>

          <div className="lg:col-span-5">
            <SummarySection
              checkoutItems={checkoutItems} subtotal={subtotal} shippingCost={shippingCost} storeFees={calculatedFees}
              discountAmount={discountAmount} isShippingDiscount={isShippingDiscount} totalAmount={totalAmount}
              availableVouchers={availableVouchers} selectedVoucher={selectedVoucher}
              onSelectVoucher={setSelectedVoucher} onRefreshVouchers={setAvailableVouchers}
              onPayment={handlePayment} isProcessingPay={isProcessingPay} isReadyToPay={isReadyToPay}
            />
          </div>

        </div>
      </div>

      {/* STICKY BOTTOM BAR (MOBILE) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 shadow-[0_-4px_15px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between px-4 sm:px-6 h-[72px]">
          <div className="flex flex-col justify-center">
            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Total Payment</span>
            <span className="text-sm font-bold text-black">{formatRupiah(totalAmount)}</span>
          </div>
          <button
            type="button" onClick={handlePayment} disabled={!isReadyToPay || isProcessingPay}
            className="h-full bg-black text-white px-8 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 disabled:bg-gray-300 transition-colors flex items-center justify-center"
          >
            {isProcessingPay ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Pay Now'}
          </button>
        </div>
      </div>
    </div>
  );
}