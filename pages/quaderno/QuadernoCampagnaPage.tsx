
import React, { useState, useEffect, useMemo } from 'react';
import { 
    BookText, Search, Filter, Calendar, MapPin, 
    Waves, ShieldAlert, Milk, Wheat, Trash2, 
    ChevronDown, Info, ArrowRight, CheckCircle2,
    Tractor, PenTool, Sprout, ShoppingCart, User,
    X, Stethoscope
} from 'lucide-react';
import { quadernoService } from '../../services/quadernoService';
import { QuadernoEntry, QuadernoEntryType } from '../../types';

// Fix: Added missing properties for all QuadernoEntryType values
const TYPE_CONFIG: Record<QuadernoEntryType, { label: string; color: string; icon: any }> = {
    IRRIGAZIONE: { label: "Irrigazione", color: "bg-blue-100 text-blue-700", icon: Waves },
    TRATTAMENTO: { label: "Trattamento", color: "bg-purple-100 text-purple-700", icon: ShieldAlert },
    FERTILIZZAZIONE: { label: "Fertilizzazione", color: "bg-green-100 text-green-700", icon: Wheat },
    LAVORAZIONE: { label: "Lavorazione", color: "bg-orange-100 text-orange-700", icon: Tractor },
    RACCOLTA: { label: "Raccolta", color: "bg-yellow-100 text-yellow-700", icon: Sprout },
    SEMINA: { label: "Semina", color: "bg-emerald-100 text-emerald-700", icon: Sprout },
    TRAPIANTO: { label: "Trapianto", color: "bg-emerald-100 text-emerald-700", icon: Sprout },
    ALIMENTAZIONE: { label: "Alimentazione", color: "bg-amber-100 text-amber-700", icon: Wheat },
    VACCINAZIONE: { label: "Vaccino", color: "bg-red-100 text-red-700", icon: ShieldAlert },
    VISITA_VETERINARIA: { label: "Visita Vet.", color: "bg-indigo-100 text-indigo-700", icon: User },
    EVENTO_SANITARIO: { label: "Evento Sanitario", color: "bg-rose-100 text-rose-700", icon: ShieldAlert },
    PRODUZIONE_ALLEVAMENTO: { label: "Produzione Allev.", color: "bg-pink-100 text-pink-700", icon: Milk },
    ALIMENTAZIONE_ALLEVAMENTO: { label: "Alim. Allevamento", color: "bg-lime-100 text-lime-700", icon: Wheat },
    SANITA_ALLEVAMENTO: { label: "Sanità Allevamento", color: "bg-red-100 text-red-700", icon: Stethoscope },
};

const QuadernoCampagnaPage: React.FC = () => {
    const [entries, setEntries] = useState<QuadernoEntry[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [selectedEntry, setSelectedEntry] = useState<QuadernoEntry | null>(null);

    const refresh = () => setEntries(quadernoService.getEntries());

    useEffect(() => {
        refresh();
        const handleDataChange = (e: any) => {
            if (e.detail.key === 'teraia_quaderno_entries') refresh();
        };
        window.addEventListener('teraia:data-changed', handleDataChange);
        return () => window.removeEventListener('teraia:data-changed', handleDataChange);
    }, []);

    const filtered = useMemo(() => {
        return entries.filter(e => {
            const mSearch = !searchTerm || 
                e.unitName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                e.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                e.zoneName?.toLowerCase().includes(searchTerm.toLowerCase());
            const mType = filterType === 'all' || e.type === filterType;
            return mSearch && mType;
        }).sort((a,b) => b.date - a.date);
    }, [entries, searchTerm, filterType]);

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black uppercase flex items-center gap-3 tracking-tighter">
                        <BookText className="text-primary" size={36}/> Registro Attività
                    </h1>
                    <p className="text-text-secondary text-sm font-medium mt-1">Quaderno di Campagna Digitale • Sincronizzato OS</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => window.print()} className="px-5 py-2.5 bg-white border border-gray-100 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:bg-gray-50 flex items-center gap-2">
                        Scarica PDF Legale
                    </button>
                    <div className="bg-primary/10 text-primary px-4 py-2 rounded-full font-black text-[10px] uppercase flex items-center gap-2">
                        <CheckCircle2 size={14}/> Certificato Agro-OS
                    </div>
                </div>
            </div>

            {/* BARRA FILTRI */}
            <div className="bg-white p-6 rounded-[32px] shadow-xl border border-gray-50 flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                    <input 
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-primary" 
                        placeholder="Cerca per unità, coltura o note..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-2xl">
                        <Filter size={14} className="text-text-secondary"/>
                        <select 
                            className="bg-transparent font-bold text-sm border-none outline-none focus:ring-0"
                            value={filterType}
                            onChange={e => setFilterType(e.target.value)}
                        >
                            <option value="all">Tutte le Attività</option>
                            {Object.entries(TYPE_CONFIG).map(([k, v]) => (
                                <option key={k} value={k}>{v.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* LISTA REGISTRO */}
            <div className="grid grid-cols-1 gap-4">
                {filtered.length > 0 ? filtered.map(entry => {
                    const cfg = TYPE_CONFIG[entry.type];
                    const Icon = cfg.icon;
                    return (
                        <div 
                            key={entry.id} 
                            onClick={() => setSelectedEntry(entry)}
                            className="bg-white rounded-[32px] p-6 shadow-lg border-2 border-transparent hover:border-primary/20 transition-all cursor-pointer group flex flex-col md:flex-row justify-between items-center gap-6"
                        >
                            <div className="flex items-center gap-6 flex-1 w-full">
                                <div className={`p-5 rounded-[24px] ${cfg.color} shrink-0 group-hover:scale-105 transition-transform`}>
                                    <Icon size={28}/>
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${cfg.color}`}>{cfg.label}</span>
                                        <span className="text-[10px] font-bold text-text-secondary uppercase">{new Date(entry.date).toLocaleDateString('it-IT')}</span>
                                    </div>
                                    <h3 className="text-xl font-black text-text-primary uppercase tracking-tighter leading-none truncate">
                                        {entry.unitName || entry.zoneName || "Operazione Generica"}
                                    </h3>
                                    <p className="text-xs text-text-secondary mt-1 italic font-medium truncate">"{entry.notes || 'Nessuna nota aggiuntiva'}"</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-10 px-8 border-l border-gray-50 w-full md:w-auto justify-between md:justify-end">
                                <div className="text-center">
                                    <p className="text-[9px] font-black text-text-secondary uppercase mb-1">Quantità</p>
                                    <p className="text-lg font-black text-text-primary leading-none">
                                        {entry.quantities?.amount || entry.quantities?.durationMin || entry.quantities?.volumeLiters || "-"}
                                        <span className="text-[10px] ml-1 uppercase opacity-40">{entry.quantities?.unit || (entry.type === 'IRRIGAZIONE' ? 'min' : '')}</span>
                                    </p>
                                </div>
                                <ArrowRight className="text-gray-200 group-hover:text-primary transition-colors" size={20}/>
                            </div>
                        </div>
                    );
                }) : (
                    <div className="py-24 text-center bg-white rounded-[48px] border-2 border-dashed border-gray-200 flex flex-col items-center animate-in zoom-in duration-300">
                        < BookText size={64} className="text-gray-200 mb-6"/>
                        <h3 className="text-2xl font-black text-gray-400 uppercase tracking-tighter">Registro Vuoto</h3>
                        <p className="text-text-secondary mt-2 max-w-sm font-medium">Nessuna attività registrata per i filtri selezionati. Le operazioni appaiono qui automaticamente dai moduli operativi.</p>
                    </div>
                )}
            </div>

            {/* DETTAGLIO MODALE ENTRY */}
            {selectedEntry && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[150] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[48px] shadow-2xl p-10 w-full max-w-2xl border-4 border-white animate-in zoom-in duration-200">
                        <div className="flex justify-between items-start mb-8">
                            <div className="flex items-center gap-4">
                                <div className={`p-4 rounded-3xl ${TYPE_CONFIG[selectedEntry.type].color}`}>
                                    {React.createElement(TYPE_CONFIG[selectedEntry.type].icon, { size: 32 })}
                                </div>
                                <div>
                                    <span className="text-[10px] font-black uppercase text-text-secondary tracking-widest">{selectedEntry.type}</span>
                                    <h2 className="text-3xl font-black uppercase tracking-tighter leading-none">{selectedEntry.unitName || "Attività"}</h2>
                                </div>
                            </div>
                            <button onClick={() => setSelectedEntry(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24}/></button>
                        </div>

                        <div className="grid grid-cols-2 gap-8 mb-10">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-text-secondary uppercase">Data Operazione</label>
                                    <p className="font-bold text-lg">{new Date(selectedEntry.date).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-text-secondary uppercase">Operatore</label>
                                    <p className="font-bold text-lg">{selectedEntry.operator || "Sistema"}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-text-secondary uppercase">Sorgente</label>
                                    <p className="text-sm font-black text-primary uppercase">{selectedModuleSource(selectedEntry)}</p>
                                </div>
                            </div>
                            <div className="bg-gray-50 p-6 rounded-[32px] border border-gray-100">
                                <p className="text-[10px] font-black uppercase text-text-secondary mb-4 tracking-widest">Dettagli Tecnici</p>
                                <div className="space-y-3">
                                    {Object.entries(selectedEntry.quantities || {}).map(([k, v]) => v && (
                                        <div key={k} className="flex justify-between items-center border-b border-gray-100 pb-2">
                                            <span className="text-xs font-bold text-text-secondary uppercase">{k}</span>
                                            <span className="font-black text-sm">{v}</span>
                                        </div>
                                    ))}
                                    {selectedEntry.products?.map((p, i) => (
                                        <div key={i} className="p-3 bg-white rounded-xl border border-gray-200">
                                            <p className="text-[10px] font-black text-primary uppercase leading-none mb-1">{p.name}</p>
                                            <p className="text-xs font-bold">{p.dose} {p.qty}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-blue-50 rounded-[32px] border border-blue-100 flex items-start gap-4 mb-10">
                            <Info className="text-blue-600 shrink-0" size={24}/>
                            <p className="text-xs text-blue-800 font-medium leading-relaxed italic">"{selectedEntry.notes || 'Nessuna nota aggiuntiva registrata.'}"</p>
                        </div>

                        <button 
                            onClick={() => setSelectedEntry(null)}
                            className="w-full py-5 bg-gray-900 text-white rounded-[24px] font-black uppercase text-xs tracking-widest shadow-xl hover:bg-black transition-all"
                        >
                            Chiudi Dettaglio
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper function
const selectedModuleSource = (entry: QuadernoEntry) => {
    return entry.sourceModule || "Sistema OS";
};

export default QuadernoCampagnaPage;
