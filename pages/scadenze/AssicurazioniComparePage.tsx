
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, ShieldCheck, Star, 
    CheckCircle, MessageSquare, Info,
    AlertTriangle, ShieldAlert, Zap
} from 'lucide-react';

const MOCK_INSURANCES = [
    { id: 'i1', brand: 'AgriGlobal Polizze', plan: 'Gold Farm', price: '450€/anno', rating: 4.8, coverage: 'Incendio, Furto, RC, Eventi Atmosferici' },
    { id: 'i2', brand: 'SafeTractor', plan: 'Basic Protection', price: '280€/anno', rating: 4.2, coverage: 'RC, Furto' },
    { id: 'i3', brand: 'Insurance Green', plan: 'All-Inclusive', price: '520€/anno', rating: 4.9, coverage: 'Full Kasko, RC, Tutela Legale' },
];

const AssicurazioniComparePage: React.FC = () => {
    const navigate = useNavigate();
    const [sent, setSent] = useState<string[]>([]);

    const handleQuote = (id: string, brand: string) => {
        setSent([...sent, id]);
        // Notifica mock
        const notifications = JSON.parse(localStorage.getItem('teraia_notifications_v1') || '[]');
        notifications.push({
            id: `notif-ins-${Date.now()}`,
            type: 'operativa',
            severity: 'info',
            title: 'Richiesta Preventivo Inviata',
            message: `Abbiamo inoltrato la tua richiesta a "${brand}". Sarai ricontattato entro 24h.`,
            timestamp: new Date().toISOString(),
            status: 'nuova'
        });
        localStorage.setItem('teraia_notifications_v1', JSON.stringify(notifications));
        alert("Richiesta preventivo inviata!");
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <button onClick={() => navigate('/scadenze')} className="flex items-center text-sm font-black text-text-secondary hover:text-primary uppercase tracking-widest transition-colors">
                <ArrowLeft size={16} className="mr-2"/> Torna alle Scadenze
            </button>

            <div className="bg-gray-900 text-white rounded-[48px] shadow-2xl p-10 relative overflow-hidden">
                <ShieldAlert className="absolute -top-10 -right-10 w-64 h-64 text-white/5" />
                <h1 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3 mb-4">
                    <ShieldCheck className="text-primary" size={32} /> Compara Polizze Mezzi
                </h1>
                <p className="text-sm opacity-70 max-w-xl font-medium leading-relaxed uppercase">
                    Risparmia fino al 25% sulle polizze assicurative grazie alle convenzioni TeraIA con i principali gruppi assicurativi del settore agricolo.
                </p>
            </div>

            <div className="space-y-6">
                {MOCK_INSURANCES.map(ins => (
                    <div key={ins.id} className="bg-white rounded-[40px] p-8 shadow-xl border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-8 group hover:border-primary transition-all">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-2xl font-black text-text-primary uppercase tracking-tighter">{ins.brand}</h3>
                                <div className="flex items-center gap-1 text-yellow-500"><Star size={14} fill="currentColor"/> <span className="text-xs font-black">{ins.rating}</span></div>
                            </div>
                            <p className="text-xs font-bold text-text-secondary uppercase mb-6">{ins.plan}</p>
                            
                            <div className="flex flex-wrap gap-2">
                                {ins.coverage.split(', ').map(c => (
                                    <span key={c} className="px-3 py-1 bg-gray-50 text-text-secondary rounded-full text-[9px] font-black uppercase">{c}</span>
                                ))}
                            </div>
                        </div>

                        <div className="text-center md:text-right w-full md:w-auto">
                            <p className="text-4xl font-black text-text-primary mb-4">{ins.price}</p>
                            {sent.includes(ins.id) ? (
                                <div className="px-10 py-4 bg-green-50 text-green-700 rounded-2xl font-black text-[10px] uppercase text-center flex items-center justify-center gap-2">
                                    <CheckCircle size={16}/> Richiesta Inviata
                                </div>
                            ) : (
                                <button 
                                    onClick={() => handleQuote(ins.id, ins.brand)}
                                    className="px-10 py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-primary-dark transition-all flex items-center justify-center gap-2"
                                >
                                    <MessageSquare size={16}/> Richiedi Preventivo
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AssicurazioniComparePage;
