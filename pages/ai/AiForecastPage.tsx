
import React, { useState, useMemo, useEffect } from 'react';
import { 
    Zap, TrendingUp, Droplets, ShieldAlert, Wheat, 
    Milk, History, ArrowRight, LayoutGrid, Info, 
    RefreshCw, CheckCircle, AlertTriangle, Sparkles,
    Calendar, CloudRain, Scale, BrainCircuit
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../hooks/useAppContext';
import { aiForecastService } from '../../services/aiForecastService';
import { AgriForecast, LivestockForecast } from '../../types';

const AiForecastPage: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser } = useAppContext();
    const [horizon, setHorizon] = useState<number>(30);
    const [activeTab, setActiveTab] = useState<'azienda' | 'agricoltura' | 'allevamento'>('azienda');
    const [isRefreshing, setIsRefreshing] = useState(false);

    const units = useMemo(() => aiForecastService.getUnits(), []);
    const agriUnits = units.filter((u:any) => u.category !== 'Allevamento');
    const livestockUnits = units.filter((u:any) => u.category === 'Allevamento');

    const agriForecasts = useMemo(() => 
        agriUnits.map((u:any) => aiForecastService.forecastAgriculture(u, horizon)), 
    [agriUnits, horizon, isRefreshing]);

    const liveForecasts = useMemo(() => 
        livestockUnits.map((u:any) => aiForecastService.forecastLivestock(u, horizon)), 
    [livestockUnits, horizon, isRefreshing]);

    const digest = useMemo(() => aiForecastService.forecastCompanyDigest(horizon), [horizon, isRefreshing]);

    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => setIsRefreshing(false), 1200);
    };

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-500">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-text-primary flex items-center gap-3 uppercase tracking-tighter">
                        <BrainCircuit className="text-primary" size={36} /> Simulazione & Previsione
                    </h1>
                    <p className="text-text-secondary text-sm font-medium">Motore predittivo v1 basato su serie temporali del Quaderno.</p>
                </div>
                <div className="flex bg-gray-100 p-1 rounded-2xl shadow-inner shrink-0">
                    {[7, 14, 30, 60, 90].map(h => (
                        <button 
                            key={h}
                            onClick={() => setHorizon(h)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${horizon === h ? 'bg-white text-primary shadow-sm' : 'text-text-secondary'}`}
                        >
                            {h} gg
                        </button>
                    ))}
                </div>
            </div>

            {/* TABS */}
            <div className="flex p-1 bg-gray-100 rounded-[24px] w-fit shadow-inner">
                <button onClick={() => setActiveTab('azienda')} className={`px-8 py-3 rounded-[20px] font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'azienda' ? 'bg-white text-primary shadow-md' : 'text-text-secondary'}`}>Azienda</button>
                <button onClick={() => setActiveTab('agricoltura')} className={`px-8 py-3 rounded-[20px] font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'agricoltura' ? 'bg-white text-primary shadow-md' : 'text-text-secondary'}`}>Agricoltura</button>
                {livestockUnits.length > 0 && (
                    <button onClick={() => setActiveTab('allevamento')} className={`px-8 py-3 rounded-[20px] font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'allevamento' ? 'bg-white text-primary shadow-md' : 'text-text-secondary'}`}>Allevamento</button>
                )}
            </div>

            {/* CONTENT AZIENDA */}
            {activeTab === 'azienda' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 space-y-8">
                        <div className="bg-white rounded-[48px] p-10 shadow-xl border border-gray-50 relative overflow-hidden">
                            <Sparkles className="absolute -top-10 -right-10 w-64 h-64 text-primary/5" />
                            <h2 className="text-xl font-black uppercase tracking-tight mb-8">Executive Summary ({horizon}gg)</h2>
                            <p className="text-lg text-text-secondary leading-relaxed font-medium mb-10 italic">
                                "Sulla base dei dati storici, l'azienda si avvia verso un periodo di <b>{horizon === 30 ? 'picco produttivo' : 'stabilità'}</b>. Attenzione ai rischi malattie segnalati per le colture in fase vegetativa."
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="p-6 bg-gray-50 rounded-[32px] border border-gray-100">
                                    <p className="text-[10px] font-black text-text-secondary uppercase mb-2">Confidenza Media</p>
                                    <p className="text-3xl font-black text-primary">{digest.globalAgriConfidence}%</p>
                                </div>
                                <div className="p-6 bg-gray-50 rounded-[32px] border border-gray-100">
                                    <p className="text-[10px] font-black text-text-secondary uppercase mb-2">Unità Monitorate</p>
                                    <p className="text-3xl font-black text-text-primary">{digest.totalUnits}</p>
                                </div>
                                <div className="p-6 bg-red-50 rounded-[32px] border border-red-100">
                                    <p className="text-[10px] font-black text-red-700 uppercase mb-2">Rischi Critici</p>
                                    <p className="text-3xl font-black text-red-600">{digest.topRisks.length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-900 text-white rounded-[40px] p-10 shadow-2xl">
                            <h3 className="text-xl font-black uppercase mb-8 flex items-center gap-3"><Zap className="text-primary"/> Proiezioni Risorse Totali</h3>
                            <div className="space-y-6">
                                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                                    <span>Volume Acqua Stimato</span>
                                    <span className="text-xl font-black text-primary">~ {agriForecasts.reduce((a,c)=>a+(c.predictedWaterLiters||0),0).toLocaleString()} L</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                                    <span>Fabbisogno Mangime</span>
                                    <span className="text-xl font-black text-primary">~ {liveForecasts.reduce((a,c)=>a+(c.predictedFeedQty||0),0).toLocaleString()} Kg</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Resa Totale Attesa (Kg)</span>
                                    <span className="text-xl font-black text-primary">~ {agriForecasts.reduce((a,c)=>a+(c.predictedYieldKg||0),0).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-4 space-y-6">
                        <div className="p-8 bg-blue-50 rounded-[40px] border border-blue-100">
                             <h4 className="text-xs font-black text-blue-900 uppercase mb-4">Metodologia v1</h4>
                             <p className="text-xs text-blue-800 leading-relaxed font-medium">Le proiezioni utilizzano algoritmi a media mobile sugli ultimi 90 giorni di quaderno. I risultati sono puramente statistici e non considerano variazioni climatiche eccezionali.</p>
                        </div>
                        <button onClick={handleRefresh} className="w-full py-5 bg-white border-2 border-gray-100 rounded-3xl font-black text-xs uppercase tracking-widest shadow-sm hover:bg-gray-50 flex items-center justify-center gap-2">
                            {isRefreshing ? <RefreshCw className="animate-spin"/> : <RefreshCw/>} Ricarica Modelli
                        </button>
                    </div>
                </div>
            )}

            {/* TAB AGRICOLTURA */}
            {activeTab === 'agricoltura' && (
                <div className="space-y-6">
                    {agriForecasts.map(f => (
                        <div key={f.unitId} className="bg-white rounded-[40px] p-8 shadow-xl border border-gray-100 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start hover:border-primary transition-all group">
                            <div className="lg:col-span-4 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-primary/10 text-primary rounded-2xl group-hover:scale-110 transition-transform"><Wheat size={24}/></div>
                                    <h3 className="text-2xl font-black uppercase tracking-tighter">{f.unitName}</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${f.diseaseRisk === 'high' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>Rischio Malattie: {f.diseaseRisk}</span>
                                    <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Confidence {f.confidence}%</span>
                                </div>
                                <div className="pt-4 space-y-2">
                                    {f.why.map((w,i) => (
                                        <div key={i} className="flex items-start gap-2 text-[11px] text-text-secondary font-medium">
                                            <div className="w-1.5 h-1.5 bg-gray-300 rounded-full mt-1 shrink-0"></div> {w}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="lg:col-span-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-6 bg-gray-50 rounded-[32px] border border-gray-100">
                                    <p className="text-[9px] font-black text-text-secondary uppercase mb-2">Resa Attesa ({horizon}gg)</p>
                                    {f.predictedYieldKg ? (
                                        <>
                                            <p className="text-2xl font-black text-text-primary">{f.predictedYieldKg.toLocaleString()} kg</p>
                                            <p className="text-[10px] text-text-secondary font-bold">Range: {f.predictedYieldRangeKg?.[0]}-{f.predictedYieldRangeKg?.[1]} kg</p>
                                        </>
                                    ) : (
                                        <p className="text-xs text-orange-600 font-bold italic">Dati raccolta mancanti</p>
                                    )}
                                </div>
                                <div className="p-6 bg-gray-50 rounded-[32px] border border-gray-100">
                                    <p className="text-[9px] font-black text-text-secondary uppercase mb-2">Fabbisogno Idrico</p>
                                    <p className="text-2xl font-black text-blue-600">{f.predictedIrrigationEvents} eventi</p>
                                    <p className="text-[10px] text-text-secondary font-bold">~ {f.predictedWaterLiters?.toLocaleString() || 0} Litri</p>
                                </div>
                            </div>

                            <div className="lg:col-span-3 space-y-2">
                                <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-2 ml-1">Azioni Consigliate</p>
                                {f.recommendations.map((r,i) => (
                                    <button 
                                        key={i}
                                        onClick={() => navigate(r.route)}
                                        className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-md hover:bg-black transition-all flex items-center justify-center gap-2"
                                    >
                                        {r.label} <ArrowRight size={14}/>
                                    </button>
                                ))}
                                {f.recommendations.length === 0 && (
                                    <div className="p-4 border-2 border-dashed border-gray-200 rounded-2xl text-center text-[10px] font-black text-gray-400 uppercase">Nessuna azione prioritaria</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* TAB ALLEVAMENTO */}
            {activeTab === 'allevamento' && (
                <div className="space-y-6">
                    {liveForecasts.map(f => (
                        <div key={f.unitId} className="bg-white rounded-[40px] p-8 shadow-xl border border-gray-100 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start group">
                            <div className="lg:col-span-4 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:rotate-6 transition-transform"><Milk size={24}/></div>
                                    <h3 className="text-2xl font-black uppercase tracking-tighter">{f.unitName}</h3>
                                </div>
                                <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase w-fit ${f.healthRisk === 'low' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>Rischio Sanitario: {f.healthRisk}</div>
                                <div className="space-y-2">
                                    {f.why.map((w,i) => (
                                        <div key={i} className="text-xs text-text-secondary font-medium">• {w}</div>
                                    ))}
                                </div>
                            </div>

                            <div className="lg:col-span-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-6 bg-gray-50 rounded-[32px] border border-gray-100">
                                    <p className="text-[9px] font-black text-text-secondary uppercase mb-2">Consumo Mangime ({horizon}gg)</p>
                                    <p className="text-2xl font-black text-text-primary">{f.predictedFeedQty?.toLocaleString() || '-'} kg</p>
                                    {f.missingDataHints.map((h,i)=><p key={i} className="text-[9px] text-orange-600 font-bold mt-1 uppercase leading-tight">{h}</p>)}
                                </div>
                                <div className="p-6 bg-gray-50 rounded-[32px] border border-gray-100">
                                    <p className="text-[9px] font-black text-text-secondary uppercase mb-2">Produzione Attesa</p>
                                    <p className="text-2xl font-black text-blue-600">{f.predictedProduction.milkLiters?.toLocaleString() || '-'} L</p>
                                    <p className="text-[10px] text-text-secondary font-bold uppercase">Latte stimato</p>
                                </div>
                            </div>

                            <div className="lg:col-span-3 space-y-3">
                                <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest ml-1">Protocollo AI</p>
                                {f.recommendations.map((r,i) => (
                                    <button 
                                        key={i}
                                        onClick={() => navigate(r.route)}
                                        className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-md hover:bg-black transition-all flex items-center justify-center gap-2"
                                    >
                                        {r.label} <ArrowRight size={14}/>
                                    </button>
                                ))}
                                <button onClick={() => navigate('/allevamento')} className="w-full py-2 text-[9px] font-black text-primary uppercase text-center hover:underline">Vedi Registro Stalla</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AiForecastPage;
