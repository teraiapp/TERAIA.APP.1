
import { ConsultStatus, ConsultationRequest } from '../data/marketplaceV3Data';

export const createMarketNotification = (title: string, message: string) => {
    const STORAGE_NOTIF = 'teraia_notifications_v1';
    const saved = localStorage.getItem(STORAGE_NOTIF);
    const notifications = saved ? JSON.parse(saved) : [];

    const newNotif = {
        id: `notif-mk-${Date.now()}`,
        title,
        message,
        timestamp: new Date().toISOString(),
        status: 'nuova',
        type: 'operativa'
    };

    localStorage.setItem(STORAGE_NOTIF, JSON.stringify([newNotif, ...notifications]));
};

export const updateConsultationWorkflow = (requests: ConsultationRequest[], id: string, newStatus: ConsultStatus): ConsultationRequest[] => {
    return requests.map(r => {
        if (r.id === id) {
            createMarketNotification(
                "Aggiornamento Consulenza",
                `La tua richiesta con ${r.proName} è passata allo stato: ${newStatus}`
            );
            return { ...r, status: newStatus };
        }
        return r;
    });
};
