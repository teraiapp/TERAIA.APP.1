
import React, { useState, useEffect, useMemo } from 'react';
import { Syringe, PlusCircle, CheckCircle, Calendar, Trash2, Edit, X, Plus, AlertCircle, Info } from 'lucide-react';
import { PianoVaccinale, VaccinazioneProgrammata, initialPianiVaccinali } from '../../data/sanitaData';
import { initialAllevamenti } from '../../data/allevamentoData';

// Custom hook per la persistenza
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

const Card: React.FC<{children: React.ReactNode, className?: string}> = ({ children, className }) => (
    <div className={`bg-surface rounded-xl shadow-md p-6 ${className}`}>{children}</div>
);

const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({ title, onClose, children }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={onClose}>
        <div className="bg-surface rounded-xl shadow-2xl p-6 w-full max-w-3xl my-8" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h3 className="text-xl font-bold text-text-primary">{title}</h3>
                <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full text-text-secondary"><X size={24}/></button>
            </div>
            {children}
        </div>
    </div>
);

const VaccinationPlansPage: React.FC = () => {
    const [piani, setPiani] = usePersistentState<PianoVaccinale[]>('teraia_vaccination_plans', initialPianiVaccinali);
    const [modal, setModal] = useState<{ type: 'add' | 'edit', data?: PianoVaccinale } | null>(null);

    // Form State (interno al modale)
    const [draftTitle, setDraftTitle] = useState('');
    const [draftAllevamento, setDraftAllevamento] = useState('');
    const [draftSpecie, setDraftSpecie] = useState('Bovini');
    const [draftVaccines, setDraftVaccines] = useState<Omit<VaccinazioneProgrammata, 'id'>[]>([]);

    // Sincronizza il draft quando si apre il modale
    useEffect(() => {
        if (modal) {
            if (modal.type === 'edit' && modal.data) {
                setDraftTitle(modal.data.titolo);
                setDraftAllevamento(modal.data.allevamentoId);
                setDraftSpecie(modal.data.specie);
                setDraftVaccines(modal.data.vaccinazioni);
            } else {
                setDraftTitle('');
                setDraftAllevamento(initialAllevamenti[0]?.id || '');
                setDraftSpecie('Bovini');
                setDraftVaccines([{ nomeVaccino: '', periodicita: 'Annuale', dataProssimaDose: '', stato: 'Da fare' }]);
            }
        }
    }, [modal]);

    const handleMarkCompleted = (pianoId: string, vaccinoId: string) => {
        setPiani(prev => prev.map(p => {
            if (p.id === pianoId) {
                return {
                    ...p,
                    vaccinazioni: p.vaccinazioni.map(v => 
                        v.id === vaccinoId ? { ...v, stato: 'Completata' as const } : v
                    )
                };
            }
            return p;
        }));
    };

    const handleDeletePiano = (id: string) => {
        if (window.confirm("Sei sicuro di voler eliminare definitivamente questo piano vaccinale?")) {
            setPiani(prev => prev.filter(p => p.id !== id));
        }
    };

    const handleAddVaccineRow = () => {
        setDraftVaccines([...draftVaccines, { nomeVaccino: '', periodicita: 'Annuale', dataProssimaDose: '', stato: 'Da fare' }]);
    };

    const handleRemoveVaccineRow = (index: number) => {
        setDraftVaccines(prev => prev.filter((_, i) => i !== index));
    };

    const handleVaccineChange = (index: number, field: keyof Omit<VaccinazioneProgrammata, 'id'>, value: string) => {
        const updated = [...draftVaccines];
        updated[index] = { ...updated[index], [field]: value };
        setDraftVaccines(updated);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!draftTitle || !draftAllevamento || draftVaccines.some(v => !v.nomeVaccino || !v.dataProssimaDose)) {
            alert("Per favore, compila tutti i campi obbligatori (Titolo, Allevamento e dettagli dei vaccini).");
            return;
        }

        const newPiano: PianoVaccinale = {
            id: modal?.type === 'edit' ? modal.data!.id : `pv-${Date.now()}`,
            allevamentoId: draftAllevamento,
            titolo: draftTitle,
            specie: draftSpecie,
            vaccinazioni: draftVaccines.map((v, idx) => ({
                ...v,
                id: (v as any).id || `vp-${Date.now()}-${idx}`
            }))
        };

        if (modal?.type === 'edit') {
            setPiani(prev => prev.map(p => p.id === newPiano.id ? newPiano : p));
        } else {
            setPiani(prev => [...prev, newPiano]);
        }

        setModal(null);
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-bold flex items-center text-text-primary">
                    <Syringe className="mr-3 text-primary" /> Piani Vaccinali
                </h1>
                <button 
                    onClick={() => setModal({ type: 'add' })}
                    className="flex items-center px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark shadow-md transition-all"
                >
                    <PlusCircle size={20} className="mr-2" /> Crea Nuovo Piano
                </button>
            </div>

            {piani.length === 0 ? (
                <Card className="text-center py-12">
                    <Info size={48} className="mx-auto text-text-secondary mb-4 opacity-30" />
                    <p className="text-text-secondary">Nessun piano vaccinale registrato. Clicca su "Crea Nuovo Piano" per iniziare.</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {piani.map(piano => {
                        const allevamento = initialAllevamenti.find(a => a.id === piano.allevamentoId);
                        return (
                            <Card key={piano.id} className="flex flex-col border-t-4 border-primary">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-text-primary">{piano.titolo}</h2>
                                        <p className="text-sm text-text-secondary">{allevamento?.name || 'Allevamento non trovato'} • {piano.specie}</p>
                                    </div>
                                    <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-1 rounded-full font-bold uppercase">Attivo</span>
                                </div>

                                <div className="space-y-3 flex-grow">
                                    <h3 className="text-xs font-bold uppercase text-text-secondary border-b pb-2 flex items-center gap-1">
                                        <Calendar size={14} /> Programmazione Vaccini
                                    </h3>
                                    {piano.vaccinazioni.map(v => (
                                        <div key={v.id} className={`p-3 rounded-lg border flex justify-between items-center transition-colors ${v.stato === 'Completata' ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'}`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-full ${v.stato === 'Completata' ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                                                    <Syringe size={14} />
                                                </div>
                                                <div>
                                                    <p className={`text-sm font-bold ${v.stato === 'Completata' ? 'text-green-800' : 'text-text-primary'}`}>{v.nomeVaccino}</p>
                                                    <p className="text-[11px] text-text-secondary">Data: <strong>{new Date(v.dataProssimaDose).toLocaleDateString()}</strong> • {v.periodicita}</p>
                                                </div>
                                            </div>
                                            {v.stato !== 'Completata' ? (
                                                <button 
                                                    onClick={() => handleMarkCompleted(piano.id, v.id)}
                                                    className="px-2 py-1 bg-white border border-primary text-primary text-[10px] font-bold rounded hover:bg-primary hover:text-white transition-all shadow-sm"
                                                >
                                                    Esegui
                                                </button>
                                            ) : (
                                                <CheckCircle className="text-green-500" size={18} />
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 flex gap-3 pt-4 border-t">
                                    <button 
                                        onClick={() => setModal({ type: 'edit', data: piano })}
                                        className="flex-1 flex items-center justify-center gap-2 text-xs font-bold p-2 bg-gray-50 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                                    >
                                        <Edit size={14}/> Modifica
                                    </button>
                                    <button 
                                        onClick={() => handleDeletePiano(piano.id)}
                                        className="flex-1 flex items-center justify-center gap-2 text-xs font-bold p-2 bg-gray-50 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                    >
                                        <Trash2 size={14}/> Elimina
                                    </button>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {modal && (
                <Modal 
                    title={modal.type === 'add' ? "Crea Nuovo Piano Vaccinale" : "Modifica Piano Vaccinale"} 
                    onClose={() => setModal(null)}
                >
                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold mb-1">Titolo Piano *</label>
                                <input 
                                    value={draftTitle}
                                    onChange={e => setDraftTitle(e.target.value)}
                                    className="w-full p-2 border rounded-lg bg-gray-50" 
                                    placeholder="Es. Piano Autunno 2024"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Specie *</label>
                                <select 
                                    value={draftSpecie}
                                    onChange={e => setDraftSpecie(e.target.value)}
                                    className="w-full p-2 border rounded-lg bg-white"
                                >
                                    {['Bovini', 'Ovini', 'Caprini', 'Suini', 'Avicoli', 'Equini', 'Altro'].map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold mb-1">Allevamento / Gruppo *</label>
                                <select 
                                    value={draftAllevamento}
                                    onChange={e => setDraftAllevamento(e.target.value)}
                                    className="w-full p-2 border rounded-lg bg-white"
                                >
                                    {initialAllevamenti.map(a => (
                                        <option key={a.id} value={a.id}>{a.name} ({a.species})</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b pb-2">
                                <h4 className="font-bold text-sm flex items-center gap-2"><Syringe size={16}/> Lista Vaccini</h4>
                                <button 
                                    type="button"
                                    onClick={handleAddVaccineRow}
                                    className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded font-bold hover:bg-blue-100 flex items-center gap-1"
                                >
                                    <Plus size={14}/> Aggiungi Vaccino
                                </button>
                            </div>

                            <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                                {draftVaccines.map((v, index) => (
                                    <div key={index} className="p-4 border rounded-lg bg-gray-50 relative">
                                        {draftVaccines.length > 1 && (
                                            <button 
                                                type="button"
                                                onClick={() => handleRemoveVaccineRow(index)}
                                                className="absolute top-2 right-2 p-1 text-red-400 hover:text-red-600"
                                            >
                                                <X size={16}/>
                                            </button>
                                        )}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-bold text-text-secondary mb-1">Nome Vaccino *</label>
                                                <input 
                                                    value={v.nomeVaccino}
                                                    onChange={e => handleVaccineChange(index, 'nomeVaccino', e.target.value)}
                                                    placeholder="Es. IBR / BVD"
                                                    className="w-full p-2 text-sm border rounded bg-white"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-text-secondary mb-1">Periodicità</label>
                                                <select 
                                                    value={v.periodicita}
                                                    onChange={e => handleVaccineChange(index, 'periodicita', e.target.value)}
                                                    className="w-full p-2 text-sm border rounded bg-white"
                                                >
                                                    <option value="Unica">Dose Unica</option>
                                                    <option value="6 mesi">Ogni 6 mesi</option>
                                                    <option value="Annuale">Annuale</option>
                                                    <option value="Biennale">Biennale</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-text-secondary mb-1">Data Prossima Dose *</label>
                                                <input 
                                                    type="date"
                                                    value={v.dataProssimaDose}
                                                    onChange={e => handleVaccineChange(index, 'dataProssimaDose', e.target.value)}
                                                    className="w-full p-2 text-sm border rounded bg-white"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-text-secondary mb-1">Stato</label>
                                                <select 
                                                    value={v.stato}
                                                    onChange={e => handleVaccineChange(index, 'stato', e.target.value as any)}
                                                    className="w-full p-2 text-sm border rounded bg-white"
                                                >
                                                    <option value="Da fare">Da fare</option>
                                                    <option value="Completata">Completata</option>
                                                    <option value="Ritardo">Ritardo</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button 
                                type="button" 
                                onClick={() => setModal(null)} 
                                className="flex-1 py-3 border rounded-lg font-bold hover:bg-gray-50 transition-all"
                            >
                                Annulla
                            </button>
                            <button 
                                type="submit" 
                                className="flex-1 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark shadow-md transition-all flex items-center justify-center gap-2"
                            >
                                <CheckCircle size={20}/> Salva Piano
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default VaccinationPlansPage;
