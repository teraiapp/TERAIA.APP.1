
import { Role } from '../types';

export interface AiDecisionCard {
    id: string;
    title: string;
    context: string;
    situation: string;
    reason: string;
    risk: 'Basso' | 'Medio' | 'Alto';
    action: string;
    moduleRoute: string;
    category: 'Colture' | 'Sanità' | 'Economia' | 'Meteo' | 'Hardware';
    isRealData: boolean;
}

const getDaysDiff = (dateStr: string) => {
    const today = new Date();
    const target = new Date(dateStr);
    const diffTime = today.getTime() - target.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

export const buildInsightsForUnit = (unitId: string | number): AiDecisionCard[] => {
    const insights: AiDecisionCard[] = [];
    
    // FETCH DATA FROM STORAGE
    const campbook = JSON.parse(localStorage.getItem('teraia_campbook_entries_v1') || '[]');
    const irrigationLogs = JSON.parse(localStorage.getItem('teraia_irrigation_logs_v1') || '[]');
    const transactions = JSON.parse(localStorage.getItem('teraia_economia_transazioni_v1') || '[]');
    const units = JSON.parse(localStorage.getItem('teraia_production_units_v1') || '[]');
    
    const unit = units.find((u: any) => String(u.id) === String(unitId));
    if (!unit) return [];

    const unitEntries = campbook.filter((e: any) => String(e.unitId) === String(unitId));
    const unitIrrigations = irrigationLogs.filter((l: any) => String(l.unitId) === String(unitId));
    const unitTx = transactions.filter((t: any) => String(t.unitId) === String(unitId));

    // 1. ANALISI IRRIGAZIONE & METEO (Simulato temp > 25)
    const lastIrrigation = unitIrrigations[0]; // Già ordinati per data decrescente nel salvataggio
    const daysSinceIrrigation = lastIrrigation ? getDaysDiff(lastIrrigation.timestamp) : 99;
    
    if (daysSinceIrrigation > 3 && (unit.type === 'Serra' || unit.category === 'Ortaggi')) {
        insights.push({
            id: `dyn-irr-${unitId}`,
            title: 'Rischio Stress Idrico',
            context: unit.name,
            situation: `Nessuna irrigazione registrata negli ultimi ${daysSinceIrrigation} giorni.`,
            reason: "Le colture orticole in questa fase richiedono un apporto idrico costante per evitare cali produttivi o fisiopatie (es. marciume apicale).",
            risk: 'Alto',
            action: 'Avvia un ciclo di irrigazione manuale o programma un intervento.',
            moduleRoute: '/irrigazione',
            category: 'Meteo',
            isRealData: true
        });
    }

    // 2. ANALISI TRATTAMENTI (Fitopatologie)
    const lastTreatment = unitEntries.find((e: any) => e.type === 'trattamento');
    const daysSinceTreatment = lastTreatment ? getDaysDiff(lastTreatment.date) : 99;

    if (daysSinceTreatment > 12 && unit.category === 'Vigneto') {
        insights.push({
            id: `dyn-treat-${unitId}`,
            title: 'Copertura Fitosanitaria Scaduta',
            situation: `Ultimo trattamento registrato ${daysSinceTreatment} giorni fa.`,
            context: unit.name,
            reason: "La persistenza dei prodotti rameici o sistemici è limitata. Con le attuali condizioni di umidità, il rischio Peronospora è elevato.",
            risk: 'Medio',
            action: 'Registra un nuovo trattamento preventivo nel Quaderno.',
            moduleRoute: '/quaderno',
            category: 'Colture',
            isRealData: true
        });
    }

    // 3. ANALISI ECONOMICA (Margine Unità)
    const costs = unitTx.filter((t: any) => t.type === 'cost').reduce((acc: number, t: any) => acc + Math.abs(t.amount), 0);
    const revenues = unitTx.filter((t: any) => t.type === 'revenue').reduce((acc: number, t: any) => acc + t.amount, 0);
    
    if (costs > 0 && revenues === 0) {
        insights.push({
            id: `dyn-econ-${unitId}`,
            title: 'Analisi Investimento in Corso',
            situation: `Accumulati € ${costs.toFixed(2)} di costi senza ricavi ancora registrati.`,
            context: unit.name,
            reason: "L'unità è in fase di accumulo costi. È fondamentale tracciare ogni vendita futura per calcolare il ROI reale della coltura.",
            risk: 'Basso',
            action: 'Monitora il budget nel modulo Economia.',
            moduleRoute: '/economia',
            category: 'Economia',
            isRealData: true
        });
    }

    // 4. FALLBACK SE POCHI DATI (Demo context-aware)
    if (insights.length < 2) {
        insights.push({
            id: `demo-generic-${unitId}`,
            title: 'Ottimizzazione Resa',
            situation: "Dati storici limitati per un'analisi predittiva accurata.",
            context: unit.name,
            reason: "Inserendo più attività nel Quaderno di Campagna, l'AI potrà identificare correlazioni tra trattamenti e resa finale.",
            risk: 'Basso',
            action: 'Completa il profilo dell\'unità nel modulo Produzione.',
            moduleRoute: '/produzione',
            category: 'Colture',
            isRealData: false
        });
    }

    return insights.sort((a, b) => {
        const priority = { 'Alto': 0, 'Medio': 1, 'Basso': 2 };
        return priority[a.risk] - priority[b.risk];
    }).slice(0, 3);
};

// Manteniamo buildInsights per compatibilità con altre parti se necessario, 
// ma la nuova logica è buildInsightsForUnit
export const buildInsights = (role: Role | undefined): AiDecisionCard[] => {
    return []; // Deprecato in favore della versione per unità
};
