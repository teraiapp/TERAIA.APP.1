
import React, { useState, useEffect } from 'react';
import { LivestockUnit, LivestockFeedingLog } from '../../../types';
import { livestockService } from '../../../services/livestockService';
import { inventoryService } from '../../../services/inventoryService';
import { PlusCircle, Wheat, Trash2, Edit, X, Save } from 'lucide-react';

interface Props { unit: LivestockUnit; }

const LivestockFeedingPage: React.FC<Props> = ({ unit }) => {
    const [entries, setEntries] = useState<LivestockFeedingLog[]>([]);
    const [modal, setModal] = useState<{ show: boolean, data?: LivestockFeedingLog } | null>(null);

    useEffect(() => {
        setEntries(livestockService.getFeedingLogs(unit.id));
    }, [unit.id]);

    const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const selectedFeedId = f.get('feedItemId') as string;
        const qty = Number(f.get('qty'));
        const dateStr = f.get('date') as string;
        const rationType = f.get('rationType') as string;

        const inventoryItem = inventoryService.getItems().find(i => i.id === selectedFeedId);

        const log: LivestockFeedingLog = {
            id: modal?.data?.id || `feed-${Date.now()}`,
            unitId: unit.id,
            date: new Date(dateStr).getTime(),
            items: selectedFeedId ? [{
                inventoryItemId: selectedFeedId,
                name: inventoryItem?.name || 'Mangime',
                qty: qty,
                unit: inventoryItem?.unit || 'kg',
                cost: inventoryItem?.avgCost || 0
            }] : [],
            totalCost: 0, // Will be calculated by service
            rationType: rationType,
            notes: f.get('notes') as string
        };

        livestockService.addFeedingLog(log);
        setEntries(livestockService.getFeedingLogs(unit.id));
        setModal(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                    <Wheat size={20} className="text-green-600"/> Registro Alimentazione
                </h3>
                <button onClick={() => setModal({ show: true })} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md">
                    <PlusCircle size={16}/> Nuova Razione
                </button>
            </div>

            <div className="bg-white rounded-[40px] shadow-xl overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b text-text-secondary uppercase text-[10px] font-black">
                            <tr>
                                <th className="p-6">Data</th>
                                <th className="p-6">Tipo Razione</th>
                                <th className="p-6">Dettaglio</th>
                                <th className="p-6">Costo Tot. (€)</th>
                                <th className="p-6 text-center">Azioni</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {entries.length > 0 ? entries.sort((a,b)=>b.date - a.date).map(e => (
                                <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-6 font-bold">{new Date(e.date).toLocaleDateString()}</td>
                                    <td className="p-6 font-bold text-green-600">{e.rationType}</td>
                                    <td className="p-6 text-xs font-medium">
                                        {e.items.map((it, i) => (
                                            <div key={i}>{it.name}: {it.qty} {it.unit}</div>
                                        ))}
                                    </td>
                                    <td className="p-6 font-black">€ {e.totalCost?.toFixed(2) || '-'}</td>
                                    <td className="p-6">
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => setModal({ show: true, data: e })} className="p-2 hover:bg-gray-100 rounded-lg"><Edit size={16}/></button>
                                            <button onClick={() => { if(window.confirm('Eliminare?')) { livestockService.deleteFeedingLog(e.id); setEntries(livestockService.getFeedingLogs(unit.id)); }}} className="p-2 hover:bg-red-50 text-red-500 rounded-lg"><Trash2 size={16}/></button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={5} className="p-10 text-center text-text-secondary italic">Nessun dato registrato.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {modal?.show && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[40px] shadow-2xl p-10 w-full max-w-lg border-2 border-white animate-in zoom-in">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black uppercase tracking-tighter">Razione Alimentare</h2>
                            <button onClick={() => setModal(null)} className="p-2 hover:bg-gray-100 rounded-full"><X/></button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Data*</label>
                                <input name="date" type="date" required defaultValue={modal.data?.date ? new Date(modal.data.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold"/>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Descrizione Razione*</label>
                                <input name="rationType" required defaultValue={modal.data?.rationType} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold" placeholder="Es: Unifeed Lattazione..."/>
                            </div>
                            <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
                                <label className="text-[10px] font-black uppercase text-green-700 ml-1 block mb-2">Scarico Magazzino</label>
                                <select name="feedItemId" defaultValue={modal.data?.items[0]?.inventoryItemId} className="w-full p-4 bg-white border-none rounded-xl font-bold mb-2">
                                    <option value="">Scegli dal magazzino...</option>
                                    {inventoryService.getItems().filter(i => i.category.toLowerCase().includes('mangimi') || i.category.toLowerCase().includes('integratori')).map(i => (
                                        <option key={i.id} value={i.id}>{i.name} (Disp: {i.currentQty} {i.unit})</option>
                                    ))}
                                </select>
                                <input name="qty" type="number" step="0.01" defaultValue={modal.data?.items[0]?.qty} placeholder="Quantità scaricata (kg)..." className="w-full p-4 bg-white border-none rounded-xl font-bold" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Note</label>
                                <textarea name="notes" defaultValue={modal.data?.notes} rows={2} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold text-sm" placeholder="Note aggiuntive..."/>
                            </div>
                            <button type="submit" className="w-full py-5 bg-green-600 text-white rounded-[24px] font-black uppercase text-xs tracking-widest shadow-xl">Salva Registro</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LivestockFeedingPage;

