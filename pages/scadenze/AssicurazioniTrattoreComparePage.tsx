import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Star, Check, X } from 'lucide-react';

const assicurazioniData = [
    { id: 1, compagnia: 'AgriAssicura', premio: '950€/anno', franchigia: '500€', coperture: 'RC, Furto, Incendio', rating: 4.5 },
    { id: 2, compagnia: 'Generali Agricoltura', premio: '1100€/anno', franchigia: '250€', coperture: 'RC, Furto, Incendio, Kasko', rating: 4.8 },
    { id: 3, compagnia: 'UnipolSai Agri', premio: '890€/anno', franchigia: '1000€', coperture: 'RC, Furto', rating: 4.2 },
    { id: 4, compagnia: 'Cattolica Agricoltori', premio: '1050€/anno', franchigia: '500€', coperture: 'RC, Furto, Incendio, Eventi Naturali', rating: 4.6 },
];

const AssicurazioniTrattoreComparePage: React.FC = () => {
    const navigate = useNavigate();
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedCompagnia, setSelectedCompagnia] = useState<any>(null);

    const handleRequestQuote = (compagnia: any) => {
        setSelectedCompagnia(compagnia);
        setModalOpen(true);
    };
    
    const handleSendQuoteRequest = (e: React.FormEvent) => {
        e.preventDefault();
        localStorage.setItem(`quote_request_assicurazione_${selectedCompagnia.id}`, JSON.stringify({ compagnia: selectedCompagnia.compagnia, requestedAt: new Date().toISOString() }));
        alert(`Richiesta preventivo inviata a ${selectedCompagnia.compagnia}!`);
        setModalOpen(false);
    };

    const handleSetFavorite = (compagnia: any) => {
         localStorage.setItem('assicurazione_preferita_trattore', JSON.stringify(compagnia));
         alert(`${compagnia.compagnia} impostata come preferita!`);
    };

    return (
        <div className="space-y-8">
            <div>
                 <button onClick={() => navigate(-1)} className="flex items-center text-sm font-semibold text-text-secondary hover:text-primary mb-4">
                    <ArrowLeft size={16} className="mr-2"/> Torna alla Scadenza
                </button>
                <h1 className="text-3xl font-bold text-text-primary flex items-center"><Shield className="mr-3"/> Comparatore Assicurazioni Trattore</h1>
            </div>

            <div className="bg-surface rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold mb-4">I tuoi dati</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <input type="number" placeholder="Valore trattore (€)" className="p-2 border rounded-md"/>
                    <select className="p-2 border rounded-md bg-white"><option>Uso Privato</option><option>Uso Aziendale</option></select>
                    <input type="text" placeholder="Provincia" className="p-2 border rounded-md"/>
                    <button className="p-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark">Cerca Offerte</button>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-bold">Migliori 4 Risultati</h2>
                {assicurazioniData.map(ass => (
                    <div key={ass.id} className="bg-surface rounded-xl shadow-md p-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                            <div>
                                <h3 className="text-lg font-bold text-primary">{ass.compagnia}</h3>
                                <div className="flex items-center text-yellow-500">
                                    {[...Array(Math.floor(ass.rating))].map((_, i) => <Star key={i} size={16} fill="currentColor"/>)}
                                    <span className="ml-2 text-sm text-text-secondary">{ass.rating}/5</span>
                                </div>
                            </div>
                            <div>
                                <p className="font-bold text-2xl">{ass.premio}</p>
                                <p className="text-sm text-text-secondary">Franchigia: {ass.franchigia}</p>
                            </div>
                            <div className="text-sm">
                                <p className="font-semibold">Coperture principali:</p>
                                <p>{ass.coperture}</p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <button onClick={() => handleRequestQuote(ass)} className="p-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark text-sm">Richiedi Preventivo</button>
                                <button onClick={() => handleSetFavorite(ass)} className="p-2 bg-gray-200 text-text-primary rounded-lg font-semibold hover:bg-gray-300 text-sm">Imposta come preferita</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

             {isModalOpen && selectedCompagnia && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-surface rounded-xl shadow-2xl p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">Richiedi Preventivo a {selectedCompagnia.compagnia}</h3>
                            <button onClick={() => setModalOpen(false)}><X size={24}/></button>
                        </div>
                        <p className="text-sm text-text-secondary mb-4">I tuoi dati saranno inviati per ricevere un preventivo dettagliato.</p>
                        <form onSubmit={handleSendQuoteRequest} className="space-y-4">
                            <input type="text" placeholder="Nome e Cognome" required className="w-full p-2 border rounded-md"/>
                            <input type="email" placeholder="Email" required className="w-full p-2 border rounded-md"/>
                            <button type="submit" className="w-full p-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark">
                                Invia Richiesta
                            </button>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AssicurazioniTrattoreComparePage;
