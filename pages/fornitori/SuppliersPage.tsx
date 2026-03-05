
import React, { useState, useEffect, useMemo } from 'react';
import { Truck, PlusCircle, Search, Filter, X, Edit, Trash2, MapPin, Package, RefreshCw } from 'lucide-react';
import { useAppContext } from '../../hooks/useAppContext';
import LocationSelector from '../../components/LocationSelector';
import { GeoLocation } from '../../types';

const INITIAL_SUPPLIERS = [
    { id: '1', name: 'AgroForniture Nord', type: 'Concimi', region: '03', province: 'MI', commune: 'Milano' },
    { id: '2', name: 'Vivai Del Sole', type: 'Vivai', region: '16', province: 'BA', commune: 'Altamura' }
];

const SuppliersPage: React.FC = () => {
    const { companyProfile } = useAppContext();
    const [suppliers] = useState(INITIAL_SUPPLIERS);
    const [search, setSearch] = useState('');
    
    // Filtro località
    const [locFilter, setLocFilter] = useState<GeoLocation>({
        regionCode: "", provinceCode: "", communeCode: "",
        regionName: "", provinceName: "", communeName: ""
    });

    const filteredSuppliers = useMemo(() => {
        return suppliers.filter(s => {
            const mSearch = !search || s.name.toLowerCase().includes(search.toLowerCase());
            const mReg = !locFilter.regionCode || s.region === locFilter.regionCode;
            const mProv = !locFilter.provinceCode || s.province === locFilter.provinceCode;
            return mSearch && mReg && mProv;
        });
    }, [suppliers, search, locFilter]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-text-primary uppercase tracking-tighter flex items-center gap-3">
                        <Truck size={36} className="text-primary"/> Fornitori Partner
                    </h1>
                </div>
                <button className="px-6 py-3 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Aggiungi Fornitore</button>
            </div>

            {/* ADVANCED FILTERS */}
            <div className="bg-white p-8 rounded-[40px] shadow-xl border border-gray-50 space-y-6">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-black uppercase text-text-secondary tracking-widest flex items-center gap-2"><Filter size={14}/> Ricerca Avanzata</h3>
                    <button 
                        onClick={() => { setSearch(''); setLocFilter({ regionCode: "", provinceCode: "", communeCode: "" }); }}
                        className="text-[10px] font-black text-primary uppercase underline"
                    >
                        Reset Filtri
                    </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
                    <div className="lg:col-span-4">
                         <label className="text-[10px] font-black uppercase text-text-secondary ml-1 mb-1 block tracking-widest">Cerca Ragione Sociale</label>
                         <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18}/>
                            <input 
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Esempio: Vivai..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                         </div>
                    </div>
                    <div className="lg:col-span-8">
                        <LocationSelector 
                            value={locFilter} 
                            onChange={setLocFilter} 
                            mode="filter"
                        />
                    </div>
                </div>
            </div>

            {/* LIST */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSuppliers.map(s => (
                    <div key={s.id} className="bg-white p-8 rounded-[40px] shadow-lg border border-gray-100 group hover:border-primary transition-all">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-4 bg-primary/10 rounded-3xl text-primary"><Package size={24}/></div>
                            <span className="px-3 py-1 bg-gray-100 text-text-secondary rounded-full text-[9px] font-black uppercase">{s.type}</span>
                        </div>
                        <h4 className="text-xl font-black text-text-primary uppercase tracking-tighter mb-2 leading-none group-hover:text-primary transition-colors">{s.name}</h4>
                        <p className="text-xs text-text-secondary font-bold flex items-center gap-1 uppercase tracking-widest"><MapPin size={12}/> {s.commune} ({s.province})</p>
                        
                        <div className="mt-8 pt-8 border-t border-gray-50 flex justify-between items-center">
                            <button className="text-xs font-black uppercase text-primary hover:underline">Vedi Listino</button>
                            <button className="p-3 bg-gray-50 rounded-xl hover:bg-primary/10 transition-colors"><Edit size={16}/></button>
                        </div>
                    </div>
                ))}
                {filteredSuppliers.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-gray-50 rounded-[40px] border-2 border-dashed">
                        <p className="text-text-secondary font-black uppercase text-xs">Nessun fornitore trovato con questi filtri.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SuppliersPage;
