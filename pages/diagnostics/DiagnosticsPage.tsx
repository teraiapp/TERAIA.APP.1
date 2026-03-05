
import React from 'react';
// Added ArrowRight to the imports
import { Terminal, Database, RefreshCw, Trash2, ShieldAlert, CheckCircle, Info, ArrowRight } from 'lucide-react';
import { seedDemoData, resetAllData } from '../../utils/demoSeeder';
import { useNavigate } from 'react-router-dom';

const DiagnosticsPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-black text-text-primary flex items-center gap-3 uppercase tracking-tighter">
                    <Terminal className="text-gray-900" size={36} /> Diagnostica & Demo
                </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white rounded-[40px] p-10 shadow-xl border border-gray-100 space-y-8">
                    <div>
                        <h2 className="text-2xl font-black uppercase flex items-center gap-3"><Database className="text-primary"/> Demo Seeder</h2>
                        <p className="text-sm text-text-secondary mt-2 font-medium">Popola istantaneamente tutti i moduli di TeraIA con dati realistici per una dimostrazione completa.</p>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-2xl text-blue-800 text-xs font-bold uppercase">
                            <Info size={18} className="shrink-0"/>
                            <span>L'operazione è sicura e non sovrascrive configurazioni critiche del profilo.</span>
                        </div>
                        <button 
                            onClick={seedDemoData}
                            className="w-full py-5 bg-primary text-white rounded-[24px] font-black uppercase text-xs tracking-widest shadow-xl hover:bg-primary-dark transition-all flex items-center justify-center gap-3"
                        >
                            <RefreshCw size={18}/> Carica Ecosistema Demo
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-[40px] p-10 shadow-xl border border-gray-100 space-y-8">
                    <div>
                        <h2 className="text-2xl font-black uppercase flex items-center gap-3 text-red-600"><ShieldAlert/> Hard Reset</h2>
                        <p className="text-sm text-text-secondary mt-2 font-medium">Rimuovi ogni dato locale e riporta l'applicazione allo stato di fabbrica (Out-of-the-box).</p>
                    </div>
                    
                    <div className="space-y-4">
                        <button 
                            onClick={resetAllData}
                            className="w-full py-5 bg-red-600 text-white rounded-[24px] font-black uppercase text-xs tracking-widest shadow-xl hover:bg-red-700 transition-all flex items-center justify-center gap-3"
                        >
                            <Trash2 size={18}/> Cancella Tutto (Reset Totale)
                        </button>
                    </div>
                </div>
            </div>

            <div onClick={() => navigate('/admin/checklist')} className="p-8 bg-gray-900 rounded-[40px] text-white flex items-center justify-between cursor-pointer hover:bg-black transition-all group">
                <div className="flex items-center gap-6">
                    <div className="p-4 bg-white/10 rounded-3xl"><CheckCircle size={32} className="text-primary"/></div>
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tighter">Checklist QA Interattiva</h3>
                        <p className="text-sm opacity-60">Esegui i test di verifica per ogni modulo di sistema.</p>
                    </div>
                </div>
                <ArrowRight className="group-hover:translate-x-2 transition-transform"/>
            </div>
        </div>
    );
};

export default DiagnosticsPage;
