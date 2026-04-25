'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  getStoreSettingAction, 
  updateStoreSettingAction 
} from '@/app/actions/setting';
import { 
  Settings, Store, Truck, ShieldAlert, 
  Save, Loader2, CheckCircle2, 
  AlertCircle, Phone, MapPin, ChevronRight, Search, ChevronDown, X
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'identity' | 'logistics' | 'system'>('identity');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Settings State
  const [settings, setSettings] = useState({
    storeName: '',
    whatsappNumber: '',
    originCityId: '',
    originCityName: '',
    activeCouriers: '',
    isMaintenance: false,
    taxRate: 0,
  });

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
      }
      setIsLoading(false);
    };
    loadSettings();
  }, []);

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
      setMessage({ type: 'success', text: 'Settings successfully updated!' });
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to update settings.' });
    }
    setIsSaving(false);
  };

  // ==========================================
  // 🚀 CUSTOM COMPONENT: LOCATION PICKER
  // ==========================================
  const LocationPicker = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(0); // 0: Prov, 1: City, 2: Dist, 3: Subdist
    const [options, setOptions] = useState<any[]>([]);
    const [isFetching, setIsFetching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selections, setSelections] = useState<any[]>([]);
    
    const pickerRef = useRef<HTMLDivElement>(null);

    // Handle Click Outside to Close
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
      if (step === 0 && options.length === 0) {
        fetchOptions(0);
      }
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
        // Final Step (Sub-district Selected)
        const finalLocationName = `${newSelections[3].name}, ${newSelections[2].name}, ${newSelections[1].name}, ${newSelections[0].name}`;
        setSettings(prev => ({
          ...prev,
          originCityId: String(item.id),
          originCityName: finalLocationName
        }));
        setIsOpen(false);
      }
    };

    const filteredOptions = options.filter(opt => opt.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
      <div className="relative w-full" ref={pickerRef}>
        {/* INPUT TRIGGER */}
        <div 
          onClick={handleOpen}
          className="w-full min-h-[48px] px-4 py-3 border border-gray-200 bg-white text-sm cursor-pointer flex items-center justify-between hover:border-black transition-colors"
        >
          <div className="flex flex-col gap-1 pr-4">
            {settings.originCityId ? (
              <>
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">Saved Location</span>
                <span className="text-gray-900 font-medium capitalize leading-tight">{settings.originCityName}</span>
              </>
            ) : (
              <span className="text-gray-400">Select Province, City, District...</span>
            )}
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
        </div>

        {/* POPOVER / MODAL DROPDOWN */}
        {isOpen && (
          <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-200 shadow-xl z-50 animate-in fade-in slide-in-from-top-2">
            
            {/* HEADER: BREADCRUMBS */}
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                <button type="button" onClick={() => jumpToStep(0)} className={`hover:text-black transition-colors ${step === 0 ? "text-black" : ""}`}>Prov</button>
                
                {step > 0 && (
                  <>
                    <ChevronRight className="w-3 h-3" />
                    <button type="button" onClick={() => jumpToStep(1)} className={`hover:text-black transition-colors truncate max-w-[80px] ${step === 1 ? "text-black" : ""}`}>
                      {selections[0]?.name || 'City'}
                    </button>
                  </>
                )}
                
                {step > 1 && (
                  <>
                    <ChevronRight className="w-3 h-3" />
                    <button type="button" onClick={() => jumpToStep(2)} className={`hover:text-black transition-colors truncate max-w-[80px] ${step === 2 ? "text-black" : ""}`}>
                      {selections[1]?.name || 'District'}
                    </button>
                  </>
                )}

                {step > 2 && (
                  <>
                    <ChevronRight className="w-3 h-3" />
                    <span className={`truncate max-w-[80px] ${step === 3 ? "text-black" : ""}`}>
                      Village
                    </span>
                  </>
                )}
              </div>
              <button type="button" onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-black"><X className="w-4 h-4" /></button>
            </div>

            {/* SEARCH BAR */}
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder={`Search ${step === 0 ? 'province' : step === 1 ? 'city' : step === 2 ? 'district' : 'village'}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-9 pr-4 bg-gray-50 border-transparent focus:bg-white focus:border-black outline-none text-xs transition-all"
                />
              </div>
            </div>

            {/* LIST OF OPTIONS */}
            <div className="max-h-60 overflow-y-auto custom-scrollbar">
              {isFetching ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                  <Loader2 className="w-5 h-5 animate-spin mb-2" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Loading...</span>
                </div>
              ) : filteredOptions.length === 0 ? (
                <div className="text-center py-8 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  No results found
                </div>
              ) : (
                <ul className="flex flex-col">
                  {filteredOptions.map((opt) => (
                    <li 
                      key={opt.id}
                      onClick={() => handleSelect(opt)}
                      className="px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 cursor-pointer flex justify-between items-center group transition-colors"
                    >
                      <span className="text-xs font-medium text-gray-700 group-hover:text-black uppercase">{opt.name}</span>
                      <ChevronRight className="w-4 h-4 text-gray-200 group-hover:text-black opacity-0 group-hover:opacity-100 transition-all transform -translate-x-2 group-hover:translate-x-0" />
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            {/* FOOTER INFO */}
            <div className="p-2 bg-gray-50 border-t border-gray-100 text-center">
               <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
                 Step {step + 1} of 4
               </span>
            </div>

          </div>
        )}
      </div>
    );
  };

  // ==========================================
  // MAIN RENDER
  // ==========================================
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
          Alive Mansion Operations & Logistics Control Center
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
        <aside className="space-y-1">
          <button 
            type="button"
            onClick={() => setActiveTab('identity')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'identity' ? 'bg-black text-white' : 'hover:bg-gray-100 text-gray-500'}`}
          >
            <Store className="w-4 h-4" /> Store Identity
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('logistics')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'logistics' ? 'bg-black text-white' : 'hover:bg-gray-100 text-gray-500'}`}
          >
            <Truck className="w-4 h-4" /> Logistics & Courier
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('system')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'system' ? 'bg-black text-white' : 'hover:bg-gray-100 text-gray-500'}`}
          >
            <ShieldAlert className="w-4 h-4" /> System Control
          </button>
        </aside>

        <main className="md:col-span-3 bg-white border border-gray-100 p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* TAB 1: IDENTITY */}
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
                  <p className="text-[9px] text-gray-400 italic">Use international format without + sign (e.g., 628123456789)</p>
                </div>
              </div>
            )}

            {/* TAB 2: LOGISTICS */}
            {activeTab === 'logistics' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                
                <div className="space-y-4 bg-gray-50/50 p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> Origin Warehouse Location
                    </label>
                  </div>
                  
                  {/* 🚀 THE NEW AWESOME LOCATION PICKER */}
                  <LocationPicker />
                  
                  <p className="text-[9px] text-gray-400 italic mt-2">Selected Komerce ID: <span className="font-bold text-black">{settings.originCityId || 'Not Set'}</span></p>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Active Couriers</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {['jne', 'sicepat', 'ide', 'sap', 'jnt', 'ninja', 'tiki', 'lion', 'anteraja', 'pos', 'ncs', 'rex', 'rpx', 'sentral', 'star', 'wahana', 'dse'].map(courier => (
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

            {/* TAB 3: SYSTEM */}
            {activeTab === 'system' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex items-center justify-between p-6 bg-red-50 border border-red-100">
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-red-800">Maintenance Mode</h3>
                    <p className="text-[9px] text-red-600 mt-1 uppercase tracking-tight">Disables Checkout access for customers temporarily.</p>
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