'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  getStoreSettingAction, 
  updateStoreSettingAction 
} from '@/app/actions/setting';
import { 
  Settings, Store, Truck, ShieldAlert, 
  Save, Loader2, Search, CheckCircle2, 
  AlertCircle, Phone, MapPin 
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'identity' | 'logistics' | 'system'>('identity');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // State Pengaturan
  const [settings, setSettings] = useState({
    storeName: '',
    whatsappNumber: '',
    originCityId: '',
    originCityName: '',
    activeCouriers: '',
    isMaintenance: false,
    taxRate: 0,
  });

  // State Pencarian Lokasi Gudang (Komerce V2)
  const [searchKeyword, setSearchKeyword] = useState('');
  const [destinations, setDestinations] = useState<any[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadSettings = async () => {
      const data = await getStoreSettingAction();
      if (data) {
        setSettings({
          storeName: data.storeName,
          whatsappNumber: data.whatsappNumber || '',
          originCityId: data.originCityId,
          originCityName: data.originCityName,
          activeCouriers: data.activeCouriers,
          isMaintenance: data.isMaintenance,
          taxRate: data.taxRate,
        });
        setSearchKeyword(data.originCityName);
      }
      setIsLoading(false);
    };
    loadSettings();

    // Close dropdown on click outside
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handler Pencarian Lokasi Gudang
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchKeyword.length >= 3 && searchKeyword !== settings.originCityName) {
        setIsSearchingLocation(true);
        fetch(`/api/rajaongkir/locations?keyword=${searchKeyword}`)
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              setDestinations(data.data);
              setShowDropdown(true);
            }
          })
          .finally(() => setIsSearchingLocation(false));
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchKeyword, settings.originCityName]);

  const handleSelectOrigin = (dest: any) => {
    setSettings({ 
      ...settings, 
      originCityId: String(dest.id), 
      originCityName: `${dest.city_name} (${dest.subdistrict_name})` 
    });
    setSearchKeyword(`${dest.city_name} (${dest.subdistrict_name})`);
    setShowDropdown(false);
  };

  const handleCourierToggle = (courier: string) => {
    const currentList = settings.activeCouriers.split(',').filter(c => c !== '');
    let newList;
    if (currentList.includes(courier)) {
      newList = currentList.filter(c => c !== courier);
    } else {
      newList = [...currentList, courier];
    }
    setSettings({ ...settings, activeCouriers: newList.join(',') });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(false);
    setMessage(null);
    setIsSaving(true);

    const res = await updateStoreSettingAction(settings);
    if (res.success) {
      setMessage({ type: 'success', text: 'Pengaturan berhasil diperbarui!' });
    } else {
      setMessage({ type: 'error', text: res.error || 'Gagal memperbarui pengaturan.' });
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="p-10 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-300 mb-4" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Loading Configuration...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-12 max-w-5xl mx-auto font-sans text-black">
      <header className="mb-12">
        <h1 className="text-3xl font-bold uppercase tracking-tighter flex items-center gap-3">
          <Settings className="w-8 h-8" /> Store Settings
        </h1>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mt-2">
          Pusat Kendali Operasional & Logistik Alive Mansion
        </p>
      </header>

      {message && (
        <div className={`mb-8 p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <p className="text-xs font-bold uppercase tracking-wider">{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Navigasi Tab */}
        <aside className="space-y-1">
          <button 
            onClick={() => setActiveTab('identity')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'identity' ? 'bg-black text-white' : 'hover:bg-gray-100 text-gray-500'}`}
          >
            <Store className="w-4 h-4" /> Store Identity
          </button>
          <button 
            onClick={() => setActiveTab('logistics')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'logistics' ? 'bg-black text-white' : 'hover:bg-gray-100 text-gray-500'}`}
          >
            <Truck className="w-4 h-4" /> Logistics & Courier
          </button>
          <button 
            onClick={() => setActiveTab('system')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'system' ? 'bg-black text-white' : 'hover:bg-gray-100 text-gray-500'}`}
          >
            <ShieldAlert className="w-4 h-4" /> System Control
          </button>
        </aside>

        {/* Panel Form Utama */}
        <main className="md:col-span-3 bg-white border border-gray-100 p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* TAB 1: IDENTITAS */}
            {activeTab === 'identity' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Store Name</label>
                  <div className="relative">
                    <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <input 
                      type="text" 
                      value={settings.storeName}
                      onChange={e => setSettings({...settings, storeName: e.target.value})}
                      className="w-full h-12 pl-12 pr-4 bg-gray-50 border-transparent focus:bg-white focus:border-black outline-none text-sm transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">WhatsApp Number (For CS)</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <input 
                      type="text" 
                      placeholder="e.g. 62812..."
                      value={settings.whatsappNumber}
                      onChange={e => setSettings({...settings, whatsappNumber: e.target.value})}
                      className="w-full h-12 pl-12 pr-4 bg-gray-50 border-transparent focus:bg-white focus:border-black outline-none text-sm transition-all"
                    />
                  </div>
                  <p className="text-[9px] text-gray-400 italic">Gunakan format internasional tanpa tanda + (contoh: 628123456789)</p>
                </div>
              </div>
            )}

            {/* TAB 2: LOGISTIK */}
            {activeTab === 'logistics' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                {/* Penentuan Lokasi Gudang */}
                <div className="space-y-2 relative" ref={searchRef}>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Origin Warehouse (City/District)</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <input 
                      type="text" 
                      value={searchKeyword}
                      onChange={e => setSearchKeyword(e.target.value)}
                      placeholder="Search city for warehouse location..."
                      className="w-full h-12 pl-12 pr-4 bg-gray-50 border-transparent focus:bg-white focus:border-black outline-none text-sm transition-all"
                    />
                    {isSearchingLocation && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-300" />}
                  </div>
                  
                  {showDropdown && destinations.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 shadow-xl max-h-48 overflow-y-auto">
                      {destinations.map((dest) => (
                        <button 
                          key={dest.id} 
                          type="button"
                          onClick={() => handleSelectOrigin(dest)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0"
                        >
                          <p className="text-[11px] font-bold uppercase">{dest.city_name} ({dest.subdistrict_name})</p>
                          <p className="text-[9px] text-gray-500 uppercase mt-0.5">{dest.province_name}</p>
                        </button>
                      ))}
                    </div>
                  )}
                  <p className="text-[9px] text-gray-400 italic">ID Lokasi Terpilih: {settings.originCityId || 'None'}</p>
                </div>

                {/* Pemilihan Kurir Aktif */}
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Active Couriers</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['jne', 'jnt', 'sicepat', 'pos', 'tiki', 'anteraja'].map(courier => (
                      <button
                        key={courier}
                        type="button"
                        onClick={() => handleCourierToggle(courier)}
                        className={`flex items-center justify-between px-4 py-4 border text-[10px] font-bold uppercase tracking-widest transition-all ${
                          settings.activeCouriers.split(',').includes(courier)
                          ? 'border-black bg-black text-white'
                          : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-300'
                        }`}
                      >
                        {courier}
                        {settings.activeCouriers.split(',').includes(courier) && <CheckCircle2 className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: SISTEM */}
            {activeTab === 'system' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex items-center justify-between p-6 bg-red-50 border border-red-100">
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-red-800">Maintenance Mode</h3>
                    <p className="text-[9px] text-red-600 mt-1 uppercase tracking-tight">Menonaktifkan akses Checkout untuk pelanggan sementara waktu.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSettings({...settings, isMaintenance: !settings.isMaintenance})}
                    className={`relative w-12 h-6 rounded-full transition-colors ${settings.isMaintenance ? 'bg-red-600' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.isMaintenance ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Tax Rate (%)</label>
                  <input 
                    type="number" 
                    value={settings.taxRate}
                    onChange={e => setSettings({...settings, taxRate: parseFloat(e.target.value)})}
                    className="w-full h-12 px-4 bg-gray-50 border-transparent focus:bg-white focus:border-black outline-none text-sm transition-all"
                  />
                </div>
              </div>
            )}

            <div className="pt-8 border-t border-gray-100 flex justify-end">
              <button 
                type="submit" 
                disabled={isSaving}
                className="bg-black text-white px-10 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-all flex items-center gap-3 disabled:bg-gray-300"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save All Changes
              </button>
            </div>

          </form>
        </main>
      </div>
    </div>
  );
}