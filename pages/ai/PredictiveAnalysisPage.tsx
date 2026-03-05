
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Radar, ShieldAlert, Zap, Thermometer, Droplets, 
    Calendar, CheckCircle, Info, ArrowRight, EyeOff,
    TrendingUp, LayoutGrid, Search, RefreshCw, Sparkles,
    AlertTriangle, DatabaseZap, BookOpen,
    // Added missing CloudSun import
    CloudSun
} from 'lucide-react';
import { useAppContext } from '../../hooks/useAppContext';
import { forecastUnitRisks, UnitRiskForecast } from '../../utils/predictiveEngine';

const Card: React.FC<{children: React.ReactNode, className?: string}> = ({ children, className }) => (
    <div className={`bg-surface rounded-xl shadow-md p-6 ${className}`}>{children}</div>
);

const RiskBadge: React.FC<{level: string}> = ({level}) => {
    const config: any = {
        alto: { color: 'bg-red-100 text-red-700', label: 'RISCHIO ALTO' },
        medio: { color: 'bg-yellow-100 text-yellow-700', label: 'RISCHIO MEDIO' },
        basso: { color: 'bg-green-100 text-green-700', label: 'RISCHIO BASSO' },
    };
    return <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase ${config[level].color}`}>{config[level].label}</span>;
};

const PredictiveAnalysisPage: React.FC = () => {
    const { currentUser, companyProfile } = useAppContext();
    const navigate = useNavigate();
    
    const units = useMemo(() => JSON.parse(localStorage.getItem('teraia_production_units_v1') || '[]'), []);
    const [selectedUnitId, setSelectedUnitId] = useState<string>(units[0]?.id || '');
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Mock meteo previsto a 14gg (in produzione da API)
    const weatherForecast = { tempAvg: 23, humidityAvg: 85, rainDays: 3 };

    const selectedUnit = useMemo(() => units.find((u: any) => String(u.id) === String(selectedUnitId)), [units, selectedUnitId]);

    const risks = useMemo(() => {
        if (!selectedUnit || !companyProfile) return [];
        // Fixed: Property 'location' does not exist on type 'CompanyProfile'. Changed to 'localization'.
        return forecastUnitRisks(selectedUnit, weatherForecast, companyProfile.localization.region);
    }, [selectedUnit, weatherForecast, companyProfile]);

    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => setIsRefreshing(false), 1000);
    };

    const handleCreatePreventiveDraft = (risk: UnitRiskForecast) => {
        navigate('/quaderno', {
            state: {
                prefill: {
                    type: 'trattamento',
                    unitId: selectedUnit.id,
                    crop: selectedUnit.crop_key,
                    details: {
                        product: "Vedi suggerimento AI",
                        dose: "Standard preventivo",
                        adversity: risk.targetName,
                        reason: `Prevenzione AI: ${risk.why}`,
                        safetyIntervalDays: 0
                    }
                }
            }
        });
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-text-primary flex items-center gap-3">
                        <Radar className="text-primary" size={32} /> AI Predittiva & Rischi
                    </h1>
                    <p className="text-text-secondary text-sm">Analisi proattiva a 14 giorni basata su modelli agronomici e meteo.</p>
                </div>
                <button 
                    onClick={handleRefresh}
                    className="flex items-center gap-2 px-4 py-2 border-2 border-gray-100 bg-white rounded-xl font-bold text-xs hover:bg-gray-50"
                >
                    <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''}/> AGGIORNA MODELLI
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <h2 className="text-xs font-black text-text-secondary uppercase mb-4 flex items-center gap-2">
                            <LayoutGrid size={14}/> Monitoraggio Unità
                        </h2>
                        <div className="space-y-2">
                            {units.map((u: any) => (
                                <button 
                                    key={u.id}
                                    onClick={() => setSelectedUnitId(u.id)}
                                    className={`w-full p-3 rounded-xl text-left border-2 transition-all ${selectedUnitId === u.id ? 'border-primary bg-primary/5' : 'border-transparent bg-gray-50'}`}
                                >
                                    <p className="font-bold text-sm text-text-primary">{u.name}</p>
                                    <p className="text-[10px] text-text-secondary uppercase">{u.crop_key}</p>
                                </button>
                            ))}
                        </div>
                    </Card>

                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                         <h4 className="text-[10px] font-black text-blue-800 uppercase mb-2 flex items-center gap-1"><CloudSun size={12}/> Scenario Meteo 14gg</h4>
                         <div className="space-y-2 text-xs">
                             <div className="flex justify-between"><span>Media Temp:</span> <span className="font-bold">{weatherForecast.tempAvg}°C</span></div>
                             <div className="flex justify-between"><span>Umidità Media:</span> <span className="font-bold">{weatherForecast.humidityAvg}%</span></div>
                             <div className="flex justify-between"><span>Prob. Pioggia:</span> <span className="font-bold text-blue-600">Alta</span></div>
                         </div>
                    </div>
                </div>

                <div className="lg:col-span-3">
                    {risks.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                            <CheckCircle size={64} className="text-green-200 mb-4" />
                            <h3 className="text-xl font-bold text-gray-400">Tutto Sotto Controllo</h3>
                            <p className="text-sm text-gray-400 max-w-xs">Nessun rischio critico rilevato nei modelli agronomici per le prossime 2 settimane.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                Allerta Prevenzione <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{risks.length} criticità</span>
                            </h2>

                            <div className="grid grid-cols-1 gap-6">
                                {risks.map(risk => (
                                    <Card key={risk.id} className={`border-l-8 ${risk.level === 'alto' ? 'border-red-500' : 'border-yellow-500'}`}>
                                        <div className="flex flex-col md:flex-row justify-between gap-6">
                                            <div className="flex-1 space-y-4">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <RiskBadge level={risk.level}/>
                                                        <span className="text-[10px] font-bold text-text-secondary uppercase">• {risk.when}</span>
                                                    </div>
                                                    <h3 className="text-2xl font-black text-text-primary">Rischio {risk.targetName}</h3>
                                                </div>

                                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                                    <h4 className="text-[10px] font-black text-text-secondary uppercase mb-1 flex items-center gap-1"><Info size={10}/> Spiegazione AI</h4>
                                                    <p className="text-sm text-text-primary font-medium leading-relaxed">{risk.why}</p>
                                                </div>

                                                {risk.collectiveContext && (
                                                    <div className="flex items-center gap-2 text-[10px] font-bold text-primary">
                                                        <DatabaseZap size={14}/> {risk.collectiveContext}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="md:w-72 space-y-4">
                                                <h4 className="text-[10px] font-black text-text-secondary uppercase tracking-widest px-1">Protocollo Preventivo</h4>
                                                <div className="space-y-2">
                                                    <div className="p-3 bg-green-50 border border-green-100 rounded-xl text-[11px] text-green-800">
                                                        <b>Agronomica:</b> {risk.actions.agronomic}
                                                    </div>
                                                    {risk.actions.irrigation && (
                                                        <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-[11px] text-blue-800">
                                                            <b>Irrigua:</b> {risk.actions.irrigation}
                                                        </div>
                                                    )}
                                                    {risk.actions.phytosanitary && (
                                                        <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-[11px] text-red-800">
                                                            <b>Fitosanitaria:</b> {risk.actions.phytosanitary}
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                <div className="pt-2 flex flex-col gap-2">
                                                    <button 
                                                        onClick={() => handleCreatePreventiveDraft(risk)}
                                                        className="w-full py-2.5 bg-primary text-white font-black text-xs rounded-xl shadow-md hover:bg-primary-dark transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <Zap size={14}/> CREA BOZZA PREVENTIVA
                                                    </button>
                                                    <button className="w-full py-2 text-[10px] font-bold text-text-secondary hover:underline">
                                                        Ignora questo rischio
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>

                            <Card className="bg-gradient-to-r from-primary/10 to-transparent border-none">
                                <div className="flex items-start gap-4">
                                    <Sparkles className="text-primary shrink-0" size={24}/>
                                    <div>
                                        <h4 className="font-bold text-text-primary">Efficacia della Prevenzione</h4>
                                        <p className="text-sm text-text-secondary leading-relaxed">
                                            Agire ora in modalità preventiva può ridurre i costi dei trattamenti curativi del <b>35%</b> e proteggere il <b>100%</b> della resa potenziale.
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PredictiveAnalysisPage;
