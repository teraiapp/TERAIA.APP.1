
import React from 'react';
import { ShieldAlert, Clock, User, HardDrive } from 'lucide-react';
import { getAuditLogs } from '../../utils/auditLogger';

const AuditLogPage: React.FC = () => {
    const logs = getAuditLogs();

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold flex items-center gap-2">
                <ShieldAlert className="text-red-600" /> Registro Operazioni e Sicurezza
            </h1>

            <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-text-secondary uppercase text-[10px] font-bold">
                        <tr>
                            <th className="p-4">Timestamp</th>
                            <th className="p-4">Utente</th>
                            <th className="p-4">Ruolo</th>
                            <th className="p-4">Modulo</th>
                            <th className="p-4">Azione</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {logs.map(l => (
                            <tr key={l.id} className="hover:bg-gray-50">
                                <td className="p-4 text-text-secondary whitespace-nowrap"><Clock size={12} className="inline mr-1"/> {new Date(l.timestamp).toLocaleString()}</td>
                                <td className="p-4 font-bold">{l.userName}</td>
                                <td className="p-4"><span className="px-2 py-0.5 bg-gray-100 rounded text-[10px]">{l.role}</span></td>
                                <td className="p-4 font-medium text-primary">{l.module}</td>
                                <td className="p-4 italic text-text-secondary">"{l.action}"</td>
                            </tr>
                        ))}
                        {logs.length === 0 && (
                            <tr><td colSpan={5} className="p-10 text-center text-text-secondary italic">Nessuna attività registrata.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AuditLogPage;
