
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Stethoscope, PlusCircle, Trash2, Edit, X, 
    Mail, ArrowLeft, ShieldCheck, Check, User
} from 'lucide-react';
import { livestockStorage, generateId } from '../../services/livestockStorage';
import { LivestockVetAssignment, LivestockUnit } from '../../types';

const LivestockVetsPortalPage: React.FC = () => {
    const navigate = useNavigate();
    const [vets, setVets] = useState<LivestockVetAssignment[]>([]);
    const [units, setUnits] = useState<LivestockUnit[]>([]);
    const [modal, setModal] = useState<{ show: boolean, data?: LivestockVetAssignment } | null>(null);

    useEffect(() => {
        setVets(livestockStorage.getVets());
        setUnits(livestockStorage.getUnits());
    }, []);

    const handleSaveVet = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const selectedUnits = units.filter(u => f.get(`unit_${u.id}`) === 'on').map(u => u.id);

        const vet: LivestockVetAssignment = {
            id: modal?.data?.id || generateId(),
            name: f.get('name') as string,
            email: f.get('email') as string,
            assignedUnitIds: selectedUnits
        };

        livestockStorage.saveVet(vet);
        setVets(livestockStorage.getVets());
        setModal(null);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/allevamento')} className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 shadow-sm text-text-secondary"><ArrowLeft size={20}/></button>
                <h1 className="text-3xl font-black text-text-primary uppercase tracking-tighter">Network Veterinario</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center px-1">
                        <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                            <ShieldCheck size={24} className="text-blue-500"/> Medici Assegnati
                        </h2>
                        <button onClick={() => setModal({ show: true })} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all">
                            <PlusCircle size={18}/> Invita Veterinario
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {vets.length > 0 ? vets.map(v => (
                            <div key={v.id} className="bg-white rounded-[32px] p-8 shadow-xl border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-8 group hover:border-blue-500 transition-all">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 text-3xl"><User size={32}/></div>
                                    <div>
                                        <h3 className="text-2xl font-black text-text-primary uppercase tracking-tighter leading-none">{v.name}</h3>
                                        <p className="text-xs font-bold text-text-secondary mt-1 flex items-center gap-1 uppercase"><Mail size={12}/> {v.email}</p>
                                        <div className="flex flex-wrap gap-1 mt-4">
                                            {v.assignedUnitIds.map(uid => (
                                                <span key={uid} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[9px] font-black uppercase rounded-md border border-blue-100">
                                                    {units.find(u=>u.id===uid)?.name || uid}
                                                </span>
                                            ))}
                                            {v.assignedUnitIds.length === 0 && <span className="text-[9px] font-bold text-red-400 uppercase italic">Nessuna unità assegnata</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setModal({ show: true, data: v })} className="p-3 bg-gray-50 text-text-secondary rounded-xl hover:bg-blue-50 hover:text-blue-600"><Edit size={18}/></button>
                                    <button onClick={() => { if(window.confirm('Rimuovere accesso?')) { livestockStorage.deleteVet(v.id); setVets(livestockStorage.getVets()); }}} className="p-3 bg-gray-50 text-text-secondary rounded-xl hover:bg-red-50 hover:text-red-500"><Trash2 size={18}/></button>
                                </div>
                            </div>
                        )) : (
                            <div className="p-20 text-center bg-gray-50 rounded-[48px] border-2 border-dashed border-gray-200">
                                <p className="text-text-secondary font-black uppercase text-sm">Nessun veterinario nel tuo network.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-gray-900 rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden h-fit">
                    <ShieldCheck className="absolute -top-4 -right-4 w-40 h-40 text-white/5" />
                    <h3 className="text-xl font-black uppercase tracking-tighter mb-4 relative z-10">Governance Professionisti</h3>
                    <p className="text-xs opacity-70 font-medium leading-relaxed mb-8 relative z-10">Invitando un veterinario, quest'ultimo potrà accedere ai moduli Sanità e Scadenze per le unità assegnate. I dati di Produzione e Alimentazione resteranno protetti e in sola lettura.</p>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-[10px] font-black uppercase text-primary"><Check size={14}/> Firma Digitale Registro</div>
                        <div className="flex items-center gap-3 text-[10px] font-black uppercase text-primary"><Check size={14}/> Tracciabilità Farmaci</div>
                        <div className="flex items-center gap-3 text-[10px] font-black uppercase text-primary"><Check size={14}/> Early Warning Malattie</div>
                    </div>
                </div>
            </div>

            {modal?.show && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[40px] shadow-2xl p-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto border-2 border-white">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black uppercase tracking-tighter">Autorizza Professionista</h2>
                            <button onClick={() => setModal(null)} className="p-2 hover:bg-gray-100 rounded-full"><X/></button>
                        </div>
                        <form onSubmit={handleSaveVet} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Nome e Cognome*</label>
                                    <input name="name" required defaultValue={modal.data?.name} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold" placeholder="Dr. Marco Rossi"/>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Email Ufficiale*</label>
                                    <input name="email" type="email" required defaultValue={modal.data?.email} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold" placeholder="vet@studio.it"/>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase text-text-secondary ml-1 block">Assegna Unità Operative</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-6 bg-gray-50 rounded-3xl">
                                    {units.map(u => (
                                        <label key={u.id} className="flex items-center gap-3 cursor-pointer group">
                                            <input type="checkbox" name={`unit_${u.id}`} defaultChecked={modal.data?.assignedUnitIds.includes(u.id)} className="w-6 h-6 accent-blue-600 rounded-lg"/>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black uppercase text-text-primary group-hover:text-blue-600">{u.name}</span>
                                                <span className="text-[8px] font-bold text-text-secondary uppercase">{u.species}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black uppercase text-xs tracking-widest shadow-xl">Salva Incarico</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LivestockVetsPortalPage;
