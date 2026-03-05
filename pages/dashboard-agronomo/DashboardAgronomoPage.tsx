
import React, { useMemo } from 'react';
import { Leaf, BrainCircuit, CloudSun, Droplets, ArrowRight, ClipboardCheck, BookText, AlertTriangle, TrendingUp, Info } from 'lucide-react';
import { useAppContext } from '../../hooks/useAppContext';
import { useNavigate } from 'react-router-dom';

const Card: React.FC<{children: React.ReactNode, className?: string, onClick?: () => void}> = ({ children, className, onClick }) => (
    <div className={`bg-surface rounded-xl shadow-md p-6 ${className} ${onClick ? 'cursor-pointer hover:shadow-lg transition-all' : ''}`} onClick={onClick}>{children}</div>
);

const DashboardAgronomoPage: React.FC = () => {
    const { currentUser } = useAppContext();
    const navigate = useNavigate();

    // Dati reali da localStorage per simulare dashboard dinamica
    const units = useMemo(() => JSON.parse(localStorage.getItem('teraia_production_units_v1') || '[]').filter((u: any) => u.type !== 'Allevamento'), []);
    const entries = useMemo(() => JSON.parse(localStorage.getItem('teraia_campbook_entries_v1') || '[]'), []);
    
    const lastTreatment = entries.find((e: any) => e.type === 'trattamento');
    const alertsCount = entries.filter((e: any) => e.type === 'trattamento' && new Date(e.date).getTime() < Date.now() - 15 * 86400000).length;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-black text-text-primary">Dashboard Agronomica</h1>
                <div className="flex items-center gap-2 bg-green-100 text-green-800 px-4 py-1.5 rounded-full font-bold text-sm shadow-sm">
                    <Leaf size={16}/> Consulente Agro Senior: {currentUser?.name}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-l-4 border-green-500">
                    <div className="flex justify-between mb-2">
                        <h3 className="text-xs font-black text-text-secondary uppercase">Unità Agricole</h3>
                        <Leaf size={18} className="text-green-500"/>
                    </div>
                    <p className="text-3xl font-black">{units.length}</p>
                    <p className="text-[10px] text-text-secondary mt-1">Superficie totale: {units.reduce((s:any,u:any)=>s+u.area,0)} ha</p>
                </Card>
                <Card className="border-l-4 border-blue-500">
                    <div className="flex justify-between mb-2">
                        <h3 className="text-xs font-black text-text-secondary uppercase">Ultimo Trattamento</h3>
                        <Droplets size={18} className="text-blue-500"/>
                    </div>
                    <p className="text-xl font-bold">{lastTreatment ? lastTreatment.crop : 'N/D'}</p>
                    <p className="text-[10px] text-text-secondary mt-1">{lastTreatment ? `Registrato il ${new Date(lastTreatment.date).toLocaleDateString()}` : 'Nessun record recente'}</p>
                </Card>
                <Card className="border-l-4 border-orange-500">
                    <div className="flex justify-between mb-2">
                        <h3 className="text-xs font-black text-text-secondary uppercase">Alert Criticità</h3>
                        <AlertTriangle size={18} className="text-orange-500"/>
                    </div>
                    <p className="text-3xl font-black text-orange-600">{alertsCount}</p>
                    <p className="text-[10px] text-text-secondary mt-1">Scadenze copertura fitosanitaria</p>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="relative overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold flex items-center gap-2"><CloudSun className="text-blue-500"/> Meteo e Previsioni</h2>
                        <button onClick={() => navigate('/meteo')} className="text-xs font-bold text-primary hover:underline">Vedi dettagli</button>
                    </div>
                    <div className="flex items-center gap-8">
                         <div className="text-center">
                             <p className="text-4xl font-black">24°C</p>
                             <p className="text-xs font-bold text-text-secondary uppercase">Soleggiato</p>
                         </div>
                         <div className="flex-1 space-y-2">
                             <div className="flex justify-between text-xs"><span>Vento:</span> <span className="font-bold">12 km/h NE</span></div>
                             <div className="flex justify-between text-xs"><span>Umidità:</span> <span className="font-bold">45%</span></div>
                             <div className="flex justify-between text-xs"><span>Precipitazioni (24h):</span> <span className="font-bold">0.5 mm</span></div>
                         </div>
                    </div>
                    <div className="mt-6 p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-center gap-3">
                        <Info size={16} className="text-blue-600 shrink-0"/>
                        <p className="text-[11px] text-blue-800 font-medium">Finestra di trattamento ottimale prevista per domani pomeriggio (Vento &lt; 5km/h).</p>
                    </div>
                </Card>

                <Card>
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><ClipboardCheck className="text-primary"/> Azioni Rapide</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => navigate('/quaderno')} className="p-4 bg-gray-50 rounded-2xl hover:bg-green-50 transition-colors text-left group">
                            <BookText className="text-green-600 mb-2 group-hover:scale-110 transition-transform" />
                            <p className="font-black text-sm">Compila Quaderno</p>
                            <p className="text-[10px] text-text-secondary">Trattamenti e fertilizzazioni</p>
                        </button>
                        <button onClick={() => navigate('/ai-decisioni')} className="p-4 bg-gray-50 rounded-2xl hover:bg-blue-50 transition-colors text-left group">
                            <BrainCircuit className="text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                            <p className="font-black text-sm">Supporto AI</p>
                            <p className="text-[10px] text-text-secondary">Analisi rischi e rese</p>
                        </button>
                    </div>
                    <div className="mt-6 space-y-2">
                         <h4 className="text-[10px] font-black uppercase text-text-secondary px-1">Indici Prossima Settimana</h4>
                         <div className="flex items-center justify-between p-3 border rounded-xl hover:border-primary transition-colors">
                             <span className="text-xs font-bold">Rischio Stress Idrico</span>
                             <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-[9px] font-extrabold uppercase">MEDIO</span>
                         </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default DashboardAgronomoPage;
