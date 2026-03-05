
import React, { useState, useEffect, useMemo } from 'react';
import { ClipboardList, PlusCircle, Search, Filter, X, Save, Trash2, Edit, Calendar, Syringe, AlertCircle, RefreshCw, User, Info } from 'lucide-react';
import { InterventoSanitario, TipoInterventoSanitario, EsitoIntervento, initialInterventi, PianoVaccinale } from '../../data/sanitaData';
import { initialAnimali, initialAllevamenti, ScadenzaAllevamento } from '../../data/allevamentoData';
import { useAppContext } from '../../hooks/useAppContext';
import { Role } from '../../types';

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
        <div className="bg-surface rounded-xl shadow-2xl p-6 w-full max-w-2xl my-8" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h3 className="text-xl font-bold text-text-primary">{title}</h3>
                <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full text-text-secondary transition-colors"><X size={24}/></button>
            </div>
            {children}
        </div>
    </div>
);

const SanitaryRegisterPage: React.FC = () => {
    const { currentUser } = useAppContext();
    
    // Persistenza Dati
    const [interventi, setInterventi] = usePersistentState<InterventoSanitario[]>('teraia_sanitary_register', initialInterventi);
    const [scadenze, setScadenze] = usePersistentState<ScadenzaAllevamento[]>('teraia_scadenze', []);
    const [piani] = usePersistentState<PianoVaccinale[]>('teraia_vaccination_plans', []);

    // Stato UI
    const [modal, setModal] = useState<{type: 'add' | 'edit', data?: InterventoSanitario} | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTipo, setFilterTipo] = useState<string>('Tutti');
    const [filterAnimale, setFilterAnimale] = useState<string>('Tutti');

    // Controllo permessi
    const isVeterinario = currentUser?.role === Role.VETERINARIO || currentUser?.role === Role.ADMIN;
    // Fix: Updated owner check to map to existing Role enum members
    const isOwner = currentUser?.role === Role.AGRICOLTORE || currentUser?.role === Role.ALLEVATORE || currentUser?.role === Role.AZIENDA_MISTA;

    if (!isVeterinario && !isOwner) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <AlertCircle size={64} className="text-red-500 mb-4" />
                <h2 className="text-2xl font-bold">Accesso Non Autorizzato</h2>
                <p className="text-text-secondary">Solo veterinari e proprietari possono accedere al registro sanitario.</p>
            </div>
        );
    }

    const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!isVeterinario) return;

        const formData = new FormData(e.currentTarget);
        const nextDeadline = formData.get('prossimaScadenzaData') as string;
        const tipoIntervento = formData.get('tipo') as TipoInterventoSanitario;
        
        const interventionId = modal?.type === 'edit' ? modal.data!.id : `int-${Date.now()}`;
        
        // Se c'è una data di prossima scadenza, creiamo/aggiorniamo la scadenza
        let generatedDeadlineId = modal?.data?.scadenzaGenerataId;
        if (nextDeadline) {
            const newDeadline: ScadenzaAllevamento = {
                id: generatedDeadlineId || `scad-san-${Date.now()}`,
                allevamentoId: formData.get('allevamentoId') as string,
                date: nextDeadline,
                description: `PROMEMORIA: ${tipoIntervento} per ${formData.get('animaleId')}`,
                category: 'Sanitaria',
                status: 'Da fare'
            };
            generatedDeadlineId = newDeadline.id;
            setScadenze(prev => {
                const exists = prev.some(s => s.id === newDeadline.id);
                return exists ? prev.map(s => s.id === newDeadline.id ? newDeadline : s) : [...prev, newDeadline];
            });
        }

        const newIntervento: InterventoSanitario = {
            id: interventionId,
            allevamentoId: formData.get('allevamentoId') as string,
            animaleId: formData.get('animaleId') as string,
            data: formData.get('data') as string,
            tipo: tipoIntervento,
            descrizione: formData.get('descrizione') as string,
            farmaco: formData.get('farmaco') as string,
            dose: formData.get('dose') as string,
            esito: formData.get('esito') as EsitoIntervento,
            note: formData.get('note') as string,
            inseritoDa: currentUser?.name || 'Veterinario',
            timestamp: new Date().toISOString(),
            pianoVaccinaleId: formData.get('pianoVaccinaleId') as string || undefined,
            prossimaScadenzaData: nextDeadline || undefined,
            scadenzaGenerataId: generatedDeadlineId
        };

        if (modal?.type === 'edit') {
            setInterventi(prev => prev.map(i => i.id === newIntervento.id ? newIntervento : i));
        } else {
            setInterventi(prev => [newIntervento, ...prev]);
        }
        setModal(null);
    };

    const handleDelete = (id: string) => {
        if (!isVeterinario) return;
        if(window.confirm("Sei sicuro di voler eliminare questo record sanitario? L'azione verrà registrata nel log di sistema.")) {
            setInterventi(prev => prev.filter(i => i.id !== id));
        }
    };

    const filteredInterventi = useMemo(() => {
        return interventi.filter(i => {
            const matchesSearch = i.descrizione.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                i.farmaco?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                i.animaleId.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesTipo = filterTipo === 'Tutti' || i.tipo === filterTipo;
            const matchesAnimale = filterAnimale === 'Tutti' || i.animaleId === filterAnimale;
            return matchesSearch && matchesTipo && matchesAnimale;
        }).sort((a,b) => new Date(b.data).getTime() - new Date(a.data).getTime());
    }, [interventi, searchTerm, filterTipo, filterAnimale]);

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-bold flex items-center text-text-primary">
                    <ClipboardList className="mr-3 text-primary" /> Registro Sanitario
                </h1>
                {isVeterinario && (
                    <button onClick={() => setModal({type: 'add'})} className="flex items-center px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark shadow-md transition-all">
                        <PlusCircle size={20} className="mr-2" /> Nuovo Intervento
                    </button>
                )}
            </div>

            <Card className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18}/>
                        <input 
                            type="text" 
                            placeholder="Cerca per animale, diagnosi o farmaco..." 
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-gray-50"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div>
                        <select 
                            className="w-full p-2 border rounded-lg bg-white text-sm font-semibold"
                            value={filterTipo}
                            onChange={e => setFilterTipo(e.target.value)}
                        >
                            <option value="Tutti">Tutti i tipi</option>
                            {['Visita', 'Terapia', 'Vaccinazione', 'Emergenza', 'Controllo Periodico'].map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div>
                        <select 
                            className="w-full p-2 border rounded-lg bg-white text-sm font-semibold"
                            value={filterAnimale}
                            onChange={e => setFilterAnimale(e.target.value)}
                        >
                            <option value="Tutti">Tutti gli animali</option>
                            {initialAnimali.map(a => <option key={a.id} value={a.id}>{a.identifier}</option>)}
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-gray-100">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-text-secondary uppercase text-[10px] font-bold tracking-wider">
                            <tr>
                                <th className="p-4">Data</th>
                                <th className="p-4">Tipo</th>
                                <th className="p-4">Animale</th>
                                <th className="p-4">Diagnosi/Descrizione</th>
                                <th className="p-4">Esito</th>
                                {isVeterinario && <th className="p-4 text-center">Azioni</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredInterventi.length > 0 ? filteredInterventi.map(i => {
                                const piano = piani.find(p => p.id === i.pianoVaccinaleId);
                                return (
                                    <tr key={i.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4 font-semibold whitespace-nowrap">{new Date(i.data).toLocaleDateString('it-IT')}</td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-1">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase w-fit ${
                                                    i.tipo === 'Emergenza' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                    {i.tipo}
                                                </span>
                                                {piano && (
                                                    <span className="flex items-center text-[9px] font-bold text-primary uppercase">
                                                        <Syringe size={10} className="mr-1"/> {piano.titolo.substring(0, 15)}...
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 font-bold text-text-primary">
                                            {initialAnimali.find(a => a.id === i.animaleId)?.identifier || i.animaleId}
                                        </td>
                                        <td className="p-4 max-w-xs">
                                            <p className="font-medium text-text-primary truncate" title={i.descrizione}>{i.descrizione}</p>
                                            {i.farmaco && <p className="text-[11px] text-text-secondary italic">Farmaco: {i.farmaco} ({i.dose})</p>}
                                            {i.prossimaScadenzaData && (
                                                <p className="text-[10px] text-yellow-600 font-bold mt-1 flex items-center">
                                                    <Calendar size={10} className="mr-1"/> Scadenza: {new Date(i.prossimaScadenzaData).toLocaleDateString()}
                                                </p>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                                                i.esito === 'Risolto' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {i.esito}
                                            </span>
                                        </td>
                                        {isVeterinario && (
                                            <td className="p-4">
                                                <div className="flex justify-center gap-2">
                                                    <button onClick={() => setModal({type: 'edit', data: i})} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"><Edit size={16}/></button>
                                                    <button onClick={() => handleDelete(i.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"><Trash2 size={16}/></button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={6} className="text-center py-16 text-text-secondary">
                                        <Info size={40} className="mx-auto mb-2 opacity-20"/>
                                        Nessun record trovato nel registro sanitario.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {modal && isVeterinario && (
                <Modal title={modal.type === 'add' ? "Registra Intervento Sanitario" : "Modifica Intervento Sanitario"} onClose={() => setModal(null)}>
                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold mb-1">Data Intervento *</label>
                                <input type="date" name="data" defaultValue={modal.data?.data || new Date().toISOString().split('T')[0]} className="w-full p-2 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-primary focus:outline-none" required />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Tipo Intervento *</label>
                                <select name="tipo" defaultValue={modal.data?.tipo || 'Visita'} className="w-full p-2 border rounded-lg bg-white font-semibold focus:ring-2 focus:ring-primary focus:outline-none">
                                    {['Visita', 'Terapia', 'Vaccinazione', 'Emergenza', 'Controllo Periodico', 'Altro'].map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-bold mb-1">Allevamento *</label>
                                <select name="allevamentoId" defaultValue={modal.data?.allevamentoId || initialAllevamenti[0].id} className="w-full p-2 border rounded-lg bg-white focus:ring-2 focus:ring-primary focus:outline-none">
                                    {initialAllevamenti.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Animale / Gruppo *</label>
                                <select name="animaleId" defaultValue={modal.data?.animaleId} className="w-full p-2 border rounded-lg bg-white focus:ring-2 focus:ring-primary focus:outline-none" required>
                                    <option value="">Seleziona...</option>
                                    {initialAnimali.map(a => <option key={a.id} value={a.id}>{a.identifier} ({a.type})</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold mb-1">Descrizione / Diagnosi *</label>
                            <textarea name="descrizione" defaultValue={modal.data?.descrizione} rows={3} className="w-full p-2 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-primary focus:outline-none" placeholder="Descrivi l'intervento o la diagnosi clinica..." required />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="block text-sm font-bold mb-1">Farmaco (opzionale)</label><input type="text" name="farmaco" defaultValue={modal.data?.farmaco} className="w-full p-2 border rounded-lg bg-gray-50" placeholder="Nome commerciale farmaco" /></div>
                            <div><label className="block text-sm font-bold mb-1">Dose / Posologia</label><input type="text" name="dose" defaultValue={modal.data?.dose} className="w-full p-2 border rounded-lg bg-gray-50" placeholder="Es. 5ml sottocute" /></div>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 space-y-4">
                            <h4 className="text-xs font-bold text-blue-800 uppercase flex items-center gap-2"><RefreshCw size={14}/> Integrazioni e Scadenze</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-blue-700 mb-1 uppercase">Prossima Scadenza / Richiamo</label>
                                    <input type="date" name="prossimaScadenzaData" defaultValue={modal.data?.prossimaScadenzaData} className="w-full p-2 border border-blue-200 rounded-lg bg-white text-sm" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-blue-700 mb-1 uppercase">Collega a Piano Vaccinale</label>
                                    <select name="pianoVaccinaleId" defaultValue={modal.data?.pianoVaccinaleId || ''} className="w-full p-2 border border-blue-200 rounded-lg bg-white text-sm">
                                        <option value="">Nessuno</option>
                                        {piani.map(p => <option key={p.id} value={p.id}>{p.titolo}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold mb-1">Esito Attuale</label>
                                <select name="esito" defaultValue={modal.data?.esito || 'Risolto'} className="w-full p-2 border rounded-lg bg-white font-semibold">
                                    {['In corso', 'Risolto', 'In osservazione', 'Deceduto'].map(e => <option key={e} value={e}>{e}</option>)}
                                </select>
                            </div>
                            <div><label className="block text-sm font-bold mb-1">Note per Allevatore</label><input type="text" name="note" defaultValue={modal.data?.note} className="w-full p-2 border rounded-lg bg-gray-50" placeholder="Note visibili al proprietario" /></div>
                        </div>

                        <div className="flex gap-3 pt-4 border-t">
                            <button type="button" onClick={() => setModal(null)} className="flex-1 py-3 border rounded-lg font-bold hover:bg-gray-50 transition-all">Annulla</button>
                            <button type="submit" className="flex-1 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark shadow-lg transition-all flex items-center justify-center gap-2">
                                <Save size={20}/> Salva Intervento
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default SanitaryRegisterPage;
