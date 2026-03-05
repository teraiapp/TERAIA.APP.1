
import React, { useState, useEffect } from 'react';
import { Users, PlusCircle, Trash2, Mail, CheckCircle, Clock, ShieldAlert, Briefcase, Stethoscope, Leaf, X } from 'lucide-react';
import { Role, Professional } from '../../types';

const ProfessionalsPage: React.FC = () => {
    const [pros, setPros] = useState<Professional[]>(() => 
        JSON.parse(localStorage.getItem('teraia_professionals') || '[]')
    );
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem('teraia_professionals', JSON.stringify(pros));
    }, [pros]);

    const handleInvite = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const newPro: Professional = {
            id: `pro-${Date.now()}`,
            name: f.get('name') as string,
            email: f.get('email') as string,
            role: f.get('role') as any,
            status: 'pendente',
            invitedAt: new Date().toISOString()
        };
        setPros([...pros, newPro]);
        setIsModalOpen(false);
    };

    const handleRevoke = (id: string) => {
        if (confirm("Revocare l'accesso a questo professionista? Non potrà più consultare i dati aziendali.")) {
            setPros(pros.filter(p => p.id !== id));
        }
    };

    const getRoleIcon = (role: string) => {
        if (role === Role.AGRONOMO) return <Leaf className="text-green-600" />;
        if (role === Role.VETERINARIO) return <Stethoscope className="text-blue-600" />;
        return <Briefcase className="text-orange-600" />;
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Users className="text-primary" /> Rete Professionisti
                </h1>
                <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-primary-dark">
                    <PlusCircle size={20} /> Invita Consulente
                </button>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 flex gap-3">
                <ShieldAlert className="text-blue-600 shrink-0" />
                <p className="text-sm text-blue-800">
                    Qui puoi gestire chi ha accesso ai dati della tua azienda. Ogni professionista vede <b>solo</b> i moduli di sua competenza.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pros.map(p => (
                    <div key={p.id} className="bg-white p-6 rounded-xl shadow-md border-t-4 border-primary">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-gray-50 rounded-xl">{getRoleIcon(p.role)}</div>
                            <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${p.status === 'attivo' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {p.status}
                            </span>
                        </div>
                        <h3 className="font-bold text-lg">{p.name}</h3>
                        <p className="text-xs text-text-secondary mb-1">{p.role}</p>
                        <p className="text-xs text-text-secondary flex items-center gap-1 mb-4"><Mail size={12}/> {p.email}</p>
                        
                        <div className="flex gap-2 pt-4 border-t">
                            <button onClick={() => handleRevoke(p.id)} className="flex-1 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg flex items-center justify-center gap-2">
                                <Trash2 size={14}/> Revoca Accesso
                            </button>
                        </div>
                    </div>
                ))}
                {pros.length === 0 && (
                    <div className="col-span-full py-20 text-center text-text-secondary border-2 border-dashed rounded-2xl">
                        <Users className="mx-auto mb-4 opacity-20" size={64} />
                        <p>Nessun professionista collegato all'azienda.</p>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Autorizza Professionista</h2>
                            <button onClick={() => setIsModalOpen(false)}><X /></button>
                        </div>
                        <form onSubmit={handleInvite} className="space-y-4">
                            <div><label className="block text-xs font-bold uppercase mb-1">Nome Completo</label><input name="name" required className="w-full p-2 border rounded-lg" /></div>
                            <div><label className="block text-xs font-bold uppercase mb-1">Email</label><input type="email" name="email" required className="w-full p-2 border rounded-lg" /></div>
                            <div>
                                <label className="block text-xs font-bold uppercase mb-1">Ruolo Specializzazione</label>
                                <select name="role" className="w-full p-2 border rounded-lg bg-white">
                                    <option value={Role.AGRONOMO}>Agronomo</option>
                                    <option value={Role.VETERINARIO}>Veterinario</option>
                                    <option value={Role.COMMERCIALISTA}>Commercialista / Fiscale</option>
                                </select>
                            </div>
                            <div><label className="block text-xs font-bold uppercase mb-1">Note / Incarico</label><textarea name="notes" className="w-full p-2 border rounded-lg" rows={2} /></div>
                            <button type="submit" className="w-full py-3 bg-primary text-white font-bold rounded-xl mt-4">Invia Invito Mock</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfessionalsPage;
