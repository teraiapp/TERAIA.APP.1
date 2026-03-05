
import React, { useState, useMemo } from 'react';
import { 
    ShieldAlert, Check, X, AlertTriangle, 
    Eye, Trash2, ShieldCheck, Database,
    Info, Filter, Search, ArrowRight, Clock
} from 'lucide-react';
import { getPublicCases } from '../../utils/collectiveMemoryEngineV2';
import { CaseReport } from '../../types';

const CaseReviewPage: React.FC = () => {
    const [cases, setCases] = useState<CaseReport[]>(getPublicCases);
    const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');

    const filteredCases = useMemo(() => {
        // Mock: per la demo mostriamo tutti quelli con affidabilità bassa se pending
        if (filter === 'pending') return cases.filter(c => c.quality.reliability < 80);
        return cases.filter(c => c.quality.moderationStatus === filter);
    }, [cases, filter]);

    const updateStatus = (id: string, status: 'approved' | 'rejected') => {
        const updated = cases.map(c => c.id === id ? { ...c, quality: { ...c.quality, moderationStatus: status } } : c);
        setCases(updated);
        localStorage.setItem('teraia_public_case_reports_v2', JSON.stringify(updated));
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-text-primary flex items-center gap-3 uppercase tracking-tighter">
                        <ShieldAlert className="text-red-500" /> Moderazione Memoria
                    </h1>
                    <p className="text-text-secondary text-sm font-medium">Revisione qualità e validazione casi territoriali.</p>
                </div>
            </div>

            <div className="flex p-1 bg-gray-100 rounded-[24px] w-fit shadow-inner">
                {[
                    { id: 'pending', label: 'Da Revisionare', icon: Clock },
                    { id: 'approved', label: 'Approvati', icon: Check },
                    { id: 'rejected', label: 'Rifiutati', icon: X }
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setFilter(tab.id as any)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-[20px] font-black text-xs uppercase tracking-widest transition-all ${
                            filter === tab.id ? 'bg-white text-primary shadow-md' : 'text-text-secondary hover:text-text-primary'
                        }`}
                    >
                        <tab.icon size={16}/> {tab.label}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b text-text-secondary uppercase text-[10px] font-black">
                        <tr>
                            <th className="p-6">Dettaglio Caso</th>
                            <th className="p-6">Territorio</th>
                            <th className="p-6 text-center">Score Qualità</th>
                            <th className="p-6 text-right">Azioni</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredCases.map(c => (
                            <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-6">
                                    <p className="font-black uppercase text-xs text-text-primary">{c.problem} su {c.target}</p>
                                    <p className="text-xs text-text-secondary mt-1 max-w-xs truncate italic">"{c.intervention}"</p>
                                </td>
                                <td className="p-6">
                                    <p className="font-bold text-text-secondary text-xs uppercase">{c.territory.region}</p>
                                    {/* Fixed: Property 'city' does not exist on type 'GeoLocation'. Changed to 'communeName'. */}
                                    <p className="text-[10px] font-medium text-text-secondary uppercase">{c.territory.communeName}</p>
                                </td>
                                <td className="p-6 text-center">
                                    <div className="flex flex-col items-center">
                                        <span className={`text-[10px] font-black ${c.quality.reliability < 80 ? 'text-red-500' : 'text-green-600'}`}>
                                            Rel: {c.quality.reliability}%
                                        </span>
                                        <span className="text-[9px] text-text-secondary uppercase">Comp: {c.quality.completeness}%</span>
                                    </div>
                                </td>
                                <td className="p-6 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => updateStatus(c.id, 'approved')} className="p-3 bg-green-500 text-white rounded-xl hover:bg-green-600 shadow-md transition-all"><Check size={18}/></button>
                                        <button onClick={() => updateStatus(c.id, 'rejected')} className="p-3 bg-red-500 text-white rounded-xl hover:bg-red-600 shadow-md transition-all"><X size={18}/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredCases.length === 0 && (
                    <div className="py-20 text-center text-text-secondary italic">Nessun caso in questa categoria.</div>
                )}
            </div>
        </div>
    );
};

export default CaseReviewPage;
