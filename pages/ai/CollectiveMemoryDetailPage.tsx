
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, Users, ShieldCheck, DatabaseZap, Clock, 
    Share2, Save, Link as LinkIcon, CheckCircle, XCircle, 
    Info, MapPin, Tag, TrendingUp
} from 'lucide-react';
import { INITIAL_COLLECTIVE_INSIGHTS } from '../../data/memoryCollectiveData';

const CollectiveMemoryDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    const insight = INITIAL_COLLECTIVE_INSIGHTS.find(i => i.id === id);

    if (!insight) return (
        <div className="h-screen flex flex-col items-center justify-center p-8 text-center">
            <Info size={64} className="text-gray-300 mb-4" />
            <h2 className="text-2xl font-black uppercase">Insight non trovato</h2>
            <button onClick={() => navigate(-1)} className="mt-6 text-primary font-bold underline">Torna indietro</button>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20 max-w-5xl mx-auto">
            {/* TOP BAR */}
            <div className="flex justify-between items-center">
                <button onClick={() => navigate(-1)} className="flex items-center text-sm font-black text-text-secondary hover:text-primary uppercase tracking-widest transition-colors">
                    <ArrowLeft size={16} className="mr-2"/> Torna alla Memoria
                </button>
                <div className="flex gap-2">
                    <button className="p-3 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-all"><Share2 size={18}/></button>
                </div>
            </div>

            {/* HEADER CARD */}
            <div className="bg-white rounded-[48px] shadow-2xl p-10 border-t-8 border-primary relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex flex-wrap gap-3 mb-6">
                        <span className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest">Confidenza AI {insight.confidence}%</span>
                        <span className="px-4 py-1.5 bg-gray-100 text-text-secondary rounded-full text-[10px] font-black uppercase tracking-widest">{insight.category}</span>
                    </div>
                    <h1 className="text-4xl font-black text-text-primary tracking-tighter uppercase mb-4">{insight.title}</h1>
                    <div className="flex flex-wrap items-center gap-6 text-text-secondary font-bold text-sm">
                        <span className="flex items-center gap-2"><MapPin size={16} className="text-primary"/> {insight.city}, {insight.province} ({insight.region})</span>
                        <span className="flex items-center gap-2"><Clock size={16} className="text-primary"/> Aggiornato: {new Date(insight.updatedAt).toLocaleDateString()}</span>
                    </div>
                </div>
                <DatabaseZap className="absolute -top-10 -right-10 w-64 h-64 text-primary/5" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* SINISTRA: DETTAGLIO TECNICO */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-[40px] p-10 shadow-xl border border-gray-50">
                        <h2 className="text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-2">
                            <Info size={24} className="text-primary"/> Analisi dell'Esperienza
                        </h2>
                        <p className="text-lg text-text-primary leading-relaxed mb-10 font-medium italic">"{insight.description}"</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h3 className="flex items-center gap-2 text-green-700 font-black uppercase text-xs tracking-widest">
                                    <CheckCircle size={18}/> Protocollo Suggerito
                                </h3>
                                <p className="text-sm text-text-secondary leading-relaxed font-medium bg-green-50 p-6 rounded-[32px] border border-green-100">
                                    {insight.whatWorks}
                                </p>
                            </div>
                            <div className="space-y-4">
                                <h3 className="flex items-center gap-2 text-red-700 font-black uppercase text-xs tracking-widest">
                                    <XCircle size={18}/> Azioni da Evitare
                                </h3>
                                <p className="text-sm text-text-secondary leading-relaxed font-medium bg-red-50 p-6 rounded-[32px] border border-red-100">
                                    {insight.whatToAvoid}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[40px] p-10 shadow-xl border border-gray-50">
                        <h2 className="text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-2">
                            <TrendingUp size={24} className="text-primary"/> Fonti e Validazione
                        </h2>
                        <div className="flex flex-wrap gap-4">
                            {insight.sources.map((s, i) => (
                                <div key={i} className="px-5 py-3 bg-gray-50 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-gray-100 text-text-secondary">
                                    {s}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* DESTRA: AZIONI RAPIDE */}
                <div className="space-y-8">
                    <div className="bg-gray-900 text-white rounded-[40px] p-10 shadow-2xl">
                        <h2 className="text-xl font-black uppercase tracking-tight mb-8">Azioni Sistema</h2>
                        <div className="space-y-4">
                            <button onClick={() => alert('Salvato!')} className="w-full py-5 bg-primary text-white rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3">
                                <Save size={20}/> Salva in Privata
                            </button>
                            <button onClick={() => navigate('/quaderno', { state: { prefill: insight }})} className="w-full py-5 bg-white/10 text-white border border-white/10 rounded-3xl font-black uppercase text-xs tracking-widest hover:bg-white/20 transition-all flex items-center justify-center gap-3">
                                <LinkIcon size={20}/> Registra Intervento
                            </button>
                        </div>
                        <p className="mt-8 text-[10px] text-center opacity-40 uppercase font-black tracking-[0.2em]">TeraIA OS • Governance</p>
                    </div>

                    <div className="bg-blue-600 rounded-[40px] p-8 text-white shadow-xl">
                        <h3 className="text-lg font-black mb-2 uppercase tracking-tighter">Tags Correlati</h3>
                        <div className="flex flex-wrap gap-2">
                            {insight.tags.map(t => (
                                <span key={t} className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase">
                                    # {t}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CollectiveMemoryDetailPage;
