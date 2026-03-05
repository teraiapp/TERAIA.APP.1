
export interface FitogestProduct {
    id: string;
    name: string;
    activeIngredient: string;
    crops: string[];
    adversities: string[];
    dose: string;
    phiDays: number; // Tempo carenza
    isBio: boolean;
    safetyNotes: string;
}

export const FITOGEST_CATALOG: FitogestProduct[] = [
    {
        id: 'fg-001',
        name: 'Cuprofix 30 Disperss',
        activeIngredient: 'Rame (Solfato tribasico)',
        crops: ['Vite', 'Ulivo', 'Pomodoro'],
        adversities: ['peronospora', 'occhio_pavone'],
        dose: '2.5 - 3.5 kg/ha',
        phiDays: 20,
        isBio: true,
        safetyNotes: 'Indossare guanti protettivi. Tossico per organismi acquatici.'
    },
    {
        id: 'fg-002',
        name: 'Revus',
        activeIngredient: 'Mandipropamid',
        crops: ['Vite', 'Patata', 'Pomodoro'],
        adversities: ['peronospora'],
        dose: '0.6 L/ha',
        phiDays: 21,
        isBio: false,
        safetyNotes: 'Resistente al dilavamento dopo 1 ora.'
    },
    {
        id: 'fg-003',
        name: 'Karate Zeon',
        activeIngredient: 'Deltametrina',
        crops: ['Ulivo', 'Melo', 'Mais'],
        adversities: ['mosca_olivo', 'afidi', 'piralide'],
        dose: '0.15 - 0.25 L/ha',
        phiDays: 7,
        isBio: false,
        safetyNotes: 'Molto tossico per le api. Non usare in fioritura.'
    },
    {
        id: 'fg-004',
        name: 'Mancothane',
        activeIngredient: 'Mancozeb',
        crops: ['Vite', 'Patata'],
        adversities: ['peronospora'],
        dose: '2 kg/ha',
        phiDays: 28,
        isBio: false,
        safetyNotes: 'Prodotto con restrizioni UE severe.'
    }
];
