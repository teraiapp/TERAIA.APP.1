
import React, { useState, useMemo } from 'react';
import { 
    Tag, PlusCircle, Trash2, Edit, X, Save, 
    ArrowLeft, LayoutGrid, Search, Filter, PawPrint, ShoppingCart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { livestockService } from '../../services/livestockService';
import { LivestockAnimal, AnimalStatus } from '../../types';

const STATUSES: AnimalStatus[] = ["ATTIVO", "VENDUTO", "MORTO", "ISOLAMENTO"];

const LivestockAnimalsPage: React.FC = () => {
    const navigate = useNavigate();
    const units = useMemo(() => livestockService.getUnits().filter(u => u.managementMode !== 'GROUP'), []);
    const [selectedUnitId, setSelectedUnitId] = useState<string>(units[0]?.id || '');
    const [animals, setAnimals] = useState<LivestockAnimal[]>(() => livestockService.getAnimals());
    const [modal, setModal] = useState<{ show: boolean, data?: LivestockAnimal } | null>(null);
    const [saleModal, setSaleModal] = useState<{ show: boolean, animal?: LivestockAnimal } | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredAnimals = useMemo(() => {
        return animals.filter(a => 
            a.unitId === selectedUnitId && 
            (!searchTerm || a.tagId.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [animals, selectedUnitId, searchTerm]);

    const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const animal: LivestockAnimal = {
            id: modal?.data?.id || `a-${Date.now()}`,
            unitId: selectedUnitId,
            groupId: 'none',
            tagId: f.get('tagId') as string,
            sex: f.get('sex') as "M" | "F",
            breed: f.get('breed') as string,
            status: f.get('status') as AnimalStatus,
            birthDate: f.get('birthDate') as string,
            createdAt: modal?.data?.createdAt || Date.now(),
            updatedAt: Date.now()
        };
        livestockService.saveAnimal(animal);
        setAnimals(livestockService.getAnimals());
        setModal(null);
    };

    const handleSale = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!saleModal?.animal) return;
        const f = new FormData(e.currentTarget);
        const price = Number(f.get('price'));
        const customer = f.get('customer') as string;
        const date = new Date(f.get('date') as string).getTime();

        livestockService.sellAnimal(saleModal.animal.id, price, customer, date);
        setAnimals(livestockService.getAnimals());
        setSaleModal(null);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/allevamento')} className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 hover:bg-gray-50"><ArrowLeft size={20}/></button>
                    <h1 className="text-3xl font-black uppercase tracking-tighter">Tracciabilità Capi</h1>
                </div>
                {selectedUnitId && (
                    <button onClick={() => setModal({ show: true })} className="px-6 py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase shadow-xl hover:scale-105 transition-all flex items-center gap-2">
                        <PlusCircle size={18}/> Registra Capo
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-[32px] shadow-xl border border-gray-100 flex items-center gap-4">
                    <LayoutGrid className="text-primary" size={24}/>
                    <div className="flex-1">
                        <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Unità Operativa</label>
                        <select className="w-full bg-transparent font-black text-xl border-none outline-none focus:ring-0 uppercase tracking-tighter" value={selectedUnitId} onChange={e=>setSelectedUnitId(e.target.value)}>
                            {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[32px] shadow-xl border border-gray-100 flex items-center gap-4">
                    <Search className="text-primary" size={24}/>
                    <div className="flex-1">
                        <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Cerca Tag ID</label>
                        <input className="w-full bg-transparent font-black text-xl border-none outline-none focus:ring-0 uppercase tracking-tighter" placeholder="Matricola..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)}/>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b text-text-secondary uppercase text-[10px] font-black">
                        <tr>
                            <th className="p-6">Tag ID / Matricola</th>
                            <th className="p-6">Sesso</th>
                            <th className="p-6">Razza</th>
                            <th className="p-6">Stato</th>
                            <th className="p-6 text-right">Azioni</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredAnimals.map(a => (
                            <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-6 font-black text-text-primary uppercase tracking-tighter text-lg">{a.tagId}</td>
                                <td className="p-6 font-bold">{a.sex === 'M' ? 'Montone/Toro' : 'Pecora/Vacca'}</td>
                                <td className="p-6 text-text-secondary uppercase text-xs font-black">{a.breed || '-'}</td>
                                <td className="p-6">
                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                                        a.status === 'ATTIVO' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                    }`}>{a.status}</span>
                                </td>
                                <td className="p-6 text-right">
                                    <div className="flex justify-end gap-2">
                                        {a.status === 'ATTIVO' && (
                                            <button onClick={() => setSaleModal({ show: true, animal: a })} className="p-2 text-green-600 hover:bg-green-50 rounded-lg flex items-center gap-1 font-black text-[10px] uppercase">
                                                <ShoppingCart size={16}/> Vendi
                                            </button>
                                        )}
                                        <button onClick={() => setModal({ show: true, data: a })} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={16}/></button>
                                        <button onClick={() => { if(confirm('Eliminare capo?')) { livestockService.deleteAnimal(a.id); setAnimals(livestockService.getAnimals()); }}} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {modal?.show && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <form onSubmit={handleSave} className="bg-white rounded-[40px] shadow-2xl p-10 w-full max-w-xl border-2 border-white animate-in zoom-in">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black uppercase tracking-tighter">Dati Individuali Capo</h2>
                            <button type="button" onClick={() => setModal(null)} className="p-2 hover:bg-gray-100 rounded-full"><X/></button>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Tag ID / Matricola*</label>
                                <input name="tagId" required defaultValue={modal.data?.tagId} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-black text-xl uppercase" placeholder="IT0123..."/>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Sesso*</label>
                                    <select name="sex" defaultValue={modal.data?.sex} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold">
                                        <option value="F">Femmina</option><option value="M">Maschio</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Stato Salute*</label>
                                    <select name="status" defaultValue={modal.data?.status} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold">
                                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Data Nascita</label>
                                    <input name="birthDate" type="date" defaultValue={modal.data?.birthDate} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold"/>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Razza</label>
                                    <input name="breed" defaultValue={modal.data?.breed} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold" placeholder="Razza..."/>
                                </div>
                            </div>
                            <button type="submit" className="w-full py-5 bg-primary text-white rounded-[24px] font-black uppercase shadow-xl">Salva Anagrafica</button>
                        </div>
                    </form>
                </div>
            )}

            {saleModal?.show && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <form onSubmit={handleSale} className="bg-white rounded-[40px] shadow-2xl p-10 w-full max-w-lg border-2 border-white animate-in zoom-in">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black uppercase tracking-tighter text-green-600">Vendita Capo</h2>
                            <button type="button" onClick={() => setSaleModal(null)} className="p-2 hover:bg-gray-100 rounded-full"><X/></button>
                        </div>
                        <div className="space-y-6">
                            <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
                                <div className="text-xs font-black uppercase text-green-800">Capo selezionato</div>
                                <div className="text-xl font-black">{saleModal.animal?.tagId}</div>
                                <div className="text-[10px] font-bold text-green-600 uppercase">{saleModal.animal?.breed}</div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Data Vendita*</label>
                                <input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold"/>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Prezzo di Vendita (€)*</label>
                                <input name="price" type="number" step="0.01" required className="w-full p-4 bg-gray-50 border-none rounded-2xl font-black text-2xl" placeholder="0.00"/>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Cliente / Destinatario</label>
                                <input name="customer" className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold" placeholder="Nome cliente..."/>
                            </div>
                            <button type="submit" className="w-full py-5 bg-green-600 text-white rounded-[24px] font-black uppercase shadow-xl">Conferma Vendita</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default LivestockAnimalsPage;

