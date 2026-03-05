
import { AssetType, RiskScore4D, PredictiveAlert, RiskLevel } from '../types';
import { getPublicCases } from './collectiveMemoryEngineV2';
import { getQuadernoEvents } from './quadernoBridge';

// Mock Meteo: In produzione verrebbe da API reale
const MOCK_WEATHER = {
    past72h: { rain: 15, avgHumidity: 78, avgTemp: 22 },
    forecast7d: { rainDays: 3, maxTemp: 31, minTemp: 19, humidityRise: true }
};

export const calculateUnitRisk = (unit: any, region: string): { scores: RiskScore4D, quality: number, reasons: Record<string, string[]> } => {
    const scores: RiskScore4D = { fungi: 10, insects: 10, water: 10, nutrition: 10, health: 5 };
    const reasons: Record<string, string[]> = { fungi: [], insects: [], water: [], nutrition: [], health: [] };
    let dataPoints = 1; // Base meteo

    const quaderno = getQuadernoEvents().filter(e => e.unitId === unit.id);
    const memory = getPublicCases().filter(c => c.territory.region === region && c.target.toLowerCase().includes(unit.crop_key?.toLowerCase() || ''));

    if (quaderno.length > 0) dataPoints += 2;
    if (memory.length > 0) dataPoints += 1;

    const quality = Math.min((dataPoints / 4) * 100, 100);

    // 1. Rischio Funghino (es: Peronospora)
    if (MOCK_WEATHER.past72h.avgHumidity > 70 && MOCK_WEATHER.forecast7d.rainDays > 0) {
        scores.fungi += 50;
        reasons.fungi.push("Umidità elevata e piogge previste");
    }
    const lastTreatment = quaderno.find(e => e.type === 'trattamento');
    if (lastTreatment) {
        const daysSince = (Date.now() - new Date(lastTreatment.date).getTime()) / (86400000);
        if (daysSince < 7) {
            scores.fungi -= 30;
            reasons.fungi.push("Copertura fitosanitaria recente attiva");
        }
    }
    if (memory.some(c => c.problem.toLowerCase().includes('peronospora') || c.problem.toLowerCase().includes('oidio'))) {
        scores.fungi += 20;
        reasons.fungi.push("Casi attivi segnalati nel territorio");
    }

    // 2. Stress Idrico
    if (MOCK_WEATHER.forecast7d.maxTemp > 28 && MOCK_WEATHER.forecast7d.rainDays === 0) {
        scores.water += 40;
        reasons.water.push("Temperature in rialzo senza precipitazioni");
    }
    const lastIrrigation = quaderno.find(e => e.type === 'irrigazione');
    if (lastIrrigation) {
        scores.water -= 20;
        reasons.water.push("Irrigazione registrata recentemente");
    }

    // 3. Allevamento (Health)
    if (unit.category === 'Allevamento' || unit.type === 'Allevamento' || unit.species) {
        scores.health = 15;
        const healthReasons: string[] = [];
        if (MOCK_WEATHER.forecast7d.maxTemp > 30) {
            scores.health! += 40;
            healthReasons.push("Rischio stress termico per alte temperature");
        }
        reasons.health = healthReasons;
    }

    // Clamp 0-100
    Object.keys(scores).forEach(k => {
        (scores as any)[k] = Math.max(Math.min((scores as any)[k], 100), 5);
    });

    return { scores, quality, reasons };
};

export const generatePredictiveAlerts = (units: any[], region: string): PredictiveAlert[] => {
    const alerts: PredictiveAlert[] = [];

    units.forEach(unit => {
        const { scores, reasons } = calculateUnitRisk(unit, region);

        if (scores.fungi > 60) {
            alerts.push({
                id: `pa-fungi-${unit.id}`,
                unitId: unit.id,
                unitName: unit.name,
                title: `Rischio Malattie Crittogamiche: ${unit.name}`,
                description: `Condizioni ideali per sviluppo patogeni su ${unit.crop_key || 'coltura'}.`,
                severity: scores.fungi > 80 ? 'critico' : 'alto',
                type: 'fungi',
                suggestedAction: "Avvia verifica conformità trattamenti",
                targetRoute: "/ai/trattamenti",
                routeState: { problem: 'peronospora', unitId: unit.id },
                timestamp: new Date().toISOString(),
                status: 'attivo',
                reasons: reasons.fungi
            });
        }

        if (scores.water > 70) {
            alerts.push({
                id: `pa-water-${unit.id}`,
                unitId: unit.id,
                unitName: unit.name,
                title: `Stress Idrico Elevato: ${unit.name}`,
                description: `Previsto picco termico. Necessario intervento irriguo di soccorso.`,
                severity: 'alto',
                type: 'water',
                suggestedAction: "Apri gestione Irrigazione",
                targetRoute: "/irrigazione",
                timestamp: new Date().toISOString(),
                status: 'attivo',
                reasons: reasons.water
            });
        }
    });

    return alerts;
};
