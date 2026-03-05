
import { Deadline, DeadlineStatus } from '../types';

export const getDaysRemaining = (dueDate: string): number => {
    const today = new Date();
    const due = new Date(dueDate);
    const diff = due.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const getDeadlineSeverity = (deadline: Deadline): 'ok' | 'warning' | 'critical' => {
    const days = getDaysRemaining(deadline.dueDate);
    if (days < 0 || deadline.status === 'scaduta') return 'critical';
    if (days <= deadline.alertDaysBefore) return 'warning';
    return 'ok';
};

export const syncDeadlinesWithNotifications = (deadlines: Deadline[]) => {
    const notifications = JSON.parse(localStorage.getItem('teraia_notifications_v1') || '[]');
    let updated = false;

    deadlines.forEach(d => {
        const days = getDaysRemaining(d.dueDate);
        const severity = getDeadlineSeverity(d);
        const notifId = `notif-deadline-${d.id}`;

        if (severity !== 'ok' && !notifications.some((n: any) => n.id === notifId)) {
            notifications.push({
                id: notifId,
                type: 'normativa',
                severity: severity === 'critical' ? 'critico' : 'attenzione',
                title: severity === 'critical' ? `SCADUTA: ${d.title}` : `In Scadenza: ${d.title}`,
                message: severity === 'critical' 
                    ? `L'adempimento "${d.title}" è scaduto il ${new Date(d.dueDate).toLocaleDateString()}. Azione immediata richiesta.`
                    : `Mancano ${days} giorni alla scadenza di "${d.title}".`,
                actionText: 'Gestisci Scadenza',
                actionLink: `/scadenze/${d.id}`,
                timestamp: new Date().toISOString(),
                status: 'nuova'
            });
            updated = true;
        }
    });

    if (updated) {
        localStorage.setItem('teraia_notifications_v1', JSON.stringify(notifications));
    }
};
