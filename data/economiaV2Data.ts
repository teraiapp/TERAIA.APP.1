
export type MovementType = 'costo' | 'ricavo';
export type MovementCategory = 'Sementi' | 'Fertilizzanti' | 'Carburante' | 'Manodopera' | 'Veterinario' | 'Vendita' | 'Contributi' | 'Altro';
export type DocumentStatus = 'archiviato' | 'da_elaborare' | 'registrato';

export interface Movement {
    id: string;
    date: string;
    type: MovementType;
    category: MovementCategory;
    amount: number;
    description: string;
    linkedAsset?: string; // Es: "Campo Nord" o "Stalla A"
    accountingNote?: string; // Solo per Commercialista
    documentId?: string;
    method: 'manuale' | 'ocr';
}

export interface AgriDocument {
    id: string;
    name: string;
    uploadDate: string;
    type: 'fattura' | 'scontrino' | 'contratto';
    status: DocumentStatus;
    fileSize: string;
    extractedData?: {
        amount: number;
        date: string;
        category: MovementCategory;
    };
}

export const INITIAL_MOVEMENTS: Movement[] = [
    {
        id: 'mv-1',
        date: '2024-10-20',
        type: 'costo',
        category: 'Carburante',
        amount: 450.00,
        description: 'Rifornimento Trattore JD',
        linkedAsset: 'Campi Aperti',
        method: 'manuale'
    },
    {
        id: 'mv-2',
        date: '2024-10-22',
        type: 'ricavo',
        category: 'Vendita',
        amount: 12500.00,
        description: 'Vendita Lotto Grano Duro',
        linkedAsset: 'Campo Nord',
        method: 'ocr'
    }
];

export const INITIAL_DOCUMENTS: AgriDocument[] = [
    {
        id: 'doc-1',
        name: 'Fattura_Gasolio_Ott.pdf',
        uploadDate: '2024-10-20',
        type: 'fattura',
        status: 'registrato',
        fileSize: '1.2 MB'
    }
];
