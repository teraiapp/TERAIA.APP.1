
import { TechnicalCase, NormalizedPattern, INITIAL_COLLECTIVE_CASES, SuccessLevel } from '../data/collectiveMemoryData';

const STORAGE_KEY = 'teraia_collective_memory_v1';

export const getCollectiveMemory = (): TechnicalCase[] => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_COLLECTIVE_CASES;
};

export const addCaseToMemory = (newCase: Omit<TechnicalCase, 'id' | 'timestamp'>) => {
    const memory = getCollectiveMemory();
    const fullCase: TechnicalCase = {
        ...newCase,
        id: `case-cl-${Date.now()}`,
        timestamp: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([fullCase, ...memory]));
};

export const findPatterns = (crop: string, problem: string, region: string): NormalizedPattern[] => {
    const memory = getCollectiveMemory();
    
    // Filtra casi simili
    const similarCases = memory.filter(c => 
        c.context.cropOrSpecies.toLowerCase() === crop.toLowerCase() &&
        c.problem.key.toLowerCase() === problem.toLowerCase()
    );

    if (similarCases.length === 0) return [];

    // Raggruppa per soluzione (Action Details)
    const solutionsMap: Record<string, { count: number, points: number }> = {};
    
    similarCases.forEach(c => {
        const sol = c.action.productName || c.action.type;
        if (!solutionsMap[sol]) solutionsMap[sol] = { count: 0, points: 0 };
        
        solutionsMap[sol].count += 1;
        const score = c.result.level === 'risolto' ? 100 : c.result.level === 'migliorato' ? 60 : 0;
        solutionsMap[sol].points += score;
    });

    return Object.entries(solutionsMap).map(([sol, stats], idx) => ({
        id: `pattern-${idx}`,
        patternLabel: `Pattern ${sol} per ${problem}`,
        casesCount: stats.count,
        avgSuccessRate: Math.round(stats.points / stats.count),
        topSolution: sol,
        contextMatch: {
            crop,
            problem,
            region,
            phase: similarCases[0].context.phase
        }
    })).sort((a, b) => b.avgSuccessRate - a.avgSuccessRate);
};
