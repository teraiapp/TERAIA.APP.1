
import React from 'react';
import { Check, Star, Lock, Zap, ArrowRight, ShieldCheck, DatabaseZap, Sparkles } from 'lucide-react';
import { useAppContext } from '../../hooks/useAppContext';
import { Plan } from '../../types';

const plans = [
    {
        name: Plan.FREE,
        title: 'Essenziale',
        price: '0€',
        priceSuffix: '/ sempre',
        description: 'Strumenti base per digitalizzare la tua azienda senza costi fissi.',
        features: [
            'Quaderno di Campagna manuale',
            'Registro Sanitario Allevamento',
            'Notifiche Meteo base',
            'Accesso Marketplace (Commissione 5%)',
            'Gestione fino a 3 unità',
        ],
        cta: 'Piano Attivo',
        style: 'border-gray-200'
    },
    {
        name: Plan.PRO,
        title: 'Produttività',
        price: '29€',
        priceSuffix: '/ mese',
        description: 'Potenzia la tua efficienza con l\'AI che lavora per te.',
        features: [
            'AI Predittiva (Forecast 14gg)',
            'Automazioni Guidate (Bozze rapide)',
            'Memoria Collettiva (Esperienze reali)',
            'Fitogest AI (Consigli Legali)',
            'Unità illimitate',
            'Commissione Marketplace ridotta (2%)'
        ],
        cta: 'Passa a PRO',
        style: 'border-primary ring-4 ring-primary/20 bg-primary/5 shadow-2xl scale-105'
    },
    {
        name: Plan.BUSINESS,
        title: 'Business',
        price: '89€',
        priceSuffix: '/ mese',
        description: 'Per aziende strutturate che collaborano con professionisti.',
        features: [
            'Multi-utente (Agronomi, Vet, Comm)',
            'Dashboard per Professionisti',
            'Report Export per Certificazioni',
            'Integrazione Sensori Hardware',
            'Supporto tecnico prioritario',
            'Commissione Marketplace (0.5%)'
        ],
        cta: 'Scegli Business',
        style: 'border-blue-600'
    }
];

const PianiPage: React.FC = () => {
    const { currentUser } = useAppContext();

    return (
        <div className="space-y-12 pb-20">
            <div className="text-center max-w-2xl mx-auto">
                <h1 className="text-4xl font-black text-text-primary">Scegli la tua marcia</h1>
                <p className="mt-4 text-lg text-text-secondary font-medium">
                    TeraIA cresce con la tua azienda. Inizia gratis, scala solo quando vedi il valore.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {plans.map(plan => (
                    <div key={plan.name} className={`relative bg-surface rounded-[40px] shadow-xl p-10 border-2 flex flex-col ${plan.style}`}>
                        {plan.name === Plan.PRO && (
                            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-primary text-white px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest shadow-lg flex items-center gap-2">
                                <Sparkles size={14}/> Più scelto
                            </div>
                        )}
                        <div className="mb-8">
                            <h2 className="text-2xl font-black text-text-primary">{plan.title}</h2>
                            <p className="text-sm text-text-secondary mt-2 font-medium min-h-[40px]">{plan.description}</p>
                        </div>
                        <div className="mb-10">
                            <span className="text-5xl font-black text-text-primary">{plan.price}</span>
                            <span className="text-text-secondary font-bold ml-1">{plan.priceSuffix}</span>
                        </div>
                        <ul className="space-y-5 flex-grow">
                            {plan.features.map((feature, index) => (
                                <li key={index} className="flex items-start">
                                    <Check className="h-5 w-5 text-primary flex-shrink-0 mr-3 mt-0.5" />
                                    <span className="text-sm font-semibold text-text-primary/80">{feature}</span>
                                </li>
                            ))}
                        </ul>
                        <button 
                            disabled={currentUser?.plan === plan.name}
                            className={`w-full mt-12 py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
                                plan.name === Plan.PRO 
                                ? 'bg-primary text-white hover:bg-primary-dark shadow-xl hover:shadow-primary/30' 
                                : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {currentUser?.plan === plan.name ? 'Il Tuo Piano' : plan.cta}
                        </button>
                    </div>
                ))}
            </div>
            
            <section className="bg-white rounded-[40px] shadow-xl p-12 border border-gray-100">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl font-black mb-4 flex items-center gap-3">
                            <DatabaseZap className="text-primary"/> Monetizzazione Etica
                        </h2>
                        <p className="text-text-secondary font-medium leading-relaxed">
                            A differenza dei software tradizionali, TeraIA non vende i tuoi dati. 
                            I nostri costi sono coperti da abbonamenti trasparenti e da una piccola commissione sulle transazioni nel marketplace. 
                            <b> Paghiamo l'AI solo quando ti aiuta a guadagnare o a risparmiare.</b>
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 bg-gray-50 rounded-3xl text-center">
                            <p className="text-2xl font-black text-primary">0%</p>
                            <p className="text-[10px] font-black uppercase text-text-secondary">Vendita Dati</p>
                        </div>
                        <div className="p-6 bg-gray-50 rounded-3xl text-center">
                            <p className="text-2xl font-black text-primary">3%</p>
                            <p className="text-[10px] font-black uppercase text-text-secondary">Avg. Marketplace Fee</p>
                        </div>
                        <div className="p-6 bg-gray-50 rounded-3xl text-center">
                            <p className="text-2xl font-black text-primary">100%</p>
                            <p className="text-[10px] font-black uppercase text-text-secondary">Diritto alla Riparazione</p>
                        </div>
                        <div className="p-6 bg-gray-50 rounded-3xl text-center">
                            <p className="text-2xl font-black text-primary">24/7</p>
                            <p className="text-[10px] font-black uppercase text-text-secondary">Supporto AI Expert</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default PianiPage;
