
import { RentRequest } from '../data/noleggioDataV2';
import { Movement } from '../data/economiaV2Data';

export const syncRentalToEconomy = (request: RentRequest, currentUserRole: string) => {
    const STORAGE_MOV = 'teraia_economy_movements_v2';
    const saved = localStorage.getItem(STORAGE_MOV);
    const movements: Movement[] = saved ? JSON.parse(saved) : [];

    const days = Math.max(1, Math.ceil((new Date(request.endDate).getTime() - new Date(request.startDate).getTime()) / (1000 * 3600 * 24)));
    
    // Determiniamo se creare costo o ricavo
    // Se l'utente corrente è il Renter -> COSTO
    // Se l'utente corrente è l'Owner -> RICAVO
    const isRenter = currentUserRole.toLowerCase().includes('owner') || currentUserRole.toLowerCase().includes('agricoltore');

    const newMovement: Movement = {
        id: `mv-rent-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        type: request.renterId === 'me' ? 'costo' : 'ricavo', // Semplificato per demo
        category: 'Altro',
        amount: request.totalPrice,
        description: `Noleggio: ${request.listingTitle} (${request.startDate} / ${request.endDate})`,
        linkedAsset: 'Noleggio P2P',
        method: 'manuale'
    };

    localStorage.setItem(STORAGE_MOV, JSON.stringify([newMovement, ...movements]));
};

export const createRentalNotification = (title: string, message: string) => {
    const STORAGE_NOTIF = 'teraia_notifications_v1';
    const saved = localStorage.getItem(STORAGE_NOTIF);
    const notifications = saved ? JSON.parse(saved) : [];

    const newNotif = {
        id: `notif-${Date.now()}`,
        title,
        message,
        timestamp: new Date().toISOString(),
        status: 'nuova',
        type: 'operativa'
    };

    localStorage.setItem(STORAGE_NOTIF, JSON.stringify([newNotif, ...notifications]));
};
