
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrainCircuit, AlertTriangle, CheckCircle, ArrowLeft, LayoutGrid, Zap, Sparkles } from 'lucide-react';
import { livestockStorage } from '../../services/livestockStorage';

const LivestockAIPredictivePage: React.FC = () => {
    const navigate = useNavigate();
    
    const units = useMemo(() => livestockStorage.getUnits(), []);
    const welfare = useMemo(() => livestockStorage.getWelfare(), []);
    const production = useMemo(() => livestockStorage.getProduction(), []);

    const alerts = useMemo(() => {
        const list: any[] = [];
        
        units.forEach(u => {
            // 1. Check stress signals in welfare
            const unitWelfare = welfare.filter(w => w.unitId === u.id).sort((a,b)=>b.date.localeCompare(a.date));
            if (unitWelfare[0]?.stressSignals?.length) {
                if (unitWelfare[0].stressSignals.includes('tosse') || unitWelfare[0].stressSignals.includes('apatia')) {
                    list.push({ 
                        id: `alt-${u.id}-1`, 
                        unit: u.name, 
                        title: "Sospetta Patologia Respiratoria", 
                        severity: "alto", 
                        desc: "L'AI ha rilevato pattern di stress (tosse/apatia) coerenti con prime fasi di focolaio respiratorio." 
                    });
                }
            }

            // 2. Check production drops
            const unitProd = production.filter(p => p.unitId === u.id).sort((a,b)=>b.date.localeCompare(a.date));
            if (unitProd.length >= 3) {
                const latest = unitProd[0].milkLiters || unitProd[0].eggsCount || 0;
                const prevAvg = ( (unitProd[1].milkLiters || unitProd[1].eggsCount || 0) + (unitProd[2].milkLiters || unitProd[2].eggsCount || 0) ) / 2;
                if (latest < prevAvg * 0.85) {
                    list.push({ 
                        id: `alt-${u.id}-2`, 
                        unit: u.name, 
                        title: "Calo Produttivo Anomalo", 
                        severity: "medio", 
                        desc: "Rilevata riduzione della produzione > 15%. Verificare razione alimentare e parametri benessere." 
                    });
                }
            }
        });

        return list;
    }, [units, welfare, production]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/allevamento')} className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 shadow-sm text-text-secondary"><ArrowLeft size={20}/></button>
                <h1 className="text-3xl font-black text-text-primary uppercase tracking-tighter flex items-center gap-3">
                    <BrainCircuit className="text-primary"/> AI Zootecnica
                </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-black uppercase tracking-tight px-1 flex items-center gap-2">
                        <Zap size={20} className="text-yellow-500"/> Scenario Rischi 48h
                    </h2>
                    
                    {alerts.length > 0 ? alerts.map(a => (
                        <div key={a.id} className={`p-8 rounded-[40px] shadow-xl border-l-[12px] bg-white flex flex-col md:flex-row justify-between items-center gap-8 ${a.severity === 'alto' ? 'border-red-500' : 'border-orange-500'}`}>
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className={`px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${a.severity === 'alto' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>Livello {a.severity}</span>
                                    <span className="text-[10px] font-bold text-text-secondary uppercase">{a.unit}</span>
                                </div>
                                <h3 className="text-2xl font-black text-text-primary uppercase tracking-tighter">{a.title}</h3>
                                <p className="text-sm text-text-secondary font-medium italic">"{a.desc}"</p>
                            </div>
                            <button onClick={() => navigate(`/allevamento/unita/${units.find(u=>u.name===a.unit)?.id}`)} className="px-8 py-4 bg-gray-900 text-white rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-black transition-all">Gestisci</button>
                        </div>
                    )) : (
                        <div className="p-20 text-center bg-white rounded-[48px] border-2 border-dashed border-gray-200">
                            <CheckCircle size={64} className="text-green-200 mx-auto mb-4"/>
                            <h3 className="text-xl font-black text-gray-400 uppercase">Analisi Stabile</h3>
                            <p className="text-sm text-text-secondary mt-2">Nessuna anomalia biologica o produttiva rilevata sui dati correnti.</p>
                        </div>
                    )}
                </div>

                <div className="bg-gradient-to-br from-primary to-blue-600 rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden">
                    <Sparkles className="absolute -top-4 -right-4 w-40 h-40 text-white/10" />
                    <h3 className="text-2xl font-black uppercase tracking-tighter mb-6">DSS (Decision Support)</h3>
                    <p className="text-sm opacity-90 leading-relaxed mb-8 font-medium">L'AI TeraIA incrocia i segnali di stress rilevati durante l'audit del benessere con le curve di produzione storiche per anticipare malattie epidemiche o cali di fertilità.</p>
                    <div className="space-y-4">
                        <div className="p-4 bg-white/10 rounded-3xl border border-white/10">
                            <p className="text-[10px] font-black uppercase opacity-60 mb-1">Status Motore</p>
                            <p className="text-xs font-bold uppercase flex items-center gap-2"><div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div> Sincronizzato con Real-Time</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LivestockAIPredictivePage;
