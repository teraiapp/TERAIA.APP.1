
import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AlertTriangle, Home, ChevronLeft, Terminal } from 'lucide-react';

const NotFoundPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // SYSTEM LOGGER: Salva la rotta rotta per debugging
        const notifications = JSON.parse(localStorage.getItem('teraia_notifications_v1') || '[]');
        const logId = `notif-err-${Date.now()}`;
        
        notifications.push({
            id: logId,
            type: 'SYSTEM',
            severity: 'warning',
            title: 'Errore Navigazione Rilevato',
            message: `Un utente ha tentato di accedere a un percorso inesistente: ${location.pathname}. Verificare il RouteRegistry.`,
            timestamp: new Date().toISOString(),
            status: 'nuova'
        });

        localStorage.setItem('teraia_notifications_v1', JSON.stringify(notifications.slice(-20)));
        console.error(`[TeraIA Router] 404 on path: ${location.pathname}`);
    }, [location.pathname]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6 animate-in fade-in duration-500">
            <div className="p-8 bg-red-100 rounded-[40px] text-red-600 mb-8 border-4 border-white shadow-2xl animate-bounce">
                <AlertTriangle size={80} />
            </div>
            
            <h1 className="text-4xl font-black text-text-primary mb-4 uppercase tracking-tighter leading-none">
                Rotta Non Trovata
            </h1>
            
            <p className="text-lg text-text-secondary mb-10 max-w-md mx-auto font-medium leading-relaxed">
                Il percorso <code className="bg-gray-100 px-2 py-1 rounded text-red-600 font-bold">{location.pathname}</code> non esiste o il modulo non è stato caricato correttamente nel registro di sistema.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center justify-center gap-3 px-8 py-4 bg-white border-2 border-gray-100 text-text-primary rounded-[24px] font-black hover:bg-gray-50 transition-all shadow-md"
                >
                    <ChevronLeft size={20}/> TORNA INDIETRO
                </button>
                <Link
                    to="/"
                    className="flex items-center justify-center gap-3 px-8 py-4 bg-primary text-white rounded-[24px] font-black hover:bg-primary-dark transition-all shadow-xl shadow-primary/20"
                >
                    <Home size={20}/> TORNA ALLA DASHBOARD
                </Link>
            </div>

            <div className="mt-20 flex items-center gap-3 p-4 bg-gray-900 rounded-2xl text-white text-[10px] font-black uppercase tracking-[0.2em]">
                <Terminal size={14} className="text-primary"/> 
                SYSTEM DIAGNOSTIC: 404_ERR_LOGGED
            </div>
        </div>
    );
};

export default NotFoundPage;
