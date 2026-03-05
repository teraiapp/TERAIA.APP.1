
import React, { useState, useEffect, useMemo } from 'react';
import { 
    Tractor, Search, Star, X, PlusCircle, Calendar, 
    MapPin, Filter, ShieldCheck, CheckCircle, Clock, 
    Trash2, Edit, ArrowRight, User, Building, Plane, 
    Wifi, Info, Tag, CreditCard, ChevronRight
} from 'lucide-react';
import { useAppContext } from '../../hooks/useAppContext';
import { RentalItem, RentalBooking, RentalCategory, Plan } from '../../types';

// --- PERSISTENCE HELPERS ---
function usePersistentState<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [state, setState] = useState<T>(() => {
        try {
            const storedValue = localStorage.getItem(key);
            if (storedValue) return JSON.parse(storedValue);
            return defaultValue;
        } catch (error) { return defaultValue; }
    });
    useEffect(() => { localStorage.setItem(key, JSON.stringify(state)); }, [key, state]);
    return [state, setState];
}

const initialItems: RentalItem[] = [
    {
        id: 'r-1',
        name: 'Trattore John Deere 6155M',
        category: 'trattore',
        description: 'Potente trattore da 155 CV, perfetto per aratura e lavori pesanti. Tenuto in ottime condizioni.',
        zone: 'Verona (VR)',
        pricePerDay: 180,
        ownerId: 'owner-1',
        rating: 4.8,
        image: 'https://images.unsplash.com/photo-1594488687126-7d3d1fef130d?auto=format&fit=crop&q=80&w=400',
        deposit: 500
    },
    {
        id: 'r-2',
        name: 'Sensore Umidità WiFi LoraWAN',
        // Fixed: Type '"sensore"' is not assignable to type 'RentalCategory'. Did you mean '"sensori"'?
        category: 'sensori',
        description: 'Kit di 5 sensori per monitoraggio real-time del terreno. Include gateway mobile.',
        zone: 'Foggia (FG)',
        pricePerDay: 15,
        ownerId: 'owner-2',
        rating: 5.0,
        image: 'https://images.unsplash.com/photo-1558449028-b53a39d100fc?auto=format&fit=crop&q=80&w=400',
        deposit: 50
    }
];

const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({ title, onClose, children }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={onClose}>
        <div className="bg-surface rounded-[40px] shadow-2xl p-8 w-full max-w-2xl my-8" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h3 className="text-xl font-black text-text-primary">{title}</h3>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-text-secondary"><X size={24}/></button>
            </div>
            {children}
        </div>
    </div>
);

const NoleggioPage: React.FC = () => {
    const { currentUser } = useAppContext();
    const [activeTab, setActiveTab] = useState<'cerca' | 'miei' | 'offri'>('cerca');

    // State
    const [items, setItems] = usePersistentState<RentalItem[]>('teraia_rental_items', initialItems);
    const [bookings, setBookings] = usePersistentState<RentalBooking[]>('teraia_rental_bookings', []);
    const [modal, setModal] = useState<{type: 'detail' | 'booking', data?: any} | null>(null);
    
    // Booking logic
    const [bookingDates, setBookingDates] = useState({ start: '', end: '' });

    const bookingStats = useMemo(() => {
        if (!bookingDates.start || !bookingDates.end || !modal?.data) return { days: 0, subtotal: 0, fee: 0, total: 0 };
        const days = Math.max(1, Math.ceil((new Date(bookingDates.end).getTime() - new Date(bookingDates.start).getTime()) / (1000 * 3600 * 24)));
        const subtotal = days * modal.data.pricePerDay;
        
        // Fee progressiva in base al piano
        let feeRate = 0.05; 
        if (currentUser?.plan === Plan.PRO) feeRate = 0.02;
        if (currentUser?.plan === Plan.BUSINESS) feeRate = 0.005;
        
        const fee = subtotal * feeRate;
        return { days, subtotal, fee, total: subtotal + fee };
    }, [bookingDates, modal, currentUser]);

    const handleCreateBooking = () => {
        const newBooking: RentalBooking = {
            id: `bk-${Date.now()}`,
            itemId: modal?.data.id,
            renterId: currentUser?.id || 'guest',
            startDate: bookingDates.start,
            endDate: bookingDates.end,
            totalPrice: bookingStats.total,
            fee: bookingStats.fee,
            status: 'richiesta',
            timestamp: new Date().toISOString()
        };
        setBookings(prev => [newBooking, ...prev]);
        setModal(null);
        setActiveTab('miei');
        alert("Richiesta inviata! Il proprietario riceverà la notifica.");
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-text-primary flex items-center gap-3 uppercase tracking-tighter">
                        <Tractor className="text-primary" /> Noleggio P2P
                    </h1>
                    <p className="text-text-secondary text-sm">Airbnb per l'agricoltura. Mezzi assicurati e certificati.</p>
                </div>
                <div className="flex bg-gray-100 p-1 rounded-2xl shadow-inner shrink-0">
                    {['cerca', 'miei', 'offri'].map(tab => (
                        <button 
                            key={tab} 
                            onClick={() => setActiveTab(tab as any)} 
                            className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all ${activeTab === tab ? 'bg-white shadow-sm text-primary' : 'text-text-secondary'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab === 'cerca' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {items.map(item => (
                        <div key={item.id} className="group bg-white rounded-[32px] overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-gray-100 flex flex-col">
                            <div className="relative h-56">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                <div className="absolute top-4 right-4 bg-primary text-white px-4 py-1.5 rounded-full text-xs font-black shadow-lg">
                                    €{item.pricePerDay}/gg
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="font-black text-text-primary text-xl leading-tight mb-2">{item.name}</h3>
                                <p className="text-xs text-text-secondary flex items-center gap-1 mb-6 font-bold"><MapPin size={12}/> {item.zone}</p>
                                <div className="flex gap-2">
                                    <button onClick={() => setModal({type: 'booking', data: item})} className="flex-1 py-3 bg-primary text-white text-[10px] font-black rounded-xl shadow-md hover:bg-primary-dark transition-all uppercase tracking-widest">
                                        Prenota Ora
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Altre TAB semplificate per brevità nel prompt... */}

            {modal?.type === 'booking' && (
                <Modal title={`Prenota ${modal.data.name}`} onClose={() => setModal(null)}>
                    <div className="space-y-8">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-text-secondary mb-2">Inizio Noleggio</label>
                                <input type="date" className="w-full p-4 border rounded-2xl bg-gray-50 focus:ring-2 focus:ring-primary outline-none" value={bookingDates.start} onChange={e=>setBookingDates({...bookingDates, start:e.target.value})}/>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-text-secondary mb-2">Fine Noleggio</label>
                                <input type="date" className="w-full p-4 border rounded-2xl bg-gray-50 focus:ring-2 focus:ring-primary outline-none" value={bookingDates.end} onChange={e=>setBookingDates({...bookingDates, end:e.target.value})}/>
                            </div>
                        </div>

                        {bookingStats.days > 0 && (
                            <div className="bg-primary/5 p-6 rounded-3xl border border-primary/20 space-y-3">
                                <div className="flex justify-between text-sm font-bold text-text-secondary">
                                    <span>Noleggio ({bookingStats.days} gg)</span>
                                    <span>€ {bookingStats.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm font-bold text-text-secondary">
                                    <span className="flex items-center gap-1">Servizio TeraIA <Info size={12}/></span>
                                    <span>€ {bookingStats.fee.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xl font-black text-primary pt-3 border-t-2 border-primary/10">
                                    <span>TOTALE</span>
                                    <span>€ {bookingStats.total.toFixed(2)}</span>
                                </div>
                                {currentUser?.plan === Plan.FREE && (
                                    <p className="text-[10px] text-secondary font-black text-center uppercase mt-4">
                                        💡 Risparmia € {(bookingStats.subtotal * 0.045).toFixed(2)} su questo ordine con il piano PRO
                                    </p>
                                )}
                            </div>
                        )}

                        <button 
                            disabled={bookingStats.days === 0} 
                            onClick={handleCreateBooking}
                            className="w-full py-5 bg-primary text-white font-black rounded-2xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary-dark shadow-xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
                        >
                            <CreditCard size={20}/> Conferma e Paga Noleggio
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default NoleggioPage;
