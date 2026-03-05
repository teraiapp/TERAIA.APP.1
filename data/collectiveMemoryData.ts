
export type SuccessLevel = 'risolto' | 'migliorato' | 'fallito';

export interface TechnicalCase {
    id: string;
    context: {
        unitType: string;
        cropOrSpecies: string;
        variety?: string;
        region: string;
        microzone?: string;
        period: string; // ISO Month
        phase: string;
    };
    problem: {
        key: string;
        label: string;
        type: 'malattia' | 'insetto' | 'carenza' | 'stress' | 'altro';
        description: string;
    };
    conditions: {
        weather: string;
        avgTemp: number;
        avgHumidity: number;
    };
    action: {
        type: string;
        details: string;
        productName?: string;
    };
    result: {
        level: SuccessLevel;
        daysToResult: number;
    };
    timestamp: string;
}

export interface NormalizedPattern {
    id: string;
    patternLabel: string;
    casesCount: number;
    avgSuccessRate: number; // 0-100
    topSolution: string;
    contextMatch: {
        crop: string;
        problem: string;
        region: string;
        phase: string;
    };
}

export const INITIAL_COLLECTIVE_CASES: TechnicalCase[] = [
    {
        id: 'case-1',
        context: {
            unitType: 'Serra',
            cropOrSpecies: 'Pomodoro',
            variety: 'Ciliegino',
            region: 'Sicilia',
            microzone: 'Pachino',
            period: '2023-09',
            phase: 'ingrossamento'
        },
        problem: {
            key: 'peronospora',
            label: 'Peronospora',
            type: 'malattia',
            description: 'Macchie giallastre sulla pagina superiore.'
        },
        conditions: { weather: 'Umido', avgTemp: 22, avgHumidity: 85 },
        action: { type: 'Trattamento', details: 'Cuprofix 30', productName: 'Cuprofix 30' },
        result: { level: 'risolto', daysToResult: 5 },
        timestamp: '2023-09-15T10:00:00Z'
    },
    {
        id: 'case-2',
        context: {
            unitType: 'Arboreto',
            cropOrSpecies: 'Vite',
            region: 'Toscana',
            period: '2024-05',
            phase: 'fioritura'
        },
        problem: {
            key: 'oidio',
            label: 'Oidio',
            type: 'malattia',
            description: 'Efflorescenza biancastra polverulenta.'
        },
        conditions: { weather: 'Soleggiato', avgTemp: 26, avgHumidity: 50 },
        action: { type: 'Trattamento', details: 'Zolfo Micro 80', productName: 'Zolfo Micro 80' },
        result: { level: 'risolto', daysToResult: 7 },
        timestamp: '2024-05-20T08:30:00Z'
    }
];
