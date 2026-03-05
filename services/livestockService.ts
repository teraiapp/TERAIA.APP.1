
import { 
    LivestockUnit, LivestockGroup, LivestockAnimal, 
    LivestockProductionLog, LivestockFeedingLog, 
    LivestockHealthEvent, LivestockVaccinePlan, LivestockAlert,
    AssetType
} from '../types';
import { quadernoService } from './quadernoService';
import { inventoryService } from './inventoryService';
import { ledgerService } from './ledgerService';

const KEYS = {
    UNITS: 'teraia_livestock_units',
    GROUPS: 'teraia_livestock_groups',
    ANIMALS: 'teraia_livestock_animals',
    PROD_LOGS: 'teraia_livestock_production',
    FEED_LOGS: 'teraia_livestock_feeding',
    HEALTH_EVTS: 'teraia_livestock_health',
    VACCINES: 'teraia_livestock_vaccines',
    ALERTS: 'teraia_livestock_alerts'
};

const get = <T>(key: string): T[] => JSON.parse(localStorage.getItem(key) || '[]');
const set = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('teraia:data-changed', { detail: { key } }));
};

export const livestockService = {
    // UNITS
    getUnits: () => get<LivestockUnit>(KEYS.UNITS),
    saveUnit: (unit: LivestockUnit) => {
        const units = livestockService.getUnits();
        const idx = units.findIndex(u => u.id === unit.id);
        const updated = idx > -1 ? units.map(u => u.id === unit.id ? { ...unit, updatedAt: Date.now() } : u) : [...units, { ...unit, createdAt: Date.now(), updatedAt: Date.now() }];
        set(KEYS.UNITS, updated);
    },
    deleteUnit: (id: string) => set(KEYS.UNITS, livestockService.getUnits().filter(u => u.id !== id)),

    // GROUPS
    getGroups: (unitId?: string) => {
        const all = get<LivestockGroup>(KEYS.GROUPS);
        return unitId ? all.filter(g => g.unitId === unitId) : all;
    },
    saveGroup: (group: LivestockGroup) => {
        const all = livestockService.getGroups();
        const idx = all.findIndex(g => g.id === group.id);
        const updated = idx > -1 ? all.map(g => g.id === group.id ? { ...group, updatedAt: Date.now() } : g) : [...all, { ...group, createdAt: Date.now(), updatedAt: Date.now() }];
        set(KEYS.GROUPS, updated);
    },
    deleteGroup: (id: string) => set(KEYS.GROUPS, get<LivestockGroup>(KEYS.GROUPS).filter(g => g.id !== id)),

    // ANIMALS
    getAnimals: (groupId?: string) => {
        const all = get<LivestockAnimal>(KEYS.ANIMALS);
        return groupId ? all.filter(a => a.groupId === groupId) : all;
    },
    saveAnimal: (animal: LivestockAnimal) => {
        const all = get<LivestockAnimal>(KEYS.ANIMALS);
        const idx = all.findIndex(a => a.id === animal.id);
        set(KEYS.ANIMALS, idx > -1 ? all.map(a => a.id === animal.id ? animal : a) : [...all, animal]);
    },
    deleteAnimal: (id: string) => set(KEYS.ANIMALS, get<LivestockAnimal>(KEYS.ANIMALS).filter(a => a.id !== id)),

    sellAnimal: (animalId: string, price: number, customer?: string, date?: number) => {
        const animals = get<LivestockAnimal>(KEYS.ANIMALS);
        const animal = animals.find(a => a.id === animalId);
        if (!animal) return;

        const saleDate = date || Date.now();

        // Update animal status
        const updatedAnimals = animals.map(a => 
            a.id === animalId ? { ...a, status: 'VENDUTO' as const, updatedAt: Date.now() } : a
        );
        set(KEYS.ANIMALS, updatedAnimals);

        // Ledger Entry
        ledgerService.addEntry({
            date: new Date(saleDate).toISOString(),
            scope: 'ALLEVAMENTO',
            type: 'RICAVO',
            category: 'VENDITE',
            description: `Vendita Capo: ${animal.tagId} (${animal.breed || 'N/D'}) a ${customer || 'Cliente Generico'}`,
            amount: price,
            source: 'EVENTO_APP',
            unitId: animal.unitId,
            sourceRef: { module: 'ALLEVAMENTO_ANIMALI', entityId: animalId, key: 'sale' }
        });

        // Sync Quaderno
        quadernoService.addEntry({
            type: "PRODUZIONE_ALLEVAMENTO", // Using production for sales as it's the closest type
            date: saleDate,
            unitId: animal.unitId,
            notes: `Venduto capo ${animal.tagId} per € ${price.toFixed(2)}.`,
            sourceModule: "allevamento_animali",
            status: "CONFIRMED"
        });
    },

    // PRODUCTION
    getProductionLogs: (unitId?: string) => {
        const all = get<LivestockProductionLog>(KEYS.PROD_LOGS);
        return unitId ? all.filter(l => l.unitId === unitId) : all;
    },
    addProductionLog: (log: LivestockProductionLog & { salePrice?: number, customer?: string }) => {
        const all = livestockService.getProductionLogs();
        const idx = all.findIndex(l => l.id === log.id);
        const updated = idx > -1 ? all.map(l => l.id === log.id ? log : l) : [log, ...all];
        set(KEYS.PROD_LOGS, updated);
        
        // Ledger Entry if sold
        if (log.destination === 'VENDITA' && log.salePrice) {
            ledgerService.addEntry({
                date: new Date(log.date).toISOString(),
                scope: 'ALLEVAMENTO',
                type: 'RICAVO',
                category: 'VENDITE',
                description: `Vendita ${log.type}: ${log.quantity} ${log.unit} a ${log.customer || 'Cliente Generico'}`,
                amount: log.quantity * log.salePrice,
                source: 'EVENTO_APP',
                unitId: log.unitId,
                sourceRef: { module: 'ALLEVAMENTO_PRODUZIONE', entityId: log.id }
            });
        }

        // Sync Quaderno
        quadernoService.addEntry({
            type: "PRODUZIONE_ALLEVAMENTO",
            date: log.date,
            unitId: log.unitId,
            notes: `Produzione ${log.type}: ${log.quantity} ${log.unit}. Dest: ${log.destination}`,
            sourceModule: "allevamento_produzione",
            status: "CONFIRMED"
        });
    },
    deleteProductionLog: (id: string) => set(KEYS.PROD_LOGS, get<LivestockProductionLog>(KEYS.PROD_LOGS).filter(l => l.id !== id)),

    // FEEDING
    getFeedingLogs: (unitId?: string) => {
        const all = get<LivestockFeedingLog>(KEYS.FEED_LOGS);
        return unitId ? all.filter(l => l.unitId === unitId) : all;
    },
    addFeedingLog: (log: LivestockFeedingLog) => {
        const all = livestockService.getFeedingLogs();
        const idx = all.findIndex(l => l.id === log.id);
        
        // Recalculate totalCost based on inventory avgCost to ensure consistency
        const items = inventoryService.getItems();
        let calculatedTotalCost = 0;

        const updatedItems = log.items.map(item => {
            const invItem = items.find(i => i.id === item.inventoryItemId);
            const cost = invItem ? invItem.avgCost : item.cost;
            calculatedTotalCost += item.qty * cost;
            return { ...item, cost };
        });

        const finalLog = { ...log, items: updatedItems, totalCost: calculatedTotalCost };
        const updated = idx > -1 ? all.map(l => l.id === log.id ? finalLog : l) : [finalLog, ...all];
        set(KEYS.FEED_LOGS, updated);

        // Scarico Magazzino
        finalLog.items.forEach(item => {
            if (item.inventoryItemId) {
                inventoryService.registerMovement({
                    itemId: item.inventoryItemId,
                    type: 'OUT',
                    qty: item.qty,
                    source: 'livestock_feeding',
                    note: `Alimentazione unità ${log.unitId}`,
                    sourceRef: { module: 'ALLEVAMENTO_ALIMENTAZIONE', entityId: log.id, key: item.inventoryItemId }
                });
            }
        });

        // Ledger Entry
        if (calculatedTotalCost > 0) {
            ledgerService.addEntry({
                date: new Date(log.date).toISOString(),
                scope: 'ALLEVAMENTO',
                type: 'COSTO',
                category: 'MANGIMI',
                description: `Alimentazione unità ${log.unitId}`,
                amount: calculatedTotalCost,
                source: 'EVENTO_APP',
                unitId: log.unitId,
                sourceRef: { module: 'ALLEVAMENTO_ALIMENTAZIONE', entityId: log.id }
            });
        }

        // Sync Quaderno
        quadernoService.addEntry({
            type: "ALIMENTAZIONE_ALLEVAMENTO",
            date: log.date,
            unitId: log.unitId,
            notes: `Somministrati mangimi per un totale di € ${calculatedTotalCost.toFixed(2)}.`,
            sourceModule: "allevamento_alimentazione",
            status: "CONFIRMED",
            cost: calculatedTotalCost
        });
    },
    deleteFeedingLog: (id: string) => set(KEYS.FEED_LOGS, get<LivestockFeedingLog>(KEYS.FEED_LOGS).filter(l => l.id !== id)),

    // HEALTH
    getHealthEvents: (unitId?: string) => {
        const all = get<LivestockHealthEvent>(KEYS.HEALTH_EVTS);
        return unitId ? all.filter(e => e.unitId === unitId) : all;
    },
    addHealthEvent: (evt: LivestockHealthEvent) => {
        const all = livestockService.getHealthEvents();
        const idx = all.findIndex(e => e.id === evt.id);
        const updated = idx > -1 ? all.map(e => e.id === evt.id ? evt : e) : [evt, ...all];
        set(KEYS.HEALTH_EVTS, updated);

        let eventCost = evt.manualCost || 0;

        // Inventory Movement if product used
        if (evt.inventoryItemId && evt.inventoryQty) {
            const res = inventoryService.registerMovement({
                itemId: evt.inventoryItemId,
                type: 'OUT',
                qty: evt.inventoryQty,
                source: 'livestock_sanitary',
                note: `Trattamento sanitario: ${evt.title}`,
                sourceRef: { module: 'ALLEVAMENTO_SANITA', entityId: evt.id, key: 'product' }
            });
            if (res?.success && res.movement) {
                eventCost += res.movement.totalCost || 0;
            }
        }

        // Ledger Entry
        if (eventCost > 0) {
            ledgerService.addEntry({
                date: new Date(evt.date).toISOString(),
                scope: 'ALLEVAMENTO',
                type: 'COSTO',
                category: evt.category === 'VISITA' ? 'VETERINARIO' : 'FARMACI',
                description: `${evt.title}: ${evt.description}`,
                amount: eventCost,
                source: 'EVENTO_APP',
                unitId: evt.unitId,
                sourceRef: { module: 'ALLEVAMENTO_SANITA', entityId: evt.id }
            });
        }

        quadernoService.addEntry({
            type: evt.category === 'VISITA' ? "VISITA_VETERINARIA" : "EVENTO_SANITARIO",
            date: evt.date,
            unitId: evt.unitId,
            notes: `${evt.title}: ${evt.description}. Prodotto: ${evt.productName || 'N/D'}`,
            sourceModule: "allevamento_sanita",
            status: "CONFIRMED",
            cost: eventCost
        });
    },
    deleteHealthEvent: (id: string) => set(KEYS.HEALTH_EVTS, get<LivestockHealthEvent>(KEYS.HEALTH_EVTS).filter(e => e.id !== id)),

    // VACCINES
    getVaccinePlans: (unitId?: string) => {
        const all = get<LivestockVaccinePlan>(KEYS.VACCINES);
        return unitId ? all.filter(p => p.unitId === unitId) : all;
    },
    saveVaccinePlan: (plan: LivestockVaccinePlan) => {
        const all = get<LivestockVaccinePlan>(KEYS.VACCINES);
        const idx = all.findIndex(p => p.id === plan.id);
        set(KEYS.VACCINES, idx > -1 ? all.map(p => p.id === plan.id ? plan : p) : [...all, plan]);
    },
    markVaccineDone: (planId: string, rowId: string) => {
        const plans = livestockService.getVaccinePlans();
        const updated = plans.map(p => {
            if (p.id === planId) {
                const updatedRows = p.rows.map(r => {
                    if (r.id === rowId) {
                        const nowStr = new Date().toISOString().split('T')[0];
                        const next = new Date();
                        next.setDate(next.getDate() + r.frequencyDays);
                        
                        // Crea evento sanitario automatico
                        livestockService.addHealthEvent({
                            id: `he-vac-${Date.now()}`,
                            unitId: p.unitId,
                            date: Date.now(),
                            category: "TRATTAMENTO",
                            title: `Vaccinazione: ${r.vaccineName}`,
                            description: `Somministrazione programmata eseguita.`,
                            productName: r.vaccineName
                        });

                        return { ...r, lastDate: nowStr, nextDueDate: next.toISOString().split('T')[0] };
                    }
                    return r;
                });
                return { ...p, rows: updatedRows };
            }
            return p;
        });
        set(KEYS.VACCINES, updated);
    },

    // ALERTS
    getAlerts: () => get<LivestockAlert>(KEYS.ALERTS),
    addAlert: (alert: LivestockAlert) => set(KEYS.ALERTS, [alert, ...livestockService.getAlerts()]),
    markAlertRead: (id: string) => set(KEYS.ALERTS, livestockService.getAlerts().map(a => a.id === id ? { ...a, read: true } : a)),

    // DEMO DATA
    seedDemo: () => {
        if (livestockService.getUnits().length > 0) return;
        const uId = "unit-demo-stalla";
        livestockService.saveUnit({
            id: uId, name: "Stalla Principale Frisona", species: "BOVINI", purpose: ["LATTE"], system: "STALLA",
            location: { region: "Lombardia", province: "MI", city: "Milano" },
            capacityEstimate: 50, createdAt: Date.now(), updatedAt: Date.now()
        });
        livestockService.saveGroup({
            id: "grp-demo-1", unitId: uId, name: "Vacche in Lattazione", category: "Lattazione", trackingMode: "GROUP", headCount: 30, createdAt: Date.now(), updatedAt: Date.now()
        });
        
        // Aggiungi una produzione oggi per test KPI
        livestockService.addProductionLog({
            id: 'demo-prod-1', unitId: uId, date: Date.now(), type: 'LATTE', quantity: 450, unit: 'LT', destination: 'VENDITA', createdAt: Date.now()
        });

        livestockService.saveVaccinePlan({
            id: "plan-demo-1", unitId: uId, name: "Piano IBR 2024", species: "BOVINI", rows: [
                { id: "r1", vaccineName: "IBR Marker", frequencyDays: 180, nextDueDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0], active: true }
            ]
        });
        livestockService.addAlert({
            id: "al-1", scope: "REGION", region: "Lombardia", disease: "Blue Tongue", severity: "high",
            message: "Rilevato focolaio di Blue Tongue nel raggio di 20km. Monitorare insetti vettori.",
            source: "MINISTERO", date: Date.now(), read: false
        });
    }
};
