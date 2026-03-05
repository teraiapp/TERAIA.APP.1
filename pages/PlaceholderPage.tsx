
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, ArrowLeft, Home, Hammer } from 'lucide-react';
import { ROUTE_REGISTRY } from '../constants';

const PlaceholderPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const routeInfo = ROUTE_REGISTRY.find(r => r.path === location.pathname);

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-8 animate-in fade-in zoom-in duration-500">
            <div className="p-8 bg-primary/10 rounded-[48px] text-primary mb-8 border-2 border-primary/20 shadow-xl">
                <Hammer size={80} className="animate-pulse" />
            </div>
            
            <h1 className="text-4xl font-black text-text-primary mb-4 uppercase tracking-tighter">
                Modulo {routeInfo?.label || 'In Sviluppo'}
            </h1>
            
            <p className="text-lg text-text-secondary mb-10 max-w-md mx-auto font-medium leading-relaxed">
                Stiamo ultimando l'integrazione di questa funzionalità. Questa pagina placeholder garantisce la stabilità della navigazione durante il caricamento dei nuovi pacchetti di sistema.
            </p>

            <div className="flex gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center justify-center gap-3 px-8 py-4 bg-white border-2 border-gray-100 text-text-primary rounded-[24px] font-black hover:bg-gray-50 transition-all shadow-md"
                >
                    <ArrowLeft size={20}/> TORNA INDIETRO
                </button>
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center justify-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-[24px] font-black hover:bg-black transition-all shadow-xl"
                >
                    <Home size={20}/> DASHBOARD
                </button>
            </div>

            <div className="mt-20 text-[10px] font-black text-text-secondary/30 uppercase tracking-[0.3em]">
                TeraIA OS • Future Integration Bridge v4.0
            </div>
        </div>
    );
};

export default PlaceholderPage;
