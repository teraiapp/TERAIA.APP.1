
import { AuditLogEntry, User } from '../types';

const AUDIT_KEY = 'teraia_audit_log';

export const logAction = (user: User, action: string, module: string) => {
    const logs: AuditLogEntry[] = JSON.parse(localStorage.getItem(AUDIT_KEY) || '[]');
    const newEntry: AuditLogEntry = {
        id: `log-${Date.now()}`,
        userId: user.id,
        userName: user.name,
        role: user.role,
        action,
        module,
        timestamp: new Date().toISOString()
    };
    const updatedLogs = [newEntry, ...logs].slice(0, 500); // Keep last 500
    localStorage.setItem(AUDIT_KEY, JSON.stringify(updatedLogs));
};

export const getAuditLogs = (): AuditLogEntry[] => {
    return JSON.parse(localStorage.getItem(AUDIT_KEY) || '[]');
};
