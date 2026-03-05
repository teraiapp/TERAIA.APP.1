
import { PREDICTIVE_MODELS, RiskLevel, RiskThresholds } from '../data/predictiveModels';
import { getCollectiveMemory } from './collectiveMemoryEngine';

export interface UnitRiskForecast {
    id: string;
    targetName: string;
    level: RiskLevel;
    probability: number; // 0-100
    why: string;
    when: string;
    actions: RiskThresholds['preventionActions'];
    collectiveContext?: string;
}

export const forecastUnitRisks = (
    unit: any, 
    weatherForecast: { tempAvg: number, humidityAvg: number, rainDays: number },
    region: string
): UnitRiskForecast[] => {
    
    const results: UnitRiskForecast[] = [];
    const memory = getCollectiveMemory();

    PREDICTIVE_MODELS.forEach(model => {
        // 1. Filtro per coltura
        if (!model.id.includes(unit.crop_key.toLowerCase())) return;

        let probability = 0;
        let reasons: string[] = [];

        // 2. Controllo Condizioni Meteo
        const tempMatch = weatherForecast.tempAvg >= model.triggers.avgTempRange[0] && weatherForecast.tempAvg <= model.triggers.avgTempRange[1];
        const humMatch = weatherForecast.humidityAvg >= model.triggers.humidityThreshold;
        const rainMatch = model.triggers.consecutiveRainDays ? weatherForecast.rainDays >= model.triggers.consecutiveRainDays : true;

        if (tempMatch) { probability += 30; reasons.push(`Temp. media (${weatherForecast.tempAvg}°C) ideale`); }
        if (humMatch) { probability += 40; reasons.push(`Umidità (${weatherForecast.humidityAvg}%) critica`); }
        if (rainMatch && model.triggers.consecutiveRainDays) { probability += 30; reasons.push(`${weatherForecast.rainDays}gg di pioggia consecutiva previsti`); }

        // 3. Incrocio con Memoria Collettiva (Sicurezza statistica)
        const regionalPatterns = memory.filter(c => 
            c.context.region === region && 
            c.problem.key.toLowerCase() === model.target.toLowerCase()
        );

        let collectiveNote = "";
        if (regionalPatterns.length > 0) {
            probability += 10;
            collectiveNote = `${regionalPatterns.length} casi simili registrati in ${region} in questo periodo negli anni passati.`;
        }

        probability = Math.min(probability, 100);

        if (probability >= 40) {
            results.push({
                id: `forecast-${unit.id}-${model.id}`,
                targetName: model.target,
                level: probability > 75 ? 'alto' : probability > 50 ? 'medio' : 'basso',
                probability,
                why: reasons.join(" + "),
                when: "Entro 7-10 giorni",
                actions: model.preventionActions,
                collectiveContext: collectiveNote
            });
        }
    });

    return results;
};
