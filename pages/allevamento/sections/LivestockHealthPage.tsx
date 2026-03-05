
import React, { useState, useEffect } from 'react';
import { LivestockUnit, LivestockHealthEvent } from '../../../types';
import { livestockService } from '../../../services/livestockService';
import { inventoryService } from '../../../services/inventoryService';
import { PlusCircle, Stethoscope, Trash2, Edit, X, Save, Syringe, AlertTriangle, Package } from 'lucide-react';

interface Props { unit: LivestockUnit; isVet?: boolean; }

const LivestockHealthPage: React.FC<Props> = ({ unit, isVet }) => {
    const [entries, setEntries] = useState<LivestockHealthEvent[]>([]);
    const [modal, setModal] = useState<{ show: boolean, data?: LivestockHealthEvent } | null>(null);

    useEffect(() => {
        setEntries(livestockService.getHealthEvents(unit.id));
    }, [unit.id]);

    const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const eventType = f.get('eventType') as any;
        const desc = f.get('description') as string;
        const dateStr = f.get('date') as string;
        const inventoryItemId = f.get('inventoryItemId') as string;
        const productQty = Number(f.get('productQty'));
        const manualCost = Number(f.get('manualCost'));

        const inventoryItem = inventoryService.getItems().find(i => i.id === inventoryItemId);

        const entry: LivestockHealthEvent = {
            id: modal?.data?.id || `health-${Date.now()}`,
            unitId: unit.id,
            date: new Date(dateStr).getTime(),
            category: eventType === 'visita' ? 'VISITA' : 'TRATTAMENTO',
            title: desc,
            description: desc,
            eventType: eventType,
            veterinarian: f.get('veterinarian') as string,
            productName: inventoryItem?.name || f.get('medicine') as string,
            withdrawalDays: f.get('withdrawalDays') ? Number(f.get('withdrawalDays')) : undefined,
            notes: f.get('notes') as string,
            inventoryItemId: inventoryItemId || undefined,
            inventoryQty: productQty || undefined,
            manualCost: manualCost || undefined
        };
        
        livestockService.addHealthEvent(entry);
        setEntries(livestockService.getHealthEvents(unit.id));
        setModal(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                    <Stethoscope size={20} className="text-blue-500"/> Registro Sanitario
                </h3>
                <button onClick={() => setModal({ show: true })} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md hover:bg-blue-700 transition-all">
                    <PlusCircle size={16}/> Nuova Entry Sanitaria
                </button>
            </div>

            <div className="space-y-4">
                {entries.length > 0 ? entries.sort((a,b)=>b.date - a.date).map(e => (
                    <div key={e.id} className={`bg-white rounded-[32px] p-6 shadow-xl border-l-8 flex flex-col md:flex-row justify-between items-center gap-6 ${e.eventType === 'malattia' || e.eventType === 'mortalita' ? 'border-red-500' : 'border-blue-500'}`}>
                        <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3">
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${e.eventType === 'vaccino' ? 'bg-green-100 text-green-700' : 'bg-blue-50 text-blue-700'}`}>{e.eventType}</span>
                                <span className="text-[10px] font-black text-text-secondary uppercase">{new Date(e.date).toLocaleDateString()}</span>
                            </div>
                            <h4 className="text-lg font-black text-text-primary uppercase tracking-tighter leading-tight">{e.title}</h4>
                            <div className="flex flex-wrap gap-4 text-[10px] font-bold text-text-secondary uppercase">
                                {e.veterinarian && <span className="flex items-center gap-1"><Stethoscope size={12}/> Vet: {e.veterinarian}</span>}
                                {e.productName && <span className="flex items-center gap-1"><Syringe size={12}/> Farmaco: {e.productName}</span>}
                                {e.withdrawalDays && <span className="flex items-center gap-1 text-red-500 font-black"><AlertTriangle size={12}/> Carenza: {e.withdrawalDays} gg</span>}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setModal({ show: true, data: e })} className="p-3 bg-gray-50 text-text-secondary rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all"><Edit size={18}/></button>
                            <button onClick={() => { if(window.confirm('Eliminare?')) { livestockService.deleteHealthEvent(e.id); setEntries(livestockService.getHealthEvents(unit.id)); }}} className="p-3 bg-gray-50 text-text-secondary rounded-xl hover:bg-red-50 hover:text-red-500 transition-all"><Trash2 size={18}/></button>
                        </div>
                    </div>
                )) : (
                    <div className="py-10 text-center text-text-secondary italic bg-white rounded-[40px] border border-gray-100">Nessun record sanitario registrato.</div>
                )}
            </div>

            {modal?.show && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-[40px] shadow-2xl p-10 w-full max-w-2xl border-2 border-white my-8">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black uppercase tracking-tighter text-red-600">Evento Sanitario</h2>
                            <button onClick={() => setModal(null)} className="p-2 hover:bg-gray-100 rounded-full"><X/></button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Data*</label>
                                    <input name="date" type="date" required defaultValue={modal.data?.date ? new Date(modal.data.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold"/>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Tipo Evento*</label>
                                    <select name="eventType" defaultValue={modal.data?.eventType || 'visita'} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-primary">
                                        <option value="visita">Visita Clinica</option>
                                        <option value="trattamento">Terapia</option>
                                        <option value="vaccino">Vaccinazione</option>
                                        <option value="malattia">Focolaio/Malattia</option>
                                        <option value="mortalita">Mortalità</option>
                                        <option value="altro">Altro</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Descrizione / Diagnosi*</label>
                                <input name="description" required defaultValue={modal.data?.description} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold" placeholder="Es: Controllo zoppia anteriore sinistra..."/>
                            </div>
                            
                            <div className="p-6 bg-blue-50 rounded-[32px] border border-blue-100 space-y-4">
                                <div className="flex items-center gap-2 text-blue-700 font-black uppercase text-[10px]">
                                    <Package size={14}/> Utilizzo Prodotti Magazzino
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <select name="inventoryItemId" defaultValue={modal.data?.inventoryItemId} className="w-full p-4 bg-white border-none rounded-xl font-bold">
                                        <option value="">Nessun prodotto...</option>
                                        {inventoryService.getItems().filter(i => i.category.toLowerCase().includes('farmaci') || i.category.toLowerCase().includes('sanitari')).map(i => (
                                            <option key={i.id} value={i.id}>{i.name} (Disp: {i.currentQty} {i.unit})</option>
                                        ))}
                                    </select>
                                    <input name="productQty" type="number" step="0.01" defaultValue={modal.data?.productQty} placeholder="Quantità utilizzata..." className="w-full p-4 bg-white border-none rounded-xl font-bold" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Veterinario</label>
                                    <input name="veterinarian" defaultValue={modal.data?.veterinarian} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold" placeholder="Nome Medico"/>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Costo Manuale (€)</label>
                                    <input name="manualCost" type="number" step="0.01" defaultValue={modal.data?.manualCost} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold" placeholder="Es: 50.00 (per visita)"/>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1 text-red-500">Giorni di Carenza (Withdrawal)</label>
                                    <input name="withdrawalDays" type="number" defaultValue={modal.data?.withdrawalDays} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold" placeholder="0"/>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Note Extra</label>
                                <textarea name="notes" defaultValue={modal.data?.notes} rows={2} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold text-sm" placeholder="Dosaggi, modalità somministrazione..."/>
                            </div>
                            <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black uppercase text-xs tracking-widest shadow-xl hover:bg-blue-700 transition-all">Salva Record Sanitario</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LivestockHealthPage;

