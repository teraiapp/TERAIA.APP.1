
import React, { useState, useEffect } from 'react';
import { LivestockUnit, LivestockDeadline } from '../../../types';
import { livestockStorage, generateId } from '../../../services/livestockStorage';
import { PlusCircle, Clock, Trash2, Edit, X, Save, CheckCircle, AlertTriangle } from 'lucide-react';

interface Props { unit: LivestockUnit; isVet?: boolean; }

const LivestockDeadlinesPage: React.FC<Props> = ({ unit, isVet }) => {
    const [entries, setEntries] = useState<LivestockDeadline[]>([]);
    const [modal, setModal] = useState<{ show: boolean, data?: LivestockDeadline } | null>(null);

    useEffect(() => {
        setEntries(livestockStorage.getDeadlines(unit.id));
    }, [unit.id]);

    const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const entry: LivestockDeadline = {
            id: modal?.data?.id || generateId(),
            unitId: unit.id,
            dueDate: f.get('dueDate') as string,
            title: f.get('title') as string,
            status: (f.get('status') || 'da_fare') as any,
            createdAt: modal?.data?.createdAt || new Date().toISOString()
        };
        livestockStorage.saveDeadline(entry);
        setEntries(livestockStorage.getDeadlines(unit.id));
        setModal(null);
    };

    const toggleStatus = (id: string) => {
        const entry = entries.find(e => e.id === id);
        if (entry) {
            const updated = { ...entry, status: entry.status === 'da_fare' ? 'completata' : 'da_fare' } as LivestockDeadline;
            livestockStorage.saveDeadline(updated);
            setEntries(livestockStorage.getDeadlines(unit.id));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                    <Clock size={20} className="text-purple-500"/> Scadenziario Unità
                </h3>
                <button onClick={() => setModal({ show: true })} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md hover:bg-purple-700">
                    <PlusCircle size={16}/> Nuova Scadenza
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {entries.length > 0 ? entries.sort((a,b)=>a.dueDate.localeCompare(b.dueDate)).map(e => {
                    const isOverdue = new Date(e.dueDate) < new Date() && e.status === 'da_fare';
                    return (
                        <div key={e.id} className={`bg-white rounded-[32px] p-6 shadow-xl border-2 transition-all ${e.status === 'completata' ? 'border-green-100 opacity-70' : isOverdue ? 'border-red-500 bg-red-50' : 'border-gray-50'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-2xl ${e.status === 'completata' ? 'bg-green-50 text-green-600' : isOverdue ? 'bg-red-500 text-white' : 'bg-gray-100 text-text-secondary'}`}>
                                    <Clock size={20}/>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => setModal({ show: true, data: e })} className="p-2 text-text-secondary hover:text-primary"><Edit size={14}/></button>
                                    <button onClick={() => { if(window.confirm('Eliminare?')) { livestockStorage.deleteDeadline(e.id); setEntries(livestockStorage.getDeadlines(unit.id)); }}} className="p-2 text-text-secondary hover:text-red-500"><Trash2 size={14}/></button>
                                </div>
                            </div>
                            <h4 className={`font-black uppercase tracking-tighter leading-tight ${e.status === 'completata' ? 'line-through' : ''}`}>{e.title}</h4>
                            <p className={`text-[10px] font-black mt-1 uppercase ${isOverdue ? 'text-red-600' : 'text-text-secondary'}`}>
                                Entro il: {new Date(e.dueDate).toLocaleDateString()}
                                {isOverdue && ' (SCADUTA)'}
                            </p>
                            <button 
                                onClick={() => toggleStatus(e.id)}
                                className={`w-full mt-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${e.status === 'completata' ? 'bg-green-500 text-white shadow-inner' : 'bg-white border border-gray-200 text-text-secondary hover:bg-green-50 hover:text-green-600'}`}
                            >
                                {e.status === 'completata' ? 'Completata' : 'Segna come Fatta'}
                            </button>
                        </div>
                    );
                }) : (
                    <div className="col-span-full py-10 text-center text-text-secondary italic">Nessuna scadenza impostata.</div>
                )}
            </div>

            {modal?.show && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[40px] shadow-2xl p-10 w-full max-w-md border-2 border-white">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black uppercase tracking-tighter">Nuovo Adempimento</h2>
                            <button onClick={() => setModal(null)} className="p-2 hover:bg-gray-100 rounded-full"><X/></button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Titolo Scadenza*</label>
                                <input name="title" required defaultValue={modal.data?.title} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold" placeholder="Es: Pulizia filtri, Richiamo vaccino..."/>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Data Scadenza*</label>
                                <input name="dueDate" type="date" required defaultValue={modal.data?.dueDate || new Date().toISOString().split('T')[0]} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold"/>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Stato</label>
                                <select name="status" defaultValue={modal.data?.status || 'da_fare'} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold">
                                    <option value="da_fare">Da fare</option>
                                    <option value="completata">Completata</option>
                                </select>
                            </div>
                            <button type="submit" className="w-full py-5 bg-purple-600 text-white rounded-[24px] font-black uppercase text-xs tracking-widest shadow-xl">Salva Scadenza</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LivestockDeadlinesPage;
