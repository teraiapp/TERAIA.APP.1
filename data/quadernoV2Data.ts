
export type EventType = 'trattamento' | 'irrigazione' | 'fertilizzazione' | 'lavorazione' | 'raccolta' | 'nota';
export type EventSource = 'manuale' | 'AI Trattamenti' | 'Irrigazione' | 'Sensori';
export type EventStatus = 'bozza' | 'confermato';

export interface ProductUsage {
    name: string;
    dose: string;
    unit: string;
}

export interface QuadernoEvent {
    id: string;
    date: string;
    type: EventType;
    unitId: string;
    unitName: string;
    crop: string;
    description: string;
    products?: ProductUsage[];
    waterVolume?: number; // m3
    operator: string;
    notes?: string;
    source: EventSource;
    status: EventStatus;
    externalId?: string; // ID originale del modulo sorgente
}

export const INITIAL_QUADERNO_EVENTS: QuadernoEvent[] = [
    {
        id: 'q-1',
        date: new Date().toISOString().split('T')[0],
        type: 'trattamento',
        unitId: 'unit-1',
        unitName: 'Vigneto Nord',
        crop: 'Vite (Chardonnay)',
        description: 'Trattamento anti-peronospora preventivo',
        products: [{ name: 'Cuprofix 30', dose: '2.5', unit: 'kg/ha' }],
        operator: 'Mario Rossi',
        source: 'AI Trattamenti',
        status: 'confermato',
        notes: 'Rif: D.G.R. n. 142/2025'
    }
];
