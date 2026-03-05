
import React, { useState, useEffect } from 'react';
import { LivestockUnit, LivestockWelfareEntry } from '../../../types';
import { livestockStorage, generateId } from '../../../services/livestockStorage';
import { PlusCircle, Heart, Trash2, Edit, X, Save, Wind, Activity } from 'lucide-react';

const STRESS_SIGNALS = ['tosse', 'zoppia', 'aggressività', 'apatia', 'inappetenza', 'altro'];

interface Props { unit: LivestockUnit; }

const LivestockWelfarePage: React.FC<Props> = ({ unit }) => {
    const [entries, setEntries] = useState<LivestockWelfareEntry[]>([]);
    const [modal, setModal] = useState<{ show: boolean, data?: LivestockWelfareEntry } | null>(null);

    useEffect(() => {
        setEntries(livestockStorage.getWelfare(unit.id));
    }, [unit.id]);

    const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const selectedSignals = STRESS_SIGNALS.filter(s => f.get(`signal_${s}`) === 'on');

        const entry: LivestockWelfareEntry = {
            id: modal?.data?.id || generateId(),
            unitId: unit.id,
            date: f.get('date') as string,
            beddingType: f.get('beddingType') as string,
            ventilation: f.get('ventilation') as any,
            cleanlinessScore: Number(f.get('cleanlinessScore')) as any,
            stressSignals: selectedSignals,
            notes: f.get('notes') as string
        };
        livestockStorage.saveWelfare(entry);
        setEntries(livestockStorage.getWelfare(unit.id));
        setModal(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                    <Heart size={20} className="text-red-500"/> Audit Benessere
                </h3>
                <button onClick={() => setModal({ show: true })} className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md hover:bg-red-600">
                    <PlusCircle size={16}/> Nuovo Controllo
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {entries.length > 0 ? entries.sort((a,b)=>b.date.localeCompare(a.date)).map(e => (
                    <div key={e.id} className="bg-white rounded-[32px] p-6 shadow-xl border border-gray-100 flex flex-col justify-between group relative overflow-hidden">
                        <div className="absolute -top-4 -right-4 w-24 h-24 bg-red-50 rounded-full flex items-center justify-center text-red-100 group-hover:scale-125 transition-transform"><Activity size={48}/></div>
                        <div className="relative z-10 space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-black uppercase text-text-secondary tracking-widest">{new Date(e.date).toLocaleDateString()}</p>
                                    <h4 className="text-lg font-black uppercase tracking-tighter">Livello Pulizia: {e.cleanlinessScore}/5</h4>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => setModal({ show: true, data: e })} className="p-2 bg-gray-50 text-text-secondary rounded-lg hover:bg-red-50 hover:text-red-500"><Edit size={14}/></button>
                                    <button onClick={() => { if(window.confirm('Eliminare?')) { livestockStorage.deleteWelfare(e.id); setEntries(livestockStorage.getWelfare(unit.id)); }}} className="p-2 bg-gray-50 text-text-secondary rounded-lg hover:bg-red-50 hover:text-red-500"><Trash2 size={14}/></button>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-2 py-0.5 bg-gray-100 text-[9px] font-bold uppercase rounded-md flex items-center gap-1"><Wind size={10}/> Vent: {e.ventilation}</span>
                                <span className="px-2 py-0.5 bg-gray-100 text-[9px] font-bold uppercase rounded-md">Lettiera: {e.beddingType}</span>
                            </div>
                            {e.stressSignals && e.stressSignals.length > 0 && (
                                <div className="space-y-1">
                                    <p className="text-[8px] font-black text-red-600 uppercase">Segnali di Stress:</p>
                                    <div className="flex flex-wrap gap-1">
                                        {e.stressSignals.map(s => <span key={s} className="px-2 py-0.5 bg-red-100 text-red-700 text-[8px] font-black uppercase rounded-md">{s}</span>)}
                                    </div>
                                </div>
                            )}
                            <p className="text-xs text-text-secondary italic">"{e.notes || 'Nessuna nota aggiuntiva'}"</p>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full py-10 text-center text-text-secondary italic">Nessun controllo benessere registrato.</div>
                )}
            </div>

            {modal?.show && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[40px] shadow-2xl p-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto border-2 border-white">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black uppercase tracking-tighter text-red-600">Audit Benessere</h2>
                            <button onClick={() => setModal(null)} className="p-2 hover:bg-gray-100 rounded-full"><X/></button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Data Audit*</label>
                                    <input name="date" type="date" required defaultValue={modal.data?.date || new Date().toISOString().split('T')[0]} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold"/>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Score Pulizia (1-5)</label>
                                    <select name="cleanlinessScore" defaultValue={modal.data?.cleanlinessScore || 5} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold">
                                        {[1,2,3,4,5].map(v => <option key={v} value={v}>{v} Stars</option>)}
                                    </select>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Ventilazione</label>
                                    <select name="ventilation" defaultValue={modal.data?.ventilation || 'automatica'} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold">
                                        <option value="automatica">Automatica</option>
                                        <option value="manuale">Manuale</option>
                                        <option value="assente">Assente</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Tipo Lettiera</label>
                                    <input name="beddingType" defaultValue={modal.data?.beddingType} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold" placeholder="Es: Paglia, Segatura..."/>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-text-secondary ml-1 block">Segnali di Stress / Anomalie</label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-4 bg-gray-50 rounded-2xl">
                                    {STRESS_SIGNALS.map(s => (
                                        <label key={s} className="flex items-center gap-2 cursor-pointer p-1">
                                            <input type="checkbox" name={`signal_${s}`} defaultChecked={modal.data?.stressSignals?.includes(s)} className="w-5 h-5 accent-red-500 rounded-lg"/>
                                            <span className="text-[10px] font-bold uppercase text-text-primary">{s}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Note Osservazione</label>
                                <textarea name="notes" defaultValue={modal.data?.notes} rows={2} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold text-sm" placeholder="Aggiungi dettagli sulle anomalie riscontrate..."/>
                            </div>

                            <button type="submit" className="w-full py-5 bg-red-500 text-white rounded-[24px] font-black uppercase text-xs tracking-widest shadow-xl">Salva Audit</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LivestockWelfarePage;
