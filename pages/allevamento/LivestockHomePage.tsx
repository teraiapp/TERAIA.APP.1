
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    PawPrint, PlusCircle, BrainCircuit, History, 
    Stethoscope, LayoutGrid, ArrowRight, MapPin, 
    Edit, Trash2, X, ChevronRight, Info, Zap, ShieldAlert, Activity, Milk, Wheat, Euro, Syringe, Clock
} from 'lucide-react';
import { useAppContext } from '../../hooks/useAppContext';
import { livestockService } from '../../services/livestockService';
import { livestockDashboardService } from '../../services/livestockDashboardService';
import { LivestockUnit, LivestockSpecies, LivestockSystem, LivestockPurpose } from '../../types';
import LocationSelector from '../../components/LocationSelector';

const PURPOSE_OPTIONS: LivestockPurpose[] = ['LATTE', 'CARNE', 'UOVA', 'LANA', 'RIPRODUZIONE', 'MISTO'];
const SPECIES_OPTIONS: LivestockSpecies[] = ['BOVINI', 'BUFALINI', 'OVINI', 'CAPRINI', 'SUINI', 'POLLAME', 'CONIGLI', 'EQUINI', 'API', 'ALTRO'];
const SYSTEM_OPTIONS: LivestockSystem[] = ['STALLA', 'PASCOLO', 'MISTO'];

const LivestockHomePage: React.FC = () => {
    const navigate = useNavigate();
    const { companyProfile } = useAppContext();
    const [units, setUnits] = useState<LivestockUnit[]>([]);
    const [modal, setModal] = useState<{ show: boolean, data?: LivestockUnit } | null>(null);
    const [location, setLocation] = useState(companyProfile?.localization || { regionCode: '', provinceCode: '', communeCode: '', regionName: '', provinceName: '', communeName: '' });

    // KPI INTELLIGENTI
    const today = useMemo(() => livestockDashboardService.getTotalsToday(), [units]);
    const upcoming = useMemo(() => livestockDashboardService.getUpcoming(), [units]);
    const wellbeing = useMemo(() => livestockDashboardService.getWellbeingScore(), [units]);
    const alerts = useMemo(() => livestockService.getAlerts().filter(a => !a.read), [units]);

    useEffect(() => {
        setUnits(livestockService.getUnits());
    }, []);

    const handleSaveUnit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const unit: LivestockUnit = {
            id: modal?.data?.id || `unit-${Date.now()}`,
            name: f.get('name') as string,
            species: f.get('species') as LivestockSpecies,
            purpose: PURPOSE_OPTIONS.filter(p => f.get(`purpose_${p}`) === 'on'),
            system: f.get('system') as LivestockSystem,
            location: { region: location.regionName, province: location.provinceName, city: location.communeName },
            capacityEstimate: Number(f.get('capacity')),
            createdAt: modal?.data?.createdAt || Date.now(),
            updatedAt: Date.now()
        };
        livestockService.saveUnit(unit);
        setUnits(livestockService.getUnits());
        setModal(null);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-text-primary flex items-center gap-3 uppercase tracking-tighter leading-none">
                        <PawPrint className="text-primary" size={36} /> Hub Allevamento
                    </h1>
                    <p className="text-text-secondary text-sm font-medium mt-2">Pannello di controllo biometrico e sanitario.</p>
                </div>
                <button onClick={() => setModal({ show: true })} className="px-6 py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all flex items-center gap-2">
                    <PlusCircle size={18}/> Nuova Unità
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* BLOCCO A: RIEPILOGO OGGI */}
                <div className="lg:col-span-8 bg-white rounded-[48px] p-10 shadow-xl border border-gray-50">
                    <h3 className="text-[10px] font-black uppercase text-text-secondary mb-8 tracking-[0.2em] flex items-center gap-2">
                        <Activity size={16} className="text-primary"/> Performance Oggi
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="p-6 bg-blue-50 rounded-[32px] border border-blue-100">
                            <Milk className="text-blue-600 mb-3" size={24}/>
                            <p className="text-2xl font-black text-blue-700">{today.milk} <span className="text-[10px]">LT</span></p>
                            <p className="text-[8px] font-black uppercase text-blue-400">Latte Munto</p>
                        </div>
                        <div className="p-6 bg-orange-50 rounded-[32px] border border-orange-100">
                            <Zap className="text-orange-600 mb-3" size={24}/>
                            <p className="text-2xl font-black text-orange-700">{today.eggs}</p>
                            <p className="text-[8px] font-black uppercase text-orange-400">Uova Raccolte</p>
                        </div>
                        <div className="p-6 bg-green-50 rounded-[32px] border border-green-100">
                            <Euro className="text-green-600 mb-3" size={24}/>
                            <p className="text-2xl font-black text-green-700">€ {today.feedCost.toFixed(0)}</p>
                            <p className="text-[8px] font-black uppercase text-green-400">Costo Feed</p>
                        </div>
                        <div className="p-6 bg-red-50 rounded-[32px] border border-red-100">
                            <Stethoscope className="text-red-600 mb-3" size={24}/>
                            <p className="text-2xl font-black text-red-700">{today.healthEvents}</p>
                            <p className="text-[8px] font-black uppercase text-red-400">Eventi Sanità</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                        <button onClick={() => navigate('/allevamento/produzione')} className="py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all">Registra Produzione</button>
                        <button onClick={() => navigate('/allevamento/alimentazione')} className="py-4 bg-gray-50 text-text-primary border border-gray-100 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all">Registra Razione</button>
                    </div>
                </div>

                {/* BLOCCO D: WELLBEING SCORE */}
                <div className="lg:col-span-4 bg-gray-900 rounded-[48px] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between">
                    <BrainCircuit className="absolute -top-10 -right-10 w-48 h-48 opacity-10" />
                    <div>
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-lg font-black uppercase tracking-tighter">Wellbeing Score</h3>
                            <div className={`p-4 rounded-full font-black text-xl border-4 ${wellbeing.score > 70 ? 'border-primary text-primary' : 'border-orange-500 text-orange-500'}`}>
                                {wellbeing.score}
                            </div>
                        </div>
                        <div className="space-y-4">
                            {wellbeing.reasons.map((r, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${wellbeing.score > 70 ? 'bg-primary' : 'bg-orange-500'}`}></div>
                                    <p className="text-xs font-bold opacity-80 leading-tight">{r}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <button onClick={() => navigate('/allevamento/sanita')} className="mt-8 w-full py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">Analisi Dettagliata</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* BLOCCO B: PROSSIME SCADENZE */}
                <div className="bg-white rounded-[40px] p-10 shadow-xl border border-gray-100 flex flex-col h-full">
                    <h3 className="text-[10px] font-black uppercase text-text-secondary mb-8 tracking-[0.2em] flex items-center gap-2">
                        <Clock size={16} className="text-primary"/> Prossimi Adempimenti (30g)
                    </h3>
                    <div className="space-y-4 flex-grow">
                        {upcoming.length > 0 ? upcoming.map((u, i) => (
                            <div key={i} className="p-4 bg-gray-50 rounded-[28px] flex items-center justify-between border border-transparent hover:border-blue-200 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-2xl ${u.type === 'VACCINO' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                                        {u.type === 'VACCINO' ? <Syringe size={20}/> : <History size={20}/>}
                                    </div>
                                    <div>
                                        <p className="font-black text-sm uppercase tracking-tighter leading-none mb-1">{u.vaccineName || (u as any).title}</p>
                                        <p className="text-[10px] font-bold text-text-secondary uppercase">{new Date((u as any).nextDueDate || (u as any).date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <span className="text-[8px] font-black text-text-secondary uppercase tracking-widest opacity-40">{u.unitName}</span>
                            </div>
                        )) : (
                            <p className="text-center py-10 text-text-secondary italic font-medium">Nessuna scadenza imminente.</p>
                        )}
                    </div>
                    <button onClick={() => navigate('/allevamento/vaccini')} className="mt-8 text-center text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Piani Vaccinali Completi &rarr;</button>
                </div>

                {/* BLOCCO C: ALERT TERRITORIO */}
                <div className="bg-white rounded-[40px] p-10 shadow-xl border border-gray-100 flex flex-col h-full">
                    <h3 className="text-[10px] font-black uppercase text-text-secondary mb-8 tracking-[0.2em] flex items-center gap-2">
                        <ShieldAlert size={16} className="text-red-500"/> Intelligence Territoriale
                    </h3>
                    <div className="space-y-4 flex-grow">
                        {alerts.length > 0 ? alerts.map(a => (
                            <div key={a.id} className={`p-6 rounded-[32px] border-l-8 ${a.severity === 'high' ? 'bg-red-50 border-red-500' : 'bg-orange-50 border-orange-500'} flex flex-col justify-between`}>
                                <div>
                                    <h4 className="font-black text-sm uppercase leading-tight">{a.message}</h4>
                                    <p className="text-[9px] font-bold text-text-secondary uppercase mt-2">{a.region} • {a.source}</p>
                                </div>
                                <button onClick={() => navigate('/allevamento/alert')} className="mt-4 flex items-center gap-1 text-[9px] font-black text-primary uppercase">Apri Alert <ArrowRight size={10}/></button>
                            </div>
                        )) : (
                            <div className="flex flex-col items-center justify-center py-10 opacity-30">
                                <ShieldAlert size={48}/>
                                <p className="text-xs font-black uppercase mt-2">Nessun alert attivo</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* BLOCCO E: UNITÀ CON BADGES */}
            <div className="space-y-6">
                <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2 px-1">
                    <LayoutGrid size={24} className="text-primary"/> Unità di Allevamento
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {units.map(u => {
                        const badges = livestockDashboardService.getUnitBadges(u.id);
                        return (
                            <div key={u.id} className="bg-white rounded-[48px] p-8 shadow-xl border border-gray-100 group hover:border-primary transition-all flex flex-col md:flex-row justify-between items-center gap-8">
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[9px] font-black uppercase">{u.species}</span>
                                            {badges.map(b => (
                                                <span key={b} className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-[8px] font-black uppercase animate-pulse">{b}</span>
                                            ))}
                                        </div>
                                        <h3 className="text-2xl font-black text-text-primary uppercase tracking-tighter leading-none">{u.name}</h3>
                                        <p className="text-[10px] font-bold text-text-secondary flex items-center gap-1 uppercase mt-2"><MapPin size={12}/> {u.location.city}</p>
                                    </div>
                                    <div className="flex items-end gap-2">
                                        <p className="text-4xl font-black text-text-primary">{u.capacityEstimate}</p>
                                        <p className="text-[10px] font-black uppercase text-text-secondary mb-1">Capi stimati</p>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 w-full md:w-48 shrink-0">
                                    <button onClick={() => navigate(`/allevamento/unita/${u.id}`)} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-primary transition-all flex items-center justify-center gap-2">Apri Registri <ArrowRight size={14}/></button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* MODALE CRUD UNIT (Resto come prima) */}
            {modal?.show && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <form onSubmit={handleSaveUnit} className="bg-white rounded-[40px] shadow-2xl p-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto border-2 border-white animate-in zoom-in">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black uppercase tracking-tighter">Anagrafica Unità</h2>
                            <button type="button" onClick={() => setModal(null)} className="p-2 hover:bg-gray-100 rounded-full"><X/></button>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-text-secondary ml-1 tracking-widest">Nome Unità*</label>
                                <input name="name" required defaultValue={modal.data?.name} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold" placeholder="Es: Stalla Bovini Lattazione"/>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1 tracking-widest">Specie*</label>
                                    <select name="species" defaultValue={modal.data?.species} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold">
                                        {SPECIES_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1 tracking-widest">Capi Stimati*</label>
                                    <input name="capacity" type="number" required defaultValue={modal.data?.capacityEstimate} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold" placeholder="0"/>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-text-secondary ml-1 block tracking-widest">Finalità</label>
                                <div className="grid grid-cols-3 gap-2 p-4 bg-gray-50 rounded-2xl">
                                    {PURPOSE_OPTIONS.map(p => (
                                        <label key={p} className="flex items-center gap-2 cursor-pointer p-1">
                                            <input type="checkbox" name={`purpose_${p}`} defaultChecked={modal.data?.purpose.includes(p)} className="w-5 h-5 accent-primary rounded-lg"/>
                                            <span className="text-[9px] font-black uppercase">{p}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <LocationSelector value={location} onChange={setLocation} required />
                            <button type="submit" className="w-full py-5 bg-primary text-white rounded-[24px] font-black uppercase shadow-xl text-xs tracking-widest">Salva Configurazione</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default LivestockHomePage;
