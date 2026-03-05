
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Store, Users, LayoutGrid, Search, Filter, 
    PlusCircle, MessageSquare, Star, MapPin, 
    Info, ExternalLink, ShieldCheck, Tag, 
    ArrowRight, UserCheck, Briefcase, Trash2, X,
    Heart, ShoppingCart, Calendar, AlertCircle,
    // Added Edit to the imports
    CheckCircle, Clock, Zap, Phone, Mail, ChevronRight, Edit
} from 'lucide-react';
import { useAppContext } from '../../hooks/useAppContext';
import { 
    MarketAd, Professional, ConsultationRequest,
    INITIAL_MARKET_ADS, INITIAL_PROS_V3,
    AdCategory, ProRole, UrgencyLevel, AdStatus
} from '../../data/marketplaceV3Data';
import { regions } from '../../data/geo/italyGeoData';
import { createMarketNotification } from '../../utils/marketplaceBridge';

const STORAGE_ADS = 'teraia_market_ads_v1';
const STORAGE_PROS = 'teraia_pros_v1';
const STORAGE_REQS = 'teraia_consult_requests_v1';
const STORAGE_FAVS = 'teraia_market_favorites_v1';

const MarketplaceHubPage: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser } = useAppContext();
    const [activeTab, setActiveTab] = useState<'p2p' | 'pros' | 'my_ads' | 'my_reqs'>('p2p');

    // --- STATE DATA ---
    const [ads, setAds] = useState<MarketAd[]>(() => {
        const saved = localStorage.getItem(STORAGE_ADS);
        return saved ? JSON.parse(saved) : INITIAL_MARKET_ADS;
    });
    const [pros] = useState<Professional[]>(() => {
        const saved = localStorage.getItem(STORAGE_PROS);
        return saved ? JSON.parse(saved) : INITIAL_PROS_V3;
    });
    const [myRequests, setMyRequests] = useState<ConsultationRequest[]>(() => {
        const saved = localStorage.getItem(STORAGE_REQS);
        return saved ? JSON.parse(saved) : [];
    });
    const [favorites, setFavorites] = useState<string[]>(() => JSON.parse(localStorage.getItem(STORAGE_FAVS) || '[]'));

    // --- FILTERS STATE ---
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCat, setFilterCat] = useState<string>('Tutte');
    const [filterRegion, setFilterRegion] = useState('');
    const [filterProRole, setFilterProRole] = useState<string>('Tutti');

    // --- MODALS ---
    const [modal, setModal] = useState<{ type: 'new_ad' | 'request_consult' | 'contact_vendor', data?: any } | null>(null);

    // Persistence
    useEffect(() => { localStorage.setItem(STORAGE_ADS, JSON.stringify(ads)); }, [ads]);
    useEffect(() => { localStorage.setItem(STORAGE_REQS, JSON.stringify(myRequests)); }, [myRequests]);
    useEffect(() => { localStorage.setItem(STORAGE_FAVS, JSON.stringify(favorites)); }, [favorites]);

    // --- COMPUTED ---
    const filteredAds = useMemo(() => {
        return ads.filter(a => {
            const mSearch = !searchTerm || a.title.toLowerCase().includes(searchTerm.toLowerCase());
            const mCat = filterCat === 'Tutte' || a.category === filterCat;
            const mReg = !filterRegion || a.region === filterRegion;
            return mSearch && mCat && mReg && a.ownerId !== 'me';
        });
    }, [ads, searchTerm, filterCat, filterRegion]);

    const filteredPros = useMemo(() => {
        return pros.filter(p => {
            const mRole = filterProRole === 'Tutti' || p.role === filterProRole;
            const mReg = !filterRegion || p.region === filterRegion;
            return mRole && mReg;
        });
    }, [pros, filterProRole, filterRegion]);

    const userAds = useMemo(() => ads.filter(a => a.ownerId === 'me'), [ads]);

    // --- HANDLERS ---
    const handleToggleFavorite = (id: string) => {
        if (favorites.includes(id)) setFavorites(favorites.filter(f => f !== id));
        else setFavorites([...favorites, id]);
    };

    const handleCreateAd = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const newAd: MarketAd = {
            id: `ad-${Date.now()}`,
            ownerId: 'me',
            ownerName: currentUser?.name || 'Utente',
            title: f.get('title') as string,
            category: f.get('category') as AdCategory,
            price: Number(f.get('price')),
            region: f.get('region') as string,
            province: f.get('province') as string,
            city: f.get('city') as string,
            description: f.get('description') as string,
            status: 'attivo',
            images: ['📦'],
            isNew: true,
            createdAt: new Date().toISOString()
        };
        setAds([newAd, ...ads]);
        setModal(null);
        setActiveTab('my_ads');
        alert("Annuncio pubblicato!");
    };

    const handleRequestConsultation = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const pro = modal?.data as Professional;
        const newReq: ConsultationRequest = {
            id: `req-c-${Date.now()}`,
            userId: 'me',
            proId: pro.id,
            proName: pro.name,
            proRole: pro.role,
            reason: f.get('reason') as string,
            relatedModule: f.get('module') as string,
            urgency: f.get('urgency') as UrgencyLevel,
            preference: f.get('preference') as 'online' | 'presenza',
            status: 'INVIATA',
            date: new Date().toISOString()
        };
        setMyRequests([newReq, ...myRequests]);
        createMarketNotification("Richiesta Inviata", `La tua richiesta di consulenza è stata inviata a ${pro.name}.`);
        setModal(null);
        setActiveTab('my_reqs');
    };

    const handleCancelRequest = (id: string) => {
        if(confirm("Annullare questa richiesta?")) {
            setMyRequests(myRequests.filter(r => r.id !== id));
        }
    };

    const handleDeleteAd = (id: string) => {
        if(confirm("Eliminare definitivamente questo annuncio?")) {
            setAds(ads.filter(a => a.id !== id));
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-text-primary flex items-center gap-3 uppercase tracking-tighter">
                        <Store className="text-primary" size={36} /> Marketplace TeraIA
                    </h1>
                    <p className="text-text-secondary text-sm font-medium">Bacheca P2P e Rete Professionisti certificati.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setModal({ type: 'new_ad' })} className="flex items-center gap-2 px-6 py-3 bg-secondary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all">
                        <PlusCircle size={18}/> Crea Inserzione
                    </button>
                </div>
            </div>

            {/* TABS */}
            <div className="flex p-1 bg-gray-100 rounded-[24px] w-fit shadow-inner">
                {[
                    { id: 'p2p', label: 'Compra/Vendi', icon: ShoppingCart },
                    { id: 'pros', label: 'Professionisti', icon: Briefcase },
                    { id: 'my_ads', label: 'Le mie Inserzioni', icon: LayoutGrid },
                    { id: 'my_reqs', label: 'Le mie Richieste', icon: Clock }
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-[20px] font-black text-xs uppercase tracking-widest transition-all ${
                            activeTab === tab.id ? 'bg-white text-primary shadow-md' : 'text-text-secondary hover:text-text-primary'
                        }`}
                    >
                        <tab.icon size={16}/> {tab.label}
                    </button>
                ))}
            </div>

            {/* CONTENT */}
            <div className="space-y-8">
                
                {/* TAB P2P */}
                {activeTab === 'p2p' && (
                    <div className="space-y-8">
                        {/* FILTERS */}
                        <div className="bg-white p-6 rounded-[32px] shadow-xl border border-gray-50 flex flex-wrap gap-4">
                            <div className="flex-1 min-w-[200px] relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18}/>
                                <input 
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl font-bold text-sm outline-none"
                                    placeholder="Cerca prodotti..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="w-full md:w-48">
                                <select 
                                    className="w-full p-3 bg-gray-50 border-none rounded-xl font-bold text-sm outline-none"
                                    value={filterCat}
                                    onChange={e => setFilterCat(e.target.value)}
                                >
                                    <option>Tutte</option>
                                    {['Prodotti agricoli', 'Animali', 'Attrezzature', 'Servizi', 'Sensori/IoT'].map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="w-full md:w-48">
                                <select 
                                    className="w-full p-3 bg-gray-50 border-none rounded-xl font-bold text-sm outline-none"
                                    value={filterRegion}
                                    onChange={e => setFilterRegion(e.target.value)}
                                >
                                    <option value="">Tutta Italia</option>
                                    {regions.map(r => <option key={r.code} value={r.name}>{r.name}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {filteredAds.map(ad => (
                                <div key={ad.id} className="bg-white rounded-[32px] p-6 shadow-lg border border-gray-100 hover:shadow-2xl transition-all group relative">
                                    {ad.isNew && <span className="absolute top-4 left-4 bg-primary text-white text-[8px] font-black px-2 py-1 rounded-full uppercase z-10">Nuovo</span>}
                                    <div className="h-40 bg-gray-50 rounded-2xl flex items-center justify-center text-5xl mb-4 group-hover:scale-105 transition-transform">
                                        {ad.images[0]}
                                    </div>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[9px] font-black text-text-secondary uppercase">{ad.category}</span>
                                        <button onClick={() => handleToggleFavorite(ad.id)} className={`p-1.5 rounded-full transition-colors ${favorites.includes(ad.id) ? 'text-red-500 bg-red-50' : 'text-gray-300 hover:bg-gray-100'}`}>
                                            <Heart size={16} fill={favorites.includes(ad.id) ? "currentColor" : "none"}/>
                                        </button>
                                    </div>
                                    <h3 className="font-black text-lg text-text-primary uppercase leading-tight mb-2 truncate">{ad.title}</h3>
                                    <p className="text-xl font-black text-primary mb-4">€ {ad.price.toLocaleString()}</p>
                                    <p className="text-[10px] text-text-secondary flex items-center gap-1 mb-6 font-bold uppercase"><MapPin size={12}/> {ad.city} ({ad.province})</p>
                                    
                                    <div className="flex gap-2">
                                        <button onClick={() => navigate(`/marketplace/annunci/${ad.id}`)} className="flex-1 py-3 bg-gray-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-black">Dettagli</button>
                                        <button onClick={() => setModal({ type: 'contact_vendor', data: ad })} className="p-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all"><MessageSquare size={16}/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {filteredAds.length === 0 && (
                            <div className="py-20 text-center bg-white rounded-[48px] border-2 border-dashed border-gray-200">
                                <Search size={48} className="mx-auto text-gray-200 mb-4"/>
                                <p className="text-text-secondary font-black uppercase text-xs">Nessun annuncio trovato per questi filtri.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB PROS */}
                {activeTab === 'pros' && (
                    <div className="space-y-8">
                        {/* FILTERS PROS */}
                        <div className="bg-white p-6 rounded-[32px] shadow-xl border border-gray-50 flex flex-wrap gap-4">
                            <div className="flex-1">
                                <label className="text-[10px] font-black uppercase text-text-secondary mb-1 block ml-1">Cerca Professionista</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18}/>
                                    <input className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl font-bold text-sm outline-none" placeholder="Nome o specializzazione..."/>
                                </div>
                            </div>
                            <div className="w-full md:w-48">
                                <label className="text-[10px] font-black uppercase text-text-secondary mb-1 block ml-1">Specializzazione</label>
                                <select className="w-full p-3 bg-gray-50 border-none rounded-xl font-bold text-sm outline-none" value={filterProRole} onChange={e => setFilterProRole(e.target.value)}>
                                    <option>Tutti</option>
                                    {['Agronomo', 'Veterinario', 'Commercialista', 'Tecnico impianti'].map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* LIST PROS */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {filteredPros.map(pro => (
                                <div key={pro.id} className="bg-white rounded-[40px] p-8 shadow-xl border border-gray-100 flex flex-col md:flex-row gap-8 items-center group transition-all hover:border-primary/30">
                                    <div className="w-32 h-32 bg-gray-50 rounded-[40px] flex items-center justify-center text-6xl group-hover:scale-105 transition-transform">
                                        {pro.image}
                                    </div>
                                    <div className="flex-1 text-center md:text-left">
                                        <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-2">
                                            <span className="px-3 py-1 bg-primary text-white rounded-full text-[9px] font-black uppercase tracking-tighter">{pro.role}</span>
                                            <span className="px-3 py-1 bg-gray-100 text-text-secondary rounded-full text-[9px] font-black uppercase tracking-tighter flex items-center gap-1"><Star size={10} className="fill-yellow-500 text-yellow-500"/> {pro.rating}</span>
                                        </div>
                                        <h3 className="text-2xl font-black text-text-primary uppercase tracking-tighter mb-2">{pro.name}</h3>
                                        <p className="text-xs text-text-secondary font-bold mb-6 flex items-center justify-center md:justify-start gap-1 uppercase tracking-widest"><MapPin size={12}/> {pro.areaServed}</p>
                                        
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <button onClick={() => navigate(`/marketplace/professionisti/${pro.id}`)} className="flex-1 py-3 bg-gray-100 text-text-primary rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all">Profilo</button>
                                            <button onClick={() => setModal({ type: 'request_consult', data: pro })} className="flex-1 py-3 bg-primary text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg hover:bg-primary-dark transition-all">Richiedi Aiuto</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* TAB MY ADS */}
                {activeTab === 'my_ads' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <button onClick={() => setModal({ type: 'new_ad' })} className="bg-gray-50 border-4 border-dashed border-gray-200 rounded-[40px] p-10 flex flex-col items-center justify-center gap-4 text-gray-400 hover:text-primary hover:border-primary/30 transition-all group h-full min-h-[300px]">
                            <PlusCircle size={48} className="group-hover:scale-110 transition-transform"/>
                            <span className="font-black uppercase tracking-widest text-xs">Crea Nuova Inserzione</span>
                        </button>
                        {userAds.map(ad => (
                            <div key={ad.id} className="bg-white rounded-[40px] p-8 shadow-xl border border-gray-100 flex flex-col justify-between group">
                                <div>
                                    <div className="flex justify-between items-start mb-6">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                            ad.status === 'attivo' ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'
                                        }`}>
                                            {ad.status}
                                        </span>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 hover:bg-gray-100 rounded-lg"><Edit size={16}/></button>
                                            <button onClick={() => handleDeleteAd(ad.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                                        </div>
                                    </div>
                                    <h4 className="text-xl font-black text-text-primary uppercase tracking-tighter mb-2">{ad.title}</h4>
                                    <p className="text-lg font-black text-primary mb-4">€ {ad.price}</p>
                                </div>
                                <button onClick={() => navigate(`/marketplace/annunci/${ad.id}`)} className="w-full py-4 bg-gray-50 text-text-primary rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-100">Gestisci</button>
                            </div>
                        ))}
                    </div>
                )}

                {/* TAB MY REQS */}
                {activeTab === 'my_reqs' && (
                    <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 border-b text-text-secondary uppercase text-[10px] font-black tracking-wider">
                                    <tr>
                                        <th className="p-6">Professionista</th>
                                        <th className="p-6">Motivo</th>
                                        <th className="p-6">Data</th>
                                        <th className="p-6">Stato</th>
                                        <th className="p-6 text-center">Azioni</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {myRequests.length > 0 ? myRequests.map(req => (
                                        <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-6">
                                                <p className="font-black text-text-primary uppercase text-xs">{req.proName}</p>
                                                <p className="text-[10px] font-bold text-text-secondary uppercase">{req.proRole}</p>
                                            </td>
                                            <td className="p-6 max-w-xs">
                                                <p className="font-bold text-xs truncate">{req.reason}</p>
                                                <span className={`text-[9px] font-black uppercase ${
                                                    req.urgency === 'alta' ? 'text-red-500' : 'text-text-secondary'
                                                }`}>Priorità {req.urgency}</span>
                                            </td>
                                            <td className="p-6 text-xs font-bold text-text-secondary">
                                                {new Date(req.date).toLocaleDateString()}
                                            </td>
                                            <td className="p-6">
                                                <span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${
                                                    req.status === 'IN CORSO' ? 'bg-blue-100 text-blue-700 animate-pulse' :
                                                    req.status === 'ACCETTATA' ? 'bg-green-100 text-green-700' :
                                                    'bg-gray-100 text-gray-500'
                                                }`}>
                                                    {req.status}
                                                </span>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex justify-center gap-2">
                                                    {req.relatedModule && (
                                                        <button 
                                                            onClick={() => navigate(req.relatedModule)}
                                                            className="flex items-center gap-1 px-3 py-1.5 bg-gray-900 text-white rounded-lg font-black text-[9px] uppercase tracking-widest shadow-md"
                                                        >
                                                            Apri Modulo <ChevronRight size={10}/>
                                                        </button>
                                                    )}
                                                    {req.status === 'INVIATA' && (
                                                        <button onClick={() => handleCancelRequest(req.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Annulla"><X size={16}/></button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={5} className="p-20 text-center text-text-secondary italic">Non hai ancora richiesto consulenze professionali.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* MODALS */}
            {modal?.type === 'new_ad' && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[40px] shadow-2xl p-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto border-2 border-white">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black uppercase tracking-tighter">Crea Inserzione P2P</h2>
                            <button onClick={() => setModal(null)} className="p-2 hover:bg-gray-100 rounded-full"><X/></button>
                        </div>
                        <form onSubmit={handleCreateAd} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Titolo Inserzione*</label>
                                    <input name="title" required className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold" placeholder="Es. Vitelli Limousine..."/>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Categoria*</label>
                                    <select name="category" required className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold">
                                        {['Prodotti agricoli', 'Animali', 'Attrezzature', 'Servizi', 'Sensori/IoT'].map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Prezzo richiesto (€)*</label>
                                    <input name="price" type="number" required className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold" placeholder="0.00"/>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Regione*</label>
                                    <select name="region" required className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold">
                                        {regions.map(r => <option key={r.code} value={r.name}>{r.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Località (Provincia e Comune)</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <input name="province" placeholder="Provincia (es. BA)" className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold"/>
                                    <input name="city" placeholder="Comune" className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold"/>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Descrizione Dettagliata</label>
                                <textarea name="description" required rows={3} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold text-sm" placeholder="Specifica stato, quantità, orari..."/>
                            </div>
                            <button type="submit" className="w-full py-5 bg-secondary text-white rounded-[24px] font-black shadow-xl uppercase tracking-widest text-xs">Pubblica Ora</button>
                        </form>
                    </div>
                </div>
            )}

            {modal?.type === 'request_consult' && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[40px] shadow-2xl p-10 w-full max-w-xl border-2 border-white animate-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black uppercase tracking-tighter">Richiedi Consulenza</h2>
                            <button onClick={() => setModal(null)} className="p-2 hover:bg-gray-100 rounded-full"><X/></button>
                        </div>
                        <div className="mb-8 p-4 bg-primary/5 rounded-[32px] border border-primary/10 flex items-center gap-4">
                            <span className="text-3xl">{modal.data.image}</span>
                            <div>
                                <p className="font-black text-text-primary uppercase text-xs">{modal.data.name}</p>
                                <p className="text-[10px] font-bold text-primary uppercase">{modal.data.role}</p>
                            </div>
                        </div>
                        <form onSubmit={handleRequestConsultation} className="space-y-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Motivo della richiesta*</label>
                                <textarea name="reason" required rows={2} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold text-sm" placeholder="Spiega brevemente il problema..."/>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Modulo Correlato</label>
                                    <select name="module" className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold text-sm">
                                        <option value="/quaderno-campagna">Quaderno Campagna</option>
                                        <option value="/produzione">Produzione</option>
                                        <option value="/allevamento">Allevamento</option>
                                        <option value="/economia">Bilancio/Economia</option>
                                        <option value="/ai/trattamenti">AI Trattamenti</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Urgenza</label>
                                    <select name="urgency" className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold text-sm">
                                        <option value="bassa">Bassa (Nessuna fretta)</option>
                                        <option value="media">Media (Entro 48h)</option>
                                        <option value="alta">Alta (Urgente!)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Modalità Preferita</label>
                                <div className="flex gap-4">
                                    <label className="flex-1 p-3 bg-gray-50 rounded-xl border-2 border-transparent cursor-pointer has-[:checked]:border-primary flex items-center justify-center gap-2">
                                        <input type="radio" name="preference" value="online" defaultChecked className="hidden"/>
                                        <span className="text-xs font-black uppercase">Online</span>
                                    </label>
                                    <label className="flex-1 p-3 bg-gray-50 rounded-xl border-2 border-transparent cursor-pointer has-[:checked]:border-primary flex items-center justify-center gap-2">
                                        <input type="radio" name="preference" value="presenza" className="hidden"/>
                                        <span className="text-xs font-black uppercase">In Presenza</span>
                                    </label>
                                </div>
                            </div>
                            <button type="submit" className="w-full py-5 bg-primary text-white rounded-[24px] font-black shadow-xl uppercase tracking-widest text-xs">Invia Richiesta</button>
                        </form>
                    </div>
                </div>
            )}

            {modal?.type === 'contact_vendor' && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[40px] shadow-2xl p-10 w-full max-w-md border-2 border-white animate-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black uppercase tracking-tighter">Contatta Venditore</h2>
                            <button onClick={() => setModal(null)} className="p-2 hover:bg-gray-100 rounded-full"><X/></button>
                        </div>
                        <div className="space-y-6">
                            <div className="p-4 bg-gray-50 rounded-2xl">
                                <p className="text-[10px] font-black text-text-secondary uppercase">Inserzione</p>
                                <p className="font-black text-text-primary">{modal.data.title}</p>
                                <p className="text-xs font-bold text-primary">Venduto da: {modal.data.ownerName}</p>
                            </div>
                            <div className="space-y-2">
                                <button className="w-full py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                                    <MessageSquare size={16}/> Avvia Chat TeraIA
                                </button>
                                <button className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                                    <Phone size={16}/> Mostra Numero
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MarketplaceHubPage;
