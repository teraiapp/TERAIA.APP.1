
import React, { useState } from 'react';
import { CheckSquare, ArrowLeft, ExternalLink, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QA_ITEMS = [
    { label: 'Login & Switch Ruoli', path: '/', desc: 'Verifica permessi differenti tra Agricoltore e Agronomo.' },
    { label: 'Unità Produttive', path: '/produzione', desc: 'Verifica creazione, modifica e località a cascata.' },
    { label: 'Quaderno Campagna', path: '/quaderno-campagna', desc: 'Verifica filtri per tipo e registrazione trattamenti.' },
    { label: 'Scadenze & Rinnovi', path: '/scadenze', desc: 'Verifica calcolo giorni e severity (Ok/Warning/Critical).' },
    { label: 'AI Predittiva', path: '/ai-predittiva', desc: 'Verifica scenario 4D e generazione alert automatici.' },
    { label: 'Vision AI', path: '/vision-ai', desc: 'Verifica accesso camera (permessi) e diagnostica campioni.' },
    { label: 'Economia & OCR', path: '/economia', desc: 'Verifica simulazione OCR e tracciamento costi/ricavi.' },
    { label: 'Marketplace P2P', path: '/marketplace', desc: 'Verifica creazione annunci e richieste consulenza.' },
    { label: 'Integrazioni HW', path: '/integrazioni', desc: 'Verifica stato sensori (Online/Offline) e diagnostica.' }
];

const QaChecklistPage: React.FC = () => {
    const navigate = useNavigate();
    const [checked, setChecked] = useState<string[]>([]);

    const toggle = (label: string) => {
        setChecked(prev => prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20 max-w-4xl mx-auto">
            <button onClick={() => navigate('/admin/diagnostica')} className="flex items-center text-sm font-black text-text-secondary hover:text-primary uppercase tracking-widest transition-colors">
                <ArrowLeft size={16} className="mr-2"/> Torna a Diagnostica
            </button>

            <div className="bg-white rounded-[48px] shadow-2xl p-10 border-t-8 border-primary">
                <h1 className="text-4xl font-black text-text-primary uppercase tracking-tighter flex items-center gap-4 mb-2">
                    <CheckSquare size={36} className="text-primary"/> QA Checklist
                </h1>
                <p className="text-text-secondary font-medium">Protocollo di verifica stabilità per Demo Release 4.0</p>
                
                <div className="mt-10 space-y-4">
                    {QA_ITEMS.map(item => (
                        <div key={item.label} className={`p-6 rounded-3xl border-2 transition-all flex items-center justify-between group ${checked.includes(item.label) ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100 hover:border-primary/20'}`}>
                            <div className="flex items-center gap-6">
                                <input 
                                    type="checkbox" 
                                    checked={checked.includes(item.label)} 
                                    onChange={() => toggle(item.label)}
                                    className="w-8 h-8 accent-primary rounded-xl cursor-pointer"
                                />
                                <div>
                                    <h4 className="font-black text-lg uppercase tracking-tighter leading-none">{item.label}</h4>
                                    <p className="text-xs text-text-secondary font-medium mt-1">{item.desc}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => navigate(item.path)}
                                className="p-4 bg-white rounded-2xl shadow-sm text-text-primary hover:text-primary opacity-0 group-hover:opacity-100 transition-all"
                            >
                                <ExternalLink size={20}/>
                            </button>
                        </div>
                    ))}
                </div>

                <div className="mt-12 pt-8 border-t border-gray-100 flex justify-between items-center">
                    <div className="text-xs font-black text-text-secondary uppercase">Progresso Verifica: {checked.length}/{QA_ITEMS.length}</div>
                    {checked.length === QA_ITEMS.length && (
                        <div className="flex items-center gap-2 text-green-600 font-black uppercase text-sm animate-bounce">
                            <ShieldCheck/> Sistema Validato 100%
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QaChecklistPage;
