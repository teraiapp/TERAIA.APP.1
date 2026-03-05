
import React, { useState, useMemo, useEffect } from 'react';
import { 
    History, BarChart3, TrendingUp, TrendingDown, 
    ArrowRight, Info, LayoutGrid, Leaf, Waves, 
    ShieldCheck, Sparkles, Database, Minus,
    PawPrint,
    // Added missing CheckCircle import
    CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../hooks/useAppContext';
import { aiSeasonalLearningService } from '../../services/aiSeasonalLearningService';
import { SeasonComparison } from '../../types';

const AiSeasonalPage: React.FC = () => {
    const navigate = useNavigate();
    const { companyProfile } = useAppContext();
    const [activeTab, setActiveTab] = useState<'overview' | 'units' | 'livestock'>('overview');
    
    const years = useMemo(() => aiSeasonalLearningService.getYearsAvailable(), []);
    const units = useMemo(() => JSON.parse(localStorage.getItem('teraia_production_units_v2') || '[]'), []);
    const [selectedUnitId, setSelectedUnitId] = useState<string>(units[0]?.id || '');

    const unitComparison = useMemo(() => {
        const u = units.find((x:any) => x.id === selectedUnitId);
        if (!u) return null;
        return aiSeasonalLearningService.compareSeasons(u.id, u.name);
    }, [selectedUnitId, units]);

    const livestockAnalysis = useMemo(() => aiSeasonalLearningService.analyzeLivestockSeason(), []);

    const hasLivestock = useMemo(() => units.some((u:any) => u.category === 'Allevamento'), [units]);

    const renderDelta = (val: number) => {
        if (val === 0) return <span className="text-gray-400">0%</span>;
        const color = val > 0 ? 'text-green-600' : 'text-red-600';
        const Icon = val > 0 ? TrendingUp : TrendingDown;
        return (
            <span className={`flex items-center gap-1 font-black ${color}`}>
                <Icon size={14}/> {Math.abs(val).toFixed(1)}%
            </span>
        );
    };

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-500">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-text-primary flex items-center gap-3 uppercase tracking-tighter">
                        <History className="text-primary" size={36} /> Apprendimento Stagionale
                    </h1>
                    <p className="text-text-secondary text-sm font-medium">Correlazioni reali tra input agronomici e resa finale.</p>
                </div>
                <div className="bg-primary/10 text-primary px-4 py-2 rounded-2xl font-black text-xs uppercase flex items-center gap-2">
                    <Database size={16}/> {years.length} Stagioni in Memoria
                </div>
            </div>

            {/* TABS */}
            <div className="flex p-1 bg-gray-100 rounded-[24px] w-fit shadow-inner">
                <button onClick={() => setActiveTab('overview')} className={`px-8 py-3 rounded-[20px] font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'overview' ? 'bg-white text-primary shadow-md' : 'text-text-secondary'}`}>Panoramica</button>
                <button onClick={() => setActiveTab('units')} className={`px-8 py-3 rounded-[20px] font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'units' ? 'bg-white text-primary shadow-md' : 'text-text-secondary'}`}>Per Unità</button>
                {hasLivestock && (
                    <button onClick={() => setActiveTab('livestock')} className={`px-8 py-3 rounded-[20px] font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'livestock' ? 'bg-white text-primary shadow-md' : 'text-text-secondary'}`}>Allevamento</button>
                )}
            </div>

            {years.length < 2 ? (
                <div className="py-24 text-center bg-white rounded-[48px] border-2 border-dashed border-gray-200 flex flex-col items-center">
                    <History size={64} className="text-gray-200 mb-6"/>
                    <h3 className="text-2xl font-black text-gray-400 uppercase tracking-tighter">Dati Insufficienti</h3>
                    <p className="text-text-secondary mt-2 max-w-sm font-medium">L'apprendimento stagionale richiede almeno 2 stagioni di dati nel Quaderno di Campagna per generare correlazioni.</p>
                </div>
            ) : (
                <>
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-8">
                                <div className="bg-white rounded-[40px] p-10 shadow-xl border border-gray-100">
                                    <h3 className="text-xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3">
                                        <Sparkles className="text-primary"/> Insight Aziendale {years[0]} vs {years[1]}
                                    </h3>
                                    <div className="space-y-6">
                                        <p className="text-sm text-text-secondary leading-relaxed font-medium">
                                            Analizzando i dati aggregati, la tua azienda mostra un'efficienza idrica migliorata del 12% con una resa complessiva stabile.
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="p-6 bg-gray-50 rounded-[32px] border border-gray-100">
                                                <p className="text-[10px] font-black text-text-secondary uppercase mb-4 tracking-widest">Successo Strategia Difesa</p>
                                                <div className="flex items-center gap-4">
                                                    <p className="text-3xl font-black text-primary">88%</p>
                                                    <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                                                        <div className="h-full bg-primary" style={{ width: '88%' }}></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-6 bg-gray-50 rounded-[32px] border border-gray-100">
                                                <p className="text-[10px] font-black text-text-secondary uppercase mb-4 tracking-widest">ROI Nutrizione</p>
                                                <p className="text-xl font-black text-text-primary uppercase">+€ 1.200/ha <span className="text-[10px] opacity-40">vs {years[1]}</span></p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-gray-900 rounded-[40px] p-8 text-white shadow-2xl">
                                    <h3 className="text-lg font-black uppercase mb-4">Miglioramento Continuo</h3>
                                    <p className="text-xs opacity-60 leading-relaxed mb-8 font-medium italic">"L'AI stagionale impara dai tuoi successi. Più dati inserisci nel quaderno, più precisi diventano i modelli di resa."</p>
                                    <button onClick={() => navigate('/quaderno-campagna')} className="w-full py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest">Arricchisci Quaderno</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'units' && (
                        <div className="space-y-8">
                            <div className="bg-white p-6 rounded-[32px] shadow-xl border border-gray-100 flex items-center gap-4">
                                <LayoutGrid className="text-primary" size={24}/>
                                <div className="flex-1">
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Seleziona Unità per Analisi ROI</label>
                                    <select 
                                        className="w-full bg-transparent font-black text-xl border-none outline-none focus:ring-0 uppercase tracking-tighter"
                                        value={selectedUnitId}
                                        onChange={e => setSelectedUnitId(e.target.value)}
                                    >
                                        {units.map((u:any) => <option key={u.id} value={u.id}>{u.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            {unitComparison && (
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-bottom-4">
                                    <div className="lg:col-span-8 space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="bg-white p-6 rounded-[32px] shadow-lg border border-gray-50">
                                                <p className="text-[9px] font-black text-text-secondary uppercase mb-2">Delta Resa</p>
                                                {renderDelta(unitComparison.deltas.yieldDeltaPercent)}
                                            </div>
                                            <div className="bg-white p-6 rounded-[32px] shadow-lg border border-gray-100">
                                                <p className="text-[9px] font-black text-text-secondary uppercase mb-2">Delta Acqua</p>
                                                {renderDelta(unitComparison.deltas.irrigationDeltaPercent)}
                                            </div>
                                            <div className="bg-white p-6 rounded-[32px] shadow-lg border border-gray-100">
                                                <p className="text-[9px] font-black text-text-secondary uppercase mb-2">Delta Difesa</p>
                                                {renderDelta(unitComparison.deltas.treatmentsDeltaPercent)}
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-[40px] p-10 shadow-xl border border-gray-100">
                                            <h3 className="text-xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3">
                                                <TrendingUp className="text-primary"/> Correlazioni Rilevate
                                            </h3>
                                            <div className="space-y-6">
                                                {unitComparison.correlations.map((c, i) => (
                                                    <div key={i} className="flex gap-6 items-start p-6 bg-gray-50 rounded-[32px] border border-gray-100">
                                                        <div className={`p-4 rounded-2xl shrink-0 ${
                                                            c.relation === 'positiva' ? 'bg-green-100 text-green-700' : 
                                                            c.relation === 'negativa' ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-600'
                                                        }`}>
                                                            {c.relation === 'positiva' ? <TrendingUp size={24}/> : <Minus size={24}/>}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-black text-lg uppercase tracking-tight mb-1">{c.metric}</h4>
                                                            <p className="text-sm text-text-secondary font-medium leading-relaxed italic">"{c.explanation}"</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="lg:col-span-4 space-y-6">
                                        <div className="bg-gradient-to-br from-indigo-600 to-blue-800 rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden">
                                            <Sparkles className="absolute -top-4 -right-4 w-40 h-40 text-white/5" />
                                            <h3 className="text-xl font-black uppercase tracking-tighter mb-6 relative z-10">Strategia {years[0]}</h3>
                                            <ul className="space-y-4 relative z-10">
                                                {unitComparison.recommendations.map((r, i) => (
                                                    <li key={i} className="flex items-start gap-3 text-sm font-medium opacity-90 leading-tight">
                                                        <CheckCircle size={18} className="text-primary shrink-0"/> {r}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'livestock' && livestockAnalysis && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            <div className="lg:col-span-7 space-y-6">
                                <div className="bg-white rounded-[40px] p-10 shadow-xl border border-gray-100">
                                    <h3 className="text-xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3">
                                        <PawPrint className="text-primary"/> {livestockAnalysis.title}
                                    </h3>
                                    <div className="grid grid-cols-2 gap-8 mb-10">
                                        <div>
                                            <p className="text-[10px] font-black text-text-secondary uppercase mb-2">Stabilità Razione</p>
                                            <p className="text-4xl font-black text-primary">{livestockAnalysis.feedStability}%</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-text-secondary uppercase mb-2">Delta Sanità</p>
                                            <p className={`text-4xl font-black ${livestockAnalysis.healthDelta <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {livestockAnalysis.healthDelta > 0 ? '+' : ''}{livestockAnalysis.healthDelta}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="p-6 bg-blue-50 rounded-[32px] border border-blue-100 italic font-medium text-blue-800">
                                        "{livestockAnalysis.insight}"
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AiSeasonalPage;
