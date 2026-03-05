
import React, { useState, useMemo, useEffect } from 'react';
import { PawPrint, PlusCircle, Stethoscope, Wheat, Milk, BarChart, Calendar, AlertTriangle, X, Edit, Trash2, CheckCircle, Info, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
    Allevamento, Animale, EventoAllevamento, ScadenzaAllevamento, PianoAlimentare, 
    initialAllevamenti, initialAnimali, initialEventi, initialScadenze, initialPianiAlimentari, 
    TipoEvento, Specie, TipoAnimale, StatoAnimale, CategoriaScadenza, StatoScadenza
} from '../../data/allevamentoData';

// Custom hook for localStorage persistence
function usePersistentState<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [state, setState] = useState<T>(() => {
        try {
            const storedValue = localStorage.getItem(key);
            if (storedValue) return JSON.parse(storedValue);
            localStorage.setItem(key, JSON.stringify(defaultValue));
            return defaultValue;
        } catch (error) { return defaultValue; }
    });
    useEffect(() => { localStorage.setItem(key, JSON.stringify(state)); }, [key, state]);
    return [state, setState];
}

const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
    <div className={`bg-surface rounded-xl shadow-md p-6 ${className}`}>{children}</div>
);

const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({ title, onClose, children }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-surface rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h3 className="text-xl font-bold text-text-primary">{title}</h3>
                <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full"><X size={24}/></button>
            </div>
            {children}
        </div>
    </div>
);

const LivestockPage: React.FC = () => {
    const navigate = useNavigate();
    const [allevamenti, setAllevamenti] = usePersistentState<Allevamento[]>('teraia_allevamenti', initialAllevamenti);
    const [animali, setAnimali] = usePersistentState<Animale[]>('teraia_animali', initialAnimali);
    const [eventi, setEventi] = usePersistentState<EventoAllevamento[]>('teraia_eventi', initialEventi);
    const [scadenze, setScadenze] = usePersistentState<ScadenzaAllevamento[]>('teraia_scadenze', initialScadenze);
    const [pianiAlimentari, setPianiAlimentari] = usePersistentState<PianoAlimentare[]>('teraia_piani_alimentari', initialPianiAlimentari);

    const [selectedAllevamento, setSelectedAllevamento] = useState<Allevamento | null>(allevamenti[0] || null);
    const [activeTab, setActiveTab] = useState('anagrafica');
    const [modal, setModal] = useState<{ type: 'anagrafica' | 'eventi' | 'scadenze' | 'alimentazione', action: 'add' | 'edit', data?: any } | null>(null);

    const stats = useMemo(() => {
        if (!selectedAllevamento) return { total: 0, active: 0, sold: 0, mortality: 0 };
        const relevantAnimali = animali.filter(a => a.allevamentoId === selectedAllevamento.id);
        const relevantEventi = eventi.filter(e => e.allevamentoId === selectedAllevamento.id);
        return {
            total: relevantAnimali.reduce((sum, a) => sum + (a.count || 1), 0),
            active: relevantAnimali.filter(a => a.status === 'Attivo').reduce((sum, a) => sum + (a.count || 1), 0),
            sold: relevantEventi.filter(e => e.type === 'Vendita').length,
            mortality: relevantEventi.filter(e => e.type === 'Mortalità').length,
        };
    }, [selectedAllevamento, animali, eventi]);

    const upcomingDeadlines = useMemo(() => {
        if (!selectedAllevamento) return [];
        return scadenze
            .filter(s => s.allevamentoId === selectedAllevamento.id && s.status === 'Da fare')
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 3);
    }, [selectedAllevamento, scadenze]);

    const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!modal || !selectedAllevamento) return;

        const formData = new FormData(e.currentTarget);
        const commonData = { allevamentoId: selectedAllevamento.id };

        try {
            switch (modal.type) {
                case 'anagrafica': {
                    const count = formData.get('type') === 'Gruppo' ? Number(formData.get('count')) : 1;
                    const record: Animale = {
                        id: modal.action === 'edit' ? modal.data.id : `anim-${Date.now()}`,
                        ...commonData,
                        identifier: formData.get('identifier') as string,
                        type: formData.get('type') as TipoAnimale,
                        species: formData.get('species') as Specie,
                        count: count,
                        entryDate: formData.get('entryDate') as string,
                        origin: formData.get('origin') as string,
                        status: formData.get('status') as StatoAnimale,
                        notes: formData.get('notes') as string,
                        healthRecords: modal.action === 'edit' ? modal.data.healthRecords : [],
                    };
                    setAnimali(prev => modal.action === 'edit' ? prev.map(a => a.id === record.id ? record : a) : [record, ...prev]);
                    break;
                }
                case 'eventi': {
                    const record: EventoAllevamento = {
                        id: modal.action === 'edit' ? modal.data.id : `evt-${Date.now()}`,
                        ...commonData,
                        animaleId: formData.get('animaleId') as string,
                        date: formData.get('date') as string,
                        type: formData.get('type') as TipoEvento,
                        notes: formData.get('notes') as string,
                        economicValue: Number(formData.get('economicValue')) || 0,
                    };
                    setEventi(prev => modal.action === 'edit' ? prev.map(ev => ev.id === record.id ? record : ev) : [record, ...prev]);
                    break;
                }
                case 'scadenze': {
                    const record: ScadenzaAllevamento = {
                        id: modal.action === 'edit' ? modal.data.id : `scad-${Date.now()}`,
                        ...commonData,
                        date: formData.get('date') as string,
                        description: formData.get('description') as string,
                        category: formData.get('category') as CategoriaScadenza,
                        status: formData.get('status') as StatoScadenza,
                    };
                    setScadenze(prev => modal.action === 'edit' ? prev.map(s => s.id === record.id ? record : s) : [record, ...prev]);
                    break;
                }
                case 'alimentazione': {
                    const record: PianoAlimentare = {
                        id: modal.action === 'edit' ? modal.data.id : `pa-${Date.now()}`,
                        ...commonData,
                        feedType: formData.get('feedType') as string,
                        period: formData.get('period') as string,
                        quantity: formData.get('quantity') as string,
                        notes: formData.get('notes') as string,
                    };
                    setPianiAlimentari(prev => modal.action === 'edit' ? prev.map(p => p.id === record.id ? record : p) : [record, ...prev]);
                    break;
                }
            }
            alert('Dati salvati con successo');
            setModal(null);
        } catch (err) {
            alert('Errore nel salvataggio. Riprova.');
        }
    };

    const handleDelete = (type: string, id: string) => {
        if (!window.confirm('Sei sicuro di voler eliminare questo record?')) return;
        switch (type) {
            case 'anagrafica': setAnimali(prev => prev.filter(a => a.id !== id)); break;
            case 'eventi': setEventi(prev => prev.filter(e => e.id !== id)); break;
            case 'scadenze': setScadenze(prev => prev.filter(s => s.id !== id)); break;
            case 'alimentazione': setPianiAlimentari(prev => prev.filter(p => p.id !== id)); break;
        }
    };

    const navigateToEconomy = (type: 'cost' | 'revenue', event: EventoAllevamento) => {
        const anim = animali.find(a => a.id === event.animaleId);
        navigate('/economia', {
            state: {
                prefill: {
                    type,
                    data: {
                        amount: event.economicValue,
                        description: `${event.type}: ${anim?.identifier || 'animale'}`,
                        category: type === 'cost' ? 'Acquisti' : 'Vendita Animali',
                        linkedTo: 'Allevamento'
                    }
                }
            }
        });
    };

    if (!selectedAllevamento) {
        return (
            <div className="text-center py-20">
                <PawPrint size={64} className="mx-auto text-gray-300 mb-4" />
                <h2 className="text-2xl font-bold">Nessun allevamento configurato</h2>
                <p className="text-text-secondary mt-2">Crea il tuo primo allevamento nelle impostazioni per iniziare.</p>
            </div>
        );
    }

    const currentAnimali = animali.filter(a => a.allevamentoId === selectedAllevamento.id);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
                    <PawPrint className="text-primary" /> {selectedAllevamento.name}
                </h1>
                <div className="flex gap-3">
                    <select 
                        value={selectedAllevamento.id} 
                        onChange={e => setSelectedAllevamento(allevamenti.find(a => a.id === e.target.value) || null)} 
                        className="p-2 border rounded-md bg-white text-sm font-semibold shadow-sm focus:ring-2 focus:ring-primary focus:outline-none"
                    >
                        {allevamenti.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-t-4 border-primary">
                    <h2 className="text-sm font-bold text-text-secondary uppercase mb-2">Capi Attivi</h2>
                    <p className="text-4xl font-extrabold text-primary">{stats.active}</p>
                    <p className="text-xs text-text-secondary mt-1">{selectedAllevamento.species}</p>
                </Card>
                <Card className="border-t-4 border-blue-500">
                    <h2 className="text-sm font-bold text-text-secondary uppercase mb-2">Eventi</h2>
                    <div className="space-y-1">
                        <p className="text-sm"><strong>Vendite:</strong> {stats.sold}</p>
                        <p className="text-sm"><strong>Mortalità:</strong> <span className={stats.mortality > 0 ? 'text-red-500 font-bold' : ''}>{stats.mortality}</span></p>
                    </div>
                </Card>
                <Card className="border-t-4 border-yellow-500">
                    <h2 className="text-sm font-bold text-text-secondary uppercase mb-2">Scadenze</h2>
                    <div className="space-y-1">
                        {upcomingDeadlines.length > 0 ? upcomingDeadlines.map(s => (
                            <p key={s.id} className="text-xs truncate text-yellow-700 font-medium">⏰ {s.date}: {s.description}</p>
                        )) : <p className="text-xs text-text-secondary italic">Nessuna scadenza.</p>}
                    </div>
                </Card>
                <Card className="border-t-4 border-secondary bg-orange-50">
                    <h2 className="text-sm font-bold text-text-secondary uppercase mb-2 flex items-center gap-1">
                        <Info size={14} className="text-secondary"/> Analisi AI
                    </h2>
                    <p className="text-xs text-orange-800 leading-relaxed italic">
                        {stats.mortality > 2 
                            ? "Anomalia rilevata: mortalità sopra la soglia. Controlla il benessere del gruppo." 
                            : "Stato dell'allevamento ottimale basato sugli ultimi eventi registrati."}
                    </p>
                </Card>
            </div>
            
            <div className="flex border-b overflow-x-auto scrollbar-hide">
                {['anagrafica', 'eventi', 'scadenze', 'alimentazione'].map(tab => (
                    <button 
                        key={tab} 
                        onClick={() => setActiveTab(tab)} 
                        className={`px-6 py-3 font-bold capitalize whitespace-nowrap transition-all ${activeTab === tab ? 'border-b-4 border-primary text-primary' : 'text-text-secondary hover:text-text-primary'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <Card>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold capitalize text-text-primary flex items-center gap-2">
                        {activeTab === 'anagrafica' && <PawPrint size={20} className="text-primary"/>}
                        {activeTab === 'eventi' && <Tag size={20} className="text-blue-500"/>}
                        {activeTab === 'scadenze' && <Calendar size={20} className="text-yellow-500"/>}
                        {activeTab === 'alimentazione' && <Wheat size={20} className="text-green-500"/>}
                        {activeTab}
                    </h2>
                    <button 
                        onClick={() => {
                            if (activeTab === 'eventi' && currentAnimali.length === 0) {
                                alert("Prima di aggiungere un evento, registra almeno un animale o gruppo in 'Anagrafica'.");
                                return;
                            }
                            setModal({ type: activeTab as any, action: 'add' });
                        }}
                        className="flex items-center px-4 py-2 bg-primary text-white text-sm rounded-lg font-bold hover:bg-primary-dark shadow-md transition-all"
                    >
                        <PlusCircle size={18} className="mr-2"/> Aggiungi
                    </button>
                </div>

                <div className="overflow-x-auto">
                    {activeTab === 'anagrafica' && (
                        <table className="w-full text-left">
                            <thead className="bg-gray-50"><tr className="border-b"><th className="p-3 text-xs font-bold uppercase text-text-secondary">Identificativo</th><th className="p-3 text-xs font-bold uppercase text-text-secondary">Specie/Tipo</th><th className="p-3 text-xs font-bold uppercase text-text-secondary">Capi</th><th className="p-3 text-xs font-bold uppercase text-text-secondary">Ingresso</th><th className="p-3 text-xs font-bold uppercase text-text-secondary">Stato</th><th className="p-3 text-xs font-bold uppercase text-text-secondary text-right">Azioni</th></tr></thead>
                            <tbody>
                                {currentAnimali.length > 0 ? currentAnimali.map(a => (
                                    <tr key={a.id} className="border-b hover:bg-gray-50 transition-colors">
                                        <td className="p-3 font-bold text-text-primary">{a.identifier}</td>
                                        <td className="p-3 text-sm">{a.species} <span className="text-xs text-text-secondary">({a.type})</span></td>
                                        <td className="p-3 text-sm">{a.count || 1}</td>
                                        <td className="p-3 text-sm">{new Date(a.entryDate).toLocaleDateString()}</td>
                                        <td className="p-3"><span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${a.status === 'Attivo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{a.status}</span></td>
                                        <td className="p-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => setModal({ type: 'anagrafica', action: 'edit', data: a })} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md"><Edit size={16}/></button>
                                                <button onClick={() => handleDelete('anagrafica', a.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md"><Trash2 size={16}/></button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : <tr><td colSpan={6} className="p-8 text-center text-text-secondary italic">Nessun animale registrato.</td></tr>}
                            </tbody>
                        </table>
                    )}

                    {activeTab === 'eventi' && (
                        <table className="w-full text-left">
                            <thead className="bg-gray-50"><tr className="border-b"><th className="p-3 text-xs font-bold uppercase text-text-secondary">Data</th><th className="p-3 text-xs font-bold uppercase text-text-secondary">Tipo</th><th className="p-3 text-xs font-bold uppercase text-text-secondary">Collegato a</th><th className="p-3 text-xs font-bold uppercase text-text-secondary">Valore</th><th className="p-3 text-xs font-bold uppercase text-text-secondary text-right">Azioni</th></tr></thead>
                            <tbody>
                                {eventi.filter(e => e.allevamentoId === selectedAllevamento.id).length > 0 ? eventi.filter(e => e.allevamentoId === selectedAllevamento.id).map(e => (
                                    <tr key={e.id} className="border-b hover:bg-gray-50 transition-colors">
                                        <td className="p-3 text-sm">{new Date(e.date).toLocaleDateString()}</td>
                                        <td className="p-3 font-bold text-sm">{e.type}</td>
                                        <td className="p-3 text-sm">{animali.find(a => a.id === e.animaleId)?.identifier || 'N/D'}</td>
                                        <td className="p-3 text-sm">
                                            {e.economicValue ? `${e.economicValue}€` : '-'}
                                            {(e.type === 'Acquisto' || e.type === 'Vendita') && (
                                                <button onClick={() => navigateToEconomy(e.type === 'Acquisto' ? 'cost' : 'revenue', e)} className="ml-2 text-[10px] font-bold text-blue-600 hover:underline">VAI A ECONOMIA</button>
                                            )}
                                        </td>
                                        <td className="p-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => setModal({ type: 'eventi', action: 'edit', data: e })} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md"><Edit size={16}/></button>
                                                <button onClick={() => handleDelete('eventi', e.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md"><Trash2 size={16}/></button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : <tr><td colSpan={5} className="p-8 text-center text-text-secondary italic">Nessun evento registrato.</td></tr>}
                            </tbody>
                        </table>
                    )}

                    {activeTab === 'scadenze' && (
                        <table className="w-full text-left">
                            <thead className="bg-gray-50"><tr className="border-b"><th className="p-3 text-xs font-bold uppercase text-text-secondary">Data</th><th className="p-3 text-xs font-bold uppercase text-text-secondary">Descrizione</th><th className="p-3 text-xs font-bold uppercase text-text-secondary">Categoria</th><th className="p-3 text-xs font-bold uppercase text-text-secondary">Stato</th><th className="p-3 text-xs font-bold uppercase text-text-secondary text-right">Azioni</th></tr></thead>
                            <tbody>
                                {scadenze.filter(s => s.allevamentoId === selectedAllevamento.id).length > 0 ? scadenze.filter(s => s.allevamentoId === selectedAllevamento.id).map(s => (
                                    <tr key={s.id} className="border-b hover:bg-gray-50 transition-colors">
                                        <td className={`p-3 text-sm font-bold ${s.status === 'Da fare' && new Date(s.date) < new Date() ? 'text-red-600' : ''}`}>{new Date(s.date).toLocaleDateString()}</td>
                                        <td className="p-3 text-sm">{s.description}</td>
                                        <td className="p-3 text-xs font-medium uppercase text-text-secondary">{s.category}</td>
                                        <td className="p-3"><span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${s.status === 'Completata' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{s.status}</span></td>
                                        <td className="p-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => setModal({ type: 'scadenze', action: 'edit', data: s })} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md"><Edit size={16}/></button>
                                                <button onClick={() => handleDelete('scadenze', s.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md"><Trash2 size={16}/></button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : <tr><td colSpan={5} className="p-8 text-center text-text-secondary italic">Nessuna scadenza registrata.</td></tr>}
                            </tbody>
                        </table>
                    )}

                    {activeTab === 'alimentazione' && (
                        <table className="w-full text-left">
                            <thead className="bg-gray-50"><tr className="border-b"><th className="p-3 text-xs font-bold uppercase text-text-secondary">Mangime</th><th className="p-3 text-xs font-bold uppercase text-text-secondary">Periodo</th><th className="p-3 text-xs font-bold uppercase text-text-secondary">Quantità</th><th className="p-3 text-xs font-bold uppercase text-text-secondary text-right">Azioni</th></tr></thead>
                            <tbody>
                                {pianiAlimentari.filter(p => p.allevamentoId === selectedAllevamento.id).length > 0 ? pianiAlimentari.filter(p => p.allevamentoId === selectedAllevamento.id).map(p => (
                                    <tr key={p.id} className="border-b hover:bg-gray-50 transition-colors">
                                        <td className="p-3 font-bold text-sm">{p.feedType}</td>
                                        <td className="p-3 text-sm">{p.period}</td>
                                        <td className="p-3 text-sm">{p.quantity}</td>
                                        <td className="p-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => setModal({ type: 'alimentazione', action: 'edit', data: p })} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md"><Edit size={16}/></button>
                                                <button onClick={() => handleDelete('alimentazione', p.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md"><Trash2 size={16}/></button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : <tr><td colSpan={4} className="p-8 text-center text-text-secondary italic">Nessun piano alimentare registrato.</td></tr>}
                            </tbody>
                        </table>
                    )}
                </div>
            </Card>

            {modal && (
                <Modal title={`${modal.action === 'add' ? 'Aggiungi' : 'Modifica'} ${modal.type === 'anagrafica' ? 'Animale/Gruppo' : modal.type}`} onClose={() => setModal(null)}>
                    <form onSubmit={handleSave} className="space-y-4">
                        {modal.type === 'anagrafica' && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div><label className="block text-sm font-bold mb-1">Identificativo (Nome/Matricola)*</label><input name="identifier" defaultValue={modal.data?.identifier} required className="w-full p-2 border rounded bg-gray-50" placeholder="Es. IT02100..."/></div>
                                    <div><label className="block text-sm font-bold mb-1">Specie*</label><select name="species" defaultValue={modal.data?.species || selectedAllevamento.species} className="w-full p-2 border rounded bg-white">{['Bovini', 'Ovini', 'Caprini', 'Suini', 'Avicoli', 'Equini', 'Altro'].map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div><label className="block text-sm font-bold mb-1">Tipo*</label><select name="type" defaultValue={modal.data?.type || 'Individuale'} className="w-full p-2 border rounded bg-white"><option value="Individuale">Capi Singolo</option><option value="Gruppo">Gruppo di Animali</option></select></div>
                                    <div><label className="block text-sm font-bold mb-1">Numero Capi (se gruppo)</label><input type="number" name="count" defaultValue={modal.data?.count || 1} className="w-full p-2 border rounded bg-gray-50" /></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div><label className="block text-sm font-bold mb-1">Data Ingresso*</label><input type="date" name="entryDate" defaultValue={modal.data?.entryDate || new Date().toISOString().split('T')[0]} required className="w-full p-2 border rounded bg-gray-50" /></div>
                                    <div><label className="block text-sm font-bold mb-1">Provenienza</label><input name="origin" defaultValue={modal.data?.origin} className="w-full p-2 border rounded bg-gray-50" placeholder="Es. Nato in azienda"/></div>
                                </div>
                                <div><label className="block text-sm font-bold mb-1">Stato*</label><select name="status" defaultValue={modal.data?.status || 'Attivo'} className="w-full p-2 border rounded bg-white"><option value="Attivo">Attivo</option><option value="Venduto">Venduto</option><option value="Deceduto">Deceduto</option></select></div>
                                <div><label className="block text-sm font-bold mb-1">Note</label><textarea name="notes" defaultValue={modal.data?.notes} rows={2} className="w-full p-2 border rounded bg-gray-50" /></div>
                            </>
                        )}

                        {modal.type === 'eventi' && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div><label className="block text-sm font-bold mb-1">Data*</label><input type="date" name="date" defaultValue={modal.data?.date || new Date().toISOString().split('T')[0]} required className="w-full p-2 border rounded bg-gray-50" /></div>
                                    <div><label className="block text-sm font-bold mb-1">Tipo Evento*</label><select name="type" defaultValue={modal.data?.type || 'Visita'} className="w-full p-2 border rounded bg-white">{['Nascita', 'Acquisto', 'Vendita', 'Spostamento', 'Mortalità', 'Trattamento', 'Visita', 'Altro'].map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1">Animale/Gruppo Collegato*</label>
                                    <select name="animaleId" defaultValue={modal.data?.animaleId} required className="w-full p-2 border rounded bg-white">
                                        <option value="">Seleziona...</option>
                                        {currentAnimali.map(a => <option key={a.id} value={a.id}>{a.identifier} ({a.type})</option>)}
                                    </select>
                                </div>
                                <div><label className="block text-sm font-bold mb-1">Valore Economico (€)</label><input type="number" step="0.01" name="economicValue" defaultValue={modal.data?.economicValue} className="w-full p-2 border rounded bg-gray-50" placeholder="Opzionale per acquisti/vendite"/></div>
                                <div><label className="block text-sm font-bold mb-1">Descrizione/Note</label><textarea name="notes" defaultValue={modal.data?.notes} rows={3} className="w-full p-2 border rounded bg-gray-50" required /></div>
                            </>
                        )}

                        {modal.type === 'scadenze' && (
                            <>
                                <div><label className="block text-sm font-bold mb-1">Titolo Scadenza*</label><input name="description" defaultValue={modal.data?.description} required className="w-full p-2 border rounded bg-gray-50" placeholder="Es. Controllo registri"/></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div><label className="block text-sm font-bold mb-1">Data Scadenza*</label><input type="date" name="date" defaultValue={modal.data?.date || new Date().toISOString().split('T')[0]} required className="w-full p-2 border rounded bg-gray-50" /></div>
                                    <div><label className="block text-sm font-bold mb-1">Categoria*</label><select name="category" defaultValue={modal.data?.category || 'Altro'} className="w-full p-2 border rounded bg-white">{['Sanitaria', 'HACCP', 'Registri', 'Vaccinazioni', 'Altro'].map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                                </div>
                                <div><label className="block text-sm font-bold mb-1">Stato*</label><select name="status" defaultValue={modal.data?.status || 'Da fare'} className="w-full p-2 border rounded bg-white"><option value="Da fare">Da fare</option><option value="Completata">Completata</option></select></div>
                            </>
                        )}

                        {modal.type === 'alimentazione' && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div><label className="block text-sm font-bold mb-1">Tipo Mangime*</label><input name="feedType" defaultValue={modal.data?.feedType} required className="w-full p-2 border rounded bg-gray-50" placeholder="Es. Fieno di erba medica"/></div>
                                    <div><label className="block text-sm font-bold mb-1">Quantità</label><input name="quantity" defaultValue={modal.data?.quantity} className="w-full p-2 border rounded bg-gray-50" placeholder="Es. 5kg/giorno"/></div>
                                </div>
                                <div><label className="block text-sm font-bold mb-1">Periodo*</label><input name="period" defaultValue={modal.data?.period} required className="w-full p-2 border rounded bg-gray-50" placeholder="Es. Invernale / Svezzamento"/></div>
                                <div><label className="block text-sm font-bold mb-1">Note</label><textarea name="notes" defaultValue={modal.data?.notes} rows={2} className="w-full p-2 border rounded bg-gray-50" /></div>
                            </>
                        )}

                        <div className="pt-6 flex gap-3">
                            <button type="button" onClick={() => setModal(null)} className="flex-1 py-2 border border-gray-300 rounded-lg font-bold hover:bg-gray-50 transition-all">Annulla</button>
                            <button type="submit" className="flex-1 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark shadow-md transition-all">Salva Record</button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default LivestockPage;
