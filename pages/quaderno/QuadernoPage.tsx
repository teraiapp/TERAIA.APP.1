
import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { BookText, PlusCircle, FileDown, Edit, Trash2, X, LayoutGrid, Info, AlertCircle, Save } from 'lucide-react';
import { CampBookEntry, CampBookEntryType, initialCampBookEntries } from '../../data/quadernoData';
import { useAppContext } from '../../hooks/useAppContext';
import { Role } from '../../types';

// --- PERSISTENCE HOOK ---
function usePersistentState<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [state, setState] = useState<T>(() => {
        try {
            const storedValue = localStorage.getItem(key);
            if (storedValue) return JSON.parse(storedValue);
            return defaultValue;
        } catch (error) { return defaultValue; }
    });
    useEffect(() => { localStorage.setItem(key, JSON.stringify(state)); }, [key, state]);
    return [state, setState];
}

const TABS: { id: CampBookEntryType, label: string }[] = [
    { id: 'trattamento', label: 'Trattamenti' },
    { id: 'fertilizzazione', label: 'Fertilizzazioni' },
    { id: 'irrigazione', label: 'Irrigazioni' },
    { id: 'lavorazione', label: 'Lavorazioni' },
    { id: 'raccolta', label: 'Raccolte' },
    { id: 'nota', label: 'Note' },
];

const ENTRIES_KEY = 'teraia_campbook_entries_v1';
const PRODUCTION_UNITS_KEY = 'teraia_production_units_v1';

const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
    <div className={`bg-surface rounded-xl shadow-md p-6 ${className}`}>{children}</div>
);

const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({ title, onClose, children }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className={`bg-surface rounded-xl shadow-2xl p-6 w-full max-w-3xl`} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold">{title}</h3><button onClick={onClose}><X size={24}/></button></div>
            {children}
        </div>
    </div>
);

const QuadernoPage: React.FC = () => {
    const { currentUser } = useAppContext();
    const location = useLocation();
    const [allUnits] = usePersistentState<any[]>(PRODUCTION_UNITS_KEY, []);
    const [entries, setEntries] = usePersistentState<CampBookEntry[]>(ENTRIES_KEY, initialCampBookEntries);
    
    // Filtraggio Unità per Professionista
    const units = useMemo(() => {
        if (currentUser?.role === Role.AGRONOMO) return allUnits.filter(u => u.type !== 'Allevamento');
        return allUnits;
    }, [allUnits, currentUser]);

    const [selectedUnitId, setSelectedUnitId] = useState<string | number>(() => units.length > 0 ? units[0].id : '');
    const [activeTab, setActiveTab] = useState<CampBookEntryType>('trattamento');
    const [modal, setModal] = useState<{ type: 'add' | 'edit' | 'draft'; data?: Partial<CampBookEntry> } | null>(null);
    const [search, setSearch] = useState('');
    
    // Fix: Removed reference to non-existent Role.VIEWER
    const isReadOnly = currentUser?.role === Role.COMMERCIALISTA;
    const selectedUnit = useMemo(() => units.find(u => u.id === selectedUnitId), [units, selectedUnitId]);

    // Gestione Draft da AI
    useEffect(() => {
        const state = location.state as any;
        if (state?.prefill) {
            const prefill = state.prefill;
            setSelectedUnitId(prefill.unitId);
            setActiveTab(prefill.type);
            setModal({ 
                type: 'draft', 
                data: { 
                    type: prefill.type,
                    unitId: prefill.unitId,
                    crop: prefill.crop,
                    date: new Date().toISOString().split('T')[0],
                    details: prefill.details
                } 
            });
            // Pulisce lo stato della rotta per evitare che riappaia al refresh
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    const handleSaveEntry = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        
        const newEntry: CampBookEntry = {
            id: modal?.data?.id || `entry-${Date.now()}`,
            unitId: selectedUnitId,
            type: activeTab,
            date: f.get('date') as string,
            unitType: selectedUnit?.type || 'Campo',
            unitName: selectedUnit?.name || '',
            crop: f.get('crop') as string,
            details: activeTab === 'trattamento' ? {
                product: f.get('product') as string,
                dose: f.get('dose') as string,
                adversity: f.get('adversity') as string,
                reason: f.get('reason') as string,
                operator: f.get('operator') as string,
                safetyIntervalDays: Number(f.get('phi')) || 0
            } : {} as any, // Semplificato per brevità
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (modal?.type === 'edit') {
            setEntries(prev => prev.map(en => en.id === newEntry.id ? newEntry : en));
        } else {
            setEntries(prev => [newEntry, ...prev]);
        }
        setModal(null);
    };

    const filteredEntries = useMemo(() => {
        return entries
            .filter(e => e.type === activeTab)
            .filter(e => String(e.unitId) === String(selectedUnitId))
            .filter(e => !search || JSON.stringify(e).toLowerCase().includes(search.toLowerCase()))
            .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [entries, activeTab, selectedUnitId, search]);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-3xl font-bold text-text-primary flex items-center"><BookText className="mr-3 text-primary"/>Quaderno di Campagna</h1>
                
                <div className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border w-full md:w-auto">
                    <LayoutGrid size={18} className="text-text-secondary ml-2 shrink-0" />
                    <select 
                        value={selectedUnitId} 
                        onChange={e => setSelectedUnitId(e.target.value)}
                        className="bg-transparent font-bold text-sm focus:outline-none w-full"
                    >
                        {units.length === 0 && <option value="">Nessuna unità agricola</option>}
                        {units.map(u => (
                            <option key={u.id} value={u.id}>{u.name} ({u.type})</option>
                        ))}
                    </select>
                </div>
            </div>

            {selectedUnit ? (
                <>
                    <div className="flex border-b flex-wrap gap-2">
                        {TABS.map(tab => (
                            <button 
                                key={tab.id} 
                                onClick={() => setActiveTab(tab.id)} 
                                className={`px-6 py-3 font-bold text-sm transition-all border-b-4 ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    
                    <Card>
                        <div className="flex flex-wrap gap-4 items-center justify-between">
                            <input type="search" placeholder="Cerca tra le attività..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 p-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary" />
                            {!isReadOnly && <button onClick={() => setModal({ type: 'add' })} className="px-5 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark">Nuova Registrazione</button>}
                        </div>
                    </Card>

                    <Card className="p-0 overflow-hidden">
                         <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 border-b text-text-secondary uppercase text-[10px] font-black">
                                    <tr><th className="p-4">Data</th><th className="p-4">Coltura</th><th className="p-4">Dettaglio</th>{!isReadOnly && <th className="p-4 text-right">Azioni</th>}</tr>
                                </thead>
                                <tbody className="divide-y">
                                    {filteredEntries.map(entry => (
                                        <tr key={entry.id} className="hover:bg-gray-50/50">
                                            <td className="p-4 font-semibold">{new Date(entry.date).toLocaleDateString()}</td>
                                            <td className="p-4">{entry.crop}</td>
                                            <td className="p-4 text-xs">
                                                {Object.entries(entry.details).map(([k, v]) => <span key={k} className="mr-3"><b>{k}:</b> {String(v)}</span>)}
                                            </td>
                                            {!isReadOnly && (
                                                <td className="p-4 text-right">
                                                    <button onClick={() => setModal({ type: 'edit', data: entry })} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit size={16}/></button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredEntries.length === 0 && <p className="p-8 text-center text-text-secondary italic">Nessun record trovato.</p>}
                         </div>
                    </Card>
                </>
            ) : (
                <div className="bg-gray-100 p-12 text-center rounded-3xl border-2 border-dashed">
                    <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-text-secondary font-bold">Seleziona un'Unità Agricola per consultare il Quaderno.</p>
                </div>
            )}

            {modal && (
                <Modal title={modal.type === 'draft' ? "Bozza Trattamento AI (Conferma)" : "Registrazione Attività"} onClose={() => setModal(null)}>
                    {modal.type === 'draft' && (
                        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
                            <Info className="text-blue-600 shrink-0" size={20}/>
                            <p className="text-xs text-blue-800">Questo record è stato pre-compilato dall'AI. Verifica correttezza e dosaggi prima di salvare.</p>
                        </div>
                    )}
                    <form onSubmit={handleSaveEntry} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="text-xs font-bold uppercase">Data</label><input type="date" name="date" required defaultValue={modal.data?.date} className="w-full p-2 border rounded-lg" /></div>
                            <div><label className="text-xs font-bold uppercase">Coltura</label><input type="text" name="crop" required defaultValue={modal.data?.crop} className="w-full p-2 border rounded-lg" /></div>
                        </div>

                        {activeTab === 'trattamento' && (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="text-xs font-bold uppercase">Prodotto Commerciale</label><input type="text" name="product" required defaultValue={(modal.data?.details as any)?.product} className="w-full p-2 border rounded-lg" /></div>
                                    <div><label className="text-xs font-bold uppercase">Dose/Ettaro</label><input type="text" name="dose" required defaultValue={(modal.data?.details as any)?.dose} className="w-full p-2 border rounded-lg" /></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="text-xs font-bold uppercase">Avversità</label><input type="text" name="adversity" required defaultValue={(modal.data?.details as any)?.adversity} className="w-full p-2 border rounded-lg" /></div>
                                    <div><label className="text-xs font-bold uppercase">Motivazione</label><input type="text" name="reason" required defaultValue={(modal.data?.details as any)?.reason} className="w-full p-2 border rounded-lg" /></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="text-xs font-bold uppercase">Carenza (Giorni)</label><input type="number" name="phi" defaultValue={(modal.data?.details as any)?.safetyIntervalDays} className="w-full p-2 border rounded-lg" /></div>
                                    <div><label className="text-xs font-bold uppercase">Operatore</label><input type="text" name="operator" defaultValue={currentUser?.name} className="w-full p-2 border rounded-lg" /></div>
                                </div>
                            </>
                        )}
                        
                        <button type="submit" className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-xl hover:bg-primary-dark transition-all flex items-center justify-center gap-2">
                            <Save size={20}/> SALVA NEL QUADERNO
                        </button>
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default QuadernoPage;
