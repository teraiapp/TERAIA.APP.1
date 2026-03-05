
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, UserCheck, Stethoscope, Briefcase, Atom, Tractor, Star, MapPin, MessageSquare, FileText, ExternalLink, X, PlusCircle, Phone, Mail } from 'lucide-react';
// FIX: Imported PriceType to resolve the type error.
import { initialMarketplaceOffers, initialMarketplaceRequests, MarketplaceOffer, MarketplaceRequest, OfferCategory, RequestStatus, PriceType } from '../../data/marketplaceData';

// --- PERSISTENCE HOOK ---
function usePersistentState<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [state, setState] = useState<T>(() => {
        try {
            const storedValue = localStorage.getItem(key);
            if (storedValue) return JSON.parse(storedValue);
            localStorage.setItem(key, JSON.stringify(defaultValue));
            return defaultValue;
        } catch (error) { return defaultValue; }
    });
    useEffect(() => { localStorage.setItem(key, JSON.stringify(state)); }, [key, state]);
    return [state, setState];
}

const allOfferCategories: OfferCategory[] = ['Vivai / Piantine', 'Concimi & Prodotti', 'Servizi Agronomici', 'Servizi Veterinari', 'Consulenza Fiscale', 'Attrezzature', 'Altro'];
const requestStatusConfig: { [key in RequestStatus]: { color: string; text: string } } = {
    'Inviata': { color: 'bg-blue-100 text-blue-800', text: 'Inviata' },
    'In risposta': { color: 'bg-yellow-100 text-yellow-800', text: 'In Risposta' },
    'Accettata': { color: 'bg-green-100 text-green-800', text: 'Accettata' },
    'Rifiutata': { color: 'bg-red-100 text-red-800', text: 'Rifiutata' },
};

// --- MAIN PAGE COMPONENT ---
const MarketplacePage: React.FC = () => {
    const [offers, setOffers] = usePersistentState<MarketplaceOffer[]>('teraia_marketplace_offers', initialMarketplaceOffers);
    const [requests, setRequests] = usePersistentState<MarketplaceRequest[]>('teraia_marketplace_requests', initialMarketplaceRequests);
    
    const [activeTab, setActiveTab] = useState<'offers' | 'requests'>('offers');
    const [selectedOffer, setSelectedOffer] = useState<MarketplaceOffer | null>(null);
    const [modal, setModal] = useState<'detail' | 'contact' | 'quote' | 'new_offer' | null>(null);
    const navigate = useNavigate();

    const handleSaveOffer = (offerData: Omit<MarketplaceOffer, 'id' | 'icon'>) => {
        const newOffer: MarketplaceOffer = { id: Date.now(), ...offerData, icon: Tractor }; // Default icon
        setOffers(prev => [newOffer, ...prev]);
        setModal(null);
        alert('Offerta pubblicata con successo!');
    };

    const handleSaveRequest = (requestData: Omit<MarketplaceRequest, 'id' | 'requestDate' | 'status'>) => {
        const newRequest: MarketplaceRequest = { id: Date.now(), ...requestData, requestDate: new Date().toISOString(), status: 'Inviata' };
        setRequests(prev => [newRequest, ...prev]);
        setModal(null);
        alert('Richiesta inviata con successo!');
        setActiveTab('requests');
    };

    const handleCancelRequest = (id: number) => {
        if (window.confirm("Sei sicuro di voler annullare questa richiesta?")) {
            setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Rifiutata' } : r));
            alert('Richiesta annullata.');
        }
    };
    
    const handleNavigate = (route?: string) => {
        if(route) navigate(route);
        else alert('Modulo non disponibile.');
        setModal(null);
    };

    const renderModals = () => {
        if (modal === 'new_offer') return <OfferFormModal onClose={() => setModal(null)} onSave={handleSaveOffer} />;
        if (!selectedOffer) return null;
        if (modal === 'detail') return <OfferDetailModal offer={selectedOffer} onClose={() => setModal(null)} onContact={() => setModal('contact')} onQuote={() => setModal('quote')} onNavigate={handleNavigate} />;
        if (modal === 'contact') return <ContactModal provider={selectedOffer} onClose={() => setModal(null)} />;
        if (modal === 'quote') return <QuoteModal offer={selectedOffer} onClose={() => setModal(null)} onSave={handleSaveRequest} />;
        return null;
    };
    
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center"><h1 className="text-3xl font-bold text-text-primary">Marketplace</h1><button onClick={() => setModal('new_offer')} className="flex items-center px-4 py-2 bg-secondary text-white rounded-lg font-semibold hover:bg-orange-600"><PlusCircle size={20} className="mr-2"/>Pubblica Offerta</button></div>
            <div className="flex border-b"><button onClick={() => setActiveTab('offers')} className={`px-4 py-2 font-semibold ${activeTab === 'offers' ? 'border-b-2 border-primary text-primary' : 'text-text-secondary'}`}>Tutte le Offerte</button><button onClick={() => setActiveTab('requests')} className={`px-4 py-2 font-semibold ${activeTab === 'requests' ? 'border-b-2 border-primary text-primary' : 'text-text-secondary'}`}>Le Mie Richieste</button></div>
            {activeTab === 'offers' ? <OfferList offers={offers} onSelectOffer={(offer) => { setSelectedOffer(offer); setModal('detail'); }} /> : <RequestList requests={requests} offers={offers} onCancel={handleCancelRequest} />}
            {renderModals()}
        </div>
    );
};

// --- CHILD COMPONENTS ---
const OfferList: React.FC<{offers: MarketplaceOffer[], onSelectOffer: (offer: MarketplaceOffer) => void}> = ({ offers, onSelectOffer }) => (
    <>
        {offers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {offers.map(offer => (
                    <div key={offer.id} onClick={() => onSelectOffer(offer)} className="bg-surface rounded-xl shadow-md p-6 flex flex-col cursor-pointer group hover:shadow-lg transition-shadow">
                        <div className="flex-grow">
                            <h3 className="text-xl font-bold text-primary group-hover:underline">{offer.title}</h3>
                            <p className="text-sm font-semibold">{offer.provider}</p>
                            <p className="flex items-center text-sm text-text-secondary my-2"><MapPin size={14} className="mr-2"/>{offer.location}</p>
                            <p className="text-sm my-4">{offer.description.substring(0, 100)}...</p>
                        </div>
                        <div className="border-t pt-4 mt-4 flex justify-between items-center">
                            <p className="font-bold text-lg">{offer.priceType === 'preventivo' ? 'Su Preventivo' : `${offer.price.toFixed(2)}€`}<span className="text-sm font-normal"> / {offer.priceType}</span></p>
                            <span className="px-3 py-1 text-xs font-bold rounded-full bg-green-100 text-green-800">Disponibile</span>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="text-center py-16 text-text-secondary">
                <h3 className="text-lg font-semibold">Nessuna offerta trovata</h3>
                <p>Il marketplace è vuoto. Prova a pubblicare la tua offerta!</p>
            </div>
        )}
    </>
);

const RequestList: React.FC<{requests: MarketplaceRequest[], offers: MarketplaceOffer[], onCancel: (id: number) => void}> = ({ requests, offers, onCancel }) => (
    <div className="bg-surface rounded-xl shadow-md p-6 space-y-4">
        {requests.map(req => {
            const offer = offers.find(o => o.id === req.offerId);
            if (!offer) return null;
            const statusInfo = requestStatusConfig[req.status];
            return (
                <div key={req.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start"><div><p className="font-bold">{offer.title}</p><p className="text-sm text-text-secondary">Richiesta a: {offer.provider} il {new Date(req.requestDate).toLocaleDateString()}</p></div><span className={`px-3 py-1 text-xs font-bold rounded-full ${statusInfo.color}`}>{statusInfo.text}</span></div>
                    <p className="text-sm bg-gray-50 p-2 rounded-md my-2">"{req.userMessage}"</p>
                    <div className="flex gap-2 mt-2">{req.status === 'Inviata' && <button onClick={() => onCancel(req.id)} className="text-xs font-semibold text-red-600 hover:underline">Annulla Richiesta</button>}</div>
                </div>
            )
        })}
        {requests.length === 0 && <p className="text-center text-text-secondary py-8">Nessuna richiesta inviata.</p>}
    </div>
);

// --- MODAL COMPONENTS ---
const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode; maxWidth?: string }> = ({ title, onClose, children, maxWidth = 'max-w-lg' }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}><div className={`bg-surface rounded-xl shadow-2xl p-6 w-full ${maxWidth}`} onClick={e => e.stopPropagation()}><div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold">{title}</h3><button onClick={onClose}><X size={24}/></button></div>{children}</div></div>
);

const OfferDetailModal: React.FC<{offer: MarketplaceOffer, onClose: () => void, onContact: () => void, onQuote: () => void, onNavigate: (route?: string) => void}> = ({offer, onClose, onContact, onQuote, onNavigate}) => (
    <Modal title={offer.title} onClose={onClose} maxWidth="max-w-2xl">
        <p className="text-lg font-semibold">{offer.provider} - <span className="text-base font-normal text-text-secondary">{offer.location}</span></p>
        <p className="my-4">{offer.description}</p>
        <div className="flex flex-wrap gap-2 border-t pt-4">
            <button onClick={onQuote} className="flex-1 p-2 bg-primary text-white font-bold rounded-lg"><FileText size={16} className="inline mr-2"/>Richiedi Preventivo</button>
            <button onClick={onContact} className="flex-1 p-2 bg-blue-500 text-white font-bold rounded-lg"><MessageSquare size={16} className="inline mr-2"/>Contatta</button>
            <button onClick={() => onNavigate(offer.moduleRoute)} className="flex-1 p-2 bg-gray-600 text-white font-bold rounded-lg"><ExternalLink size={16} className="inline mr-2"/>Vai al Modulo</button>
        </div>
    </Modal>
);

const ContactModal: React.FC<{provider: MarketplaceOffer, onClose: () => void}> = ({provider, onClose}) => (
    <Modal title={`Contatta ${provider.provider}`} onClose={onClose}>
        <div className="space-y-3">
             <a href={`tel:${provider.contact.phone}`} className="w-full flex items-center justify-center p-3 bg-blue-500 text-white font-bold rounded-lg"><Phone size={18} className="mr-2"/> Chiama</a>
             <a href={`mailto:${provider.contact.email}`} className="w-full flex items-center justify-center p-3 bg-gray-600 text-white font-bold rounded-lg"><Mail size={18} className="mr-2"/> Email</a>
             <a href={`https://wa.me/${provider.contact.whatsapp}`} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center p-3 bg-green-500 text-white font-bold rounded-lg"><MessageSquare size={18} className="mr-2"/> WhatsApp</a>
         </div>
    </Modal>
);

const QuoteModal: React.FC<{offer: MarketplaceOffer, onClose: () => void, onSave: (data: Omit<MarketplaceRequest, 'id' | 'requestDate' | 'status'>) => void}> = ({offer, onClose, onSave}) => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        onSave({ offerId: offer.id, userMessage: formData.get('message') as string, urgency: formData.get('urgency') as 'Normale' | 'Urgente' });
    };
    return (
        <Modal title={`Richiedi Preventivo: ${offer.title}`} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <textarea name="message" placeholder="Descrivi la tua richiesta..." rows={5} className="w-full p-2 border rounded-md" required />
                <input name="details" placeholder="Quantità / Superficie / N. Animali (opzionale)" className="w-full p-2 border rounded-md" />
                <div><label className="block text-sm font-medium">Urgenza</label><select name="urgency" className="w-full p-2 border rounded-md bg-white"><option>Normale</option><option>Urgente</option></select></div>
                <button type="submit" className="w-full p-2 bg-primary text-white font-bold rounded-lg">Invia Richiesta</button>
            </form>
        </Modal>
    );
};

const OfferFormModal: React.FC<{onClose: () => void, onSave: (data: Omit<MarketplaceOffer, 'id' | 'icon'>) => void}> = ({onClose, onSave}) => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        onSave({
            title: formData.get('title') as string,
            category: formData.get('category') as OfferCategory,
            provider: 'La mia Azienda',
            location: formData.get('location') as string,
            description: formData.get('description') as string,
            price: Number(formData.get('price')),
            priceType: formData.get('priceType') as PriceType,
            contact: { phone: formData.get('phone') as string, email: formData.get('email') as string, whatsapp: (formData.get('phone') as string).replace(/\D/g, '') }
        });
    };
    return (
        <Modal title="Pubblica una Nuova Offerta" onClose={onClose} maxWidth="max-w-2xl">
            <form onSubmit={handleSubmit} className="space-y-4">
                <input name="title" placeholder="Titolo offerta (es. Piantine Pomodoro)" className="w-full p-2 border rounded-md" required/>
                <select name="category" className="w-full p-2 border rounded-md bg-white">{allOfferCategories.map(c=><option key={c}>{c}</option>)}</select>
                <textarea name="description" placeholder="Descrizione dettagliata" rows={4} className="w-full p-2 border rounded-md" required/>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input name="price" type="number" step="0.01" placeholder="Prezzo" className="w-full p-2 border rounded-md" required/>
                    <select name="priceType" className="w-full p-2 border rounded-md bg-white">{['fisso', 'ora', 'ettaro', 'giorno', 'preventivo'].map(p=><option key={p} value={p}>{p}</option>)}</select>
                    <input name="location" placeholder="Luogo (Provincia)" className="w-full p-2 border rounded-md" required/>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                     <input name="phone" type="tel" placeholder="Telefono di contatto" className="w-full p-2 border rounded-md" required />
                     <input name="email" type="email" placeholder="Email di contatto" className="w-full p-2 border rounded-md" required />
                 </div>
                <button type="submit" className="w-full p-3 bg-primary text-white font-bold rounded-lg">Pubblica Offerta</button>
            </form>
        </Modal>
    );
};

export default MarketplacePage;
