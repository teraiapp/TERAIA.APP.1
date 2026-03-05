
export interface Product {
    id: string;
    name: string;
    activeIngredients: string[];
    phiDays?: number;
    reiHours?: number;
    authorizedOn: string[];
    organic: boolean;
    doses: string;
    priceLevel: 1 | 2 | 3; // 1: Economico, 3: Premium
    sustainabilityScore: number; // 0-100
    collectiveSuccessRate: number; // 0-100 (Memoria Collettiva)
    source: string;
}

export interface DisciplinareRule {
    region: string;
    crop: string;
    adversity: string;
    allowedActiveIngredients: string[];
    restrictions: string[];
    notes: string;
    forbiddenPhases: string[]; // Fasi in cui il prodotto è vietato
    sourceRef: string;
}

export const PRODUCTS: Product[] = [
    {
        id: 'p-1',
        name: 'Cuprofix 30',
        activeIngredients: ['Rame'],
        phiDays: 20,
        reiHours: 24,
        authorizedOn: ['Vite', 'Olivo', 'Pomodoro'],
        organic: true,
        doses: '2.5 kg/ha',
        priceLevel: 1,
        sustainabilityScore: 85,
        collectiveSuccessRate: 92,
        source: 'Fitogest (Standard)'
    },
    {
        id: 'p-2',
        name: 'Zolfo Micro 80',
        activeIngredients: ['Zolfo'],
        phiDays: 5,
        reiHours: 12,
        authorizedOn: ['Vite', 'Pomodoro', 'Fruttiferi'],
        organic: true,
        doses: '4-6 kg/ha',
        priceLevel: 1,
        sustainabilityScore: 90,
        collectiveSuccessRate: 88,
        source: 'Fitogest (Standard)'
    },
    {
        id: 'p-3',
        name: 'Revus',
        activeIngredients: ['Mandipropamid'],
        phiDays: 21,
        reiHours: 48,
        authorizedOn: ['Vite', 'Patata'],
        organic: false,
        doses: '0.6 L/ha',
        priceLevel: 2,
        sustainabilityScore: 45,
        collectiveSuccessRate: 95,
        source: 'Syngenta (Label)'
    },
    {
        id: 'p-4',
        name: 'Bacillus Thuringiensis K',
        activeIngredients: ['Bacillus Thuringiensis'],
        phiDays: 3,
        reiHours: 6,
        authorizedOn: ['Vite', 'Orticole', 'Fruttiferi'],
        organic: true,
        doses: '1.5 kg/ha',
        priceLevel: 3,
        sustainabilityScore: 98,
        collectiveSuccessRate: 84,
        source: 'BioLine (Standard)'
    }
];

export const DISCIPLINARI: DisciplinareRule[] = [
    {
        region: 'Puglia',
        crop: 'Vite',
        adversity: 'Peronospora',
        allowedActiveIngredients: ['Rame', 'Mandipropamid', 'Metiram'],
        restrictions: ['Massimo 4kg/ha di Rame metallo all\'anno.', 'Non superare 3 trattamenti con Mandipropamid per stagione.'],
        forbiddenPhases: ['fioritura'],
        notes: 'In caso di piogge insistenti, preferire sistemici.',
        sourceRef: 'Bollettino Regionale Puglia 2024'
    },
    {
        region: 'Toscana',
        crop: 'Vite',
        adversity: 'Oidio',
        allowedActiveIngredients: ['Zolfo', 'Penconazolo', 'Bicarbonato di Potassio'],
        restrictions: ['Zolfo sconsigliato con temperature > 32°C.'],
        forbiddenPhases: ['dormienza'],
        notes: 'Alternare i principi attivi per evitare resistenze.',
        sourceRef: 'Disciplinare Produzione Integrata Toscana 2023'
    }
];
