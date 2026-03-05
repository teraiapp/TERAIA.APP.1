
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, Calendar, History, CheckCircle, 
    X, AlertTriangle, Save, GraduationCap, 
    ShieldCheck, Tractor, Syringe, FileText,
    Zap, Info, ExternalLink, RefreshCw
} from 'lucide-react';
import { Deadline, DeadlineStatus, RenewalHistoryEntry } from '../../types';
import { useAppContext } from '../../hooks/useAppContext';

const ScadenzaDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { currentUser } = useAppContext();

    const [deadlines, setDeadlines] = useState<Deadline[]>(() => 
        JSON.parse(localStorage.getItem('teraia_deadlines_v1') || '[]')
    );

    const deadline = useMemo(() => deadlines.find(d => d.id === id), [deadlines, id]);

    if (!deadline) return <div className="p-20 text-center font-black">SCADENZA NON TROVATA</div>;

    const handleUpdateStatus = (newStatus: DeadlineStatus, note: string) => {
        const historyEntry: RenewalHistoryEntry = {
            date: new Date().toISOString().split('T')[0],
            note: note,
            operator: currentUser?.name || 'Sistema'
        };

        const updated = deadlines.map(d => 
            d.id === id ? { ...d, status: newStatus, history: [historyEntry, ...d.history] } : d
        );
        setDeadlines(updated);
        localStorage.setItem('teraia_deadlines_v1', JSON.stringify(updated));
        alert("Operazione registrata con successo!");
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <button onClick={() => navigate('/scadenze')} className="flex items-center text-sm font-black text-text-secondary hover:text-primary uppercase tracking-widest transition-colors">
                <ArrowLeft size={16} className="mr-2"/> Torna alle Scadenze
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* SINISTRA: INFO GENERALI */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="bg-white rounded-[48px] shadow-2xl p-10 border-t-8 border-primary relative overflow-hidden">
                        <div className="flex justify-between items-start mb-6">
                            <span className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest">
                                Stato: {deadline.status}
                            </span>
                            <Calendar className="text-primary/20" size={64}/>
                        </div>
                        <h1 className="text-4xl font-black text-text-primary tracking-tighter uppercase mb-4">{deadline.title}</h1>
                        <p className="text-lg text-text-secondary leading-relaxed font-medium mb-10">
                            {deadline.description}
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-gray-50">
                            <div className="p-6 bg-gray-50 rounded-[32px] border border-gray-100">
                                <p className="text-[10px] font-black text-text-secondary uppercase mb-1">Data Scadenza</p>
                                <p className="text-xl font-black text-text-primary">{new Date(deadline.dueDate).toLocaleDateString()}</p>
                            </div>
                            <div className="p-6 bg-gray-50 rounded-[32px] border border-gray-100">
                                <p className="text-[10px] font-black text-text-secondary uppercase mb-1">Anticipo Avviso</p>
                                <p className="text-xl font-black text-text-primary">{deadline.alertDaysBefore} Giorni</p>
                            </div>
                            <div className="p-6 bg-gray-50 rounded-[32px] border border-gray-100">
                                <p className="text-[10px] font-black text-text-secondary uppercase mb-1">Frequenza</p>
                                <p className="text-xl font-black text-text-primary">Standard</p>
                            </div>
                        </div>
                    </div>

                    {/* STORICO RINNOVI */}
                    <div className="bg-white rounded-[40px] p-10 shadow-xl border border-gray-100">
                        <h2 className="text-xl font-black uppercase tracking-tight mb-8 flex items-center gap-3">
                            <History size={24} className="text-primary"/> Storico Eventi & Rinnovi
                        </h2>
                        <div className="space-y-6">
                            {deadline.history.length > 0 ? deadline.history.map((h, i) => (
                                <div key={i} className="flex gap-4 items-start p-4 bg-gray-50 rounded-2xl">
                                    <CheckCircle size={20} className="text-green-500 shrink-0"/>
                                    <div>
                                        <p className="text-sm font-black text-text-primary">{h.note}</p>
                                        <p className="text-[10px] font-bold text-text-secondary uppercase">Eseguito il {h.date} da {h.operator}</p>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-center py-10 text-text-secondary italic">Nessun rinnovo precedente registrato.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* DESTRA: AZIONI INTELLIGENTI */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-gray-900 text-white rounded-[40px] p-10 shadow-2xl sticky top-8">
                        <h3 className="text-xl font-black mb-8 uppercase tracking-tighter flex items-center gap-2">
                            <Zap size={24} className="text-primary"/> Workflow Rinnovo
                        </h3>
                        
                        <div className="space-y-4">
                            {/* AZIONI SPECIFICHE PER TIPO */}
                            {deadline.type === 'patentino_fitosanitario' && (
                                <button 
                                    onClick={() => navigate('/scadenze/corsi')}
                                    className="w-full py-5 bg-primary text-white rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                                >
                                    <GraduationCap size={20}/> Cerca Corso Accreditato
                                </button>
                            )}

                            {deadline.type === 'assicurazione_mezzo' && (
                                <button 
                                    onClick={() => navigate('/scadenze/assicurazioni')}
                                    className="w-full py-5 bg-primary text-white rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                                >
                                    <ShieldCheck size={20}/> Compara Assicurazioni
                                </button>
                            )}

                            {deadline.type === 'vaccinazione_allevamento' && (
                                <button 
                                    onClick={() => navigate('/allevamento')}
                                    className="w-full py-5 bg-blue-600 text-white rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                                >
                                    <Syringe size={20}/> Apri Registro Sanitario
                                </button>
                            )}

                            <button 
                                onClick={() => handleUpdateStatus('rinnovata', 'Rinnovo registrato manualmente dall\'utente.')}
                                className="w-full py-5 bg-white/10 text-white border border-white/10 rounded-3xl font-black uppercase text-xs tracking-widest hover:bg-white/20 transition-all flex items-center justify-center gap-3"
                            >
                                <CheckCircle size={20}/> Segna come Rinnovato
                            </button>

                            <button className="w-full py-5 bg-white/10 text-white border border-white/10 rounded-3xl font-black uppercase text-xs tracking-widest hover:bg-white/20 transition-all flex items-center justify-center gap-3">
                                <FileText size={20}/> Carica Certificato (.pdf)
                            </button>
                        </div>

                        <div className="mt-10 p-6 bg-white/5 rounded-[32px] border border-white/5">
                            <p className="text-[9px] font-black uppercase text-center opacity-40 tracking-[0.2em] leading-relaxed">
                                Le operazioni sono certificate <br/> e registrate nel log di sistema.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScadenzaDetailPage;
