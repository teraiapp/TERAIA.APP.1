
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    BrainCircuit, ShieldCheck, Zap, AlertTriangle, 
    Beaker, Info, FileText, CheckCircle, Search, 
    RotateCcw, MapPin, LayoutGrid, Wind, CloudRain,
    ArrowRight, Clock, FileSearch, Trash2, Save, X,
    Users, TrendingUp, ChevronRight
} from 'lucide-react';
import { useAppContext } from '../../hooks/useAppContext';
import { checkCompliance, ComplianceResult } from '../../utils/complianceEngine';
import { FitogestProduct } from '../../data/fitogestCatalog';
import { quadernoService } from '../../services/quadernoService';
import { getPublicCases } from '../../utils/collectiveMemoryEngineV2';

const AiTreatmentsExpertPage: React.FC = () => {
    const navigate = useNavigate();
    const { companyProfile, currentUser } = useAppContext();
    
    const units = useMemo(() => JSON.parse(localStorage.getItem('teraia_production_units_v1') || '[]'), []);
    const [selectedUnitId, setSelectedUnitId] = useState<string>(units[0]?.id || '');
    const activeUnit = useMemo(() => units.find((u: any) => u.id === selectedUnitId), [units, selectedUnitId]);

    const [problemInput, setProblemInput] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<ComplianceResult | null>(null);

    const communityExperiences = useMemo(() => {
        if (!problemInput || !companyProfile) return [];
        return getPublicCases().filter(c => 
            c.problem.toLowerCase().includes(problemInput.toLowerCase()) && 
            c.territory.region === companyProfile.localization.region
        ).slice(0, 3);
    }, [problemInput, companyProfile]);

    const handleAnalyze = () => {
        if (!problemInput || !activeUnit) return;
        setIsAnalyzing(true);
        setTimeout(() => {
            const region = companyProfile?.localization.region || 'Puglia';
            const crop = activeUnit.crop_key || 'Vite';
            const analysis = checkCompliance(region, crop, problemInput.toLowerCase(), false);
            setResult(analysis);
            setIsAnalyzing(false);
        }, 1200);
    };

    const handleConfirmTreatment = (product: FitogestProduct) => {
        if (!activeUnit) return;
        
        // SYNC CON QUADERNO (STEP 1 STANDARD)
        quadernoService.addEntry({
            type: "TRATTAMENTO",
            date: Date.now(),
            unitId: activeUnit.id,
            unitName: activeUnit.name,
            crop: { name: activeUnit.crop_key },
            /* Fix: QuadernoEntry doesn't have a 'description' field. Merged into 'notes'. */
            products: [{ name: product.name, activeIngredient: product.activeIngredient, qty: product.dose }],
            operator: currentUser?.name || 'Operatore AI',
            sourceModule: "ai_trattamenti",
            status: "CONFIRMED",
            notes: `Intervento professionale per ${problemInput}. Fonte Legale: ${result?.sourceDoc}. Vincoli: ${result?.regulatoryNote}`
        });

        alert(`Trattamento con ${product.name} sincronizzato nel Quaderno!`);
        navigate('/quaderno-campagna');
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-text-primary flex items-center gap-3 uppercase tracking-tighter">
                        <BrainCircuit className="text-primary" size={36} /> AI Trattamenti Expert
                    </h1>
                    <p className="text-text-secondary text-sm font-medium">Analisi normativa e territoriale basata sui dati aziendali.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-[32px] shadow-xl border border-gray-50">
                        <h3 className="text-[10px] font-black uppercase text-text-secondary mb-4 tracking-widest flex items-center gap-2">
                            <LayoutGrid size={14}/> Contesto Operativo
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-text-secondary ml-1 mb-1 block uppercase">Unità Selezionata</label>
                                <select className="w-full p-3 bg-gray-50 border-none rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-primary" value={selectedUnitId} onChange={e => setSelectedUnitId(e.target.value)}>
                                    {units.map((u:any) => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                            </div>
                            {activeUnit && (
                                <div className="space-y-3 pt-4 border-t border-gray-100">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-text-secondary">Coltura:</span>
                                        <span className="font-black text-primary uppercase">{activeUnit.crop_key}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-text-secondary">Località:</span>
                                        <span className="font-black">{companyProfile?.localization.region}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {communityExperiences.length > 0 && (
                        <div className="bg-gradient-to-br from-indigo-600 to-blue-800 rounded-[32px] p-6 text-white shadow-xl">
                            <h3 className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Users size={14}/> Esperienze Territorio
                            </h3>
                            <div className="space-y-4">
                                {communityExperiences.map(exp => (
                                    <div key={exp.id} className="bg-white/10 p-3 rounded-2xl border border-white/10">
                                        <p className="text-[9px] font-black uppercase opacity-60 mb-1">{exp.territory.communeName}</p>
                                        <p className="text-xs font-bold leading-tight">Soluzione: {exp.productUsed || exp.intervention.substring(0, 30)}...</p>
                                        <p className={`text-[9px] font-black mt-2 uppercase ${exp.outcome === 'risolto' ? 'text-green-300' : 'text-orange-300'}`}>Esito: {exp.outcome}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-3 space-y-8">
                    <div className="bg-white p-8 rounded-[40px] shadow-2xl border border-gray-100">
                        <h2 className="text-xl font-black uppercase tracking-tighter mb-6">Analisi Problematica</h2>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={20}/>
                                <input className="w-full pl-12 pr-6 py-5 bg-gray-50 border-none rounded-[24px] font-bold text-lg outline-none focus:ring-4 focus:ring-primary/20 transition-all" placeholder="Cosa hai notato? Es: Peronospora..." value={problemInput} onChange={e => setProblemInput(e.target.value)}/>
                            </div>
                            <button onClick={handleAnalyze} disabled={isAnalyzing || !problemInput} className="px-10 py-5 bg-primary text-white rounded-[24px] font-black uppercase text-xs tracking-widest shadow-xl hover:bg-primary-dark disabled:opacity-30 flex items-center justify-center gap-3">
                                {isAnalyzing ? <RotateCcw className="animate-spin" size={18}/> : <Zap size={18}/>}
                                {isAnalyzing ? 'Analisi...' : 'Verifica Legale'}
                            </button>
                        </div>
                    </div>

                    {result && (
                        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-lg font-black uppercase flex items-center gap-2">
                                    <CheckCircle size={20} className="text-green-500"/> Protocolli Autorizzati
                                </h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {result.allowedProducts.map(prod => (
                                    <div key={prod.id} className="bg-white rounded-[40px] p-8 shadow-xl border-t-8 border-primary flex flex-col justify-between group hover:border-primary transition-all">
                                        <div>
                                            <h4 className="text-2xl font-black text-text-primary mb-1 uppercase tracking-tighter leading-none">{prod.name}</h4>
                                            <p className="text-[10px] font-bold text-text-secondary uppercase mb-6">{prod.activeIngredient}</p>
                                            <div className="grid grid-cols-2 gap-4 mb-6">
                                                <div className="p-4 bg-gray-50 rounded-3xl border border-gray-100"><p className="text-[9px] font-black text-text-secondary">Dose Standard</p><p className="text-sm font-black">{prod.dose}</p></div>
                                                <div className="p-4 bg-red-50 rounded-3xl border border-red-100"><p className="text-[9px] font-black text-red-700">Carenza</p><p className="text-sm font-black">{prod.phiDays} gg</p></div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleConfirmTreatment(prod)}
                                            className="w-full py-5 bg-gray-900 text-white rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg"
                                        >
                                            Conferma & Registra Quaderno
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AiTreatmentsExpertPage;
