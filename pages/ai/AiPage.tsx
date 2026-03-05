
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    BrainCircuit, Lightbulb, CheckCircle, X, ExternalLink, 
    MessageSquare, Info, Camera, Upload, LayoutGrid, RefreshCw, 
    AlertTriangle, EyeOff, Database, Zap, Radar, TrendingUp,
    // Added missing ArrowRight and DatabaseZap imports
    ArrowRight, DatabaseZap
} from 'lucide-react';
import { useAppContext } from '../../hooks/useAppContext';
import { buildInsightsForUnit, AiDecisionCard } from '../../utils/insightGenerator';
import { Role } from '../../types';

const Card: React.FC<{ children: React.ReactNode, className?: string, onClick?: () => void }> = ({ children, className, onClick }) => (
    <div 
        className={`bg-surface rounded-xl shadow-md p-6 transition-all ${className} ${onClick ? 'cursor-pointer hover:shadow-lg hover:scale-[1.01] group' : ''}`} 
        onClick={onClick}
    >
        {children}
    </div>
);

const PRODUCTION_UNITS_KEY = 'teraia_production_units_v1';

const AiPage: React.FC = () => {
    const { currentUser } = useAppContext();
    const navigate = useNavigate();

    const [allUnits] = useState<any[]>(() => JSON.parse(localStorage.getItem(PRODUCTION_UNITS_KEY) || '[]'));
    const units = useMemo(() => {
        if (currentUser?.role === Role.AGRONOMO) return allUnits.filter(u => u.type !== 'Allevamento');
        if (currentUser?.role === Role.VETERINARIO) return allUnits.filter(u => u.type === 'Allevamento');
        return allUnits;
    }, [allUnits, currentUser]);

    const [selectedUnitId, setSelectedUnitId] = useState<string>(() => units.length > 0 ? String(units[0].id) : '');
    const [isRegenerating, setIsRegenerating] = useState(false);

    const suggestions = useMemo(() => {
        if (!selectedUnitId) return [];
        return buildInsightsForUnit(selectedUnitId);
    }, [selectedUnitId, isRegenerating]);

    const handleRegenerate = () => {
        setIsRegenerating(true);
        // Fixed typo: changed setIsRefreshing to setIsRegenerating
        setTimeout(() => setIsRegenerating(false), 800);
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center text-text-primary">
                        <BrainCircuit className="mr-3 text-primary" /> AI & Decisioni
                    </h1>
                    <p className="text-text-secondary text-sm mt-1">Supporto professionale basato sui tuoi dati aziendali.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* ACCESSO RAPIDO AI PREDITTIVA */}
                    <div 
                        onClick={() => navigate('/ai/previsione')}
                        className="p-1 rounded-3xl bg-gradient-to-r from-primary to-blue-600 cursor-pointer hover:shadow-2xl transition-all active:scale-[0.98]"
                    >
                        <div className="bg-white rounded-[20px] p-6 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary/10 rounded-2xl text-primary animate-pulse">
                                    <Radar size={32}/>
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-text-primary">Analisi Rischi a 14 Giorni</h3>
                                    <p className="text-sm text-text-secondary">Scansione modelli agronomici e prevenzione.</p>
                                </div>
                            </div>
                            <button className="p-3 bg-gray-50 rounded-full hover:bg-primary hover:text-white transition-all">
                                <ArrowRight/>
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold flex items-center gap-2"><Lightbulb className="text-yellow-500" /> Insight Attuali</h2>
                        <div className="flex items-center gap-3 bg-white p-1 rounded-xl border">
                             <select 
                                value={selectedUnitId} 
                                onChange={e => setSelectedUnitId(e.target.value)}
                                className="bg-transparent font-bold text-xs focus:outline-none px-2"
                            >
                                {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    {suggestions.length === 0 ? (
                        <Card className="text-center py-20 border-2 border-dashed">
                            <CheckCircle size={48} className="mx-auto text-green-400 mb-4" />
                            <p className="text-text-secondary">Nessuna anomalia rilevata per questa unità.</p>
                        </Card>
                    ) : (
                        <div className="space-y-6">
                            {suggestions.map(s => (
                                <div key={s.id} className={`bg-white rounded-2xl shadow-md border-l-8 p-6 transition-all ${s.risk === 'Alto' ? 'border-red-500' : 'border-primary'}`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${s.risk === 'Alto' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>Priorità {s.risk}</span>
                                            <h3 className="text-xl font-black mt-2">{s.title}</h3>
                                        </div>
                                        <div className="text-[10px] font-bold text-text-secondary uppercase">{s.category}</div>
                                    </div>
                                    <p className="text-sm text-text-primary mb-4 leading-relaxed">{s.situation}</p>
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
                                        <p className="text-[10px] font-black text-text-secondary uppercase mb-1">Azione Raccomandata</p>
                                        <p className="text-sm font-bold text-primary">"{s.action}"</p>
                                    </div>
                                    <button onClick={() => navigate(s.moduleRoute)} className="flex items-center gap-2 text-xs font-bold text-text-primary hover:underline">
                                        Apri modulo correlato <ExternalLink size={14}/>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <Card className="h-fit border-t-4 border-primary">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg">TeraIA Vision</h3>
                            <Zap className="text-primary animate-bounce" size={20}/>
                        </div>
                        <p className="text-xs text-text-secondary mb-6">Analisi patologica in tempo reale tramite computer vision.</p>
                        <button className="w-full py-4 bg-primary text-white rounded-xl font-black flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all mb-3">
                            <Camera size={20}/> ANALISI FOGLIARE
                        </button>
                        <button className="w-full py-3 bg-gray-50 text-text-secondary rounded-xl font-bold text-xs hover:bg-gray-100 transition-all">
                             UPLOAD FOTO MULTIPLE
                        </button>
                    </Card>

                    <Card className="bg-blue-600 text-white border-none shadow-xl">
                        <h3 className="font-black text-lg mb-2 flex items-center gap-2"><DatabaseZap size={20}/> Memoria Collettiva</h3>
                        <p className="text-xs opacity-90 mb-6 leading-relaxed">Scopri come altri agricoltori nella tua zona hanno affrontato i problemi attuali della stagione.</p>
                        <button 
                            onClick={() => navigate('/ai/memoria-collettiva')}
                            className="w-full py-3 bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-xl font-bold text-xs hover:bg-white/30 transition-all flex items-center justify-center gap-2"
                        >
                            CONSULTA ESPERIENZE <ArrowRight size={14}/>
                        </button>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AiPage;
