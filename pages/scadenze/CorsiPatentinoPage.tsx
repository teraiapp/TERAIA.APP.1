
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, BookOpen, MapPin, Calendar, 
    Euro, Info, Check, X, RotateCcw, 
    Filter, AlertCircle, Search
} from 'lucide-react';
import { regions, provinces, communes } from '../../data/geo/italyGeoData';

interface Corso {
    id: number;
    ente: string;
    luogo: string;
    comune: string;
    provinciaCode: string;
    regioneCode: string;
    date: string;
    prezzo: number;
    durata: string;
}

const corsiData: Corso[] = [
    { id: 1, ente: 'Confagricoltura Verona', luogo: 'Verona (VR)', comune: 'Verona', provinciaCode: 'VR', regioneCode: 'VEN', date: '10-12 Luglio 2024', prezzo: 150, durata: '20 ore' },
    { id: 2, ente: 'CIA Agricoltori Italiani', luogo: 'Bari (BA)', comune: 'Bari', provinciaCode: 'BA', regioneCode: 'PUG', date: '15-17 Luglio 2024', prezzo: 130, durata: '20 ore' },
    { id: 3, ente: 'Ente Formazione Agri.Bio', luogo: 'Milano (MI)', comune: 'Milano', provinciaCode: 'MI', regioneCode: 'LOM', date: '22-24 Luglio 2024', prezzo: 180, durata: '20 ore' },
    { id: 4, ente: 'Coldiretti Palermo', luogo: 'Palermo (PA)', comune: 'Palermo', provinciaCode: 'PA', regioneCode: 'SIC', date: '05-07 Agosto 2024', prezzo: 140, durata: '20 ore' },
    { id: 5, ente: 'AgriSviluppo Catania', luogo: 'Misterbianco (CT)', comune: 'Misterbianco', provinciaCode: 'CT', regioneCode: 'SIC', date: '12-14 Settembre 2024', prezzo: 125, durata: '20 ore' },
    { id: 6, ente: 'Toscana Formazione', luogo: 'Firenze (FI)', comune: 'Firenze', provinciaCode: 'FI', regioneCode: 'TOS', date: '20-22 Ottobre 2024', prezzo: 160, durata: '20 ore' },
];

const GEO_FILTER_KEY = 'teraia_geo_filters';

const CorsiPatentinoPage: React.FC = () => {
    const navigate = useNavigate();
    
    // Stato Filtri
    const [selectedRegion, setSelectedRegion] = useState('');
    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedComune, setSelectedComune] = useState('');
    
    // Stato UI
    const [isInfoModalOpen, setInfoModalOpen] = useState(false);
    const [selectedCorso, setSelectedCorso] = useState<Corso | null>(null);

    // 1. Carica filtri da localStorage all'avvio
    useEffect(() => {
        const saved = localStorage.getItem(GEO_FILTER_KEY);
        if (saved) {
            const { r, p, c } = JSON.parse(saved);
            setSelectedRegion(r || '');
            setSelectedProvince(p || '');
            setSelectedComune(c || '');
        }
    }, []);

    // 2. Salva filtri quando cambiano
    useEffect(() => {
        localStorage.setItem(GEO_FILTER_KEY, JSON.stringify({ 
            r: selectedRegion, 
            p: selectedProvince, 
            c: selectedComune 
        }));
    }, [selectedRegion, selectedProvince, selectedComune]);

    // Opzioni dinamiche per i dropdown
    const availableProvinces = useMemo(() => 
        selectedRegion ? provinces.filter(p => p.regionCode === selectedRegion) : [], 
    [selectedRegion]);

    const availableCommunes = useMemo(() => 
        selectedProvince ? communes.filter(c => c.provinceCode === selectedProvince) : [], 
    [selectedProvince]);

    // LOGICA DI FILTRAGGIO AUTO-APPLY
    const filteredCorsi = useMemo(() => {
        return corsiData.filter(corso => {
            const matchRegion = !selectedRegion || corso.regioneCode === selectedRegion;
            const matchProvince = !selectedProvince || corso.provinciaCode === selectedProvince;
            const matchComune = !selectedComune || corso.comune === selectedComune;
            return matchRegion && matchProvince && matchComune;
        });
    }, [selectedRegion, selectedProvince, selectedComune]);

    const handleReset = () => {
        setSelectedRegion('');
        setSelectedProvince('');
        setSelectedComune('');
        localStorage.removeItem(GEO_FILTER_KEY);
    };

    const handleRequestInfo = (corso: Corso) => {
        setSelectedCorso(corso);
        setInfoModalOpen(true);
    };
    
    const handleSendInfoRequest = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCorso) return;
        alert(`Richiesta inviata correttamente all'ente ${selectedCorso.ente}. Verrai ricontattato a breve.`);
        setInfoModalOpen(false);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            <div>
                 <button onClick={() => navigate(-1)} className="flex items-center text-sm font-semibold text-text-secondary hover:text-primary mb-4 transition-colors">
                    <ArrowLeft size={16} className="mr-2"/> Torna alla Scadenza
                </button>
                <h1 className="text-3xl font-black text-text-primary flex items-center uppercase tracking-tighter">
                    <BookOpen className="mr-3 text-primary" size={32}/> Corsi Patentino Fitosanitario
                </h1>
            </div>

            {/* BOX FILTRI A CASCATA AUTO-APPLY */}
            <div className="bg-surface rounded-3xl shadow-xl p-8 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Filter size={18} className="text-primary"/>
                        <h2 className="text-lg font-black uppercase tracking-tight">Filtro Località</h2>
                    </div>
                    {(selectedRegion || selectedProvince || selectedComune) && (
                        <button 
                            onClick={handleReset}
                            className="flex items-center gap-2 text-xs font-black text-text-secondary hover:text-primary transition-all uppercase tracking-widest"
                        >
                            <RotateCcw size={14}/> Reset filtri
                        </button>
                    )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* REGIONE */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-text-secondary ml-1 tracking-widest">Regione</label>
                        <select 
                            value={selectedRegion} 
                            onChange={(e) => { 
                                setSelectedRegion(e.target.value); 
                                setSelectedProvince(''); 
                                setSelectedComune(''); 
                            }}
                            className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-primary focus:bg-white transition-all font-bold text-sm appearance-none cursor-pointer"
                        >
                            <option value="">Tutte le Regioni</option>
                            {regions.map(r => <option key={r.code} value={r.code}>{r.name}</option>)}
                        </select>
                    </div>

                    {/* PROVINCIA */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-text-secondary ml-1 tracking-widest">Provincia</label>
                        <select 
                            value={selectedProvince} 
                            disabled={!selectedRegion}
                            onChange={(e) => { 
                                setSelectedProvince(e.target.value); 
                                setSelectedComune(''); 
                            }}
                            className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-primary focus:bg-white transition-all font-bold text-sm appearance-none cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <option value="">{selectedRegion ? 'Seleziona Provincia' : 'Scegli Regione...'}</option>
                            {availableProvinces.map(p => <option key={p.code} value={p.code}>{p.name} ({p.code})</option>)}
                        </select>
                    </div>

                    {/* COMUNE */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-text-secondary ml-1 tracking-widest">Comune</label>
                        <select 
                            value={selectedComune} 
                            disabled={!selectedProvince}
                            onChange={(e) => setSelectedComune(e.target.value)}
                            className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-primary focus:bg-white transition-all font-bold text-sm appearance-none cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <option value="">{selectedProvince ? 'Tutti i Comuni' : 'Scegli Provincia...'}</option>
                            {availableCommunes.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                        </select>
                    </div>
                </div>

                <div className="mt-6 flex items-center gap-2 text-[10px] font-bold text-text-secondary uppercase">
                    <Info size={14} className="text-primary"/>
                    <span>I filtri vengono applicati automaticamente alla selezione.</span>
                </div>
            </div>

            {/* RISULTATI IN TEMPO REALE */}
            <div className="space-y-6">
                <div className="flex justify-between items-center px-1">
                    <h3 className="font-black text-text-secondary uppercase tracking-widest text-xs flex items-center gap-2">
                        Corsi Disponibili <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full">{filteredCorsi.length}</span>
                    </h3>
                </div>

                {filteredCorsi.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {filteredCorsi.map(corso => (
                            <div key={corso.id} className="bg-surface rounded-[32px] shadow-xl p-8 flex flex-col justify-between border border-gray-50 hover:shadow-2xl hover:border-primary/20 transition-all group">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-xl font-black text-primary group-hover:underline leading-tight">{corso.ente}</h3>
                                        <span className="bg-primary/10 text-primary text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-tighter">Corso Certificato</span>
                                    </div>
                                    
                                    <p className="flex items-center text-sm text-text-secondary font-bold mb-6">
                                        <MapPin size={16} className="mr-2 text-primary"/>{corso.luogo}
                                    </p>
                                    
                                    <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-8">
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black uppercase text-text-secondary tracking-widest">Date Sessione</p>
                                            <p className="text-xs font-bold text-text-primary flex items-center gap-1.5"><Calendar size={14} className="text-primary"/> {corso.date}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black uppercase text-text-secondary tracking-widest">Costo Totale</p>
                                            <p className="text-xs font-bold text-text-primary flex items-center gap-1.5"><Euro size={14} className="text-primary"/> {corso.prezzo}€</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button 
                                        onClick={() => handleRequestInfo(corso)} 
                                        className="flex-1 flex items-center justify-center p-4 bg-white border-2 border-gray-100 text-text-primary rounded-2xl font-black hover:bg-gray-50 transition-all text-xs uppercase tracking-widest"
                                    >
                                        Info
                                    </button>
                                    <button 
                                        onClick={() => alert(`Prenotazione avviata per ${corso.ente}. Controlla la tua email.`)} 
                                        className="flex-[2] flex items-center justify-center p-4 bg-primary text-white rounded-2xl font-black shadow-lg hover:bg-primary-dark transition-all text-xs uppercase tracking-widest active:scale-95"
                                    >
                                        <Check size={18} className="mr-2"/> Prenota
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* EMPTY STATE */
                    <div className="bg-white rounded-[40px] p-20 text-center border-2 border-dashed border-gray-200 flex flex-col items-center animate-in zoom-in duration-300">
                        <div className="p-6 bg-orange-50 rounded-full text-orange-500 mb-6">
                            <AlertCircle size={64} />
                        </div>
                        <h3 className="text-2xl font-black text-text-primary uppercase tracking-tighter">Nessun Corso Disponibile</h3>
                        <p className="text-text-secondary mt-3 max-w-sm font-medium">Non ci sono sessioni attive per i filtri geografici selezionati. Prova ad allargare la ricerca alla provincia o regione.</p>
                        <button 
                            onClick={handleReset}
                            className="mt-10 px-8 py-4 bg-primary text-white rounded-2xl font-black shadow-xl hover:scale-105 transition-all flex items-center gap-2 uppercase tracking-widest text-xs"
                        >
                            <RotateCcw size={18}/> Mostra tutti i corsi
                        </button>
                    </div>
                )}
            </div>

             {/* MODALE INFO (Mock) */}
             {isInfoModalOpen && selectedCorso && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-surface rounded-[32px] shadow-2xl p-10 w-full max-w-md animate-in zoom-in duration-200 border-2 border-white">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-black uppercase tracking-tighter">Richiedi Dettagli</h3>
                            <button onClick={() => setInfoModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24}/></button>
                        </div>
                        <form onSubmit={handleSendInfoRequest} className="space-y-5">
                            <div>
                                <label className="text-[10px] font-black uppercase text-text-secondary mb-1 block">Corso Selezionato</label>
                                <p className="font-bold text-primary">{selectedCorso.ente}</p>
                            </div>
                            <input type="text" placeholder="Tuo Nome e Cognome" required className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-primary outline-none font-bold" />
                            <input type="email" placeholder="Indirizzo Email" required className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-primary outline-none font-bold" />
                            <textarea placeholder="Eventuali domande sull'ente o sugli orari..." rows={3} className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-primary outline-none font-bold"></textarea>
                            <button type="submit" className="w-full py-5 bg-primary text-white font-black rounded-2xl hover:bg-primary-dark shadow-xl transition-all uppercase tracking-widest text-xs">
                                Invia Messaggio
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CorsiPatentinoPage;
