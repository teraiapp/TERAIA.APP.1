
import React, { useState, useMemo, useEffect } from 'react';
import { 
    Syringe, PlusCircle, Trash2, X, Save, ArrowLeft, 
    LayoutGrid, Calendar, CheckCircle2, Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { livestockService } from '../../services/livestockService';
import { LivestockUnit, LivestockVaccinePlan, LivestockSpecies } from '../../types';

const SPECIES_OPTIONS: LivestockSpecies[] = ['BOVINI', 'BUFALINI', 'OVINI', 'CAPRINI', 'SUINI', 'POLLAME', 'CONIGLI', 'EQUINI', 'API', 'ALTRO'];

const LivestockVaccinesPage: React.FC = () => {
    const navigate = useNavigate();
    const [units] = useState<LivestockUnit[]>(() => livestockService.getUnits());
    const [plans, setPlans] = useState<LivestockVaccinePlan[]>([]);
    const [modal, setModal] = useState(false);

    useEffect(() => {
        setPlans(livestockService.getVaccinePlans());
    }, []);

    const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const plan: LivestockVaccinePlan = {
            id: `plan-${Date.now()}`,
            unitId: f.get('unitId') as string,
            name: f.get('name') as string,
            species: f.get('species') as any,
            rows: []
        };
        livestockService.saveVaccinePlan(plan);
        setPlans(livestockService.getVaccinePlans());
        setModal(false);
    };

    const addRow = (pId: string) => {
        const vName = prompt("Nome vaccino:");
        if (!vName) return;
        const freq = Number(prompt("Frequenza giorni (es: 180 per 6 mesi):", "180"));
        
        const plan = plans.find(p => p.id === pId);
        if (plan) {
            plan.rows.push({
                id: `r-${Date.now()}`,
                vaccineName: vName,
                frequencyDays: freq,
                nextDueDate: new Date().toISOString().split('T')[0],
                active: true
            });
            livestockService.saveVaccinePlan(plan);
            setPlans(livestockService.getVaccinePlans());
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in pb-20">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/allevamento')} className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-all"><ArrowLeft size={20}/></button>
                    <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">Piani Vaccinali</h1>
                </div>
                <button onClick={() => setModal(true)} className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all flex items-center gap-2">
                    <PlusCircle size={18}/> Nuovo Piano
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {plans.map(plan => (
                    <div key={plan.id} className="bg-white rounded-[48px] p-10 shadow-xl border border-gray-100 group hover:border-indigo-500 transition-all">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className="text-2xl font-black text-text-primary uppercase tracking-tighter leading-none">{plan.name}</h3>
                                <p className="text-[10px] font-bold text-text-secondary uppercase mt-2">{plan.species} • Unità: {units.find(u=>u.id===plan.unitId)?.name || plan.unitId}</p>
                            </div>
                            <div className="p-4 bg-indigo-50 text-indigo-600 rounded-3xl"><Syringe size={28}/></div>
                        </div>

                        <div className="space-y-4">
                            {plan.rows.map(row => (
                                <div key={row.id} className="p-6 bg-gray-50 rounded-[32px] border border-gray-100 flex justify-between items-center group/row">
                                    <div>
                                        <p className="font-black text-sm uppercase text-text-primary">{row.vaccineName}</p>
                                        <p className="text-[10px] font-bold text-text-secondary uppercase flex items-center gap-2 mt-1">
                                            <Clock size={12}/> Prossimo: <b className="text-indigo-600">{new Date(row.nextDueDate).toLocaleDateString()}</b>
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => { livestockService.markVaccineDone(plan.id, row.id); setPlans(livestockService.getVaccinePlans()); }}
                                        className="px-6 py-2 bg-white text-indigo-600 border-2 border-indigo-100 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                    >
                                        Somministrato
                                    </button>
                                </div>
                            ))}
                            <button onClick={() => addRow(plan.id)} className="w-full py-4 border-2 border-dashed border-gray-200 rounded-[32px] text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-indigo-600 hover:border-indigo-600 transition-all">+ Aggiungi Vaccino</button>
                        </div>
                    </div>
                ))}
            </div>

            {modal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <form onSubmit={handleSave} className="bg-white rounded-[40px] shadow-2xl p-10 w-full max-w-xl animate-in zoom-in border-2 border-white">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black uppercase tracking-tighter text-indigo-600">Nuovo Piano</h2>
                            <button type="button" onClick={() => setModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><X/></button>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-text-secondary ml-1 tracking-widest">Titolo Piano*</label>
                                <input name="name" required className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold" placeholder="Es: Rimonta 2025"/>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1 tracking-widest">Unità Destinataria*</label>
                                    <select name="unitId" required className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold">
                                        {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1 tracking-widest">Specie*</label>
                                    <select name="species" required className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold">
                                        {SPECIES_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                            <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black uppercase shadow-xl hover:scale-105 transition-all text-xs tracking-widest">Crea Piano</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default LivestockVaccinesPage;
