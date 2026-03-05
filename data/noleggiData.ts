
// REFACTORED: Expanded status types for a full booking lifecycle.
export type RentalStatus = 'Richiesta inviata' | 'Accettata' | 'Rifiutata' | 'In corso' | 'Completata' | 'Annullata';
export type RentalCategory = 'Mezzi Agricoli' | 'Attrezzature' | 'Sensori' | 'Droni' | 'Altro';

export interface Review {
    user: string;
    rating: number;
    comment: string;
}

// REFACTORED: Added owner contact details and a potential module route.
export interface RentalListing {
    id: number;
    name: string;
    category: RentalCategory;
    pricePerDay: number;
    location: string;
    rating: number;
    mainImage: string;
    description: string;
    deposit: number;
    owner: {
        name: string;
        phone: string;
        email: string;
        whatsapp: string;
    };
    bookedDates: string[]; // "YYYY-MM-DD"
    moduleRoute?: string;
}

export interface Booking {
    id: number;
    listingId: number;
    renter: string;
    startDate: string;
    endDate: string;
    totalPrice: number;
    status: RentalStatus;
}

// REFACTORED: Updated initial listings with new fields to serve as a default for localStorage.
export const initialRentalListings: RentalListing[] = [
    {
        id: 1,
        name: 'Trattore John Deere 6155M',
        category: 'Mezzi Agricoli',
        pricePerDay: 180,
        location: 'Verona (VR)',
        rating: 4.8,
        mainImage: 'https://via.placeholder.com/400x300.png?text=Trattore+JD',
        description: 'Potente e affidabile trattore John Deere, ideale per aratura e lavori pesanti. Completo di sollevatore anteriore.',
        deposit: 500,
        owner: { name: 'Azienda Agricola Futura', phone: '+393331234567', email: 'noleggi@agrifutura.it', whatsapp: '393331234567' },
        bookedDates: ['2024-07-10', '2024-07-11', '2024-07-12'],
    },
    {
        id: 2,
        name: 'Atomizzatore Cima 1000L',
        category: 'Attrezzature',
        pricePerDay: 90,
        location: 'Bari (BA)',
        rating: 4.5,
        mainImage: 'https://via.placeholder.com/400x300.png?text=Atomizzatore',
        description: 'Atomizzatore trainato da 1000 litri, perfetto per trattamenti su vigneti e frutteti.',
        deposit: 200,
        owner: { name: 'F.lli Bianchi', phone: '+393337654321', email: 'info@bianchiagri.com', whatsapp: '393337654321' },
        bookedDates: [],
        moduleRoute: '/produzione'
    },
    {
        id: 3,
        name: 'Centralina Irrigazione LoraWAN',
        category: 'Sensori',
        pricePerDay: 25,
        location: 'Palermo (PA)',
        rating: 5,
        mainImage: 'https://via.placeholder.com/400x300.png?text=Centralina',
        description: 'Centralina wireless per la gestione remota di 8 elettrovalvole. Compatibile con tutti i sensori LoraWAN.',
        deposit: 100,
        owner: { name: 'AgriTech Solutions', phone: '+393339876543', email: 'sales@agritech.it', whatsapp: '393339876543' },
        bookedDates: ['2024-07-15', '2024-07-16'],
        moduleRoute: '/irrigazione',
    }
];

// REFACTORED: Updated initial bookings with new status types.
export const initialBookings: Booking[] = [
    { id: 101, listingId: 2, renter: 'Mario Rossi', startDate: '2024-07-05', endDate: '2024-07-07', totalPrice: 270, status: 'Accettata' },
    { id: 102, listingId: 1, renter: 'Mario Rossi', startDate: '2024-06-20', endDate: '2024-06-22', totalPrice: 540, status: 'Completata' },
];
