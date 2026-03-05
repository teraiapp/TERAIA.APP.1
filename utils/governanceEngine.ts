
import { AiGovernanceInfo } from '../types';

export const generateGovernancePayload = (
    type: 'regulatory' | 'collective_memory' | 'weather_model',
    reference: string,
    confidence: number
): AiGovernanceInfo => {
    
    const baseLimitations = [
        "L'AI supporta ma non sostituisce il giudizio umano professionale.",
        "Dati basati su modelli statistici e storici suscettibili a variazioni microclimatiche."
    ];

    if (type === 'collective_memory') {
        baseLimitations.push("Le esperienze della community sono anonime e non verificate da enti ufficiali.");
    }

    return {
        confidenceScore: confidence,
        sourceType: type,
        sourceReference: reference,
        limitations: baseLimitations,
        validationRequired: confidence < 85
    };
};
