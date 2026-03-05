
import { SmartAction } from '../types';
import { generateGovernancePayload } from './governanceEngine';

const STORAGE_KEY = 'teraia_guided_actions_v1';

export const getGuidedActions = (): SmartAction[] => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
};

export const saveGuidedActions = (actions: SmartAction[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(actions));
};

// Genera azioni basate sui moduli esistenti
export const scanForNeededActions = (context: { risks: any[], weather: any, units: any[] }) => {
    const currentActions = getGuidedActions();
    const newActions: SmartAction[] = [];

    // 1. Trigger da AI Predittiva (Rischio Alto)
    context.risks.forEach(risk => {
        if (risk.level === 'alto' && !currentActions.some(a => a.triggerSource === risk.id)) {
            // Fixed: Added missing governance property to satisfy SmartAction interface
            newActions.push({
                id: `act-${Date.now()}-${risk.id}`,
                type: 'prevenzione',
                title: `Prevenzione Rapida: ${risk.targetName}`,
                description: `L'AI ha rilevato un rischio critico. Vuoi generare una bozza di intervento preventivo per ${risk.targetName}?`,
                priority: 'alta',
                prefilledData: risk,
                triggerSource: risk.id,
                status: 'proposta',
                governance: generateGovernancePayload('weather_model', 'Modelli Predittivi TeraIA', 90)
            });
        }
    });

    // 2. Trigger da Meteo (Caldo estremo -> Irrigazione)
    if (context.weather.tempAvg > 30 && context.units.some(u => u.type === 'Serra')) {
        const serra = context.units.find(u => u.type === 'Serra');
        if (!currentActions.some(a => a.type === 'irrigazione' && a.status === 'proposta')) {
            // Fixed: Added missing governance property to satisfy SmartAction interface
            newActions.push({
                id: `act-irr-${Date.now()}`,
                type: 'irrigazione',
                title: `Emergenza Caldo: ${serra.name}`,
                description: `Temperature previste sopra i 30°C. Vuoi programmare un ciclo di irrigazione di soccorso?`,
                priority: 'alta',
                prefilledData: { unitId: serra.id, duration: 45 },
                triggerSource: 'weather-temp',
                status: 'proposta',
                governance: generateGovernancePayload('weather_model', 'Stazione Meteo Locale', 95)
            });
        }
    }

    if (newActions.length > 0) {
        saveGuidedActions([...newActions, ...currentActions]);
    }
};

export const updateActionStatus = (id: string, status: SmartAction['status']) => {
    const actions = getGuidedActions();
    saveGuidedActions(actions.map(a => a.id === id ? { ...a, status } : a));
};
