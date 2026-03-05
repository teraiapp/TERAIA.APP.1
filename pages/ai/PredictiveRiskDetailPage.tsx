
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, ShieldAlert, Zap, Info, CheckCircle, 
    Database, MapPin, Calendar, Clock, ExternalLink, 
    Save, Copy, Share2, AlertCircle, TrendingUp, BookOpen,
    // Added missing Check import
    Check
} from 'lucide-react';
import { AiRiskAlert } from '../../data/aiRiskData';

const STORAGE_KEY = 'teraia_ai_risks_v1';

const PredictiveRiskDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    const [alerts, setAlerts] = useState<AiRiskAlert[]>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    });

    const alert = useMemo(() => alerts.find(a => a.id === id), [alerts, id]);

    // Salva modifiche alle checkbox
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
    }, [alerts]);

    const toggleAction = (actionId: string) => {
        if (!alert) return;
        setAlerts(prev => prev.map(a => {
            if (a.id === alert.id) {
                return {
                    ...a,
                    actions: a.actions.map(act => act.id === actionId ? { ...act, completed: !act.completed } : act)
                };
            }
            return a;
        }));
    };

    const handleCreateEntry = () => {
        if (!alert) return;
        navigate('/quaderno', { 
            state: { 
                prefill: {
                    type: 'trattamento',
                    unitId: alert.linkedUnitId,
                    crop: alert.linkedUnitName,
                    details: {
                        adversity: alert.title,
                        reason: `AI Predict: ${alert.why}`,
                        date: new Date().toISOString().split('T')[0]
                    }
                }
            } 
        });
    };

    if (!alert) return (
        <div className="h-screen flex flex-col items-center justify-center text-center p-8">
            <AlertCircle size={64} className="text-red-500 mb-4"/>
            <h2 className="text-2xl font-black uppercase">Avviso non trovato</h2>
            <button onClick={() => navigate(-1)} className="mt-6 text-primary font-bold underline">Torna indietro</button>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* TOP BAR */}
            <div className="flex justify-between items-center">
                <button onClick={() => navigate(-1)} className="flex items-center text-sm font-black text-text-secondary hover:text-primary uppercase tracking-widest transition-colors">
                    <ArrowLeft size={16} className="mr-2"/> Torna ai Rischi
                </button>
                <div className="flex gap-2">
                    <button className="p-3 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"><Share2 size={18}/></button>
                    <button className="p-3 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"><Copy size={18}/></button>
                </div>
            </div>

            {/* HEADER CARD */}
            <div className="bg-surface rounded-[48px] shadow-2xl p-10 border-t-8 border-primary relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex flex-wrap gap-3 mb-6">
                        <span className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest">Confidenza {alert.confidence}%</span>
                        <span className="px-4 py-1.5 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-widest">Rischio {alert.level}</span>
                    </div>
                    <h1 className="text-4xl font-black text-text-primary tracking-tighter uppercase mb-2">{alert.title}</h1>
                    <div className="flex flex-wrap items-center gap-6 text-text-secondary font-bold text-sm">
                        <span className="flex items-center gap-2"><MapPin size={16} className="text-primary"/> {alert.linkedUnitName}</span>
                        <span className="flex items-center gap-2"><Calendar size={16} className="text-primary"/> {new Date(alert.date).toLocaleString()}</span>
                        <span className="flex items-center gap-2"><ShieldAlert size={16} className="text-primary"/> {alert.category}</span>
                    </div>
                </div>
                <Zap className="absolute -top-10 -right-10 w-64 h-64 text-primary/5" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* SINISTRA: DESCRIZIONE E LOGICA */}
                <div className="lg:col-span-7 space-y-8">
                    <div className="bg-white rounded-[40px] p-10 shadow-xl border border-gray-50">
                        <h2 className="text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-2">
                            <Info size={24} className="text-primary"/> Perché questo avviso?
                        </h2>
                        <div className="prose max-w-none text-text-secondary font-medium leading-relaxed space-y-6">
                            <p className="bg-gray-50 p-6 rounded-3xl italic border-l-4 border-primary">"{alert.description}"</p>
                            <div>
                                <h3 className="text-text-primary font-black uppercase text-xs mb-2">Analisi Motore TeraIA:</h3>
                                <p>{alert.why}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[40px] p-10 shadow-xl border border-gray-100">
                        <h2 className="text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-2">
                            <Database size={24} className="text-primary"/> Fonti del Dato
                        </h2>
                        <div className="flex flex-wrap gap-4">
                            {alert.sources.map((s, i) => (
                                <div key={i} className="flex items-center gap-2 px-5 py-3 bg-gray-50 rounded-2xl text-xs font-black uppercase tracking-tight">
                                    <CheckCircle size={14} className="text-green-500"/> {s}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* DESTRA: ACTIONS E CTA */}
                <div className="lg:col-span-5 space-y-8">
                    <div className="bg-gray-900 text-white rounded-[40px] p-10 shadow-2xl">
                        <h2 className="text-xl font-black uppercase tracking-tight mb-8 flex items-center gap-2">
                            <Zap size={24} className="text-primary"/> Piano di Mitigazione
                        </h2>
                        <div className="space-y-4">
                            {alert.actions.map(action => (
                                <div 
                                    key={action.id} 
                                    onClick={() => toggleAction(action.id)}
                                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 group ${action.completed ? 'border-primary/50 bg-primary/10' : 'border-white/10 hover:border-primary/30'}`}
                                >
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${action.completed ? 'bg-primary border-primary' : 'border-white/20'}`}>
                                        {/* Fixed: Check icon name now found via import */}
                                        {action.completed && <Check size={14} className="text-white"/>}
                                    </div>
                                    <span className={`text-sm font-bold transition-all ${action.completed ? 'opacity-50 line-through' : ''}`}>
                                        {action.label}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-10 pt-10 border-t border-white/10 space-y-4">
                            <button 
                                onClick={handleCreateEntry}
                                className="w-full py-5 bg-primary text-white rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                            >
                                <BookOpen size={20}/> Registra nel Quaderno
                            </button>
                            <p className="text-[10px] text-center opacity-40 uppercase font-bold tracking-widest">Azione sincronizzata con modulo Produzione</p>
                        </div>
                    </div>

                    <div className="p-8 bg-blue-50 rounded-[40px] border border-blue-100 flex items-start gap-4">
                        <TrendingUp size={32} className="text-blue-600 shrink-0"/>
                        <div>
                            <h4 className="font-black text-blue-900 uppercase text-xs">Impatto Stimato</h4>
                            <p className="text-sm text-blue-800 font-medium mt-1 leading-relaxed">
                                Mitigando questo rischio ora, proteggi il <b>100%</b> della resa prevista per l'unità <b>{alert.linkedUnitName}</b>.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PredictiveRiskDetailPage;
