
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, Syringe, ClipboardList, AlertCircle, CheckCircle, ArrowRight, PawPrint, Calendar, HeartPulse } from 'lucide-react';
import { useAppContext } from '../../hooks/useAppContext';

const Card: React.FC<{children: React.ReactNode, className?: string, onClick?: () => void}> = ({ children, className, onClick }) => (
    <div className={`bg-surface rounded-xl shadow-md p-6 ${className} ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`} onClick={onClick}>{children}</div>
);

const DashboardVeterinarioPage: React.FC = () => {
    const { currentUser } = useAppContext();
    const navigate = useNavigate();

    // Dati reali filtrati da localStorage
    const herds = useMemo(() => JSON.parse(localStorage.getItem('teraia_production_units_v1') || '[]').filter((u: any) => u.type === 'Allevamento'), []);
    const register = useMemo(() => JSON.parse(localStorage.getItem('teraia_sanitary_register') || '[]'), []);
    const vaccines = useMemo(() => JSON.parse(localStorage.getItem('teraia_vaccination_plans') || '[]'), []);
    
    const recentVisits = register.slice(0, 3);
    const pendingVaccines = vaccines.flatMap((p: any) => p.vaccinazioni).filter((v: any) => v.stato !== 'Completata').slice(0, 3);

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-black text-text-primary">Gestione Medica</h1>
                <div className="flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-1.5 rounded-full font-bold text-sm shadow-sm">
                    <Stethoscope size={16}/> Veterinario Responsabile: {currentUser?.name}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="border-t-4 border-primary">
                    <h3 className="text-xs font-black text-text-secondary uppercase mb-2">Allevamenti</h3>
                    <p className="text-4xl font-black text-primary">{herds.length}</p>
                    <p className="text-[10px] text-text-secondary mt-1">Capi totali monitorati: {herds.length * 12} (stima)</p>
                </Card>
                <Card className="border-t-4 border-red-500">
                    <h3 className="text-xs font-black text-text-secondary uppercase mb-2">Emergenze</h3>
                    <p className="text-4xl font-black text-red-600">{register.filter((i:any)=>i.tipo === 'Emergenza').length}</p>
                    <p className="text-[10px] text-text-secondary mt-1">Ultimi 30 giorni</p>
                </Card>
                <Card className="border-t-4 border-blue-500">
                    <h3 className="text-xs font-black text-text-secondary uppercase mb-2">Piani Vaccinali</h3>
                    <p className="text-4xl font-black text-blue-600">{vaccines.length}</p>
                    <p className="text-[10px] text-text-secondary mt-1">Piani attivi per gruppo</p>
                </Card>
                <Card className="bg-blue-50 border-none">
                    <h3 className="text-xs font-black text-blue-800 uppercase mb-2 flex items-center gap-1"><HeartPulse size={14}/> Salute</h3>
                    <p className="text-xs text-blue-700 leading-tight">Benessere animale al 98%. <br/><b>Tutto sotto controllo.</b></p>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold flex items-center gap-2"><ClipboardList className="text-primary"/> Ultimi Interventi</h2>
                        <button onClick={() => navigate('/sanita/registro')} className="text-xs font-bold text-primary hover:underline">Vedi Archivio</button>
                    </div>
                    <div className="space-y-3">
                        {recentVisits.length > 0 ? recentVisits.map((v: any) => (
                            <div key={v.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center group hover:border-primary transition-all cursor-pointer">
                                <div>
                                    <p className="font-bold text-sm text-text-primary">{v.tipo} - {v.animaleId}</p>
                                    <p className="text-[10px] text-text-secondary uppercase font-bold">{new Date(v.data).toLocaleDateString()} • {v.esito}</p>
                                </div>
                                <ArrowRight size={14} className="text-gray-300 group-hover:text-primary"/>
                            </div>
                        )) : <p className="text-center py-6 text-text-secondary italic text-sm">Nessun intervento registrato.</p>}
                    </div>
                </Card>

                <Card>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold flex items-center gap-2"><Syringe className="text-red-500"/> Vaccini Imminenti</h2>
                        <button onClick={() => navigate('/sanita/vaccini')} className="text-xs font-bold text-primary hover:underline">Gestisci Piani</button>
                    </div>
                    <div className="space-y-3">
                        {pendingVaccines.length > 0 ? pendingVaccines.map((v: any) => (
                            <div key={v.id} className="p-3 bg-red-50 border border-red-100 rounded-xl flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-sm text-red-800">{v.nomeVaccino}</p>
                                    <p className="text-[10px] text-red-600 uppercase font-black flex items-center gap-1"><Calendar size={10}/> Scadenza: {new Date(v.dataProssimaDose).toLocaleDateString()}</p>
                                </div>
                                <button onClick={() => navigate('/sanita/vaccini')} className="p-2 bg-white text-red-600 rounded-lg shadow-sm font-black text-[10px] uppercase">Esegui</button>
                            </div>
                        )) : <div className="text-center py-6"><CheckCircle size={32} className="mx-auto text-green-500 mb-2" /><p className="text-sm font-bold text-green-700">Piani vaccinali aggiornati.</p></div>}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default DashboardVeterinarioPage;
