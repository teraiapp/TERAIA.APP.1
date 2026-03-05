
import React, { useState, useMemo, useEffect } from 'react';
import { 
    Milk, PlusCircle, Trash2, X, Save, ArrowLeft, 
    LayoutGrid, History, TrendingUp, BarChart2
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { livestockService } from '../../services/livestockService';
import { LivestockUnit, LivestockProductionLog } from '../../types';

const TYPES = ["LATTE", "UOVA", "LANA", "CARNE", "ALTRO"];

const LivestockProductionPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [units] = useState<LivestockUnit[]>(() => livestockService.getUnits());
    const [selectedUnitId, setSelectedUnitId] = useState<string>(location.state?.unitId || units[0]?.id || '');
    const [logs, setLogs] = useState<LivestockProductionLog[]>([]);
    const [modal, setModal] = useState(false);

    useEffect(() => {
        setLogs(livestockService.getProductionLogs(selectedUnitId));
    }, [selectedUnitId]);

    const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const log: LivestockProductionLog = {
            id: `prod-${Date.now()}`,
            unitId: selectedUnitId,
            date: Date.now(),
            type: f.get('type') as any,
            quantity: Number(f.get('qty')),
            unit: f.get('uom') as string,
            destination: f.get('destination') as any,
            createdAt: Date.now()
        };

        livestockService.addProductionLog(log);
        setLogs(livestockService.getProductionLogs(selectedUnitId));
        setModal(false);
        alert("Produzione registrata e sincronizzata nel Quaderno!");
    };

    return (
        <div className="space-y-8 animate-in fade-in pb-20">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/allevamento')} className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-all"><ArrowLeft size={20}/></button>
                    <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">Registro Produzioni</h1>
                </div>
                <button onClick={() => setModal(true)} className="px-6 py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all flex items-center gap-2">
                    <PlusCircle size={18}/> Log Produzione
                </button>
            </div>

            {/* SELETTORE UNITA */}
            <div className="bg-white p-6 rounded-[32px] shadow-xl border border-gray-100 flex items-center gap-4">
                <LayoutGrid className="text-primary" size={24}/>
                <div className="flex-1">
                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1 tracking-widest">Unità Sotto Monitoraggio</label>
                    <select className="w-full bg-transparent font-black text-xl border-none outline-none focus:ring-0 uppercase tracking-tighter" value={selectedUnitId} onChange={e=>setSelectedUnitId(e.target.value)}>
                        {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100">
                <div className="p-8 bg-gray-50 border-b flex justify-between items-center">
                    <h2 className="text-xl font-black uppercase flex items-center gap-2 tracking-tighter"><History size={20}/> Storico Raccolte</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b text-text-secondary uppercase text-[10px] font-black">
                            <tr>
                                <th className="p-6">Data</th>
                                <th className="p-6">Tipo</th>
                                <th className="p-6">Quantità</th>
                                <th className="p-6">Destinazione</th>
                                <th className="p-6 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {logs.map(log => (
                                <tr key={log.id} className="hover:bg-gray-50 transition-colors font-medium">
                                    <td className="p-6 font-bold">{new Date(log.date).toLocaleDateString()}</td>
                                    <td className="p-6 font-black uppercase text-[10px] text-primary">{log.type}</td>
                                    <td className="p-6 font-black text-lg">{log.quantity} <span className="text-[10px] opacity-40">{log.unit}</span></td>
                                    <td className="p-6 text-text-secondary font-black uppercase text-[10px]">{log.destination}</td>
                                    <td className="p-6 text-right">
                                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-[8px] font-black uppercase">Certificato</span>
                                    </td>
                                </tr>
                            ))}
                            {logs.length === 0 && (
                                <tr><td colSpan={5} className="p-20 text-center text-text-secondary italic">Nessuna registrazione per questa unità.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODALE PRODUZIONE */}
            {modal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <form onSubmit={handleSave} className="bg-white rounded-[40px] shadow-2xl p-10 w-full max-w-xl animate-in zoom-in border-2 border-white">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black uppercase tracking-tighter">Registra Produzione</h2>
                            <button type="button" onClick={() => setModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X/></button>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-text-secondary ml-1 tracking-widest">Categoria Prodotto*</label>
                                <select name="type" required className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold">
                                    {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1 tracking-widest">Quantità*</label>
                                    <input name="qty" type="number" required className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold text-2xl" placeholder="0.0"/>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1 tracking-widest">Unità Misura</label>
                                    <input name="uom" required className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold" placeholder="lt, kg, uova..."/>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-text-secondary ml-1 tracking-widest">Destinazione</label>
                                <select name="destination" className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold">
                                    <option value="VENDITA">Vendita / Commercializzazione</option>
                                    <option value="USO_INTERNO">Uso Interno / Trasformazione</option>
                                </select>
                            </div>
                            <button type="submit" className="w-full py-5 bg-primary text-white rounded-[24px] font-black uppercase shadow-xl hover:scale-105 transition-all text-xs tracking-widest">Salva & Sincronizza Quaderno</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default LivestockProductionPage;
