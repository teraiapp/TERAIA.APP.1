
import { CompanyProfile, LocationData, AiSuggestion, AssetType } from '../types';
import { knowledgeBase } from '../data/aiKnowledgeBase';

interface AiContext {
    problem: string;
    crop: string;
    profile: CompanyProfile;
    weather: {
        condition: 'soleggiato' | 'pioggia imminente' | 'umido';
        temperature: number;
    };
    phenologicalPhase: 'fioritura' | 'invaiatura' | 'riposo vegetativo' | 'sviluppo vegetativo';
}

export const getAiSuggestion = (context: AiContext, imageSrc: string): AiSuggestion => {
    const { problem, crop, profile, weather, phenologicalPhase } = context;
    /* Corrected: regionCode or regionName exist on GeoLocation, not region. Using regionName. */
    const region = profile.localization.regionName || 'Generica';

    const suggestion: Partial<AiSuggestion> = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        imageSrc,
        problem,
        crop,
        sources: [],
        warnings: ["Questo è un supporto decisionale. Consulta sempre un agronomo qualificato e l'etichetta del prodotto.", "L'efficacia dei trattamenti dipende da una corretta applicazione."],
        isDecisionSupport: true,
    };

    // 1. Consult Knowledge Base
    const disciplinare = knowledgeBase.disciplinariRegionali[region]?.[crop];
    const possibleProducts = knowledgeBase.fitogestLogic[problem] || [];
    
    suggestion.sources?.push(`Disciplinare Regione ${region} (simulato)`);
    suggestion.sources?.push('Logica Fitogest (simulata)');

    // 2. Filter & Decide
    let allowedProducts = possibleProducts;
    if (disciplinare) {
        allowedProducts = possibleProducts.filter(p => disciplinare.allowedActiveIngredients.includes(p.name));
    } else {
        suggestion.warnings?.push(`Nessun disciplinare specifico trovato per ${crop} in ${region}. I suggerimenti sono generici.`);
    }

    // 3. Evaluate context (weather, phase)
    if (weather.condition === 'pioggia imminente') {
        suggestion.headline = "Azione Sconsigliata Causa Meteo";
        suggestion.explanation = `Le piogge imminenti renderebbero inefficace qualsiasi trattamento, causando dilavamento del prodotto.`;
        suggestion.recommendedAction = {
            type: 'MONITORAGGIO',
            details: "È fondamentale monitorare attentamente la coltura dopo la pioggia e prepararsi ad intervenive se il problema persiste.",
        };
        return suggestion as AiSuggestion;
    }
    
    if (phenologicalPhase === 'fioritura') {
         suggestion.warnings?.push(`La coltura è in fioritura, una fase delicata. Evitare prodotti che possano danneggiare gli impollinatori.`);
    }

    // 4. Formulate Response
    if (allowedProducts.length > 0) {
        suggestion.headline = `Azione Consigliata per ${problem}`;
        suggestion.explanation = `Considerando il disciplinare della regione ${region} e le condizioni attuali, un intervento mirato è la strategia migliore.`;
        suggestion.recommendedAction = {
            type: 'TRATTAMENTO',
            details: `Si consiglia un trattamento utilizzando prodotti a base di: ${allowedProducts.map(p => p.name).join(' o ')}. Questi principi sono ammessi dal disciplinare per la tua coltura.`,
            suggestedProducts: allowedProducts.map(p => p.name),
            actionLink: {
                text: 'Registra Trattamento',
                link: '/quaderno',
                state: {
                    prefill: {
                        type: 'trattamento',
                        data: {
                            crop,
                            // FIX: Use AssetType enum member instead of string literal for type safety.
                            unitName: profile.assets.includes(AssetType.ARBORETO) ? 'Arboreto' : 'Campo/Serra',
                            details: { adversity: problem, reason: `Suggerimento AI del ${new Date().toLocaleDateString()}` }
                        }
                    }
                }
            }
        };
    } else {
         suggestion.headline = `Monitoraggio Attivo per ${problem}`;
         suggestion.explanation = `Al momento, il disciplinare della regione ${region} non prevede principi attivi specifici per questo problema, oppure i prodotti disponibili non sono adatti.`;
         suggestion.recommendedAction = {
            type: 'MONITORAGGIO',
            details: "Si raccomanda di monitorare l'evoluzione del problema e considerare pratiche agronomiche preventive, come la gestione dell'irrigazione o la rimozione di parti infette, se applicabile.",
         };
    }

    return suggestion as AiSuggestion;
};
