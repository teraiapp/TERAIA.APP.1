
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
    Search, ShieldCheck, Beaker, AlertTriangle, CheckCircle, 
    Info, LayoutGrid, Zap, Filter, ArrowRight, ShieldAlert,
    Clock, ThermometerSun, Leaf, Database, X, AlertCircle,
    Save, RotateCcw, Plus, Trash2, ExternalLink, MapPin,
    // Fix: added missing DatabaseZap import
    DatabaseZap
} from 'lucide-react';
import { useAppContext } from '../../hooks/useAppContext';
import { PRODUCTS_CATALOG, FitogestProduct } from '../../data/fitogestProducts';
import { DISCIPLINARI_RULES } from '../../data/disciplinariRules';
import { AVVERSITA } from '../../data/avversita';
import { regions } from '../../data/geo/italyGeoData';
import { GoogleGenAI } from "@google/genai";

const STORAGE_FILTERS = 'teraia_catalogo_filters_v1';
const STORAGE_DRAFT = 'teraia_treatment_draft_v1';

const PhytosanitaryCatalogPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser } = useAppContext();

    // --- STATO FILTRI ---
    const [filters, setFilters] = useState(() => {
        const saved = localStorage.getItem(STORAGE_FILTERS);
        const queryParams = new URLSearchParams(location.search);
        
        return saved ? JSON.parse(saved) : {
            regione: queryParams.get('regione') || '',
            coltura: queryParams.get('coltura') || '',
            avversita: queryParams.get('avversita') || '',
            tipoAzienda: 'integrata' // 'integrata' | 'bio'
        };
    });

    // --- STATO BOZZA ---
    const [draft, setDraft] = useState<{ products: FitogestProduct[], surface: number, date: string }>(() => {
        const saved = localStorage.getItem(STORAGE_DRAFT);
        return saved ? JSON.parse(saved) : { products: [], surface: 1, date: new Date().toISOString().split('T')[0] };
    });

    const [aiDraftText, setAiDraftText] = useState('');
    const [isGeneratingAi, setIsGeneratingAi] = useState(false);

    useEffect(() => {
        localStorage.setItem(STORAGE_FILTERS, JSON.stringify(filters));
    }, [filters]);

    useEffect(() => {
        localStorage.setItem(STORAGE_DRAFT, JSON.stringify(draft));
    }, [draft]);

    // --- LOGICA FILTRAGGIO ---
    const filteredAvversita = useMemo(() => {
        if (!filters.coltura) return [];
        return AVVERSITA.filter(a => a.cropKeys.includes(filters.coltura.toLowerCase()));
    }, [filters.coltura]);

    const productsResult = useMemo(() => {
        return PRODUCTS_CATALOG.filter(p => {
            const matchesCrop = !filters.coltura || p.coltureConsentite.includes(filters.coltura.toLowerCase());
            const matchesAdv = !filters.avversita || p.avversitaConsentite.includes(filters.avversita.toLowerCase());
            const matchesBio = filters.tipoAzienda === 'bio' ? p.bio : true;
            return matchesCrop && matchesAdv && matchesBio;
        });
    }, [filters]);

    // --- MOTORE COMPLIANCE ---
    const checkCompliance = (product: FitogestProduct) => {
        if (!filters.regione || !filters.coltura) return { allowed: true };
        
        const rule = DISCIPLINARI_RULES.find(r => 
            r.regione.toLowerCase() === filters.regione.toLowerCase() && 
            r.coltura.toLowerCase() === filters.coltura.toLowerCase()
        );

        if (!rule) return { allowed: true, warning: 'Nessun disciplinare specifico trovato. Verifica etichetta.' };

        const isIngredientAllowed = product.principiAttivi.some(pa => rule.principiAttiviConsentiti.includes(pa));
        const isIngredientForbidden = product.principiAttivi.some(pa => rule.principiAttiviVietati.includes(pa));

        if (isIngredientForbidden) return { allowed: false, reason: `Principio attivo vietato in ${filters.regione}: ${product.principiAttivi.join(', ')}` };
        if (!isIngredientAllowed) return { allowed: false, reason: `Principio attivo non menzionato nel disciplinare ${filters.regione}.` };

        return { allowed: true, note: rule.limitiSpeciali };
    };

    // --- AZIONI ---
    const addToDraft = (p: FitogestProduct) => {
        if (draft.products.some(curr => curr.id === p.id)) return;
        setDraft({ ...draft, products: [...draft.products, p] });
    };

    const removeFromDraft = (id: string) => {
        setDraft({ ...draft, products: draft.products.filter(p => p.id !== id) });
    };

    const handleSaveToQuaderno = () => {
        if (draft.products.length === 0) return;
        
        const entries = JSON.parse(localStorage.getItem('teraia_campbook_entries_v1') || '[]');
        
        draft.products.forEach(p => {
            const newEntry = {
                id: `entry-${Date.now()}-${p.id}`,
                unitId: 'manual-entry',
                type: 'trattamento',
                date: draft.date,
                unitType: 'Campo',
                unitName: 'Appezzamento da Catalogo',
                crop: filters.coltura || 'Generica',
                details: {
                    product: p.nome,
                    dose: `${p.doseMax} ${p.unitaMisura}`,
                    adversity: AVVERSITA.find(a => a.key === filters.avversita)?.label || 'Controllo',
                    reason: 'Trattamento pianificato via Catalogo TeraIA',
                    operator: currentUser?.name || 'Agricoltore',
                    safetyIntervalDays: p.carenzaGiorni
                },
                createdAt: new Date().toISOString()
            };
            entries.push(newEntry);
        });

        localStorage.setItem('teraia_campbook_entries_v1', JSON.stringify(entries));
        alert('Trattamenti registrati con successo nel Quaderno!');
        navigate('/quaderno');
    };

    const generateAiDraft = async () => {
        if (draft.products.length === 0) return;
        setIsGeneratingAi(true);
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Genera una bozza tecnica di trattamento agricolo per un'azienda a regime ${filters.tipoAzienda}.
            Regione: ${filters.regione}. Coltura: ${filters.coltura}. Avversità: ${filters.avversita}.
            Prodotti scelti: ${draft.products.map(p => p.nome).join(', ')}.
            Ettari da trattare: ${draft.surface}.
            Includi motivazione agronomica breve, calcolo dosi totali e note sui tempi di carenza. Sii professionale.`;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
            });

            setAiDraftText(response.text || 'Impossibile generare la bozza al momento.');
        } catch (e) {
            setAiDraftText("Bozza Generata: Si consiglia l'intervento nelle ore serali per massimizzare l'efficacia del prodotto. Rispetta le dosi indicate in etichetta.");
        } finally {
            setIsGeneratingAi(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-text-primary flex items-center gap-3 uppercase tracking-tighter">
                        <Beaker className="text-primary" size={36} /> Catalogo Fitosanitari
                    </h1>
                    <p className="text-text-secondary text-sm font-medium italic">Powered by Fitogest Knowledge System</p>
                </div>
                <div className="flex gap-2">
                    <div className="flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
                        <ShieldCheck size={14} className="text-primary"/>
                        <span className="text-[10px] font-black uppercase text-text-secondary">Dati Certificati</span>
                    </div>
                </div>
            </div>

            {/* SEZIONE FILTRI */}
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4 bg-white p-6 rounded-[32px] shadow-xl border border-gray-50">
                <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Regione</label>
                    <select 
                        className="w-full p-3 bg-gray-50 border-none rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-primary"
                        value={filters.regione}
                        onChange={e => setFilters({ ...filters, regione: e.target.value })}
                    >
                        <option value="">Seleziona Regione</option>
                        {regions.map(r => <option key={r.code} value={r.name}>{r.name}</option>)}
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Coltura</label>
                    <select 
                        className="w-full p-3 bg-gray-50 border-none rounded-xl font-bold text-sm outline-none"
                        value={filters.coltura}
                        onChange={e => setFilters({ ...filters, coltura: e.target.value, avversita: '' })}
                    >
                        <option value="">Scegli Coltura</option>
                        {['Vite', 'Ulivo', 'Pomodoro', 'Melo', 'Patata'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Avversità</label>
                    <select 
                        disabled={!filters.coltura}
                        className="w-full p-3 bg-gray-50 border-none rounded-xl font-bold text-sm outline-none disabled:opacity-30"
                        value={filters.avversita}
                        onChange={e => setFilters({ ...filters, avversita: e.target.value })}
                    >
                        <option value="">Scegli Problema</option>
                        {filteredAvversita.map(a => <option key={a.key} value={a.key}>{a.label}</option>)}
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Regime Aziendale</label>
                    <select 
                        className="w-full p-3 bg-gray-50 border-none rounded-xl font-bold text-sm outline-none"
                        value={filters.tipoAzienda}
                        onChange={e => setFilters({ ...filters, tipoAzienda: e.target.value })}
                    >
                        <option value="integrata">Produzione Integrata</option>
                        <option value="bio">Biologico Certificato</option>
                    </select>
                </div>
                <div className="flex items-end">
                    <button 
                        onClick={() => setFilters({ regione: '', coltura: '', avversita: '', tipoAzienda: 'integrata' })}
                        className="w-full p-3 text-text-secondary font-black text-[10px] uppercase hover:text-primary transition-colors flex items-center justify-center gap-2"
                    >
                        <RotateCcw size={14}/> Reset Filtri
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* LISTA PRODOTTI */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                            <Zap size={20} className="text-yellow-500"/> Prodotti Trovati 
                            <span className="text-xs bg-gray-900 text-white px-2 py-0.5 rounded-full ml-2">{productsResult.length}</span>
                        </h2>
                    </div>

                    {!filters.coltura ? (
                        <div className="bg-gray-50 rounded-[40px] p-20 text-center border-2 border-dashed border-gray-200">
                            <Leaf size={64} className="mx-auto text-gray-200 mb-6"/>
                            <h3 className="text-xl font-black text-gray-400 uppercase">Seleziona una coltura</h3>
                            <p className="text-text-secondary mt-2">Usa i filtri in alto per vedere i prodotti autorizzati.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {productsResult.map(product => {
                                const compliance = checkCompliance(product);
                                return (
                                    <div key={product.id} className={`bg-white rounded-[32px] p-6 shadow-xl border-t-8 transition-all hover:scale-[1.02] ${compliance.allowed ? 'border-primary' : 'border-red-500 opacity-80'}`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex flex-wrap gap-2">
                                                {product.bio && <span className="px-2 py-0.5 bg-green-600 text-white text-[8px] font-black rounded uppercase">BIO OK</span>}
                                                <span className={`px-2 py-0.5 text-[8px] font-black rounded uppercase ${compliance.allowed ? 'bg-primary/10 text-primary' : 'bg-red-100 text-red-600'}`}>
                                                    {compliance.allowed ? 'CONSENTITO' : 'NON CONSENTITO'}
                                                </span>
                                            </div>
                                            <span className={`p-2 rounded-lg ${product.pericolo === 'Pericolo' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-400'}`}>
                                                <ShieldAlert size={16}/>
                                            </span>
                                        </div>
                                        
                                        <h3 className="text-lg font-black text-text-primary leading-tight mb-2">{product.nome}</h3>
                                        <p className="text-[10px] font-bold text-text-secondary uppercase mb-4">{product.principiAttivi.join(', ')}</p>
                                        
                                        <div className="grid grid-cols-2 gap-4 mb-6">
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-black text-text-secondary uppercase">Carenza</p>
                                                <p className="text-sm font-black text-red-600">{product.carenzaGiorni} gg</p>
                                            </div>
                                            <div className="space-y-1 text-right">
                                                <p className="text-[9px] font-black text-text-secondary uppercase">Dose Max</p>
                                                <p className="text-sm font-black">{product.doseMax} {product.unitaMisura}</p>
                                            </div>
                                        </div>

                                        {!compliance.allowed ? (
                                            <div className="p-3 bg-red-50 rounded-2xl text-[10px] text-red-700 font-bold mb-4 flex items-start gap-2 leading-relaxed">
                                                <AlertCircle size={14} className="shrink-0"/> {compliance.reason}
                                            </div>
                                        ) : compliance.note && (
                                            <div className="p-3 bg-blue-50 rounded-2xl text-[10px] text-blue-700 font-bold mb-4 flex items-start gap-2">
                                                <Info size={14} className="shrink-0"/> {compliance.note}
                                            </div>
                                        )}

                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => navigate(`/catalogo-fitosanitari/prodotto/${product.id}`)}
                                                className="flex-1 py-3 bg-gray-900 text-white text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-black transition-all"
                                            >
                                                Scheda
                                            </button>
                                            {compliance.allowed && (
                                                <button 
                                                    onClick={() => addToDraft(product)}
                                                    className="p-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all shadow-md"
                                                    title="Aggiungi a bozza"
                                                >
                                                    <Plus size={18}/>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* BOZZA TRATTAMENTO */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-gray-900 text-white rounded-[40px] p-8 shadow-2xl sticky top-8">
                        <h3 className="text-xl font-black mb-6 uppercase tracking-tighter flex items-center gap-2">
                            <DatabaseZap className="text-primary"/> Bozza Trattamento
                        </h3>
                        
                        {draft.products.length > 0 ? (
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    {draft.products.map(p => (
                                        <div key={p.id} className="flex justify-between items-center p-3 bg-white/10 rounded-2xl border border-white/5 group">
                                            <div className="overflow-hidden">
                                                <p className="font-bold text-xs truncate">{p.nome}</p>
                                                <p className="text-[9px] opacity-60">Dose: {(p.doseMax * draft.surface).toFixed(0)} {p.unitaMisura}</p>
                                            </div>
                                            <button onClick={() => removeFromDraft(p.id)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14}/></button>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-4 border-t border-white/10 pt-6">
                                    <div>
                                        <label className="text-[9px] font-black uppercase text-white/50 block mb-2">Superficie (Ha)</label>
                                        <input 
                                            type="number" step="0.1" 
                                            className="w-full bg-white/5 border-2 border-white/10 p-3 rounded-xl outline-none focus:border-primary font-black"
                                            value={draft.surface}
                                            onChange={e => setDraft({ ...draft, surface: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-black uppercase text-white/50 block mb-2">Data Prevista</label>
                                        <input 
                                            type="date" 
                                            className="w-full bg-white/5 border-2 border-white/10 p-3 rounded-xl outline-none font-black"
                                            value={draft.date}
                                            onChange={e => setDraft({ ...draft, date: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3 pt-4">
                                    <button 
                                        onClick={generateAiDraft}
                                        disabled={isGeneratingAi}
                                        className="w-full py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 hover:scale-105 transition-all"
                                    >
                                        {isGeneratingAi ? <RotateCcw className="animate-spin" size={16}/> : <Sparkles size={16}/>}
                                        Genera Bozza AI
                                    </button>
                                    <button 
                                        onClick={handleSaveToQuaderno}
                                        className="w-full py-4 bg-white text-gray-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all"
                                    >
                                        Salva nel Quaderno
                                    </button>
                                    <button 
                                        onClick={() => setDraft({ ...draft, products: [] })}
                                        className="w-full py-2 text-[10px] font-bold opacity-40 uppercase hover:opacity-100"
                                    >
                                        Reset Bozza
                                    </button>
                                </div>

                                {aiDraftText && (
                                    <div className="p-4 bg-white/5 rounded-3xl border border-white/10 animate-in slide-in-from-bottom-2 duration-300">
                                        <p className="text-[9px] font-black uppercase text-primary mb-2 flex items-center gap-1"><Sparkles size={10}/> Consigli TeraIA:</p>
                                        <p className="text-xs italic leading-relaxed opacity-80">"{aiDraftText}"</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="py-12 text-center opacity-30 border-2 border-dashed border-white/20 rounded-[32px]">
                                <Plus size={32} className="mx-auto mb-4"/>
                                <p className="text-xs font-bold uppercase">Aggiungi prodotti <br/>per iniziare</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const Sparkles: React.FC<{size?: number, className?: string}> = ({size = 24, className}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
        <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
    </svg>
);

export default PhytosanitaryCatalogPage;
