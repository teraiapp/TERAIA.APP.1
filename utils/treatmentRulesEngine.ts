
import { DISCIPLINARI, PRODUCTS, DisciplinareRule, Product } from '../data/fitofarmaciData';

export interface TreatmentRationale {
    allowed: boolean;
    blocks: string[];
    warnings: string[];
    benefits: string[];
    riskScore: 'low' | 'medium' | 'high';
}

export interface SmartAlternatives {
    cheapest?: Product;
    fastestPhi?: Product;
    ecoFriendly?: Product;
    mostReliable?: Product;
}

export interface AdvancedRecommendation {
    status: 'allowed' | 'not_found' | 'restricted' | 'blocked';
    rule?: DisciplinareRule;
    allowedProducts: Product[];
    rationaleMap: Record<string, TreatmentRationale>;
    alternatives: SmartAlternatives;
    source: string;
}

// Added TreatmentRecommendation type for V1/V2 compatibility
export type TreatmentRecommendation = AdvancedRecommendation & {
    restrictions: string[];
};

export const evaluateAdvancedTreatment = (
    region: string,
    crop: string,
    adversity: string,
    currentStage: string,
    weatherContext: { rainRisk: number, windSpeed: number, temp: number }
): AdvancedRecommendation => {
    
    const rule = DISCIPLINARI.find(d => 
        d.region.toLowerCase() === region.toLowerCase() &&
        d.crop.toLowerCase() === crop.toLowerCase() &&
        d.adversity.toLowerCase() === adversity.toLowerCase()
    );

    if (!rule) {
        return {
            status: 'not_found',
            allowedProducts: [],
            rationaleMap: {},
            alternatives: {},
            source: "TeraIA Global Knowledge"
        };
    }

    const rawAllowed = PRODUCTS.filter(p => 
        p.activeIngredients.some(ai => rule.allowedActiveIngredients.includes(ai)) &&
        p.authorizedOn.includes(crop)
    );

    const rationaleMap: Record<string, TreatmentRationale> = {};
    
    rawAllowed.forEach(p => {
        const blocks: string[] = [];
        const warnings: string[] = [];
        const benefits: string[] = [];
        let risk: 'low' | 'medium' | 'high' = 'low';

        // 1. Controllo Fase
        if (rule.forbiddenPhases.includes(currentStage)) {
            blocks.push(`VIETATO: Non ammesso nella fase "${currentStage}" (Rif. Disciplinare)`);
        }

        // 2. Controllo Meteo
        if (weatherContext.rainRisk > 60) {
            warnings.push("Rischio dilavamento elevato: pioggia prevista entro 12h.");
            risk = 'high';
        }
        if (weatherContext.windSpeed > 15) {
            warnings.push("Rischio deriva: vento troppo forte per irrorazione precisa.");
            risk = risk === 'high' ? 'high' : 'medium';
        }

        // 3. Benefici
        benefits.push("Ammesso dal disciplinare regionale.");
        if (p.organic) benefits.push("Compatibile con regime Biologico.");
        if (p.collectiveSuccessRate > 90) benefits.push(`Alta efficacia storica: risolutivo nel ${p.collectiveSuccessRate}% dei casi.`);

        rationaleMap[p.id] = {
            allowed: blocks.length === 0,
            blocks,
            warnings,
            benefits,
            riskScore: risk
        };
    });

    const validProducts = rawAllowed.filter(p => rationaleMap[p.id].allowed);

    return {
        status: validProducts.length > 0 ? 'allowed' : 'blocked',
        rule,
        allowedProducts: validProducts,
        rationaleMap,
        alternatives: {
            cheapest: [...validProducts].sort((a,b) => a.priceLevel - b.priceLevel)[0],
            fastestPhi: [...validProducts].sort((a,b) => (a.phiDays || 99) - (b.phiDays || 99))[0],
            ecoFriendly: [...validProducts].sort((a,b) => b.sustainabilityScore - a.sustainabilityScore)[0],
            mostReliable: [...validProducts].sort((a,b) => b.collectiveSuccessRate - a.collectiveSuccessRate)[0],
        },
        source: rule.sourceRef
    };
};

// Added evaluateTreatmentRules to satisfy AiTreatmentsPage.tsx (V1/V2 compatibility)
export const evaluateTreatmentRules = (
    region: string,
    crop: string,
    adversity: string
): TreatmentRecommendation => {
    // Default context for non-advanced users or simple queries
    const result = evaluateAdvancedTreatment(region, crop, adversity, 'generico', { rainRisk: 0, windSpeed: 0, temp: 20 });
    return {
        ...result,
        restrictions: result.rule?.restrictions || []
    };
};

// Added logAiRecommendation for auditing and UX monitoring
export const logAiRecommendation = (userId: string, data: any) => {
    console.debug(`[AI-DSS] Recommendation for ${userId}:`, data);
};
