
import React from 'react';
import { ShieldX, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AccessDeniedPage: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-6 p-8">
            <div className="bg-red-100 p-6 rounded-full text-red-600 animate-pulse">
                <ShieldX size={80} />
            </div>
            <h1 className="text-4xl font-black text-text-primary">ACCESSO NON CONSENTITO</h1>
            <p className="text-text-secondary max-w-md mx-auto">
                Non disponi delle autorizzazioni necessarie per visualizzare questo modulo. 
                Se ritieni sia un errore, contatta l'amministratore dell'azienda.
            </p>
            <button 
                onClick={() => navigate('/')}
                className="flex items-center gap-2 bg-text-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition-all"
            >
                <ArrowLeft size={20}/> Torna alla Home Sicura
            </button>
        </div>
    );
};

export default AccessDeniedPage;
