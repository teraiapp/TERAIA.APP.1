
import React, { useState, useEffect, useMemo } from 'react';
import { 
    Sprout, PlusCircle, Search, X, 
    Edit, Trash2, Phone, Mail, MapPin, 
    AlertCircle, ExternalLink
} from 'lucide-react';

interface Nursery {
    id: string;
    name: string;
    region: string;
    province: string;
    city: string;
    phone: string;
    email: string;
    category: 'Orticole' | 'Fruttiferi' | 'Vite' | 'Tropicali' | 'Altro';
    notes: string;
}

const STORAGE_KEY = 'teraia_vivai_v1';

const NurseriesPage: React.FC = () => {
    const [nurseries, setNurseries] = useState<Nursery[]>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    });

    const [modal, setModal] = useState<{show: boolean, type: 'add' | 'edit', data?: Nursery} | null>(null);
    const [filterRegion, setFilterRegion] = useState('');
    const [filterCategory, setFilterCategory] = useState('Tutte');

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nurseries));
    }, [nurseries]);

    const filteredList = useMemo(() => {
        return nurseries.filter(n => {
            const matchRegion = !filterRegion || n.region.toLowerCase().includes(filterRegion.toLowerCase());
            const matchCat = filterCategory === 'Tutte' || n.category === filterCategory;
            return matchRegion && matchCat;
        });
    }, [nurseries, filterRegion, filterCategory]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const nurseryData: Nursery = {
            id: modal?.type === 'edit' ? modal.data!.id : `nur-${Date.now()}`,
            name: f.get('name') as string,
            region: f.get('region') as string,
            province: f.get('province') as string,
            city: f.get('city') as string,
            phone: f.get('phone') as string,
            email: f.get('email') as string,
            category: f.get('category') as any,
            notes: f.get('notes') as string,
        };

        if (modal?.type === 'edit') {
            setNurseries(prev => prev.map(n => n.id === nurseryData.id ? nurseryData : n));
        } else {
            setNurseries(prev => [nurseryData, ...prev]);
        }
        setModal(null);
    };

    const handleDelete = (id: string) => {
        if(confirm("Eliminare questo vivaio dai contatti?")) {
            setNurseries(prev => prev.filter(n => n.id !== id));
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-text-primary flex items-center gap-3">
                        <Sprout className="text-primary" size={32} /> Vivai
                    </h1>
                    <p className="text-text-secondary text-sm">Gestione anagrafica e contatti dei tuoi vivai di fiducia.</p>
                </div>
                <button 
                    onClick={() => setModal({show: true, type: 'add'})}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark shadow-lg transition-all active:scale-95"
                >
                    <PlusCircle size={20}/> Aggiungi Vivaio
                </button>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18}/>
                    <input 
                        type="text" placeholder="Filtra per regione..." 
                        className="w-full pl-10 pr-4 py-2 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-primary outline-none"
                        value={filterRegion} onChange={e => setFilterRegion(e.target.value)}
                    />
                </div>
                <select 
                    className="p-2 border rounded-xl bg-gray-50 font-bold text-sm outline-none"
                    value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
                >
                    <option value="Tutte">Tutte le categorie</option>
                    {['Orticole', 'Fruttiferi', 'Vite', 'Tropicali', 'Altro'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            {filteredList.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredList.map(n => (
                        <div key={n.id} className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-xl transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-green-50 rounded-xl text-primary"><Sprout size={24}/></div>
                                <span className="text-[10px] font-black uppercase px-2 py-1 bg-gray-100 text-gray-600 rounded-full">{n.category}</span>
                            </div>
                            <h3 className="text-xl font-bold text-text-primary mb-1">{n.name}</h3>
                            <p className="text-xs text-text-secondary flex items-center gap-1 mb-4"><MapPin size={12}/> {n.city} ({n.province}), {n.region}</p>
                            
                            <div className="space-y-2 mb-6">
                                {n.phone && <a href={`tel:${n.phone}`} className="flex items-center gap-2 text-sm text-text-primary hover:text-primary"><Phone size={14}/> {n.phone}</a>}
                                {n.email && <a href={`mailto:${n.email}`} className="flex items-center gap-2 text-sm text-text-primary hover:text-primary"><Mail size={14}/> {n.email}</a>}
                            </div>

                            <div className="flex gap-2 pt-4 border-t border-gray-50">
                                <button onClick={() => setModal({show: true, type: 'edit', data: n})} className="flex-1 py-2 bg-gray-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-50">Modifica</button>
                                <button onClick={() => handleDelete(n.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200">
                    <Sprout size={64} className="mx-auto text-gray-200 mb-4" />
                    <h2 className="text-2xl font-black text-text-primary">Nessun Vivaio</h2>
                    <p className="text-text-secondary max-w-sm mx-auto mb-6">Inizia aggiungendo il tuo primo fornitore di piantine.</p>
                    <button onClick={() => setModal({show: true, type: 'add'})} className="px-6 py-2 bg-primary text-white rounded-xl font-bold">Aggiungi Ora</button>
                </div>
            )}

            {modal?.show && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black">{modal.type === 'add' ? 'Nuovo Vivaio' : 'Modifica Vivaio'}</h2>
                            <button onClick={() => setModal(null)} className="p-2 hover:bg-gray-100 rounded-full"><X/></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input name="name" defaultValue={modal.data?.name} placeholder="Nome Vivaio *" required className="w-full p-3 border rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-primary"/>
                            <div className="grid grid-cols-2 gap-4">
                                <input name="region" defaultValue={modal.data?.region} placeholder="Regione *" required className="p-3 border rounded-xl bg-gray-50"/>
                                <input name="province" defaultValue={modal.data?.province} placeholder="Provincia (Sigla) *" required className="p-3 border rounded-xl bg-gray-50"/>
                            </div>
                            <input name="city" defaultValue={modal.data?.city} placeholder="Città / Comune" className="w-full p-3 border rounded-xl bg-gray-50"/>
                            <div className="grid grid-cols-2 gap-4">
                                <input name="phone" defaultValue={modal.data?.phone} placeholder="Telefono" className="p-3 border rounded-xl bg-gray-50"/>
                                <input name="email" defaultValue={modal.data?.email} placeholder="Email" type="email" className="p-3 border rounded-xl bg-gray-50"/>
                            </div>
                            <select name="category" defaultValue={modal.data?.category || 'Orticole'} className="w-full p-3 border rounded-xl bg-gray-50 font-bold outline-none focus:ring-2 focus:ring-primary">
                                {['Orticole', 'Fruttiferi', 'Vite', 'Tropicali', 'Altro'].map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <textarea name="notes" defaultValue={modal.data?.notes} placeholder="Note aggiuntive" rows={3} className="w-full p-3 border rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-primary"/>
                            <button type="submit" className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-xl hover:bg-primary-dark transition-all">SALVA VIVAIO</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NurseriesPage;
