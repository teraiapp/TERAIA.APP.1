
import React, { useState, useEffect, useMemo } from 'react';
import { 
    Radar, ShieldAlert, Zap, TrendingUp, TrendingDown, 
    Minus, ArrowRight, RefreshCw, Sparkles, AlertTriangle, 
    CheckCircle, Info, Database, LayoutGrid, ChevronRight,
    MapPin, Calendar, HeartPulse, Wheat, Waves, Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../hooks/useAppContext';
import { aiPredictiveService } from '../../services/aiPredictiveService';
import { AiPredictiveResult, AiPredictiveAlert, AiPredictiveTrend } from '../../types';

const AiPredictivePage: React.FC = () => {
    const navigate = useNavigate();
    const { companyProfile } = useAppContext();
    const [activeTab, setActiveTab] = useState<'overview' | 'units' | 'history'>('overview');
    const [digest, setDigest] = useState<AiPredictiveResult | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedUnitId, setSelectedUnitId] = useState<string>('all');

    const units = useMemo(() => JSON.parse(localStorage.getItem('teraia_production_units_v2') || '[]'), []);

    useEffect(() => {
        const d = aiPredictiveService.getDigest();
        if (!d) handleUpdate();
        else setDigest(d);
    }, []);

    const handleUpdate = () => {
        setIsRefreshing(true);
        setTimeout(() => {
            const newDigest = aiPredictiveService.updateAnalysis();
            setDigest(newDigest);
            setIsRefreshing(false);
        }, 1500);
    };

    const getTrendIcon = (direction: string) => {
        if (direction === 'up') return <TrendingUp className="text-red-500" size={16}/>;
        if (direction === 'down') return <TrendingDown className="text-green-500" size={16}/>;
        return <Minus className="text-gray-400" size={16}/>;
    };

    const filteredAlerts = useMemo(() => {
        if (!digest) return [];
        if (selectedUnitId === 'all') return digest.alerts;
        return digest.alerts.filter(a => a.relatedUnits?.includes(selectedUnitId));
    }, [digest, selectedUnitId]);

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-500">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-text-primary flex items-center gap-3 uppercase tracking-tighter">
                        <Radar className="text-primary" size={36} /> Intelligence Predittiva
                    </h1>
                    <p className="text-text-secondary text-sm font-medium">Analisi incrociata tra Quaderno di Campagna, Meteo e Biologia.</p>
                </div>
                <button 
                    onClick={handleUpdate}
                    disabled={isRefreshing}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-primary-dark transition-all"
                >
                    {isRefreshing ? <RefreshCw className="animate-spin" size={18}/> : <Zap size={18}/>}
                    {isRefreshing ? 'Aggiornamento...' : 'Aggiorna Analisi'}
                </button>
            </div>

            {/* TABS */}
            <div className="flex p-1 bg-gray-100 rounded-[24px] w-fit shadow-inner">
                <button onClick={() => setActiveTab('overview')} className={`px-8 py-3 rounded-[20px] font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'overview' ? 'bg-white text-primary shadow-md' : 'text-text-secondary'}`}>Panoramica</button>
                <button onClick={() => setActiveTab('units')} className={`px-8 py-3 rounded-[20px] font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'units' ? 'bg-white text-primary shadow-md' : 'text-text-secondary'}`}>Per Unità</button>
                <button onClick={() => setActiveTab('history')} className={`px-8 py-3 rounded-[20px] font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-white text-primary shadow-md' : 'text-text-secondary'}`}>Storico Modelli</button>
            </div>

            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* COLONNA ALERT EARLY WARNING */}
                    <div className="lg:col-span-7 space-y-6">
                        <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2 px-1">
                            <ShieldAlert size={24} className="text-red-500"/> Early-Warning Rischi
                        </h2>
                        
                        {digest?.alerts.length === 0 && (
                            <div className="bg-white rounded-[40px] p-10 text-center border-2 border-dashed border-gray-100 flex flex-col items-center">
                                <CheckCircle size={48} className="text-green-500 mb-4"/>
                                <h3 className="text-lg font-black uppercase">Sistema Stabile</h3>
                                <p className="text-text-secondary text-sm font-medium">Non ci sono anomalie nello storico quaderno degli ultimi 30 giorni.</p>
                            </div>
                        )}

                        {digest?.alerts.map(alert => (
                            <div key={alert.id} className="bg-white rounded-[40px] p-8 shadow-xl border border-gray-100 flex flex-col md:flex-row justify-between gap-8 group hover:border-primary transition-all">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                            alert.severity === 'high' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                                        }`}>Severità {alert.severity}</span>
                                        <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">{alert.domain}</span>
                                    </div>
                                    <h3 className="text-2xl font-black text-text-primary uppercase tracking-tighter leading-tight mb-4">{alert.title}</h3>
                                    <p className="text-sm text-text-secondary mb-6 font-medium italic">"{alert.description}"</p>
                                    
                                    <div className="space-y-2">
                                        {alert.why.map((reason, i) => (
                                            <div key={i} className="flex items-center gap-2 text-xs font-bold text-text-primary/70">
                                                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div> {reason}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="md:w-48 shrink-0 flex flex-col justify-center gap-2">
                                    {alert.recommendedActions.map((action, i) => (
                                        <button 
                                            key={i}
                                            onClick={() => navigate(action.route)}
                                            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2"
                                        >
                                            {action.label} <ArrowRight size={14}/>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* COLONNA TREND & INSIGHTS */}
                    <div className="lg:col-span-5 space-y-8">
                        <div className="bg-white rounded-[40px] p-8 shadow-xl border border-gray-100">
                            <h3 className="text-xl font-black uppercase tracking-tighter mb-6 flex items-center gap-3">
                                <TrendingUp className="text-primary"/> Trend Operativi
                            </h3>
                            <div className="space-y-4">
                                {digest?.trends.map(trend => (
                                    <div key={trend.id} className="p-5 bg-gray-50 rounded-[24px] border border-gray-100 flex items-center gap-4">
                                        <div className="p-3 bg-white rounded-2xl shadow-sm">
                                            {getTrendIcon(trend.direction)}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-text-secondary uppercase">{trend.metric.replace('_', ' ')}</p>
                                            <p className="text-xs font-bold text-text-primary leading-tight">{trend.explanation}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-indigo-600 to-blue-800 rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden">
                            <Sparkles className="absolute -top-4 -right-4 w-40 h-40 text-white/5" />
                            <h3 className="text-xl font-black uppercase tracking-tighter mb-6">Health Insight</h3>
                            <div className="space-y-6">
                                {digest?.insights.map(ins => (
                                    <div key={ins.id}>
                                        <h4 className="font-black text-sm uppercase mb-2">{ins.title}</h4>
                                        <p className="text-xs opacity-80 leading-relaxed mb-4">{ins.description}</p>
                                        {ins.metrics && (
                                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                                                {Object.entries(ins.metrics).map(([k, v]) => (
                                                    <div key={k}>
                                                        <p className="text-[8px] font-black uppercase opacity-50">{k}</p>
                                                        <p className="text-lg font-black">{v}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 bg-blue-50 rounded-[32px] border border-blue-100">
                             <div className="flex items-center gap-2 text-blue-800 font-black text-xs uppercase mb-2">
                                <Info size={16}/> Governance AI
                            </div>
                            <p className="text-[10px] text-blue-700 leading-relaxed font-medium">
                                L'analisi predittiva si aggiorna automaticamente ogni volta che registri un evento nel Quaderno di Campagna. La confidenza attuale è al <b>{digest?.confidence}%</b>.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'units' && (
                <div className="space-y-8">
                    <div className="bg-white p-6 rounded-[32px] shadow-xl border border-gray-100 flex items-center gap-4">
                        <LayoutGrid className="text-primary" size={24}/>
                        <div className="flex-1">
                            <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Seleziona Unità Produttiva</label>
                            <select 
                                className="w-full bg-transparent font-black text-xl border-none outline-none focus:ring-0 uppercase tracking-tighter"
                                value={selectedUnitId}
                                onChange={e => setSelectedUnitId(e.target.value)}
                            >
                                <option value="all">Tutte le Unità</option>
                                {units.map((u:any) => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {filteredAlerts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredAlerts.map(alert => (
                                <div key={alert.id} className="bg-white rounded-[40px] p-8 shadow-xl border-2 border-transparent hover:border-primary transition-all">
                                    <div className="flex justify-between items-start mb-6">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                            alert.severity === 'high' ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-600'
                                        }`}>Alert {alert.severity}</span>
                                        <Info size={18} className="text-gray-300"/>
                                    </div>
                                    <h3 className="text-xl font-black text-text-primary uppercase tracking-tighter mb-4 leading-none">{alert.title}</h3>
                                    <p className="text-sm text-text-secondary font-medium leading-relaxed mb-10">"{alert.description}"</p>
                                    <button onClick={() => navigate(alert.recommendedActions[0].route)} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest">
                                        {alert.recommendedActions[0].label}
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center bg-gray-50 rounded-[48px] border-2 border-dashed border-gray-200">
                             <CheckCircle size={48} className="text-green-500 mx-auto mb-4"/>
                             <h3 className="text-xl font-black text-gray-400 uppercase">Parametri Regolari</h3>
                             <p className="text-sm text-text-secondary mt-2">Nessun rischio rilevato per questa specifica unità.</p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'history' && (
                <div className="bg-white rounded-[40px] shadow-2xl p-10 border border-gray-100 flex flex-col items-center justify-center text-center">
                    <Database size={64} className="text-gray-200 mb-6"/>
                    <h3 className="text-2xl font-black text-text-primary uppercase tracking-tighter">Archivio Modelli</h3>
                    <p className="text-text-secondary max-w-sm mt-2 font-medium leading-relaxed italic">"Nello storico saranno conservati i digest delle stagioni passate per calcolare il successo dei trattamenti e delle irrigazioni suggerite."</p>
                    <div className="mt-10 px-6 py-2 bg-gray-50 rounded-full text-[10px] font-black uppercase text-text-secondary tracking-widest border">In fase di addestramento dati</div>
                </div>
            )}
        </div>
    );
};

export default AiPredictivePage;
