
import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, MapPin, Tag, Calendar, 
    ShieldCheck, Info, MessageSquare, 
    Share2, Heart, Trash2, AlertTriangle,
    ShoppingCart, CheckCircle, User, Phone, Zap
} from 'lucide-react';
import { INITIAL_MARKET_ADS } from '../../data/marketplaceV3Data';

const AdDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    // In un caso reale caricherebbe da localStorage, qui usiamo mock + localStorage
    const [ads] = useState(() => JSON.parse(localStorage.getItem('teraia_market_ads_v1') || JSON.stringify(INITIAL_MARKET_ADS)));
    const ad = useMemo(() => ads.find((a: any) => a.id === id), [ads, id]);

    if (!ad) return (
        <div className="h-screen flex flex-col items-center justify-center p-8 text-center">
            <AlertTriangle size={64} className="text-red-500 mb-4"/>
            <h2 className="text-2xl font-black uppercase">Inserzione non trovata</h2>
            <button onClick={() => navigate('/marketplace')} className="mt-6 text-primary font-bold underline">Torna al marketplace</button>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 max-w-6xl mx-auto">
            <button onClick={() => navigate(-1)} className="flex items-center text-sm font-black text-text-secondary hover:text-primary uppercase tracking-widest transition-colors">
                <ArrowLeft size={16} className="mr-2"/> Torna indietro
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* SINISTRA: MEDIA E INFO */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="bg-white rounded-[48px] shadow-2xl overflow-hidden border border-gray-100">
                        <div className="h-[400px] bg-gray-50 flex items-center justify-center text-9xl">
                            {ad.images[0]}
                        </div>
                        <div className="p-10">
                            <div className="flex flex-wrap gap-3 mb-6">
                                <span className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest">{ad.category}</span>
                                <span className="px-4 py-1.5 bg-gray-100 text-text-secondary rounded-full text-[10px] font-black uppercase tracking-widest">Usato Certificato</span>
                            </div>
                            <h1 className="text-4xl font-black text-text-primary tracking-tighter uppercase mb-4">{ad.title}</h1>
                            <div className="flex flex-wrap items-center gap-6 text-text-secondary font-bold text-sm mb-10">
                                <span className="flex items-center gap-2"><MapPin size={18} className="text-primary"/> {ad.city}, {ad.province} ({ad.region})</span>
                                <span className="flex items-center gap-2"><User size={18} className="text-primary"/> Venditore: {ad.ownerName}</span>
                            </div>

                            <div className="prose max-w-none">
                                <h3 className="text-xl font-black uppercase tracking-tight mb-4 border-b-2 border-gray-50 pb-2">Descrizione</h3>
                                <p className="text-text-secondary leading-relaxed font-medium bg-gray-50 p-6 rounded-3xl border border-gray-100 italic">
                                    "{ad.description}"
                                </p>
                            </div>

                            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="p-6 bg-blue-50 rounded-[32px] border border-blue-100">
                                    <h4 className="text-[10px] font-black uppercase text-blue-800 mb-2 flex items-center gap-2"><ShieldCheck size={16}/> Garanzia SafeTrade</h4>
                                    <p className="text-xs text-blue-700 font-medium">Transazione monitorata da TeraIA per la massima sicurezza tra agricoltori.</p>
                                </div>
                                <div className="p-6 bg-orange-50 rounded-[32px] border border-orange-100">
                                    <h4 className="text-[10px] font-black uppercase text-orange-800 mb-2 flex items-center gap-2"><Info size={16}/> Spedizione</h4>
                                    <p className="text-xs text-orange-700 font-medium">Contatta il venditore per concordare ritiro in sede o consegna a domicilio.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* DESTRA: PREZZO E AZIONI */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-gray-900 text-white rounded-[40px] p-10 shadow-2xl sticky top-8">
                        <div className="mb-10 text-center">
                            <p className="text-[10px] font-black uppercase text-white/40 tracking-widest mb-1">Prezzo Richiesto</p>
                            <p className="text-6xl font-black">€{ad.price.toLocaleString()}</p>
                            {ad.quantity && <p className="text-sm font-bold opacity-60 mt-2">({ad.quantity})</p>}
                        </div>

                        <div className="space-y-4">
                            <button onClick={() => alert('Chat avviata!')} className="w-full py-5 bg-primary text-white rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3">
                                <MessageSquare size={20}/> Contatta Venditore
                            </button>
                            <button className="w-full py-5 bg-white/10 text-white border border-white/10 rounded-3xl font-black uppercase text-xs tracking-widest hover:bg-white/20 transition-all flex items-center justify-center gap-3">
                                <Phone size={20}/> Mostra Telefono
                            </button>
                        </div>

                        <div className="mt-10 pt-10 border-t border-white/10 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/5 rounded-xl text-primary"><Zap size={16}/></div>
                                <div>
                                    <p className="text-[10px] font-black uppercase opacity-40">Affidabilità Venditore</p>
                                    <p className="text-xs font-bold">Verificato TeraIA (98%)</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/5 rounded-xl text-primary"><Calendar size={16}/></div>
                                <div>
                                    <p className="text-[10px] font-black uppercase opacity-40">Pubblicato il</p>
                                    <p className="text-xs font-bold">{new Date(ad.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 flex gap-2">
                            <button className="flex-1 py-3 border border-white/20 rounded-xl flex items-center justify-center gap-2 hover:bg-white/5 transition-all">
                                <Heart size={16}/> <span className="text-[9px] font-black uppercase">Salva</span>
                            </button>
                            <button className="flex-1 py-3 border border-white/20 rounded-xl flex items-center justify-center gap-2 hover:bg-white/5 transition-all">
                                <Share2 size={16}/> <span className="text-[9px] font-black uppercase">Condividi</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdDetailPage;
