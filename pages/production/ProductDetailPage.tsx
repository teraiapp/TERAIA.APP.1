
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, ShieldCheck, Beaker, AlertTriangle, Info, 
    CheckCircle, Clock, ThermometerSun, Leaf, Database, 
    ExternalLink, ShieldAlert, FileText, Plus,
    // Fix: added missing AlertCircle import
    AlertCircle
} from 'lucide-react';
import { PRODUCTS_CATALOG } from '../../data/fitogestProducts';
import { AVVERSITA } from '../../data/avversita';

const ProductDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    const product = PRODUCTS_CATALOG.find(p => p.id === id);

    if (!product) return (
        <div className="h-screen flex flex-col items-center justify-center p-8 text-center">
            <AlertCircle size={64} className="text-red-500 mb-4" />
            <h2 className="text-2xl font-black uppercase tracking-tighter">Prodotto non trovato</h2>
            <button onClick={() => navigate(-1)} className="mt-6 text-primary font-bold underline">Torna al catalogo</button>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20 max-w-5xl mx-auto">
            {/* TOP BAR */}
            <div className="flex justify-between items-center">
                <button onClick={() => navigate(-1)} className="flex items-center text-sm font-black text-text-secondary hover:text-primary uppercase tracking-widest transition-colors">
                    <ArrowLeft size={16} className="mr-2"/> Catalogo Prodotti
                </button>
                <div className="flex gap-2">
                    <button className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm hover:bg-gray-50"><ExternalLink size={18}/></button>
                </div>
            </div>

            {/* HEADER CARD */}
            <div className="bg-surface rounded-[48px] shadow-2xl p-10 border-t-8 border-primary relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex flex-wrap gap-3 mb-6">
                        {product.bio && <span className="px-4 py-1.5 bg-green-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-md">BIOLOGICO CERTIFICATO</span>}
                        <span className="px-4 py-1.5 bg-gray-100 text-text-secondary rounded-full text-[10px] font-black uppercase tracking-widest">{product.formulazione}</span>
                    </div>
                    <h1 className="text-4xl font-black text-text-primary tracking-tighter uppercase mb-4">{product.nome}</h1>
                    <div className="flex flex-wrap items-center gap-6 text-text-secondary font-bold text-sm">
                        <span className="flex items-center gap-2"><Beaker size={18} className="text-primary"/> {product.principiAttivi.join(', ')}</span>
                        <span className="flex items-center gap-2"><ShieldCheck size={18} className="text-primary"/> Registrazione Fitogest</span>
                    </div>
                </div>
                <Beaker className="absolute -top-10 -right-10 w-64 h-64 text-primary/5 rotate-12" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* SINISTRA: INFO TECNICHE */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-[40px] p-10 shadow-xl border border-gray-50">
                        <h2 className="text-xl font-black uppercase tracking-tight mb-8 flex items-center gap-3">
                            <Info size={24} className="text-primary"/> Dettaglio Tecnico
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-3 flex items-center gap-2"><Database size={14}/> Colture Autorizzate</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {product.coltureConsentite.map(c => (
                                            <span key={c} className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold capitalize text-text-primary">{c}</span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-3 flex items-center gap-2"><AlertTriangle size={14}/> Avversità Controllate</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {product.avversitaConsentite.map(a => (
                                            <span key={a} className="px-3 py-1 bg-orange-50 text-orange-700 rounded-lg text-xs font-bold">
                                                {AVVERSITA.find(av => av.key === a)?.label || a}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="flex justify-between items-center p-6 bg-red-50 rounded-[32px] border border-red-100">
                                    <div>
                                        <p className="text-[10px] font-black text-red-700 uppercase mb-1">Tempo di Carenza</p>
                                        <p className="text-3xl font-black text-red-800">{product.carenzaGiorni} Giorni</p>
                                    </div>
                                    <Clock size={32} className="text-red-300"/>
                                </div>
                                <div className="flex justify-between items-center p-6 bg-blue-50 rounded-[32px] border border-blue-100">
                                    <div>
                                        <p className="text-[10px] font-black text-blue-700 uppercase mb-1">Dose Standard</p>
                                        <p className="text-xl font-black text-blue-800">{product.doseMin}-{product.doseMax} {product.unitaMisura}</p>
                                    </div>
                                    <Beaker size={32} className="text-blue-300"/>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[40px] p-10 shadow-xl border border-gray-50">
                        <h2 className="text-xl font-black uppercase tracking-tight mb-8 flex items-center gap-3">
                            <ShieldAlert size={24} className="text-orange-500"/> Sicurezza e Normativa
                        </h2>
                        <div className="space-y-4">
                            <div className="p-5 bg-gray-50 rounded-2xl flex items-center justify-between border border-gray-100">
                                <span className="font-bold text-sm">Classificazione Pericolo</span>
                                <span className={`px-4 py-1 rounded-full text-xs font-black uppercase ${product.pericolo === 'Pericolo' ? 'bg-red-600 text-white shadow-lg' : 'bg-green-100 text-green-700'}`}>{product.pericolo}</span>
                            </div>
                            <div className="p-5 bg-gray-50 rounded-2xl flex items-center justify-between border border-gray-100">
                                <span className="font-bold text-sm">Intervallo di Rientro (REI)</span>
                                <span className="font-black text-sm">{product.intervalloSicurezzaGiorni * 24} Ore</span>
                            </div>
                            <div className="p-5 bg-gray-50 rounded-2xl flex items-center justify-between border border-gray-100">
                                <span className="font-bold text-sm">Trattamenti Massimi / Anno</span>
                                <span className="font-black text-sm">{product.maxTrattamentiAnno} Interventi</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* DESTRA: CTA E TAGS */}
                <div className="space-y-8">
                    <div className="bg-gray-900 text-white rounded-[40px] p-10 shadow-2xl">
                        <h2 className="text-xl font-black uppercase tracking-tight mb-8">Pianificazione</h2>
                        <button 
                            onClick={() => {
                                const savedDraft = JSON.parse(localStorage.getItem('teraia_treatment_draft_v1') || '{"products":[]}');
                                if (!savedDraft.products.some((curr:any) => curr.id === product.id)) {
                                    savedDraft.products.push(product);
                                    localStorage.setItem('teraia_treatment_draft_v1', JSON.stringify(savedDraft));
                                    alert('Aggiunto alla bozza!');
                                }
                                navigate('/catalogo-fitosanitari');
                            }}
                            className="w-full py-5 bg-primary text-white rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                        >
                            <Plus size={20}/> Aggiungi a Bozza
                        </button>
                        <p className="mt-8 text-[10px] text-center opacity-40 uppercase font-black tracking-[0.2em] leading-relaxed">
                            Ricorda di compilare il <br/> registro dei trattamenti entro 48h
                        </p>
                    </div>

                    <div className="bg-blue-600 rounded-[40px] p-8 text-white shadow-xl">
                        <h3 className="text-lg font-black mb-4 uppercase tracking-tighter flex items-center gap-2"><FileText size={18}/> Tag Prodotto</h3>
                        <div className="flex flex-wrap gap-2">
                            {product.tags.map(t => (
                                <span key={t} className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase">
                                    # {t}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;
