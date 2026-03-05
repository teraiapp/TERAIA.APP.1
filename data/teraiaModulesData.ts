
export type SupplierCategory = 'vivaio' | 'concimi' | 'sementi' | 'fitosanitari' | 'animali' | 'mangimi' | 'attrezzature';
export type OrderStatus = 'in_preparazione' | 'spedito' | 'consegnato';
export type QuoteStatus = 'bozza' | 'inviata' | 'risposta' | 'accettata' | 'rifiutata';
export type RentalStatus = 'in_attesa' | 'accettato' | 'rifiutato' | 'in_corso' | 'chiuso';
export type AdStatus = 'attivo' | 'sospeso' | 'chiuso';

export interface Supplier {
    id: string;
    name: string;
    category: SupplierCategory;
    region: string;
    province: string;
    city: string;
    phone: string;
    email: string;
    deliveryDays: number;
}

export interface QuoteRequest {
    id: string;
    supplierId: string;
    supplierName: string;
    category: SupplierCategory;
    product: string;
    quantity: number;
    unit: string;
    deliveryDate: string;
    unitId?: string; // Collegamento produzione
    status: QuoteStatus;
    notes?: string;
    priceOffer?: number;
}

export interface AgriOrder {
    id: string;
    supplierName: string;
    amount: number;
    date: string;
    status: OrderStatus;
    quoteId?: string;
}

export interface RentListing {
    id: string;
    ownerId: string;
    title: string;
    category: string;
    pricePerDay: number;
    deposit: boolean;
    location: string;
    region: string;
    description: string;
    image: string;
    status: AdStatus;
}

export interface RentRequest {
    id: string;
    listingId: string;
    listingTitle: string;
    renterId: string;
    startDate: string;
    endDate: string;
    status: RentalStatus;
    totalPrice: number;
    notes?: string;
}

export const INITIAL_SUPPLIERS: Supplier[] = [
    { id: 's-1', name: 'Vivai Piante Maratona', category: 'vivaio', region: 'Puglia', province: 'BA', city: 'Bari', phone: '080123456', email: 'info@maratona.it', deliveryDays: 5 },
    { id: 's-2', name: 'AgroChimica Nord', category: 'concimi', region: 'Veneto', province: 'VR', city: 'Verona', phone: '045987654', email: 'ordini@agrochimica.it', deliveryDays: 3 },
    { id: 's-3', name: 'Sementi Italiane SPA', category: 'sementi', region: 'Emilia-Romagna', province: 'BO', city: 'Bologna', phone: '051554433', email: 'sales@sementi.it', deliveryDays: 2 }
];

export const INITIAL_RENTALS: RentListing[] = [
    { id: 'rl-1', ownerId: 'user-2', title: 'Trattore John Deere 6155M', category: 'trattore', pricePerDay: 180, deposit: true, location: 'Foggia', region: 'Puglia', description: 'Trattore perfetto per aratura, 155 CV.', image: '🚜', status: 'attivo' },
    { id: 'rl-2', ownerId: 'user-3', title: 'Atomizzatore Cima 1000L', category: 'atomizzatore', pricePerDay: 85, deposit: false, location: 'Verona', region: 'Veneto', description: 'Ottimo per vigneti e frutteti.', image: '🚿', status: 'attivo' }
];

export const INITIAL_PROS = [
    { id: 'p-1', name: 'Dott. Marco Bianchi', role: 'Agronomo', region: 'Puglia', skills: 'Vite, Olivo', contact: 'marco.b@agronomi.it' },
    { id: 'p-2', name: 'Dr.ssa Sara Neri', role: 'Veterinario', region: 'Lombardia', skills: 'Bovini da latte', contact: 'sara.n@vet.it' }
];
