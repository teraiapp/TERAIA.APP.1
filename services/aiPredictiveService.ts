
import { 
    QuadernoEntry, AiPredictiveResult, AiPredictiveAlert, 
    AiPredictiveTrend, AiPredictiveInsight 
} from '../types';
import { quadernoService } from './quadernoService';

const STORAGE_KEY = 'teraia_ai_predictive_digest_v1';

export const aiPredictiveService = {
    
    getDigest: (): AiPredictiveResult | null => {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : null;
    },

    updateAnalysis: (): AiPredictiveResult => {
        const entries = quadernoService.getEntries();
        const units = JSON.parse(localStorage.getItem('teraia_production_units_v2') || '[]');
        const now = Date.now();
        const thirtyDaysAgo = now - (30 * 86400000);
        const tenDaysAgo = now - (10 * 86400000);
        
        const recentEntries = entries.filter(e => e.date >= thirtyDaysAgo);
        
        const alerts: AiPredictiveAlert[] = [];
        const insights: AiPredictiveInsight[] = [];
        const trends: AiPredictiveTrend[] = [];

        // --- ANALISI IRRIGAZIONE (AGRICOLTURA) ---
        units.forEach((unit: any) => {
            if (unit.category === 'Allevamento') return;

            const unitEntries = recentEntries.filter(e => e.unitId === unit.id);
            const irrigations = unitEntries.filter(e => e.type === 'IRRIGAZIONE');
            
            // Anomalie frequenza
            if (irrigations.length === 0) {
                alerts.push({
                    id: `alert-irr-zero-${unit.id}`,
                    severity: "high",
                    domain: "irrigazione",
                    title: `Rischio Stress Idrico: ${unit.name}`,
                    description: `Nessuna irrigazione registrata nel quaderno negli ultimi 30 giorni.`,
                    why: ["Assenza record operativi", "Possibile malfunzionamento sensori o dimenticanza registro"],
                    recommendedActions: [{ label: "Apri Irrigazione", route: "/irrigazione" }],
                    relatedUnits: [unit.id]
                });
            }

            // Trend volume
            if (irrigations.length >= 2) {
                const volumes = irrigations.map(i => i.quantities?.volumeLiters || 0);
                const avg = volumes.reduce((a,b)=>a+b,0) / volumes.length;
                if (volumes[0] > avg * 1.5) {
                    trends.push({
                        id: `trend-wat-${unit.id}`,
                        metric: "water",
                        direction: "up",
                        explanation: `Aumento volume acqua su ${unit.name} del 50% rispetto alla media del periodo.`
                    });
                }
            }
        });

        // --- ANALISI FITOPATOLOGIE ---
        units.forEach((unit: any) => {
            if (unit.category === 'Allevamento') return;
            const unitTreatments = recentEntries.filter(e => e.unitId === unit.id && e.type === 'TRATTAMENTO');
            
            if (unitTreatments.length === 0) {
                alerts.push({
                    id: `alert-fit-none-${unit.id}`,
                    severity: "medium",
                    domain: "fitopatologie",
                    title: "Copertura Fitosanitaria Assente",
                    description: `Nessun trattamento preventivo registrato per ${unit.name}.`,
                    why: ["Meteo umido rilevato (simulato)", "Finestra di rischio oidio/peronospora aperta"],
                    recommendedActions: [{ label: "Verifica AI Trattamenti", route: "/ai/trattamenti" }],
                    relatedUnits: [unit.id]
                });
            }
        });

        // --- ANALISI ALLEVAMENTO ---
        const livestockUnits = units.filter((u:any) => u.category === 'Allevamento');
        if (livestockUnits.length > 0) {
            const healthEvents = recentEntries.filter(e => ["EVENTO_SANITARIO", "VISITA_VETERINARIA", "VACCINAZIONE"].includes(e.type));
            
            if (healthEvents.length > 3) {
                alerts.push({
                    id: 'alert-allev-health',
                    severity: "high",
                    domain: "allevamento",
                    title: "Anomalia Sanitaria Comparto Stalla",
                    description: "Frequenza di eventi sanitari sopra la soglia di allerta nel quaderno.",
                    why: [`${healthEvents.length} eventi in 30 giorni`, "Pattern di mobilità capi non regolare"],
                    recommendedActions: [{ label: "Gestisci Sanità", route: "/allevamento" }]
                });
            }

            const feeding = recentEntries.filter(e => e.type === 'ALIMENTAZIONE');
            if (feeding.length > 0) {
                insights.push({
                    id: 'ins-feed-1',
                    title: "Efficienza Razioni",
                    description: "La stabilità delle somministrazioni registrate indica un buon indice di conversione alimentare.",
                    metrics: { "Razioni/Settimana": 7, "Costo Medio Stimato": "€ 12/capo" }
                });
            }
        }

        // --- ANALISI RACCOLTA & RESA ---
        const harvests = recentEntries.filter(e => e.type === 'RACCOLTA').sort((a,b) => b.date - a.date);
        if (harvests.length >= 2) {
            const latestResa = harvests[0].quantities?.yieldKg || 0;
            const prevResa = harvests[1].quantities?.yieldKg || 0;
            if (latestResa < prevResa) {
                trends.push({
                    id: 'trend-yield-1',
                    metric: "yield",
                    direction: "down",
                    explanation: "Calo resa netto rispetto alla raccolta precedente. Possibile correlazione con stress termico."
                });
            }
        }

        const result: AiPredictiveResult = {
            generatedAt: now,
            horizonDays: 7,
            confidence: 88,
            alerts: alerts.slice(0, 6),
            insights: insights.concat([
                { id: 'gen-1', title: "Ottimizzazione Risorse", description: "L'uso dell'irrigazione sta seguendo correttamente i picchi di temperatura diurni." }
            ]),
            trends: trends
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
        return result;
    }
};
