
import { 
    QuadernoEntry, AgriForecast, LivestockForecast, 
    CompanyForecastDigest, AssetType 
} from '../types';
import { quadernoService } from './quadernoService';

const STORAGE_DIGEST = 'teraia_ai_forecast_digest_v1';
const STORAGE_UNITS = 'teraia_ai_forecast_units_v1';

export const aiForecastService = {

    getUnits: () => JSON.parse(localStorage.getItem('teraia_production_units_v2') || '[]'),

    extractTimeSeries: (unitId?: string) => {
        const entries = quadernoService.getEntries();
        const filtered = unitId ? entries.filter(e => e.unitId === unitId) : entries;
        
        return {
            irrigations: filtered.filter(e => e.type === 'IRRIGAZIONE'),
            treatments: filtered.filter(e => e.type === 'TRATTAMENTO'),
            harvests: filtered.filter(e => e.type === 'RACCOLTA'),
            feedings: filtered.filter(e => e.type === 'ALIMENTAZIONE'),
            health: filtered.filter(e => ["EVENTO_SANITARIO", "VACCINAZIONE", "VISITA_VETERINARIA"].includes(e.type))
        };
    },

    forecastAgriculture: (unit: any, horizonDays: number): AgriForecast => {
        const series = aiForecastService.extractTimeSeries(unit.id);
        const why: string[] = [];
        const recs: Array<{label: string, route: string}> = [];
        
        // 1. Resa (Yield)
        let predictedYieldKg: number | null = null;
        let predictedYieldRangeKg: [number, number] | null = null;
        let yieldConfidence = 50;

        if (series.harvests.length > 0) {
            const totalKg = series.harvests.reduce((acc, h) => acc + (h.quantities?.yieldKg || 0), 0);
            const avgDaily = totalKg / 90; // stima su base stagionale 90gg
            predictedYieldKg = Math.round(avgDaily * horizonDays);
            const variance = series.harvests.length > 3 ? 0.08 : 0.15;
            predictedYieldRangeKg = [Math.round(predictedYieldKg * (1-variance)), Math.round(predictedYieldKg * (1+variance))];
            yieldConfidence = series.harvests.length > 5 ? 85 : 65;
            why.push(`Basato su ${series.harvests.length} raccolte passate registrate.`);
        } else {
            why.push("Dati di raccolta insufficienti per previsione resa.");
        }

        // 2. Acqua (Water)
        let predictedEvents = 0;
        let predictedLiters: number | null = null;
        if (series.irrigations.length > 0) {
            const eventsLast30 = series.irrigations.filter(i => i.date > Date.now() - 30 * 86400000).length;
            const avgWeekly = (eventsLast30 / 30) * 7;
            predictedEvents = Math.round(avgWeekly * (horizonDays / 7));
            
            const totalLiters = series.irrigations.reduce((acc, i) => acc + (i.quantities?.volumeLiters || 0), 0);
            const avgLiters = totalLiters / series.irrigations.length;
            predictedLiters = Math.round(avgLiters * predictedEvents);
            why.push(`Trend irriguo basato su media settimanale di ${avgWeekly.toFixed(1)} eventi.`);
        }

        // 3. Rischio Malattie
        let risk: "low" | "medium" | "high" = "low";
        const lastTreatment = series.treatments.length > 0 ? series.treatments[0] : null;
        const daysSinceTreatment = lastTreatment ? (Date.now() - lastTreatment.date) / 86400000 : 99;
        
        if (daysSinceTreatment > 14) {
            risk = "medium";
            why.push("Copertura fitosanitaria potenzialmente scaduta (>14gg).");
            recs.push({ label: "Pianifica Trattamento", route: "/ai/trattamenti" });
        }
        if (predictedEvents > 4 && horizonDays <= 14) {
            risk = "high";
            why.push("Alta frequenza irrigua prevista unita a umidità favorisce patogeni.");
        }

        if (predictedEvents > 0) {
            recs.push({ label: "Gestisci Irrigazione", route: "/irrigazione" });
        }

        return {
            unitId: unit.id,
            unitName: unit.name,
            horizonDays,
            confidence: yieldConfidence,
            predictedYieldKg,
            predictedYieldRangeKg,
            predictedIrrigationEvents: predictedEvents,
            predictedWaterLiters: predictedLiters,
            diseaseRisk: risk,
            why,
            recommendations: recs
        };
    },

    forecastLivestock: (unit: any, horizonDays: number): LivestockForecast => {
        const series = aiForecastService.extractTimeSeries(unit.id);
        const why: string[] = [];
        const hints: string[] = [];
        const recs: Array<{label: string, route: string}> = [];
        
        // 1. Mangime
        let predictedFeedQty: number | null = null;
        if (series.feedings.length > 0) {
            const totalQty = series.feedings.reduce((acc, f) => acc + (f.quantities?.amount || 0), 0);
            const avgDaily = totalQty / 30; // stima su 30gg
            predictedFeedQty = Math.round(avgDaily * horizonDays);
            why.push(`Consumo mangime basato su media ultimi 30gg.`);
        } else {
            hints.push("Registra razioni (kg/giorno) per avere previsione scorte.");
        }

        // 2. Rischio Sanitario
        let risk: "low" | "medium" | "high" = "low";
        const recentHealthEvents = series.health.filter(h => h.date > Date.now() - 14 * 86400000).length;
        if (recentHealthEvents > 2) {
            risk = "high";
            why.push("Aumento frequenza eventi sanitari nelle ultime 2 settimane.");
            recs.push({ label: "Contatta Veterinario", route: "/allevamento" });
        } else if (recentHealthEvents > 0) {
            risk = "medium";
            why.push("Presenza di eventi sanitari recenti da monitorare.");
        }

        // 3. Produzione
        const production = { milkLiters: null as number|null, eggs: null as number|null };
        const prodEntries = JSON.parse(localStorage.getItem('teraia_livestock_production') || '[]').filter((p:any) => p.unitId === unit.id);
        
        if (prodEntries.length > 0) {
            const totalMilk = prodEntries.reduce((acc:number, p:any) => acc + (p.milkLiters || 0), 0);
            const avgDailyMilk = totalMilk / 30;
            production.milkLiters = Math.round(avgDailyMilk * horizonDays);
            why.push(`Proiezione produzione latte basata su media mobile.`);
        } else {
            hints.push("Inserisci dati produzione giornaliera per sbloccare forecast.");
        }

        return {
            unitId: unit.id,
            unitName: unit.name,
            horizonDays,
            confidence: series.feedings.length > 5 ? 88 : 45,
            predictedFeedQty,
            predictedFeedCost: null,
            healthRisk: risk,
            predictedProduction: production,
            missingDataHints: hints,
            recommendations: recs
        };
    },

    forecastCompanyDigest: (horizonDays: number = 7): CompanyForecastDigest => {
        const units = aiForecastService.getUnits();
        const agri = units.filter((u:any) => u.category !== 'Allevamento');
        const livestock = units.filter((u:any) => u.category === 'Allevamento');

        const risks: string[] = [];
        if (agri.some(u => aiForecastService.forecastAgriculture(u, horizonDays).diseaseRisk === 'high')) {
            risks.push("Rischio Malattie Agricoltura: ALTO");
        }
        if (livestock.some(u => aiForecastService.forecastLivestock(u, horizonDays).healthRisk === 'high')) {
            risks.push("Rischio Sanitario Allevamento: CRITICO");
        }

        const digest = {
            generatedAt: Date.now(),
            totalUnits: units.length,
            globalAgriConfidence: 75,
            globalLivestockConfidence: 60,
            topRisks: risks,
            summary: `Analisi a ${horizonDays} giorni completata per ${units.length} unità.`
        };

        localStorage.setItem(STORAGE_DIGEST, JSON.stringify(digest));
        return digest;
    }
};
