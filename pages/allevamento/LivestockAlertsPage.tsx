
import React, { useState, useMemo, useEffect } from 'react';
import { 
    ShieldAlert, AlertTriangle, CheckCircle, ArrowLeft, 
    Zap, Globe, Info, Clock, ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { livestockService } from '../../services/livestockService';
import { useAppContext } from '../../hooks/useAppContext';
import { LivestockAlert } from '../../types';

const LivestockAlertsPage: React.FC = () => {
    const navigate = useNavigate();
    const { companyProfile } = useAppContext();
    const [alerts, setAlerts] = useState<LivestockAlert[]>([]);

    useEffect(() => {
        setAlerts(livestockService.getAlerts());
    }, []);

    const handleRead = (id: string) => {
        livestockService.markAlertRead(id);
        setAlerts(livestockService.getAlerts());
    };

    return (
        <div className="space-y-8 animate-in fade-in pb-20">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/allevamento')} className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-all"><ArrowLeft size={20}/></button>
                    <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">Security Intelligence</h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2 px-1">
                        <AlertTriangle size={24} className="text-orange-500"/> Notifiche di Rischio Biologico
                    </h2>
                    
                    {alerts.map(a => (
                        <div key={a.id} className={`bg-white rounded-[40px] p-8 shadow-xl border-l-[12px] flex flex-col md:flex-row justify-between items-center gap-8 group transition-all ${a.read ? 'border-gray-200 opacity-60' : a.severity === 'high' ? 'border-red-500' : 'border-orange-500'}`}>
                            <div className="flex-1 space-y-4">
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${a.severity === 'high' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>{a.scope} ALERT</span>
                                    <span className="text-[10px] font-bold text-text-secondary uppercase">{new Date(a.date).toLocaleDateString()} • {a.source}</span>
                                </div>
                                <h3 className="text-2xl font-black text-text-primary uppercase tracking-tighter leading-tight">{a.message}</h3>
                                <div className="flex items-center gap-2 text-xs font-bold text-text-secondary uppercase">
                                    <Globe size={14} className="text-primary"/> Regione: {a.region || 'Tutte'}
                                </div>
                            </div>
                            <div className="shrink-0">
                                {!a.read ? (
                                    <button onClick={() => handleRead(a.id)} className="p-4 bg-gray-900 text-white rounded-2xl hover:bg-primary transition-all shadow-lg"><CheckCircle/></button>
                                ) : (
                                    <span className="text-[10px] font-black text-green-600 uppercase">Letto</span>
                                )}
                            </div>
                        </div>
                    ))}

                    {alerts.length === 0 && (
                        <div className="py-20 text-center bg-gray-50 rounded-[48px] border-2 border-dashed border-gray-200">
                            <ShieldAlert size={64} className="mx-auto text-gray-200 mb-4"/>
                            <p className="text-text-secondary font-black uppercase text-xs">Nessun alert sanitario attivo per la tua area.</p>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="bg-gray-900 text-white p-10 rounded-[40px] shadow-2xl relative overflow-hidden">
                        <Zap className="absolute -top-4 -right-4 w-40 h-40 text-white/5" />
                        <h3 className="text-xl font-black uppercase tracking-tighter mb-4 relative z-10">Sorveglianza AI</h3>
                        <p className="text-xs opacity-70 leading-relaxed mb-10 relative z-10">TeraIA monitora in tempo reale i bollettini veterinari regionali e nazionali, incrociandoli con la tua posizione aziendale per darti un vantaggio di 48-72h sulle misure di contenimento.</p>
                        <div className="p-6 bg-white/10 rounded-3xl border border-white/5 text-[10px] font-black uppercase tracking-widest flex items-center justify-between">
                            <span>Status Sistema:</span>
                            <span className="text-primary">Attivo</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LivestockAlertsPage;
