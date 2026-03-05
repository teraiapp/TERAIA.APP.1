import React, { useState, useEffect, useMemo } from 'react';
import { 
    Cpu, Settings2, Share2, Wifi, WifiOff, 
    ShieldCheck, Database, History, AlertCircle, 
    CheckCircle, X, Terminal, RefreshCw, Layers,
    Activity, HardDrive, LayoutGrid, Info, 
    ArrowRight, Save, Trash2, ShieldAlert,
    Plug, Cloud, Waves, Beaker, PlusCircle
} from 'lucide-react';
import { useAppContext } from '../../hooks/useAppContext';
import { IntegrationConfig, OrchardCycle, IntegrationLog, IntegrationStatus } from '../../types';
import { logIntegrationEvent } from '../../utils/dataHub';

const IntegrationsCenter: React.FC = () => {
    const { currentUser } = useAppContext();
    const [activeTab, setActiveTab] = useState<'modes' | 'systems' | 'orchard' | 'logs'>('modes');

    // --- STATE: MODES ---
    const [modes, setModes] = useState<string[]>(() => JSON.parse(localStorage.getItem('teraia_company_modes_v1') || '[]'));
    
    // --- STATE: SYSTEMS ---
    const [integrations, setIntegrations] = useState<IntegrationConfig[]>(() => {
        const saved = localStorage.getItem('teraia_integrations_v1');
        return saved ? JSON.parse(saved) : [
            { id: 'i-1', name: 'Priva Greenhouse Ctrl', type: 'priva', status: 'disconnected', syncFrequency: '15m', mappedSensors: ['Temp', 'Umidità', 'CO2'] },
            { id: 'i-2', name: 'Stazione Meteo Davis', type: 'weather_station', status: 'disconnected', syncFrequency: '1h', mappedSensors: ['Pioggia', 'Vento'] }
        ];
    });

    // --- STATE: ORCHARD ---
    const [orchards, setOrchards] = useState<OrchardCycle[]>(() => JSON.parse(localStorage.getItem('teraia_orchard_cycles_v1') || '[]'));
    
    // --- STATE: LOGS ---
    const [logs, setLogs] = useState<IntegrationLog[]>(() => JSON.parse(localStorage.getItem('teraia_integration_logs_v1') || '[]'));

    // --- PERSISTENCE ---
    useEffect(() => { localStorage.setItem('teraia_company_modes_v1', JSON.stringify(modes)); }, [modes]);
    useEffect(() => { localStorage.setItem('teraia_integrations_v1', JSON.stringify(integrations)); }, [integrations]);
    useEffect(() => { localStorage.setItem('teraia_orchard_cycles_v1', JSON.stringify(orchards)); }, [orchards]);

    // --- HANDLERS: MODES ---
    const toggleMode = (id: string) => {
        setModes(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
    };

    // --- HANDLERS: SYSTEMS ---
    const testConnection = (id: string) => {
        setIntegrations(prev => prev.map(i => i.id === id ? { ...i, status: 'error' } : i));
        setTimeout(() => {
            setIntegrations(prev => prev.map(i => i.id === id ? { ...i, status: 'connected', lastSync: new Date().toISOString() } : i));
            logIntegrationEvent(integrations.find(it => it.id === id)?.name || 'Sistema', 'success', 'Connessione stabilita con successo via API.');
            setLogs(JSON.parse(localStorage.getItem('teraia_integration_logs_v1') || '[]'));
        }, 1500);
    };

    const handleSaveSystem = (id: string, updates: Partial<IntegrationConfig>) => {
        setIntegrations(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
        alert("Configurazione salvata.");
    };

    // --- HANDLERS: ORCHARD ---
    const addOrchardEntry = (unitId: string) => {
        const newCycle: OrchardCycle = {
            id: `orc-${Date.now()}`,
            unitId: unitId,
            species: 'Ulivo',
            variety: 'Coratina',
            plantingYear: 2018,
            spacing: '6x6',
            history: [{ year: 2023, yield: 4500, mainProblems: ['Occhio di pavone'], qualityScore: 88 }]
        };
        setOrchards([...orchards, newCycle]);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-text-primary flex items-center gap-3 uppercase tracking-tighter">
                        <Cpu className="text-primary animate-pulse" size={36} /> Centro Integrazioni OS
                    </h1>
                    <p className="text-text-secondary text-sm font-medium">Configura come TeraIA riceve e scambia dati con il tuo hardware.</p>
                </div>
            </div>

            {/* TAB NAVIGATION */}
            <div className="flex p-1 bg-gray-100 rounded-[24px] w-fit shadow-inner">
                {[
                    { id: 'modes', label: 'Profilo Tech', icon: Layers },
                    { id: 'systems', label: 'Sistemi Connessi', icon: Plug },
                    { id: 'orchard', label: 'Cicli Alboreto', icon: History },
                    { id: 'logs', label: 'Diagnostica', icon: Terminal }
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-[20px] font-black text-xs uppercase tracking-widest transition-all ${
                            activeTab === tab.id ? 'bg-white text-primary shadow-md' : 'text-text-secondary hover:text-text-primary'
                        }`}
                    >
                        <tab.icon size={16}/> {tab.label}
                    </button>
                ))}
            </div>

            {/* TAB CONTENT: MODES (Wizard) */}
            {activeTab === 'modes' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-[40px] p-10 shadow-xl border border-gray-100">
                            <h2 className="text-2xl font-black uppercase tracking-tighter mb-4">Livello Tecnologico Aziendale</h2>
                            <p className="text-sm text-text-secondary font-medium mb-10 leading-relaxed">Seleziona come operi quotidianamente. TeraIA adatterà i consigli AI e le richieste di dati in base alla tua infrastruttura.</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { id: 'high-tech', label: 'Serre High-Tech', desc: 'Sistemi Priva/Grodan/Hoogendoorn attivi.', icon: Cloud },
                                    { id: 'low-tech', label: 'Serre Low-Tech', desc: 'Gestione manuale o semi-automatica.', icon: Activity },
                                    { id: 'open-field', label: 'Campo Aperto', desc: 'Sensori IoT LoRaWAN/NB-IoT e satellite.', icon: LayoutGrid },
                                    { id: 'perennial', label: 'Coltura Perenne (Alboreto)', desc: 'Cicli pluriennali (Vite, Olivo, Frutta).', icon: History },
                                ].map(m => (
                                    <button 
                                        key={m.id}
                                        onClick={() => toggleMode(m.id)}
                                        className={`p-6 rounded-[32px] border-2 text-left transition-all flex items-start gap-4 group ${modes.includes(m.id) ? 'border-primary bg-primary/5 shadow-md' : 'border-gray-100 bg-gray-50 hover:bg-white hover:border-gray-200'}`}
                                    >
                                        <div className={`p-4 rounded-2xl ${modes.includes(m.id) ? 'bg-primary text-white shadow-lg' : 'bg-white text-gray-400 group-hover:text-primary'}`}>
                                            <m.icon size={24}/>
                                        </div>
                                        <div>
                                            <p className="font-black text-sm uppercase text-text-primary mb-1 tracking-tight">{m.label}</p>
                                            <p className="text-[10px] font-bold text-text-secondary leading-tight">{m.desc}</p>
                                        </div>
                                        {modes.includes(m.id) && <CheckCircle size={20} className="text-primary ml-auto shrink-0"/>}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-blue-50 p-8 rounded-[40px] border border-blue-100 flex items-start gap-4">
                            <Info size={24} className="text-blue-600 shrink-0"/>
                            <div>
                                <h4 className="text-xs font-black uppercase text-blue-900 tracking-tight">Impatto sui Moduli</h4>
                                <p className="text-[11px] text-blue-800 font-medium leading-relaxed mt-1">Scegliendo "High-Tech", TeraIA darà priorità alle letture dei sensori rispetto ai dati stimati via web. Scegliendo "Perenne", si sbloccherà lo storico pluriennale per l'analisi delle rese storiche.</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-gray-900 rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden">
                            <ShieldCheck className="absolute -top-4 -right-4 w-40 h-40 text-white/5" />
                            <h3 className="text-xl font-black uppercase tracking-tighter mb-4 relative z-10">Data Integrity</h3>
                            <p className="text-xs opacity-70 font-medium leading-relaxed mb-8 relative z-10">Il sistema di validazione TeraIA incrocia i dati di 3 fonti diverse per garantirti una precisione del 98% sulla diagnostica.</p>
                            <div className="space-y-4">
                                <div className="flex justify-between text-[10px] font-black uppercase"><span className="opacity-50">Sorgente IoT:</span> <span className="text-primary">{modes.includes('high-tech') || modes.includes('open-field') ? 'ATTIVA' : 'OFFLINE'}</span></div>
                                <div className="flex justify-between text-[10px] font-black uppercase"><span className="opacity-50">Sorgente Sat:</span> <span className="text-primary">ATTIVA</span></div>
                                <div className="flex justify-between text-[10px] font-black uppercase"><span className="opacity-50">Sorgente Manuale:</span> <span className="text-primary">ATTIVA</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB CONTENT: SYSTEMS (Connections) */}
            {activeTab === 'systems' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {integrations.map(i => (
                        <div key={i.id} className="bg-white rounded-[40px] p-8 shadow-xl border border-gray-100 flex flex-col justify-between hover:shadow-2xl transition-all border-t-8 border-primary">
                            <div>
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-4 rounded-2xl bg-gray-50 text-text-primary shadow-sm"><Plug size={24}/></div>
                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${i.status === 'connected' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {i.status}
                                    </span>
                                </div>
                                <h3 className="text-2xl font-black text-text-primary uppercase tracking-tighter mb-2 leading-none">{i.name}</h3>
                                <p className="text-[10px] font-bold text-text-secondary uppercase mb-6">{i.mappedSensors.join(' • ')}</p>
                                
                                <div className="space-y-4 mb-10">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-text-secondary uppercase ml-1">Endpoint API / IP</label>
                                        <input type="text" className="w-full p-3 bg-gray-50 rounded-xl text-xs font-bold border-none outline-none focus:ring-2 focus:ring-primary" placeholder="https://api.system.com"/>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase">
                                        <span className="text-text-secondary">Sync: {i.syncFrequency}</span>
                                        <span className="text-text-secondary italic">Ultimo sync: {i.lastSync ? new Date(i.lastSync).toLocaleTimeString() : 'Mai'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={() => testConnection(i.id)} className="py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2">
                                    <RefreshCw size={14}/> Test
                                </button>
                                <button onClick={() => handleSaveSystem(i.id, { status: 'connected' })} className="py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-primary-dark transition-all">Salva</button>
                            </div>
                        </div>
                    ))}

                    <button className="bg-gray-50 border-4 border-dashed border-gray-200 rounded-[40px] p-10 flex flex-col items-center justify-center gap-4 text-gray-400 hover:text-primary hover:border-primary/30 transition-all group min-h-[350px]">
                        <PlusCircle size={48} className="group-hover:scale-110 transition-transform"/>
                        <span className="font-black uppercase tracking-widest text-xs">Aggiungi Connessione Custom</span>
                    </button>
                </div>
            )}

            {/* TAB CONTENT: ORCHARD */}
            {activeTab === 'orchard' && (
                <div className="space-y-8">
                    <div className="flex justify-between items-end bg-white p-8 rounded-[40px] shadow-xl border border-gray-50">
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tighter">Mappa Perenne</h2>
                            <p className="text-sm text-text-secondary font-medium">Gestione dei cicli di vita di Alberi e Vite (multi-annata).</p>
                        </div>
                        <button onClick={() => addOrchardEntry('unit-1')} className="px-8 py-4 bg-primary text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl">Nuovo Alboreto</button>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {orchards.map(orc => (
                            <div key={orc.id} className="bg-white rounded-[40px] p-8 shadow-xl border border-gray-100 flex flex-col md:flex-row justify-between gap-10">
                                <div className="flex-1">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="p-4 bg-green-50 text-green-600 rounded-2xl"><History size={32}/></div>
                                        <div>
                                            <h3 className="text-2xl font-black text-text-primary uppercase tracking-tighter leading-none">{orc.species} ({orc.variety})</h3>
                                            <p className="text-xs font-bold text-text-secondary uppercase mt-1">Impianto: {orc.plantingYear} • Sesto: {orc.spacing}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-8 space-y-4">
                                        <h4 className="text-[10px] font-black uppercase text-text-secondary tracking-widest px-1">Performance Storica</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {orc.history.map((h, i) => (
                                                <div key={i} className="p-4 bg-gray-50 rounded-3xl border border-gray-100">
                                                    <div className="flex justify-between mb-2">
                                                        <span className="text-[10px] font-black">{h.year}</span>
                                                        <span className="text-[10px] font-black text-primary">{h.qualityScore}% Q</span>
                                                    </div>
                                                    <p className="text-xl font-black text-text-primary">{h.yield} <span className="text-xs opacity-50">kg/unit</span></p>
                                                    <p className="text-[8px] font-bold text-text-secondary uppercase mt-2">Problemi: {h.mainProblems.join(', ')}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="md:w-64 space-y-4">
                                    <div className="p-6 bg-gradient-to-br from-primary to-green-600 rounded-[32px] text-white shadow-lg">
                                        <h4 className="text-xs font-black uppercase mb-2 flex items-center gap-2"><Beaker size={14}/> Strategia AI</h4>
                                        <p className="text-[10px] opacity-90 leading-relaxed font-medium">Sulla base delle rese 2023, si consiglia una potatura più drastica del 15% per favorire il ricaccio vegetativo.</p>
                                    </div>
                                    <button className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest">Aggiorna Annata</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB CONTENT: LOGS */}
            {activeTab === 'logs' && (
                <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100">
                    <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                        <h2 className="text-xl font-black uppercase flex items-center gap-2"><Terminal size={20}/> Stream Eventi Integrazioni</h2>
                        <button onClick={() => setLogs([])} className="text-[10px] font-black uppercase text-red-500 hover:underline">Svuota Log</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b text-text-secondary uppercase text-[10px] font-black tracking-wider">
                                <tr>
                                    <th className="p-6">Timestamp</th>
                                    <th className="p-6">Sorgente</th>
                                    <th className="p-6">Evento</th>
                                    <th className="p-6">Stato</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {logs.map(log => (
                                    <tr key={log.id} className="hover:bg-gray-50 transition-colors font-mono">
                                        <td className="p-6 text-xs text-text-secondary">{new Date(log.timestamp).toLocaleTimeString()}</td>
                                        <td className="p-6 font-black uppercase text-[10px]">{log.source}</td>
                                        <td className="p-6 text-xs font-bold text-text-primary">{log.message}</td>
                                        <td className="p-6">
                                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                                log.status === 'success' ? 'bg-green-100 text-green-700' :
                                                log.status === 'warning' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                                {log.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {logs.length === 0 && (
                                    <tr><td colSpan={4} className="p-20 text-center text-text-secondary italic">Nessun evento registrato.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IntegrationsCenter;
