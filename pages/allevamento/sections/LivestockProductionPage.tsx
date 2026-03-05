
import React, { useState, useEffect } from 'react';
import { LivestockUnit, LivestockProductionLog } from '../../../types';
import { livestockService } from '../../../services/livestockService';
import { PlusCircle, Milk, Trash2, Edit, X, Save, FileText, LayoutGrid, ShoppingCart, Home } from 'lucide-react';

interface Props { unit: LivestockUnit; }

const LivestockProductionPage: React.FC<Props> = ({ unit }) => {
    const [entries, setEntries] = useState<LivestockProductionLog[]>([]);
    const [modal, setModal] = useState<{ show: boolean, data?: LivestockProductionLog } | null>(null);

    useEffect(() => {
        setEntries(livestockService.getProductionLogs(unit.id));
    }, [unit.id]);

    const hasLatte = unit.purpose.includes('LATTE' as any);
    const hasUova = unit.purpose.includes('UOVA' as any);
    const hasLana = unit.purpose.includes('LANA' as any);
    const hasCarne = unit.purpose.includes('CARNE' as any) || unit.purpose.includes('MISTO' as any);

    const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        
        const destination = f.get('destination') as 'USO_INTERNO' | 'VENDITA';
        const qty = Number(f.get('milkLiters') || f.get('eggsCount') || f.get('woolKg') || f.get('weightAvgKg') || 0);

        const log: LivestockProductionLog & { salePrice?: number, customer?: string } = {
            id: modal?.data?.id || `prod-${Date.now()}`,
            unitId: unit.id,
            date: new Date(f.get('date') as string).getTime(),
            quantity: qty,
            unit: hasLatte ? "litri" : hasUova ? "unità" : "kg",
            type: hasLatte ? "LATTE" : hasUova ? "UOVA" : hasLana ? "LANA" : "CARNE",
            destination: destination,
            notes: f.get('notes') as string,
            createdAt: modal?.data?.createdAt || Date.now(),
            salePrice: destination === 'VENDITA' ? Number(f.get('salePrice')) : undefined,
            customer: destination === 'VENDITA' ? f.get('customer') as string : undefined
        };

        livestockService.addProductionLog(log);
        setEntries(livestockService.getProductionLogs(unit.id));
        setModal(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                    <Milk size={20} className="text-primary"/> Registro Produzione
                </h3>
                <button 
                    onClick={() => setModal({ show: true })}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md hover:bg-primary-dark transition-all"
                >
                    <PlusCircle size={16}/> Registra Oggi
                </button>
            </div>

            <div className="bg-white rounded-[40px] shadow-xl overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b text-text-secondary uppercase text-[10px] font-black">
                            <tr>
                                <th className="p-6">Data</th>
                                <th className="p-6">Quantità</th>
                                <th className="p-6">Destinazione</th>
                                <th className="p-6">Note</th>
                                <th className="p-6 text-center">Azioni</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {entries.length > 0 ? entries.sort((a,b)=>b.date - a.date).map(e => (
                                <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-6 font-bold">{new Date(e.date).toLocaleDateString()}</td>
                                    <td className="p-6 font-black text-primary">{e.quantity} {e.unit}</td>
                                    <td className="p-6 uppercase text-[10px] font-black">
                                        <span className={`px-2 py-1 rounded-full ${e.destination === 'VENDITA' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {e.destination}
                                        </span>
                                    </td>
                                    <td className="p-6 text-text-secondary italic">{e.notes || '-'}</td>
                                    <td className="p-6">
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => setModal({ show: true, data: e })} className="p-2 hover:bg-primary/10 text-text-secondary hover:text-primary rounded-lg transition-all"><Edit size={16}/></button>
                                            <button onClick={() => { if(window.confirm('Eliminare?')) { livestockService.deleteProductionLog(e.id); setEntries(livestockService.getProductionLogs(unit.id)); }}} className="p-2 hover:bg-red-50 text-text-secondary hover:text-red-500 rounded-lg transition-all"><Trash2 size={16}/></button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={10} className="p-10 text-center text-text-secondary italic">Nessun dato registrato.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {modal?.show && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[40px] shadow-2xl p-10 w-full max-w-lg border-2 border-white animate-in zoom-in">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black uppercase tracking-tighter">Registrazione Produzione</h2>
                            <button onClick={() => setModal(null)} className="p-2 hover:bg-gray-100 rounded-full"><X/></button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Data Rilevazione*</label>
                                <input name="date" type="date" required defaultValue={modal.data?.date ? new Date(modal.data.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold"/>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                {hasLatte && (
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Litri Latte</label>
                                        <input name="milkLiters" type="number" step="0.1" defaultValue={modal.data?.quantity} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold" placeholder="0.0"/>
                                    </div>
                                )}
                                {hasUova && (
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Numero Uova</label>
                                        <input name="eggsCount" type="number" defaultValue={modal.data?.quantity} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold" placeholder="0"/>
                                    </div>
                                )}
                                {hasLana && (
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Kg Lana</label>
                                        <input name="woolKg" type="number" step="0.1" defaultValue={modal.data?.quantity} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold" placeholder="0.0"/>
                                    </div>
                                )}
                                {hasCarne && (
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Peso Med (kg)</label>
                                        <input name="weightAvgKg" type="number" step="0.1" defaultValue={modal.data?.quantity} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold" placeholder="0.0"/>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Destinazione</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <label className={`flex items-center justify-center gap-2 p-4 rounded-2xl border-2 cursor-pointer transition-all ${modal.data?.destination !== 'VENDITA' ? 'bg-blue-50 border-blue-600 text-blue-700' : 'bg-gray-50 border-transparent'}`}>
                                        <input type="radio" name="destination" value="USO_INTERNO" className="hidden" defaultChecked={modal.data?.destination !== 'VENDITA'} />
                                        <Home size={16}/> USO INTERNO
                                    </label>
                                    <label className={`flex items-center justify-center gap-2 p-4 rounded-2xl border-2 cursor-pointer transition-all ${modal.data?.destination === 'VENDITA' ? 'bg-green-50 border-green-600 text-green-700' : 'bg-gray-50 border-transparent'}`}>
                                        <input type="radio" name="destination" value="VENDITA" className="hidden" defaultChecked={modal.data?.destination === 'VENDITA'} />
                                        <ShoppingCart size={16}/> VENDITA
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Prezzo Unitario (€)</label>
                                    <input name="salePrice" type="number" step="0.01" className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold" placeholder="0.00"/>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Cliente</label>
                                    <input name="customer" className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold" placeholder="Nome cliente..."/>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Note / Eventi Particolari</label>
                                <textarea name="notes" defaultValue={modal.data?.notes} rows={2} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold text-sm" placeholder="Es: Calo per sbalzo termico..."/>
                            </div>

                            <button type="submit" className="w-full py-5 bg-primary text-white rounded-[24px] font-black uppercase text-xs tracking-widest shadow-xl">Salva Registro</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LivestockProductionPage;

