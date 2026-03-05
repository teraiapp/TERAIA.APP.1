
import React, { useState, useMemo, useEffect } from 'react';
import { 
    DatabaseZap, Users, ShieldCheck, Filter, Search, 
    PlusCircle, Info, ArrowRight, Save, Trash2, X,
    TrendingUp, CheckCircle, AlertTriangle, MapPin, 
    Calendar, Tag, Star, Share2, Eye, Download, ShieldAlert,
    Zap, Clock, FileText, ChevronRight, Edit
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../hooks/useAppContext';
import { CaseReport, AssetType, OutcomeLevel, Role } from '../../types';
import { getPublicCases, getPrivateCases, saveCase, getTerritoryPatterns, calculateQuality } from '../../utils/collectiveMemoryEngineV2';
import { regions } from '../../data/geo/italyGeoData';

const CollectiveMemoryV2Page: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser, companyProfile } = useAppContext();
    const [activeTab, setActiveTab] = useState<'explore' | 'share' | 'my_history' | 'admin'>('explore');

    // --- STATE ---
    const [publicCases, setPublicCases] = useState<CaseReport[]>(getPublicCases);
    const [myCases, setMyCases] = useState<CaseReport[]>(() => getPrivateCases(currentUser?.id || ''));
    
    // Filters
    const [selRegion, setSelRegion] = useState(companyProfile?.localization.region || '');
    const [searchTerm, setSearchTerm] = useState('');
    const [selProblem, setSelProblem] = useState('Tutti');

    // Modals
    const [modal, setModal] = useState<{ type: 'view' | 'confirm_delete', data?: CaseReport } | null>(null);

    // Computed
    const territoryPatterns = useMemo(() => getTerritoryPatterns(selRegion), [publicCases, selRegion]);
    
    const filteredPublic = useMemo(() => {
        return publicCases.filter(c => {
            const mReg = !selRegion || c.territory.region === selRegion;
            const mProb = selProblem === 'Tutti' || c.problem === selProblem;
            const mSearch = !searchTerm || c.problem.toLowerCase().includes(searchTerm.toLowerCase()) || c.target.toLowerCase().includes(searchTerm.toLowerCase());
            return mReg && mProb && mSearch && c.quality.moderationStatus === 'approved';
        });
    }, [publicCases, selRegion, selProblem, searchTerm]);

    const problemsList = useMemo(() => Array.from(new Set(publicCases.map(c => c.problem))), [publicCases]);

    // --- HANDLERS ---
    const handleNewManualCase = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        // Fixed: Property 'province' and 'city' do not exist on type 'GeoLocation'. Updated to use correct interface properties.
        const quality = calculateQuality({
            problem: f.get('problem') as string,
            outcome: f.get('outcome') as any,
            territory: { 
                regionCode: selRegion, 
                regionName: selRegion, 
                provinceCode: '', 
                provinceName: '', 
                communeCode: f.get('city') as string, 
                communeName: f.get('city') as string 
            }
        });

        // Fixed: Updated territory object to satisfy GeoLocation interface requirements.
        const newReport: CaseReport = {
            id: `case-${Date.now()}`,
            ownerId: currentUser?.id || 'guest',
            timestamp: new Date().toISOString(),
            territory: {
                regionCode: selRegion,
                regionName: selRegion,
                provinceCode: f.get('province') as string,
                provinceName: f.get('province') as string,
                communeCode: f.get('city') as string,
                communeName: f.get('city') as string,
                region: selRegion
            },
            unitType: f.get('unitType') as AssetType,
            target: f.get('target') as string,
            problem: f.get('problem') as string,
            intervention: f.get('intervention') as string,
            productUsed: f.get('product') as string,
            outcome: f.get('outcome') as OutcomeLevel,
            daysToResult: Number(f.get('days')),
            source: 'manuale',
            privacy: {
                consent: f.get('consent') === 'on',
                level: 'nazionale'
            },
            quality: {
                ...quality,
                moderationStatus: 'approved' // Auto-approve per demo manuale
            }
        };

        saveCase(newReport);
        setMyCases([newReport, ...myCases]);
        if (newReport.privacy.consent) setPublicCases(getPublicCases());
        setActiveTab('my_history');
        alert("Caso salvato correttamente!");
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-text-primary flex items-center gap-3 uppercase tracking-tighter">
                        <DatabaseZap className="text-primary" size={36} /> Memoria Collettiva <span className="text-sm bg-blue-600 text-white px-2 py-0.5 rounded italic font-normal tracking-normal uppercase">V2 PRO</span>
                    </h1>
                    <p className="text-text-secondary text-sm font-medium">Analisi incrociata delle esperienze reali sul territorio.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setActiveTab('share')} className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all">
                        <PlusCircle size={18}/> Condividi Esperienza
                    </button>
                </div>
            </div>

            {/* TABS */}
            <div className="flex p-1 bg-gray-100 rounded-[24px] w-fit shadow-inner">
                {[
                    { id: 'explore', label: 'Esplora Territorio', icon: MapPin },
                    { id: 'share', label: 'Nuovo Caso', icon: PlusCircle },
                    { id: 'my_history', label: 'Mia Memoria', icon: ShieldCheck },
                    ...(currentUser?.role === Role.ADMIN ? [{ id: 'admin', label: 'Moderazione', icon: ShieldAlert }] : [])
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

            {/* CONTENT EXPLORE */}
            {activeTab === 'explore' && (
                <div className="space-y-8">
                    {/* SEARCH & FILTERS */}
                    <div className="bg-white p-6 rounded-[32px] shadow-xl border border-gray-100 flex flex-wrap gap-4 items-end">
                        <div className="flex-1 min-w-[200px]">
                            <label className="text-[10px] font-black uppercase text-text-secondary ml-1 mb-1 block">Regione di interesse</label>
                            <select className="w-full p-3 bg-gray-50 border-none rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-primary" value={selRegion} onChange={e=>setSelRegion(e.target.value)}>
                                {regions.map(r => <option key={r.code} value={r.name}>{r.name}</option>)}
                            </select>
                        </div>
                        <div className="w-full md:w-64 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18}/>
                            <input 
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Cerca problema o coltura..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* TOP PATTERNS (AI Aggregation) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {territoryPatterns.slice(0, 3).map(pattern => (
                            <div key={pattern.id} className="bg-gradient-to-br from-indigo-600 to-blue-800 text-white rounded-[32px] p-6 shadow-xl relative overflow-hidden group">
                                <TrendingUp className="absolute -top-2 -right-2 w-20 h-20 text-white/10 group-hover:scale-110 transition-transform" />
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Trend {selRegion}</p>
                                <h4 className="text-xl font-black mb-1">{pattern.problem}</h4>
                                <p className="text-xs opacity-80 mb-6">Soluzione: <span className="font-bold">{pattern.topSolution}</span></p>
                                
                                <div className="flex justify-between items-end border-t border-white/20 pt-4">
                                    <div>
                                        <p className="text-2xl font-black text-primary">{pattern.successRate}%</p>
                                        <p className="text-[8px] font-black uppercase opacity-60">Efficacia Media</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold">{pattern.casesCount}</p>
                                        <p className="text-[8px] font-black uppercase opacity-60">Casi Registrati</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* FEED DEI CASI */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {filteredPublic.map(report => (
                            <div key={report.id} className="bg-white rounded-[40px] p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all group flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-xl">👤</div>
                                            <div>
                                                <p className="text-xs font-black uppercase text-text-primary tracking-tighter">Utente Anonimo</p>
                                                {/* Fixed: Property 'city' does not exist on type 'GeoLocation'. Changed to 'communeName'. */}
                                                <p className="text-[10px] font-bold text-text-secondary uppercase">{new Date(report.timestamp).toLocaleDateString()} • {report.territory.communeName}</p>
                                            </div>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                                            report.outcome === 'risolto' ? 'bg-green-100 text-green-700' :
                                            report.outcome === 'parziale' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                            Esito: {report.outcome}
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-black text-text-primary mb-4 leading-tight">{report.problem} su {report.target}</h3>
                                    <p className="text-sm text-text-secondary leading-relaxed mb-6 bg-gray-50 p-4 rounded-2xl border border-gray-100 font-medium">"{report.intervention}"</p>
                                    
                                    <div className="flex flex-wrap gap-2 mb-8">
                                        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-black uppercase flex items-center gap-1"><Tag size={10}/> {report.unitType}</span>
                                        {report.productUsed && <span className="px-3 py-1 bg-primary/5 text-primary rounded-lg text-[10px] font-black uppercase flex items-center gap-1"><Zap size={10}/> {report.productUsed}</span>}
                                        <span className="px-3 py-1 bg-gray-100 text-text-secondary rounded-lg text-[10px] font-black uppercase flex items-center gap-1"><Clock size={10}/> {report.daysToResult} gg per esito</span>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-6 border-t border-gray-50">
                                    <button className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2">
                                        Dettaglio Tecnico <ArrowRight size={14}/>
                                    </button>
                                    <button onClick={() => alert('Salvato!')} className="p-4 bg-gray-100 text-text-secondary rounded-2xl hover:bg-primary/10 hover:text-primary transition-all">
                                        <Save size={20}/>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* CONTENT: SHARE */}
            {activeTab === 'share' && (
                <div className="max-w-3xl mx-auto bg-white rounded-[48px] shadow-2xl p-10 border border-gray-50 animate-in zoom-in duration-300">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tighter">Condividi la tua Esperienza</h2>
                            <p className="text-sm text-text-secondary font-medium mt-1">Contribuisci alla memoria collettiva del territorio.</p>
                        </div>
                        <div className="p-4 bg-primary/10 rounded-full text-primary"><DatabaseZap size={32}/></div>
                    </div>

                    <form onSubmit={handleNewManualCase} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Coltura / Animale*</label>
                                <input name="target" required className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold" placeholder="Es. Pomodoro Ciliegino"/>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Avversità / Problema*</label>
                                <input name="problem" required className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold" placeholder="Es. Peronospora"/>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Comune*</label>
                                <input name="city" required className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold" placeholder="Es. Altamura"/>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Esito*</label>
                                <select name="outcome" required className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold">
                                    <option value="risolto">Risolto (Successo)</option>
                                    <option value="parziale">Migliorato (Parziale)</option>
                                    <option value="fallito">Fallito (Nessun effetto)</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Intervento Eseguito*</label>
                            <textarea name="intervention" required rows={3} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold text-sm" placeholder="Descrivi cosa hai fatto e perché..."/>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-gray-50 rounded-[32px] border border-gray-100">
                             <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-text-secondary ml-1">Prodotto (Opz.)</label>
                                <input name="product" className="w-full p-3 bg-white border-none rounded-xl font-bold text-xs" placeholder="Es. Cuprofix 30"/>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-text-secondary ml-1">Giorni per esito</label>
                                <input name="days" type="number" className="w-full p-3 bg-white border-none rounded-xl font-bold text-xs" placeholder="0"/>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-text-secondary ml-1">Tipo Unità</label>
                                <select name="unitType" className="w-full p-3 bg-white border-none rounded-xl font-bold text-xs">
                                    {Object.values(AssetType).map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="bg-blue-50 p-6 rounded-[32px] border border-blue-100 flex items-start gap-4">
                            <ShieldCheck className="text-blue-600 shrink-0" size={24}/>
                            <div className="flex-1">
                                <h4 className="text-xs font-black uppercase text-blue-900 tracking-tight">Impostazioni Privacy</h4>
                                <p className="text-[11px] text-blue-800 font-medium mb-3">Il tuo nome e quello dell'azienda verranno RIMOSSI. Solo il territorio e i dati tecnici saranno visibili.</p>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input name="consent" type="checkbox" defaultChecked className="w-5 h-5 accent-blue-600 rounded-lg"/>
                                    <span className="text-xs font-black text-blue-900">Consento la condivisione anonima</span>
                                </label>
                            </div>
                        </div>

                        <button type="submit" className="w-full py-5 bg-primary text-white rounded-[24px] font-black uppercase tracking-widest text-xs shadow-xl hover:bg-primary-dark transition-all">Pubblica Caso</button>
                    </form>
                </div>
            )}

            {/* CONTENT: MY HISTORY */}
            {activeTab === 'my_history' && (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-[32px] shadow-xl border border-gray-50 flex items-center gap-4">
                        <ShieldCheck className="text-primary" size={24}/>
                        <p className="text-sm font-bold text-text-primary">Stai visualizzando il tuo archivio privato di esperienze aziendali.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {myCases.map(caseItem => (
                            <div key={caseItem.id} className="bg-white rounded-[32px] p-6 shadow-lg border border-gray-100 relative group">
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                        caseItem.privacy.consent ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                    }`}>
                                        {caseItem.privacy.consent ? 'Pubblicato' : 'Privato'}
                                    </span>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-1.5 hover:bg-gray-100 rounded-lg text-blue-600"><Edit size={14}/></button>
                                        <button onClick={() => setMyCases(myCases.filter(c=>c.id!==caseItem.id))} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500"><Trash2 size={14}/></button>
                                    </div>
                                </div>
                                <h4 className="font-black text-lg text-text-primary leading-tight mb-2">{caseItem.problem}</h4>
                                <p className="text-[10px] font-bold text-text-secondary uppercase mb-4">{caseItem.target} • {new Date(caseItem.timestamp).toLocaleDateString()}</p>
                                <p className="text-xs text-text-secondary line-clamp-2 italic mb-6">"{caseItem.intervention}"</p>
                                <div className="flex items-center justify-between text-[9px] font-black uppercase">
                                    <span className="text-primary flex items-center gap-1"><CheckCircle size={10}/> {caseItem.outcome}</span>
                                    <span className="text-text-secondary">{caseItem.source}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CollectiveMemoryV2Page;
