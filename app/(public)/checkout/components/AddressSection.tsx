'use client';

import { useState, useEffect } from 'react';
import { MapPin, Home, Plus, X, Loader2 } from 'lucide-react';
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

  // State Form Teks
  const [newAddress, setNewAddress] = useState({ 
    recipientName: '', phone: '', street: '', postalCode: '', isDefault: false,
    // State bayangan untuk menampung data lama saat Edit
    cityId: '', cityName: '', provinceId: '', provinceName: ''
  });

  // State Hierarki Lokasi Dropdown
  const [provinces, setProvinces] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [subdistricts, setSubdistricts] = useState<any[]>([]);

  const [selectedProv, setSelectedProv] = useState<any>(null);
  const [selectedCity, setSelectedCity] = useState<any>(null);
  const [selectedDist, setSelectedDist] = useState<any>(null);
  const [selectedSubdist, setSelectedSubdist] = useState<any>(null);

  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // ==========================================
  // 🚀 FUNGSI SAPU BERSIH FORM
  // ==========================================
  const resetForm = () => {
    setNewAddress({ recipientName: '', phone: '', street: '', postalCode: '', isDefault: false, cityId: '', cityName: '', provinceId: '', provinceName: '' });
    setEditingId(null);
    setSelectedProv(null); setSelectedCity(null); setSelectedDist(null); setSelectedSubdist(null);
    setCities([]); setDistricts([]); setSubdistricts([]);
  };

  // ==========================================
  // 🚀 UX MOBILE BACK BUTTON
  // ==========================================
  useEffect(() => {
    const handlePopState = () => {
      if (isModalOpen) { setIsModalOpen(false); setIsAddMode(false); resetForm(); }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isModalOpen]);

  const openModal = () => { window.history.pushState({ modal: 'address' }, ''); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); setIsAddMode(false); resetForm(); if (window.history.state?.modal) window.history.back(); };

  // ==========================================
  // 🚀 LOGIKA CASCADING DROPDOWN API
  // ==========================================
  
  // 1. Tarik Provinsi saat Form Tambah dibuka
  useEffect(() => {
    if (isAddMode && provinces.length === 0) {
      setIsLoadingLocation(true);
      // Nanti kita buat API route ini di langkah selanjutnya
      fetch('/api/rajaongkir/hierarchy?type=province')
        .then(res => res.json())
        .then(data => { if (data.success) setProvinces(data.data); })
        .finally(() => setIsLoadingLocation(false));
    }
  }, [isAddMode, provinces.length]);

  const handleProvinceChange = async (provId: string) => {
    const prov = provinces.find(p => String(p.id) === provId);
    setSelectedProv(prov);
    setSelectedCity(null); setSelectedDist(null); setSelectedSubdist(null);
    setCities([]); setDistricts([]); setSubdistricts([]);
    if (!prov) return;

    setIsLoadingLocation(true);
    const res = await fetch(`/api/rajaongkir/hierarchy?type=city&id=${provId}`);
    const data = await res.json();
    if (data.success) setCities(data.data);
    setIsLoadingLocation(false);
  };

  const handleCityChange = async (cityId: string) => {
    const city = cities.find(c => String(c.id) === cityId);
    setSelectedCity(city);
    setSelectedDist(null); setSelectedSubdist(null);
    setDistricts([]); setSubdistricts([]);
    if (!city) return;

    setIsLoadingLocation(true);
    const res = await fetch(`/api/rajaongkir/hierarchy?type=district&id=${cityId}`);
    const data = await res.json();
    if (data.success) setDistricts(data.data);
    setIsLoadingLocation(false);
  };

  const handleDistrictChange = async (distId: string) => {
    const dist = districts.find(d => String(d.id) === distId);
    setSelectedDist(dist);
    setSelectedSubdist(null);
    setSubdistricts([]);
    if (!dist) return;

    setIsLoadingLocation(true);
    const res = await fetch(`/api/rajaongkir/hierarchy?type=subdistrict&id=${distId}`);
    const data = await res.json();
    if (data.success) setSubdistricts(data.data);
    setIsLoadingLocation(false);
  };

  const handleSubdistrictChange = (subId: string) => {
    const sub = subdistricts.find(s => String(s.id) === subId);
    setSelectedSubdist(sub);
  };

  // ==========================================
  // 🚀 SUBMIT & EDIT
  // ==========================================
  const handleEdit = (addr: any) => {
    resetForm();
    setEditingId(addr.id);
    setNewAddress({ 
      recipientName: addr.recipientName, phone: addr.phone, street: addr.street, postalCode: addr.postalCode, isDefault: addr.isDefault,
      cityId: addr.cityId, cityName: addr.cityName, provinceId: addr.provinceId, provinceName: addr.provinceName
    });
    setIsAddMode(true);
  };

  const submitAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalCityId = newAddress.cityId;
    let finalCityName = newAddress.cityName;
    let finalProvId = newAddress.provinceId;
    let finalProvName = newAddress.provinceName;

    // Jika user memilih lokasi baru dari dropdown sampai ujung
    if (selectedSubdist) {
      finalCityId = String(selectedSubdist.id);
      finalCityName = `${selectedSubdist.name}, ${selectedDist?.name}, ${selectedCity?.name}`;
      finalProvId = String(selectedProv?.id);
      finalProvName = selectedProv?.name;
    } else if (!editingId || !finalCityId) {
      // Jika ini tambah alamat baru, tapi belum sampai Kelurahan
      return alert("Mohon lengkapi pilihan lokasi hingga tingkat Desa/Kelurahan!");
    }

    setIsSaving(true);
    const addressData = {
      recipientName: newAddress.recipientName, phone: newAddress.phone, street: newAddress.street,
      cityId: finalCityId, cityName: finalCityName, provinceId: finalProvId, provinceName: finalProvName,
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
      alert(res.error || "Gagal menyimpan alamat");
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

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            <div className="p-4 md:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em]">{isAddMode ? (editingId ? 'Edit Address' : 'Add New Address') : 'Select Delivery Address'}</h2>
              <button type="button" onClick={closeModal} className="text-gray-400 hover:text-black"><X className="w-5 h-5"/></button>
            </div>

            <div className="p-4 md:p-6 overflow-y-auto flex-1 bg-white">
              {isAddMode ? (
                <form id="addressForm" onSubmit={submitAddress} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Recipient Name</label><input type="text" required value={newAddress.recipientName} onChange={e => setNewAddress({...newAddress, recipientName: e.target.value})} className="w-full h-10 px-3 border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:border-black text-sm" placeholder="John Doe" /></div>
                    <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Phone Number</label><input type="tel" required value={newAddress.phone} onChange={e => setNewAddress({...newAddress, phone: e.target.value})} className="w-full h-10 px-3 border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:border-black text-sm" placeholder="0812..." /></div>
                  </div>

                  {/* 🚀 HIERARKI DROPDOWN LOKASI */}
                  <div className="space-y-3 bg-gray-50 p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                       <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Tujuan Pengiriman</label>
                       {isLoadingLocation && <Loader2 className="w-3 h-3 text-gray-400 animate-spin" />}
                    </div>
                    
                    {editingId && newAddress.cityId && !selectedProv && (
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-100 text-xs text-blue-800">
                        <p className="font-bold mb-1">Lokasi Tersimpan:</p>
                        <p>{newAddress.cityName}, {newAddress.provinceName}</p>
                        <p className="text-[9px] mt-2 text-blue-600 uppercase tracking-widest font-bold">*Pilih provinsi di bawah jika ingin mengubah lokasi tujuan.</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <select className="w-full h-10 px-3 border border-gray-200 bg-white text-xs outline-none focus:border-black truncate" value={selectedProv?.id || ""} onChange={(e) => handleProvinceChange(e.target.value)}>
                        <option value="">Pilih Provinsi</option>
                        {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>

                      <select className="w-full h-10 px-3 border border-gray-200 bg-white text-xs outline-none focus:border-black disabled:bg-gray-100 disabled:text-gray-400 truncate" value={selectedCity?.id || ""} onChange={(e) => handleCityChange(e.target.value)} disabled={!selectedProv}>
                        <option value="">Pilih Kota/Kabupaten</option>
                        {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>

                      <select className="w-full h-10 px-3 border border-gray-200 bg-white text-xs outline-none focus:border-black disabled:bg-gray-100 disabled:text-gray-400 truncate" value={selectedDist?.id || ""} onChange={(e) => handleDistrictChange(e.target.value)} disabled={!selectedCity}>
                        <option value="">Pilih Kecamatan</option>
                        {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>

                      <select className="w-full h-10 px-3 border border-gray-200 bg-white text-xs outline-none focus:border-black disabled:bg-gray-100 disabled:text-gray-400 truncate" value={selectedSubdist?.id || ""} onChange={(e) => handleSubdistrictChange(e.target.value)} disabled={!selectedDist}>
                        <option value="">Pilih Desa/Kelurahan</option>
                        {subdistricts.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Full Street Address</label><textarea required rows={3} value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} className="w-full p-3 border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:border-black text-sm resize-none" placeholder="Detail alamat rumah, patokan..." /></div>
                  <div className="grid grid-cols-2 gap-4 items-end">
                    <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Postal Code</label><input type="text" required value={newAddress.postalCode} onChange={e => setNewAddress({...newAddress, postalCode: e.target.value})} className="w-full h-10 px-3 border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:border-black text-sm" /></div>
                    <label className="flex items-center gap-2 cursor-pointer pb-2"><input type="checkbox" checked={newAddress.isDefault} onChange={e => setNewAddress({...newAddress, isDefault: e.target.checked})} className="w-4 h-4 accent-black" /><span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Set as Default</span></label>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  {savedAddresses.map((addr) => (
                    <div key={addr.id} onClick={() => { onSelectAddress(addr); closeModal(); }} className={`p-4 md:p-5 border cursor-pointer transition-all ${selectedAddress?.id === addr.id ? 'border-black bg-gray-50/50' : 'border-gray-200 hover:border-gray-400 bg-white'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2"><span className="text-xs font-bold uppercase">{addr.recipientName}</span>{addr.isDefault && <span className="text-[8px] bg-black text-white px-2 py-0.5 uppercase tracking-widest">Default</span>}</div>
                        <button type="button" onClick={(e) => { e.stopPropagation(); handleEdit(addr); }} className="text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:underline">Edit</button>
                      </div>
                      <p className="text-[11px] text-gray-600 mb-2">{addr.phone}</p>
                      <p className="text-[10px] text-gray-500 leading-relaxed">{addr.street}<br/>{addr.cityName}, {addr.provinceName} {addr.postalCode}</p>
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