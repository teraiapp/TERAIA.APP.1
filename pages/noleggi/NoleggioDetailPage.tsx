
import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, Tractor, MapPin, Calendar, Clock, 
    ShieldCheck, Info, CreditCard, MessageSquare, 
    CheckCircle, AlertTriangle, User, Globe
} from 'lucide-react';
import { INITIAL_RENT_LISTINGS, RentListing } from '../../data/noleggioDataV2';

const NoleggioDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    const [listings] = useState<RentListing[]>(() => {
        const saved = localStorage.getItem('teraia_rent_listings_v1');
        return saved ? JSON.parse(saved) : INITIAL_RENT_LISTINGS;
    });

    const listing = useMemo(() => listings.find(l => l.id === id), [listings, id]);

    if (!listing) return (
        <div className="h-screen flex flex-col items-center justify-center p-8 text-center">
            <AlertTriangle size={64} className="text-red-500 mb-4"/>
            <h2 className="text-2xl font-black uppercase">Annuncio non trovato</h2>
            <button onClick={() => navigate('/noleggi')} className="mt-6 text-primary font-bold underline">Torna al catalogo</button>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* TOP BAR */}
            <div className="flex justify-between items-center">
                <button onClick={() => navigate(-1)} className="flex items-center text-sm font-black text-text-secondary hover:text-primary uppercase tracking-widest transition-colors">
                    <ArrowLeft size={16} className="mr-2"/> Torna al Catalogo
                </button>
            </div>

            {/* MAIN CONTENT */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* SINISTRA: GALLERY E INFO */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="bg-white rounded-[48px] shadow-2xl overflow-hidden border border-gray-100">
                        <div className="h-96 bg-gray-50 flex items-center justify-center text-9xl">
                            {listing.images[0]}
                        </div>
                        <div className="p-10">
                            <div className="flex flex-wrap gap-3 mb-6">
                                <span className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest">{listing.category}</span>
                                <span className="px-4 py-1.5 bg-gray-100 text-text-secondary rounded-full text-[10px] font-black uppercase tracking-widest">P2P Certificato</span>
                            </div>
                            <h1 className="text-4xl font-black text-text-primary tracking-tighter uppercase mb-4">{listing.title}</h1>
                            <div className="flex flex-wrap items-center gap-6 text-text-secondary font-bold text-sm mb-10">
                                <span className="flex items-center gap-2"><MapPin size={18} className="text-primary"/> {listing.city}, {listing.province} ({listing.region})</span>
                                <span className="flex items-center gap-2"><User size={18} className="text-primary"/> Proprietario: {listing.ownerName}</span>
                            </div>

                            <div className="prose max-w-none">
                                <h3 className="text-xl font-black uppercase tracking-tight mb-4">Descrizione Mezzo</h3>
                                <p className="text-text-secondary leading-relaxed font-medium bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                    {listing.description}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                                <div className="space-y-4">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-text-secondary flex items-center gap-2">
                                        <ShieldCheck size={18} className="text-primary"/> Regole di Noleggio
                                    </h4>
                                    <ul className="space-y-3">
                                        {['Sanificazione obbligatoria al rientro', 'Pieno di carburante incluso', 'Assicurazione Kasko TeraIA', 'Documento identità richiesto'].map((r, i) => (
                                            <li key={i} className="text-sm font-bold text-text-primary flex items-center gap-2">
                                                <CheckCircle size={14} className="text-green-500"/> {r}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-text-secondary flex items-center gap-2">
                                        <CreditCard size={18} className="text-primary"/> Politiche di Deposito
                                    </h4>
                                    <div className="p-5 bg-orange-50 rounded-[32px] border border-orange-100">
                                        <p className="text-xs font-bold text-orange-800">
                                            {listing.hasDeposit 
                                                ? `Questo proprietario richiede un deposito di € ${listing.depositAmount}. Verrà bloccato sulla carta e rilasciato 24h dopo il rientro.`
                                                : "Nessun deposito cauzionale richiesto per questo mezzo."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* DESTRA: PREZZO E AZIONI */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-gray-900 text-white rounded-[40px] p-10 shadow-2xl sticky top-8">
                        <div className="mb-10">
                            <p className="text-[10px] font-black uppercase text-white/40 tracking-widest mb-1">Prezzo al giorno</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-black">€{listing.pricePerDay}</span>
                                <span className="text-sm opacity-50 font-bold">IVA Incl.</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <button 
                                onClick={() => navigate('/noleggi')} // In un'app reale aprirebbe il modale di prenotazione
                                className="w-full py-5 bg-primary text-white rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                            >
                                <Calendar size={20}/> Prenota Ora
                            </button>
                            <button className="w-full py-5 bg-white/10 text-white border border-white/10 rounded-3xl font-black uppercase text-xs tracking-widest hover:bg-white/20 transition-all flex items-center justify-center gap-3">
                                <MessageSquare size={20}/> Contatta Proprietario
                            </button>
                        </div>

                        <div className="mt-10 pt-10 border-t border-white/10 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/5 rounded-xl"><Globe size={16} className="text-primary"/></div>
                                <div>
                                    <p className="text-[10px] font-black uppercase opacity-40">Località</p>
                                    <p className="text-xs font-bold">{listing.city}, {listing.province}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/5 rounded-xl"><Clock size={16} className="text-primary"/></div>
                                <div>
                                    <p className="text-[10px] font-black uppercase opacity-40">Tempi Risposta</p>
                                    <p className="text-xs font-bold">In genere 2 ore</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 p-6 bg-white/5 rounded-[32px] border border-white/5">
                            <p className="text-[9px] font-black uppercase text-center opacity-50 tracking-[0.2em]">Pagamento protetto da TeraIA</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NoleggioDetailPage;
