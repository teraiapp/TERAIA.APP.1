
import React, { useState, useMemo, useEffect } from 'react';
import { 
    Stethoscope, PlusCircle, ArrowLeft, History, 
    X, Save, ShieldAlert, Activity, LayoutGrid, Search, Trash2, Edit
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { livestockService } from '../../services/livestockService';
import { inventoryService } from '../../services/inventoryService';
import { LivestockUnit, LivestockHealthEvent, InventoryItem } from '../../types';

const CATEGORIES = ["MALATTIA", "SINTOMO", "TRATTAMENTO", "FERITA", "VISITA", "ALLERTA"];

const LivestockSanitaryPage: React.FC = () => {
    const navigate = useNavigate();
    const [units] = useState<LivestockUnit[]>(() => livestockService.getUnits());
    const [selectedUnitId, setSelectedUnitId] = useState<string>(units[0]?.id || '');
    const [events, setEvents] = useState<LivestockHealthEvent[]>([]);
    const [inventory] = useState<InventoryItem[]>(() => inventoryService.getItems());
    const [modal, setModal] = useState(false);

    useEffect(() => {
        setEvents(livestockService.getHealthEvents(selectedUnitId));
    }, [selectedUnitId]);

    const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const newEvt: LivestockHealthEvent = {
            id: `he-${Date.now()}`,
            unitId: selectedUnitId,
            date: Date.now(),
            category: f.get('category') as any,
            title: f.get('title') as string,
            description: f.get('description') as string,
            productName: f.get('productName') as string,
            withdrawalDays: Number(f.get('withdrawal')) || 0,
            outcome: f.get('outcome') as string
        };

        livestockService.addHealthEvent(newEvt);
        setEvents(livestockService.getHealthEvents(selectedUnitId));
        setModal(false);
        alert("Evento sanitario salvato e sincronizzato nel Quaderno!");
    };

    return (
        <div className="space-y-8 animate-in fade-in pb-20">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/allevamento')} className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-all"><ArrowLeft size={20}/></button>
                    <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">Timeline Sanitaria</h1>
                </div>
                <button onClick={() => setModal(true)} className="px-6 py-3 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-red-700 transition-all flex items-center gap-2">
                    <PlusCircle size={18}/> Registra Intervento
                </button>
            </div>

            {/* SELETTORE UNITA */}
            <div className="bg-white p-6 rounded-[32px] shadow-xl border border-gray-100 flex items-center gap-4">
                <LayoutGrid className="text-red-600" size={24}/>
                <div className="flex-1">
                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1 tracking-widest">Unità Sotto Esame</label>
                    <select className="w-full bg-transparent font-black text-xl border-none outline-none focus:ring-0 uppercase tracking-tighter" value={selectedUnitId} onChange={e=>setSelectedUnitId(e.target.value)}>
                        {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                </div>
            </div>

            <div className="relative border-l-4 border-gray-100 ml-6 space-y-12 pb-10">
                {events.map((e, idx) => (
                    <div key={e.id} className="relative pl-12 animate-in slide-in-from-left duration-300">
                        <div className={`absolute -left-[22px] top-0 p-3 rounded-2xl shadow-lg border-2 border-white bg-white ${e.category === 'MALATTIA' || e.category === 'FERITA' ? 'text-red-500' : 'text-blue-500'}`}>
                            <Stethoscope size={20}/>
                        </div>
                        <div className="bg-white rounded-[32px] p-6 shadow-xl border border-gray-50 hover:shadow-2xl transition-all">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] font-black uppercase text-text-secondary tracking-widest">{new Date(e.date).toLocaleDateString()}</span>
                                <span className={`px-3 py-0.5 rounded-full text-[8px] font-black uppercase ${e.category === 'MALATTIA' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>{e.category}</span>
                            </div>
                            <h3 className="text-2xl font-black text-text-primary uppercase tracking-tighter mb-2 leading-none">{e.title}</h3>
                            <p className="text-sm text-text-secondary italic mb-4">"{e.description}"</p>
                            
                            <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-50">
                                {e.productName && <span className="text-[10px] font-black text-primary uppercase">Farmaco: {e.productName}</span>}
                                {e.withdrawalDays && <span className="text-[10px] font-black text-red-600 uppercase">Carenza: {e.withdrawalDays} giorni</span>}
                                <span className="text-[10px] font-black text-text-secondary uppercase">Esito: {e.outcome || 'N/D'}</span>
                            </div>
                        </div>
                    </div>
                ))}
                {events.length === 0 && (
                    <div className="pl-12 py-20 text-text-secondary italic font-medium">Nessun evento clinico o sanitario registrato per questa unità.</div>
                )}
            </div>

            {/* MODALE SANITARIO */}
            {modal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <form onSubmit={handleSave} className="bg-white rounded-[40px] shadow-2xl p-10 w-full max-w-2xl border-2 border-white animate-in zoom-in my-8">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black uppercase tracking-tighter text-red-600">Dettaglio Diagnostico</h2>
                            <button type="button" onClick={() => setModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X/></button>
                        </div>
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1 tracking-widest">Categoria Intervento</label>
                                    <select name="category" className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold">
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1 tracking-widest">Titolo Rapido*</label>
                                    <input name="title" required className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold" placeholder="Es: Vaccinazione IBR"/>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-text-secondary ml-1 tracking-widest">Descrizione Clinica*</label>
                                <textarea name="description" required rows={3} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold text-sm" placeholder="Specifica sintomi, diagnosi e dosaggi..."/>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1 tracking-widest">Prodotto / Farmaco</label>
                                    <input name="productName" className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold" placeholder="Nome commerciale"/>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1 tracking-widest text-red-600 font-black">Giorni Carenza</label>
                                    <input name="withdrawal" type="number" className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold" placeholder="0"/>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-text-secondary ml-1 tracking-widest">Esito Attuale</label>
                                <select name="outcome" className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold">
                                    <option>Sintomi risolti</option>
                                    <option>In osservazione</option>
                                    <option>Peggioramento</option>
                                    <option>Fine trattamento</option>
                                </select>
                            </div>
                            <button type="submit" className="w-full py-5 bg-red-600 text-white rounded-[24px] font-black uppercase shadow-xl hover:scale-[1.02] transition-all text-xs tracking-widest">Salva Record Sanitario</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default LivestockSanitaryPage;
