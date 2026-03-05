
import { RentRequest } from '../data/teraiaModulesData';

export const syncRentalToEconomy = (request: RentRequest, type: 'costo' | 'ricavo') => {
    const storageKey = 'teraia_economy_movements_v2';
    const saved = localStorage.getItem(storageKey);
    const movements = saved ? JSON.parse(saved) : [];

    const newMovement = {
        id: `mv-rent-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        type: type,
        category: 'Altro',
        amount: request.totalPrice,
        description: `Noleggio: ${request.listingTitle} (${request.startDate} / ${request.endDate})`,
        linkedAsset: 'Noleggio P2P',
        method: 'manuale'
    };

    localStorage.setItem(storageKey, JSON.stringify([newMovement, ...movements]));
};
