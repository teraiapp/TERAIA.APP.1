
import React, { useState, useMemo } from 'react';
import { 
    Users, PlusCircle, Trash2, Edit, X, Save, 
    ArrowLeft, LayoutGrid, Info, ChevronRight, Tag
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { livestockService } from '../../services/livestockService';
import { LivestockGroup, UnitLivestock } from '../../types';

const STAGES = ["LATTE", "INGRASSO", "RIPRODUZIONE", "CRESCITA", "ASCIUTTA", "OVODEPOSIZIONE", "SVEZZAMENTO", "ALTRO"];

const LivestockGroupsPage: React.FC = () => {
    const navigate = useNavigate();
    const units = useMemo(() => livestockService.getUnits(), []);
    const [selectedUnitId, setSelectedUnitId] = useState<string>(units[0]?.id || '');
    const [groups, setGroups] = useState<LivestockGroup[]>(() => livestockService.getGroups());
    const [modal, setModal] = useState<{ show: boolean, data?: LivestockGroup } | null>(null);

    const filteredGroups = useMemo(() => groups.filter(g => g.unitId === selectedUnitId), [groups, selectedUnitId]);

    const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        // Fix: Ensure all required properties of LivestockGroup are provided
        const group: LivestockGroup = {
            id: modal?.data?.id || `g-${Date.now()}`,
            unitId: selectedUnitId,
            name: f.get('name') as string,
            headCount: Number(f.get('headCount')),
            breed: f.get('breed') as string,
            stage: f.get('stage') as string,
            category: f.get('stage') as string, // Map stage to category for now
            trackingMode: 'GROUP', // Default tracking mode for groups
            createdAt: modal?.data?.createdAt || Date.now(),
            updatedAt: Date.now()
        };
        livestockService.saveGroup(group);
        setGroups(livestockService.getGroups());
        setModal(null);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/allevamento')} className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 hover:bg-gray-50"><ArrowLeft size={20}/></button>
                    <h1 className="text-3xl font-black uppercase tracking-tighter">Gestione Gruppi</h1>
                </div>
                {selectedUnitId && (
                    <button onClick={() => setModal({ show: true })} className="px-6 py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase shadow-xl hover:scale-105 transition-all flex items-center gap-2">
                        <PlusCircle size={18}/> Nuovo Gruppo
                    </button>
                )}
            </div>

            {/* SELETTORE UNITA */}
            <div className="bg-white p-6 rounded-[32px] shadow-xl border border-gray-100 flex items-center gap-4">
                <LayoutGrid className="text-primary" size={24}/>
                <div className="flex-1">
                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Seleziona Unità Operativa</label>
                    <select 
                        className="w-full bg-transparent font-black text-xl border-none outline-none focus:ring-0 uppercase tracking-tighter"
                        value={selectedUnitId}
                        onChange={e => setSelectedUnitId(e.target.value)}
                    >
                        {units.length === 0 && <option>Nessuna unità creata</option>}
                        {units.map(u => <option key={u.id} value={u.id}>{u.name} ({u.species})</option>)}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredGroups.map(g => (
                    <div key={g.id} className="bg-white rounded-[40px] p-8 shadow-xl border border-gray-100 flex justify-between items-center group hover:border-blue-500 transition-all">
                        <div className="flex items-center gap-6">
                            <div className="p-5 bg-blue-50 text-blue-600 rounded-3xl"><Users size={28}/></div>
                            <div>
                                <h3 className="text-xl font-black text-text-primary uppercase tracking-tighter leading-none mb-2">{g.name}</h3>
                                <div className="flex flex-wrap gap-2">
                                    <span className="text-[10px] font-black text-text-secondary uppercase">Capi: <b className="text-blue-600">{g.headCount}</b></span>
                                    <span className="text-[10px] font-black text-text-secondary uppercase">Stato: <b className="text-orange-500">{g.stage}</b></span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setModal({ show: true, data: g })} className="p-3 bg-gray-50 text-text-secondary rounded-xl hover:bg-primary/10 hover:text-primary"><Edit size={18}/></button>
                            <button onClick={() => { if(confirm('Eliminare gruppo?')) { livestockService.deleteGroup(g.id); setGroups(livestockService.getGroups()); }}} className="p-3 bg-gray-50 text-text-secondary rounded-xl hover:bg-red-50 hover:text-red-500"><Trash2 size={18}/></button>
                        </div>
                    </div>
                ))}
                {selectedUnitId && filteredGroups.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-gray-50 rounded-[48px] border-2 border-dashed border-gray-200">
                        <p className="text-text-secondary font-black uppercase text-xs">Nessun gruppo in questa unità. Inizia ora.</p>
                    </div>
                )}
            </div>

            {/* MODALE CRUD GROUP */}
            {modal?.show && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <form onSubmit={handleSave} className="bg-white rounded-[40px] shadow-2xl p-10 w-full max-w-xl border-2 border-white animate-in zoom-in">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black uppercase tracking-tighter">Dettaglio Gruppo</h2>
                            <button type="button" onClick={() => setModal(null)} className="p-2 hover:bg-gray-100 rounded-full"><X/></button>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Nome Gruppo / Lotto*</label>
                                <input name="name" required defaultValue={modal.data?.name} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold" placeholder="Es: Vitelli 2024 Lotto A"/>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Numero Capi*</label>
                                    <input name="headCount" type="number" required defaultValue={modal.data?.headCount} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold" placeholder="0"/>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Stato Produttivo</label>
                                    <select name="stage" defaultValue={modal.data?.stage} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold">
                                        {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Razza (opzionale)</label>
                                <input name="breed" defaultValue={modal.data?.breed} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold" placeholder="Es: Limousine, Frisona..."/>
                            </div>
                            <button type="submit" className="w-full py-5 bg-primary text-white rounded-[24px] font-black uppercase shadow-xl hover:scale-105 transition-all">Salva Gruppo</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default LivestockGroupsPage;
