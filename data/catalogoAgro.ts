
export interface CropDefinition {
    crop_key: string;
    label: string;
    category: string;
    group: 'ortaggi' | 'fruttiferi' | 'cereali' | 'altro';
    typical_problems: string[];
    supported_units: string[];
    is_perennial: boolean;
}

export interface StageDefinition {
    stage_key: string;
    label: string;
    group?: string;
}

export interface ProblemDefinition {
    problem_key: string;
    label: string;
    type: 'fungo' | 'insetto' | 'acaro' | 'batterio' | 'fisiopatia' | 'nutrizione';
}

export const CROP_CATALOG: CropDefinition[] = [
    { crop_key: 'pomodoro', label: 'Pomodoro', category: 'Ortaggi da frutto', group: 'ortaggi', typical_problems: ['peronospora', 'oidio', 'afidi', 'botrite', 'ragnetto_rosso'], supported_units: ['Serra', 'Campo Aperto'], is_perennial: false },
    { crop_key: 'peperone', label: 'Peperone', category: 'Ortaggi da frutto', group: 'ortaggi', typical_problems: ['oidio', 'afidi', 'tripidi'], supported_units: ['Serra', 'Campo Aperto'], is_perennial: false },
    { crop_key: 'lattuga', label: 'Lattuga', category: 'Ortaggi da foglia', group: 'ortaggi', typical_problems: ['peronospora', 'afidi', 'lumache'], supported_units: ['Campo Aperto', 'Serra'], is_perennial: false },
    { crop_key: 'vite', label: 'Vite', category: 'Vigneto', group: 'fruttiferi', typical_problems: ['peronospora', 'oidio', 'botrite', 'tignola_vite'], supported_units: ['Arboreto'], is_perennial: true },
    { crop_key: 'ulivo', label: 'Ulivo', category: 'Oliveto', group: 'fruttiferi', typical_problems: ['mosca_olivo', 'occhio_pavone', 'rogna_ulivo'], supported_units: ['Arboreto'], is_perennial: true },
    { crop_key: 'agrumi', label: 'Agrumi', category: 'Agrumeto', group: 'fruttiferi', typical_problems: ['afidi', 'cocciniglia', 'tripidi'], supported_units: ['Arboreto'], is_perennial: true },
    { crop_key: 'patata', label: 'Patata', category: 'Ortaggi da tubero', group: 'ortaggi', typical_problems: ['peronospora', 'dorifora'], supported_units: ['Campo Aperto'], is_perennial: false },
];

export const STAGE_CATALOG: StageDefinition[] = [
    { stage_key: 'generico', label: 'Generico / Qualsiasi' },
    { stage_key: 'trapianto_semina', label: 'Trapianto / Semina' },
    { stage_key: 'accrescimento', label: 'Accrescimento Vegetativo' },
    { stage_key: 'pre_fioritura', label: 'Pre-Fioritura' },
    { stage_key: 'fioritura', label: 'Fioritura' },
    { stage_key: 'allegagione', label: 'Allegagione' },
    { stage_key: 'ingrossamento', label: 'Ingrossamento Frutti' },
    { stage_key: 'maturazione', label: 'Maturazione / Invaiatura' },
    { stage_key: 'post_raccolta', label: 'Post-Raccolta' },
    { stage_key: 'dormienza', label: 'Dormienza (Arborei)', group: 'fruttiferi' },
];

export const PROBLEM_CATALOG: ProblemDefinition[] = [
    { problem_key: 'peronospora', label: 'Peronospora', type: 'fungo' },
    { problem_key: 'oidio', label: 'Oidio (Mal Bianco)', type: 'fungo' },
    { problem_key: 'botrite', label: 'Botrite (Muffa Grigia)', type: 'fungo' },
    { problem_key: 'afidi', label: 'Afidi', type: 'insetto' },
    { problem_key: 'tripidi', label: 'Tripidi', type: 'insetto' },
    { problem_key: 'ragnetto_rosso', label: 'Ragnetto Rosso', type: 'acaro' },
    { problem_key: 'mosca_olivo', label: 'Mosca dell\'Olivo', type: 'insetto' },
    { problem_key: 'tignola_vite', label: 'Tignola della Vite', type: 'insetto' },
    { problem_key: 'carenza_azoto', label: 'Carenza di Azoto', type: 'nutrizione' },
    { problem_key: 'stress_idrico', label: 'Stress Idrico', type: 'fisiopatia' },
];
