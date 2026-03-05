
import { 
    LivestockUnit, LivestockProductionEntry, LivestockFeedingEntry, 
    LivestockWelfareEntry, LivestockHealthEntry, LivestockDeadline,
    LivestockVetAssignment
} from '../types';

const KEYS = {
    UNITS: 'teraia_livestock_units',
    PRODUCTION: 'teraia_livestock_production',
    FEEDING: 'teraia_livestock_feeding',
    WELFARE: 'teraia_livestock_welfare',
    HEALTH: 'teraia_livestock_health',
    DEADLINES: 'teraia_livestock_deadlines',
    VETS: 'teraia_livestock_vets'
};

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const loadFromStorage = <T>(key: string, fallback: T): T => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
};

export const saveToStorage = <T>(key: string, data: T): void => {
    localStorage.setItem(key, JSON.stringify(data));
};

export const livestockStorage = {
    // Units
    getUnits: () => loadFromStorage<LivestockUnit[]>(KEYS.UNITS, []),
    saveUnit: (unit: LivestockUnit) => {
        const units = livestockStorage.getUnits();
        const index = units.findIndex(u => u.id === unit.id);
        if (index > -1) units[index] = unit;
        else units.push(unit);
        saveToStorage(KEYS.UNITS, units);
    },
    deleteUnit: (id: string) => {
        const units = livestockStorage.getUnits().filter(u => u.id !== id);
        saveToStorage(KEYS.UNITS, units);
        // Cascading delete
        saveToStorage(KEYS.PRODUCTION, livestockStorage.getProduction(id).filter(e => e.unitId !== id));
        saveToStorage(KEYS.FEEDING, livestockStorage.getFeeding(id).filter(e => e.unitId !== id));
        saveToStorage(KEYS.WELFARE, livestockStorage.getWelfare(id).filter(e => e.unitId !== id));
        saveToStorage(KEYS.HEALTH, livestockStorage.getHealth(id).filter(e => e.unitId !== id));
        saveToStorage(KEYS.DEADLINES, livestockStorage.getDeadlines(id).filter(e => e.unitId !== id));
    },

    // Production
    getProduction: (unitId?: string) => {
        const all = loadFromStorage<LivestockProductionEntry[]>(KEYS.PRODUCTION, []);
        return unitId ? all.filter(e => e.unitId === unitId) : all;
    },
    saveProduction: (entry: LivestockProductionEntry) => {
        const all = loadFromStorage<LivestockProductionEntry[]>(KEYS.PRODUCTION, []);
        const idx = all.findIndex(e => e.id === entry.id);
        if (idx > -1) all[idx] = entry; else all.push(entry);
        saveToStorage(KEYS.PRODUCTION, all);
    },
    deleteProduction: (id: string) => {
        const all = loadFromStorage<LivestockProductionEntry[]>(KEYS.PRODUCTION, []).filter(e => e.id !== id);
        saveToStorage(KEYS.PRODUCTION, all);
    },

    // Feeding
    getFeeding: (unitId?: string) => {
        const all = loadFromStorage<LivestockFeedingEntry[]>(KEYS.FEEDING, []);
        return unitId ? all.filter(e => e.unitId === unitId) : all;
    },
    saveFeeding: (entry: LivestockFeedingEntry) => {
        const all = loadFromStorage<LivestockFeedingEntry[]>(KEYS.FEEDING, []);
        const idx = all.findIndex(e => e.id === entry.id);
        if (idx > -1) all[idx] = entry; else all.push(entry);
        saveToStorage(KEYS.FEEDING, all);
    },
    deleteFeeding: (id: string) => {
        const all = loadFromStorage<LivestockFeedingEntry[]>(KEYS.FEEDING, []).filter(e => e.id !== id);
        saveToStorage(KEYS.FEEDING, all);
    },

    // Welfare
    getWelfare: (unitId?: string) => {
        const all = loadFromStorage<LivestockWelfareEntry[]>(KEYS.WELFARE, []);
        return unitId ? all.filter(e => e.unitId === unitId) : all;
    },
    saveWelfare: (entry: LivestockWelfareEntry) => {
        const all = loadFromStorage<LivestockWelfareEntry[]>(KEYS.WELFARE, []);
        const idx = all.findIndex(e => e.id === entry.id);
        if (idx > -1) all[idx] = entry; else all.push(entry);
        saveToStorage(KEYS.WELFARE, all);
    },
    deleteWelfare: (id: string) => {
        const all = loadFromStorage<LivestockWelfareEntry[]>(KEYS.WELFARE, []).filter(e => e.id !== id);
        saveToStorage(KEYS.WELFARE, all);
    },

    // Health
    getHealth: (unitId?: string) => {
        const all = loadFromStorage<LivestockHealthEntry[]>(KEYS.HEALTH, []);
        return unitId ? all.filter(e => e.unitId === unitId) : all;
    },
    saveHealth: (entry: LivestockHealthEntry) => {
        const all = loadFromStorage<LivestockHealthEntry[]>(KEYS.HEALTH, []);
        const idx = all.findIndex(e => e.id === entry.id);
        if (idx > -1) all[idx] = entry; else all.push(entry);
        saveToStorage(KEYS.HEALTH, all);
    },
    deleteHealth: (id: string) => {
        const all = loadFromStorage<LivestockHealthEntry[]>(KEYS.HEALTH, []).filter(e => e.id !== id);
        saveToStorage(KEYS.HEALTH, all);
    },

    // Deadlines
    getDeadlines: (unitId?: string) => {
        const all = loadFromStorage<LivestockDeadline[]>(KEYS.DEADLINES, []);
        return unitId ? all.filter(e => e.unitId === unitId) : all;
    },
    saveDeadline: (entry: LivestockDeadline) => {
        const all = loadFromStorage<LivestockDeadline[]>(KEYS.DEADLINES, []);
        const idx = all.findIndex(e => e.id === entry.id);
        if (idx > -1) all[idx] = entry; else all.push(entry);
        saveToStorage(KEYS.DEADLINES, all);
    },
    deleteDeadline: (id: string) => {
        const all = loadFromStorage<LivestockDeadline[]>(KEYS.DEADLINES, []).filter(e => e.id !== id);
        saveToStorage(KEYS.DEADLINES, all);
    },

    // Vets
    getVets: () => loadFromStorage<LivestockVetAssignment[]>(KEYS.VETS, []),
    saveVet: (vet: LivestockVetAssignment) => {
        const all = loadFromStorage<LivestockVetAssignment[]>(KEYS.VETS, []);
        const idx = all.findIndex(v => v.id === vet.id);
        if (idx > -1) all[idx] = vet; else all.push(vet);
        saveToStorage(KEYS.VETS, all);
    },
    deleteVet: (id: string) => {
        const all = loadFromStorage<LivestockVetAssignment[]>(KEYS.VETS, []).filter(v => v.id !== id);
        saveToStorage(KEYS.VETS, all);
    }
};

// Initial Seed
if (livestockStorage.getUnits().length === 0) {
    // Fix: Updated initial seed data with correct enum values and types (createdAt: number, species: uppercase)
    // Added capacityEstimate property.
    const unit1: LivestockUnit = { 
        id: 'u-1', 
        name: 'Stalla Frisona A', 
        species: 'BOVINI', 
        purpose: ['LATTE'], 
        system: 'STALLA', 
        headCount: 45, 
        capacityEstimate: 50,
        createdAt: Date.now(), 
        updatedAt: Date.now(),
        location: { region: "Toscana", province: "FI", city: "Siena" }
    };
    const unit2: LivestockUnit = { 
        id: 'u-2', 
        name: 'Capannone Ovaiole', 
        species: 'POLLAME', 
        purpose: ['UOVA'], 
        system: 'MISTO', 
        headCount: 120, 
        capacityEstimate: 150,
        createdAt: Date.now(), 
        updatedAt: Date.now(),
        location: { region: "Sicilia", province: "CT", city: "Pachino" }
    };
    livestockStorage.saveUnit(unit1);
    livestockStorage.saveUnit(unit2);
    
    livestockStorage.saveProduction({ 
        id: 'p-1', 
        unitId: 'u-1', 
        date: Date.now(), 
        quantity: 950,
        unit: "litri",
        type: "LATTE",
        destination: "VENDITA",
        milkLiters: 950, 
        // Fix: notes property exists on interface
        notes: 'Produzione stabile',
        createdAt: Date.now()
    });
    livestockStorage.saveHealth({ 
        id: 'h-1', 
        unitId: 'u-1', 
        date: Date.now(), 
        category: 'TRATTAMENTO',
        title: 'Richiamo IBR',
        description: 'Richiamo IBR', 
        eventType: 'vaccino', 
        // Fix: changed 'veterinarian' to 'vetId' placeholder or added to interface
        veterinarian: 'Dr. Rossi' 
    });
    livestockStorage.saveDeadline({ 
        id: 'd-1', 
        unitId: 'u-2', 
        dueDate: new Date(Date.now() + 864000000).toISOString().split('T')[0], 
        title: 'Pulizia lettiere', 
        status: 'da_fare', 
        createdAt: new Date().toISOString() 
    });
}
