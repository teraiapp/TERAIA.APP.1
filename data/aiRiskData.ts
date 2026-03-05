
export type RiskLevel = 'basso' | 'medio' | 'alto' | 'critico';
export type RiskCategory = 'fitopatie' | 'meteo' | 'legale' | 'sicurezza';
export type RiskStatus = 'nuovo' | 'letto' | 'archiviato';

export interface AiRiskAlert {
    id: string;
    title: string;
    category: RiskCategory;
    level: RiskLevel;
    confidence: number;
    linkedUnitId: string;
    linkedUnitName: string;
    date: string;
    description: string;
    why: string; // Spiegazione logica AI
    sources: string[];
    status: RiskStatus;
    actions: { id: string; label: string; completed: boolean }[];
    draftText?: string;
}

export const INITIAL_RISK_ALERTS: AiRiskAlert[] = [
    {
        id: 'risk-2024-001',
        title: 'Allerta Peronospora Imminente',
        category: 'fitopatie',
        level: 'alto',
        confidence: 94,
        linkedUnitId: 'unit-1',
        linkedUnitName: 'Vigneto Nord',
        date: new Date().toISOString(),
        description: 'Le condizioni di umidità (85%) e temperatura (22°C) registrate nelle ultime 48h, incrociate con le previsioni di pioggia, indicano un rischio critico di infezione primaria.',
        why: 'L\'algoritmo ha rilevato la "Regola dei Tre Dieci" soddisfatta e confermata dai dati meteo locali.',
        sources: ['Stazione Meteo Locale', 'Disciplinare Regionale Toscana', 'Storico Aziendale'],
        status: 'nuovo',
        actions: [
            { id: 'a1', label: 'Ispezione visiva foglie basali', completed: false },
            { id: 'a2', label: 'Verifica scorte Rame in magazzino', completed: false },
            { id: 'a3', label: 'Pianifica trattamento entro 24h', completed: false }
        ],
        draftText: 'Si consiglia intervento preventivo con prodotto a base di Rame (es. Cuprofix) dose 2.5kg/ha causa alto rischio Peronospora rilevato da TeraIA.'
    },
    {
        id: 'risk-2024-002',
        title: 'Anomalia Termica: Stress Idrico',
        category: 'meteo',
        level: 'medio',
        confidence: 88,
        linkedUnitId: 'unit-2',
        linkedUnitName: 'Serra Pomodoro',
        date: new Date(Date.now() - 86400000).toISOString(),
        description: 'Temperature previste sopra i 34°C per 3 giorni consecutivi. Rischio di colpo di calore e caduta dei fiori.',
        why: 'Modello previsionale GFS indica ondata di calore sub-tropicale in arrivo sulla zona.',
        sources: ['Modello Meteo GFS', 'Sensori Umidità Terreno'],
        status: 'nuovo',
        actions: [
            { id: 'b1', label: 'Attivazione ombreggiamento', completed: false },
            { id: 'b2', label: 'Programmazione irrigazione notturna', completed: false }
        ]
    }
];
