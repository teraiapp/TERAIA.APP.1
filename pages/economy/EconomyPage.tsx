
import React, { useState, useMemo, useEffect } from 'react';
import { 
    Banknote, PlusCircle, FileDown, Trash2, Edit, X, 
    TrendingUp, TrendingDown, Scale, AlertTriangle, 
    FileText, CheckCircle, Info, Inbox,
    Search, Filter, Save, Landmark, ArrowRight, Clock,
    Download, Eye, Link as LinkIcon, History, Camera,
    ChevronRight, Calendar, Tag, MapPin
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../hooks/useAppContext';
import { ledgerService } from '../../services/ledgerService';
import { livestockService } from '../../services/livestockService';
import { LedgerEntry, LedgerScope, LedgerType, LedgerCategory, PaymentStatus } from '../../types';

const EconomyPage: React.FC = () => {
    const navigate = useNavigate();
    const { companyProfile } = useAppContext();
    const [entries, setEntries] = useState<LedgerEntry[]>([]);
    const [activeTab, setActiveTab] = useState<'dash' | 'list'>('dash');
    const [showEntryModal, setShowEntryModal] = useState<{show: boolean, type: LedgerType} | null>(null);
    
    // Filtri
    const [scopeFilter, setScopeFilter] = useState<LedgerScope | 'ALL'>('ALL');
    const [catFilter, setCatFilter] = useState<LedgerCategory | 'ALL'>('ALL');
    const [dateFilter, setDateFilter] = useState<'7' | '30' | '90' | 'ALL'>('30');
    const [search, setSearch] = useState('');

    useEffect(() => {
        refresh();
        const handler = () => refresh();
        window.addEventListener('teraia:ledger-changed', handler);
        return () => window.removeEventListener('teraia:ledger-changed', handler);
    }, []);

    const refresh = () => setEntries(ledgerService.getEntries());

    const filteredEntries = useMemo(() => {
        let list = [...entries];
        
        if (scopeFilter !== 'ALL') list = list.filter(e => e.scope === scopeFilter);
        if (catFilter !== 'ALL') list = list.filter(e => e.category === catFilter);
        
        if (dateFilter !== 'ALL') {
            const days = parseInt(dateFilter);
            const limit = Date.now() - (days * 24 * 60 * 60 * 1000);
            list = list.filter(e => new Date(e.date).getTime() >= limit);
        }

        if (search) {
            const s = search.toLowerCase();
            list = list.filter(e => 
                e.description.toLowerCase().includes(s) || 
                e.category.toLowerCase().includes(s)
            );
        }

        return list;
    }, [entries, scopeFilter, catFilter, dateFilter, search]);

    const stats = useMemo(() => {
        const costs = filteredEntries.filter(e => e.type === 'COSTO').reduce((s, e) => s + e.amount, 0);
        const revenues = filteredEntries.filter(e => e.type === 'RICAVO').reduce((s, e) => s + e.amount, 0);
        const pending = filteredEntries.filter(e => e.type === 'COSTO' && e.paymentStatus === 'DA_PAGARE').reduce((s, e) => s + e.amount, 0);
        return { costs, revenues, margin: revenues - costs, pending };
    }, [filteredEntries]);

    const handleAddManualEntry = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        
        ledgerService.addEntry({
            date: f.get('date') as string,
            scope: f.get('scope') as LedgerScope,
            type: showEntryModal!.type,
            category: f.get('category') as LedgerCategory,
            description: f.get('description') as string,
            amount: Number(f.get('amount')),
            source: 'MANUALE',
            unitId: f.get('unitId') as string || undefined
        });

        setShowEntryModal(null);
    };

    const navigateToSource = (entry: LedgerEntry) => {
        if (!entry.sourceRef) return;
        const { module, entityId } = entry.sourceRef;
        
        switch (module) {
            case 'ALLEVAMENTO_ALIMENTAZIONE':
                navigate('/allevamento/alimentazione');
                break;
            case 'ALLEVAMENTO_SANITA':
                navigate('/allevamento/sanita');
                break;
            case 'ALLEVAMENTO_PRODUZIONE':
                navigate('/allevamento/produzione');
                break;
            case 'MAGAZZINO':
                navigate('/magazzino');
                break;
            case 'INBOX':
                navigate(`/inbox/${entityId}`);
                break;
            default:
                console.warn("Modulo sorgente non gestito:", module);
        }
    };

    const categories: LedgerCategory[] = ["MANGIMI", "VETERINARIO", "FARMACI", "CARBURANTE", "RICAMBI", "MANODOPERA", "VENDITE", "ALTRO"];
    const units = livestockService.getUnits();

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-text-primary flex items-center gap-3 uppercase tracking-tighter">
                        <Banknote className="text-primary" size={36} /> Bilancio & Economia
                    </h1>
                    <p className="text-text-secondary text-sm font-medium uppercase tracking-widest">v1.2 • Analisi Margini & Flussi</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setShowEntryModal({show: true, type: 'COSTO'})} className="px-5 py-3 bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 transition-all flex items-center gap-2">
                        <PlusCircle size={16}/> Nuovo Costo
                    </button>
                    <button onClick={() => setShowEntryModal({show: true, type: 'RICAVO'})} className="px-5 py-3 bg-green-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 transition-all flex items-center gap-2">
                        <PlusCircle size={16}/> Nuovo Ricavo
                    </button>
                </div>
            </div>

            {/* KPI METRICS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-[32px] p-6 shadow-xl border border-gray-50 border-b-8 border-green-500">
                    <p className="text-[10px] font-black text-text-secondary uppercase mb-2 tracking-widest">Ricavi</p>
                    <p className="text-3xl font-black text-green-600">€ {stats.revenues.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-[32px] p-6 shadow-xl border border-gray-50 border-b-8 border-red-500">
                    <p className="text-[10px] font-black text-text-secondary uppercase mb-2 tracking-widest">Costi</p>
                    <p className="text-3xl font-black text-red-600">€ {stats.costs.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-[32px] p-6 shadow-xl border border-gray-50 border-b-8 border-orange-500">
                    <p className="text-[10px] font-black text-text-secondary uppercase mb-2 tracking-widest">Da Pagare</p>
                    <p className="text-3xl font-black text-orange-600">€ {stats.pending.toLocaleString()}</p>
                </div>
                <div className={`rounded-[32px] p-6 shadow-xl text-white ${stats.margin >= 0 ? 'bg-primary' : 'bg-red-600'}`}>
                    <p className="text-[10px] font-black uppercase mb-2 opacity-60 tracking-widest">Margine Netto</p>
                    <p className="text-3xl font-black">€ {stats.margin.toLocaleString()}</p>
                </div>
            </div>

            {/* FILTRI */}
            <div className="bg-white p-6 rounded-[32px] shadow-xl border border-gray-50 flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18}/>
                    <input className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-primary" placeholder="Cerca movimenti..." value={search} onChange={e => setSearch(e.target.value)}/>
                </div>
                <select className="p-3 bg-gray-50 rounded-xl font-bold text-sm border-none outline-none focus:ring-2 focus:ring-primary" value={scopeFilter} onChange={e => setScopeFilter(e.target.value as any)}>
                    <option value="ALL">Tutti gli Ambiti</option>
                    <option value="AGRICOLTURA">Agricoltura</option>
                    <option value="ALLEVAMENTO">Allevamento</option>
                    <option value="GENERALE">Generale</option>
                </select>
                <select className="p-3 bg-gray-50 rounded-xl font-bold text-sm border-none outline-none focus:ring-2 focus:ring-primary" value={catFilter} onChange={e => setCatFilter(e.target.value as any)}>
                    <option value="ALL">Tutte le Categorie</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select className="p-3 bg-gray-50 rounded-xl font-bold text-sm border-none outline-none focus:ring-2 focus:ring-primary" value={dateFilter} onChange={e => setDateFilter(e.target.value as any)}>
                    <option value="7">Ultimi 7 giorni</option>
                    <option value="30">Ultimi 30 giorni</option>
                    <option value="90">Ultimi 90 giorni</option>
                    <option value="ALL">Sempre</option>
                </select>
            </div>

            {/* LISTA VOCI */}
            <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100">
                <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                    <h2 className="text-xl font-black uppercase flex items-center gap-2"><History size={20}/> Registro Movimenti</h2>
                    <button className="flex items-center gap-2 text-xs font-black text-primary uppercase"><Download size={16}/> Export CSV</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b text-text-secondary uppercase text-[10px] font-black tracking-widest">
                            <tr>
                                <th className="p-6">Data</th>
                                <th className="p-6">Descrizione</th>
                                <th className="p-6">Ambito / Cat.</th>
                                <th className="p-6">Importo</th>
                                <th className="p-6">Sorgente</th>
                                <th className="p-6 text-right">Azioni</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredEntries.length > 0 ? filteredEntries.map(e => (
                                <tr key={e.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="p-6 font-bold">{new Date(e.date).toLocaleDateString()}</td>
                                    <td className="p-6">
                                        <p className="font-black uppercase text-xs">{e.description}</p>
                                        {e.unitId && (
                                            <p className="text-[9px] text-text-secondary flex items-center gap-1 mt-1">
                                                <MapPin size={10}/> {units.find(u => u.id === e.unitId)?.name || e.unitId}
                                            </p>
                                        )}
                                    </td>
                                    <td className="p-6">
                                        <div className="flex flex-col gap-1">
                                            <span className={`w-fit px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                                e.scope === 'ALLEVAMENTO' ? 'bg-blue-100 text-blue-700' : 
                                                e.scope === 'AGRICOLTURA' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                            }`}>
                                                {e.scope}
                                            </span>
                                            <span className="text-[10px] font-bold text-text-secondary">{e.category}</span>
                                        </div>
                                    </td>
                                    <td className={`p-6 font-black text-lg ${e.type === 'RICAVO' ? 'text-green-600' : 'text-red-600'}`}>
                                        {e.type === 'RICAVO' ? '+' : '-'} € {e.amount.toFixed(2)}
                                    </td>
                                    <td className="p-6">
                                        <span className={`px-2 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                                            e.source === 'EVENTO_APP' ? 'bg-indigo-50 text-indigo-600' : 
                                            e.source === 'MAGAZZINO' ? 'bg-amber-50 text-amber-600' : 
                                            e.source === 'FATTURA' ? 'bg-purple-50 text-purple-600' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {e.source.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="p-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            {e.sourceRef && (
                                                <button 
                                                    onClick={() => navigateToSource(e)} 
                                                    className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-all" 
                                                    title="Vai al modulo correlato"
                                                >
                                                    <LinkIcon size={16}/>
                                                </button>
                                            )}
                                            <button onClick={() => {if(confirm('Eliminare?')) ledgerService.deleteEntry(e.id)}} className="p-2 text-gray-300 hover:text-red-500"><Trash2 size={16}/></button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={6} className="p-20 text-center text-text-secondary italic">Nessun movimento trovato con i filtri selezionati.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODALE NUOVO MOVIMENTO MANUALE */}
            {showEntryModal?.show && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <form onSubmit={handleAddManualEntry} className="bg-white rounded-[40px] shadow-2xl p-10 w-full max-w-lg border-2 border-white animate-in zoom-in">
                        <div className="flex items-center gap-3 mb-8">
                            <div className={`p-4 rounded-3xl ${showEntryModal.type === 'COSTO' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                <Banknote/>
                            </div>
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-tighter">Nuovo {showEntryModal.type === 'COSTO' ? 'Costo' : 'Ricavo'}</h2>
                                <p className="text-xs font-bold text-text-secondary uppercase">Inserimento Manuale</p>
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Data*</label>
                                    <input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none"/>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Ambito*</label>
                                    <select name="scope" required className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none">
                                        <option value="ALLEVAMENTO">Allevamento</option>
                                        <option value="AGRICOLTURA">Agricoltura</option>
                                        <option value="GENERALE">Generale</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Categoria*</label>
                                <select name="category" required className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none">
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Descrizione*</label>
                                <input name="description" required className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none" placeholder="Es: Acquisto sementi mais"/>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Importo (€)*</label>
                                    <input name="amount" type="number" step="0.01" required className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none text-xl" placeholder="0.00"/>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Unità (Opzionale)</label>
                                    <select name="unitId" className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none">
                                        <option value="">Nessuna</option>
                                        {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-100 transition-all">
                                <Camera className="text-text-secondary" size={24}/>
                                <p className="text-[10px] font-black uppercase text-text-secondary">Allega Foto Scontrino / Fattura</p>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-10">
                            <button type="button" onClick={() => setShowEntryModal(null)} className="flex-1 py-4 bg-gray-100 rounded-2xl font-black text-xs uppercase">Annulla</button>
                            <button type="submit" className={`flex-1 py-4 text-white rounded-2xl font-black text-xs uppercase shadow-lg ${showEntryModal.type === 'COSTO' ? 'bg-red-600' : 'bg-green-600'}`}>Salva</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default EconomyPage;
