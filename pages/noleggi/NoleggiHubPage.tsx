
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Tractor, Search, PlusCircle, Calendar, MapPin, 
    Filter, ShieldCheck, CheckCircle, Clock, Trash2, 
    Edit, ArrowRight, LayoutGrid, Zap, ChevronRight, 
    X, Info, CreditCard, Inbox, History, Tag, 
    TrendingUp, AlertTriangle, Check
} from 'lucide-react';
import { useAppContext } from '../../hooks/useAppContext';
import { 
    RentListing, RentRequest, INITIAL_RENT_LISTINGS, 
    RentalCategory, RentalStatus, DeliveryMode 
} from '../../data/noleggioDataV2';
import { syncRentalToEconomy, createRentalNotification } from '../../utils/rentalBridge';
import { regions } from '../../data/geo/italyGeoData';

const STORAGE_LISTINGS = 'teraia_rent_listings_v1';
const STORAGE_REQUESTS = 'teraia_rent_requests_v1';

const NoleggiHubPage: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser } = useAppContext();
    const [activeTab, setActiveTab] = useState<'search' | 'requests' | 'my_ads'>('search');

    // --- STATO DATI ---
    const [listings, setListings] = useState<RentListing[]>(() => {
        const saved = localStorage.getItem(STORAGE_LISTINGS);
        return saved ? JSON.parse(saved) : INITIAL_RENT_LISTINGS;
    });

    const [requests, setRequests] = useState<RentRequest[]>(() => {
        const saved = localStorage.getItem(STORAGE_REQUESTS);
        return saved ? JSON.parse(saved) : [];
    });

    // --- STATO FILTRI ---
    const [filterCat, setFilterCat] = useState<string>('Tutte');
    const [filterRegion, setFilterRegion] = useState<string>('');
    const [maxPrice, setMaxPrice] = useState<number>(1000);
    const [sort, setSort] = useState<'recent' | 'price_asc'>('recent');

    // --- MODALI ---
    const [modal, setModal] = useState<{ type: 'new_ad' | 'request', data?: any } | null>(null);

    // Persistenza
    useEffect(() => { localStorage.setItem(STORAGE_LISTINGS, JSON.stringify(listings)); }, [listings]);
    useEffect(() => { localStorage.setItem(STORAGE_REQUESTS, JSON.stringify(requests)); }, [requests]);

    // --- COMPUTED ---
    const filteredListings = useMemo(() => {
        let result = listings.filter(l => l.ownerId !== 'me'); // Non mostrare i propri annunci nella ricerca
        if (filterCat !== 'Tutte') result = result.filter(l => l.category === filterCat);
        if (filterRegion) result = result.filter(l => l.region === filterRegion);
        result = result.filter(l => l.pricePerDay <= maxPrice);

        if (sort === 'price_asc') result.sort((a,b) => a.pricePerDay - b.pricePerDay);
        else result.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        return result;
    }, [listings, filterCat, filterRegion, maxPrice, sort]);

    const myRequests = useMemo(() => requests.filter(r => r.renterId === 'me'), [requests]);
    const myAds = useMemo(() => listings.filter(l => l.ownerId === 'me'), [listings]);
    
    // Richieste ricevute per i miei annunci
    const incomingRequests = useMemo(() => {
        const myIds = myAds.map(a => a.id);
        return requests.filter(r => myIds.includes(r.listingId));
    }, [requests, myAds]);

    // --- HANDLERS ---
    const handleAddListing = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const newAd: RentListing = {
            id: `list-${Date.now()}`,
            ownerId: 'me',
            ownerName: currentUser?.name || 'Utente',
            title: f.get('title') as string,
            category: f.get('category') as RentalCategory,
            description: f.get('description') as string,
            pricePerDay: Number(f.get('price')),
            hasDeposit: f.get('hasDeposit') === 'on',
            depositAmount: Number(f.get('depositAmount') || 0),
            region: f.get('region') as string,
            province: f.get('province') as string,
            city: f.get('city') as string,
            deliveryMode: f.get('deliveryMode') as DeliveryMode,
            images: ['🚜'],
            createdAt: new Date().toISOString()
        };
        setListings([newAd, ...listings]);
        setModal(null);
        setActiveTab('my_ads');
    };

    const handleCreateRequest = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const listing = modal?.data as RentListing;
        
        const start = new Date(f.get('start') as string);
        const end = new Date(f.get('end') as string);
        const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)));
        const total = (days * listing.pricePerDay) + (listing.hasDeposit ? listing.depositAmount : 0);

        const newReq: RentRequest = {
            id: `req-${Date.now()}`,
            listingId: listing.id,
            listingTitle: listing.title,
            renterId: 'me',
            renterName: currentUser?.name || 'Utente',
            ownerId: listing.ownerId,
            startDate: f.get('start') as string,
            endDate: f.get('end') as string,
            status: 'IN ATTESA',
            totalPrice: total,
            deliveryChoice: f.get('delivery') as any,
            notes: f.get('notes') as string,
            timestamp: new Date().toISOString()
        };

        setRequests([newReq, ...requests]);
        createRentalNotification("Nuova Richiesta Noleggio", `Hai inviato una richiesta per: ${listing.title}`);
        setModal(null);
        setActiveTab('requests');
        alert("Richiesta inviata con successo!");
    };

    const updateRequestStatus = (reqId: string, newStatus: RentalStatus) => {
        const updated = requests.map(r => {
            if (r.id === reqId) {
                const updatedReq = { ...r, status: newStatus };
                if (newStatus === 'CHIUSO') {
                    syncRentalToEconomy(updatedReq, currentUser?.role || '');
                    createRentalNotification("Noleggio Completato", `Il noleggio per ${r.listingTitle} è stato chiuso. Transazione registrata in Economia.`);
                }
                return updatedReq;
            }
            return r;
        });
        setRequests(updated);
    };

    const handleDeleteAd = (id: string) => {
        if(confirm("Eliminare definitivamente questo annuncio?")) {
            setListings(listings.filter(l => l.id !== id));
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-text-primary flex items-center gap-3 uppercase tracking-tighter">
                        <Tractor className="text-primary" size={36} /> Noleggio P2P
                    </h1>
                    <p className="text-text-secondary text-sm font-medium">Condivisione attrezzature e ottimizzazione costi tra aziende.</p>
                </div>
                <button 
                    onClick={() => setModal({ type: 'new_ad' })}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all"
                >
                    <PlusCircle size={18}/> Crea Annuncio
                </button>
            </div>

            {/* TABS */}
            <div className="flex p-1 bg-gray-100 rounded-[24px] w-fit shadow-inner">
                {[
                    { id: 'search', label: 'Cerca Mezzi', icon: Search },
                    { id: 'requests', label: 'Le mie Richieste', icon: Inbox },
                    { id: 'my_ads', label: 'I miei Annunci', icon: LayoutGrid }
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-[20px] font-black text-xs uppercase tracking-widest transition-all ${
                            activeTab === tab.id ? 'bg-white text-primary shadow-md' : 'text-text-secondary hover:text-text-primary'
                        }`}
                    >
                        <tab.icon size={16}/> {tab.label}
                        {tab.id === 'requests' && myRequests.filter(r=>r.status==='ACCETTATO').length > 0 && (
                            <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse ml-1"></span>
                        )}
                    </button>
                ))}
            </div>

            {/* TAB CONTENT: SEARCH */}
            {activeTab === 'search' && (
                <div className="space-y-8">
                    {/* FILTERS BAR */}
                    <div className="bg-white p-6 rounded-[32px] shadow-xl border border-gray-50 flex flex-wrap gap-6">
                        <div className="flex-1 min-w-[200px]">
                            <label className="text-[10px] font-black uppercase text-text-secondary mb-1 block ml-1">Categoria</label>
                            <select 
                                className="w-full p-3 bg-gray-50 border-none rounded-xl font-bold text-sm outline-none"
                                value={filterCat} onChange={e => setFilterCat(e.target.value)}
                            >
                                <option>Tutte</option>
                                {['trattore', 'trincia', 'atomizzatore', 'drone', 'sensori', 'pompe', 'generatori', 'altro'].map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                            </select>
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <label className="text-[10px] font-black uppercase text-text-secondary mb-1 block ml-1">Regione</label>
                            <select 
                                className="w-full p-3 bg-gray-50 border-none rounded-xl font-bold text-sm outline-none"
                                value={filterRegion} onChange={e => setFilterRegion(e.target.value)}
                            >
                                <option value="">Tutta Italia</option>
                                {regions.map(r => <option key={r.code} value={r.name}>{r.name}</option>)}
                            </select>
                        </div>
                        <div className="flex-1 min-w-[150px]">
                            <label className="text-[10px] font-black uppercase text-text-secondary mb-1 block ml-1">Prezzo Max (€/gg)</label>
                            <input 
                                type="range" min="10" max="1000" step="10" 
                                className="w-full accent-primary"
                                value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))}
                            />
                            <p className="text-right text-xs font-black text-primary mt-1">€ {maxPrice}</p>
                        </div>
                    </div>

                    {/* LISTA GRID */}
                    {filteredListings.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredListings.map(listing => (
                                <div key={listing.id} className="bg-white rounded-[40px] overflow-hidden shadow-xl border border-gray-100 group hover:shadow-2xl transition-all">
                                    <div className="h-48 bg-gray-50 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform">
                                        {listing.images[0]}
                                    </div>
                                    <div className="p-8">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="px-3 py-1 bg-gray-100 text-text-secondary rounded-full text-[10px] font-black uppercase tracking-widest">{listing.category}</span>
                                            <p className="text-2xl font-black text-primary">€{listing.pricePerDay}<span className="text-[10px] text-text-secondary">/GG</span></p>
                                        </div>
                                        <h3 className="text-xl font-black text-text-primary mb-2 uppercase tracking-tighter">{listing.title}</h3>
                                        <p className="text-xs text-text-secondary font-bold mb-6 flex items-center gap-1"><MapPin size={12}/> {listing.city} ({listing.province})</p>
                                        
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => navigate(`/noleggi/${listing.id}`)}
                                                className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black"
                                            >
                                                Dettagli
                                            </button>
                                            <button 
                                                onClick={() => setModal({ type: 'request', data: listing })}
                                                className="flex-1 py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-primary-dark"
                                            >
                                                Prenota
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center bg-white rounded-[48px] border-2 border-dashed border-gray-200">
                            <Zap size={48} className="mx-auto text-gray-200 mb-4"/>
                            <p className="text-text-secondary font-black uppercase text-xs">Nessun mezzo trovato per questi filtri.</p>
                        </div>
                    )}
                </div>
            )}

            {/* TAB CONTENT: REQUESTS */}
            {activeTab === 'requests' && (
                <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden">
                    <div className="p-8 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                            <History size={20} className="text-primary"/> Le mie Prenotazioni
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b text-text-secondary uppercase text-[10px] font-black">
                                <tr>
                                    <th className="p-6">Mezzo</th>
                                    <th className="p-6">Date</th>
                                    <th className="p-6">Importo Totale</th>
                                    <th className="p-6">Stato</th>
                                    <th className="p-6 text-center">Azioni</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {myRequests.length > 0 ? myRequests.map(req => (
                                    <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-6 font-black uppercase text-xs">{req.listingTitle}</td>
                                        <td className="p-6 font-bold text-text-secondary">{req.startDate} / {req.endDate}</td>
                                        <td className="p-6 font-black text-primary">€ {req.totalPrice.toFixed(2)}</td>
                                        <td className="p-6">
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                                req.status === 'IN ATTESA' ? 'bg-blue-100 text-blue-700' :
                                                req.status === 'ACCETTATO' ? 'bg-orange-100 text-orange-700' :
                                                req.status === 'IN CORSO' ? 'bg-green-100 text-green-700 animate-pulse' :
                                                req.status === 'CHIUSO' ? 'bg-gray-100 text-gray-400' : 'bg-red-100 text-red-700'
                                            }`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="p-6 text-center">
                                            <div className="flex justify-center gap-2">
                                                {req.status === 'IN ATTESA' && (
                                                    <button onClick={() => updateRequestStatus(req.id, 'RIFIUTATO')} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><X size={16}/></button>
                                                )}
                                                {req.status === 'IN CORSO' && (
                                                    <button onClick={() => updateRequestStatus(req.id, 'CHIUSO')} className="px-4 py-2 bg-primary text-white rounded-xl font-black text-[10px] uppercase shadow-md">Restituito</button>
                                                )}
                                                {req.status === 'CHIUSO' && <CheckCircle size={18} className="text-green-500"/>}
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={5} className="p-20 text-center text-text-secondary italic">Non hai ancora richiesto noleggi.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB CONTENT: MY ADS */}
            {activeTab === 'my_ads' && (
                <div className="space-y-12">
                    {/* INCOMING REQUESTS (OWNER VIEW) */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-black uppercase tracking-tight px-1 flex items-center gap-2">
                            <TrendingUp size={24} className="text-primary"/> Richieste Ricevute
                        </h2>
                        {incomingRequests.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4">
                                {incomingRequests.map(req => (
                                    <div key={req.id} className="bg-white p-6 rounded-[32px] shadow-xl border-l-8 border-primary flex flex-col md:flex-row justify-between items-center gap-6">
                                        <div className="flex-1">
                                            <p className="text-[10px] font-black text-text-secondary uppercase">Mezzo: {req.listingTitle}</p>
                                            <h4 className="text-lg font-black text-text-primary uppercase tracking-tighter">{req.renterName}</h4>
                                            <div className="flex gap-4 mt-2 text-xs font-bold text-text-secondary">
                                                <span className="flex items-center gap-1"><Calendar size={14}/> {req.startDate} / {req.endDate}</span>
                                                <span className="flex items-center gap-1 font-black text-primary">€ {req.totalPrice}</span>
                                            </div>
                                            {req.notes && <p className="text-xs italic mt-3 bg-gray-50 p-2 rounded-xl border">"{req.notes}"</p>}
                                        </div>
                                        <div className="flex gap-3">
                                            {req.status === 'IN ATTESA' && (
                                                <>
                                                    <button onClick={() => updateRequestStatus(req.id, 'RIFIUTATO')} className="p-4 bg-red-100 text-red-600 rounded-2xl hover:bg-red-200"><X/></button>
                                                    <button onClick={() => updateRequestStatus(req.id, 'ACCETTATO')} className="p-4 bg-green-500 text-white rounded-2xl hover:bg-green-600 shadow-lg"><Check/></button>
                                                </>
                                            )}
                                            {req.status === 'ACCETTATO' && (
                                                <button onClick={() => updateRequestStatus(req.id, 'IN CORSO')} className="px-6 py-3 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Consegna Mezzo</button>
                                            )}
                                            {req.status === 'IN CORSO' && (
                                                <button onClick={() => updateRequestStatus(req.id, 'CHIUSO')} className="px-6 py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Conferma Rientro</button>
                                            )}
                                            {req.status === 'CHIUSO' && <span className="text-xs font-black text-green-600 uppercase flex items-center gap-1 bg-green-50 px-4 py-2 rounded-xl"><CheckCircle size={14}/> Transazione Chiusa</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center py-10 bg-gray-50 rounded-[32px] border-2 border-dashed text-text-secondary italic text-sm">Nessuna richiesta ricevuta per i tuoi annunci.</p>
                        )}
                    </div>

                    {/* MY ADS GRID */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-black uppercase tracking-tight px-1 flex items-center gap-2">
                            <LayoutGrid size={24} className="text-primary"/> I miei Annunci
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {myAds.map(ad => (
                                <div key={ad.id} className="bg-white rounded-[32px] p-6 shadow-lg border border-gray-100 flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="text-4xl">{ad.images[0]}</div>
                                        <div>
                                            <h4 className="font-black text-lg text-text-primary uppercase tracking-tighter">{ad.title}</h4>
                                            <p className="text-[10px] font-bold text-text-secondary uppercase">€ {ad.pricePerDay}/gg • {ad.category}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleDeleteAd(ad.id)} className="p-3 text-red-500 hover:bg-red-50 rounded-2xl transition-all"><Trash2 size={18}/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: NUOVO ANNUNCIO */}
            {modal?.type === 'new_ad' && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[40px] shadow-2xl p-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto border-2 border-white">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black uppercase tracking-tighter">Metti a Noleggio</h2>
                            <button onClick={() => setModal(null)} className="p-2 hover:bg-gray-100 rounded-full"><X/></button>
                        </div>
                        <form onSubmit={handleAddListing} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Titolo Annuncio*</label>
                                    <input name="title" required className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold" placeholder="Es. Trattore Lamborghini 90cv"/>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Categoria*</label>
                                    <select name="category" required className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold">
                                        {['trattore', 'trincia', 'atomizzatore', 'drone', 'sensori', 'pompe', 'generatori', 'altro'].map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Prezzo Giornaliero (€)*</label>
                                    <input name="price" type="number" required className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold" placeholder="0.00"/>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Deposito Cauzionale (€)</label>
                                    <div className="flex gap-2 items-center">
                                        <input type="checkbox" name="hasDeposit" className="w-6 h-6 accent-primary"/>
                                        <input name="depositAmount" type="number" className="flex-1 p-4 bg-gray-50 border-none rounded-2xl font-bold" placeholder="Importo"/>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Regione</label>
                                    <input name="region" required className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold" placeholder="Es. Puglia"/>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Provincia</label>
                                    <input name="province" required className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold" placeholder="Es. BA"/>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Comune</label>
                                    <input name="city" required className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold" placeholder="Es. Altamura"/>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Descrizione Mezzo</label>
                                <textarea name="description" rows={3} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold text-sm" placeholder="Specifica dettagli tecnici e stato di usura..."/>
                            </div>
                            <button type="submit" className="w-full py-5 bg-primary text-white rounded-[24px] font-black shadow-xl uppercase tracking-widest text-xs">Pubblica Annuncio</button>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: RICHIESTA PRENOTAZIONE */}
            {modal?.type === 'request' && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[40px] shadow-2xl p-10 w-full max-w-lg border-2 border-white animate-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black uppercase tracking-tighter">Prenota Mezzo</h2>
                            <button onClick={() => setModal(null)} className="p-2 hover:bg-gray-100 rounded-full"><X/></button>
                        </div>
                        <div className="mb-8 p-6 bg-primary/5 rounded-[32px] border border-primary/10">
                            <h4 className="font-black text-primary uppercase text-xs">{modal.data.title}</h4>
                            <p className="text-lg font-black mt-1">€ {modal.data.pricePerDay} <span className="text-xs font-medium">al giorno</span></p>
                        </div>
                        <form onSubmit={handleCreateRequest} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Dal*</label>
                                    <input type="date" name="start" required className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold"/>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Al*</label>
                                    <input type="date" name="end" required className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold"/>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Modalità</label>
                                <select name="delivery" className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold">
                                    <option value="ritiro">Ritiro in sede proprietario</option>
                                    <option value="consegna">Consegna in azienda (+ stima costi)</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Note (Opzionale)</label>
                                <textarea name="notes" rows={2} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold text-sm" placeholder="Esempio: Mi serve per aratura zona collinare..."/>
                            </div>
                            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-2xl">
                                <ShieldCheck size={18} className="text-blue-600 shrink-0"/>
                                <p className="text-[10px] text-blue-800 font-bold uppercase leading-tight">Il noleggio è coperto da garanzia TeraIA Safe Trade</p>
                            </div>
                            <button type="submit" className="w-full py-5 bg-primary text-white rounded-[24px] font-black shadow-xl uppercase tracking-widest text-xs">Invia Richiesta di Prenotazione</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NoleggiHubPage;
