
import { QuadernoEntry, SeasonMetrics, SeasonComparison } from '../types';
import { quadernoService } from './quadernoService';

export const aiSeasonalLearningService = {

    getYearsAvailable: (): number[] => {
        const entries = quadernoService.getEntries();
        const years = entries.map(e => new Date(e.date).getFullYear());
        return Array.from(new Set(years)).sort((a, b) => b - a);
    },

    buildSeasonMetrics: (unitId: string | null, year: number): SeasonMetrics => {
        const entries = quadernoService.getEntries().filter(e => {
            const matchYear = new Date(e.date).getFullYear() === year;
            const matchUnit = unitId ? e.unitId === unitId : true;
            return matchYear && matchUnit;
        });

        const metrics: SeasonMetrics = {
            year,
            yieldTotal: 0,
            irrigationVolume: 0,
            irrigationEvents: 0,
            treatmentsCount: 0,
            fertilizationsCount: 0,
            avgEcTarget: 0,
            healthEventsCount: 0,
            feedStabilityScore: 100
        };

        let ecSum = 0;
        let ecCount = 0;

        entries.forEach(e => {
            switch(e.type) {
                case 'RACCOLTA':
                    metrics.yieldTotal += e.quantities?.yieldKg || 0;
                    break;
                case 'IRRIGAZIONE':
                    metrics.irrigationEvents++;
                    metrics.irrigationVolume += e.quantities?.volumeLiters || 0;
                    break;
                case 'TRATTAMENTO':
                    metrics.treatmentsCount++;
                    break;
                case 'FERTILIZZAZIONE':
                    metrics.fertilizationsCount++;
                    if (e.ecValue) {
                        ecSum += e.ecValue;
                        ecCount++;
                    }
                    break;
                case 'EVENTO_SANITARIO':
                case 'VISITA_VETERINARIA':
                    metrics.healthEventsCount++;
                    break;
                case 'ALIMENTAZIONE':
                    // Semplificazione: riduciamo score se ci sono troppe note di variazione
                    if (e.notes?.toLowerCase().includes('cambio') || e.notes?.toLowerCase().includes('variazione')) {
                        metrics.feedStabilityScore -= 5;
                    }
                    break;
            }
        });

        if (ecCount > 0) metrics.avgEcTarget = ecSum / ecCount;
        metrics.feedStabilityScore = Math.max(metrics.feedStabilityScore, 0);

        return metrics;
    },

    compareSeasons: (unitId: string, unitName: string): SeasonComparison | null => {
        const years = aiSeasonalLearningService.getYearsAvailable();
        if (years.length < 2) return null;

        const currYear = years[0];
        const prevYear = years[1];

        const curr = aiSeasonalLearningService.buildSeasonMetrics(unitId, currYear);
        const prev = aiSeasonalLearningService.buildSeasonMetrics(unitId, prevYear);

        const calcDelta = (c: number, p: number) => p === 0 ? 0 : ((c - p) / p) * 100;

        const deltas = {
            yieldDeltaPercent: calcDelta(curr.yieldTotal, prev.yieldTotal),
            irrigationDeltaPercent: calcDelta(curr.irrigationVolume, prev.irrigationVolume),
            treatmentsDeltaPercent: calcDelta(curr.treatmentsCount, prev.treatmentsCount),
            ecDelta: curr.avgEcTarget - prev.avgEcTarget
        };

        const correlations: SeasonComparison['correlations'] = [];
        const recs: string[] = [];

        // Logica Correlazione v1
        if (deltas.yieldDeltaPercent > 5 && deltas.irrigationDeltaPercent > 10) {
            correlations.push({
                metric: "Irrigazione vs Resa",
                relation: "positiva",
                explanation: "L'aumento dell'apporto idrico ha generato un incremento proporzionale della produzione."
            });
            recs.push("Mantieni questo regime irriguo per la prossima stagione.");
        } else if (deltas.yieldDeltaPercent < -5 && deltas.irrigationDeltaPercent > 20) {
            correlations.push({
                metric: "Irrigazione vs Resa",
                relation: "negativa",
                explanation: "Nonostante l'aumento di acqua, la resa è calata. Possibile lisciviazione nutrienti o asfissia."
            });
            recs.push("Verifica il drenaggio del suolo e la frazione di lavaggio.");
        }

        if (deltas.treatmentsDeltaPercent > 15 && deltas.yieldDeltaPercent < 2) {
            correlations.push({
                metric: "Difesa vs Resa",
                relation: "debole",
                explanation: "L'aumento dei trattamenti non ha protetto la resa extra. Inefficienza economica rilevata."
            });
            recs.push("Ottimizza il timing dei trattamenti usando i modelli previsionali AI.");
        }

        return {
            unitId,
            unitName,
            seasonsCompared: [prevYear, currYear],
            deltas,
            correlations,
            recommendations: recs.length > 0 ? recs : ["Continua a registrare dati per affinare i suggerimenti."]
        };
    },

    analyzeLivestockSeason: (): any => {
        const years = aiSeasonalLearningService.getYearsAvailable();
        if (years.length < 2) return null;

        const curr = aiSeasonalLearningService.buildSeasonMetrics(null, years[0]);
        const prev = aiSeasonalLearningService.buildSeasonMetrics(null, years[1]);

        const healthDelta = curr.healthEventsCount - prev.healthEventsCount;
        
        return {
            title: "Performance Zootecnica",
            years: [years[1], years[0]],
            healthDelta,
            feedStability: curr.feedStabilityScore,
            insight: healthDelta < 0 
                ? `Miglioramento gestionale: -${Math.abs(healthDelta)} eventi sanitari rispetto al ${years[1]}.`
                : healthDelta > 0 
                ? `Allerta: +${healthDelta} eventi sanitari. Verifica biosicurezza.`
                : "Stato sanitario stabile tra le stagioni."
        };
    }
};
