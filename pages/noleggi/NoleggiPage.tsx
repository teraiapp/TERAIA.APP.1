
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tractor, Search, Star, X, PlusCircle, ExternalLink, Phone, Mail, MessageSquare } from 'lucide-react';
import { initialRentalListings, initialBookings, RentalListing, Booking, RentalStatus, RentalCategory } from '../../data/noleggiData';

// Custom hook for localStorage persistence
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

const allRentalStatuses: RentalStatus[] = ['Richiesta inviata', 'Accettata', 'Rifiutata', 'In corso', 'Completata', 'Annullata'];
const allRentalCategories: RentalCategory[] = ['Mezzi Agricoli', 'Attrezzature', 'Sensori', 'Droni', 'Altro'];
const commissionRate = 0.03; // 3% platform commission

const statusConfig: { [key in RentalStatus]: { color: string; text: string } } = {
    'Richiesta inviata': { color: 'bg-blue-100 text-blue-800', text: 'Richiesta Inviata' },
    'Accettata': { color: 'bg-yellow-100 text-yellow-800', text: 'Accettata' },
    'Rifiutata': { color: 'bg-orange-100 text-orange-800', text: 'Rifiutata' },
    'In corso': { color: 'bg-green-100 text-green-800', text: 'In Corso' },
    'Completata': { color: 'bg-gray-200 text-gray-800', text: 'Completata' },
    'Annullata': { color: 'bg-red-100 text-red-800', text: 'Annullata' },
};

const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode; maxWidth?: string }> = ({ title, onClose, children, maxWidth = 'max-w-lg' }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}><div className={`bg-surface rounded-xl shadow-2xl p-6 w-full ${maxWidth}`} onClick={e => e.stopPropagation()}><div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold">{title}</h3><button onClick={onClose}><X size={24}/></button></div>{children}</div></div>
);

const NoleggiPage: React.FC = () => {
    const [listings, setListings] = usePersistentState<RentalListing[]>('teraia_rentals_listings', initialRentalListings);
    const [bookings, setBookings] = usePersistentState<Booking[]>('teraia_rentals_bookings', initialBookings);

    const [activeTab, setActiveTab] = useState<'browse' | 'my_rentals'>('browse');
    const [selectedListing, setSelectedListing] = useState<RentalListing | null>(null);
    const [modal, setModal] = useState<'detail' | 'booking' | 'contact' | 'new_ad' | null>(null);
    
    // Booking state
    const [bookingStep, setBookingStep] = useState(1);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const navigate = useNavigate();

    const bookingDays = useMemo(() => {
        if (!startDate || !endDate) return 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (start >= end) return 0;
        return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    }, [startDate, endDate]);
    
    const handleOpenDetail = (listing: RentalListing) => { setSelectedListing(listing); setModal('detail'); };
    
    const handleBookingRequest = () => {
        if (!selectedListing || bookingDays <= 0) {
            alert("Seleziona un intervallo di date valido."); return;
        }
        const newBooking: Booking = {
            id: Date.now(),
            listingId: selectedListing.id,
            renter: 'Mario Rossi',
            startDate, endDate,
            totalPrice: bookingDays * selectedListing.pricePerDay,
            status: 'Richiesta inviata',
        };
        setBookings(prev => [newBooking, ...prev]);
        setModal(null); setStartDate(''); setEndDate(''); setBookingStep(1);
        setActiveTab('my_rentals');
        alert('Richiesta di noleggio inviata con successo!');
    };
    
    const handleAddListing = (listingData: Omit<RentalListing, 'id' | 'rating' | 'bookedDates' | 'mainImage'>) => {
        const newListing: RentalListing = {
            id: Date.now(),
            ...listingData,
            rating: 0,
            bookedDates: [],
            mainImage: 'https://via.placeholder.com/400x300.png?text=Nuovo+Annuncio'
        };
        setListings(prev => [newListing, ...prev]);
        setModal(null);
        alert('Il tuo annuncio è stato pubblicato con successo!');
    };

    const handleBookingAction = (bookingId: number, newStatus: RentalStatus) => {
        setBookings(prev => prev.map(b => b.id === bookingId ? {...b, status: newStatus} : b));
        alert(`Stato della prenotazione aggiornato a: ${newStatus}`);
    };
    
    const handleNavigate = (route?: string) => {
        if(route) navigate(route);
        else alert('Questa funzionalità non è ancora disponibile.');
        setModal(null);
    };

    const renderModals = () => {
        if (modal === 'new_ad') return <NewAdModal onSave={handleAddListing} onClose={() => setModal(null)} />;
        if (!selectedListing) return null;

        if (modal === 'detail') return (
            <Modal title={selectedListing.name} onClose={() => setModal(null)} maxWidth="max-w-2xl">
                <p className="mb-4">{selectedListing.description}</p>
                <div className="text-sm space-y-2 mb-4">
                    <p><strong>Deposito:</strong> {selectedListing.deposit}€</p>
                    <p><strong>Località:</strong> {selectedListing.location}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button onClick={() => setModal('booking')} className="flex-1 p-2 bg-primary text-white font-bold rounded-lg">Prenota Ora</button>
                    <button onClick={() => setModal('contact')} className="flex-1 p-2 bg-gray-200 font-bold rounded-lg">Contatta Proprietario</button>
                    <button onClick={() => handleNavigate(selectedListing.moduleRoute)} className="flex-1 p-2 bg-gray-600 text-white font-bold rounded-lg flex items-center justify-center"><ExternalLink size={16} className="mr-2"/> Vai al Modulo</button>
                </div>
            </Modal>
        );
        
        if (modal === 'booking') {
            const price = bookingDays * selectedListing.pricePerDay;
            const commission = price * commissionRate;
            const total = price + commission + selectedListing.deposit;
            return (
                 <Modal title={`Prenota: ${selectedListing.name}`} onClose={() => setModal(null)}>
                    {bookingStep === 1 && <>
                        <p>Seleziona le date del noleggio.</p>
                        <div className="grid grid-cols-2 gap-4 my-4">
                            <div><label className="text-sm font-medium">Data Inizio</label><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-2 border rounded-md"/></div>
                            <div><label className="text-sm font-medium">Data Fine</label><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-2 border rounded-md"/></div>
                        </div>
                        <button onClick={() => setBookingStep(2)} disabled={bookingDays <= 0} className="w-full p-2 bg-primary text-white font-bold rounded-lg disabled:bg-gray-400">Avanti</button>
                    </>}
                    {bookingStep === 2 && <>
                        <p>Riepilogo costi per <strong>{bookingDays}</strong> giorni.</p>
                        <div className="space-y-2 text-sm my-4 border-t pt-4">
                            <p className="flex justify-between"><span>Costo Noleggio:</span> <span>{price.toFixed(2)} €</span></p>
                            <p className="flex justify-between"><span>Commissione TeraIA (3%):</span> <span>{commission.toFixed(2)} €</span></p>
                            <p className="flex justify-between"><span>Deposito Cauzionale:</span> <span>{selectedListing.deposit.toFixed(2)} €</span></p>
                            <p className="flex justify-between font-bold text-lg border-t pt-2"><span>Totale:</span> <span>{(price + commission).toFixed(2)} €</span></p>
                            <p className="text-xs text-center text-text-secondary">(Il deposito sarà bloccato e restituito al termine)</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setBookingStep(1)} className="flex-1 p-2 bg-gray-200 font-bold rounded-lg">Indietro</button>
                            <button onClick={handleBookingRequest} className="flex-1 p-2 bg-primary text-white font-bold rounded-lg">Conferma Richiesta</button>
                        </div>
                    </>}
                </Modal>
            );
        }
        
        if (modal === 'contact') return (
            <Modal title={`Contatta ${selectedListing.owner.name}`} onClose={() => setModal('detail')}>
                <div className="space-y-3">
                    <a href={`tel:${selectedListing.owner.phone}`} className="w-full flex items-center justify-center p-3 bg-blue-500 text-white font-bold rounded-lg"><Phone size={18} className="mr-2"/> Chiama</a>
                    <a href={`mailto:${selectedListing.owner.email}`} className="w-full flex items-center justify-center p-3 bg-gray-600 text-white font-bold rounded-lg"><Mail size={18} className="mr-2"/> Email</a>
                    <a href={`https://wa.me/${selectedListing.owner.whatsapp}`} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center p-3 bg-green-500 text-white font-bold rounded-lg"><MessageSquare size={18} className="mr-2"/> WhatsApp</a>
                </div>
            </Modal>
        );
        return null;
    }

    const renderBrowse = () => (
        <>
            {listings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {listings.map(listing => (
                        <div key={listing.id} onClick={() => handleOpenDetail(listing)} className="bg-surface rounded-xl shadow-md overflow-hidden cursor-pointer group">
                            <img src={listing.mainImage} alt={listing.name} className="h-48 w-full object-cover group-hover:scale-105 transition-transform"/>
                            <div className="p-4"><h3 className="font-bold text-lg">{listing.name}</h3><p className="text-sm text-text-secondary">{listing.category}</p><div className="flex justify-between items-center mt-2"><p className="font-bold text-primary text-xl">{listing.pricePerDay}€ <span className="text-sm font-normal text-text-secondary">/giorno</span></p><div className="flex items-center gap-1"><Star size={16} className="text-yellow-500"/> {listing.rating}</div></div></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 text-text-secondary">
                    <Tractor size={48} className="mx-auto mb-4 text-gray-300"/>
                    <h3 className="text-lg font-semibold">Nessun annuncio disponibile</h3>
                    <p>Al momento non ci sono mezzi o attrezzature da noleggiare.</p>
                </div>
            )}
        </>
    );

    const renderMyRentals = () => (
        <div className="bg-surface rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Le Mie Prenotazioni</h2>
            {bookings.length > 0 ? (
                <div className="space-y-4">
                    {bookings.map(booking => {
                        const listing = listings.find(l => l.id === booking.listingId);
                        if (!listing) return null;
                        const statusInfo = statusConfig[booking.status];
                        return (
                            <div key={booking.id} className="border rounded-lg p-4 flex flex-col md:flex-row justify-between md:items-center gap-4">
                                <div><p className="font-bold">{listing.name}</p><p className="text-sm text-text-secondary">{new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}</p></div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${statusInfo.color}`}>{statusInfo.text}</span>
                                    {booking.status === 'Richiesta inviata' && <button onClick={() => handleBookingAction(booking.id, 'Annullata')} className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg">Annulla</button>}
                                    {booking.status === 'Accettata' && <button onClick={() => handleBookingAction(booking.id, 'In corso')} className="px-3 py-1 bg-green-500 text-white text-sm rounded-lg">Segna Ritirato</button>}
                                    {booking.status === 'In corso' && <button onClick={() => handleBookingAction(booking.id, 'Completata')} className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg">Segna Restituito</button>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-10 text-text-secondary">
                    <p>Non hai nessuna prenotazione attiva.</p>
                    <p className="text-sm">Esplora il catalogo per trovare ciò che ti serve.</p>
                </div>
            )}
        </div>
    );

    return (
        <div className="space-y-8">
             <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-text-primary">Noleggi P2P</h1>
                <button onClick={() => setModal('new_ad')} className="flex items-center px-4 py-2 bg-secondary text-white rounded-lg font-semibold hover:bg-orange-600">
                    <PlusCircle size={20} className="mr-2" /> Pubblica annuncio
                </button>
            </div>
            
            <div className="flex border-b">
                <button onClick={() => setActiveTab('browse')} className={`px-4 py-2 font-semibold ${activeTab === 'browse' ? 'border-b-2 border-primary text-primary' : 'text-text-secondary'}`}>Catalogo Noleggi</button>
                <button onClick={() => setActiveTab('my_rentals')} className={`px-4 py-2 font-semibold ${activeTab === 'my_rentals' ? 'border-b-2 border-primary text-primary' : 'text-text-secondary'}`}>Le Mie Prenotazioni</button>
            </div>

            {activeTab === 'browse' ? renderBrowse() : renderMyRentals()}
            {renderModals()}
        </div>
    );
};

const NewAdModal: React.FC<{onSave: (data: Omit<RentalListing, 'id'|'rating'|'bookedDates'|'mainImage'>) => void, onClose: () => void}> = ({onSave, onClose}) => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get('name') as string,
            category: formData.get('category') as RentalCategory,
            pricePerDay: Number(formData.get('pricePerDay')),
            location: formData.get('location') as string,
            description: formData.get('description') as string,
            deposit: Number(formData.get('deposit')),
            owner: {
                name: "Mario Rossi (Tu)",
                phone: formData.get('phone') as string,
                email: formData.get('email') as string,
                whatsapp: (formData.get('phone') as string).replace(/\D/g, '')
            }
        };
        onSave(data);
    };

    return (
        <Modal title="Pubblica un Annuncio di Noleggio" onClose={onClose} maxWidth="max-w-2xl">
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <input name="name" placeholder="Titolo annuncio (es. Trattore 90cv)" className="w-full p-2 border rounded-md" required />
                     <select name="category" className="w-full p-2 border rounded-md bg-white">{allRentalCategories.map(c=><option key={c} value={c}>{c}</option>)}</select>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input name="pricePerDay" type="number" placeholder="Prezzo/giorno (€)" className="w-full p-2 border rounded-md" required />
                    <input name="deposit" type="number" placeholder="Deposito cauzionale (€)" className="w-full p-2 border rounded-md" required />
                 </div>
                 <input name="location" placeholder="Luogo (Comune, Provincia)" className="w-full p-2 border rounded-md" required />
                 <textarea name="description" placeholder="Breve descrizione" rows={3} className="w-full p-2 border rounded-md" required />
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                     <input name="phone" type="tel" placeholder="Telefono di contatto" className="w-full p-2 border rounded-md" required />
                     <input name="email" type="email" placeholder="Email di contatto" className="w-full p-2 border rounded-md" required />
                 </div>
                 <button type="submit" className="w-full p-3 bg-primary text-white font-bold rounded-lg">Pubblica Annuncio</button>
            </form>
        </Modal>
    );
};

export default NoleggiPage;
