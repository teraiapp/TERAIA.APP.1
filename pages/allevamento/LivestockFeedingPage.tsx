
import React, { useState, useMemo, useEffect } from 'react';
import { 
    Wheat, PlusCircle, Trash2, X, Save, ArrowLeft, 
    LayoutGrid, Search, Package, Calculator, History
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { livestockService } from '../../services/livestockService';
import { inventoryService } from '../../services/inventoryService';
import { LivestockUnit, InventoryItem, LivestockFeedingLog } from '../../types';

const LivestockFeedingPage: React.FC = () => {
    const navigate = useNavigate();
    const [units] = useState<LivestockUnit[]>(() => livestockService.getUnits());
    const [selectedUnitId, setSelectedUnitId] = useState<string>(units[0]?.id || '');
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [logs, setLogs] = useState<LivestockFeedingLog[]>([]);
    const [modal, setModal] = useState(false);

    // Dati dinamici dal magazzino (filtrati per mangimi)
    const feedItems = useMemo(() => 
        inventory.filter(i => i.category.toLowerCase().includes('mangimi') || i.category.toLowerCase().includes('integratori')), 
    [inventory]);

    useEffect(() => {
        setInventory(inventoryService.getItems());
        setLogs(livestockService.getFeedingLogs(selectedUnitId));
    }, [selectedUnitId]);

    const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const itemId = f.get('itemId') as string;
        const qty = Number(f.get('qty'));
        const item = feedItems.find(i => i.id === itemId);

        if (!item || qty <= 0) return;

        const newLog: LivestockFeedingLog = {
            id: `feed-${Date.now()}`,
            unitId: selectedUnitId,
            date: Date.now(),
            items: [{
                inventoryItemId: item.id,
                name: item.name,
                qty: qty,
                unit: item.unit,
                cost: item.avgCost
            }],
            totalCost: qty * item.avgCost,
            notes: f.get('notes') as string,
        };

        livestockService.addFeedingLog(newLog);
        setLogs(livestockService.getFeedingLogs(selectedUnitId));
        setModal(false);
        alert("Razione registrata, magazzino scaricato e quaderno aggiornato!");
    };

    return (
        <div className="space-y-8 animate-in fade-in pb-20">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/allevamento')} className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-all"><ArrowLeft size={20}/></button>
                    <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">Gestione Razioni</h1>
                </div>
                <button onClick={() => setModal(true)} className="px-6 py-3 bg-green-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-green-700 transition-all flex items-center gap-2">
                    <PlusCircle size={18}/> Registra Somministrazione
                </button>
            </div>

            {/* SELETTORE UNITA */}
            <div className="bg-white p-6 rounded-[32px] shadow-xl border border-gray-100 flex items-center gap-4">
                <LayoutGrid className="text-green-600" size={24}/>
                <div className="flex-1">
                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1 tracking-widest">Unità di Allevamento</label>
                    <select className="w-full bg-transparent font-black text-xl border-none outline-none focus:ring-0 uppercase tracking-tighter" value={selectedUnitId} onChange={e=>setSelectedUnitId(e.target.value)}>
                        {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {logs.map(log => (
                    <div key={log.id} className="bg-white rounded-[40px] p-8 shadow-xl border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 group hover:border-green-600 transition-all">
                        <div className="flex items-center gap-6 flex-1">
                            <div className="p-5 bg-green-50 text-green-600 rounded-[28px]"><Wheat size={28}/></div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-black text-text-secondary uppercase">{new Date(log.date).toLocaleDateString()}</span>
                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-[8px] font-black uppercase">Somministrato</span>
                                </div>
                                <h3 className="text-xl font-black text-text-primary uppercase tracking-tighter leading-none">
                                    {log.items.map(i => `${i.name} (${i.qty}${i.unit})`).join(', ')}
                                </h3>
                                <p className="text-xs text-text-secondary mt-1 italic">"{log.notes || 'Nessuna nota'}"</p>
                            </div>
                        </div>
                        <div className="px-8 border-l border-gray-50 text-right">
                            <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest">Costo Totale</p>
                            <p className="text-2xl font-black text-primary">€ {log.totalCost.toFixed(2)}</p>
                        </div>
                    </div>
                ))}
                {logs.length === 0 && (
                    <div className="py-20 text-center bg-white rounded-[48px] border-2 border-dashed border-gray-200">
                        <History size={48} className="mx-auto text-gray-200 mb-4"/>
                        <p className="text-text-secondary font-black uppercase text-xs">Nessuna somministrazione registrata per questa unità.</p>
                    </div>
                )}
            </div>

            {/* MODALE ALIMENTAZIONE */}
            {modal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <form onSubmit={handleSave} className="bg-white rounded-[40px] shadow-2xl p-10 w-full max-w-xl animate-in zoom-in border-2 border-white">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black uppercase tracking-tighter text-green-600">Registra Razione</h2>
                            <button type="button" onClick={() => setModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X/></button>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-text-secondary ml-1 tracking-widest">Seleziona Prodotto Magazzino*</label>
                                <select name="itemId" required className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-green-600">
                                    <option value="">Scegli mangime...</option>
                                    {feedItems.map(i => <option key={i.id} value={i.id}>{i.name} (Disp: {i.currentQty}{i.unit} - CM: €{i.avgCost})</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1 tracking-widest">Quantità Somministrata*</label>
                                    <input name="qty" type="number" required className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold text-2xl" placeholder="0.0"/>
                                </div>
                                <div className="flex flex-col justify-center">
                                    <p className="text-[8px] font-black text-text-secondary uppercase">Uscita Bilancio</p>
                                    <p className="text-lg font-black text-primary flex items-center gap-1"><Calculator size={14}/> Calcolato auto</p>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-text-secondary ml-1 tracking-widest">Note / Variazioni</label>
                                <textarea name="notes" rows={2} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold text-sm" placeholder="Es: aggiunta integratore minerale..."/>
                            </div>
                            <button type="submit" className="w-full py-5 bg-green-600 text-white rounded-[24px] font-black uppercase shadow-xl hover:scale-[1.02] transition-all text-xs tracking-widest">Scarica Magazzino & Salva</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default LivestockFeedingPage;
