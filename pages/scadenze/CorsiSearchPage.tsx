
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, GraduationCap, MapPin, 
    Calendar, CheckCircle, Info, Search,
    LayoutGrid, Filter, RotateCcw
} from 'lucide-react';
import LocationSelector from '../../components/LocationSelector';
import { GeoLocation } from '../../types';

const MOCK_CORSI = [
    { id: 'c1', ente: 'AgriForm Verona', titolo: 'Corso Rinnovo Patentino', data: '2024-05-15', luogo: 'Verona (VR)', prezzo: '120€' },
    { id: 'c2', ente: 'Coldiretti Education', titolo: 'Sicurezza Mezzi Agricoli', data: '2024-06-10', luogo: 'Padova (PD)', prezzo: '80€' },
    { id: 'c3', ente: 'Confagricoltura Formazione', titolo: 'Gestione Fitosanitari 4.0', data: '2024-05-20', luogo: 'Siena (SI)', prezzo: '150€' },
];

const CorsiSearchPage: React.FC = () => {
    const navigate = useNavigate();
    const [location, setLocation] = useState<GeoLocation>({ regionCode: '', provinceCode: '', communeCode: '' });
    const [booked, setBooked] = useState<string[]>([]);

    const handleBook = (id: string, ente: string) => {
        setBooked([...booked, id]);
        // Crea notifica mock
        const notifications = JSON.parse(localStorage.getItem('teraia_notifications_v1') || '[]');
        notifications.push({
            id: `notif-book-${Date.now()}`,
            type: 'operativa',
            severity: 'info',
            title: 'Prenotazione Corso Confermata',
            message: `Ti sei prenotato con successo per il corso presso "${ente}". Riceverai i dettagli via email.`,
            timestamp: new Date().toISOString(),
            status: 'nuova'
        });
        localStorage.setItem('teraia_notifications_v1', JSON.stringify(notifications));
        alert("Prenotazione inviata! Riceverai una conferma dall'ente.");
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <button onClick={() => navigate('/scadenze')} className="flex items-center text-sm font-black text-text-secondary hover:text-primary uppercase tracking-widest transition-colors">
                <ArrowLeft size={16} className="mr-2"/> Torna alle Scadenze
            </button>

            <div className="bg-white rounded-[48px] shadow-2xl p-10 border border-gray-100">
                <h1 className="text-3xl font-black text-text-primary uppercase tracking-tighter flex items-center gap-3 mb-8">
                    <GraduationCap className="text-primary" size={32} /> Ricerca Corsi di Formazione
                </h1>
                
                <div className="space-y-6">
                    <p className="text-sm font-bold text-text-secondary uppercase ml-1">Filtra per Area Geografica</p>
                    <LocationSelector value={location} onChange={setLocation} mode="filter" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {MOCK_CORSI.map(c => (
                    <div key={c.id} className="bg-white rounded-[40px] p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all group">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-4 bg-primary/10 text-primary rounded-2xl group-hover:scale-110 transition-transform">
                                <GraduationCap size={24}/>
                            </div>
                            <span className="text-xl font-black text-text-primary">{c.prezzo}</span>
                        </div>
                        <p className="text-[10px] font-black text-text-secondary uppercase mb-1 tracking-widest">{c.ente}</p>
                        <h3 className="text-xl font-black text-text-primary mb-6 leading-tight uppercase tracking-tighter">{c.titolo}</h3>
                        
                        <div className="space-y-3 mb-10">
                            <div className="flex items-center gap-2 text-xs font-bold text-text-secondary"><Calendar size={14}/> {new Date(c.data).toLocaleDateString()}</div>
                            <div className="flex items-center gap-2 text-xs font-bold text-text-secondary"><MapPin size={14}/> {c.luogo}</div>
                        </div>

                        {booked.includes(c.id) ? (
                            <div className="w-full py-4 bg-green-50 text-green-700 rounded-2xl font-black text-[10px] uppercase text-center flex items-center justify-center gap-2">
                                <CheckCircle size={16}/> Prenotato
                            </div>
                        ) : (
                            <button 
                                onClick={() => handleBook(c.id, c.ente)}
                                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary transition-all shadow-lg"
                            >
                                Prenota Posto
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CorsiSearchPage;
