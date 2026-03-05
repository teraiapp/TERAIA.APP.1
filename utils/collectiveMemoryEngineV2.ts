
import { CaseReport, OutcomeLevel, TerritoryPattern } from '../types';
import { INITIAL_PUBLIC_CASES } from '../data/collectiveMemoryV2Data';

const PUBLIC_KEY = 'teraia_public_case_reports_v2';
const PRIVATE_KEY = 'teraia_private_case_reports_v2';

export const getPublicCases = (): CaseReport[] => {
    const saved = localStorage.getItem(PUBLIC_KEY);
    return saved ? JSON.parse(saved) : INITIAL_PUBLIC_CASES;
};

export const getPrivateCases = (userId: string): CaseReport[] => {
    const saved = localStorage.getItem(PRIVATE_KEY);
    const all = saved ? JSON.parse(saved) : [];
    return all.filter((c: CaseReport) => c.ownerId === userId);
};

export const calculateQuality = (report: Partial<CaseReport>): { completeness: number; reliability: number; isSuspicious: boolean } => {
    let score = 0;
    // Fixed: Property 'city' does not exist on type 'GeoLocation'. Changed to 'communeName'.
    if (report.territory?.communeName) score += 30;
    if (report.problem) score += 20;
    if (report.outcome) score += 20;
    if (report.intervention) score += 20;
    if (report.productUsed) score += 10;

    let rel = 50;
    if (report.source === 'quaderno') rel += 30;
    if (report.source === 'ai_trattamenti') rel += 20;
    if (report.conditions) rel += 20;

    return {
        completeness: Math.min(score, 100),
        reliability: Math.min(rel, 100),
        isSuspicious: (score < 40)
    };
};

export const saveCase = (report: CaseReport) => {
    // 1. Salva in Privato
    const privateSaved = localStorage.getItem(PRIVATE_KEY);
    const privateAll = privateSaved ? JSON.parse(privateSaved) : [];
    localStorage.setItem(PRIVATE_KEY, JSON.stringify([report, ...privateAll]));

    // 2. Se c'è consenso, salva in Pubblico (ANONIMIZZATO)
    if (report.privacy.consent) {
        const publicReport = { ...report, ownerId: 'anonymized' };
        const publicSaved = localStorage.getItem(PUBLIC_KEY);
        const publicAll = publicSaved ? JSON.parse(publicSaved) : INITIAL_PUBLIC_CASES;
        localStorage.setItem(PUBLIC_KEY, JSON.stringify([publicReport, ...publicAll]));
    }
};

export const getTerritoryPatterns = (region: string, crop?: string): TerritoryPattern[] => {
    const cases = getPublicCases().filter(c => c.territory.region === region && c.quality.moderationStatus === 'approved');
    const problems = Array.from(new Set(cases.map(c => c.problem)));

    return problems.map(prob => {
        const probCases = cases.filter(c => c.problem === prob);
        const resolved = probCases.filter(c => c.outcome === 'risolto');
        
        // Trova soluzione più comune (prodotto)
        const products = probCases.map(c => c.productUsed).filter(Boolean);
        const topProd = products.sort((a,b) => 
            products.filter(v => v===a).length - products.filter(v => v===b).length
        ).pop() || "Intervento manuale";

        return {
            id: `pattern-${prob}`,
            problem: prob,
            topSolution: topProd,
            successRate: Math.round((resolved.length / probCases.length) * 100),
            avgDays: Math.round(probCases.reduce((acc, c) => acc + (c.daysToResult || 0), 0) / probCases.length) || 0,
            casesCount: probCases.length
        };
    }).sort((a,b) => b.successRate - a.successRate);
};
