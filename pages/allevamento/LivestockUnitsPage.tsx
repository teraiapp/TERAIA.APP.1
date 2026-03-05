
import React, { useState, useMemo } from 'react';
import { 
    LayoutGrid, PlusCircle, Trash2, Edit, X, Save, 
    ArrowLeft, MapPin, Tag, Briefcase, Info, PawPrint,
    /* Added missing icon */
    ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { livestockService } from '../../services/livestockService';
import { UnitLivestock, Species, ProductionType, ManagementMode } from '../../types';

const SPECIES: Species[] = ["BOVINI", "BUFALINI", "OVINI", "CAPRINI", "SUINI", "POLLAME", "CONIGLI", "EQUINI", "API"];
const PRODUCTIONS: ProductionType[] = ["LATTE", "CARNE", "UOVA", "LANA", "RIPRODUZIONE", "MISTO"];
const MODES: ManagementMode[] = ["GROUP", "INDIVIDUAL", "HYBRID"];

const LivestockUnitsPage: React.FC = () => {
    const navigate = useNavigate();
    const [units, setUnits] = useState<UnitLivestock[]>(() => livestockService.getUnits());
    const [modal, setModal] = useState<{ show: boolean, data?: UnitLivestock } | null>(null);

    const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const unit: UnitLivestock = {
            id: modal?.data?.id || `u-${Date.now()}`,
            name: f.get('name') as string,
            species: f.get('species') as Species,
            productionType: f.get('productionType') as ProductionType,
            managementMode: f.get('managementMode') as ManagementMode,
            notes: f.get('notes') as string,
            createdAt: modal?.data?.createdAt || Date.now()
        };
        livestockService.saveUnit(unit);
        setUnits(livestockService.getUnits());
        setModal(null);
    };

    const handleDelete = (id: string) => {
        if (confirm("Eliminare questa unità? I gruppi e gli animali non verranno cancellati ma resteranno orfani.")) {
            livestockService.deleteUnit(id);
            setUnits(livestockService.getUnits());
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/allevamento')} className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 hover:bg-gray-50"><ArrowLeft size={20}/></button>
                    <h1 className="text-3xl font-black uppercase tracking-tighter">Unità Operative</h1>
                </div>
                <button onClick={() => setModal({ show: true })} className="px-6 py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase shadow-xl hover:scale-105 transition-all flex items-center gap-2">
                    <PlusCircle size={18}/> Nuova Unità
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {units.map(u => (
                    <div key={u.id} className="bg-white rounded-[40px] p-8 shadow-xl border border-gray-100 group hover:border-primary transition-all flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-4 bg-primary/10 text-primary rounded-3xl group-hover:rotate-6 transition-transform"><PawPrint size={24}/></div>
                                <div className="flex gap-1">
                                    <button onClick={() => setModal({ show: true, data: u })} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={16}/></button>
                                    <button onClick={() => handleDelete(u.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                                </div>
                            </div>
                            <h3 className="text-2xl font-black uppercase tracking-tighter mb-4 leading-none">{u.name}</h3>
                            <div className="space-y-2 mb-8">
                                <p className="text-[10px] font-black text-text-secondary uppercase flex items-center gap-2"><Tag size={12} className="text-primary"/> {u.species} • {u.productionType}</p>
                                <p className="text-[10px] font-black text-text-secondary uppercase flex items-center gap-2"><Briefcase size={12} className="text-primary"/> Modalità: {u.managementMode}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => navigate(u.managementMode === 'GROUP' ? '/allevamento/gruppi' : '/allevamento/animali')} 
                            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary transition-all flex items-center justify-center gap-2"
                        >
                            Gestisci Popolazione <ChevronRight size={14}/>
                        </button>
                    </div>
                ))}
            </div>

            {/* MODALE CRUD UNIT */}
            {modal?.show && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <form onSubmit={handleSave} className="bg-white rounded-[40px] shadow-2xl p-10 w-full max-w-xl animate-in zoom-in border-2 border-white">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black uppercase tracking-tighter">Configura Unità</h2>
                            <button type="button" onClick={() => setModal(null)} className="p-2 hover:bg-gray-100 rounded-full"><X/></button>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Nome Unità*</label>
                                <input name="name" required defaultValue={modal.data?.name} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold" placeholder="Es: Stalla A1"/>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Specie*</label>
                                    <select name="species" defaultValue={modal.data?.species} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold">
                                        {SPECIES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Produzione*</label>
                                    <select name="productionType" defaultValue={modal.data?.productionType} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold">
                                        {PRODUCTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Metodo di Tracciamento*</label>
                                <select name="managementMode" defaultValue={modal.data?.managementMode} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold">
                                    {MODES.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                            <button type="submit" className="w-full py-5 bg-primary text-white rounded-[24px] font-black uppercase shadow-xl hover:scale-105 transition-all">Salva Unità</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default LivestockUnitsPage;
