
import { InventoryItem, InventoryMovement, MovementType, MovementSource } from '../types';

const ITEMS_KEY = 'teraiav1_inventory_items';
const MOVS_KEY = 'teraiav1_inventory_movements';

export const inventoryService = {
  // --- READ ---
  getItems: (): InventoryItem[] => {
    const data = localStorage.getItem(ITEMS_KEY);
    return data ? JSON.parse(data) : [];
  },

  getMovements: (): InventoryMovement[] => {
    const data = localStorage.getItem(MOVS_KEY);
    return data ? JSON.parse(data) : [];
  },

  // --- WRITE ---
  saveItem: (item: Omit<InventoryItem, 'id' | 'createdAt' | 'currentQty' | 'avgCost'>) => {
    const items = inventoryService.getItems();
    
    // Check for duplicates
    const duplicate = items.find(i => 
      i.name.toLowerCase() === item.name.toLowerCase() && 
      i.category === item.category && 
      i.unit === item.unit
    );

    if (duplicate) return { error: 'DUPLICATE', id: duplicate.id };

    const newItem: InventoryItem = {
      ...item,
      id: `item-${Date.now()}`,
      currentQty: 0,
      avgCost: 0,
      createdAt: new Date().toISOString()
    };

    localStorage.setItem(ITEMS_KEY, JSON.stringify([...items, newItem]));
    return { success: true, item: newItem };
  },

  registerMovement: (params: {
    itemId: string;
    type: MovementType;
    qty: number;
    unitCost?: number;
    source: MovementSource;
    note?: string;
    sourceRef?: { module: string; entityId: string; key?: string };
  }) => {
    const items = inventoryService.getItems();
    const movements = inventoryService.getMovements();

    // Dedup logic for movements
    if (params.sourceRef) {
      const exists = movements.find(m => 
        m.sourceRef?.module === params.sourceRef?.module && 
        m.sourceRef?.entityId === params.sourceRef?.entityId &&
        m.sourceRef?.key === params.sourceRef?.key
      );
      if (exists) return { success: false, error: 'DUPLICATE', id: exists.id };
    }

    const itemIndex = items.findIndex(i => i.id === params.itemId);
    if (itemIndex === -1) return { error: 'NOT_FOUND' };

    const item = items[itemIndex];
    const oldQty = item.currentQty;
    const oldAvg = item.avgCost;

    let movementUnitCost = 0;

    if (params.type === 'IN') {
      movementUnitCost = params.unitCost || oldAvg;
      // Formula Media Pesata
      const newQty = oldQty + params.qty;
      const newAvg = newQty > 0 
        ? (oldQty * oldAvg + params.qty * movementUnitCost) / newQty 
        : movementUnitCost;
      
      item.currentQty = newQty;
      item.avgCost = newAvg;
    } else if (params.type === 'OUT') {
      movementUnitCost = oldAvg; // Use current average cost for OUT
      item.currentQty = Math.max(0, oldQty - params.qty);
      // AvgCost non cambia mai su OUT
    } else if (params.type === 'ADJUST') {
      movementUnitCost = oldAvg;
      item.currentQty = params.qty;
    }

    const newMov: InventoryMovement = {
      id: `mov-${Date.now()}`,
      itemId: params.itemId,
      type: params.type,
      qty: params.qty,
      unitCost: movementUnitCost,
      totalCost: params.qty * movementUnitCost,
      date: new Date().toISOString(),
      source: params.source,
      note: params.note,
      sourceRef: params.sourceRef
    };

    items[itemIndex] = item;
    localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
    localStorage.setItem(MOVS_KEY, JSON.stringify([newMov, ...movements]));
    return { success: true, item, movement: newMov };
  },

  deleteItem: (id: string) => {
    const items = inventoryService.getItems().filter(i => i.id !== id);
    const movs = inventoryService.getMovements().filter(m => m.itemId !== id);
    localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
    localStorage.setItem(MOVS_KEY, JSON.stringify(movs));
  },

  seed: () => {
    if (inventoryService.getItems().length === 0) {
      const demoItems = [
        { name: 'Nitrato Ammonico 27%', category: 'concimi', unit: 'kg', minThreshold: 100, tags: ['agricoltura'] as any },
        { name: 'Unifeed Lattazione', category: 'mangimi', unit: 'q.li', minThreshold: 5, tags: ['allevamento'] as any },
        { name: 'Gasolio Agricolo', category: 'carburanti', unit: 'lt', minThreshold: 200, tags: ['agricoltura', 'allevamento'] as any }
      ];
      demoItems.forEach(i => inventoryService.saveItem(i));
    }
  }
};
