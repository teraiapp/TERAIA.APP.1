
import React, { useState, useEffect } from 'react';
import { 
    Waves, PlusCircle, Play, Square, Settings, 
    History, Droplets, CheckCircle2, Zap, X
} from 'lucide-react';
import { irrigationService, STORAGE_KEYS } from '../../services/irrigationService';
import { IrrigationZone, AiProposal, EcData } from '../../types';
import ZoneConfigModal from '../../components/irrigazione/ZoneConfigModal';

const IrrigazionePage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'status' | 'history'>('status');
    const [zones, setZones] = useState<IrrigationZone[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [toast, setToast] = useState(false);
    const [modal, setModal] = useState<{ type: 'zone', data?: any } | null>(null);
    const [now, setNow] = useState(Date.now());

    // STATO OPERATIVO LOCALE (Pre-avvio)
    const [opState, setOpState] = useState<Record<string, {
        mode: 'manual' | 'ai',
        value: number,
        proposal?: AiProposal,
        ecEnabled: boolean
    }>>({});

    const refreshData = () => {
        setZones(irrigationService.getZones());
        setHistory(irrigationService.getRuns());
    };

    useEffect(() => {
        refreshData();
        const interval = setInterval(() => setNow(Date.now()), 1000);
        
        // LISTENER EVENT BUS (REQUISITO E)
        const handleDataChange = (e: any) => {
            if (e.detail.key.startsWith('teraia_irrigation') || e.detail.key === STORAGE_KEYS.QUADERNO) {
                refreshData();
            }
        };
        window.addEventListener('teraia:data-changed', handleDataChange);

        return () => {
            clearInterval(interval);
            window.removeEventListener('teraia:data-changed', handleDataChange);
        };
    }, []);

    // Inizializza opState per le zone non attive
    useEffect(() => {
        const newState = { ...opState };
        zones.forEach(z => {
            if (!z.isRunning && !newState[z.id]) {
                const prop = irrigationService.generateAiProposal(z);
                newState[z.id] = { mode: 'manual', value: 30, proposal: prop, ecEnabled: false };
            }
        });
        setOpState(newState);
    }, [zones]);

    const handleStart = (zone: IrrigationZone) => {
        const state = opState[zone.id];
        irrigationService.startRun({
            zoneId: zone.id,
            mode: state.mode,
            plannedDurationMin: state.value,
            plannedVolumeL: state.value * zone.flowRateLpm,
            ec: { enabled: state.ecEnabled, targetMsCm: 1.5, source: "none", sensor: { available: false, lastValueMsCm: null, lastUpdatedAt: null }, manual: { startMsCm: null, endMsCm: null, singleMsCm: null } }
        });
    };

    const handleStop = () => {
        irrigationService.stopRun();
        setToast(true);
        setTimeout(() => setToast(false), 4000);
    };

    return (
        <div className="space-y-8 pb-20 animate-in fade-in">
            {/* TOAST FEEDBACK (REQUISITO C.6) */}
            {toast && (
                <div className="fixed top-24 right-8 z-[500] bg-primary text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right">
                    <CheckCircle2 size={24}/>
                    <span className="font-black uppercase text-xs tracking-widest">Irrigazione registrata nel Quaderno</span>
                </div>
            )}

            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-black uppercase flex items-center gap-3"><Waves className="text-primary" size={36}/> Irrigazione</h1>
                <button onClick={() => setModal({ type: 'zone' })} className="px-6 py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase shadow-xl hover:scale-105 transition-all flex items-center gap-2">
                    <PlusCircle size={16}/> Nuova Zona
                </button>
            </div>

            <div className="flex p-1 bg-gray-100 rounded-[24px] w-fit shadow-inner">
                <button onClick={() => setActiveTab('status')} className={`px-8 py-3 rounded-[20px] font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'status' ? 'bg-white text-primary shadow-md' : 'text-text-secondary'}`}>Monitor Live</button>
                <button onClick={() => setActiveTab('history')} className={`px-8 py-3 rounded-[20px] font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-white text-primary shadow-md' : 'text-text-secondary'}`}>Storico</button>
            </div>

            {activeTab === 'status' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {zones.map(zone => {
                        const state = opState[zone.id];
                        const isRunning = zone.isRunning;
                        return (
                            <div key={zone.id} className={`bg-white rounded-[40px] p-8 shadow-xl border-2 transition-all flex flex-col ${isRunning ? 'border-primary ring-8 ring-primary/5' : 'border-transparent'}`}>
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-4 rounded-3xl ${isRunning ? 'bg-primary text-white animate-pulse' : 'bg-gray-100 text-gray-400'}`}>
                                            <Droplets size={32}/>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">{zone.name}</h3>
                                            <p className="text-[10px] font-bold text-text-secondary uppercase mt-1">{zone.flowRateLpm} L/min</p>
                                        </div>
                                    </div>
                                    {!isRunning && <button onClick={() => setModal({ type: 'zone', data: zone })} className="p-2 hover:bg-gray-100 rounded-xl text-text-secondary"><Settings size={18}/></button>}
                                </div>

                                {isRunning ? (
                                    <div className="space-y-6">
                                        <div className="bg-primary p-10 rounded-[40px] text-white text-center shadow-2xl shadow-primary/20">
                                            <p className="text-[10px] font-black uppercase opacity-60 tracking-[0.2em] mb-2">Erogazione in Corso</p>
                                            <p className="text-6xl font-black font-mono">
                                                {Math.floor((now - zone.runningSince!) / 60000)}:
                                                {String(Math.floor((now - zone.runningSince!) / 1000) % 60).padStart(2, '0')}
                                            </p>
                                            <div className="mt-6 flex justify-between text-[9px] font-black uppercase opacity-60">
                                                <span>Volume Stimato</span>
                                                <span>~ {Math.round(((now - zone.runningSince!) / 60000) * zone.flowRateLpm)} L</span>
                                            </div>
                                        </div>
                                        <button onClick={handleStop} className="w-full py-5 bg-red-600 text-white rounded-[24px] font-black uppercase shadow-xl hover:bg-red-700 flex items-center justify-center gap-3">
                                            <Square size={20}/> STOP CICLO
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-gray-50 p-4 rounded-2xl">
                                                <label className="text-[9px] font-black text-text-secondary uppercase">Minuti</label>
                                                <input 
                                                    type="number" 
                                                    value={state?.value} 
                                                    onChange={e => setOpState({...opState, [zone.id]: {...state, value: Number(e.target.value)}})} 
                                                    className="w-full bg-transparent text-3xl font-black outline-none" 
                                                />
                                            </div>
                                            <div className="flex flex-col justify-center">
                                                <p className="text-[10px] font-bold text-text-secondary uppercase">Totale Stimato</p>
                                                <p className="text-xl font-black text-primary">~ {state?.value * zone.flowRateLpm} L</p>
                                            </div>
                                        </div>
                                        <button onClick={() => handleStart(zone)} className="w-full py-5 bg-primary text-white rounded-[24px] font-black uppercase shadow-xl hover:bg-primary-dark flex items-center justify-center gap-3">
                                            <Play size={20}/> AVVIA IRRIGAZIONE
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {activeTab === 'history' && (
                <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100">
                    <div className="p-8 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                        <h2 className="text-xl font-black uppercase flex items-center gap-2"><History size={20}/> Registro Cicli</h2>
                        <span className="text-[10px] font-black text-text-secondary uppercase">{history.length} Sessioni</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-text-secondary uppercase text-[10px] font-black">
                                <tr>
                                    <th className="p-6">Data</th>
                                    <th className="p-6">Settore</th>
                                    <th className="p-6">Durata</th>
                                    <th className="p-6">Volume Real.</th>
                                    <th className="p-6 text-right">Esito</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {history.map(run => (
                                    <tr key={run.id} className="hover:bg-gray-50 font-medium">
                                        <td className="p-6 font-bold">{new Date(run.startedAt).toLocaleString()}</td>
                                        <td className="p-6 font-black uppercase text-xs">{run.zoneName}</td>
                                        <td className="p-6 font-black">{run.actualDurationMin} m</td>
                                        <td className="p-6 font-black text-primary">{run.volumeLiters} L</td>
                                        <td className="p-6 text-right">
                                            <span className="text-[9px] font-black text-green-600 bg-green-50 px-2 py-1 rounded uppercase">Registrato</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <ZoneConfigModal isOpen={modal?.type === 'zone'} onClose={() => setModal(null)} onSave={(z) => {
                const current = irrigationService.getZones();
                const exists = current.find(x => x.id === z.id);
                irrigationService.saveZones(exists ? current.map(x => x.id === z.id ? z : x) : [...current, z]);
                setModal(null);
            }} editingZone={modal?.data} />
        </div>
    );
};

export default IrrigazionePage;
