
import React, { useMemo, useEffect, useState } from 'react';
import { 
    Radar, Banknote, CloudSun, ArrowRight, Clock, Inbox, 
    Zap, AlertTriangle, ChevronRight, PenTool, History, 
    TrendingUp, PawPrint, Wheat, Stethoscope, Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../hooks/useAppContext';
import { inboxService } from '../../services/inboxService';
import { aiPredictiveService } from '../../services/aiPredictiveService';
import { aiForecastService } from '../../services/aiForecastService';
import { livestockService } from '../../services/livestockService';
import { livestockDashboardService } from '../../services/livestockDashboardService';
import { AiPredictiveResult, CompanyForecastDigest, Role, AssetType } from '../../types';

const DashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const { companyProfile, uiPrefs, simulatedRole } = useAppContext();
    const [aiDigest, setAiDigest] = useState<AiPredictiveResult | null>(null);
    const [forecastDigest, setForecastDigest] = useState<CompanyForecastDigest | null>(null);

    const units = useMemo(() => livestockService.getUnits(), []);
    const hasLivestockAsset = useMemo(() => 
        companyProfile?.assets.includes(AssetType.ALLEVAMENTO) || units.length > 0
    , [companyProfile, units]);

    const livestockKpis = useMemo(() => hasLivestockAsset ? livestockDashboardService.getLivestockKpis() : null, [hasLivestockAsset]);
    const upcoming = useMemo(() => hasLivestockAsset ? livestockDashboardService.getUpcoming() : [], [hasLivestockAsset]);
    const alerts = useMemo(() => hasLivestockAsset ? livestockService.getAlerts().filter(a => !a.read) : [], [hasLivestockAsset]);

    useEffect(() => {
        setAiDigest(aiPredictiveService.updateAnalysis());
        setForecastDigest(aiForecastService.forecastCompanyDigest(7));
    }, []);

    const pendingDocs = useMemo(() => inboxService.getDocuments().filter(d => d.status === 'NEW'), []);

    return (
        <div className={`space-y-6 ${uiPrefs.compactMode ? 'scale-[0.98] origin-top' : ''} pb-10 animate-in fade-in duration-500`}>
            {/* APPROVAL BANNER */}
            {pendingDocs.length > 0 && (
                <div className="p-6 bg-indigo-600 rounded-[32px] text-white shadow-xl flex flex-col md:flex-row justify-between items-center gap-6 animate-in zoom-in">
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-white/20 rounded-3xl"><Inbox size={32}/></div>
                        <div>
                            <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">Hai {pendingDocs.length} documenti da approvare</h3>
                            <p className="text-xs opacity-80 font-bold uppercase mt-1">Registra fatture per aggiornare bilancio e magazzino.</p>
                        </div>
                    </div>
                    <button onClick={() => navigate('/inbox')} className="px-8 py-4 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:scale-105 transition-all">Gestisci Ora</button>
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-4xl font-black text-text-primary uppercase tracking-tighter leading-none">Control Room</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* PREDICTIVE WIDGET */}
                <div className={`${hasLivestockAsset ? 'lg:col-span-8' : 'lg:col-span-12'} bg-white rounded-[48px] p-10 shadow-xl border border-gray-50 space-y-8`}>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-primary/10 text-primary rounded-2xl"><Radar className="animate-pulse" size={24}/></div>
                            <h2 className="text-2xl font-black uppercase tracking-tighter">AI Predittiva (7gg)</h2>
                        </div>
                        <button onClick={() => navigate('/ai-predittiva')} className="text-xs font-black text-primary uppercase underline tracking-widest">Vedi Tutti</button>
                    </div>

                    <div className={`grid grid-cols-1 ${hasLivestockAsset ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-4`}>
                        {aiDigest?.alerts.slice(0, hasLivestockAsset ? 2 : 3).map(alert => (
                            <div key={alert.id} className="p-6 bg-gray-50 rounded-[32px] border border-gray-100 flex flex-col justify-between group hover:border-primary transition-all">
                                <div>
                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${alert.severity === 'high' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-700'}`}>{alert.severity}</span>
                                    <h4 className="font-black text-sm uppercase mt-2 leading-tight">{alert.title}</h4>
                                    <p className="text-[10px] text-text-secondary mt-1 line-clamp-2 italic">"{alert.description}"</p>
                                </div>
                                <button onClick={() => navigate(alert.recommendedActions[0].route)} className="mt-4 flex items-center gap-1 text-[9px] font-black text-primary uppercase">Risolvi <ArrowRight size={10}/></button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ALLEVAMENTO WIDGET INTELLIGENTE */}
                {hasLivestockAsset && (
                    <div className="lg:col-span-4 bg-white rounded-[48px] p-10 shadow-xl border border-gray-100 flex flex-col justify-between group hover:border-blue-600 transition-all cursor-pointer" onClick={() => navigate('/allevamento')}>
                        <div>
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-4 bg-blue-50 text-blue-600 rounded-3xl group-hover:scale-110 transition-transform"><PawPrint size={28}/></div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-text-secondary uppercase">Unità</p>
                                    <p className="text-2xl font-black text-text-primary">{units.length}</p>
                                </div>
                            </div>
                            <h2 className="text-2xl font-black uppercase tracking-tighter leading-none">Monitor Stalla</h2>
                            
                            <div className="mt-6 space-y-4">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                                    <span className="text-[9px] font-black uppercase text-text-secondary">Alert Attivi</span>
                                    <span className={`text-xs font-black ${alerts.length > 0 ? 'text-red-500' : 'text-green-600'}`}>{alerts.length > 0 ? `${alerts.length} Rilevati` : 'Nessuno'}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                                    <span className="text-[9px] font-black uppercase text-text-secondary">Prossimo Vaccino</span>
                                    <span className="text-xs font-black text-blue-600">
                                        {upcoming.find(u => u.type === 'VACCINO') ? new Date((upcoming.find(u => u.type === 'VACCINO') as any).nextDueDate).toLocaleDateString() : 'Nessuno'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button className="mt-8 flex items-center gap-2 text-xs font-black text-primary uppercase">Hub Allevamento <ChevronRight size={16}/></button>
                    </div>
                )}
            </div>

            {/* ROW 3: QUICK STATS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div onClick={() => navigate('/meteo')} className="bg-white rounded-[40px] p-8 shadow-xl border border-gray-50 cursor-pointer hover:shadow-2xl transition-all group relative overflow-hidden">
                    <div className="p-4 bg-blue-50 text-blue-600 rounded-3xl w-fit mb-6 group-hover:scale-110 transition-transform"><CloudSun size={28}/></div>
                    <h3 className="text-4xl font-black tracking-tighter leading-none">24°C</h3>
                    <p className="text-[10px] text-text-secondary font-black uppercase mt-2 tracking-widest">Soleggiato • {companyProfile?.localization.regionName}</p>
                </div>
                
                <div onClick={() => navigate('/scadenze')} className="bg-white rounded-[40px] p-8 shadow-xl border border-gray-50 cursor-pointer hover:shadow-2xl transition-all group relative overflow-hidden">
                    <div className="p-4 bg-red-50 text-red-600 rounded-3xl w-fit mb-6 group-hover:scale-110 transition-transform"><Clock size={28}/></div>
                    <h3 className="text-3xl font-black tracking-tighter leading-none">3 Alert</h3>
                    <p className="text-[10px] text-text-secondary font-black uppercase mt-2 tracking-widest">Scadenze in arrivo</p>
                </div>

                <div onClick={() => navigate('/economia')} className="bg-white rounded-[40px] p-8 shadow-xl border border-gray-100 cursor-pointer hover:shadow-2xl transition-all group relative overflow-hidden">
                    <div className="p-4 bg-green-50 text-green-600 rounded-3xl w-fit mb-6 group-hover:scale-110 transition-transform"><Banknote size={28}/></div>
                    <h3 className="text-3xl font-black tracking-tighter leading-none">€ 7.300</h3>
                    <p className="text-[10px] text-text-secondary font-black uppercase mt-2 tracking-widest">Margine Attuale</p>
                </div>

                <div onClick={() => navigate('/quaderno-campagna')} className="bg-gray-900 text-white rounded-[40px] p-8 shadow-2xl cursor-pointer hover:scale-[1.02] transition-all group relative overflow-hidden">
                    <Zap className="absolute -top-6 -right-6 w-32 h-32 text-primary/10 group-hover:scale-110 transition-transform" />
                    <div className="p-4 bg-primary/20 text-primary rounded-3xl w-fit mb-6"><PenTool size={28}/></div>
                    <h3 className="text-xl font-black uppercase leading-none mb-1">Registra</h3>
                    <p className="text-[10px] opacity-60 font-bold uppercase tracking-widest">Quaderno Campagna</p>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
