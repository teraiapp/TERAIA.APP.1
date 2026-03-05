
export type CollectiveCategory = 'fitopatie' | 'meteo' | 'irrigazione' | 'nutrizione' | 'benessere animale' | 'norme';
export type EvidenceLevel = 'bassa' | 'media' | 'alta';

export interface CollectiveInsight {
    id: string;
    title: string;
    category: CollectiveCategory;
    region: string;
    province: string;
    city: string;
    period: string; // Es: "Settimana 24 - Giugno"
    evidence: EvidenceLevel;
    confidence: number;
    description: string;
    whatWorks: string;
    whatToAvoid: string;
    tags: string[];
    sources: string[];
    updatedAt: string;
}

export const INITIAL_COLLECTIVE_INSIGHTS: CollectiveInsight[] = [
    {
        id: 'coll-001',
        title: 'Attacco Peronospora su Vite precoce',
        category: 'fitopatie',
        region: 'Sicilia',
        province: 'PA',
        city: 'Tutte',
        period: 'Giugno 2024',
        evidence: 'alta',
        confidence: 92,
        description: 'Segnalato focolaio virulento causa umidità notturna anomala. Le foglie presentano macchie ad olio estese.',
        whatWorks: 'Trattamenti rameici tempestivi e defogliazione parziale per aerazione.',
        whatToAvoid: 'Irrigazione soprachioma nelle ore serali.',
        tags: ['Vite', 'Peronospora', 'Umidità'],
        sources: ['Segnalazioni aggregate (12)', 'Stazioni Meteo Locali'],
        updatedAt: new Date().toISOString()
    },
    {
        id: 'coll-002',
        title: 'Carenza Azoto post-piogge intense',
        category: 'nutrizione',
        region: 'Toscana',
        province: 'FI',
        city: 'Scandicci',
        period: 'Maggio 2024',
        evidence: 'media',
        confidence: 85,
        description: 'Dilavamento dei nutrienti segnalato su mais e cereali dopo le piogge della scorsa settimana.',
        whatWorks: 'Fertirrigazione di soccorso o concimazione fogliare rapida.',
        whatToAvoid: 'Lavorazioni profonde del terreno ancora saturo.',
        tags: ['Cereali', 'Azoto', 'Dilavamento'],
        sources: ['Analisi satellite Sentinel-2', 'Fitogest Insight'],
        updatedAt: new Date().toISOString()
    }
];
