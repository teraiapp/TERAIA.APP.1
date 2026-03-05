
export type AdCategory = 'Prodotti agricoli' | 'Animali' | 'Attrezzature' | 'Servizi' | 'Sensori/IoT';
export type AdStatus = 'attivo' | 'sospeso' | 'chiuso';
export type ProRole = 'Agronomo' | 'Veterinario' | 'Commercialista' | 'Tecnico impianti';
export type ConsultStatus = 'INVIATA' | 'ACCETTATA' | 'RIFIUTATA' | 'IN CORSO' | 'CHIUSA';
export type UrgencyLevel = 'bassa' | 'media' | 'alta';

export interface MarketAd {
    id: string;
    ownerId: string;
    ownerName: string;
    title: string;
    category: AdCategory;
    price: number;
    quantity?: string;
    region: string;
    province: string;
    city: string;
    description: string;
    status: AdStatus;
    images: string[];
    isNew: boolean;
    createdAt: string;
}

export interface Professional {
    id: string;
    name: string;
    role: ProRole;
    rating: number;
    bio: string;
    areaServed: string;
    region: string;
    province: string;
    onlineConsultation: boolean;
    services: string[];
    pricing: string;
    image: string;
}

export interface ConsultationRequest {
    id: string;
    userId: string;
    proId: string;
    proName: string;
    proRole: ProRole;
    reason: string;
    relatedModule: string; // Es: "/quaderno-campagna"
    urgency: UrgencyLevel;
    preference: 'online' | 'presenza';
    status: ConsultStatus;
    unitId?: string;
    notes?: string;
    date: string;
}

export const INITIAL_MARKET_ADS: MarketAd[] = [
    {
        id: 'ad-1',
        ownerId: 'user-45',
        ownerName: 'Agricola Verde',
        title: 'Motopompa Caprari 10HP',
        category: 'Attrezzature',
        price: 850,
        region: 'Puglia',
        province: 'BA',
        city: 'Altamura',
        description: 'Usata pochissimo, perfettamente funzionante. Ideale per piccoli invasi.',
        status: 'attivo',
        images: ['⚙️'],
        isNew: true,
        createdAt: '2024-06-01T09:00:00Z'
    },
    {
        id: 'ad-2',
        ownerId: 'user-88',
        ownerName: 'Stalla San Giuseppe',
        title: 'Lotto 10 Vitelli Limousine',
        category: 'Animali',
        price: 12000,
        quantity: '10 capi',
        region: 'Veneto',
        province: 'VR',
        city: 'Verona',
        description: 'Vitelli svezzati, certificati, ottima genetica.',
        status: 'attivo',
        images: ['🐄'],
        isNew: false,
        createdAt: '2024-05-15T10:30:00Z'
    }
];

export const INITIAL_PROS_V3: Professional[] = [
    {
        id: 'pro-1',
        name: 'Dott. Marco Bianchi',
        role: 'Agronomo',
        rating: 4.9,
        bio: 'Specializzato in viticoltura ed olivicoltura biologica con 15 anni di esperienza.',
        areaServed: 'Centro-Sud Italia',
        region: 'Toscana',
        province: 'FI',
        onlineConsultation: true,
        services: ['Piani di concimazione', 'Gestione fitopatologie', 'Pratiche PSR'],
        pricing: 'A partire da 80€/h',
        image: '👨‍🌾'
    },
    {
        id: 'pro-2',
        name: 'Dr.ssa Sara Neri',
        role: 'Veterinario',
        rating: 5.0,
        bio: 'Esperta in benessere animale e gestione stalle bovine da latte 4.0.',
        areaServed: 'Nord Italia',
        region: 'Lombardia',
        province: 'MI',
        onlineConsultation: true,
        services: ['Piani vaccinali', 'Check-up benessere', 'Audit biosicurezza'],
        pricing: 'Su preventivo',
        image: '👩‍⚕️'
    }
];
