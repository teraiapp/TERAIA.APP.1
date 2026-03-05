
export interface Adversity {
    key: string;
    label: string;
    cropKeys: string[];
}

export const AVVERSITA: Adversity[] = [
    { key: 'peronospora', label: 'Peronospora', cropKeys: ['vite', 'pomodoro', 'patata'] },
    { key: 'oidio', label: 'Oidio (Mal Bianco)', cropKeys: ['vite', 'pomodoro', 'pesco', 'melo'] },
    { key: 'botrite', label: 'Botrite (Muffa Grigia)', cropKeys: ['vite', 'pomodoro', 'fragola'] },
    { key: 'tignola', label: 'Tignola della Vite', cropKeys: ['vite'] },
    { key: 'mosca_olivo', label: 'Mosca dell\'Olivo', cropKeys: ['ulivo'] },
    { key: 'occhio_pavone', label: 'Occhio di Pavone', cropKeys: ['ulivo'] },
    { key: 'afidi', label: 'Afidi', cropKeys: ['pomodoro', 'pesco', 'melo', 'ortaggi'] },
    { key: 'ragnetto_rosso', label: 'Ragnetto Rosso', cropKeys: ['melo', 'pomodoro', 'vite'] }
];
