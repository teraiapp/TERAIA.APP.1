
export interface RegionalDoc {
    region: string;
    year: string;
    sections: {
        crop: string;
        adversity: string;
        allowedActives: string[];
        forbiddenActives: string[];
        constraints: string;
        source: string;
    }[];
}

export const REGULATORY_DOCS: RegionalDoc[] = [
    {
        region: 'Puglia',
        year: '2025',
        sections: [
            {
                crop: 'Vite',
                adversity: 'peronospora',
                allowedActives: ['Rame (Solfato tribasico)', 'Mandipropamid', 'Metalaxil-m'],
                forbiddenActives: ['Mancozeb', 'Folpet'],
                constraints: 'Max 4kg Rame/ha/anno. Max 3 trattamenti/anno con Mandipropamid.',
                source: 'D.G.R. n. 142/2025 - Disciplinare Produzione Integrata Puglia'
            },
            {
                crop: 'Ulivo',
                adversity: 'mosca_olivo',
                allowedActives: ['Acetamiprid', 'Spinosad', 'Deltametrina'],
                forbiddenActives: ['Dimetoato'],
                constraints: 'Intervento solo al superamento soglia 5% drupe infette.',
                source: 'D.G.R. n. 142/2025 - Sezione Olivicoltura'
            }
        ]
    },
    {
        region: 'Toscana',
        year: '2024',
        sections: [
            {
                crop: 'Vite',
                adversity: 'peronospora',
                allowedActives: ['Rame (Idrossido)', 'Zoxamide', 'Dimetomorf'],
                forbiddenActives: ['Mancozeb'],
                constraints: 'Limitare l\'uso di Rame a 28kg/ha in 7 anni.',
                source: 'Disciplinare Produzione Integrata Regione Toscana v4.2'
            }
        ]
    }
];
