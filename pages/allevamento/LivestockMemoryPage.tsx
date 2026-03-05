
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, ArrowLeft, Filter, MapPin, Tag, Stethoscope, Heart, Clock } from 'lucide-react';
import { livestockStorage } from '../../services/livestockStorage';

const LivestockMemoryPage: React.FC = () => {
    const navigate = useNavigate();
    const [selectedUnit, setSelectedUnit] = useState<string>('all');
    
    const units = useMemo(() => livestockStorage.getUnits(), []);
    const health = useMemo(() => livestockStorage.getHealth(), []);
    const welfare = useMemo(() => livestockStorage.getWelfare(), []);
    const deadlines = useMemo(() => livestockStorage.getDeadlines().filter(d => d.status === 'completata'), []);

    const timeline = useMemo(() => {
        const events: any[] = [
            ...health.map(h => ({ ...h, eventLabel: 'Sanità', icon: Stethoscope, color: 'text-blue-500', bg: 'bg-blue-50' })),
            ...welfare.filter(w => (w.stressSignals?.length || 0) > 0).map(w => ({ ...w, eventLabel: 'Benessere (Stress)', icon: Heart, color: 'text-red-500', bg: 'bg-red-50', description: `Rilevati: ${w.stressSignals?.join(', ')}` })),
            ...deadlines.map(d => ({ ...d, date: d.dueDate, eventLabel: 'Scadenza Chiusa', icon: Clock, color: 'text-green-500', bg: 'bg-green-50', description: d.title }))
        ];

        return events
            .filter(e => selectedUnit === 'all' || e.unitId === selectedUnit)
            .sort((a,b) => b.date.localeCompare(a.date));
    }, [health, welfare, deadlines, selectedUnit]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/allevamento')} className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 shadow-sm text-text-secondary"><ArrowLeft size={20}/></button>
                    <h1 className="text-3xl font-black text-text-primary uppercase tracking-tighter flex items-center gap-3">
                        <History className="text-primary"/> Memoria Aziendale
                    </h1>
                </div>
                <div className="w-48">
                    <select 
                        className="w-full p-3 bg-white border border-gray-100 rounded-xl font-bold text-xs uppercase outline-none focus:ring-2 focus:ring-primary"
                        value={selectedUnit}
                        onChange={e => setSelectedUnit(e.target.value)}
                    >
                        <option value="all">Tutte le Unità</option>
                        {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                </div>
            </div>

            <div className="relative border-l-4 border-gray-100 ml-6 space-y-12 pb-10">
                {timeline.length > 0 ? timeline.map((e, idx) => (
                    <div key={e.id + idx} className="relative pl-12 animate-in slide-in-from-left duration-300">
                        <div className={`absolute -left-[22px] top-0 p-3 rounded-2xl shadow-lg border-2 border-white ${e.bg} ${e.color}`}>
                            <e.icon size={20}/>
                        </div>
                        <div className="bg-white rounded-[32px] p-6 shadow-xl border border-gray-50 hover:shadow-2xl transition-all">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] font-black uppercase text-text-secondary tracking-widest">{new Date(e.date).toLocaleDateString()}</span>
                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-lg ${e.bg} ${e.color}`}>{e.eventLabel}</span>
                            </div>
                            <h3 className="text-lg font-black text-text-primary uppercase tracking-tighter mb-1">
                                {e.description || e.eventType || 'Evento'}
                            </h3>
                            <p className="text-[10px] font-bold text-text-secondary uppercase flex items-center gap-1 mb-4"><MapPin size={10}/> {units.find(u=>u.id===e.unitId)?.name}</p>
                            <p className="text-sm text-text-secondary italic font-medium leading-relaxed">"{e.notes || 'Nessun dettaglio aggiuntivo'}"</p>
                        </div>
                    </div>
                )) : (
                    <div className="pl-12 py-20 text-text-secondary italic">Nessun evento rilevante registrato nella timeline.</div>
                )}
            </div>
        </div>
    );
};

export default LivestockMemoryPage;
