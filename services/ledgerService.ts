
import { LedgerEntry, LedgerScope, LedgerType, LedgerCategory } from '../types';

const LEDGER_KEY = 'teraiav1_ledger_entries';

export const ledgerService = {
  getEntries: (): LedgerEntry[] => {
    const data = localStorage.getItem(LEDGER_KEY);
    return data ? JSON.parse(data) : [];
  },

  addEntry: (entry: Omit<LedgerEntry, 'id' | 'createdAt' | 'currency'>) => {
    const entries = ledgerService.getEntries();

    // Dedup logic: if sourceRef exists, check if it's already present
    if (entry.sourceRef) {
      const exists = entries.find(e => 
        e.sourceRef?.module === entry.sourceRef?.module && 
        e.sourceRef?.entityId === entry.sourceRef?.entityId &&
        e.sourceRef?.key === entry.sourceRef?.key
      );
      if (exists) {
        console.warn('LedgerEntry already exists for this sourceRef', entry.sourceRef);
        return { success: false, error: 'DUPLICATE', id: exists.id };
      }
    }

    const newEntry: LedgerEntry = {
      ...entry,
      id: `ledger-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      currency: 'EUR',
      createdAt: new Date().toISOString(),
      paymentStatus: entry.type === 'COSTO' ? 'DA_PAGARE' : 'PAGATO'
    };

    const updated = [newEntry, ...entries];
    localStorage.setItem(LEDGER_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('teraia:ledger-changed', { detail: { entry: newEntry } }));
    return { success: true, entry: newEntry };
  },

  deleteEntry: (id: string) => {
    const entries = ledgerService.getEntries().filter(e => e.id !== id);
    localStorage.setItem(LEDGER_KEY, JSON.stringify(entries));
    window.dispatchEvent(new CustomEvent('teraia:ledger-changed'));
  },

  computeSummary: (filters: { 
    scope?: LedgerScope | 'ALL', 
    unitId?: string, 
    dateRange?: { start: string, end: string },
    type?: LedgerType,
    category?: LedgerCategory
  }) => {
    let entries = ledgerService.getEntries();

    if (filters.scope && filters.scope !== 'ALL') {
      entries = entries.filter(e => e.scope === filters.scope);
    }
    if (filters.unitId) {
      entries = entries.filter(e => e.unitId === filters.unitId);
    }
    if (filters.dateRange) {
      const start = new Date(filters.dateRange.start).getTime();
      const end = new Date(filters.dateRange.end).getTime();
      entries = entries.filter(e => {
        const d = new Date(e.date).getTime();
        return d >= start && d <= end;
      });
    }
    if (filters.type) {
      entries = entries.filter(e => e.type === filters.type);
    }
    if (filters.category) {
      entries = entries.filter(e => e.category === filters.category);
    }

    const costs = entries.filter(e => e.type === 'COSTO').reduce((sum, e) => sum + e.amount, 0);
    const revenues = entries.filter(e => e.type === 'RICAVO').reduce((sum, e) => sum + e.amount, 0);

    return {
      costs,
      revenues,
      margin: revenues - costs,
      count: entries.length
    };
  }
};
