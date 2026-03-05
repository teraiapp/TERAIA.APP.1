
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Radar, ShieldAlert, Zap, Thermometer, Droplets, 
    Calendar, CheckCircle, Info, ArrowRight, EyeOff,
    TrendingUp, LayoutGrid, Search, RefreshCw, Sparkles,
    AlertTriangle, DatabaseZap, BookOpen, X, Archive, 
    Check, Copy, Link as LinkIcon, Plus, SearchCode
} from 'lucide-react';
import { useAppContext } from '../../hooks/useAppContext';
import { AiRiskAlert, INITIAL_RISK_ALERTS, RiskLevel, RiskCategory } from '../../data/aiRiskData';

const STORAGE_KEY = 'teraia_ai_risks_v1';

const PredictiveRiskPage: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser, companyProfile } = useAppContext();
    
    // 1. Caricamento e persistenza
    const [alerts, setAlerts] = useState<AiRiskAlert[]>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : INITIAL_RISK_ALERTS;
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
    }, [alerts]);

    // 2. Filtri e Modali
    const [modal, setModal] = useState<{ type: 'draft' | 'link', alert?: AiRiskAlert } | null>(null);
    const activeAlerts = useMemo(() => alerts.filter(a => a.status !== 'archiviato'), [alerts]);
    const archivedAlerts = useMemo(() => alerts.filter(a => a.status === 'archiviato'), [alerts]);

    // 3. Handlers
    const handleMarkRead = (id: string) => {
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'letto' } : a));
    };

    const handleArchive = (id: string) => {
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'archiviato' } : a));
    };

    const handleOpenCatalogForRisk = (alert: AiRiskAlert) => {
        const params = new URLSearchParams({
            regione: companyProfile?.localization.region || '',
            coltura: alert.linkedUnitName.toLowerCase().includes('vigneto') ? 'Vite' : 
                     alert.linkedUnitName.toLowerCase().includes('ulivo') ? 'Ulivo' : 'Vite',
            avversita: alert.category === 'fitopatie' ? alert.title.split(' ').pop() || '' : ''
        });
        navigate(`/catalogo-fitosanitari?${params.toString()}`);
    };

    const handleSimulate = () => {
        const categories: RiskCategory[] = ['fitopatie', 'meteo', 'legale', 'sicurezza'];
        const levels: RiskLevel[] = ['basso', 'medio', 'alto', 'critico'];
        const newAlert: AiRiskAlert = {
            id: `sim-${Date.now()}`,
            title: `Allerta Simulata: ${categories[Math.floor(Math.random()*categories.length)]}`,
            category: categories[Math.floor(Math.random()*categories.length)],
            level: levels[Math.floor(Math.random()*levels.length)],
            confidence: 70 + Math.floor(Math.random()*25),
            linkedUnitId: 'unit-1',
            linkedUnitName: 'Area Test',
            date: new Date().toISOString(),
            description: 'Avviso generato dal sistema di test TeraIA per validare la UI.',
            why: 'Simulazione manuale utente.',
            sources: ['Sistema TeraIA Test'],
            status: 'nuovo',
            actions: [{ id: 's1', label: 'Verifica sistema', completed: false }]
        };
        setAlerts([newAlert, ...alerts]);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("Bozza copiata negli appunti!");
        setModal(null);
    };

    const getLevelColor = (level: RiskLevel) => {
        switch(level) {
            case 'critico': return 'bg-red-600 text-white';
            case 'alto': return 'bg-orange-500 text-white';
            case 'medio': return 'bg-yellow-400 text-text-primary';
            default: return 'bg-blue-400 text-white';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-text-primary flex items-center gap-3 uppercase tracking-tighter">
                        <Radar className="text-primary" size={36} /> AI Predittiva & Rischi
                    </h1>
                    <p className="text-text-secondary text-sm font-medium">Analisi proattiva del rischio agricolo basata su modelli multispettrali.</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={handleSimulate}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-gray-100 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all"
                    >
                        <Plus size={16}/> Simula Avviso
                    </button>
                    <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-xl border border-primary/20">
                        <CheckCircle size={14} className="text-primary"/>
                        <span className="text-xs font-black text-primary uppercase">Sistema Attivo</span>
                    </div>
                </div>
            </div>

            {/* MAIN GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* COLONNA AVVISI ATTIVI */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center px-1">
                        <h2 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                            <AlertTriangle size={20} className="text-orange-500"/> Early Warning Attivi
                        </h2>
                        <span className="text-[10px] font-black bg-gray-900 text-white px-2 py-0.5 rounded-full">{activeAlerts.length}</span>
                    </div>

                    {activeAlerts.length > 0 ? (
                        <div className="space-y-4">
                            {activeAlerts.map(alert => (
                                <div key={alert.id} className={`bg-white rounded-[32px] p-6 shadow-xl border-l-[12px] flex flex-col md:flex-row justify-between gap-6 hover:shadow-2xl transition-all ${alert.status === 'nuovo' ? 'border-primary' : 'border-gray-200'}`}>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${getLevelColor(alert.level)}`}>
                                                Rischio {alert.level}
                                            </span>
                                            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                                                {alert.category} • Confidenza {alert.confidence}%
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-black text-text-primary mb-2 leading-tight">{alert.title}</h3>
                                        <p className="text-sm text-text-secondary line-clamp-2 mb-4 font-medium italic">"{alert.description}"</p>
                                        
                                        <div className="flex flex-wrap items-center gap-4 text-[10px] font-black text-primary uppercase">
                                            <span className="flex items-center gap-1"><LayoutGrid size={12}/> {alert.linkedUnitName}</span>
                                            <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(alert.date).toLocaleDateString()}</span>
                                            {alert.category === 'fitopatie' && (
                                                <button 
                                                    onClick={() => handleOpenCatalogForRisk(alert)}
                                                    className="flex items-center gap-1 text-orange-600 hover:underline"
                                                >
                                                    <SearchCode size={12}/> Vedi Prodotti Consentiti
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-row md:flex-col gap-2 shrink-0 md:w-48 justify-end">
                                        <button 
                                            onClick={() => navigate(`/ai-rischi/${alert.id}`)}
                                            className="flex-1 py-3 bg-gray-900 text-white text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2"
                                        >
                                            Dettagli <ArrowRight size={14}/>
                                        </button>
                                        <div className="flex gap-2">
                                            {alert.status === 'nuovo' && (
                                                <button 
                                                    onClick={() => handleMarkRead(alert.id)}
                                                    className="p-3 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition-all flex-1 flex justify-center"
                                                    title="Segna come letto"
                                                >
                                                    <Check size={18}/>
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => handleArchive(alert.id)}
                                                className="p-3 bg-gray-50 text-text-secondary rounded-xl hover:bg-orange-50 hover:text-orange-600 transition-all flex-1 flex justify-center"
                                                title="Archivia"
                                            >
                                                <Archive size={18}/>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-[40px] p-20 text-center border-2 border-dashed border-gray-200 flex flex-col items-center">
                            <Sparkles size={64} className="text-gray-200 mb-6"/>
                            <h3 className="text-xl font-black uppercase text-gray-400">Nessun Rischio Rilevato</h3>
                            <p className="text-text-secondary text-sm mt-2 font-medium">L'AI sta monitorando i dati in background. <br/>Tutto appare sotto controllo.</p>
                        </div>
                    )}
                </div>

                {/* COLONNA LATERALE: AZIONI E STORICO */}
                <div className="space-y-8">
                    <div className="bg-gradient-to-br from-indigo-600 to-blue-800 rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden group">
                        <DatabaseZap className="absolute -top-4 -right-4 w-32 h-32 text-white/10 group-hover:scale-110 transition-transform duration-700"/>
                        <h3 className="text-xl font-black mb-4 uppercase tracking-tighter">Azioni Consigliate</h3>
                        <div className="space-y-3 relative z-10">
                            {[
                                { icon: Copy, label: 'Genera Bozza Trattamento', type: 'draft' },
                                { icon: SearchCode, label: 'Cerca Prodotti Catalogo', path: '/catalogo-fitosanitari' },
                                { icon: BookOpen, label: 'Consulta Disciplinari', path: '/catalogo-fitosanitari' },
                            ].map((btn, i) => (
                                <button 
                                    key={i} 
                                    onClick={() => btn.path ? navigate(btn.path) : setModal({ type: btn.type as any, alert: activeAlerts[0] })}
                                    className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border border-white/5"
                                >
                                    <div className="flex items-center gap-3">
                                        <btn.icon size={16} className="text-blue-300"/>
                                        {btn.label}
                                    </div>
                                    <ArrowRight size={14} className="opacity-50"/>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-[32px] p-6 shadow-xl border border-gray-100">
                        <h3 className="text-sm font-black text-text-secondary uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Archive size={16}/> Storico Avvisi
                        </h3>
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                            {archivedAlerts.length > 0 ? archivedAlerts.map(a => (
                                <div key={a.id} className="p-3 bg-gray-50 rounded-2xl flex justify-between items-center group">
                                    <div className="overflow-hidden">
                                        <p className="font-bold text-xs truncate text-text-primary">{a.title}</p>
                                        <p className="text-[9px] font-bold text-text-secondary uppercase">{new Date(a.date).toLocaleDateString()}</p>
                                    </div>
                                    <button 
                                        onClick={() => navigate(`/ai-rischi/${a.id}`)}
                                        className="p-2 bg-white rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <ArrowRight size={14}/>
                                    </button>
                                </div>
                            )) : (
                                <p className="text-center py-6 text-[10px] font-bold text-text-secondary uppercase italic">L'archivio è vuoto</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* MODALS */}
            {modal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[40px] shadow-2xl p-10 w-full max-w-md animate-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-black uppercase tracking-tighter">
                                {modal.type === 'draft' ? 'Generazione Bozza AI' : 'Collegamenti Sistema'}
                            </h3>
                            <button onClick={() => setModal(null)} className="p-2 hover:bg-gray-100 rounded-full"><X/></button>
                        </div>

                        {modal.type === 'draft' ? (
                            <div className="space-y-6">
                                <p className="text-sm text-text-secondary font-medium">Testo ottimizzato per l'invio via WhatsApp o inserimento nel quaderno:</p>
                                <div className="p-5 bg-gray-50 rounded-2xl border-2 border-primary/20 italic text-sm text-text-primary font-bold">
                                    "{modal.alert?.draftText || 'Nessuna bozza specifica per questo avviso.'}"
                                </div>
                                <button 
                                    onClick={() => copyToClipboard(modal.alert?.draftText || '')}
                                    className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase text-xs shadow-xl flex items-center justify-center gap-2"
                                >
                                    <Copy size={18}/> Copia Testo
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { l: 'Catalogo', p: '/catalogo-fitosanitari', i: SearchCode },
                                    { l: 'Produzione', p: '/produzione', i: LayoutGrid },
                                    { l: 'Irrigazione', p: '/irrigazione', i: Droplets },
                                    { l: 'Quaderno', p: '/quaderno', i: BookOpen },
                                ].map((m, i) => (
                                    <button 
                                        key={i} 
                                        onClick={() => navigate(m.p)}
                                        className="p-6 bg-gray-50 rounded-3xl flex flex-col items-center gap-3 hover:bg-primary/10 transition-all group border border-transparent hover:border-primary/20"
                                    >
                                        <m.i className="text-text-secondary group-hover:text-primary" size={32}/>
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

const ThermometerSun: React.FC<{size?: number, className?: string}> = ({size = 24, className}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M20 12h2"/><path d="m19.07 4.93-1.41 1.41"/><path d="M15 9l-6 6"/><path d="M9 9l6 6"/>
    </svg>
);

export default PredictiveRiskPage;
