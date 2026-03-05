
export type Specie = 'Bovini' | 'Ovini' | 'Caprini' | 'Suini' | 'Avicoli' | 'Equini' | 'Altro';
export type MetodoAllevamento = 'Intensivo' | 'Estensivo' | 'Biologico';
export type TipoAnimale = 'Individuale' | 'Gruppo';
export type StatoAnimale = 'Attivo' | 'Venduto' | 'Deceduto';
export type TipoEvento = 'Nascita' | 'Acquisto' | 'Vendita' | 'Spostamento' | 'Mortalità' | 'Trattamento' | 'Visita' | 'Altro';
export type StatoScadenza = 'Da fare' | 'Completata';
export type CategoriaScadenza = 'Sanitaria' | 'HACCP' | 'Registri' | 'Vaccinazioni' | 'Altro';

export interface RegistroSanitario {
    id: string;
    date: string;
    type: 'vaccinazione' | 'trattamento' | 'controllo';
    description: string;
    veterinarioId?: string;
}

export interface Allevamento {
    id: string;
    name: string;
    species: Specie;
    method: MetodoAllevamento;
    location: string;
    notes?: string;
}

export interface Animale {
    id: string;
    allevamentoId: string;
    identifier: string; 
    type: TipoAnimale;
    species?: Specie; // Added for specific identification
    count?: number; 
    entryDate: string;
    origin: string;
    status: StatoAnimale;
    healthRecords: RegistroSanitario[];
    notes?: string;
}

export interface EventoAllevamento {
    id: string;
    allevamentoId: string;
    animaleId: string;
    date: string;
    type: TipoEvento;
    notes?: string;
    economicValue?: number;
}

export interface ScadenzaAllevamento {
    id: string;
    allevamentoId: string;
    date: string;
    description: string;
    category: CategoriaScadenza;
    status: StatoScadenza;
}

export interface PianoAlimentare {
    id: string;
    allevamentoId: string;
    feedType: string;
    period: string; 
    quantity?: string;
    notes?: string;
}

export const initialAllevamenti: Allevamento[] = [
    { id: 'allev-1', name: 'Bovini da Latte', species: 'Bovini', method: 'Intensivo', location: 'Stalla Principale' }
];

export const initialAnimali: Animale[] = [
    { id: 'anim-1', allevamentoId: 'allev-1', identifier: 'IT021003456789', type: 'Individuale', species: 'Bovini', entryDate: '2023-01-15', origin: 'Nato in azienda', status: 'Attivo', healthRecords: [] },
    { id: 'anim-3', allevamentoId: 'allev-1', identifier: 'Manze Svezzamento', type: 'Gruppo', species: 'Bovini', count: 15, entryDate: '2024-05-01', origin: 'Gruppo interno', status: 'Attivo', healthRecords: [] },
];

export const initialEventi: EventoAllevamento[] = [
    { id: 'evt-1', allevamentoId: 'allev-1', animaleId: 'anim-1', date: '2023-01-15', type: 'Nascita' },
];

export const initialScadenze: ScadenzaAllevamento[] = [
    { id: 'scad-1', allevamentoId: 'allev-1', date: new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0], description: 'Controllo trimestrale registro stalla', category: 'Registri', status: 'Da fare' },
];

export const initialPianiAlimentari: PianoAlimentare[] = [
    { id: 'pa-1', allevamentoId: 'allev-1', feedType: 'Unifeed Lattazione', period: 'Tutto l\'anno', quantity: '40 kg/capo/giorno', notes: 'Miscelata bilanciata.' }
];
