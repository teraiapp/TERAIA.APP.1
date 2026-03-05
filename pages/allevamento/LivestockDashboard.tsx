
import React, { useMemo } from 'react';
import { 
    PawPrint, Users, Stethoscope, Wheat, 
    PlusCircle, ArrowRight, BrainCircuit, Activity,
    LayoutGrid, ChevronRight, History, Heart, Tag
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { livestockService } from '../../services/livestockService';
import { quadernoService } from '../../services/quadernoService';

const LivestockDashboard: React.FC = () => {
    const navigate = useNavigate();
    const units = useMemo(() => livestockService.getUnits(), []);
    const groups = useMemo(() => livestockService.getGroups(), []);
    const animals = useMemo(() => livestockService.getAnimals(), []);
    const entries = useMemo(() => quadernoService.getEntries(), []);

    const stats = useMemo(() => {
        const activeAnimals = animals.filter(a => a.status === 'ATTIVO').length;
        const groupAnimals = groups.reduce((acc, g) => acc + (Number(g.headCount) || 0), 0);
        
        const recentSanitary = entries.filter(e => 
            (e.type === 'EVENTO_SANITARIO' || e.type === 'VISITA_VETERINARIA' || e.type === 'VACCINAZIONE') && 
            e.date > Date.now() - 14 * 86400000
        ).length;

        const recentFeeding = entries.filter(e => 
            e.type === 'ALIMENTAZIONE' && e.date > Date.now() - 7 * 86400000
        ).length;

        return {
            units: units.length,
            totalHeads: activeAnimals + groupAnimals,
            sanitaryAlerts: recentSanitary,
            feedingEvents: recentFeeding
        };
    }, [units, groups, animals, entries]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-text-primary flex items-center gap-3 uppercase tracking-tighter">
                        <PawPrint className="text-primary" size={36} /> Hub Allevamento
                    </h1>
                    <p className="text-text-secondary text-sm font-medium">Dashboard di controllo zootecnico e biometrico.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => navigate('/allevamento/unita')} className="px-6 py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all flex items-center gap-2">
                        <PlusCircle size={18}/> Gestisci Unità
                    </button>
                </div>
            </div>

            {/* KPI GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-8 rounded-[40px] shadow-xl border border-gray-100 flex flex-col justify-between">
                    <p className="text-[10px] font-black text-text-secondary uppercase mb-2 tracking-widest">Unità Attive</p>
                    <div className="flex items-center justify-between">
                        <p className="text-4xl font-black text-text-primary">{stats.units}</p>
                        <LayoutGrid className="text-primary/20" size={32}/>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-[40px] shadow-xl border border-gray-100 flex flex-col justify-between">
                    <p className="text-[10px] font-black text-text-secondary uppercase mb-2 tracking-widest">Capi Totali</p>
                    <div className="flex items-center justify-between">
                        <p className="text-4xl font-black text-text-primary">{stats.totalHeads}</p>
                        <Users className="text-blue-500/20" size={32}/>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-[40px] shadow-xl border border-gray-100 flex flex-col justify-between">
                    <p className="text-[10px] font-black text-text-secondary uppercase mb-2 tracking-widest">Alert Sanità</p>
                    <div className="flex items-center justify-between">
                        <p className="text-4xl font-black text-red-600">{stats.sanitaryAlerts}</p>
                        <Stethoscope className="text-red-500/20" size={32}/>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-[40px] shadow-xl border border-gray-100 flex flex-col justify-between">
                    <p className="text-[10px] font-black text-text-secondary uppercase mb-2 tracking-widest">Alimentazione</p>
                    <div className="flex items-center justify-between">
                        <p className="text-4xl font-black text-green-600">{stats.feedingEvents}</p>
                        <Wheat className="text-green-500/20" size={32}/>
                    </div>
                </div>
            </div>

            {/* NAVIGAZIONE MODULARE */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2 px-1">
                        <Activity size={24} className="text-primary"/> Pannello Operativo
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button onClick={() => navigate('/allevamento/unita')} className="p-6 bg-white rounded-[32px] shadow-lg border border-gray-50 flex items-center justify-between group hover:border-primary transition-all">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-primary/5 text-primary rounded-2xl group-hover:scale-110 transition-transform"><LayoutGrid size={24}/></div>
                                <span className="font-black text-sm uppercase tracking-tighter">Unità</span>
                            </div>
                            <ChevronRight size={20} className="text-gray-200 group-hover:text-primary"/>
                        </button>
                        <button onClick={() => navigate('/allevamento/gruppi')} className="p-6 bg-white rounded-[32px] shadow-lg border border-gray-50 flex items-center justify-between group hover:border-blue-500 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform"><Users size={24}/></div>
                                <span className="font-black text-sm uppercase tracking-tighter">Gruppi/Lotti</span>
                            </div>
                            <ChevronRight size={20} className="text-gray-200 group-hover:text-blue-500"/>
                        </button>
                        <button onClick={() => navigate('/allevamento/animali')} className="p-6 bg-white rounded-[32px] shadow-lg border border-gray-50 flex items-center justify-between group hover:border-orange-500 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl group-hover:scale-110 transition-transform"><Tag size={24}/></div>
                                <span className="font-black text-sm uppercase tracking-tighter">Singoli Capi</span>
                            </div>
                            <ChevronRight size={20} className="text-gray-200 group-hover:text-orange-500"/>
                        </button>
                        <button onClick={() => navigate('/allevamento/alimentazione')} className="p-6 bg-white rounded-[32px] shadow-lg border border-gray-50 flex items-center justify-between group hover:border-green-600 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-green-50 text-green-600 rounded-2xl group-hover:scale-110 transition-transform"><Wheat size={24}/></div>
                                <span className="font-black text-sm uppercase tracking-tighter">Alimentazione</span>
                            </div>
                            <ChevronRight size={20} className="text-gray-200 group-hover:text-green-600"/>
                        </button>
                        <button onClick={() => navigate('/allevamento/registro-sanitario')} className="p-6 bg-white rounded-[32px] shadow-lg border border-gray-100 flex items-center justify-between group hover:border-red-500 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-red-50 text-red-600 rounded-2xl group-hover:scale-110 transition-transform"><Stethoscope size={24}/></div>
                                <span className="font-black text-sm uppercase tracking-tighter">Sanità</span>
                            </div>
                            <ChevronRight size={20} className="text-gray-200 group-hover:text-red-500"/>
                        </button>
                        <button onClick={() => navigate('/allevamento/piani-vaccinali')} className="p-6 bg-white rounded-[32px] shadow-lg border border-gray-100 flex items-center justify-between group hover:border-indigo-500 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform"><Activity size={24}/></div>
                                <span className="font-black text-sm uppercase tracking-tighter">Vaccini</span>
                            </div>
                            <ChevronRight size={20} className="text-gray-200 group-hover:text-indigo-500"/>
                        </button>
                    </div>
                </div>

                {/* AI INSIGHT */}
                <div className="bg-gray-900 rounded-[48px] p-10 text-white shadow-2xl relative overflow-hidden group">
                    <BrainCircuit className="absolute -top-10 -right-10 w-64 h-64 opacity-10 group-hover:scale-110 transition-transform duration-1000" />
                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-6">
                                <span className="bg-primary text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase">Allevamento AI</span>
                                <h3 className="text-2xl font-black uppercase tracking-tighter">Monitoraggio Benessere</h3>
                            </div>
                            <p className="text-sm opacity-70 leading-relaxed font-medium mb-8">
                                "Il carico sanitario rilevato nel quaderno è sotto la soglia di allerta. Le somministrazioni alimentari sono regolari. Si consiglia di pianificare i richiami IBR entro la prossima settimana."
                            </p>
                        </div>
                        <button onClick={() => navigate('/ai-previsioni')} className="w-full py-4 bg-white text-gray-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all">
                            Analisi Proiettiva <ArrowRight size={16}/>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LivestockDashboard;
