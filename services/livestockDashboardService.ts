
import { livestockService } from './livestockService';
import { quadernoService } from './quadernoService';
import { inventoryService } from './inventoryService';
import { AssetType, Role } from '../types';

export const livestockDashboardService = {
    // Fix: Added missing getLivestockKpis method
    getLivestockKpis: () => {
        const units = livestockService.getUnits();
        const alerts = livestockService.getAlerts().filter(a => !a.read);
        const plans = livestockService.getVaccinePlans();
        const overdueVaccines = plans.flatMap(p => p.rows.filter(r => r.active && new Date(r.nextDueDate).getTime() < Date.now())).length;

        return {
            totalUnits: units.length,
            activeAlerts: alerts.length,
            overdueVaccines: overdueVaccines
        };
    },

    getTotalsToday: () => {
        const now = new Date().toDateString();
        const prod = livestockService.getProductionLogs();
        const feed = livestockService.getFeedingLogs();
        const health = livestockService.getHealthEvents();

        const todayProd = prod.filter(l => new Date(l.date).toDateString() === now);
        const todayFeed = feed.filter(l => new Date(l.date).toDateString() === now);
        const todayHealth = health.filter(l => new Date(l.date).toDateString() === now);

        return {
            milk: todayProd.filter(p => p.type === 'LATTE').reduce((acc, p) => acc + p.quantity, 0),
            eggs: todayProd.filter(p => p.type === 'UOVA').reduce((acc, p) => acc + p.quantity, 0),
            feedCost: todayFeed.reduce((acc, f) => acc + f.totalCost, 0),
            healthEvents: todayHealth.length
        };
    },

    getUpcoming: () => {
        const now = Date.now();
        const thirtyDays = now + (30 * 86400000);
        
        // Vaccini dai piani
        const plans = livestockService.getVaccinePlans();
        const upcomingVaccines = plans.flatMap(p => 
            p.rows.filter(r => {
                const due = new Date(r.nextDueDate).getTime();
                return r.active && due >= now && due <= thirtyDays;
            }).map(r => ({ ...r, unitName: p.name, type: 'VACCINO' }))
        );

        // Follow-up sanitari
        const health = livestockService.getHealthEvents();
        const followUps = health.filter(e => {
            if (!e.followUpDate) return false;
            const due = new Date(e.followUpDate).getTime();
            return due >= now && due <= thirtyDays;
        }).map(e => ({ title: e.title, date: e.followUpDate!, type: 'FOLLOW_UP' }));

        // Fix: Sort with proper type checks for date vs nextDueDate
        return [...upcomingVaccines, ...followUps].sort((a, b) => {
            const dateA = (a as any).date ? new Date((a as any).date).getTime() : new Date((a as any).nextDueDate).getTime();
            const dateB = (b as any).date ? new Date((b as any).date).getTime() : new Date((b as any).nextDueDate).getTime();
            return dateA - dateB;
        }).slice(0, 5);
    },

    getWellbeingScore: () => {
        const now = Date.now();
        const sevenDaysAgo = now - (7 * 86400000);
        const health = livestockService.getHealthEvents();
        const feed = livestockService.getFeedingLogs();
        const units = livestockService.getUnits();

        let score = 80; // Base
        const reasons: string[] = [];

        // Regola 1: Eventi sanitari recenti
        const recentIssues = health.filter(e => e.date >= sevenDaysAgo && (e.category === 'MALATTIA' || e.category === 'SINTOMO'));
        if (recentIssues.length > 2) {
            score -= 15;
            reasons.push(`${recentIssues.length} anomalie sanitarie nell'ultima settimana`);
        } else if (recentIssues.length === 0) {
            score += 10;
            reasons.push("Nessun segnale di malattia recente");
        }

        // Regola 2: Continuità alimentare
        if (units.length > 0) {
            const lastFeed = feed.length > 0 ? Math.max(...feed.map(f => f.date)) : 0;
            if (now - lastFeed > (2 * 86400000)) {
                score -= 20;
                reasons.push("Registrazione alimentazione mancante da > 48h");
            }
        }

        // Regola 3: Vaccini
        const plans = livestockService.getVaccinePlans();
        const overdue = plans.some(p => p.rows.some(r => r.active && new Date(r.nextDueDate).getTime() < now));
        if (overdue) {
            score -= 10;
            reasons.push("Piani vaccinali con scadenze superate");
        }

        return { score: Math.max(0, Math.min(100, score)), reasons: reasons.slice(0, 3) };
    },

    getUnitBadges: (unitId: string) => {
        const now = Date.now();
        const badges: string[] = [];
        
        // 1. Mangimi sotto soglia
        const inventory = inventoryService.getItems();
        const lowStock = inventory.some(i => 
            (i.category.toLowerCase().includes('mangime') || i.category.toLowerCase().includes('integratore')) &&
            i.currentQty <= (i.minThreshold || 0)
        );
        if (lowStock) badges.push("SOTTO SOGLIA MANGIMI");

        // 2. Follow up imminente
        const health = livestockService.getHealthEvents(unitId);
        const hasFollowUp = health.some(e => e.followUpDate && new Date(e.followUpDate).getTime() < (now + 7 * 86400000));
        if (hasFollowUp) badges.push("FOLLOW-UP RICHIESTO");

        // 3. Vaccino imminente
        const plans = livestockService.getVaccinePlans(unitId);
        const dueSoon = plans.some(p => p.rows.some(r => r.active && new Date(r.nextDueDate).getTime() < (now + 14 * 86400000)));
        if (dueSoon) badges.push("VACCINO IN SCADENZA");

        return badges;
    }
};
