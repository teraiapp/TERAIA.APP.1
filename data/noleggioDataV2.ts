
export type RentalCategory = 'trattore' | 'trincia' | 'atomizzatore' | 'drone' | 'sensori' | 'pompe' | 'generatori' | 'altro';
export type RentalStatus = 'IN ATTESA' | 'ACCETTATO' | 'RIFIUTATO' | 'IN CORSO' | 'CHIUSO';
export type DeliveryMode = 'ritiro' | 'consegna' | 'entrambi';

export interface RentListing {
    id: string;
    ownerId: string;
    ownerName: string;
    title: string;
    category: RentalCategory;
    description: string;
    pricePerDay: number;
    hasDeposit: boolean;
    depositAmount: number;
    region: string;
    province: string;
    city: string;
    deliveryMode: DeliveryMode;
    images: string[];
    createdAt: string;
}

export interface RentRequest {
    id: string;
    listingId: string;
    listingTitle: string;
    renterId: string;
    renterName: string;
    ownerId: string;
    startDate: string;
    endDate: string;
    status: RentalStatus;
    totalPrice: number;
    deliveryChoice: 'ritiro' | 'consegna';
    notes?: string;
    timestamp: string;
}

export const INITIAL_RENT_LISTINGS: RentListing[] = [
    {
        id: 'list-1',
        ownerId: '8', // Admin per demo
        ownerName: 'TeraIA Demo Owner',
        title: 'Trattore New Holland T6 175',
        category: 'trattore',
        description: 'Trattore in ottime condizioni, 175CV, ideale per trasporti e aratura leggera. Gancio D3 incluso.',
        pricePerDay: 150,
        hasDeposit: true,
        depositAmount: 500,
        region: 'Puglia',
        province: 'BA',
        city: 'Altamura',
        deliveryMode: 'entrambi',
        images: ['🚜'],
        createdAt: '2024-01-01T10:00:00Z'
    },
    {
        id: 'list-2',
        ownerId: 'user-99',
        ownerName: 'Agricola Rossi',
        title: 'Drone DJI Agras T30',
        category: 'drone',
        description: 'Drone per irrorazione di precisione. Richiesto patentino aeronautico valido per l\'uso.',
        pricePerDay: 250,
        hasDeposit: true,
        depositAmount: 1200,
        region: 'Veneto',
        province: 'VR',
        city: 'Verona',
        deliveryMode: 'ritiro',
        images: ['🚁'],
        createdAt: '2024-02-01T10:00:00Z'
    }
];
