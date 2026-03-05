
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Bell, CheckCircle, ArrowLeft, X, RotateCcw, BookOpen, Shield, Search } from 'lucide-react';

// Mock data allineati ai nuovi slug
const scadenzeDetails: { [key: string]: any } = {
    'patentino': { title: 'Patentino fitosanitario', dueDate: '15/07/2024', description: 'Rinnovo del patentino per l\'acquisto e l\'utilizzo di prodotti fitosanitari.', renewalTermYears: 5 },
    'assicurazione-trattore': { title: 'Assicurazione trattore', dueDate: '30/07/2024', description: 'Scadenza della polizza RC per il trattore John Deere.', renewalTermYears: 1 },
    'revisione-atomizzatore': { title: 'Revisione atomizzatore', dueDate: '01/09/2024', description: 'Controllo funzionale obbligatorio per l\'atomizzatore.', renewalTermYears: 3 },
};

interface ScadenzaStatus {
    isRenewed: boolean;
    reminderDate: string | null;
    renewedAt: string | null;
    newDueDate?: string;
}

const ScadenzeDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const scadenza = id ? scadenzeDetails[id] : null;

    const storageKey = useMemo(() => `scadenza_${id}_status`, [id]);

    const [status, setStatus] = useState<ScadenzaStatus>({
        isRenewed: false,
        reminderDate: null,
        renewedAt: null,
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [reminderInput, setReminderInput] = useState('');

    useEffect(() => {
        const savedStatus = localStorage.getItem(storageKey);
        if (savedStatus) {
            setStatus(JSON.parse(savedStatus));
        }
    }, [storageKey]);

    const updateStatus = (newStatus: Partial<ScadenzaStatus>) => {
        setStatus(prev => {
            const updated = { ...prev, ...newStatus };
            localStorage.setItem(storageKey, JSON.stringify(updated));
            return updated;
        });
    };

    const handleToggleRenew = () => {
        if (!scadenza) return;
        if (status.isRenewed) {
            updateStatus({ isRenewed: false, renewedAt: null, newDueDate: undefined });
        } else {
            const renewalDate = new Date();
            const originalDueDate = new Date(scadenza.dueDate.split('/').reverse().join('-'));
            originalDueDate.setFullYear(originalDueDate.getFullYear() + scadenza.renewalTermYears);
            
            updateStatus({
                isRenewed: true,
                renewedAt: renewalDate.toISOString(),
                newDueDate: originalDueDate.toLocaleDateString('it-IT')
            });
        }
    };
    
    const handleSetReminder = () => {
        if (!reminderInput) return;
        updateStatus({ reminderDate: new Date(reminderInput).toISOString() });
        alert('Promemoria impostato!');
        setIsModalOpen(false);
    };

    if (!id || !scadenza) {
        return (
            <div className="p-8 text-center">
                <p className="text-text-secondary">Scadenza non trovata.</p>
                <button onClick={() => navigate('/scadenze')} className="mt-4 text-primary font-bold">Torna alla lista</button>
            </div>
        );
    }

    const displayedDueDate = status.isRenewed && status.newDueDate ? status.newDueDate : scadenza.dueDate;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <button onClick={() => navigate('/scadenze')} className="flex items-center text-sm font-semibold text-text-secondary hover:text-primary mb-4">
                    <ArrowLeft size={16} className="mr-2"/> Torna all'elenco
                </button>
                <h1 className="text-3xl font-black text-text-primary uppercase tracking-tighter">{scadenza.title}</h1>
            </div>

            <div className="bg-surface rounded-3xl shadow-xl p-8 border border-gray-100">
                <div className="flex justify-between items-start">
                    <div>
                        <div className={`flex items-center gap-2 font-bold text-lg mb-4 ${status.isRenewed ? 'text-green-600' : 'text-red-600'}`}>
                            <Calendar size={20} />
                            <span>{status.isRenewed ? `Rinnovato fino al:` : `Scadenza:`} {displayedDueDate}</span>
                        </div>
                        <p className="text-text-secondary mb-8 leading-relaxed max-w-2xl">{scadenza.description}</p>
                    </div>
                    {status.isRenewed && (
                        <div className="bg-green-100 text-green-800 text-[10px] font-black px-3 py-1 rounded-full whitespace-nowrap uppercase tracking-widest border border-green-200">
                            RINNOVATO
                        </div>
                    )}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 border-t pt-8">
                    <button onClick={() => setIsModalOpen(true)} className="flex-1 flex items-center justify-center px-6 py-4 bg-white border-2 border-blue-100 text-blue-600 rounded-2xl font-black hover:bg-blue-50 transition-all shadow-sm">
                        <Bell size={20} className="mr-2" /> {status.reminderDate ? 'Modifica Promemoria' : 'Imposta Promemoria'}
                    </button>
                    <button onClick={handleToggleRenew} className={`flex-1 flex items-center justify-center px-6 py-4 text-white rounded-2xl font-black shadow-lg transition-all ${status.isRenewed ? 'bg-gray-500 hover:bg-gray-600' : 'bg-primary hover:bg-primary-dark'}`}>
                        {status.isRenewed ? <RotateCcw size={20} className="mr-2" /> : <CheckCircle size={20} className="mr-2" />}
                        {status.isRenewed ? 'Annulla Rinnovo' : 'Segna come Rinnovato'}
                    </button>
                </div>

                 {id === 'patentino' && (
                    <div className="mt-8 border-t pt-8">
                        <button onClick={() => navigate('/scadenze/patentino/corsi')} className="w-full flex items-center justify-center p-4 bg-secondary text-white rounded-2xl font-black shadow-xl hover:scale-[1.01] transition-all uppercase tracking-widest">
                           <BookOpen size={18} className="mr-3"/> Cerca/Prenota Corso di Rinnovo
                        </button>
                    </div>
                 )}
                 {id === 'assicurazione-trattore' && (
                    <div className="mt-8 border-t pt-8">
                        <button onClick={() => navigate('/scadenze/trattore/assicurazioni')} className="w-full flex items-center justify-center p-4 bg-secondary text-white rounded-2xl font-black shadow-xl hover:scale-[1.01] transition-all uppercase tracking-widest">
                            <Shield size={18} className="mr-3"/> Cerca Assicurazione Migliore
                        </button>
                    </div>
                 )}
            </div>
            
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-surface rounded-[32px] shadow-2xl p-8 w-full max-w-sm animate-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black uppercase tracking-tighter">Imposta Promemoria</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={24}/></button>
                        </div>
                        <p className="text-sm text-text-secondary mb-6 font-medium">Scegli una data e ora per ricevere una notifica push e email.</p>
                        <input 
                            type="datetime-local" 
                            value={reminderInput}
                            onChange={(e) => setReminderInput(e.target.value)}
                            className="w-full p-4 border-2 border-gray-100 rounded-2xl mb-6 font-bold outline-none focus:border-primary transition-all"
                        />
                        <button onClick={handleSetReminder} className="w-full py-4 bg-primary text-white font-black rounded-2xl hover:bg-primary-dark shadow-xl transition-all">
                            SALVA PROMEMORIA
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScadenzeDetailPage;
