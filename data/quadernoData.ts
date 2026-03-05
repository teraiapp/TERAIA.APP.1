
// --- REFACTORED DATA STRUCTURE ---

export type CampBookEntryType = 'trattamento' | 'fertilizzazione' | 'irrigazione' | 'lavorazione' | 'raccolta' | 'nota';
export type UnitType = 'Campo' | 'Serra' | 'Arboreto' | 'Altro';

export interface ProductionUnit {
    id: string | number;
    name: string;
    defaultCrop: string;
}

// Details for each entry type
export interface TreatmentDetails {
    product: string;
    dose: string;
    waterVolume?: string;
    adversity: string;
    reason: string;
    operator: string;
    safetyIntervalDays: number;
}
export interface FertilizationDetails {
    product: string;
    dose: string;
    method: 'Fertirrigazione' | 'Fogliare' | 'Al suolo' | 'Altro';
}
export interface IrrigationDetails {
    zone?: string;
    durationMinutes: number;
    method: 'Goccia' | 'Aspersione' | 'Nebulizzazione' | 'Altro';
}
export interface TillageDetails {
    operation: 'Aratura' | 'Erpicatura' | 'Fresatura' | 'Sfalcio' | 'Trinciatura' | 'Altro';
    machinery: string;
    operator?: string;
}
export interface HarvestDetails {
    product: string;
    quantityKg: number;
    quality?: string;
    destination: 'Vendita' | 'Autoconsumo' | 'Magazzino';
}
export interface NoteDetails {
    title: string;
    text: string;
}

export interface CampBookEntry {
    id: string;
    unitId: string | number; // Collegamento obbligatorio all'unità
    type: CampBookEntryType;
    date: string; // ISO String for date
    unitType: UnitType;
    unitName: string;
    crop: string;
    details: TreatmentDetails | FertilizationDetails | IrrigationDetails | TillageDetails | HarvestDetails | NoteDetails;
    notes?: string;
    createdAt: string; // ISO String
    updatedAt: string; // ISO String
}


// --- MOCK DATA FOR LOCALSTORAGE INITIALIZATION ---
export const initialUnits: ProductionUnit[] = [
    { id: 1, name: 'Campo Grande', defaultCrop: 'Grano Duro' },
    { id: 2, name: 'Serra Pomodori', defaultCrop: 'Pomodoro San Marzano' },
    { id: 3, name: 'Uliveto Vecchio', defaultCrop: 'Ulivo' },
];

export const initialCampBookEntries: CampBookEntry[] = [];
