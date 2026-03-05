
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    DatabaseZap, Users, ShieldCheck, Filter, Search, 
    PlusCircle, Info, ArrowRight, Save, Link as LinkIcon,
    Trash2, Pencil, X, TrendingUp, FileText, Download,
    CheckCircle, AlertTriangle, MapPin, Calendar, Tag,
    ChevronRight, Copy, Share2, Eye
} from 'lucide-react';
import { useAppContext } from '../../hooks/useAppContext';
import { REGIONS, PROVINCES, CITIES } from '../../data/geo/italyGeo';
import { CollectiveInsight, INITIAL_COLLECTIVE_INSIGHTS, CollectiveCategory, EvidenceLevel } from '../../data/memoryCollectiveData';
import { PrivateNote, INITIAL_PRIVATE_NOTES, PrivateNoteType } from '../../data/memoryPrivateData';

const STORAGE_COLL = 'teraia_collective_memory_v1';
const STORAGE_PRIV = 'teraia_private_memory_v1';

const CollectiveMemoryPage: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser } = useAppContext();
    
    // --- STATO DATI ---
    const [collectiveInsights, setCollectiveInsights] = useState<CollectiveInsight[]>(() => {
        const saved = localStorage.getItem(STORAGE_COLL);
        return saved ? JSON.parse(saved) : INITIAL_COLLECTIVE_INSIGHTS;
    });

    const [privateNotes, setPrivateNotes] = useState<PrivateNote[]>(() => {
        const saved = localStorage.getItem(STORAGE_PRIV);
        return saved ? JSON.parse(saved) : INITIAL_PRIVATE_NOTES;
    });

    // --- STATO UI ---
    const [activeTab, setActiveTab] = useState<'collettiva' | 'aziendale' | 'trend'>('collettiva');
    const [modal, setModal] = useState<{ type: 'note' | 'link' | 'report', data?: any, action?: 'add' | 'edit' } | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Filtri Geografici
    const [selRegion, setSelRegion] = useState('');
    const [selProvince, setSelProvince] = useState('');
    const [selCity, setSelCity] = useState('');
    const [selCategory, setSelCategory] = useState<CollectiveCategory | ''>('');

    // Persistenza
    useEffect(() => { localStorage.setItem(STORAGE_COLL, JSON.stringify(collectiveInsights)); }, [collectiveInsights]);
    useEffect(() => { localStorage.setItem(STORAGE_PRIV, JSON.stringify(privateNotes)); }, [privateNotes]);

    // --- LOGICA FILTRAGGIO ---
    const filteredCollective = useMemo(() => {
        return collectiveInsights.filter(i => {
            const mRegion = !selRegion || i.region === selRegion;
            const mProvince = !selProvince || i.province === selProvince;
            const mCity = !selCity || i.city === selCity || i.city === 'Tutte';
            const mCat = !selCategory || i.category === selCategory;
            const mSearch = !searchTerm || i.title.toLowerCase().includes(searchTerm.toLowerCase());
            return mRegion && mProvince && mCity && mCat && mSearch;
        });
    }, [collectiveInsights, selRegion, selProvince, selCity, selCategory, searchTerm]);

    const filteredPrivate = useMemo(() => {
        return privateNotes.filter(n => 
            !searchTerm || n.title.toLowerCase().includes(searchTerm.toLowerCase()) || n.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [privateNotes, searchTerm]);

    // --- AZIONI ---
    const saveToPrivate = (insight: CollectiveInsight) => {
        const newNote: PrivateNote = {
            id: `priv-save-${Date.now()}`,
            title: `Insight: ${insight.title}`,
            type: 'lezione appresa',
            linkedTo: 'Da Territorio',
            description: `${insight.description}\n\nCOSA FUNZIONA: ${insight.whatWorks}\nCOSA EVITARE: ${insight.whatToAvoid}`,
            tags: insight.tags,
            attachments: [],
            isFromCollective: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        setPrivateNotes([newNote, ...privateNotes]);
        alert("Insight salvato nella tua memoria aziendale.");
    };

    const handleDeleteNote = (id: string) => {
        if(confirm("Eliminare questa nota definitivamente?")) {
            setPrivateNotes(prev => prev.filter(n => n.id !== id));
        }
    };

    const handleSaveNote = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const noteData: PrivateNote = {
            id: modal?.action === 'edit' ? modal.data.id : `priv-note-${Date.now()}`,
            title: f.get('title') as string,
            type: f.get('type') as PrivateNoteType,
            linkedTo: f.get('linkedTo') as string,
            description: f.get('description') as string,
            tags: (f.get('tags') as string).split(',').map(t => t.trim()),
            attachments: [],
            isFromCollective: modal?.data?.isFromCollective || false,
            createdAt: modal?.action === 'edit' ? modal.data.createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (modal?.action === 'edit') {
            setPrivateNotes(prev => prev.map(n => n.id === noteData.id ? noteData : n));
        } else {
            setPrivateNotes([noteData, ...privateNotes]);
        }
        setModal(null);
    };

    const generateMockReport = () => {
        const report = `TERAIA REPORT TERRITORIALE - ${new Date().toLocaleDateString()}\nArea: ${selRegion || 'Italia'} ${selProvince}\n\nTop Alert: ${filteredCollective[0]?.title || 'Nessuno'}\nSuccess Rate Stimato: 94%\n\nConsigli: ${filteredCollective[0]?.whatWorks || 'Monitoraggio standard'}`;
        setModal({ type: 'report', data: report });
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-text-primary flex items-center gap-3 uppercase tracking-tighter">
                        <DatabaseZap className="text-primary" size={36} /> Memoria Collettiva AI
                    </h1>
                    <p className="text-text-secondary text-sm font-medium">L'intelligenza del territorio unita all'esperienza della tua azienda.</p>
                </div>
                <div className="flex gap-2">
                    {activeTab === 'aziendale' && (
                        <button onClick={() => setModal({ type: 'note', action: 'add' })} className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all">
                            <PlusCircle size={18}/> Nuova Nota
                        </button>
                    )}
                    <div className="flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
                        <ShieldCheck size={14} className="text-primary"/>
                        <span className="text-[10px] font-black uppercase text-text-secondary">Dati Anonimizzati</span>
                    </div>
                </div>
            </div>

            {/* TABS */}
            <div className="flex p-1 bg-gray-100 rounded-[24px] w-fit shadow-inner">
                {[
                    { id: 'collettiva', label: 'Territorio', icon: Users },
                    { id: 'aziendale', label: 'Aziendale', icon: ShieldCheck },
                    { id: 'trend', label: 'Trend & Report', icon: TrendingUp }
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-[20px] font-black text-xs uppercase tracking-widest transition-all ${
                            activeTab === tab.id ? 'bg-white text-primary shadow-md' : 'text-text-secondary hover:text-text-primary'
                        }`}
                    >
                        <tab.icon size={16}/> {tab.label}
                    </button>
                ))}
            </div>

            {/* FILTRI (TAB COLLETTIVA) */}
            {activeTab === 'collettiva' && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-white p-6 rounded-[32px] shadow-xl border border-gray-50">
                    <div className="md:col-span-1">
                        <label className="text-[10px] font-black uppercase text-text-secondary mb-1 block ml-1">Regione</label>
                        <select 
                            className="w-full p-3 bg-gray-50 border-none rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-primary"
                            value={selRegion}
                            onChange={e => { setSelRegion(e.target.value); setSelProvince(''); setSelCity(''); }}
                        >
                            <option value="">Tutte le Regioni</option>
                            {REGIONS.map(r => <option key={r.code} value={r.name}>{r.name}</option>)}
                        </select>
                    </div>
                    <div className="md:col-span-1">
                        <label className="text-[10px] font-black uppercase text-text-secondary mb-1 block ml-1">Provincia</label>
                        <select 
                            disabled={!selRegion}
                            className="w-full p-3 bg-gray-50 border-none rounded-xl font-bold text-sm outline-none disabled:opacity-30"
                            value={selProvince}
                            onChange={e => { setSelProvince(e.target.value); setSelCity(''); }}
                        >
                            <option value="">Tutte</option>
                            {PROVINCES.filter(p => p.regionCode === REGIONS.find(r=>r.name===selRegion)?.code).map(p => (
                                <option key={p.code} value={p.code}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="md:col-span-1">
                        <label className="text-[10px] font-black uppercase text-text-secondary mb-1 block ml-1">Comune</label>
                        <select 
                            disabled={!selProvince}
                            className="w-full p-3 bg-gray-50 border-none rounded-xl font-bold text-sm outline-none disabled:opacity-30"
                            value={selCity}
                            onChange={e => setSelCity(e.target.value)}
                        >
                            <option value="">Tutti</option>
                            {CITIES.filter(c => c.provinceCode === selProvince).map(c => (
                                <option key={c.name} value={c.name}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="md:col-span-1">
                        <label className="text-[10px] font-black uppercase text-text-secondary mb-1 block ml-1">Categoria</label>
                        <select 
                            className="w-full p-3 bg-gray-50 border-none rounded-xl font-bold text-sm outline-none"
                            value={selCategory}
                            onChange={e => setSelCategory(e.target.value as any)}
                        >
                            <option value="">Tutte</option>
                            {['fitopatie', 'meteo', 'irrigazione', 'nutrizione', 'benessere animale', 'norme'].map(c => (
                                <option key={c} value={c}>{c.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>
                    <div className="md:col-span-1">
                        <label className="text-[10px] font-black uppercase text-text-secondary mb-1 block ml-1">Cerca</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16}/>
                            <input 
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl font-bold text-sm outline-none"
                                placeholder="Esempio: Vite..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* CONTENUTO TAB COLLETTIVA */}
            {activeTab === 'collettiva' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {filteredCollective.length > 0 ? filteredCollective.map(insight => (
                        <div key={insight.id} className="bg-white rounded-[40px] p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all group flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex flex-wrap gap-2">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                                            insight.evidence === 'alta' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                                        }`}>
                                            Evidenza {insight.evidence}
                                        </span>
                                        <span className="px-3 py-1 bg-gray-100 text-text-secondary rounded-full text-[10px] font-black uppercase tracking-tighter">
                                            {insight.category}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-text-secondary uppercase">Confidenza AI</p>
                                        <p className="text-xl font-black text-primary">{insight.confidence}%</p>
                                    </div>
                                </div>
                                <h3 className="text-2xl font-black text-text-primary mb-4 leading-tight group-hover:text-primary transition-colors">{insight.title}</h3>
                                <p className="text-sm text-text-secondary leading-relaxed mb-6 font-medium italic">"{insight.description}"</p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                    <div className="p-4 bg-green-50 rounded-3xl border border-green-100">
                                        <p className="text-[10px] font-black text-green-700 uppercase mb-2">Cosa Funziona</p>
                                        <p className="text-xs font-bold text-green-900 leading-tight">{insight.whatWorks}</p>
                                    </div>
                                    <div className="p-4 bg-red-50 rounded-3xl border border-red-100">
                                        <p className="text-[10px] font-black text-red-700 uppercase mb-2">Cosa Evitare</p>
                                        <p className="text-xs font-bold text-red-900 leading-tight">{insight.whatToAvoid}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-3 pt-6 border-t border-gray-50">
                                <button onClick={() => navigate(`/memoria-collettiva/${insight.id}`)} className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2">
                                    Vedi Dettaglio <ArrowRight size={14}/>
                                </button>
                                <div className="flex gap-2">
                                    <button onClick={() => saveToPrivate(insight)} className="p-4 bg-primary/10 text-primary rounded-2xl hover:bg-primary hover:text-white transition-all" title="Salva in Memoria Privata">
                                        <Save size={20}/>
                                    </button>
                                    <button onClick={() => setModal({ type: 'link', data: insight })} className="p-4 bg-gray-100 text-text-secondary rounded-2xl hover:bg-gray-200 transition-all" title="Collega a moduli">
                                        <LinkIcon size={20}/>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full py-32 text-center bg-white rounded-[48px] border-2 border-dashed border-gray-200 flex flex-col items-center">
                            <Info size={64} className="text-gray-200 mb-6"/>
                            <h3 className="text-2xl font-black text-gray-400 uppercase tracking-tighter">Nessun Insight Trovato</h3>
                            <p className="text-text-secondary mt-2 font-medium">Prova a cambiare filtri geografici o categoria.</p>
                        </div>
                    )}
                </div>
            )}

            {/* CONTENUTO TAB AZIENDALE */}
            {activeTab === 'aziendale' && (
                <div className="space-y-6">
                    <div className="bg-white p-4 rounded-[24px] shadow-sm border border-gray-100 flex items-center gap-4">
                        <Search className="text-text-secondary ml-2" size={20}/>
                        <input 
                            className="flex-1 bg-transparent border-none font-bold text-sm outline-none"
                            placeholder="Cerca nelle tue note private..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPrivate.map(note => (
                            <div key={note.id} className="bg-white rounded-[32px] p-6 shadow-lg border border-gray-100 hover:border-primary transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="px-3 py-1 bg-gray-100 text-text-secondary rounded-full text-[9px] font-black uppercase">
                                        {note.type}
                                    </span>
                                    {note.isFromCollective && (
                                        <span className="flex items-center gap-1 text-[9px] font-black text-primary uppercase">
                                            <Users size={10}/> Da Collettiva
                                        </span>
                                    )}
                                </div>
                                <h4 className="text-lg font-black text-text-primary mb-2 leading-tight">{note.title}</h4>
                                <p className="text-xs text-text-secondary mb-6 line-clamp-3 font-medium">{note.description}</p>
                                
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {note.tags.map(t => (
                                        <span key={t} className="text-[10px] font-bold text-primary flex items-center gap-1">
                                            <Tag size={10}/> {t}
                                        </span>
                                    ))}
                                </div>

                                <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                                    <p className="text-[9px] font-bold text-text-secondary uppercase">
                                        {new Date(note.createdAt).toLocaleDateString()}
                                    </p>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => setModal({ type: 'note', action: 'edit', data: note })} className="p-2 hover:bg-gray-100 rounded-lg text-blue-600"><Pencil size={14}/></button>
                                        <button onClick={() => handleDeleteNote(note.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-500"><Trash2 size={14}/></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {filteredPrivate.length === 0 && (
                            <div className="col-span-full py-20 text-center">
                                <FileText size={48} className="mx-auto text-gray-200 mb-4" />
                                <p className="text-text-secondary font-bold">Inizia a salvare la tua conoscenza aziendale.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* CONTENUTO TAB TREND */}
            {activeTab === 'trend' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-[40px] p-10 shadow-xl border border-gray-50">
                            <h3 className="text-xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3">
                                <TrendingUp size={24} className="text-primary"/> Top Avversità nel Territorio
                            </h3>
                            <div className="space-y-6">
                                {[
                                    { name: 'Peronospora', count: 42, trend: 'up', color: 'bg-red-500' },
                                    { name: 'Stress Idrico', count: 28, trend: 'up', color: 'bg-orange-500' },
                                    { name: 'Carenza Azoto', count: 15, trend: 'down', color: 'bg-yellow-500' }
                                ].map((item, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex justify-between items-center text-sm font-black">
                                            <span className="uppercase">{item.name}</span>
                                            <span>{item.count} segnalazioni</span>
                                        </div>
                                        <div className="h-4 bg-gray-100 rounded-full overflow-hidden flex items-center">
                                            <div className={`h-full ${item.color} rounded-full`} style={{ width: `${(item.count/50)*100}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-[40px] p-10 shadow-xl border border-gray-50">
                            <h3 className="text-xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3">
                                <CheckCircle size={24} className="text-primary"/> Soluzioni di Successo
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { label: 'Rameici a basso dosaggio', rate: '94%', cases: 22 },
                                    { label: 'Irrigazione notturna a goccia', rate: '88%', cases: 18 },
                                    { label: 'Oli minerali Bio', rate: '82%', cases: 12 }
                                ].map((sol, i) => (
                                    <div key={i} className="p-4 bg-gray-50 rounded-[32px] border border-gray-100 flex justify-between items-center">
                                        <div>
                                            <p className="font-black text-sm text-text-primary leading-tight">{sol.label}</p>
                                            <p className="text-[10px] text-text-secondary uppercase font-bold">{sol.cases} utilizzi</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-black text-primary">{sol.rate}</p>
                                            <p className="text-[8px] font-black uppercase opacity-50">Efficacia</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-indigo-600 to-blue-800 rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden group">
                            <FileText className="absolute -top-4 -right-4 w-32 h-32 text-white/10 group-hover:scale-110 transition-transform duration-700"/>
                            <h3 className="text-xl font-black mb-4 uppercase tracking-tighter">Analisi Strategica</h3>
                            <p className="text-sm opacity-90 leading-relaxed font-medium mb-8">Genera un report testuale dettagliato basato sugli insight aggregati della zona selezionata.</p>
                            <button onClick={generateMockReport} className="w-full py-4 bg-white text-indigo-700 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-gray-100 transition-all flex items-center justify-center gap-2">
                                <Download size={18}/> Scarica Report (.csv)
                            </button>
                        </div>
                        
                        <div className="p-6 bg-blue-50 rounded-[32px] border border-blue-100">
                            <div className="flex items-center gap-2 text-blue-800 font-black text-xs uppercase mb-3">
                                <Info size={16}/> Nota Proattiva
                            </div>
                            <p className="text-xs text-blue-700 leading-relaxed font-medium">
                                I trend sono calcolati ogni 24h incrociando i dati di <b>{filteredCollective.length}</b> segnalazioni vicine a te. La precisione aumenta con la condivisione delle esperienze.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* MODALS */}
            {modal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[40px] shadow-2xl p-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto border-2 border-white">
                        
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black uppercase tracking-tighter">
                                {modal.type === 'note' ? (modal.action === 'add' ? 'Aggiungi Conoscenza' : 'Modifica Nota') : 
                                 modal.type === 'report' ? 'Report Generato' : 'Collega Memoria'}
                            </h2>
                            <button onClick={() => setModal(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X/></button>
                        </div>

                        {modal.type === 'note' && (
                            <form onSubmit={handleSaveNote} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Titolo Nota*</label>
                                        <input name="title" defaultValue={modal.data?.title} required className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-primary" placeholder="Esempio: Successo concimazione X"/>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Tipo*</label>
                                        <select name="type" defaultValue={modal.data?.type || 'nota'} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold outline-none">
                                            {['nota', 'lezione appresa', 'procedura', 'errore', 'strategia'].map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Asset Collegato*</label>
                                    <input name="linkedTo" defaultValue={modal.data?.linkedTo} required className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-primary" placeholder="Esempio: Campo Nord / Stalla 2"/>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Descrizione Esperienza*</label>
                                    <textarea name="description" defaultValue={modal.data?.description} required rows={5} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-primary" placeholder="Descrivi cosa hai imparato..."/>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Tags (separati da virgola)</label>
                                    <input name="tags" defaultValue={modal.data?.tags?.join(', ')} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold outline-none" placeholder="Esempio: Vite, Pomodoro, Estate"/>
                                </div>
                                <button type="submit" className="w-full py-5 bg-primary text-white rounded-[24px] font-black shadow-2xl hover:bg-primary-dark transition-all uppercase tracking-widest text-xs">
                                    Salva Conoscenza Aziendale
                                </button>
                            </form>
                        )}

                        {modal.type === 'report' && (
                            <div className="space-y-8">
                                <div className="p-6 bg-gray-50 rounded-3xl border-2 border-primary/20 italic text-sm text-text-primary font-bold leading-relaxed whitespace-pre-wrap">
                                    {modal.data}
                                </div>
                                <div className="flex gap-4">
                                    <button onClick={() => { navigator.clipboard.writeText(modal.data); alert('Copiato!'); }} className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2">
                                        <Copy size={18}/> Copia Testo
                                    </button>
                                    <button onClick={() => setModal(null)} className="flex-1 py-4 bg-gray-100 text-text-primary rounded-2xl font-black uppercase text-xs">Chiudi</button>
                                </div>
                            </div>
                        )}

                        {modal.type === 'link' && (
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { l: 'Produzione', p: '/produzione', i: MapPin, s: { unitName: modal.data.title } },
                                    { l: 'Quaderno', p: '/quaderno', i: FileText, s: { prefill: { details: modal.data.whatWorks } } },
                                    { l: 'AI Rischi', p: '/ai-rischi', i: TrendingUp, s: { autoAlert: true, title: modal.data.title } },
                                    { l: 'Allevamento', p: '/allevamento', i: Users, s: {} }
                                ].map((m, i) => (
                                    <button 
                                        key={i} 
                                        onClick={() => { navigate(m.p, { state: m.s }); setModal(null); }}
                                        className="p-8 bg-gray-50 rounded-[32px] flex flex-col items-center gap-4 hover:bg-primary/10 transition-all group border-2 border-transparent hover:border-primary/20"
                                    >
                                        <m.i className="text-text-secondary group-hover:text-primary" size={40}/>
                                        <span className="text-[10px] font-black uppercase tracking-widest">{m.l}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CollectiveMemoryPage;
