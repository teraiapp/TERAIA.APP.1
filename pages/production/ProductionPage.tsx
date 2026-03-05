
import React, { useState, useMemo, useEffect } from 'react';
import { 
    PlusCircle, MapPin, Leaf, BarChart2, X, Building2, 
    ArrowRight, Pencil, Trash2, Tag, Calendar, 
    ShieldCheck, Info, Filter, RotateCcw, Save, AlertTriangle, Droplets,
    Sprout, Tractor,
    /* Added missing PenTool import */
    PenTool
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../hooks/useAppContext';
import LocationSelector from '../../components/LocationSelector';
import { GeoLocation, SoilType, CropStage, IrrigationSystem } from '../../types';
import { quadernoService } from '../../services/quadernoService';

export type UnitCategory = 
    | 'Campo aperto' | 'Serra' | 'Frutteto/Arboreto' | 'Uliveto' 
    | 'Vigneto' | 'Agrumeto' | 'Orto' | 'Vivaio' | 'Allevamento' | 'Altro';

interface ProductionUnit {
    id: string;
    name: string;
    category: UnitCategory;
    subtype: string;
    area: number;
    areaUnit: 'ha' | 'm²';
    location: GeoLocation;
    cycle: 'Annuale' | 'Pluriennale';
    variety: string;
    plantDate: string;
    notes?: string;
    updatedAt: string;
    crop_key: string;
    soilType?: SoilType;
    cropStage?: CropStage;
    irrigationSystem?: IrrigationSystem;
}

const CATEGORIES: UnitCategory[] = [
    'Campo aperto', 'Serra', 'Frutteto/Arboreto', 'Uliveto', 
    'Vigneto', 'Agrumeto', 'Orto', 'Vivaio', 'Allevamento', 'Altro'
];

const STORAGE_KEY = 'teraia_production_units_v2';

const ProductionPage: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser } = useAppContext();
    const [units, setUnits] = useState<ProductionUnit[]>(() => JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
    const [modal, setModal] = useState<{ show: boolean, type: 'add' | 'edit' | 'quick_action', data?: any }>({ show: false, type: 'add' });
    const [formLoc, setFormLoc] = useState<GeoLocation>({ regionCode: '', provinceCode: '', communeCode: '', regionName: '', provinceName: '', communeName: '' });

    useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(units)); }, [units]);

    const handleSaveUnit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        
        const unitData: ProductionUnit = {
            id: modal.type === 'edit' ? modal.data!.id : `unit-${Date.now()}`,
            name: f.get('name') as string,
            category: f.get('category') as UnitCategory,
            subtype: 'Standard',
            area: Number(f.get('area')),
            areaUnit: f.get('areaUnit') as 'ha' | 'm²',
            location: formLoc,
            cycle: f.get('cycle') as 'Annuale' | 'Pluriennale',
            variety: f.get('variety') as string,
            plantDate: f.get('plantDate') as string,
            crop_key: (f.get('name') as string).toLowerCase().includes('pomodoro') ? 'pomodoro' : 'ulivo',
            soilType: f.get('soilType') as SoilType,
            cropStage: f.get('cropStage') as CropStage,
            irrigationSystem: f.get('irrigationSystem') as IrrigationSystem,
            notes: f.get('notes') as string,
            updatedAt: new Date().toISOString()
        };

        if (modal.type === 'add') setUnits([unitData, ...units]);
        else setUnits(units.map(u => u.id === unitData.id ? unitData : u));
        setModal({ show: false, type: 'add' });
    };

    const handleQuickAction = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const actionType = f.get('actionType') as any;
        const unit = modal.data as ProductionUnit;

        // SYNC CON QUADERNO STANDARD (STEP 1)
        quadernoService.addEntry({
            type: actionType,
            date: Date.now(),
            unitId: unit.id,
            unitName: unit.name,
            crop: { name: unit.crop_key, variety: unit.variety },
            quantities: {
                yieldKg: actionType === 'RACCOLTA' ? Number(f.get('qty')) : undefined,
                areaHa: unit.area,
                unit: actionType === 'RACCOLTA' ? 'kg' : 'ha'
            },
            notes: f.get('notes') as string,
            operator: currentUser?.name || 'Operatore',
            equipment: f.get('equipment') as string,
            sourceModule: "produzione_rapida",
            status: "CONFIRMED"
        });

        alert(`Operazione di ${actionType} registrata nel Quaderno!`);
        setModal({ show: false, type: 'add' });
    };

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-black uppercase tracking-tighter">Mappa Unità</h1>
                <button onClick={() => setModal({ show: true, type: 'add' })} className="px-6 py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase shadow-xl hover:scale-105 transition-all flex items-center gap-2">
                    <PlusCircle size={18}/> Nuova Unità
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {units.map(u => (
                    <div key={u.id} className="bg-white rounded-[40px] p-8 shadow-xl border border-gray-100 group hover:border-primary transition-all">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-4 bg-primary/10 text-primary rounded-3xl group-hover:scale-110 transition-transform"><Leaf size={24}/></div>
                            <div className="flex gap-1">
                                <button onClick={() => setModal({show: true, type: 'edit', data: u})} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil size={16}/></button>
                                <button onClick={() => {if(confirm('Eliminare?')) setUnits(units.filter(curr=>curr.id!==u.id))}} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                            </div>
                        </div>
                        <h3 className="text-2xl font-black uppercase tracking-tighter mb-1 leading-none truncate">{u.name}</h3>
                        <p className="text-[10px] font-bold text-text-secondary uppercase mb-6 flex items-center gap-1"><MapPin size={10}/> {u.location.communeName}</p>
                        
                        <div className="grid grid-cols-2 gap-2 mb-6">
                            <div className="p-3 bg-gray-50 rounded-2xl"><p className="text-[8px] font-black text-text-secondary uppercase">Superficie</p><p className="font-bold text-sm leading-none">{u.area} {u.areaUnit}</p></div>
                            <div className="p-3 bg-gray-50 rounded-2xl"><p className="text-[8px] font-black text-text-secondary uppercase">Coltura</p><p className="font-bold text-sm leading-none uppercase truncate">{u.crop_key}</p></div>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-2">
                            <button onClick={() => setModal({show: true, type: 'quick_action', data: u})} className="w-full py-4 bg-gray-900 text-white rounded-[20px] font-black text-[10px] uppercase tracking-widest hover:bg-primary transition-all flex items-center justify-center gap-2">
                                <PenTool size={14}/> Registra Attività
                            </button>
                            <button onClick={() => navigate('/irrigazione')} className="w-full py-4 bg-gray-100 text-text-primary rounded-[20px] font-black text-[10px] uppercase tracking-widest hover:bg-white border border-gray-200 transition-all">Gestisci Irrigazione</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* MODALE UNITA */}
            {modal.show && (modal.type === 'add' || modal.type === 'edit') && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                    <form onSubmit={handleSaveUnit} className="bg-white rounded-[40px] shadow-2xl p-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto border-2 border-white animate-in zoom-in">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black uppercase tracking-tighter">{modal.type === 'edit' ? 'Modifica Unità' : 'Nuova Unità'}</h2>
                            <button type="button" onClick={() => setModal({show: false, type:'add'})} className="p-2 hover:bg-gray-100 rounded-full"><X/></button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Nome Unità*</label>
                                <input name="name" defaultValue={modal.data?.name} required className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold" placeholder="Es: Campo Sud"/>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Categoria*</label>
                                <select name="category" defaultValue={modal.data?.category} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold outline-none">
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="p-6 bg-gray-50 rounded-[32px] mb-8 border border-gray-100">
                            <p className="text-[10px] font-black uppercase text-text-secondary mb-4 tracking-widest flex items-center gap-2"><Settings2 size={14}/> Parametri Agronomici</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <input name="area" type="number" step="0.1" defaultValue={modal.data?.area} placeholder="Area (Ha)" className="p-3 bg-white border-none rounded-xl font-bold text-xs shadow-sm" required/>
                                <input name="variety" defaultValue={modal.data?.variety} placeholder="Varietà" className="p-3 bg-white border-none rounded-xl font-bold text-xs shadow-sm col-span-2"/>
                            </div>
                        </div>

                        <LocationSelector value={formLoc} onChange={setFormLoc} required />
                        
                        <button type="submit" className="w-full py-5 bg-primary text-white rounded-[24px] font-black uppercase text-xs tracking-widest shadow-xl mt-10 hover:bg-primary-dark transition-all">Salva Unità</button>
                    </form>
                </div>
            )}

            {/* MODALE AZIONE RAPIDA (RACCOLTA / LAVORAZIONE) */}
            {modal.show && modal.type === 'quick_action' && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                    <form onSubmit={handleQuickAction} className="bg-white rounded-[40px] shadow-2xl p-10 w-full max-w-lg border-2 border-white animate-in zoom-in">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-tighter leading-none">Registra Attività</h2>
                                <p className="text-[10px] font-bold text-primary uppercase mt-1">Unità: {modal.data.name}</p>
                            </div>
                            <button type="button" onClick={() => setModal({show: false, type:'add'})} className="p-2 hover:bg-gray-100 rounded-full"><X/></button>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Tipo di Operazione*</label>
                                <select name="actionType" className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold outline-none" required>
                                    <option value="RACCOLTA">Raccolta / Vendemmia</option>
                                    <option value="LAVORAZIONE">Lavorazione Terreno</option>
                                    <option value="FERTILIZZAZIONE">Concimazione</option>
                                    <option value="SEMINA">Semina / Trapianto</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Mezzo Utilizzato</label>
                                    <input name="equipment" className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold" placeholder="Es: Trattore JD 6155"/>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Quantità (Kg/Ha)</label>
                                    <input name="qty" type="number" className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold" placeholder="0"/>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Note / Osservazioni</label>
                                <textarea name="notes" rows={3} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold text-sm" placeholder="Specifica dettagli intervento..."/>
                            </div>

                            <div className="p-4 bg-indigo-50 rounded-[24px] border border-indigo-100 flex items-start gap-3">
                                <ShieldCheck className="text-indigo-600 shrink-0" size={20}/>
                                <p className="text-[10px] text-indigo-800 font-bold uppercase leading-tight">Questa azione verrà certificata istantaneamente nel Quaderno di Campagna.</p>
                            </div>

                            <button type="submit" className="w-full py-5 bg-gray-900 text-white rounded-[24px] font-black uppercase text-xs tracking-widest shadow-xl hover:bg-black transition-all">Sincronizza Quaderno</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

const Settings2: React.FC<{size?: number, className?: string}> = ({size = 24, className}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/>
    </svg>
);

export default ProductionPage;
