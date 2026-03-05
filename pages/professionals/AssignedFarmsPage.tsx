
import React, { useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { MapPin, ArrowRight, Building2, CheckCircle, Clock, Search, Filter, ShieldCheck, Database, Users } from 'lucide-react';
import { Role } from '../../types';

const AssignedFarmsPage: React.FC = () => {
    const { currentUser, assignments, farms, setActiveFarm, activeFarm } = useAppContext();

    const myFarms = useMemo(() => {
        if (!currentUser) return [];
        const myAssignmentIds = assignments.filter(as => as.proId === currentUser.id).map(as => as.farmId);
        return farms.filter(f => myAssignmentIds.includes(f.id));
    }, [currentUser, assignments, farms]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-text-primary flex items-center gap-3 uppercase tracking-tighter">
                        <Database className="text-primary" size={36} /> Gestione Clienti
                    </h1>
                    <p className="text-text-secondary text-sm font-medium">Dashboard centrale per il monitoraggio delle aziende assegnate.</p>
                </div>
                <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-2xl font-bold text-xs uppercase flex items-center gap-2">
                    <ShieldCheck size={16}/> Licenza Professionale Attiva
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-[32px] shadow-xl border border-gray-50">
                        <h3 className="text-[10px] font-black uppercase text-text-secondary mb-4 tracking-widest flex items-center gap-2">
                            <Filter size={14}/> Filtra Portafoglio
                        </h3>
                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16}/>
                                <input className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-primary" placeholder="Nome Azienda..."/>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-3 space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                        {myFarms.length > 0 ? myFarms.map(farm => (
                            <div key={farm.id} className={`bg-white rounded-[40px] p-8 shadow-xl border-2 transition-all flex flex-col md:flex-row justify-between items-center gap-6 group hover:shadow-2xl ${activeFarm?.id === farm.id ? 'border-primary' : 'border-gray-50'}`}>
                                <div className="flex items-center gap-6 flex-1">
                                    <div className={`p-6 rounded-[32px] ${activeFarm?.id === farm.id ? 'bg-primary text-white shadow-lg' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200 group-hover:text-gray-600'}`}>
                                        <Building2 size={32}/>
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-text-primary uppercase tracking-tighter group-hover:text-primary transition-colors">{farm.name}</h3>
                                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-bold text-text-secondary uppercase">
                                            <span className="flex items-center gap-1"><MapPin size={14}/> {farm.city} ({farm.province})</span>
                                            <span className="flex items-center gap-1"><Clock size={14}/> Ultimo accesso: 2h fa</span>
                                        </div>
                                        <div className="flex gap-2 mt-4">
                                            {farm.activities.map(act => (
                                                <span key={act} className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-full text-[9px] font-black uppercase text-text-secondary">{act}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="shrink-0">
                                    {activeFarm?.id === farm.id ? (
                                        <div className="flex items-center gap-2 bg-green-50 text-green-700 px-6 py-3 rounded-full font-black text-xs uppercase shadow-sm">
                                            <CheckCircle size={18}/> In Uso
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => setActiveFarm(farm)}
                                            className="px-8 py-4 bg-gray-900 text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl hover:bg-primary transition-all flex items-center justify-center gap-2 group-hover:scale-105"
                                        >
                                            Attiva Azienda <ArrowRight size={18}/>
                                        </button>
                                    )}
                                </div>
                            </div>
                        )) : (
                            <div className="bg-white rounded-[48px] p-20 text-center border-2 border-dashed border-gray-200">
                                <Users size={64} className="text-gray-200 mx-auto mb-6" />
                                <h3 className="text-xl font-black text-gray-400 uppercase">Nessuna azienda assegnata</h3>
                                <p className="text-text-secondary mt-2">Contatta l'amministratore dell'azienda per ricevere l'autorizzazione all'accesso.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssignedFarmsPage;
