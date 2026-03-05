
import { AppNotification, NotificationSeverity, NotificationType } from '../types';

const NOTIF_KEY = 'teraia_notifications_v1';

export const notificationService = {
    getNotifications: (): AppNotification[] => {
        const saved = localStorage.getItem(NOTIF_KEY);
        return saved ? JSON.parse(saved) : [];
    },

    getUnreadCount: (): number => {
        return notificationService.getNotifications().filter(n => !n.readAtISO).length;
    },

    notify: (params: { 
        type: NotificationType, 
        title: string, 
        message: string, 
        severity: NotificationSeverity,
        actionLabel?: string,
        actionRoute?: string
    }) => {
        const notifs = notificationService.getNotifications();
        const newNotif: AppNotification = {
            id: `notif-${Date.now()}`,
            ...params,
            createdAtISO: new Date().toISOString()
        };
        localStorage.setItem(NOTIF_KEY, JSON.stringify([newNotif, ...notifs]));
        
        // Se possibile, usa Notification API per browser focus
        if (Notification.permission === 'granted') {
            new Notification(params.title, { body: params.message });
        }
    },

    markAsRead: (id: string) => {
        const notifs = notificationService.getNotifications();
        const updated = notifs.map(n => n.id === id ? { ...n, readAtISO: new Date().toISOString() } : n);
        localStorage.setItem(NOTIF_KEY, JSON.stringify(updated));
    },

    requestPushPermission: async (): Promise<boolean> => {
        if (!('Notification' in window)) return false;
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }
};
