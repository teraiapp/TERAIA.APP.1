
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ShieldCheck, FileText } from 'lucide-react';

interface Scadenza {
    id: string;
    title: string;
    dueDate: string;
    daysLeft: number;
    icon: React.ElementType;
}

const scadenzeData: Scadenza[] = [
    { id: 'patentino', title: 'Patentino fitosanitario', dueDate: '15/07/2024', daysLeft: 15, icon: FileText },
    { id: 'assicurazione-trattore', title: 'Assicurazione trattore', dueDate: '30/07/2024', daysLeft: 30, icon: ShieldCheck },
    { id: 'revisione-atomizzatore', title: 'Revisione atomizzatore', dueDate: '01/09/2024', daysLeft: 62, icon: AlertTriangle },
];

const ScadenzeListPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <h1 className="text-3xl font-black text-text-primary uppercase tracking-tighter">Elenco Scadenze</h1>

            <div className="bg-surface rounded-[32px] shadow-xl p-8 border border-gray-100">
                <div className="space-y-4">
                    {scadenzeData.map(scadenza => (
                        <div 
                            key={scadenza.id} 
                            onClick={() => navigate(`/scadenze/${scadenza.id}`)}
                            className="flex items-center justify-between p-6 border-2 border-gray-50 rounded-2xl hover:border-primary/20 hover:bg-gray-50/50 cursor-pointer transition-all group"
                        >
                            <div className="flex items-center gap-5">
                                <div className={`p-4 rounded-xl transition-colors ${scadenza.daysLeft < 30 ? 'bg-red-50 text-red-500' : 'bg-yellow-50 text-yellow-600'}`}>
                                    <scadenza.icon size={32} />
                                </div>
                                <div>
                                    <p className="font-black text-lg text-text-primary group-hover:text-primary transition-colors">{scadenza.title}</p>
                                    <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mt-1">Scade il: {scadenza.dueDate}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`font-black text-lg ${scadenza.daysLeft < 30 ? 'text-red-600' : 'text-yellow-700'}`}>
                                    tra {scadenza.daysLeft} giorni
                                </p>
                                <span className="text-[10px] font-black uppercase text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity">Vedi dettagli →</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ScadenzeListPage;
