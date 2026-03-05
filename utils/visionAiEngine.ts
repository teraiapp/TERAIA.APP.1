
import { VisionReport, RiskType, RiskLevel } from '../types';

const MOCK_PROBLEMS = [
    { label: 'Peronospora', type: 'fungi', severity: 'alto', crop: 'Vite', why: ["Macchie 'ad olio' sulla pagina superiore", "Efflorescenza biancastra inferiore", "Condizioni meteo umide favorevoli"] },
    { label: 'Oidio (Mal Bianco)', type: 'fungi', severity: 'medio', crop: 'Pomodoro', why: ["Polvere biancastra polverulenta", "Accartocciamento fogliare", "Temperature medie e umidità stagnante"] },
    { label: 'Afidi (Pidocchi)', type: 'insects', severity: 'medio', crop: 'Peperone', why: ["Presenza di colonie su germogli", "Melata appiccicosa visibile", "Presenza di formiche nell'area"] },
    { label: 'Stress Idrico', type: 'water', severity: 'alto', crop: 'Mais', why: ["Foglie arrotolate a sigaro", "Perdita di turgore", "Colorazione verde-grigiastra"] },
    { label: 'Carenza Magnesio', type: 'nutrition', severity: 'basso', crop: 'Vite', why: ["Clorosi interveinale", "Margini fogliari verdi", "Foglie basali colpite per prime"] }
];

export const analyzeImage = (imageB64: string): Promise<VisionReport> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const randomIssue = MOCK_PROBLEMS[Math.floor(Math.random() * MOCK_PROBLEMS.length)];
            const confidence = 75 + Math.floor(Math.random() * 20);
            
            resolve({
                id: `vis-${Date.now()}`,
                timestamp: new Date().toISOString(),
                imageUrl: imageB64,
                issueType: randomIssue.type as RiskType,
                problemLabel: randomIssue.label,
                confidence: confidence,
                severity: randomIssue.severity as RiskLevel,
                detectedCrop: randomIssue.crop,
                description: `L'analisi ha identificato segni visivi riconducibili a ${randomIssue.label}. Il pattern è coerente con attacchi in corso nella zona.`,
                why: randomIssue.why,
                status: 'analizzato'
            });
        }, 2500);
    });
};

export const getVisionHistory = (): VisionReport[] => {
    const saved = localStorage.getItem('teraia_vision_reports_v1');
    return saved ? JSON.parse(saved) : [];
};

export const saveVisionReport = (report: VisionReport) => {
    const history = getVisionHistory();
    localStorage.setItem('teraia_vision_reports_v1', JSON.stringify([report, ...history]));
};
