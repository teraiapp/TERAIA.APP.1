
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ShieldCheck, Search, AlertTriangle, CheckCircle, 
    FileText, Zap, Info, ArrowRight, CloudSun, Beaker,
    Database, MapPin, LayoutGrid, X, Calendar, Settings, SearchCode
} from 'lucide-react';
import { useAppContext } from '../../hooks/useAppContext';
import { evaluateTreatmentRules, logAiRecommendation, TreatmentRecommendation } from '../../utils/treatmentRulesEngine';
import { Product } from '../../data/fitofarmaciData';
import { CROP_CATALOG, STAGE_CATALOG, PROBLEM_CATALOG } from '../../data/catalogoAgro';

const Card: React.FC<{children: React.ReactNode, className?: string}> = ({ children, className }) => (
    <div className={`bg-surface rounded-xl shadow-md p-6 ${className}`}>{children}</div>
);

const AiTreatmentsPage: React.FC = () => {
    const { currentUser, companyProfile } = useAppContext();
    const navigate = useNavigate();

    const units = useMemo(() => JSON.parse(localStorage.getItem('teraia_production_units_v1') || '[]'), []);
    
    const [selectedUnitId, setSelectedUnitId] = useState<string>('');
    const [selectedProblemKey, setSelectedProblemKey] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [recommendation, setRecommendation] = useState<TreatmentRecommendation | null>(null);

    const selectedUnit = useMemo(() => units.find((u: any) => String(u.id) === String(selectedUnitId)), [units, selectedUnitId]);

    const isUnitReady = selectedUnit && selectedUnit.crop_key && selectedUnit.stage_key;

    const availableProblems = useMemo(() => {
        if (!selectedUnit) return [];
        const cropDef = CROP_CATALOG.find(c => c.crop_key === selectedUnit.crop_key);
        if (!cropDef) return PROBLEM_CATALOG;
        return PROBLEM_CATALOG.filter(p => cropDef.typical_problems.includes(p.problem_key));
    }, [selectedUnit]);

    const handleGenerate = () => {
        if (!selectedUnit || !companyProfile || !selectedProblemKey) return;
        
        setIsGenerating(true);
        setTimeout(() => {
            const problemDef = PROBLEM_CATALOG.find(p => p.problem_key === selectedProblemKey);
            const cropDef = CROP_CATALOG.find(c => c.crop_key === selectedUnit.crop_key);

            const result = evaluateTreatmentRules(
                companyProfile.localization.regionName || 'Puglia',
                cropDef?.label || 'Vite',
                problemDef?.label || 'Peronospora'
            );

            setRecommendation(result);
            setIsGenerating(false);

            logAiRecommendation(currentUser?.id || 'anon', {
                unitId: selectedUnit.id,
                problem_key: selectedProblemKey,
                status: result.status
            });
        }, 1200);
    };

    const handleOpenCatalog = () => {
        const problemDef = PROBLEM_CATALOG.find(p => p.problem_key === selectedProblemKey);
        const cropDef = CROP_CATALOG.find(c => c.crop_key === selectedUnit?.crop_key);
        const params = new URLSearchParams({
            regione: companyProfile?.localization.regionName || '',
            coltura: cropDef?.label || '',
            avversita: problemDef?.problem_key || ''
        });
        navigate(`/catalogo-fitosanitari?${params.toString()}`);
    };

    const handleCreateDraft = (product: Product) => {
        if (!selectedUnit) return;
        const problemDef = PROBLEM_CATALOG.find(p => p.problem_key === selectedProblemKey);
        
        navigate('/quaderno', { 
            state: { 
                prefill: {
                    type: 'trattamento',
                    unitId: selectedUnit.id,
                    crop: selectedUnit.variety ? `${selectedUnit.crop_key} (${selectedUnit.variety})` : selectedUnit.crop_key,
                    details: {
                        product: product.name,
                        dose: product.doses || 'Da definire',
                        adversity: problemDef?.label || selectedProblemKey,
                        reason: `AI V1: Suggerimento per ${problemDef?.label} in fase ${selectedUnit.stage_key}`,
                        safetyIntervalDays: product.phiDays || 0
                    }
                }
            } 
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-text-primary flex items-center gap-3">
                        <ShieldCheck className="text-primary" size={32} /> AI Trattamenti (Normativa)
                    </h1>
                    <p className="text-text-secondary text-sm">Validazione automatica dei principi attivi basata su disciplinari regionali.</p>
                </div>
                <button 
                    onClick={handleOpenCatalog}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all"
                >
                    <SearchCode size={16}/> Sfoglia Catalogo Completo
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="space-y-6">
                    <Card>
                        <h2 className="text-sm font-black text-text-secondary uppercase mb-4 flex items-center gap-2">
                            <LayoutGrid size={16}/> Selezione Contesto
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-text-secondary mb-1 uppercase">Scegli Unità</label>
                                <select 
                                    className="w-full p-3 border rounded-xl bg-gray-50 font-bold text-sm"
                                    value={selectedUnitId}
                                    onChange={e => setSelectedUnitId(e.target.value)}
                                >
                                    <option value="">Seleziona unità...</option>
                                    {units.map((u: any) => (
                                        <option key={u.id} value={u.id}>{u.name} ({u.crop_key})</option>
                                    ))}
                                </select>
                            </div>

                            {selectedUnit && (
                                <div className={`p-4 rounded-xl border-2 transition-all ${isUnitReady ? 'bg-primary/5 border-primary/20' : 'bg-red-50 border-red-200'}`}>
                                    {isUnitReady ? (
                                        <div className="space-y-2 text-xs font-bold">
                                            <p className="text-[10px] font-black uppercase text-primary mb-1">Dati Rilevati</p>
                                            <div className="flex items-center gap-2"><LayoutGrid size={14} className="text-text-secondary"/> Coltura: <span className="text-primary uppercase">{selectedUnit.crop_key}</span></div>
                                            <div className="flex items-center gap-2"><Calendar size={14} className="text-text-secondary"/> Fase: <span className="text-blue-600 uppercase">{selectedUnit.stage_key}</span></div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-2">
                                            <AlertTriangle className="mx-auto text-red-500 mb-1" size={20}/>
                                            <p className="text-[10px] font-black text-red-800 uppercase">Unità Incompleta</p>
                                            <button onClick={() => navigate('/produzione')} className="mt-2 text-[10px] font-bold underline">Aggiorna Dati</button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {isUnitReady && (
                                <div>
                                    <label className="block text-[10px] font-bold text-text-secondary mb-1 uppercase">Problema Rilevato</label>
                                    <select 
                                        className="w-full p-3 border rounded-xl bg-gray-50 font-bold text-sm"
                                        value={selectedProblemKey}
                                        onChange={e => setSelectedProblemKey(e.target.value)}
                                    >
                                        <option value="">Scegli problema...</option>
                                        {availableProblems.map(p => (
                                            <option key={p.problem_key} value={p.problem_key}>{p.label}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <button 
                                onClick={handleGenerate}
                                disabled={!isUnitReady || !selectedProblemKey || isGenerating}
                                className="w-full py-4 bg-primary text-white rounded-2xl font-black shadow-lg hover:bg-primary-dark transition-all disabled:opacity-30 flex items-center justify-center gap-2"
                            >
                                {isGenerating ? <Zap className="animate-spin" /> : <Zap />}
                                {isGenerating ? "ANALISI IN CORSO..." : "GENERA CONSIGLIO LEGALE"}
                            </button>
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-2">
                    {!recommendation ? (
                        <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                            <Beaker size={64} className="text-gray-200 mb-4" />
                            <h3 className="text-xl font-bold text-gray-400 uppercase tracking-widest">In Attesa di Input</h3>
                            <p className="text-sm text-gray-400 max-w-xs mx-auto font-medium">L'analisi incrocerà il disciplinare di {companyProfile?.localization.regionName} con la tua fase fenologica.</p>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <CheckCircle className="text-green-500" /> Analisi Completata
                                </h2>
                                <button onClick={() => setRecommendation(null)} className="p-2 hover:bg-gray-100 rounded-full transition-all"><X size={20}/></button>
                            </div>

                            <Card className="border-l-8 border-primary bg-primary/5">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className="text-[10px] font-black uppercase text-primary tracking-widest">Protocollo Autorizzato</span>
                                        <h3 className="text-2xl font-black mt-1 uppercase">
                                            {selectedProblemKey} su {selectedUnit?.crop_key}
                                        </h3>
                                        <p className="text-xs font-bold text-text-secondary mt-1">Regione: {companyProfile?.localization.regionName}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-text-secondary uppercase">Sorgente</p>
                                        <p className="text-xs font-black text-text-primary underline decoration-primary decoration-2">{recommendation.source}</p>
                                    </div>
                                </div>
                            </Card>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className="space-y-4">
                                    <h4 className="text-xs font-black text-text-secondary uppercase tracking-widest flex items-center gap-2">
                                        <Beaker size={16} className="text-blue-500"/> Opzioni Consigliate
                                    </h4>
                                    <div className="space-y-3">
                                        {recommendation.allowedProducts.length > 0 ? recommendation.allowedProducts.map(p => (
                                            <div key={p.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-primary transition-all">
                                                <div className="flex justify-between items-start">
                                                    <p className="font-black text-sm text-text-primary">{p.name}</p>
                                                    {p.organic && <span className="text-[8px] font-black bg-green-600 text-white px-1.5 py-0.5 rounded uppercase">BIO</span>}
                                                </div>
                                                <div className="flex gap-4 mt-3 text-[10px] font-black">
                                                    <span className="text-text-secondary uppercase">Carenza: <b className="text-red-500">{p.phiDays || '?'} gg</b></span>
                                                    <span className="text-text-secondary uppercase">Dose: <b className="text-primary">{p.doses}</b></span>
                                                </div>
                                                <button 
                                                    onClick={() => handleCreateDraft(p)}
                                                    className="w-full mt-4 py-2.5 bg-white border border-gray-200 rounded-xl text-[10px] font-black text-primary hover:bg-primary hover:text-white transition-all shadow-sm uppercase tracking-widest"
                                                >
                                                    Usa Prodotto
                                                </button>
                                            </div>
                                        )) : (
                                            <p className="text-sm text-text-secondary italic">Nessuna opzione trovata nel disciplinare per questa combinazione.</p>
                                        )}
                                    </div>
                                    {recommendation.allowedProducts.length > 0 && (
                                        <button 
                                            onClick={handleOpenCatalog}
                                            className="w-full text-center text-[10px] font-black text-text-secondary uppercase hover:text-primary transition-colors py-2 border-t border-gray-50 mt-2"
                                        >
                                            Vedi altri prodotti nel catalogo &rarr;
                                        </button>
                                    )}
                                </Card>

                                <div className="space-y-6">
                                    <Card className="border-l-4 border-red-500">
                                        <h4 className="text-xs font-black text-red-600 uppercase tracking-widest flex items-center gap-2 mb-3">
                                            <AlertTriangle size={16}/> Limiti Vincolanti
                                        </h4>
                                        <ul className="space-y-2">
                                            {recommendation.restrictions.map((r, i) => (
                                                <li key={i} className="text-[11px] text-text-secondary leading-relaxed font-medium">
                                                    • {r}
                                                </li>
                                            ))}
                                        </ul>
                                    </Card>

                                    <div className="p-6 bg-gradient-to-br from-indigo-600 to-blue-800 rounded-[32px] text-white shadow-xl">
                                        <h4 className="text-xs font-black uppercase tracking-widest mb-2">Supporto Decisionale</h4>
                                        <p className="text-[11px] opacity-80 leading-relaxed font-medium">
                                            Le scelte proposte rispettano il regime autorizzato dal disciplinare regionale della tua zona. Prima dell'acquisto, consulta sempre la scheda tecnica Fitogest integrata nel catalogo.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AiTreatmentsPage;
