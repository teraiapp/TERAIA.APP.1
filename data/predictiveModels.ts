
export type RiskLevel = 'basso' | 'medio' | 'alto';

export interface RiskThresholds {
    id: string;
    target: string; // Es: "Peronospora", "Stress Idrico"
    triggers: {
        avgTempRange: [number, number];
        humidityThreshold: number;
        consecutiveRainDays?: number;
        windThreshold?: number;
    };
    preventionActions: {
        agronomic: string;
        irrigation?: string;
        nutritional?: string;
        phytosanitary?: string;
    };
}

export const PREDICTIVE_MODELS: RiskThresholds[] = [
    {
        id: 'risk-peronospora-vite',
        target: 'Peronospora',
        triggers: {
            avgTempRange: [18, 25],
            humidityThreshold: 80,
            consecutiveRainDays: 2
        },
        preventionActions: {
            agronomic: 'Ispezionare i germogli basali. Favorire aerazione chioma.',
            phytosanitary: 'Trattamento preventivo con prodotti rameici (Rif. Fitogest).'
        }
    },
    {
        id: 'risk-stress-idrico',
        target: 'Stress Idrico',
        triggers: {
            avgTempRange: [28, 40],
            humidityThreshold: 30,
        },
        preventionActions: {
            agronomic: 'Evitare lavorazioni del terreno per non disperdere umidità.',
            irrigation: 'Ciclo di soccorso notturno (30 min) per abbassare temp radicale.',
            nutritional: 'Applicazione fogliare di biostimolanti (Alghe/Amminoacidi).'
        }
    },
    {
        id: 'risk-oidio-pomodoro',
        target: 'Oidio (Mal Bianco)',
        triggers: {
            avgTempRange: [20, 30],
            humidityThreshold: 50,
        },
        preventionActions: {
            agronomic: 'Rimuovere foglie infette se localizzate.',
            phytosanitary: 'Zolfo ventilato o bicarbonato di potassio ammesso BIO.'
        }
    }
];
