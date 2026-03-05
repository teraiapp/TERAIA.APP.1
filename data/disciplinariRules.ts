
export interface DisciplinareRule {
    regione: string;
    coltura: string;
    principiAttiviConsentiti: string[];
    principiAttiviVietati: string[];
    limitiSpeciali?: string;
    riferimento: string;
}

export const DISCIPLINARI_RULES: DisciplinareRule[] = [
    {
        regione: 'Puglia',
        coltura: 'vite',
        principiAttiviConsentiti: ['Rame (Solfato tribasico)', 'Zolfo', 'Mandipropamid'],
        principiAttiviVietati: ['Mancozeb'],
        limitiSpeciali: 'Max 4kg Rame/ha/anno.',
        riferimento: 'Bollettino Ufficiale Regione Puglia 2024'
    },
    {
        regione: 'Toscana',
        coltura: 'vite',
        principiAttiviConsentiti: ['Rame (Solfato tribasico)', 'Zolfo'],
        principiAttiviVietati: ['Sistemici di sintesi extra-UE'],
        limitiSpeciali: 'Utilizzo di sistemici limitato a pre-fioritura.',
        riferimento: 'Disciplinare Produzione Integrata Toscana 2023'
    },
    {
        regione: 'Sicilia',
        coltura: 'ulivo',
        principiAttiviConsentiti: ['Rame (Solfato tribasico)', 'Lambda-cialotrina'],
        principiAttiviVietati: [],
        limitiSpeciali: 'Trattamenti insetticidi ammessi solo con soglia danno > 10%.',
        riferimento: 'PSR Sicilia 2023-2027'
    }
];
