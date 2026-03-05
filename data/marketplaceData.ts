
// Added React import to fix namespace error
import React from 'react';
import { Sprout, UserCheck, Stethoscope, Briefcase, Atom, Tractor } from 'lucide-react';

// REFACTORED: More specific categories for the functional marketplace.
export type OfferCategory =
    | 'Vivai / Piantine'
    | 'Concimi & Prodotti'
    | 'Servizi Agronomici'
    | 'Servizi Veterinari'
    | 'Consulenza Fiscale'
    | 'Attrezzature'
    | 'Altro';

export type PriceType = 'fisso' | 'ora' | 'ettaro' | 'giorno' | 'preventivo';
export type RequestStatus = 'Inviata' | 'In risposta' | 'Accettata' | 'Rifiutata';

// REFACTORED: Expanded the offer structure to be fully functional.
export interface MarketplaceOffer {
    id: number;
    title: string;
    category: OfferCategory;
    provider: string;
    location: string;
    description: string;
    price: number;
    priceType: PriceType;
    contact: {
        phone: string;
        email: string;
        whatsapp: string;
    };
    icon: React.ElementType;
    moduleRoute?: string;
}

// NEW: Added a type for user requests.
export interface MarketplaceRequest {
    id: number;
    offerId: number;
    requestDate: string; // ISO String
    status: RequestStatus;
    userMessage: string;
    urgency: 'Normale' | 'Urgente';
}


// REFACTORED: Updated initial offers to serve as a robust default for localStorage.
export const initialMarketplaceOffers: MarketplaceOffer[] = [
    {
        id: 1,
        title: 'Piantine di Pomodoro "Ercole F1"',
        category: 'Vivai / Piantine',
        provider: 'Vivaio "Il Germoglio"',
        location: 'Verona (VR)',
        description: 'Piantine da orto biologiche e certificate, varietà Ercole F1. Resistenti a virosi e ad alta produttività.',
        price: 0.50,
        priceType: 'fisso', // Prezzo per piantina
        contact: { phone: '+393331234567', email: 'info@ilgermoglio.it', whatsapp: '393331234567' },
        icon: Sprout,
        moduleRoute: '/ordini',
    },
    {
        id: 2,
        title: 'Servizio Potatura Agrumi',
        category: 'Servizi Agronomici',
        provider: 'Dott. Agr. Mario Rossi',
        location: 'Bari (BA)',
        description: 'Servizio professionale di potatura per agrumeti, eseguito da agronomo specializzato per massimizzare produzione e salute della pianta.',
        price: 50,
        priceType: 'ora',
        contact: { phone: '+393337654321', email: 'mario.rossi@agronomo.it', whatsapp: '393337654321' },
        icon: UserCheck,
    },
    {
        id: 3,
        title: 'Visita Veterinaria Allevamento Avicolo',
        category: 'Servizi Veterinari',
        provider: 'Clinica "San Francesco"',
        location: 'Milano (MI)',
        description: 'Controllo sanitario completo per allevamenti avicoli, inclusi piani vaccinali e consulenza su biosicurezza.',
        price: 0,
        priceType: 'preventivo',
        contact: { phone: '+393339876543', email: 'info@clinicasanfrancesco.vet', whatsapp: '393339876543' },
        icon: Stethoscope,
    },
    {
        id: 4,
        title: 'Concime Organico Pellettato',
        category: 'Concimi & Prodotti',
        provider: 'Agraria Rossi S.R.L.',
        location: 'Palermo (PA)',
        description: 'Concime organico di alta qualità, ideale per orticoltura e frutticoltura biologica. Sacchi da 25kg.',
        price: 15,
        priceType: 'fisso', // Prezzo a sacco
        contact: { phone: '+393331122334', email: 'ordini@agrariarossi.com', whatsapp: '393331122334' },
        icon: Atom,
        moduleRoute: '/ordini',
    },
    {
        id: 5,
        title: 'Noleggio Atomizzatore 1000L',
        category: 'Attrezzature',
        provider: 'Noleggi "AgriRent"',
        location: 'Bologna (BO)',
        description: 'Noleggio atomizzatore trainato da 1000 litri, perfetto per trattamenti su vigneti e frutteti. Manutenzione inclusa.',
        price: 90,
        priceType: 'giorno',
        contact: { phone: '+393335566778', email: 'info@agrirent.it', whatsapp: '393335566778' },
        icon: Tractor,
        moduleRoute: '/noleggi',
    }
];

// NEW: Added initial data for user requests for localStorage.
export const initialMarketplaceRequests: MarketplaceRequest[] = [
    {
        id: 101,
        offerId: 2,
        requestDate: new Date(Date.now() - 86400000 * 2).toISOString(),
        status: 'In risposta',
        userMessage: 'Avrei bisogno di un preventivo per la potatura di circa 2 ettari di aranceto.',
        urgency: 'Normale',
    }
];
