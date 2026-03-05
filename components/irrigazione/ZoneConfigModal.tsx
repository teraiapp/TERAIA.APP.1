
import React, { useState, useEffect } from 'react';
import { X, Waves, MapPin, Gauge, Info, ShieldCheck, Cpu } from 'lucide-react';
import { IrrigationZone, ValveType } from '../../types';

interface ZoneConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (zone: IrrigationZone) => void;
    editingZone?: IrrigationZone | null;
}

const ZoneConfigModal: React.FC<ZoneConfigModalProps> = ({ isOpen, onClose, onSave, editingZone }) => {
    const [units, setUnits] = useState<any[]>([]);
    
    useEffect(() => {
        // Leggi unità da Produzione (versione v2 come da progetto)
        const savedUnits = JSON.parse(localStorage.getItem('teraia_production_units_v2') || '[]');
        setUnits(savedUnits);
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        
        const zoneData: IrrigationZone = {
            id: editingZone?.id || `zone-${Date.now()}`,
            name: f.get('name') as string,
            unitId: f.get('unitId') as string,
            valveType: f.get('valveType') as ValveType,
            flowRateLpm: Number(f.get('flowRate')),
            isActive: f.get('isActive') === 'on',
            isRunning: editingZone?.isRunning || false,
            runningSince: editingZone?.runningSince,
            maxRunMinutes: Number(f.get('maxRunMinutes')) || 180,
            safetyLock: f.get('safetyLock') === 'on',
            notes: f.get('notes') as string,
            lastRunAt: editingZone?.lastRunAt
        };

        onSave(zoneData);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[48px] shadow-2xl p-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto border-4 border-white relative animate-in zoom-in duration-300">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                            <Waves size={28}/>
                        </div>
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tighter">Configurazione Settore</h2>
                            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Definisci i parametri tecnici dell'impianto</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={24}/>
                    </button>
                </div>

                {units.length === 0 ? (
                    <div className="bg-orange-50 border-2 border-orange-200 p-8 rounded-[32px] text-center space-y-4">
                        <AlertCircle className="mx-auto text-orange-500" size={48}/>
                        <h3 className="text-lg font-black uppercase text-orange-800 leading-none">Nessuna Unità Disponibile</h3>
                        <p className="text-sm text-orange-700 font-medium italic leading-relaxed">
                            "Devi creare almeno un'unità agricola nel modulo Produzione prima di poter configurare un settore di irrigazione."
                        </p>
                        <button type="button" onClick={onClose} className="px-8 py-3 bg-orange-500 text-white rounded-xl font-black text-[10px] uppercase shadow-lg">Chiudi e vai a Produzione</button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Nome Zona / Settore*</label>
                                <input 
                                    name="name" 
                                    required 
                                    defaultValue={editingZone?.name} 
                                    className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-primary outline-none" 
                                    placeholder="Es: Settore 1 - Vigneto Nord"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Unità Agricola Collegata*</label>
                                <select 
                                    name="unitId" 
                                    required 
                                    defaultValue={editingZone?.unitId} 
                                    className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-primary outline-none appearance-none"
                                >
                                    <option value="">Seleziona Unità...</option>
                                    {units.map(u => (
                                        <option key={u.id} value={u.id}>{u.name} ({u.category})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Tipo Valvola / Attuatore</label>
                                <select 
                                    name="valveType" 
                                    defaultValue={editingZone?.valveType || 'MANUALE'} 
                                    className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-primary outline-none"
                                >
                                    <option value="MANUALE">Manuale</option>
                                    <option value="AUTOMATICA">Smart / Automatica</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Portata Stimata (L/min)*</label>
                                <div className="relative">
                                    <input 
                                        name="flowRate" 
                                        type="number" 
                                        required 
                                        defaultValue={editingZone?.flowRateLpm || 25} 
                                        className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-primary outline-none" 
                                        placeholder="0.00"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-text-secondary">LPM</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-gray-50 rounded-[32px] space-y-4 border border-gray-100">
                            <p className="text-[10px] font-black uppercase text-text-secondary tracking-widest flex items-center gap-2">
                                <ShieldCheck size={14} className="text-primary"/> Parametri di Sicurezza & Guardrail
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Timeout Max (minuti)</label>
                                    <input 
                                        name="maxRunMinutes" 
                                        type="number" 
                                        defaultValue={editingZone?.maxRunMinutes || 180} 
                                        className="w-full p-3 bg-white border-none rounded-xl font-bold text-xs"
                                    />
                                </div>
                                <div className="flex flex-col justify-center gap-2">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input type="checkbox" name="safetyLock" defaultChecked={editingZone ? editingZone.safetyLock : true} className="w-5 h-5 accent-primary rounded-lg"/>
                                        <span className="text-[10px] font-black uppercase text-text-primary group-hover:text-primary transition-colors">Blocco di Sicurezza Attivo</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input type="checkbox" name="isActive" defaultChecked={editingZone ? editingZone.isActive : true} className="w-5 h-5 accent-primary rounded-lg"/>
                                        <span className="text-[10px] font-black uppercase text-text-primary group-hover:text-primary transition-colors">Settore Abilitato</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Indirizzo Hardware / ID Sensore (Opx)</label>
                            <div className="relative">
                                <Cpu className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16}/>
                                <input 
                                    name="hwId" 
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl font-bold text-sm outline-none" 
                                    placeholder="Es: ID-NODE-01"
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button type="submit" className="w-full py-5 bg-primary text-white rounded-[24px] font-black uppercase text-xs tracking-widest shadow-xl hover:bg-primary-dark hover:scale-[1.02] active:scale-95 transition-all">
                                {editingZone ? 'Aggiorna Configurazione' : 'Crea Settore Idrico'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

const AlertCircle: React.FC<{size?: number, className?: string}> = ({size = 24, className}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
);

export default ZoneConfigModal;
