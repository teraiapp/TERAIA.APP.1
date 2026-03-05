
export type IrrigationMethod = 'Goccia' | 'Aspersione' | 'Subirrigazione' | 'Manuale' | 'Pivot';
export type WaterSource = 'Pozzo' | 'Consorzio' | 'Vasca' | 'Rete Idrica';
export type ZoneStatus = 'idle' | 'running' | 'error';
export type ProgramType = 'Manuale' | 'Programmata' | 'AI Consigliata';

export interface IrrigationZone {
    id: string;
    unitId: string; // Collegamento a ProductionUnit
    name: string;
    method: IrrigationMethod;
    source: WaterSource;
    area: number;
    crop: string;
    status: ZoneStatus;
    isAiRecommended: boolean;
    lastRun?: string;
    notes?: string;
}

export interface IrrigationProgram {
    id: string;
    zoneId: string;
    name: string;
    type: ProgramType;
    durationMinutes: number;
    startTime: string;
    activeDays: number[]; // 0-6 (Dom-Sab)
    isActive: boolean;
}

export interface IrrigationLog {
    id: string;
    zoneId: string;
    zoneName: string;
    date: string;
    durationMinutes: number;
    trigger: ProgramType;
    status: 'OK' | 'Errore';
}

// Initial Mock Data
export const INITIAL_ZONES: IrrigationZone[] = [
    {
        id: 'zone-1',
        unitId: 'unit-1',
        name: 'Settore Nord - Vigneto',
        method: 'Goccia',
        source: 'Pozzo',
        area: 1.5,
        crop: 'Vite',
        status: 'idle',
        isAiRecommended: true,
        notes: 'Manichetta sotterranea'
    }
];

export const INITIAL_PROGRAMS: IrrigationProgram[] = [
    {
        id: 'prog-1',
        zoneId: 'zone-1',
        name: 'Mantenimento Notturno',
        type: 'Programmata',
        durationMinutes: 45,
        startTime: '22:00',
        activeDays: [1, 3, 5],
        isActive: true
    }
];
