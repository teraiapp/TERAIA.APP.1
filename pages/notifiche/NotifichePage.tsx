
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Bell, AlertTriangle, CloudRain, Droplets, 
    FileText, Stethoscope, BrainCircuit, Filter, 
    CheckCheck, Trash2, Info 
} from 'lucide-react';
import { useAppContext } from '../../hooks/useAppContext';
import { getNotifications, Notification } from '../../data/notificheData';

type FilterType = 'tutte' | 'nuove' | 'lette';

const severityStyles = {
    critico: {
        icon: AlertTriangle,
        iconColor: 'text-red-500',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-500',
    },
    attenzione: {
        icon: AlertTriangle,
        iconColor: 'text-yellow-500',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-500',
    },
    info: {
        icon: Bell,
        iconColor: 'text-blue-500',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-500',
    },
};

const NotifichePage: React.FC = () => {
    const { currentUser, companyProfile } = useAppContext();
    const navigate = useNavigate();
    
    // Stato locale per gestire la lettura delle notifiche (simulando persistenza)
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [filter, setFilter] = useState<FilterType>('tutte');

    useEffect(() => {
        if (currentUser && companyProfile) {
            const saved = localStorage.getItem(`teraia_notif_status_${currentUser.id}`);
            const baseNotifs = getNotifications(currentUser, companyProfile);
            
            if (saved) {
                const statusMap = JSON.parse(saved);
                setNotifications(baseNotifs.map(n => ({
                    ...n,
                    status: statusMap[n.id] || n.status
                })));
            } else {
                setNotifications(baseNotifs);
            }
        }
    }, [currentUser, companyProfile]);

    const saveStatus = (updated: Notification[]) => {
        if (!currentUser) return;
        const statusMap = updated.reduce((acc, n) => ({ ...acc, [n.id]: n.status }), {});
        localStorage.setItem(`teraia_notif_status_${currentUser.id}`, JSON.stringify(statusMap));
        setNotifications(updated);
    };

    const markAsRead = (id: string) => {
        const updated = notifications.map(n => n.id === id ? { ...n, status: 'lette' as const } : n);
        saveStatus(updated);
    };

    const markAllAsRead = () => {
        const updated = notifications.map(n => ({ ...n, status: 'lette' as const }));
        saveStatus(updated);
    };

    const filteredNotifications = useMemo(() => {
        if (filter === 'tutte') return notifications;
        return notifications.filter(n => n.status === (filter === 'nuove' ? 'nuova' : 'lette'));
    }, [filter, notifications]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-text-primary flex items-center gap-3">
                        <Bell className="text-primary" /> Notifiche Centro Operativo
                    </h1>
                    <p className="text-text-secondary text-sm mt-1">Gestisci gli avvisi di sistema, meteo e AI in tempo reale.</p>
                </div>
                <button 
                    onClick={markAllAsRead}
                    className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-100 rounded-xl font-bold text-xs hover:bg-gray-50 transition-all text-text-primary"
                >
                    <CheckCheck size={14}/> SEGNA TUTTE COME LETTE
                </button>
            </div>

            <div className="bg-surface rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Filter size={16} className="text-text-secondary"/>
                        <div className="flex gap-1">
                            {(['tutte', 'nuove', 'lette'] as FilterType[]).map(f => (
                                <button 
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                                        filter === f ? 'bg-primary text-white shadow-md' : 'text-text-secondary hover:bg-gray-100'
                                    }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                    <span className="text-[10px] font-black text-text-secondary uppercase">
                        {filteredNotifications.length} Messaggi
                    </span>
                </div>

                <div className="divide-y divide-gray-50">
                    {filteredNotifications.length > 0 ? (
                        filteredNotifications.map(n => {
                            const styles = severityStyles[n.severity] || severityStyles.info;
                            return (
                                <div 
                                    key={n.id} 
                                    className={`p-6 flex items-start gap-5 transition-all hover:bg-gray-50/50 relative group ${n.status === 'nuova' ? 'bg-primary/5' : ''}`}
                                >
                                    {n.status === 'nuova' && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary rounded-r-full"></div>
                                    )}
                                    
                                    <div className={`p-3 rounded-2xl ${styles.bgColor} ${styles.iconColor} shrink-0`}>
                                        <n.icon size={24} />
                                    </div>

                                    <div className="flex-grow">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-black text-text-primary text-lg">{n.title}</h3>
                                            <span className="text-[10px] font-bold text-text-secondary uppercase whitespace-nowrap bg-white px-2 py-1 rounded-md border border-gray-100 shadow-sm">
                                                {new Date(n.timestamp).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-text-secondary mt-1 leading-relaxed max-w-3xl">{n.message}</p>
                                        
                                        <div className="flex items-center gap-4 mt-6">
                                            <button 
                                                onClick={() => navigate(n.actionLink)}
                                                className="px-6 py-2 bg-primary text-white text-[10px] font-black rounded-xl uppercase tracking-widest shadow-md hover:bg-primary-dark transition-all"
                                            >
                                                {n.actionText}
                                            </button>
                                            {n.status === 'nuova' && (
                                                <button 
                                                    onClick={() => markAsRead(n.id)}
                                                    className="text-[10px] font-bold text-text-secondary hover:text-primary transition-colors underline uppercase tracking-tighter"
                                                >
                                                    Segna come letta
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-24 text-center">
                            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCheck className="text-gray-300" size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-text-primary">Nessuna notifica qui</h3>
                            <p className="text-text-secondary mt-2">I filtri selezionati non hanno restituito risultati.</p>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                <Info size={20} className="text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800 leading-relaxed">
                    <b>Nota Pro:</b> TeraIA invia avvisi predittivi basati sull'AI con 48h di anticipo. Assicurati che le notifiche push siano attive sul tuo dispositivo mobile per non perdere gli Early Warning.
                </p>
            </div>
        </div>
    );
};

export default NotifichePage;
