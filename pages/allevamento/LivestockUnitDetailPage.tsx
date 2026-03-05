
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, PawPrint, Milk, Wheat, Stethoscope, Clock, 
    MapPin, LayoutGrid, ChevronRight, Activity, Tag, PlusCircle
} from 'lucide-react';
import { livestockService } from '../../services/livestockService';
import { quadernoService } from '../../services/quadernoService';
import { LivestockUnit, Role } from '../../types';

const LivestockUnitDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [unit, setUnit] = useState<LivestockUnit | null>(null);
    const [activeTab, setActiveTab] = useState<'popolazione' | 'produzione' | 'alimentazione' | 'sanita'>('popolazione');

    const entries = useMemo(() => quadernoService.getEntries().filter(e => e.unitId === id), [id]);
    const groups = useMemo(() => livestockService.getGroups(id), [id]);
    const animals = useMemo(() => livestockService.getAnimals().filter(a => a.unitId === id), [id]);

    useEffect(() => {
        const u = livestockService.getUnits().find(x => x.id === id);
        if (u) setUnit(u);
        else navigate('/allevamento');
    }, [id]);

    if (!unit) return null;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* TOP BAR */}
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/allevamento')} className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 shadow-sm text-text-secondary"><ArrowLeft size={20}/></button>
                <div>
                    <h1 className="text-3xl font-black text-text-primary uppercase tracking-tighter leading-none">{unit.name}</h1>
                    <p className="text-[10px] font-bold text-text-secondary uppercase mt-2">{unit.species} • {unit.location.city}</p>
                </div>
            </div>

            {/* TAB SELECTOR */}
            <div className="flex p-1 bg-gray-100 rounded-[24px] w-fit shadow-inner">
                {[
                    { id: 'popolazione', label: 'Popolazione', icon: Users },
                    { id: 'produzione', label: 'Produzione', icon: Milk },
                    { id: 'alimentazione', label: 'Alimentazione', icon: Wheat },
                    { id: 'sanita', label: 'Sanità', icon: Stethoscope }
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-[20px] font-black text-xs uppercase tracking-widest transition-all ${
                            activeTab === tab.id ? 'bg-white text-primary shadow-md' : 'text-text-secondary hover:text-text-primary'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* TAB CONTENT */}
            <div className="bg-white rounded-[40px] shadow-xl border border-gray-100 overflow-hidden min-h-[400px]">
                {activeTab === 'popolazione' && (
                    <div className="p-8 space-y-8">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-black uppercase tracking-tight">Gruppi e Capi Individuali</h3>
                            <button onClick={() => navigate('/allevamento/gruppi')} className="text-[10px] font-black text-primary uppercase underline">Gestisci Popolazione</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {groups.map(g => (
                                <div key={g.id} className="p-4 bg-gray-50 rounded-3xl border border-gray-100 flex justify-between items-center">
                                    <div>
                                        <p className="font-black text-sm uppercase">{g.name}</p>
                                        <p className="text-[10px] text-text-secondary font-bold uppercase">{g.headCount} Capi • {g.category}</p>
                                    </div>
                                    <Tag className="text-blue-500 opacity-20" size={24}/>
                                </div>
                            ))}
                            {animals.map(a => (
                                <div key={a.id} className="p-4 bg-gray-50 rounded-3xl border border-gray-100 flex justify-between items-center">
                                    <div>
                                        <p className="font-black text-sm uppercase">{a.tagId}</p>
                                        <p className="text-[10px] text-text-secondary font-bold uppercase">{a.status}</p>
                                    </div>
                                    <Tag className="text-primary opacity-20" size={24}/>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'produzione' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b text-text-secondary uppercase text-[10px] font-black">
                                <tr>
                                    <th className="p-6">Data</th>
                                    <th className="p-6">Tipo</th>
                                    <th className="p-6">Quantità</th>
                                    <th className="p-6">Note</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {entries.filter(e => e.type === 'PRODUZIONE_ALLEVAMENTO').map(e => (
                                    <tr key={e.id}>
                                        <td className="p-6 font-bold">{new Date(e.date).toLocaleDateString()}</td>
                                        <td className="p-6 font-black text-primary uppercase text-[10px]">Produzione</td>
                                        <td className="p-6 font-black">{e.notes?.split(':')[1] || '-'}</td>
                                        <td className="p-6 text-text-secondary italic">{e.notes?.split('.')[0] || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'alimentazione' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b text-text-secondary uppercase text-[10px] font-black">
                                <tr>
                                    <th className="p-6">Data</th>
                                    <th className="p-6">Costo</th>
                                    <th className="p-6">Note</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {entries.filter(e => e.type === 'ALIMENTAZIONE_ALLEVAMENTO').map(e => (
                                    <tr key={e.id}>
                                        <td className="p-6 font-bold">{new Date(e.date).toLocaleDateString()}</td>
                                        <td className="p-6 font-black text-green-600">€ {e.cost?.toFixed(2)}</td>
                                        <td className="p-6 text-text-secondary italic">{e.notes}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'sanita' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b text-text-secondary uppercase text-[10px] font-black">
                                <tr>
                                    <th className="p-6">Data</th>
                                    <th className="p-6">Tipo</th>
                                    <th className="p-6">Descrizione</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {entries.filter(e => ['VISITA_VETERINARIA', 'SANITA_ALLEVAMENTO', 'VACCINAZIONE'].includes(e.type)).map(e => (
                                    <tr key={e.id}>
                                        <td className="p-6 font-bold">{new Date(e.date).toLocaleDateString()}</td>
                                        <td className="p-6 font-black text-red-600 uppercase text-[10px]">{e.type.replace('_', ' ')}</td>
                                        <td className="p-6 text-text-secondary font-medium">{e.notes}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

const Users: React.FC<{size?: number, className?: string}> = ({size = 24, className}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
);

export default LivestockUnitDetailPage;
