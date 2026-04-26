'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, Home, Plus, X, Loader2, Search, ChevronDown, ChevronRight } from 'lucide-react';
import { addAddressAction, editAddressAction, getAddressesAction } from '@/app/actions/address';

interface AddressSectionProps {
  savedAddresses: any[];
  selectedAddress: any;
  onSelectAddress: (addr: any) => void;
  onRefreshAddresses: (addresses: any[]) => void;
}

export default function AddressSection({ savedAddresses, selectedAddress, onSelectAddress, onRefreshAddresses }: AddressSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
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

  useEffect(() => {
    const handlePopState = () => {
      if (isModalOpen) { setIsModalOpen(false); setIsAddMode(false); resetForm(); }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isModalOpen]);

  const openModal = () => { window.history.pushState({ modal: 'address' }, ''); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); setIsAddMode(false); resetForm(); if (window.history.state?.modal) window.history.back(); };

  const LocationPicker = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(0);
    const [options, setOptions] = useState<any[]>([]);
    const [isFetching, setIsFetching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selections, setSelections] = useState<any[]>([]);

    const pickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchOptions = async (currentStep: number, parentId: string | null = null) => {
      setIsFetching(true);
      let type = 'province';
      if (currentStep === 1) type = 'city';
      if (currentStep === 2) type = 'district';
      if (currentStep === 3) type = 'subdistrict';

      const url = parentId ? `/api/rajaongkir/hierarchy?type=${type}&id=${parentId}` : `/api/rajaongkir/hierarchy?type=${type}`;

      try {
        const res = await fetch(url);
        const data = await res.json();
        setOptions(data.success ? data.data : []);
      } catch (err) {
        console.error(err);
        setOptions([]);
      } finally {
        setIsFetching(false);
      }
    };

    const handleOpen = () => {
      setIsOpen(true);
      if (step === 0 && options.length === 0) fetchOptions(0);
    };

    const jumpToStep = (targetStep: number) => {
      setStep(targetStep);
      setSearchQuery('');
      const parentId = targetStep === 0 ? null : selections[targetStep - 1].id;
      fetchOptions(targetStep, parentId);
    };

    const handleSelect = (item: any) => {
      const newSelections = [...selections.slice(0, step), item];
      setSelections(newSelections);
      setSearchQuery('');

      if (step < 3) {
        setStep(step + 1);
        fetchOptions(step + 1, item.id);
      } else {
        const finalCityName = `${newSelections[3].name}, ${newSelections[2].name}, ${newSelections[1].name}`;
        setNewAddress(prev => ({
          ...prev,
          cityId: String(item.id),
          cityName: finalCityName,
          provinceId: String(newSelections[0].id),
          provinceName: newSelections[0].name
        }));
        setIsOpen(false);
      }
    };

    const filteredOptions = options.filter(opt => opt.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
      <div className="relative w-full" ref={pickerRef}>
        <div onClick={handleOpen} className="w-full min-h-[40px] px-3 py-2.5 border border-gray-200 bg-gray-50 text-sm cursor-pointer flex items-center justify-between hover:border-black transition-colors">
          <div className="flex flex-col gap-0.5 pr-4">
            {newAddress.cityId ? (
              <>
                <span className="text-[9px] font-bold uppercase tracking-widest text-blue-600">Selected Destination</span>
                <span className="text-gray-900 font-medium capitalize leading-tight text-xs">{newAddress.cityName}, {newAddress.provinceName}</span>
              </>
            ) : (
              <span className="text-gray-400 text-xs uppercase tracking-widest font-bold text-[9px]">Select Province, City, District...</span>
            )}
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
        </div>

        {isOpen && (
          <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 shadow-xl z-50 animate-in fade-in slide-in-from-top-2">
            <div className="p-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <div className="flex flex-wrap items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-gray-400">
                <button type="button" onClick={() => jumpToStep(0)} className={`hover:text-black transition-colors ${step === 0 ? "text-black" : ""}`}>Prov</button>
                {step > 0 && (
                  <><ChevronRight className="w-3 h-3" /><button type="button" onClick={() => jumpToStep(1)} className={`hover:text-black transition-colors truncate max-w-[70px] ${step === 1 ? "text-black" : ""}`}>{selections[0]?.name || 'City'}</button></>
                )}
                {step > 1 && (
                  <><ChevronRight className="w-3 h-3" /><button type="button" onClick={() => jumpToStep(2)} className={`hover:text-black transition-colors truncate max-w-[70px] ${step === 2 ? "text-black" : ""}`}>{selections[1]?.name || 'District'}</button></>
                )}
                {step > 2 && (
                  <><ChevronRight className="w-3 h-3" /><span className={`truncate max-w-[70px] ${step === 3 ? "text-black" : ""}`}>Village</span></>
                )}
              </div>
              <button type="button" onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} className="text-gray-400 hover:text-black"><X className="w-4 h-4" /></button>
            </div>

            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input type="text" placeholder={`Search ${step === 0 ? 'province' : step === 1 ? 'city' : step === 2 ? 'district' : 'village'}...`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full h-8 pl-9 pr-4 bg-gray-50 border-transparent focus:bg-white focus:border-black outline-none text-xs transition-all" />
              </div>
            </div>

            <div className="max-h-56 overflow-y-auto custom-scrollbar">
              {isFetching ? (
                <div className="flex flex-col items-center justify-center py-6 text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin mb-2" />
                  <span className="text-[9px] font-bold uppercase tracking-widest">Loading...</span>
                </div>
              ) : filteredOptions.length === 0 ? (
                <div className="text-center py-6 text-[9px] font-bold uppercase tracking-widest text-gray-400">No results found</div>
              ) : (
                <ul className="flex flex-col">
                  {filteredOptions.map((opt) => (
                    <li key={opt.id} onClick={() => handleSelect(opt)} className="px-3 py-2.5 hover:bg-gray-50 border-b border-gray-50 last:border-0 cursor-pointer flex justify-between items-center group transition-colors">
                      <span className="text-xs font-medium text-gray-700 group-hover:text-black uppercase">{opt.name}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-200 group-hover:text-black opacity-0 group-hover:opacity-100 transition-all transform -translate-x-2 group-hover:translate-x-0" />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const handleEdit = (addr: any) => {
    resetForm();
    setEditingId(addr.id);
    setNewAddress({
      label: addr.label || '', recipientName: addr.recipientName, phone: addr.phone, street: addr.street, postalCode: addr.postalCode, isDefault: addr.isDefault,
      cityId: addr.cityId, cityName: addr.cityName, provinceId: addr.provinceId, provinceName: addr.provinceName
    });
    setIsAddMode(true);
  };

  const submitAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.cityId) return alert("Please select the complete delivery destination up to the village/sub-district level!");

    setIsSaving(true);
    const addressData = {
      label: newAddress.label, recipientName: newAddress.recipientName, phone: newAddress.phone, street: newAddress.street,
      cityId: newAddress.cityId, cityName: newAddress.cityName,
      provinceId: newAddress.provinceId, provinceName: newAddress.provinceName,
      postalCode: newAddress.postalCode, isDefault: newAddress.isDefault || savedAddresses.length === 0
    };

    const res = editingId ? await editAddressAction(editingId, addressData) : await addAddressAction(addressData);

    if (res.success && res.address) {
      const updatedAddresses = await getAddressesAction();
      onRefreshAddresses(updatedAddresses);
      resetForm();
      onSelectAddress(res.address);
      closeModal();
    } else {
      alert(res.error || "Failed to save address.");
    }
    setIsSaving(false);
  };

  return (
    <>
      <section className="bg-white p-6 md:p-8 border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-black" />
            <h2 className="text-xs font-bold uppercase tracking-[0.2em]">Delivery Address</h2>
          </div>
          {savedAddresses.length > 0 && (
            <button type="button" onClick={openModal} className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-black border border-gray-200 px-3 py-1.5 transition-colors">
              Change Address
            </button>
          )}
        </div>

        {!selectedAddress ? (
          <div className="text-center py-10 bg-gray-50 border border-dashed border-gray-200">
            <Home className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-4 font-bold">No address selected</p>
            <button type="button" onClick={() => { resetForm(); setIsAddMode(true); openModal(); }} className="bg-black text-white px-6 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors">
              Add New Address
            </button>
          </div>
        ) : (
          <div className="p-4 md:p-5 border border-black bg-gray-50/50">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold uppercase bg-gray-200 px-2 py-0.5 mr-1">{selectedAddress.label || 'Home'}</span>
              <span className="text-xs font-bold uppercase">{selectedAddress.recipientName}</span>
              {selectedAddress.isDefault && <span className="bg-black text-white text-[8px] uppercase tracking-widest px-2 py-0.5 ml-2">Default</span>}
            </div>
            <p className="text-[11px] text-gray-600 mb-2">{selectedAddress.phone}</p>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              {selectedAddress.street}<br />
              {selectedAddress.cityName}, {selectedAddress.provinceName} {selectedAddress.postalCode}
            </p>
          </div>
        )}
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            <div className="p-4 md:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em]">{isAddMode ? (editingId ? 'Edit Address' : 'Add New Address') : 'Select Delivery Address'}</h2>
              <button type="button" onClick={closeModal} className="text-gray-400 hover:text-black"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-4 md:p-6 overflow-y-auto flex-1 bg-white">
              {isAddMode ? (
                <form id="addressForm" onSubmit={submitAddress} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Address Label</label><input type="text" required value={newAddress.label} onChange={e => setNewAddress({ ...newAddress, label: e.target.value })} className="w-full h-10 px-3 border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:border-black text-sm" placeholder="Home, Office, etc." /></div>
                    <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Recipient Name</label><input type="text" required value={newAddress.recipientName} onChange={e => setNewAddress({ ...newAddress, recipientName: e.target.value })} className="w-full h-10 px-3 border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:border-black text-sm" placeholder="John Doe" /></div>
                  </div>

                  <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Phone Number</label><input type="tel" required value={newAddress.phone} onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })} className="w-full h-10 px-3 border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:border-black text-sm" placeholder="0812..." /></div>

                  <div className="space-y-2 relative">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Delivery Destination</label>
                    <LocationPicker />
                  </div>

                  <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Full Street Address</label><textarea required rows={3} value={newAddress.street} onChange={e => setNewAddress({ ...newAddress, street: e.target.value })} className="w-full p-3 border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:border-black text-sm resize-none" placeholder="House number, block, landmarks..." /></div>

                  <div className="grid grid-cols-2 gap-4 items-end">
                    <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Postal Code</label><input type="text" required value={newAddress.postalCode} onChange={e => setNewAddress({ ...newAddress, postalCode: e.target.value })} className="w-full h-10 px-3 border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:border-black text-sm" /></div>
                    <label className="flex items-center gap-2 cursor-pointer pb-2"><input type="checkbox" checked={newAddress.isDefault} onChange={e => setNewAddress({ ...newAddress, isDefault: e.target.checked })} className="w-4 h-4 accent-black" /><span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Set as Default</span></label>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  {savedAddresses.map((addr) => (
                    <div key={addr.id} onClick={() => { onSelectAddress(addr); closeModal(); }} className={`p-4 md:p-5 border cursor-pointer transition-all ${selectedAddress?.id === addr.id ? 'border-black bg-gray-50/50' : 'border-gray-200 hover:border-gray-400 bg-white'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold uppercase bg-gray-200 px-2 py-0.5">{addr.label || 'Home'}</span>
                          <span className="text-xs font-bold uppercase">{addr.recipientName}</span>
                          {addr.isDefault && <span className="text-[8px] bg-black text-white px-2 py-0.5 uppercase tracking-widest">Default</span>}
                        </div>
                        <button type="button" onClick={(e) => { e.stopPropagation(); handleEdit(addr); }} className="text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:underline">Edit</button>
                      </div>
                      <p className="text-[11px] text-gray-600 mb-2">{addr.phone}</p>
                      <p className="text-[10px] text-gray-500 leading-relaxed">{addr.street}<br />{addr.cityName}, {addr.provinceName} {addr.postalCode}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 md:p-6 border-t border-gray-100 bg-gray-50 shrink-0">
              {isAddMode ? (
                <div className="flex gap-3 justify-end">
                  {savedAddresses.length > 0 && <button type="button" onClick={() => { setIsAddMode(false); resetForm(); }} className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:bg-gray-200 transition-colors">Cancel</button>}
                  <button form="addressForm" type="submit" disabled={isSaving} className="bg-black text-white px-8 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 disabled:bg-gray-400 transition-colors flex items-center gap-2">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Address'}
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => { resetForm(); setIsAddMode(true); }} className="w-full border border-black text-black bg-white py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> Add New Address</button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}