
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, MapPin, Loader2, Database, ChevronDown, Check } from 'lucide-react';
import { geoService, GeoItem } from '../services/geoService';
import { GeoLocation } from '../types';

interface Props {
    value: GeoLocation;
    onChange: (val: GeoLocation) => void;
    required?: boolean;
    className?: string;
    labelClassName?: string;
}

const LocationSelector: React.FC<Props> = ({ value, onChange, required = false, className, labelClassName }) => {
    const [loading, setLoading] = useState(true);
    const [activeDropdown, setActiveDropdown] = useState<'r' | 'p' | 'c' | null>(null);
    const [search, setSearch] = useState({ r: '', p: '', c: '' });
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        geoService.loadAll().then(() => setLoading(false));
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setActiveDropdown(null);
                setSearch({ r: '', p: '', c: '' });
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredRegions = useMemo(() => 
        geoService.getRegions().filter(r => r.name.toLowerCase().includes(search.r.toLowerCase())), 
    [search.r, loading]);

    const filteredProvinces = useMemo(() => 
        geoService.getProvinces(value.regionCode).filter(p => p.name.toLowerCase().includes(search.p.toLowerCase())), 
    [value.regionCode, search.p, loading]);

    const filteredCommunes = useMemo(() => 
        geoService.getCommunes(value.provinceCode).filter(c => c.name.toLowerCase().includes(search.c.toLowerCase())), 
    [value.provinceCode, search.c, loading]);

    const handleSelect = (level: 'r' | 'p' | 'c', item: GeoItem) => {
        if (level === 'r') {
            onChange({ 
                regionCode: item.code!, 
                regionName: item.name, 
                provinceCode: '', 
                provinceName: '', 
                communeCode: '', 
                communeName: '' 
            });
        } else if (level === 'p') {
            onChange({ 
                ...value, 
                provinceCode: item.code!, 
                provinceName: item.name, 
                communeCode: '', 
                communeName: '' 
            });
        } else {
            onChange({ 
                ...value, 
                communeCode: item.name, // Using name as code for simple mapping
                communeName: item.name 
            });
        }
        setActiveDropdown(null);
        setSearch({ r: '', p: '', c: '' });
    };

    if (loading) return (
        <div className="flex items-center gap-3 p-6 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <Loader2 className="animate-spin text-primary" size={20}/>
            <span className="text-[10px] font-black uppercase text-text-secondary tracking-widest">Caricamento GeoDB...</span>
        </div>
    );

    const stats = geoService.getStats();

    return (
        <div ref={containerRef} className={`space-y-4 ${className}`}>
            {/* DEBUG INFO (Dev only style) */}
            <div className="flex items-center gap-2 text-[8px] font-black text-text-secondary/40 uppercase tracking-widest mb-1">
                <Database size={8}/> DB Italia: R{stats.r} P{stats.p} C{stats.c}
            </div>

            {/* 1. REGIONE */}
            <div className="space-y-1.5 relative">
                <label className={`text-[10px] font-black uppercase text-text-secondary tracking-widest ml-1 ${labelClassName}`}>1. Regione</label>
                <div 
                    onClick={() => setActiveDropdown('r')}
                    className={`w-full px-4 py-3.5 bg-gray-50 border-2 rounded-2xl cursor-pointer flex justify-between items-center transition-all ${activeDropdown === 'r' ? 'border-primary ring-4 ring-primary/5 bg-white' : 'border-transparent hover:bg-gray-100'}`}
                >
                    <div className="flex items-center gap-3 overflow-hidden">
                        <MapPin size={16} className={value.regionName ? "text-primary" : "text-gray-300"}/>
                        <span className={`text-sm font-bold truncate ${value.regionName ? 'text-text-primary' : 'text-gray-400'}`}>
                            {value.regionName || "Seleziona Regione"}
                        </span>
                    </div>
                    <ChevronDown size={18} className={`text-gray-400 transition-transform ${activeDropdown === 'r' ? 'rotate-180' : ''}`}/>
                </div>

                {activeDropdown === 'r' && (
                    <div className="absolute z-[100] w-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="p-3 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
                            <Search size={14} className="text-gray-400"/>
                            <input 
                                autoFocus
                                className="bg-transparent border-none outline-none w-full text-xs font-bold"
                                placeholder="Cerca regione..."
                                value={search.r}
                                onChange={e => setSearch({...search, r: e.target.value})}
                                onClick={e => e.stopPropagation()}
                            />
                        </div>
                        <div className="max-h-60 overflow-y-auto p-2 space-y-1">
                            {filteredRegions.map(r => (
                                <button 
                                    key={r.code} 
                                    onClick={() => handleSelect('r', r)} 
                                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-between ${value.regionCode === r.code ? 'bg-primary text-white shadow-md' : 'hover:bg-primary/5 text-text-primary'}`}
                                >
                                    {r.name}
                                    {value.regionCode === r.code && <Check size={14}/>}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* 2. PROVINCIA */}
            <div className={`space-y-1.5 relative transition-opacity duration-300 ${!value.regionCode ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                <label className={`text-[10px] font-black uppercase text-text-secondary tracking-widest ml-1 ${labelClassName}`}>2. Provincia</label>
                <div 
                    onClick={() => setActiveDropdown('p')}
                    className={`w-full px-4 py-3.5 bg-gray-50 border-2 rounded-2xl cursor-pointer flex justify-between items-center transition-all ${activeDropdown === 'p' ? 'border-primary ring-4 ring-primary/5 bg-white' : 'border-transparent hover:bg-gray-100'}`}
                >
                    <div className="flex items-center gap-3 overflow-hidden">
                        <Database size={16} className={value.provinceName ? "text-primary" : "text-gray-300"}/>
                        <span className={`text-sm font-bold truncate ${value.provinceName ? 'text-text-primary' : 'text-gray-400'}`}>
                            {value.provinceName || "Seleziona Provincia"}
                        </span>
                    </div>
                    <ChevronDown size={18} className={`text-gray-400 transition-transform ${activeDropdown === 'p' ? 'rotate-180' : ''}`}/>
                </div>

                {activeDropdown === 'p' && (
                    <div className="absolute z-[90] w-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="p-3 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
                            <Search size={14} className="text-gray-400"/>
                            <input 
                                autoFocus
                                className="bg-transparent border-none outline-none w-full text-xs font-bold"
                                placeholder="Cerca provincia o sigla..."
                                value={search.p}
                                onChange={e => setSearch({...search, p: e.target.value})}
                                onClick={e => e.stopPropagation()}
                            />
                        </div>
                        <div className="max-h-60 overflow-y-auto p-2 space-y-1">
                            {filteredProvinces.map(p => (
                                <button 
                                    key={p.code} 
                                    onClick={() => handleSelect('p', p)} 
                                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-between ${value.provinceCode === p.code ? 'bg-primary text-white shadow-md' : 'hover:bg-primary/5 text-text-primary'}`}
                                >
                                    <span>{p.name} <b className="opacity-40">({p.code})</b></span>
                                    {value.provinceCode === p.code && <Check size={14}/>}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* 3. COMUNE */}
            <div className={`space-y-1.5 relative transition-opacity duration-300 ${!value.provinceCode ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                <label className={`text-[10px] font-black uppercase text-text-secondary tracking-widest ml-1 ${labelClassName}`}>3. Comune</label>
                <div 
                    onClick={() => setActiveDropdown('c')}
                    className={`w-full px-4 py-3.5 bg-gray-50 border-2 rounded-2xl cursor-pointer flex justify-between items-center transition-all ${activeDropdown === 'c' ? 'border-primary ring-4 ring-primary/5 bg-white' : 'border-transparent hover:bg-gray-100'}`}
                >
                    <div className="flex items-center gap-3 overflow-hidden">
                        <Search size={16} className={value.communeName ? "text-primary" : "text-gray-300"}/>
                        <span className={`text-sm font-bold truncate ${value.communeName ? 'text-text-primary' : 'text-gray-400'}`}>
                            {value.communeName || "Seleziona Comune"}
                        </span>
                    </div>
                    <ChevronDown size={18} className={`text-gray-400 transition-transform ${activeDropdown === 'c' ? 'rotate-180' : ''}`}/>
                </div>

                {activeDropdown === 'c' && (
                    <div className="absolute z-[80] w-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="p-3 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
                            <Search size={14} className="text-gray-400"/>
                            <input 
                                autoFocus
                                className="bg-transparent border-none outline-none w-full text-xs font-bold"
                                placeholder="Scrivi il nome del comune..."
                                value={search.c}
                                onChange={e => setSearch({...search, c: e.target.value})}
                                onClick={e => e.stopPropagation()}
                            />
                        </div>
                        <div className="max-h-60 overflow-y-auto p-2 space-y-1">
                            {filteredCommunes.map(c => (
                                <button 
                                    key={c.name} 
                                    onClick={() => handleSelect('c', c)} 
                                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-between ${value.communeName === c.name ? 'bg-primary text-white shadow-md' : 'hover:bg-primary/5 text-text-primary'}`}
                                >
                                    {c.name}
                                    {value.communeName === c.name && <Check size={14}/>}
                                </button>
                            ))}
                            {filteredCommunes.length === 0 && search.c && (
                                <p className="p-4 text-center text-[10px] font-black text-gray-300 uppercase italic">Nessun comune trovato</p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {required && !value.communeCode && (
                <div className="flex items-center gap-2 text-[9px] font-black text-red-500 uppercase tracking-widest animate-pulse px-1">
                    <AlertTriangle size={12}/> Selezione località obbligatoria
                </div>
            )}
        </div>
    );
};

const AlertTriangle: React.FC<{size?: number, className?: string}> = ({size = 24, className}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>
    </svg>
);

export default LocationSelector;
