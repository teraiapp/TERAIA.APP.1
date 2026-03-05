
import React, { useState, useMemo, useEffect } from 'react';
import { Sun, Cloud, CloudRain, Wind, AlertTriangle, ChevronDown, ChevronUp, MapPin, RefreshCw, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../hooks/useAppContext';
import { getLocalWeather, WeatherForecast } from '../../services/localWeather';

const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
    <div className={`bg-surface rounded-xl shadow-md p-6 ${className}`}>
        {children}
    </div>
);

const MeteoPage: React.FC = () => {
    const navigate = useNavigate();
    const { companyProfile } = useAppContext();
    const [weather, setWeather] = useState<WeatherForecast[]>([]);
    const [openDay, setOpenDay] = useState<string | null>(null);

    const location = companyProfile?.localization;

    useEffect(() => {
        if (location?.communeCode) {
            setWeather(getLocalWeather(location));
        }
    }, [location]);

    if (!location?.communeCode) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in">
                <MapPin size={64} className="text-gray-300 mb-6" />
                <h2 className="text-2xl font-black uppercase tracking-tighter">Località non impostata</h2>
                <p className="text-text-secondary max-w-sm mt-2 font-medium">Imposta la posizione della tua azienda nelle impostazioni per visualizzare il meteo e le previsioni agronomiche.</p>
                <button 
                    onClick={() => navigate('/impostazioni')}
                    className="mt-8 px-8 py-4 bg-primary text-white rounded-[24px] font-black uppercase text-xs tracking-widest shadow-xl flex items-center gap-2"
                >
                    <Settings size={18}/> Configura Località
                </button>
            </div>
        );
    }

    const current = weather[0];

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* HEADER METEO */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-text-primary flex items-center gap-3 uppercase tracking-tighter">
                        Previsioni Smart AI
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1">
                            <MapPin size={10}/> {location.communeName} ({location.provinceCode})
                        </span>
                        <button onClick={() => navigate('/impostazioni')} className="text-[10px] font-bold text-text-secondary hover:text-primary transition-colors underline">Cambia Località</button>
                    </div>
                </div>
                <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 flex items-center gap-3 shadow-sm">
                    <RefreshCw size={14} className="text-primary"/>
                    <span className="text-[10px] font-black uppercase text-text-secondary tracking-widest">Update: Real-Time</span>
                </div>
            </div>

            {/* MAIN WIDGET */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 flex flex-col md:flex-row items-center justify-between border-t-8 border-primary rounded-[40px] p-10 relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-[10px] font-black uppercase text-text-secondary tracking-widest mb-2">Condizioni Attuali</h2>
                        <p className="text-7xl font-black text-text-primary tracking-tighter">{current?.temp || '--'}°C</p>
                        <p className="text-sm font-medium text-text-secondary mt-2 flex items-center gap-2">
                             Umidità {current?.humidity}% • {current?.condition}
                        </p>
                    </div>
                    <div className="text-right mt-4 md:mt-0 relative z-10">
                        <Sun className="text-yellow-500 w-32 h-32 animate-spin-slow" />
                    </div>
                    <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
                </Card>

                <div className="space-y-6">
                    <Card className="bg-gray-900 text-white rounded-[32px] border-none shadow-xl">
                        <h3 className="text-sm font-black uppercase mb-4 flex items-center gap-2 text-primary"><AlertTriangle size={18}/> Alert Rischio</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between text-xs border-b border-white/10 pb-2"><span>Brina Matutina:</span> <span className="font-bold text-green-400">Basso</span></div>
                            <div className="flex justify-between text-xs border-b border-white/10 pb-2"><span>Rischio Oidio:</span> <span className="font-bold text-yellow-400">Medio</span></div>
                            <div className="flex justify-between text-xs"><span>Stress Idrico:</span> <span className="font-bold text-red-400">Alto</span></div>
                        </div>
                    </Card>
                    <div className="p-6 bg-blue-50 rounded-[32px] border border-blue-100 flex items-start gap-4">
                        <Wind className="text-blue-600 shrink-0" size={24}/>
                        <p className="text-[10px] text-blue-800 font-bold leading-relaxed uppercase">
                            Venti dominanti da NE a 12 km/h. <br/>Finestra di trattamento ideale: Domani 06:00 - 09:00.
                        </p>
                    </div>
                </div>
            </div>

            {/* 7 DAYS LIST */}
            <Card className="rounded-[40px] p-10">
                <h2 className="text-xl font-black uppercase tracking-tight mb-8">Previsioni 7 Giorni</h2>
                <div className="space-y-2">
                    {weather.map(item => (
                        <div key={item.day} className="border-b border-gray-50 last:border-b-0">
                            <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-all rounded-2xl cursor-pointer" onClick={() => setOpenDay(openDay === item.day ? null : item.day)}>
                                <div className="flex items-center gap-6">
                                    <div className="p-3 bg-gray-50 rounded-xl">
                                        {item.condition === 'Sunny' ? <Sun className="text-yellow-500" /> : <Cloud className="text-blue-400" />}
                                    </div>
                                    <div>
                                        <p className="font-black text-lg uppercase tracking-tighter">{item.day}</p>
                                        <p className="text-[10px] font-bold text-text-secondary uppercase">{item.condition}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-10">
                                    <p className="font-black text-2xl tracking-tighter">{item.temp}°C</p>
                                    <div className={`h-1.5 w-24 bg-gray-100 rounded-full overflow-hidden hidden md:block`}>
                                        <div className={`h-full ${item.risk > 60 ? 'bg-red-500' : 'bg-primary'}`} style={{ width: `${item.risk}%` }}></div>
                                    </div>
                                    {openDay === item.day ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                                </div>
                            </div>
                            {openDay === item.day && (
                                <div className="p-6 bg-gray-50 rounded-3xl mb-4 animate-in slide-in-from-top-2 duration-300">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                        <div className="space-y-1"><p className="text-[9px] font-black text-text-secondary uppercase">Umidità</p><p className="font-bold">{item.humidity}%</p></div>
                                        <div className="space-y-1"><p className="text-[9px] font-black text-text-secondary uppercase">Prob. Pioggia</p><p className="font-bold">{item.risk}%</p></div>
                                        <div className="space-y-1"><p className="text-[9px] font-black text-text-secondary uppercase">Indice UV</p><p className="font-bold">Alto (7)</p></div>
                                        <div className="space-y-1"><p className="text-[9px] font-black text-text-secondary uppercase">Dew Point</p><p className="font-bold">14°C</p></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default MeteoPage;
