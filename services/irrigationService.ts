
import { 
    IrrigationZone, IrrigationRun, 
    AiProposal, EcData
} from '../types';
import { quadernoService } from './quadernoService';

// CHIAVI STANDARD
export const STORAGE_KEYS = {
    QUADERNO: 'teraia_quaderno_entries',
    RUNS: 'teraia_irrigation_runs',
    ACTIVE: 'teraia_irrigation_active_run',
    ZONES: 'teraia_irrigation_zones_oper_v1',
    PROFILE: 'teraia_profile_v4',
    SCHEDULES: 'teraia_irrigation_schedules_v1'
};

export const saveToStorage = (key: string, value: any) => {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent("teraia:data-changed", { detail: { key } }));
};

export const irrigationService = {
    getZones: (): IrrigationZone[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.ZONES) || '[]'),
    saveZones: (zones: IrrigationZone[]) => saveToStorage(STORAGE_KEYS.ZONES, zones),
    
    getRuns: (): any[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.RUNS) || '[]'),
    getActiveRun: (): any | null => JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVE) || 'null'),

    generateAiProposal: (zone: IrrigationZone): AiProposal => {
        const profile = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILE) || 'null');
        let baseMinutes = 40;
        if (profile?.goals.includes('Risparmiare acqua e costi')) baseMinutes *= 0.85;
        
        return {
            suggestedDurationMin: Math.min(Math.round(baseMinutes), zone.maxRunMinutes),
            suggestedVolumeL: Math.round(baseMinutes * zone.flowRateLpm),
            suggestedEcTargetMsCm: 1.5,
            reasoningShort: `Ottimizzazione basata su obiettivi aziendali.`,
            confidence: 0.85,
            factors: ["Meteo", "Dati Storici"]
        };
    },

    startRun: (params: { 
        zoneId: string, 
        mode: 'manual' | 'ai', 
        plannedDurationMin: number, 
        plannedVolumeL: number,
        ec: EcData
    }) => {
        const zones = irrigationService.getZones();
        const zone = zones.find(z => z.id === params.zoneId);
        if (!zone) return;

        const now = Date.now();
        const activeRun = {
            id: `run-${now}`,
            zoneId: zone.id,
            zoneName: zone.name,
            unitId: zone.unitId,
            mode: params.mode,
            plannedMin: params.plannedDurationMin,
            flowLpm: zone.flowRateLpm,
            startedAt: now,
            ec: params.ec
        };

        saveToStorage(STORAGE_KEYS.ACTIVE, activeRun);
        const updatedZones = zones.map(z => z.id === zone.id ? { ...z, isRunning: true, runningSince: now } : z);
        irrigationService.saveZones(updatedZones);
    },

    startZone: (zoneId: string, durationMin: number, trigger: string) => {
        const zones = irrigationService.getZones();
        const zone = zones.find(z => z.id === zoneId);
        if (!zone) return;
        irrigationService.startRun({
            zoneId,
            mode: 'manual',
            plannedDurationMin: durationMin,
            plannedVolumeL: durationMin * zone.flowRateLpm,
            ec: { enabled: false, targetMsCm: null, source: "none", sensor: { available: false, lastValueMsCm: null, lastUpdatedAt: null }, manual: { startMsCm: null, endMsCm: null, singleMsCm: null } }
        });
    },

    stopRun: () => {
        const active = irrigationService.getActiveRun();
        if (!active) return;

        const now = Date.now();
        const durationMin = Math.max(1, Math.ceil((now - active.startedAt) / 60000));
        const volumeLiters = active.flowLpm ? active.flowLpm * durationMin : null;

        // 1. Storico Runs interno
        const runs = irrigationService.getRuns();
        const runRecord = {
            ...active,
            stoppedAt: now,
            actualDurationMin: durationMin,
            volumeLiters: volumeLiters,
            status: 'completed'
        };
        saveToStorage(STORAGE_KEYS.RUNS, [runRecord, ...runs]);

        // 2. ENTRY QUADERNO (STEP 1 STANDARD)
        quadernoService.addEntry({
            type: "IRRIGAZIONE",
            date: now,
            unitId: active.unitId,
            zoneId: active.zoneId,
            zoneName: active.zoneName,
            quantities: {
                durationMin: durationMin,
                volumeLiters: volumeLiters,
                unit: "L"
            },
            notes: `Ciclo ${active.mode} completato correttamente.`,
            sourceModule: "irrigazione",
            status: "CONFIRMED"
        });

        // 3. Reset
        saveToStorage(STORAGE_KEYS.ACTIVE, null);
        const zones = irrigationService.getZones();
        irrigationService.saveZones(zones.map(z => z.id === active.zoneId ? { ...z, isRunning: false, runningSince: undefined, lastRunAt: now } : z));
    },

    calculateNextRun: (s: any): string => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        const [h, m] = s.startTime.split(':');
        d.setHours(parseInt(h), parseInt(m), 0, 0);
        return d.toISOString();
    },

    getSchedules: (): any[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.SCHEDULES) || '[]'),
    saveSchedules: (schedules: any[]) => saveToStorage(STORAGE_KEYS.SCHEDULES, schedules)
};
