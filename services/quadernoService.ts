
import { QuadernoEntry } from '../types';

const QUADERNO_KEY = 'teraia_quaderno_entries';
const DATA_CHANGED_EVENT = 'teraia:data-changed';

export const quadernoService = {
    getEntries: (): QuadernoEntry[] => {
        const data = localStorage.getItem(QUADERNO_KEY);
        return data ? JSON.parse(data) : [];
    },

    saveToStorage: (entries: QuadernoEntry[]) => {
        localStorage.setItem(QUADERNO_KEY, JSON.stringify(entries));
        window.dispatchEvent(new CustomEvent(DATA_CHANGED_EVENT, { 
            detail: { key: QUADERNO_KEY, timestamp: Date.now() } 
        }));
    },

    addEntry: (entry: Omit<QuadernoEntry, 'id' | 'createdAt'>) => {
        const entries = quadernoService.getEntries();
        const newEntry: QuadernoEntry = {
            ...entry,
            id: `qe-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            createdAt: Date.now(),
            date: entry.date || Date.now(),
            status: entry.status || "CONFIRMED"
        };
        const updated = [newEntry, ...entries];
        quadernoService.saveToStorage(updated);
        return newEntry;
    },

    updateEntry: (id: string, patch: Partial<QuadernoEntry>) => {
        const entries = quadernoService.getEntries();
        const updated = entries.map(e => e.id === id ? { ...e, ...patch } : e);
        quadernoService.saveToStorage(updated);
    },

    deleteEntry: (id: string) => {
        const entries = quadernoService.getEntries();
        const updated = entries.filter(e => e.id !== id);
        quadernoService.saveToStorage(updated);
    },

    // Filtri rapidi
    getEntriesByUnit: (unitId: string) => {
        return quadernoService.getEntries().filter(e => e.unitId === unitId);
    }
};
