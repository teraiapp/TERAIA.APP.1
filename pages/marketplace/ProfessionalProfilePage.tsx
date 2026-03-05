
import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, Star, MapPin, Globe, CheckCircle, 
    Briefcase, Info, Mail, Phone, Calendar, 
    // Added Clock to the imports
    ShieldCheck, Zap, Award, BookOpen, AlertCircle, Clock
} from 'lucide-react';
import { INITIAL_PROS_V3 } from '../../data/marketplaceV3Data';

const ProfessionalProfilePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    // In produzione: localStorage or API
    const pro = useMemo(() => INITIAL_PROS_V3.find(p => p.id === id), [id]);

    if (!pro) return (
        <div className="h-screen flex flex-col items-center justify-center p-8 text-center">
            <AlertCircle size={64} className="text-red-500 mb-4"/>
            <h2 className="text-2xl font-black uppercase">Professionista non trovato</h2>
            <button onClick={() => navigate('/marketplace')} className="mt-6 text-primary font-bold underline">Torna alla directory</button>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20 max-w-6xl mx-auto">
            <button onClick={() => navigate(-1)} className="flex items-center text-sm font-black text-text-secondary hover:text-primary uppercase tracking-widest transition-colors">
                <ArrowLeft size={16} className="mr-2"/> Torna indietro
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* COLONNA SINISTRA: PROFILE HEADER & BIO */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="bg-white rounded-[48px] shadow-2xl p-10 border border-gray-100 flex flex-col md:flex-row gap-10 items-center md:items-start">
                        <div className="w-48 h-48 bg-gray-50 rounded-[48px] flex items-center justify-center text-8xl shadow-lg shrink-0 group-hover:rotate-3 transition-transform">
                            {pro.image}
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                                <span className="px-4 py-1.5 bg-primary text-white rounded-full text-xs font-black uppercase tracking-tighter">{pro.role}</span>
                                <span className="px-4 py-1.5 bg-gray-100 text-text-secondary rounded-full text-xs font-black uppercase tracking-tighter flex items-center gap-1"><Star size={14} className="fill-yellow-500 text-yellow-500"/> {pro.rating} Feedback</span>
                            </div>
                            <h1 className="text-4xl font-black text-text-primary uppercase tracking-tighter mb-4">{pro.name}</h1>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-text-secondary font-bold text-sm">
                                <span className="flex items-center gap-2"><MapPin size={18} className="text-primary"/> {pro.areaServed}</span>
                                {pro.onlineConsultation && <span className="flex items-center gap-2 font-black text-primary bg-primary/5 px-3 py-1 rounded-full text-[10px] uppercase uppercase"><Globe size={14}/> Disponibile Online</span>}
                            </div>
                            <p className="mt-8 text-lg text-text-secondary leading-relaxed font-medium">
                                {pro.bio}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white rounded-[40px] p-10 shadow-xl border border-gray-100">
                            <h3 className="text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-3">
                                <Award size={24} className="text-primary"/> Servizi Offerti
                            </h3>
                            <ul className="space-y-4">
                                {pro.services.map((s, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm font-bold text-text-primary">
                                        <CheckCircle size={18} className="text-green-500 shrink-0"/> {s}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-white rounded-[40px] p-10 shadow-xl border border-gray-100 flex flex-col justify-between">
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-3">
                                    <ShieldCheck size={24} className="text-primary"/> Tariffe & Modalità
                                </h3>
                                <p className="text-2xl font-black text-text-primary mb-4">{pro.pricing}</p>
                                <p className="text-xs text-text-secondary font-medium leading-relaxed">Le tariffe sono indicative. Ogni richiesta viene analizzata per fornire un preventivo personalizzato basato sulle unità produttive collegate.</p>
                            </div>
                            <div className="mt-8 p-4 bg-gray-50 rounded-2xl flex items-center gap-3 border border-gray-100">
                                <BookOpen size={20} className="text-primary"/>
                                <p className="text-[10px] font-black uppercase text-text-secondary tracking-widest">Inscritto all'albo professionale</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* COLONNA DESTRA: CTA */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-gray-900 text-white rounded-[40px] p-10 shadow-2xl">
                        <h2 className="text-2xl font-black uppercase tracking-tighter mb-8">Consulenza Rapida</h2>
                        <p className="text-sm opacity-60 mb-10 font-medium">Invia i dati della tua azienda per ricevere un'analisi preliminare da {pro.name}.</p>
                        
                        <div className="space-y-4 mb-10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/5 rounded-xl text-primary"><Clock size={16}/></div>
                                <div>
                                    <p className="text-[10px] font-black uppercase opacity-40">Tempi Risposta</p>
                                    <p className="text-xs font-bold">Entro 24 ore</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/5 rounded-xl text-primary"><Mail size={16}/></div>
                                <div>
                                    <p className="text-[10px] font-black uppercase opacity-40">Comunicazione</p>
                                    <p className="text-xs font-bold">Protetta e Certificata</p>
                                </div>
                            </div>
                        </div>

                        <button onClick={() => navigate('/marketplace')} className="w-full py-5 bg-primary text-white rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
                            <Zap size={20}/> Inizia Consulenza
                        </button>
                    </div>

                    <div className="p-8 bg-blue-50 rounded-[40px] border border-blue-100 flex items-start gap-4">
                        <Info size={32} className="text-blue-600 shrink-0"/>
                        <div>
                            <h4 className="font-black text-blue-900 uppercase text-xs tracking-widest">Nota per l'Utente</h4>
                            <p className="text-xs text-blue-800 font-medium mt-1 leading-relaxed">
                                Puoi allegare foto dal modulo <b>Produzione</b> o dati dal <b>Quaderno di Campagna</b> dopo aver inviato la richiesta iniziale.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfessionalProfilePage;
