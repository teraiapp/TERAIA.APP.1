
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Search, ShieldCheck, Beaker, AlertTriangle, CheckCircle, 
    Info, LayoutGrid, Zap, Filter, ArrowRight, ShieldAlert,
    Clock, ThermometerSun, Leaf, Database, X, AlertCircle,
    TrendingUp, TrendingDown, Users, Coins, DatabaseZap
} from 'lucide-react';
import { useAppContext } from '../../hooks/useAppContext';
import { evaluateAdvancedTreatment, TreatmentRationale } from '../../utils/treatmentRulesEngine';
import { CROP_CATALOG, PROBLEM_CATALOG, STAGE_CATALOG } from '../../data/catalogoAgro';
import { Product } from '../../data/fitofarmaciData';
import { getCollectiveMemory } from '../../utils/collectiveMemoryEngine';

const Card: React.FC<{children: React.ReactNode, className?: string}> = ({ children, className }) => (
    <div className={`bg-surface rounded-xl shadow-md p-6 ${className}`}>{children}</div>
);

const RiskBadge: React.FC<{score: 'low' | 'medium' | 'high'}> = ({score}) => {
    const config = {
        low: { color: 'bg-green-100 text-green-700', label: 'RISCHIO BASSO', icon: CheckCircle },
        medium: { color: 'bg-yellow-100 text-yellow-700', label: 'RISCHIO MEDIO', icon: AlertCircle },
        high: { color: 'bg-red-100 text-red-700', label: 'RISCHIO ALTO', icon: AlertTriangle },
    };
    const { color, label, icon: Icon } = config[score];
    return <span className={`px-2 py-1 rounded-full text-[9px] font-black flex items-center gap-1 ${color}`}><Icon size={10}/> {label}</span>;
};

const ProductsCatalogPage: React.FC = () => {
    const { companyProfile } = useAppContext();
    const navigate = useNavigate();

    const units = useMemo(() => JSON.parse(localStorage.getItem('teraia_production_units_v1') || '[]'), []);
    const collectiveMemory = useMemo(() => getCollectiveMemory(), []);
    
    const [selectedUnitId, setSelectedUnitId] = useState<string>('');
    const [selectedProblemKey, setSelectedProblemKey] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const selectedUnit = useMemo(() => units.find((u: any) => String(u.id) === String(selectedUnitId)), [units, selectedUnitId]);

    const mockWeather = { rainRisk: 20, windSpeed: 8, temp: 24 };

    const availableProblems = useMemo(() => {
        if (!selectedUnit) return [];
        const cropDef = CROP_CATALOG.find(c => c.crop_key === selectedUnit.crop_key);
        return PROBLEM_CATALOG.filter(p => cropDef?.typical_problems.includes(p.problem_key));
    }, [selectedUnit]);

    const results = useMemo(() => {
        if (!selectedUnit || !selectedProblemKey || !companyProfile) return null;
        
        const problemDef = PROBLEM_CATALOG.find(p => p.problem_key === selectedProblemKey);
        const cropDef = CROP_CATALOG.find(c => c.crop_key === selectedUnit.crop_key);

        // Fixed: Property 'location' does not exist on type 'CompanyProfile'. Changed to 'localization'.
        return evaluateAdvancedTreatment(
            companyProfile.localization.region,
            cropDef?.label || 'Vite',
            problemDef?.label || 'Peronospora',
            selectedUnit.stage_key,
            mockWeather
        );
    }, [selectedUnit, selectedProblemKey, companyProfile]);

    // Helper per ottenere dati community per un prodotto specifico
    const getCommunityStats = (productName: string) => {
        const matches = collectiveMemory.filter(c => 
            c.action.productName?.toLowerCase() === productName.toLowerCase() &&
            c.result.level === 'risolto'
        );
        return matches.length;
    };

    const handleCreateDraft = (product: Product) => {
        if (!selectedUnit) return;
        const problemDef = PROBLEM_CATALOG.find(p => p.problem_key === selectedProblemKey);
        navigate('/quaderno', { 
            state: { 
                prefill: {
                    type: 'trattamento',
                    unitId: selectedUnit.id,
                    crop: selectedUnit.crop_key,
                    details: {
                        product: product.name,
                        dose: product.doses,
                        adversity: problemDef?.label || 'Controllo',
                        reason: `AI Fitogest: Consigliato per ${problemDef?.label} in fase ${selectedUnit.stage_key}`,
                        safetyIntervalDays: product.phiDays || 0
                    }
                }
            } 
        });
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-text-primary flex items-center gap-3">
                        <Beaker className="text-primary" size={32} /> Fitogest DSS <span className="text-sm bg-blue-600 text-white px-2 py-0.5 rounded italic font-normal">V2 Intelligent</span>
                    </h1>
                    <p className="text-text-secondary text-sm">Analisi normativa e tecnica incrociata con il contesto aziendale.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <h2 className="text-xs font-black text-text-secondary uppercase mb-4 flex items-center gap-2">
                            <Filter size={14}/> Configurazione Analisi
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-text-secondary mb-1 uppercase">Scegli Unità</label>
                                <select 
                                    className="w-full p-2.5 border rounded-xl bg-gray-50 font-bold text-sm"
                                    value={selectedUnitId}
                                    onChange={e => setSelectedUnitId(e.target.value)}
                                >
                                    <option value="">Seleziona...</option>
                                    {units.map((u: any) => (
                                        <option key={u.id} value={u.id}>{u.name} ({u.crop_key})</option>
                                    ))}
                                </select>
                            </div>

                            {selectedUnit && (
                                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                                    <p className="text-[10px] font-black text-blue-800 uppercase mb-2">Dati contesto unità</p>
                                    <div className="space-y-1 text-xs">
                                        <div className="flex justify-between"><span>Fase:</span> <span className="font-bold">{STAGE_CATALOG.find(s=>s.stage_key===selectedUnit.stage_key)?.label}</span></div>
                                        <div className="flex justify-between"><span>Meteo:</span> <span className="font-bold">Soleggiato, 24°C</span></div>
                                    </div>
                                </div>
                            )}

                            {selectedUnit && (
                                <div>
                                    <label className="block text-[10px] font-bold text-text-secondary mb-1 uppercase">Bersaglio (Target)</label>
                                    <select 
                                        className="w-full p-2.5 border rounded-xl bg-gray-50 font-bold text-sm"
                                        value={selectedProblemKey}
                                        onChange={e => setSelectedProblemKey(e.target.value)}
                                    >
                                        <option value="">Scegli avversità...</option>
                                        {availableProblems.map(p => (
                                            <option key={p.problem_key} value={p.problem_key}>{p.label}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    </Card>

                    {results && results.status === 'allowed' && (
                        <div className="space-y-3">
                             <p className="text-[10px] font-black text-text-secondary uppercase px-1">Scelte Ottimizzate AI</p>
                             {[
                                 { label: 'Più Sostenibile', prod: results.alternatives.ecoFriendly, icon: Leaf, color: 'text-green-600' },
                                 { label: 'Meno Costoso', prod: results.alternatives.cheapest, icon: Coins, color: 'text-yellow-600' },
                                 { label: 'Carenza Breve', prod: results.alternatives.fastestPhi, icon: Clock, color: 'text-blue-600' },
                                 { label: 'Più Affidabile', prod: results.alternatives.mostReliable, icon: Users, color: 'text-purple-600' },
                             ].map(alt => alt.prod && (
                                 <button 
                                    key={alt.label}
                                    onClick={() => setSearchTerm(alt.prod!.name)}
                                    className="w-full p-3 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-primary text-left transition-all group"
                                 >
                                     <div className="flex justify-between items-center mb-1">
                                         <span className={`text-[9px] font-black uppercase ${alt.color}`}>{alt.label}</span>
                                         <alt.icon size={12} className={alt.color}/>
                                     </div>
                                     <p className="text-xs font-bold text-text-primary group-hover:text-primary">{alt.prod.name}</p>
                                 </button>
                             ))}
                        </div>
                    )}
                </div>

                <div className="lg:col-span-3">
                    {!selectedUnit || !selectedProblemKey ? (
                        <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                            <Database size={64} className="text-gray-200 mb-4" />
                            <h3 className="text-xl font-bold text-gray-400 uppercase tracking-widest">In attesa di input</h3>
                            <p className="text-sm text-gray-400 max-w-xs">Configura l'unità e l'avversità per avviare il motore decisionale TeraIA.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    Soluzioni Analizzate <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{results?.allowedProducts.length} legali</span>
                                </h2>
                                <p className="text-[10px] font-black text-text-secondary uppercase">Fonte: {results?.source}</p>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                {results?.allowedProducts
                                    .filter(p => !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                    .map(p => {
                                        const rat = results.rationaleMap[p.id];
                                        const communityUse = getCommunityStats(p.name);
                                        return (
                                            <Card key={p.id} className="border-l-4 border-primary hover:shadow-xl transition-all">
                                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                                    <div className="md:col-span-4 border-r border-gray-50 pr-4">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h3 className="text-xl font-black text-text-primary">{p.name}</h3>
                                                            {p.organic && <Leaf className="text-green-500" size={16}/>}
                                                        </div>
                                                        <p className="text-[10px] font-bold text-text-secondary uppercase mb-4">{p.activeIngredients.join(' + ')}</p>
                                                        
                                                        {communityUse > 0 && (
                                                            <div className="flex items-center gap-1.5 mb-4 text-[10px] font-black text-primary bg-primary/5 px-2 py-1 rounded-full w-fit">
                                                                <DatabaseZap size={12}/> {communityUse} RISOLUZIONI NELLA COMMUNITY
                                                            </div>
                                                        )}

                                                        <div className="grid grid-cols-2 gap-2 mb-4">
                                                            <div className="p-2 bg-gray-50 rounded text-center">
                                                                <p className="text-[8px] font-bold text-text-secondary uppercase">Carenza</p>
                                                                <p className="text-xs font-black">{p.phiDays} gg</p>
                                                            </div>
                                                            <div className="p-2 bg-gray-50 rounded text-center">
                                                                <p className="text-[8px] font-bold text-text-secondary uppercase">Prezzo</p>
                                                                <p className="text-xs font-black">{'€'.repeat(p.priceLevel)}</p>
                                                            </div>
                                                        </div>

                                                        <RiskBadge score={rat.riskScore}/>
                                                    </div>

                                                    <div className="md:col-span-5 space-y-4">
                                                        <div>
                                                            <h4 className="text-[10px] font-black text-text-secondary uppercase mb-2 flex items-center gap-1"><Zap size={10}/> Perché consigliato</h4>
                                                            <ul className="space-y-1">
                                                                {rat.benefits.map((b, i) => <li key={i} className="text-[11px] text-green-700 flex items-center gap-1"><CheckCircle size={10}/> {b}</li>)}
                                                            </ul>
                                                        </div>
                                                        {rat.warnings.length > 0 && (
                                                            <div>
                                                                <h4 className="text-[10px] font-black text-orange-700 uppercase mb-2 flex items-center gap-1"><AlertTriangle size={10}/> Attenzione</h4>
                                                                <ul className="space-y-1">
                                                                    {rat.warnings.map((w, i) => <li key={i} className="text-[11px] text-orange-700 flex items-center gap-1">• {w}</li>)}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="md:col-span-3 flex flex-col justify-center bg-gray-50/50 p-4 rounded-xl">
                                                        <div className="text-center mb-4">
                                                            <p className="text-[9px] font-bold text-text-secondary uppercase">Memoria Collettiva</p>
                                                            <div className="flex items-center justify-center gap-1 text-primary">
                                                                <TrendingUp size={14}/>
                                                                <span className="text-lg font-black">{p.collectiveSuccessRate}%</span>
                                                            </div>
                                                            <p className="text-[8px] italic text-text-secondary">Tasso di successo in casi simili</p>
                                                        </div>
                                                        <button 
                                                            onClick={() => handleCreateDraft(p)}
                                                            className="w-full py-2.5 bg-primary text-white rounded-xl text-xs font-black hover:bg-primary-dark shadow-md transition-all flex items-center justify-center gap-2"
                                                        >
                                                            CREA BOZZA <ArrowRight size={14}/>
                                                        </button>
                                                    </div>
                                                </div>
                                            </Card>
                                        );
                                    })}
                            </div>

                            <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3">
                                <Info className="text-blue-600 shrink-0 mt-0.5" size={16}/>
                                <p className="text-[10px] text-blue-800 leading-relaxed">
                                    <b>Disclaimer Decisionale:</b> Fitogest DSS fornisce suggerimenti basati su dati storici e disciplinari caricati. La responsabilità finale dell'intervento e della miscela ricade sull'utilizzatore professionale. Verifica sempre l'etichetta fisica prima dell'acquisto.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductsCatalogPage;
