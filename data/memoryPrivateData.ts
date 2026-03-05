
export type PrivateNoteType = 'nota' | 'lezione appresa' | 'procedura' | 'errore' | 'strategia';

export interface PrivateNote {
    id: string;
    title: string;
    type: PrivateNoteType;
    linkedTo: string; // Nome Unità o Allevamento
    description: string;
    tags: string[];
    attachments: string[]; // Nomi file mock
    isFromCollective: boolean; // Flag se salvato da collettiva
    createdAt: string;
    updatedAt: string;
}

export const INITIAL_PRIVATE_NOTES: PrivateNote[] = [
    {
        id: 'priv-001',
        title: 'Gestione Stress Termico Serra A',
        type: 'strategia',
        linkedTo: 'Serra Pomodoro',
        description: 'L\'apertura dei colmi al 30% con temperatura esterna >32°C ha mantenuto la prefioritura stabile.',
        tags: ['Automazione', 'Caldo'],
        attachments: ['grafico_temp.pdf'],
        isFromCollective: false,
        createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 10).toISOString()
    }
];
