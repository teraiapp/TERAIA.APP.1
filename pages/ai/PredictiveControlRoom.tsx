
import React, { useState, useMemo, useEffect } from 'react';
import { 
    Radar, ShieldAlert, Zap, Thermometer, Droplets, 
    Calendar, CheckCircle, Info, ArrowRight, EyeOff,
    TrendingUp, LayoutGrid, Search, RefreshCw, Sparkles,
    AlertTriangle, DatabaseZap, BookOpen, Waves, HeartPulse,
    ChevronRight, Settings2, Wind, CloudRain
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../hooks/useAppContext';
import { calculateUnitRisk, generatePredictiveAlerts } from '../../utils/predictiveEngine4D';
import { PredictiveAlert, RiskLevel } from '../../types';

const SeverityBadge: React.FC<{level: RiskLevel}> = ({level}) => {
    const config = {
        critico: 'bg-red-600 text-white shadow-red-200',
        alto: 'bg-orange-500 text-white shadow-orange-200',
        medio: 'bg-yellow-400 text-text-primary shadow-yellow-200',
        basso: 'bg-green-500 text-white shadow-green-200'
    };
    return <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg ${config[level]}`}>{level}</span>;
};

const PredictiveControlRoom: React.FC = () => {
    const navigate = useNavigate();
    const { companyProfile, currentUser } = useAppContext();
    
    const units = useMemo(() => JSON.parse(localStorage.getItem('teraia_production_units_v1') || '[]'), []);
    const [selectedUnitId, setSelectedUnitId] = useState<string>(units[0]?.id || '');
    const [isRefreshing, setIsRefreshing] = useState(false);

    // 1. Dati Predittivi
    const activeUnit = useMemo(() => units.find((u: any) => u.id === selectedUnitId), [units, selectedUnitId]);
    const predictiveData = useMemo(() => {
        if (!activeUnit) return null;
        return calculateUnitRisk(activeUnit, companyProfile?.localization.region || 'Italia');
    }, [activeUnit, companyProfile, isRefreshing]);

    const allAlerts = useMemo(() => generatePredictiveAlerts(units, companyProfile?.localization.region || 'Italia'), [units, companyProfile, isRefreshing]);

    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => setIsRefreshing(false), 1200);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* HEADER CONTROL ROOM */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-text-primary flex items-center gap-3 uppercase tracking-tighter">
                        <Radar className="text-primary animate-pulse" size={36} /> Control Room AI <span className="text-sm bg-gray-900 text-white px-2 py-0.5 rounded italic font-normal tracking-normal uppercase">4D Predictive</span>
                    </h1>
                    <p className="text-text-secondary text-sm font-medium">Previsione integrata: Meteo • Storico • Territorio • Biologia.</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={handleRefresh}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-gray-100 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm"
                    >
                        <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''}/> Ricalcola Modelli
                    </button>
                    <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-xl border border-primary/20">
                        <DatabaseZap size={14} className="text-primary"/>
                        <span className="text-xs font-black text-primary uppercase">Qualità Previsione: {predictiveData?.quality || 0}%</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* COLONNA SINISTRA: SELETTORE E ALERT PRIORITARI */}
                <div className="lg:col-span-4 space-y-8">
                    {/* UNIT LIST */}
                    <div className="bg-white p-6 rounded-[32px] shadow-xl border border-gray-50">
                        <h3 className="text-[10px] font-black uppercase text-text-secondary mb-4 tracking-widest flex items-center gap-2">
                            <LayoutGrid size={14}/> Stato Unità Produttive
                        </h3>
                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                            {units.map((u: any) => (
                                <button 
                                    key={u.id}
                                    onClick={() => setSelectedUnitId(u.id)}
                                    className={`w-full p-4 rounded-2xl text-left border-2 transition-all flex items-center justify-between group ${selectedUnitId === u.id ? 'border-primary bg-primary/5 shadow-md' : 'border-transparent bg-gray-50 hover:bg-gray-100'}`}
                                >
                                    <div>
                                        <p className="font-black text-sm text-text-primary uppercase tracking-tight leading-none mb-1">{u.name}</p>
                                        <p className="text-[10px] font-bold text-text-secondary uppercase">{u.crop_key || u.type}</p>
                                    </div>
                                    <ChevronRight size={16} className={`transition-transform ${selectedUnitId === u.id ? 'text-primary translate-x-1' : 'text-gray-300'}`}/>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* PRIORITY ALERTS PANEL */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-black uppercase tracking-tight flex items-center gap-2 px-1">
                            <ShieldAlert size={18} className="text-orange-500"/> Avvisi Prioritari
                        </h3>
                        {allAlerts.length > 0 ? allAlerts.map(alert => (
                            <div key={alert.id} className="bg-gray-900 rounded-[32px] p-6 shadow-2xl text-white border-l-8 border-orange-500 animate-in slide-in-from-left">
                                <div className="flex justify-between items-start mb-3">
                                    <SeverityBadge level={alert.severity}/>
                                    <span className="text-[8px] font-black uppercase opacity-50 tracking-widest">{new Date(alert.timestamp).toLocaleDateString()}</span>
                                </div>
                                <h4 className="text-lg font-black leading-tight uppercase mb-2">{alert.title}</h4>
                                <p className="text-[11px] opacity-70 leading-relaxed mb-6 italic font-medium">"{alert.description}"</p>
                                <button 
                                    onClick={() => navigate(alert.targetRoute, { state: alert.routeState })}
                                    className="w-full py-3 bg-white text-gray-900 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2 shadow-lg"
                                >
                                    {alert.suggestedAction} <ArrowRight size={14}/>
                                </button>
                            </div>
                        )) : (
                            <div className="p-8 text-center bg-green-50 rounded-[32px] border border-green-100">
                                <CheckCircle size={32} className="text-green-500 mx-auto mb-2"/>
                                <p className="text-xs font-black text-green-800 uppercase">Nessun Rischio Critico</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* COLONNA CENTRALE/DESTRA: ANALISI 4D DETTAGLIATA */}
                <div className="lg:col-span-8 space-y-8">
                    {activeUnit && predictiveData ? (
                        <>
                            {/* GAUGES 4D */}
                            <div className="bg-white rounded-[48px] p-10 shadow-2xl border border-gray-50">
                                <div className="flex justify-between items-end mb-10">
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-text-secondary tracking-widest mb-1">Analisi Dettaglio</p>
                                        <h2 className="text-4xl font-black text-text-primary uppercase tracking-tighter leading-none">{activeUnit.name}</h2>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black uppercase text-text-secondary mb-1">Casi Simili Area</p>
                                        <p className="text-xl font-black text-primary flex items-center gap-1 justify-end"><DatabaseZap size={16}/> {predictiveData.quality > 50 ? '8' : '0'}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    {/* MALATTIE */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center px-1">
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 bg-red-50 text-red-600 rounded-lg"><Zap size={16}/></div>
                                                <span className="text-xs font-black uppercase tracking-tight">Rischio Malattie</span>
                                            </div>
                                            <span className="text-lg font-black text-red-600">{predictiveData.scores.fungi}%</span>
                                        </div>
                                        <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-red-500 transition-all duration-1000" style={{ width: `${predictiveData.scores.fungi}%` }}></div>
                                        </div>
                                        <ul className="space-y-1">
                                            {predictiveData.reasons.fungi.map((r,i) => <li key={i} className="text-[10px] text-text-secondary font-bold">• {r}</li>)}
                                        </ul>
                                    </div>

                                    {/* IDRICO */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center px-1">
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Waves size={16}/></div>
                                                <span className="text-xs font-black uppercase tracking-tight">Stress Idrico</span>
                                            </div>
                                            <span className="text-lg font-black text-blue-600">{predictiveData.scores.water}%</span>
                                        </div>
                                        <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${predictiveData.scores.water}%` }}></div>
                                        </div>
                                        <ul className="space-y-1">
                                            {predictiveData.reasons.water.map((r,i) => <li key={i} className="text-[10px] text-text-secondary font-bold">• {r}</li>)}
                                        </ul>
                                    </div>

                                    {/* INSETTI */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center px-1">
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><AlertTriangle size={16}/></div>
                                                <span className="text-xs font-black uppercase tracking-tight">Rischio Insetti</span>
                                            </div>
                                            <span className="text-lg font-black text-orange-600">{predictiveData.scores.insects}%</span>
                                        </div>
                                        <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-orange-500 transition-all duration-1000" style={{ width: `${predictiveData.scores.insects}%` }}></div>
                                        </div>
                                    </div>

                                    {/* NUTRIZIONE / HEALTH */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center px-1">
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                                                    {activeUnit.category === 'Allevamento' ? <HeartPulse size={16}/> : <TrendingUp size={16}/>}
                                                </div>
                                                <span className="text-xs font-black uppercase tracking-tight">
                                                    {activeUnit.category === 'Allevamento' ? 'Rischio Sanitario' : 'Carenza Nutrizionale'}
                                                </span>
                                            </div>
                                            <span className="text-lg font-black text-green-600">
                                                {activeUnit.category === 'Allevamento' ? predictiveData.scores.health : predictiveData.scores.nutrition}%
                                            </span>
                                        </div>
                                        <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${activeUnit.category === 'Allevamento' ? predictiveData.scores.health : predictiveData.scores.nutrition}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ACTION HUB */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="p-8 bg-gradient-to-br from-primary to-blue-600 rounded-[40px] text-white shadow-xl relative overflow-hidden group">
                                    <Sparkles className="absolute -top-4 -right-4 w-32 h-32 text-white/10 group-hover:scale-110 transition-transform duration-700"/>
                                    <h3 className="text-xl font-black uppercase tracking-tighter mb-4">Deep Insight TeraIA</h3>
                                    <p className="text-sm opacity-90 leading-relaxed font-medium mb-8">
                                        Analizzando il trend di <b>{predictiveData.quality}%</b>, l'AI consiglia un'ispezione fogliare precoce. Le spore fungine potrebbero essere già attive causa accumulo umidità notturna.
                                    </p>
                                    <div className="flex flex-col gap-2">
                                        <button onClick={()=>navigate('/ai/trattamenti', { state: { unitId: activeUnit.id }})} className="w-full py-4 bg-white text-primary rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                                            Verifica Principi Attivi <ArrowRight size={18}/>
                                        </button>
                                        <button onClick={()=>navigate('/quaderno-campagna')} className="w-full py-2 text-[10px] font-black uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity">Registra Ispezione Manuale</button>
                                    </div>
                                </div>

                                <div className="bg-white rounded-[40px] p-8 shadow-xl border border-gray-100 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-xl font-black uppercase tracking-tighter mb-6 flex items-center gap-2">
                                            <Thermometer className="text-orange-500"/> Contesto Meteo
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                <div className="flex items-center gap-3">
                                                    <CloudRain className="text-blue-500" size={20}/>
                                                    <span className="text-xs font-bold text-text-secondary uppercase">Accumulo Pioggia (72h)</span>
                                                </div>
                                                <span className="font-black text-text-primary">15 mm</span>
                                            </div>
                                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                <div className="flex items-center gap-3">
                                                    <Wind className="text-gray-500" size={20}/>
                                                    <span className="text-xs font-bold text-text-secondary uppercase">Vento Medio</span>
                                                </div>
                                                <span className="font-black text-text-primary">8 km/h</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={()=>navigate('/meteo')} className="mt-8 text-center text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Vedi analisi meteo estesa &rarr;</button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-20 bg-gray-50 rounded-[48px] border-2 border-dashed border-gray-200">
                            <Info size={64} className="text-gray-200 mb-6"/>
                            <h3 className="text-xl font-black text-gray-400 uppercase tracking-tighter">Seleziona un'unità per l'analisi 4D</h3>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PredictiveControlRoom;
