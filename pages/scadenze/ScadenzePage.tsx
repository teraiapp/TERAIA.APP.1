
import React, { useState, useEffect, useMemo } from 'react';
import { 
    Calendar, AlertTriangle, CheckCircle, Clock, 
    Filter, Search, ArrowRight, ShieldCheck, 
    FileText, PlusCircle, History, Info, ChevronRight,
    Tractor, Syringe, GraduationCap, ShieldAlert
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../hooks/useAppContext';
import { Deadline, DeadlineType, DeadlineStatus } from '../../types';
import { INITIAL_DEADLINES } from '../../data/deadlinesData';
import { getDaysRemaining, getDeadlineSeverity, syncDeadlinesWithNotifications } from '../../utils/deadlineEngine';

const ScadenzePage: React.FC = () => {
    const navigate = useNavigate();
    const [deadlines, setDeadlines] = useState<Deadline[]>(() => {
        const saved = localStorage.getItem('teraia_deadlines_v1');
        return saved ? JSON.parse(saved) : INITIAL_DEADLINES;
    });

    // Filtri
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        localStorage.setItem('teraia_deadlines_v1', JSON.stringify(deadlines));
        syncDeadlinesWithNotifications(deadlines);
    }, [deadlines]);

    const filteredDeadlines = useMemo(() => {
        return deadlines.filter(d => {
            const mStatus = filterStatus === 'all' || d.status === filterStatus;
            const mSearch = !searchTerm || d.title.toLowerCase().includes(searchTerm.toLowerCase());
            return mStatus && mSearch;
        }).sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    }, [deadlines, filterStatus, searchTerm]);

    const getIcon = (type: DeadlineType) => {
        switch(type) {
            case 'patentino_fitosanitario': return GraduationCap;
            case 'assicurazione_mezzo': return ShieldCheck;
            case 'revisione_mezzo': return Tractor;
            case 'vaccinazione_allevamento': return Syringe;
            default: return FileText;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-text-primary flex items-center gap-3 uppercase tracking-tighter">
                        <Clock className="text-primary" size={36} /> Scadenze & Rinnovi
                    </h1>
                    <p className="text-text-secondary text-sm font-medium">Monitoraggio adempimenti legali, tecnici e sanitari.</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-black transition-all">
                    <PlusCircle size={18}/> Nuova Scadenza
                </button>
            </div>

            {/* FILTRI */}
            <div className="bg-white p-6 rounded-[32px] shadow-xl border border-gray-50 flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                    <label className="text-[10px] font-black uppercase text-text-secondary mb-1 block ml-1">Cerca Scadenza</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18}/>
                        <input 
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Es: Patentino..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="w-full md:w-48">
                    <label className="text-[10px] font-black uppercase text-text-secondary mb-1 block ml-1">Stato</label>
                    <select 
                        className="w-full p-3 bg-gray-50 border-none rounded-xl font-bold text-sm outline-none"
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                    >
                        <option value="all">Tutti</option>
                        <option value="attiva">Attiva</option>
                        <option value="scaduta">Scaduta</option>
                        <option value="rinnovata">Rinnovata</option>
                    </select>
                </div>
            </div>

            {/* GRID SCADENZE */}
            <div className="grid grid-cols-1 gap-4">
                {filteredDeadlines.map(d => {
                    const days = getDaysRemaining(d.dueDate);
                    const severity = getDeadlineSeverity(d);
                    const Icon = getIcon(d.type);

                    return (
                        <div 
                            key={d.id} 
                            className={`bg-white rounded-[32px] p-6 shadow-lg border-l-[12px] flex flex-col md:flex-row justify-between items-center gap-6 hover:shadow-2xl transition-all ${
                                severity === 'critical' ? 'border-red-500' : severity === 'warning' ? 'border-yellow-500' : 'border-primary'
                            }`}
                        >
                            <div className="flex items-center gap-6 flex-1 w-full">
                                <div className={`p-5 rounded-[24px] ${
                                    severity === 'critical' ? 'bg-red-50 text-red-600' : severity === 'warning' ? 'bg-yellow-50 text-yellow-600' : 'bg-primary/10 text-primary'
                                }`}>
                                    <Icon size={32}/>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter ${
                                            severity === 'critical' ? 'bg-red-600 text-white' : severity === 'warning' ? 'bg-yellow-400 text-text-primary' : 'bg-green-500 text-white'
                                        }`}>
                                            {severity === 'critical' ? 'SCADUTA' : severity === 'warning' ? 'IN SCADENZA' : 'REGOLARE'}
                                        </span>
                                        <span className="text-[10px] font-bold text-text-secondary uppercase">{d.type.replace('_', ' ')}</span>
                                    </div>
                                    <h3 className="text-xl font-black text-text-primary uppercase tracking-tighter leading-none">{d.title}</h3>
                                    <p className="text-xs text-text-secondary mt-1 font-medium">{d.description}</p>
                                </div>
                            </div>

                            <div className="flex flex-col items-center md:items-end gap-2 w-full md:w-auto">
                                <p className="text-[10px] font-black uppercase text-text-secondary">Scadenza: {new Date(d.dueDate).toLocaleDateString()}</p>
                                <p className={`text-xl font-black ${days < 0 ? 'text-red-600' : days <= 30 ? 'text-yellow-600' : 'text-primary'}`}>
                                    {days < 0 ? `Scaduta da ${Math.abs(days)}gg` : `Tra ${days} giorni`}
                                </p>
                                <button 
                                    onClick={() => navigate(`/scadenze/${d.id}`)}
                                    className="px-6 py-2 bg-gray-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary transition-all flex items-center gap-2"
                                >
                                    Dettagli & Azioni <ArrowRight size={14}/>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="p-6 bg-blue-50 rounded-[40px] border border-blue-100 flex items-start gap-4">
                <Info className="text-blue-600 shrink-0" size={24}/>
                <div>
                    <h4 className="text-xs font-black uppercase text-blue-900 tracking-tight">Compliance & Notifiche</h4>
                    <p className="text-[11px] text-blue-800 font-medium leading-relaxed mt-1 uppercase">
                        TeraIA scansiona automaticamente gli adempimenti ogni 24h. Le scadenze marcate come "Rinnovate" verranno archiviate nello storico dopo 30 giorni per fare spazio ai nuovi cicli.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ScadenzePage;
