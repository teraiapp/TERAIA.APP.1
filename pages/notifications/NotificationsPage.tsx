
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Bell, AlertTriangle, Info, ShieldAlert, 
    ArrowRight, Check, Trash2, Clock, 
    Database, Filter, CheckCircle
} from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import { AppNotification } from '../../types';

const NotificationsPage: React.FC = () => {
    const navigate = useNavigate();
    const [notifs, setNotifs] = useState<AppNotification[]>([]);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    useEffect(() => {
        refresh();
    }, []);

    const refresh = () => setNotifs(notificationService.getNotifications());

    const filtered = useMemo(() => {
        return notifs.filter(n => filter === 'unread' ? !n.readAtISO : true);
    }, [notifs, filter]);

    const handleAction = (n: AppNotification) => {
        notificationService.markAsRead(n.id);
        if (n.actionRoute) navigate(n.actionRoute);
        refresh();
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-text-primary flex items-center gap-3 uppercase tracking-tighter">
                        <Bell className="text-primary" size={36} /> Centro Notifiche
                    </h1>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setFilter('all')} className={`px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${filter === 'all' ? 'bg-primary text-white shadow-lg' : 'bg-white border'}`}>Tutte</button>
                    <button onClick={() => setFilter('unread')} className={`px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${filter === 'unread' ? 'bg-primary text-white shadow-lg' : 'bg-white border'}`}>Non Lette ({notificationService.getUnreadCount()})</button>
                </div>
            </div>

            <div className="space-y-4">
                {filtered.length > 0 ? filtered.map(n => (
                    <div 
                        key={n.id} 
                        className={`bg-white rounded-[32px] p-6 shadow-xl border-l-[12px] flex flex-col md:flex-row justify-between items-center gap-6 group hover:shadow-2xl transition-all ${
                            n.severity === 'critical' ? 'border-red-500' : n.severity === 'warning' ? 'border-orange-500' : 'border-blue-500'
                        } ${n.readAtISO ? 'opacity-60' : ''}`}
                    >
                        <div className="flex items-start gap-6 flex-1">
                            <div className={`p-4 rounded-2xl ${
                                n.severity === 'critical' ? 'bg-red-50 text-red-500' : 
                                n.severity === 'warning' ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-blue-500'
                            }`}>
                                {n.severity === 'critical' ? <ShieldAlert size={32}/> : n.severity === 'warning' ? <AlertTriangle size={32}/> : <Info size={32}/>}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[9px] font-black bg-gray-100 text-text-secondary px-2 py-0.5 rounded uppercase">{n.type.replace('_', ' ')}</span>
                                    <span className="text-[10px] font-bold text-text-secondary uppercase">{new Date(n.createdAtISO).toLocaleString()}</span>
                                </div>
                                <h3 className="text-xl font-black text-text-primary uppercase tracking-tighter leading-tight">{n.title}</h3>
                                <p className="text-sm text-text-secondary mt-1 font-medium italic">"{n.message}"</p>
                            </div>
                        </div>

                        <div className="flex gap-2 shrink-0">
                            {n.actionRoute && (
                                <button onClick={() => handleAction(n)} className="px-6 py-3 bg-gray-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black shadow-lg flex items-center gap-2">
                                    {n.actionLabel || 'Apri'} <ArrowRight size={14}/>
                                </button>
                            )}
                            {!n.readAtISO && (
                                <button onClick={() => { notificationService.markAsRead(n.id); refresh(); }} className="p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-100"><Check size={20}/></button>
                            )}
                        </div>
                    </div>
                )) : (
                    <div className="py-32 text-center bg-white rounded-[48px] border-2 border-dashed border-gray-200">
                        <CheckCircle size={64} className="mx-auto text-gray-200 mb-6"/>
                        <h3 className="text-xl font-black text-gray-400 uppercase tracking-tighter">Nessun Alert Attivo</h3>
                        <p className="text-text-secondary font-medium">È tutto tranquillo. Ben fatto!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
