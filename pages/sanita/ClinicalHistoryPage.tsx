
import React, { useState } from 'react';
import { History, Search, ArrowLeft, Filter, Calendar, Activity, Syringe, AlertTriangle } from 'lucide-react';
import { initialInterventi } from '../../data/sanitaData';
import { initialAnimali } from '../../data/allevamentoData';

const Card: React.FC<{children: React.ReactNode, className?: string}> = ({ children, className }) => (
    <div className={`bg-surface rounded-xl shadow-md p-6 ${className}`}>{children}</div>
);

const ClinicalHistoryPage: React.FC = () => {
    const [selectedAnimaleId, setSelectedAnimaleId] = useState<string>('');
    const [filterTipo, setFilterTipo] = useState<string>('Tutti');

    const history = initialInterventi.filter(i => {
        const matchAnimale = !selectedAnimaleId || i.animaleId === selectedAnimaleId;
        const matchTipo = filterTipo === 'Tutti' || i.tipo === filterTipo;
        return matchAnimale && matchTipo;
    }).sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

    const getIcon = (tipo: string) => {
        switch(tipo) {
            case 'Vaccinazione': return <Syringe size={18}/>;
            case 'Emergenza': return <AlertTriangle size={18} className="text-red-500"/>;
            case 'Visita': return <Activity size={18}/>;
            default: return <History size={18}/>;
        }
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold flex items-center text-text-primary">
                <History className="mr-3" /> Storico Clinico Rapido
            </h1>

            <Card>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    <div>
                        <label className="block text-xs font-bold mb-1 uppercase">Seleziona Animale/Gruppo</label>
                        <select 
                            className="w-full p-2 border rounded bg-white"
                            value={selectedAnimaleId}
                            onChange={e => setSelectedAnimaleId(e.target.value)}
                        >
                            <option value="">Tutti gli animali assegnati</option>
                            {initialAnimali.map(a => <option key={a.id} value={a.id}>{a.identifier} ({a.type})</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold mb-1 uppercase">Filtra per tipo</label>
                        <div className="flex gap-2 flex-wrap">
                            {['Tutti', 'Visita', 'Terapia', 'Vaccinazione', 'Emergenza'].map(t => (
                                <button 
                                    key={t}
                                    onClick={() => setFilterTipo(t)}
                                    className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${filterTipo === t ? 'bg-primary text-white' : 'bg-gray-100 text-text-secondary hover:bg-gray-200'}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="relative border-l-2 border-gray-200 ml-4 space-y-8 pb-4">
                    {history.length > 0 ? history.map(item => (
                        <div key={item.id} className="relative pl-8">
                            <div className={`absolute -left-[11px] top-1 w-5 h-5 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${item.tipo === 'Emergenza' ? 'bg-red-500' : 'bg-primary'}`}>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl shadow-sm border border-gray-100">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-primary font-bold">{getIcon(item.tipo)}</span>
                                        <h3 className="font-bold text-lg">{item.tipo} - {initialAnimali.find(a => a.id === item.animaleId)?.identifier}</h3>
                                    </div>
                                    <span className="text-xs font-bold text-text-secondary flex items-center"><Calendar size={12} className="mr-1"/>{new Date(item.data).toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm text-text-primary mb-3">{item.descrizione}</p>
                                {item.farmaco && (
                                    <div className="bg-blue-50 p-2 rounded text-xs border border-blue-100 text-blue-800">
                                        <strong>Terapia:</strong> {item.farmaco} ({item.dose})
                                    </div>
                                )}
                                <div className="mt-3 pt-3 border-t flex justify-between items-center text-[10px] uppercase font-bold text-text-secondary">
                                    <span>Esito: <strong className={item.esito === 'Risolto' ? 'text-green-600' : 'text-yellow-600'}>{item.esito}</strong></span>
                                    <span>Registrato da: {item.inseritoDa}</span>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-20 text-text-secondary ml-[-1rem]">
                            <History size={48} className="mx-auto mb-4 opacity-20"/>
                            <p className="font-semibold">Nessun evento clinico trovato per la selezione.</p>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default ClinicalHistoryPage;
