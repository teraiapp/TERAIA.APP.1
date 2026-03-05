
export interface FitogestProduct {
    id: string;
    nome: string;
    principiAttivi: string[];
    formulazione: string;
    coltureConsentite: string[];
    avversitaConsentite: string[];
    doseMin: number; // g/ha o ml/ha
    doseMax: number;
    unitaMisura: string;
    carenzaGiorni: number;
    maxTrattamentiAnno: number;
    intervalloSicurezzaGiorni: number;
    bio: boolean;
    pericolo: 'Attenzione' | 'Pericolo' | 'Nessuno';
    linkScheda: string;
    tags: string[];
}

export const PRODUCTS_CATALOG: FitogestProduct[] = [
    {
        id: 'fg-001',
        nome: 'Cuprofix 30 Disperss',
        principiAttivi: ['Rame (Solfato tribasico)'],
        formulazione: 'Granuli idrodispersibili',
        coltureConsentite: ['vite', 'pomodoro', 'ulivo', 'melo'],
        avversitaConsentite: ['peronospora', 'occhio_pavone'],
        doseMin: 2000,
        doseMax: 3500,
        unitaMisura: 'g/ha',
        carenzaGiorni: 20,
        maxTrattamentiAnno: 4,
        intervalloSicurezzaGiorni: 10,
        bio: true,
        pericolo: 'Attenzione',
        linkScheda: '#',
        tags: ['Rameici', 'Contatto']
    },
    {
        id: 'fg-002',
        nome: 'Zolfo Micro 80',
        principiAttivi: ['Zolfo'],
        formulazione: 'Polvere bagnabile',
        coltureConsentite: ['vite', 'pomodoro', 'melo'],
        avversitaConsentite: ['oidio'],
        doseMin: 4000,
        doseMax: 6000,
        unitaMisura: 'g/ha',
        carenzaGiorni: 5,
        maxTrattamentiAnno: 8,
        intervalloSicurezzaGiorni: 7,
        bio: true,
        pericolo: 'Nessuno',
        linkScheda: '#',
        tags: ['Antioidici', 'Sostanza pura']
    },
    {
        id: 'fg-003',
        nome: 'Revus',
        principiAttivi: ['Mandipropamid'],
        formulazione: 'Sospensione concentrata',
        coltureConsentite: ['vite', 'pomodoro', 'patata'],
        avversitaConsentite: ['peronospora'],
        doseMin: 600,
        doseMax: 600,
        unitaMisura: 'ml/ha',
        carenzaGiorni: 21,
        maxTrattamentiAnno: 3,
        intervalloSicurezzaGiorni: 12,
        bio: false,
        pericolo: 'Attenzione',
        linkScheda: '#',
        tags: ['Sistemici', 'Elevata persistenza']
    },
    {
        id: 'fg-004',
        nome: 'Karate Zeon',
        principiAttivi: ['Lambda-cialotrina'],
        formulazione: 'Sospensione di capsule',
        coltureConsentite: ['ulivo', 'melo', 'pesco', 'vite'],
        avversitaConsentite: ['mosca_olivo', 'tignola', 'afidi'],
        doseMin: 150,
        doseMax: 250,
        unitaMisura: 'ml/ha',
        carenzaGiorni: 7,
        maxTrattamentiAnno: 2,
        intervalloSicurezzaGiorni: 15,
        bio: false,
        pericolo: 'Pericolo',
        linkScheda: '#',
        tags: ['Insetticidi', 'Piretroide']
    }
];
