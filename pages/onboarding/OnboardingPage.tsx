import React, { useState } from 'react';
import { Sparkles, MapPin, Building2, Check, Leaf, Tractor, Droplets, Target, PawPrint, ArrowRight, AlertCircle } from 'lucide-react';
import { useAppContext } from '../../hooks/useAppContext';
import { useAuth } from '../../hooks/AuthContext';
import { supabase } from '../../lib/supabase';
import { CompanyProfile, AssetType, GeoLocation } from '../../types';
import LocationSelector from '../../components/LocationSelector';

const OnboardingPage: React.FC = () => {
    const { setCompanyProfile } = useAppContext();
    const { user } = useAuth();
    const [step, setStep] = useState(0);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    // Form State
    const [location, setLocation] = useState<GeoLocation>({
        regionCode: "", provinceCode: "", communeCode: "",
        regionName: "", provinceName: "", communeName: ""
    });
    const [selectedActivities, setSelectedActivities] = useState<AssetType[]>([]);
    const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

    const isLocationComplete = location.regionCode && location.provinceCode && location.communeCode;

    const toggleActivity = (type: AssetType) => {
        setSelectedActivities(prev => 
            prev.includes(type) ? prev.filter(a => a !== type) : [...prev, type]
        );
    };

    const toggleGoal = (goal: string) => {
        setSelectedGoals(prev => 
            prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
        );
    };

    const finish = async () => {
        if (!user) {
            setError('Utente non autenticato');
            return;
        }

        setSaving(true);
        setError('');

        try {
            const profile: CompanyProfile = {
                localization: location,
                businessType: selectedActivities.includes(AssetType.ALLEVAMENTO) ? 'entrambi' : 'agricoltura',
                assets: selectedActivities,
                goals: selectedGoals,
                operatingModes: [],
                technology: 'Base',
                constraints: []
            };

            // Salva su Supabase
            const { data, error: dbError } = await supabase
                .from('company_profiles')
                .insert([
                    {
                        user_id: user.id,
                        country: 'Italia',
                        region: location.regionName,
                        province: location.provinceName,
                        city: location.communeName,
                        assets: selectedActivities,
                        operating_modes: profile.operatingModes,
                        technology: profile.technology,
                        constraints: profile.constraints,
                        details: {
                            regionCode: location.regionCode,
                            provinceCode: location.provinceCode,
                            communeCode: location.communeCode,
                            businessType: profile.businessType,
                            goals: selectedGoals
                        }
                    }
                ])
                .select()
                .single();

            if (dbError) {
                throw dbError;
            }

            // Persistenza locale immediata per cache
            localStorage.setItem('teraia_location', JSON.stringify(location));
            localStorage.setItem('teraia_profile_v4', JSON.stringify(profile));

            // Aggiorna context
            setCompanyProfile(profile);
        } catch (err: any) {
            console.error('Error saving company profile:', err);
            setError(err.message || 'Errore durante il salvataggio del profilo');
            setSaving(false);
        }
    };

    const renderStep = () => {
        switch(step) {
            case 0: return (
                <div className="text-center space-y-6 animate-in zoom-in duration-500">
                    <div className="p-6 bg-primary/10 rounded-full w-fit mx-auto"><Sparkles className="text-primary" size={64}/></div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter leading-none">Benvenuto in TeraIA</h2>
                    <p className="text-text-secondary font-medium max-w-sm mx-auto leading-relaxed">Configuriamo il tuo ecosistema digitale in 3 rapidi step.</p>
                    <button onClick={() => setStep(1)} className="w-full py-5 bg-primary text-white rounded-[24px] font-black shadow-xl hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-xs">Inizia Setup</button>
                </div>
            );
            case 1: return (
                <div className="space-y-6 animate-in slide-in-from-right duration-300">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-primary/10 rounded-2xl text-primary"><MapPin size={24}/></div>
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tighter">Localizzazione</h2>
                            <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">Attiva i modelli meteo territoriali</p>
                        </div>
                    </div>
                    <LocationSelector value={location} onChange={setLocation} required={true} />
                    <button 
                        onClick={() => setStep(2)} 
                        disabled={!isLocationComplete} 
                        className="w-full py-5 bg-primary text-white rounded-[24px] font-black shadow-lg disabled:opacity-30 uppercase tracking-widest text-xs mt-4 flex items-center justify-center gap-2 hover:gap-4 transition-all"
                    >
                        Prosegui <ArrowRight size={18}/>
                    </button>
                </div>
            );
            case 2: return (
                <div className="space-y-6 animate-in slide-in-from-right duration-300">
                    <h2 className="text-2xl font-black flex items-center gap-3 uppercase tracking-tighter"><Building2 className="text-primary"/> Attività</h2>
                    <p className="text-sm text-text-secondary font-medium">Cosa gestisci in <b>{location.communeName}</b>? (Multi-scelta)</p>
                    <div className="grid grid-cols-1 gap-3">
                        {[
                            { id: AssetType.CAMPI_APERTI, icon: Tractor, label: 'Campi Aperti', desc: 'Seminativi, cereali, estensivi' },
                            { id: AssetType.SERRE, icon: Droplets, label: 'Serre', desc: 'Orticole, floricoltura' },
                            { id: AssetType.ARBORETO, icon: Leaf, label: 'Arboreto / Frutteto', desc: 'Vite, Olivo, Frutta' },
                            { id: AssetType.ALLEVAMENTO, icon: PawPrint, label: 'Allevamento', desc: 'Bovini, ovini, stalle' }
                        ].map(act => (
                            <button 
                                key={act.id} 
                                onClick={() => toggleActivity(act.id)}
                                className={`p-4 rounded-3xl border-2 text-left flex items-center gap-4 transition-all ${selectedActivities.includes(act.id) ? 'border-primary bg-primary/5' : 'border-gray-100 hover:bg-gray-50'}`}
                            >
                                <div className={`p-3 rounded-2xl ${selectedActivities.includes(act.id) ? 'bg-primary text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}>
                                    <act.icon size={20}/>
                                </div>
                                <div className="flex-1">
                                    <p className="font-black text-sm uppercase leading-tight">{act.label}</p>
                                    <p className="text-[10px] text-text-secondary font-bold uppercase tracking-tight">{act.desc}</p>
                                </div>
                                {selectedActivities.includes(act.id) && <Check className="text-primary" size={20}/>}
                            </button>
                        ))}
                    </div>
                    <button onClick={() => setStep(3)} disabled={selectedActivities.length === 0} className="w-full py-5 bg-primary text-white rounded-[24px] font-black shadow-lg uppercase tracking-widest text-xs">Continua</button>
                </div>
            );
            case 3: return (
                <div className="space-y-6 animate-in slide-in-from-right duration-300">
                    <h2 className="text-2xl font-black flex items-center gap-3 uppercase tracking-tighter"><Target className="text-primary"/> Obiettivi</h2>
                    <p className="text-sm text-text-secondary font-medium">In cosa può aiutarti TeraIA?</p>
                    
                    {/* Error Alert */}
                    {error && (
                        <div className="p-4 bg-red-50 border-2 border-red-200 rounded-2xl flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-800 font-medium">{error}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-3">
                        {[
                            'Ridurre rischi e malattie',
                            'Risparmiare acqua e costi',
                            'Essere in regola con le leggi',
                            'Migliorare resa e qualità'
                        ].map(goal => (
                            <button 
                                key={goal} 
                                onClick={() => toggleGoal(goal)}
                                disabled={saving}
                                className={`p-4 rounded-3xl border-2 text-left flex items-center justify-between transition-all disabled:opacity-50 ${selectedGoals.includes(goal) ? 'border-primary bg-primary/5' : 'border-gray-100 hover:bg-gray-50'}`}
                            >
                                <span className="font-black text-sm uppercase">{goal}</span>
                                {selectedGoals.includes(goal) && <Check className="text-primary" size={20}/>}
                            </button>
                        ))}
                    </div>
                    <button 
                        onClick={finish} 
                        disabled={selectedGoals.length === 0 || saving} 
                        className="w-full py-5 bg-gray-900 text-white rounded-[24px] font-black shadow-2xl hover:bg-black uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {saving ? 'Salvataggio in corso...' : 'Finalizza Setup'}
                    </button>
                </div>
            );
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
            <div className="max-w-xl w-full bg-surface rounded-[48px] shadow-2xl p-12 border-2 border-white relative overflow-hidden">
                {renderStep()}
            </div>
        </div>
    );
};

export default OnboardingPage;