
import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Tractor } from 'lucide-react';

const OrdiniNoleggiPage: React.FC = () => {
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-text-primary">Ordini &amp; Noleggi</h1>
            <p className="text-text-secondary">
                Da questa sezione puoi accedere alla gestione dei tuoi ordini di acquisto e al marketplace per il noleggio di attrezzature.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link to="/ordini" className="bg-surface rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg hover:ring-2 hover:ring-primary/50 transition-all duration-300 h-full flex flex-col items-center justify-center text-center">
                    <ShoppingCart size={48} className="mb-4 text-primary" />
                    <h2 className="text-2xl font-bold mb-2">Vai agli Ordini</h2>
                    <p className="text-text-secondary">Gestisci i tuoi acquisti, richiedi preventivi e traccia le consegne.</p>
                </Link>
                <Link to="/noleggi" className="bg-surface rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg hover:ring-2 hover:ring-primary/50 transition-all duration-300 h-full flex flex-col items-center justify-center text-center">
                    <Tractor size={48} className="mb-4 text-secondary" />
                    <h2 className="text-2xl font-bold mb-2">Vai ai Noleggi</h2>
                    <p className="text-text-secondary">Sfoglia il marketplace, noleggia attrezzature e gestisci le tue prenotazioni.</p>
                </Link>
            </div>
        </div>
    );
};

export default OrdiniNoleggiPage;
