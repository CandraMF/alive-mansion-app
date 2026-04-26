'use client';

import { useState, useEffect, useRef } from 'react';
import { Clock, Tag, Loader2, ExternalLink, Package, CheckCircle2, Ticket, Plus, Trash2, MapPin, Home, Briefcase, X, Search, ChevronDown, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { claimVoucherAction } from '@/app/actions/voucher';
import { addAddressAction, editAddressAction, deleteAddressAction, getAddressesAction } from '@/app/actions/address';

const formatRupiah = (angka: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
const formatDate = (date: Date) => new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(date));

export default function AccountTabs({ orders, vouchers, addresses: initialAddresses }: { orders: any[], vouchers: any[], addresses: any[] }) {
  const [activeTab, setActiveTab] = useState<'orders' | 'vouchers' | 'addresses'>('orders');
  const [orderStatusTab, setOrderStatusTab] = useState<'ACTIVE' | 'DONE'>('ACTIVE');
  const [voucherStatusTab, setVoucherStatusTab] = useState<'AVAILABLE' | 'USED'>('AVAILABLE');
  const [voucherFilter, setVoucherFilter] = useState('ALL');
  
  const [visibleOrders, setVisibleOrders] = useState(5);
  const [visibleVouchers, setVisibleVouchers] = useState(4);
  const loaderRef = useRef<HTMLDivElement>(null);

  const [claimCode, setClaimCode] = useState('');
  const [isClaiming, setIsClaiming] = useState(false);

  const [localAddresses, setLocalAddresses] = useState(initialAddresses);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newAddress, setNewAddress] = useState({ 
    label: '', recipientName: '', phone: '', street: '', postalCode: '', isDefault: false,
    cityId: '', cityName: '', provinceId: '', provinceName: ''
  });

  const resetForm = () => {
    setNewAddress({ 
      label: '', recipientName: '', phone: '', street: '', postalCode: '', isDefault: false, 
      cityId: '', cityName: '', provinceId: '', provinceName: '' 
    });
    setEditingId(null);
  };

  const filteredOrders = orders.filter(order => {
    const isActive = ['PENDING', 'PROCESSING', 'SHIPPED'].includes(order.orderStatus) || order.paymentStatus === 'UNPAID';
    const isDone = ['DELIVERED', 'CANCELLED'].includes(order.orderStatus) || order.paymentStatus === 'EXPIRED';
    return orderStatusTab === 'ACTIVE' ? isActive : isDone;
  });

  const groupedVouchersMap = vouchers.reduce((acc: any, curr: any) => {
    const key = `${curr.promoId}-${curr.status}`;
    if (!acc[key]) acc[key] = { ...curr, count: 1 };
    else acc[key].count += 1;
    return acc;
  }, {});

  const filteredVouchers = Object.values(groupedVouchersMap).filter((v: any) => {
    if (v.status !== voucherStatusTab) return false;
    return voucherFilter === 'ALL' || v.promo.type === voucherFilter;
  });

  const handleClaim = async () => {
    if (!claimCode) return;
    setIsClaiming(true);
    const res = await claimVoucherAction(claimCode);
    if (res.success) { alert(res.message); setClaimCode(''); }
    else alert(res.error);
    setIsClaiming(false);
  };

  const handleEdit = (addr: any) => {
    setEditingId(addr.id);
    setNewAddress({ 
      label: addr.label || '', recipientName: addr.recipientName, phone: addr.phone, street: addr.street, postalCode: addr.postalCode, isDefault: addr.isDefault,
      cityId: addr.cityId, cityName: addr.cityName, provinceId: addr.provinceId, provinceName: addr.provinceName
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this address?")) return;
    const res = await deleteAddressAction(id);
    if (res.success) setLocalAddresses(await getAddressesAction());
    else alert(res.error);
  };

  const submitAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.cityId) return alert("Please select a valid destination.");
    setIsSaving(true);
    const res = editingId ? await editAddressAction(editingId, newAddress) : await addAddressAction(newAddress);
    if (res.success) {
      setLocalAddresses(await getAddressesAction());
      setIsModalOpen(false);
      resetForm();
    } else alert(res.error);
    setIsSaving(false);
  };

  const LocationPicker = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(0); 
    const [options, setOptions] = useState<any[]>([]);
    const [isFetching, setIsFetching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selections, setSelections] = useState<any[]>([]);
    const pickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => { if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setIsOpen(false); };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchOptions = async (currentStep: number, parentId: string | null = null) => {
      setIsFetching(true);
      let type = ['province', 'city', 'district', 'subdistrict'][currentStep];
      const url = parentId ? `/api/rajaongkir/hierarchy?type=${type}&id=${parentId}` : `/api/rajaongkir/hierarchy?type=${type}`;
      try {
        const res = await fetch(url);
        const data = await res.json();
        setOptions(data.success ? data.data : []);
      } catch { setOptions([]); } finally { setIsFetching(false); }
    };

    const handleSelect = (item: any) => {
      const newSelections = [...selections.slice(0, step), item];
      setSelections(newSelections);
      setSearchQuery('');
      if (step < 3) { setStep(step + 1); fetchOptions(step + 1, item.id); }
      else {
        setNewAddress(prev => ({ 
          ...prev, 
          cityId: String(item.id), 
          cityName: `${newSelections[3].name}, ${newSelections[2].name}, ${newSelections[1].name}`, 
          provinceId: String(newSelections[0].id), 
          provinceName: newSelections[0].name,
          postalCode: item.postalCode || '' 
        }));
        setIsOpen(false);
      }
    };

    return (
      <div className="relative w-full" ref={pickerRef}>
        <div onClick={() => { setIsOpen(true); if (step === 0) fetchOptions(0); }} className="w-full min-h-[40px] px-3 py-2.5 border border-gray-200 bg-gray-50 text-sm cursor-pointer flex items-center justify-between hover:border-black transition-colors">
          <div className="flex flex-col gap-0.5">
            {newAddress.cityId ? (
              <span className="text-gray-900 font-medium text-xs">
                {newAddress.cityName}, {newAddress.provinceName} {newAddress.postalCode && newAddress.postalCode !== '0' ? `(${newAddress.postalCode})` : ''}
              </span>
            ) : (
              <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Select Location...</span>
            )}
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
        {isOpen && (
          <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 shadow-xl z-[110]">
            <div className="p-2 border-b border-gray-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
              {['Prov', 'City', 'Dist', 'Sub'].map((label, i) => (
                <button key={i} type="button" onClick={() => { setStep(i); fetchOptions(i, i === 0 ? null : selections[i-1].id); }} className={`text-[8px] font-bold uppercase px-2 py-1 rounded-full ${step === i ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}>{label}</button>
              ))}
            </div>
            <div className="p-2"><input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full h-8 px-3 bg-gray-50 border-none outline-none text-xs" /></div>
            <div className="max-h-48 overflow-y-auto">
              {isFetching ? <div className="p-4 text-center"><Loader2 className="w-4 h-4 animate-spin mx-auto" /></div> : options.filter(o => o.name.toLowerCase().includes(searchQuery.toLowerCase())).map(o => (
                <div key={o.id} onClick={() => handleSelect(o)} className="px-3 py-2 text-xs hover:bg-gray-50 cursor-pointer uppercase flex items-center justify-between">
                  <span>{o.name} {o.postalCode && o.postalCode !== '0' && <span className="text-[10px] text-gray-400 ml-1 tracking-widest normal-case">({o.postalCode})</span>}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex border-b border-gray-100 gap-8 overflow-x-auto no-scrollbar">
        {['orders', 'vouchers', 'addresses'].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab as any)} className={`pb-4 text-[10px] font-bold uppercase tracking-[0.2em] relative transition-all ${activeTab === tab ? 'text-black' : 'text-gray-400 hover:text-black'}`}>
            {tab} {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black" />}
          </button>
        ))}
      </div>

      {activeTab === 'orders' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex gap-6 mb-2">
            {[{ id: 'ACTIVE', label: 'Active', icon: Clock }, { id: 'DONE', label: 'Completed', icon: CheckCircle2 }].map((tab) => (
              <button key={tab.id} onClick={() => setOrderStatusTab(tab.id as any)} className={`flex items-center gap-2 pb-2 text-[10px] font-bold uppercase tracking-widest relative ${orderStatusTab === tab.id ? 'text-black' : 'text-gray-400 hover:text-black'}`}>
                <tab.icon className="w-3 h-3" /> {tab.label} {orderStatusTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black" />}
              </button>
            ))}
          </div>
          {filteredOrders.length === 0 ? <div className="bg-gray-50 p-16 text-center border border-dashed border-gray-200"><Package className="w-8 h-8 text-gray-300 mx-auto mb-4" /><p className="text-[10px] text-gray-400 uppercase tracking-widest">No orders found.</p></div> : filteredOrders.map(order => (
            <div key={order.id} className="border border-gray-100 p-6 bg-white space-y-4">
              <div className="flex justify-between border-b border-gray-50 pb-4">
                <div className="flex gap-4">
                  <div><p className="text-[8px] text-gray-400 uppercase mb-1">Ref</p><p className="text-[10px] font-bold">#{order.id.slice(-8).toUpperCase()}</p></div>
                  <div><p className="text-[8px] text-gray-400 uppercase mb-1">Date</p><p className="text-[10px] font-bold">{formatDate(order.createdAt)}</p></div>
                </div>
                <div className="text-right"><p className="text-[8px] text-gray-400 uppercase mb-1">Total</p><p className="text-[11px] font-bold">{formatRupiah(order.totalAmount)}</p></div>
              </div>
              <Link href={`/orders/${order.id}`} className="flex items-center justify-end gap-2 text-[9px] font-bold uppercase tracking-widest hover:text-blue-600 transition-colors">View Details <ExternalLink className="w-3 h-3" /></Link>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'vouchers' && (
        <div className="space-y-8 animate-in fade-in">
          <div className="bg-black p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="flex items-center gap-4"><Ticket className="w-6 h-6 text-white/50" /><div><h3 className="text-sm font-bold uppercase tracking-widest">Secret Code?</h3><p className="text-[10px] text-gray-400 uppercase tracking-widest">Unlock exclusive rewards</p></div></div>
            <div className="flex w-full md:w-auto gap-2"><input type="text" placeholder="CODE..." value={claimCode} onChange={e => setClaimCode(e.target.value.toUpperCase())} className="bg-white/5 border border-white/20 px-4 py-3 text-xs font-mono tracking-[0.2em] outline-none w-full md:w-64" /><button onClick={handleClaim} disabled={isClaiming || !claimCode} className="bg-white text-black px-6 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-200 transition-all">{isClaiming ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Claim'}</button></div>
          </div>
          <div className="flex gap-6 border-b border-gray-50">
            {['AVAILABLE', 'USED'].map(tab => (
              <button key={tab} onClick={() => setVoucherStatusTab(tab as any)} className={`pb-2 text-[10px] font-bold uppercase tracking-widest relative ${voucherStatusTab === tab ? 'text-black' : 'text-gray-400'}`}>
                {tab} {voucherStatusTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black" />}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredVouchers.map((v: any) => (
              <div key={v.id} className={`p-6 border relative transition-all ${v.status === 'AVAILABLE' ? 'border-gray-200 hover:border-black' : 'opacity-60 grayscale bg-gray-50'}`}>
                {v.count > 1 && <div className="absolute top-0 right-0 bg-black text-white text-[9px] font-bold px-3 py-1.5 uppercase">x{v.count}</div>}
                <h3 className="text-[10px] font-bold uppercase mb-1">{v.promo.name}</h3>
                <p className="text-2xl font-serif italic mb-4">{v.promo.type === 'PERCENTAGE' ? `${v.promo.value}% OFF` : v.promo.type === 'NOMINAL' ? formatRupiah(v.promo.value) : 'FREE SHIPPING'}</p>
                <div className="flex justify-between border-t border-dashed pt-4 border-gray-200">
                  <div><p className="text-[8px] text-gray-400 uppercase mb-1">Expires</p><p className="text-[10px] font-bold">{v.promo.endDate ? formatDate(v.promo.endDate) : 'Never'}</p></div>
                  <div className="text-right"><p className="text-[8px] text-gray-400 uppercase mb-1">Code</p><p className="text-[11px] font-mono font-bold tracking-widest">{v.promo.code}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'addresses' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex justify-between items-center"><h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Saved Locations</h3><button onClick={() => { resetForm(); setIsModalOpen(true); }} className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:text-blue-600 transition-colors"><Plus className="w-3 h-3" /> Add New</button></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {localAddresses.map(addr => (
              <div key={addr.id} className={`p-6 border relative ${addr.isDefault ? 'border-black' : 'border-gray-100 hover:border-gray-300'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">{addr.label?.toLowerCase().includes('office') ? <Briefcase className="w-3 h-3" /> : <Home className="w-3 h-3" />}<span className="text-[10px] font-bold uppercase tracking-widest">{addr.label || 'Home'}</span></div>
                  {addr.isDefault && <span className="bg-black text-white text-[7px] font-bold uppercase px-2 py-0.5 tracking-widest">Default</span>}
                </div>
                <div className="space-y-1 mb-6 text-[10px]"><p className="font-bold uppercase">{addr.recipientName}</p><p className="text-gray-500">{addr.phone}</p><p className="text-gray-400 leading-relaxed pt-2 line-clamp-2">{addr.street}, {addr.cityName}, {addr.provinceName} {addr.postalCode && addr.postalCode !== '0' ? addr.postalCode : ''}</p></div>
                <div className="pt-4 border-t border-gray-50 flex justify-between"><button onClick={() => handleEdit(addr)} className="text-[9px] font-bold uppercase text-gray-400 hover:text-black">Edit</button>{!addr.isDefault && <button onClick={() => handleDelete(addr.id)} className="text-[9px] font-bold uppercase text-red-400 hover:text-red-600 flex items-center gap-1"><Trash2 className="w-3 h-3" /> Remove</button>}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <form onSubmit={submitAddress} className="bg-white w-full max-w-xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50"><h2 className="text-[10px] font-bold uppercase tracking-widest">{editingId ? 'Edit Address' : 'New Address'}</h2><button type="button" onClick={() => setIsModalOpen(false)}><X className="w-5 h-5"/></button></div>
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-[9px] font-bold uppercase text-gray-400 tracking-widest">Label</label><input type="text" required value={newAddress.label} onChange={e => setNewAddress({...newAddress, label: e.target.value})} className="w-full h-10 px-3 bg-gray-50 border-none outline-none text-xs" placeholder="Home, Office..." /></div>
                <div className="space-y-1"><label className="text-[9px] font-bold uppercase text-gray-400 tracking-widest">Recipient</label><input type="text" required value={newAddress.recipientName} onChange={e => setNewAddress({...newAddress, recipientName: e.target.value})} className="w-full h-10 px-3 bg-gray-50 border-none outline-none text-xs" /></div>
              </div>
              <div className="space-y-1"><label className="text-[9px] font-bold uppercase text-gray-400 tracking-widest">Phone</label><input type="tel" required value={newAddress.phone} onChange={e => setNewAddress({...newAddress, phone: e.target.value})} className="w-full h-10 px-3 bg-gray-50 border-none outline-none text-xs" /></div>
              <div className="space-y-1"><label className="text-[9px] font-bold uppercase text-gray-400 tracking-widest">Location</label><LocationPicker /></div>
              <div className="space-y-1"><label className="text-[9px] font-bold uppercase text-gray-400 tracking-widest">Street Address</label><textarea required rows={3} value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} className="w-full p-3 bg-gray-50 border-none outline-none text-xs resize-none" /></div>
              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <input type="checkbox" checked={newAddress.isDefault} onChange={e => setNewAddress({...newAddress, isDefault: e.target.checked})} className="accent-black w-4 h-4" />
                <span className="text-[9px] font-bold uppercase text-gray-600">Set as Default Address</span>
              </label>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3"><button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-[10px] font-bold uppercase text-gray-400">Cancel</button><button type="submit" disabled={isSaving} className="bg-black text-white px-8 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-all">{isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}</button></div>
          </form>
        </div>
      )}
    </div>
  );
}