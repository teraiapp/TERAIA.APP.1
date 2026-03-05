import React, { useState, useEffect } from 'react';
import { 
    Mail, Bell, ShieldCheck, Save, Info, BellRing, 
    Smartphone, MailCheck, Inbox, ShieldAlert, Building2,
    Upload, Phone, Globe, FileText, CheckCircle, AlertCircle
} from 'lucide-react';
import { useAppContext } from '../../hooks/useAppContext';
import { useAuth } from '../../hooks/AuthContext';
import { supabase } from '../../lib/supabase';
import { inboxService } from '../../services/inboxService';
import { notificationService } from '../../services/notificationService';

interface CompanyData {
    company_name: string;
    legal_name: string;
    vat_number: string;
    tax_code: string;
    pec_email: string;
    phone: string;
    address: string;
    postal_code: string;
    website: string;
    company_type: string;
    logo_url: string;
}

const COMPANY_TYPES = [
    { value: 'individuale', label: 'Ditta Individuale' },
    { value: 'srl', label: 'S.r.l.' },
    { value: 'snc', label: 'S.n.c.' },
    { value: 'sas', label: 'S.a.s.' },
    { value: 'spa', label: 'S.p.a.' },
    { value: 'cooperativa', label: 'Cooperativa' },
    { value: 'altro', label: 'Altro' }
];

const SettingsPage: React.FC = () => {
    const { user } = useAuth();
    const { companyProfile } = useAppContext();
    const [settings, setSettings] = useState(inboxService.getSettings());
    const [loading, setLoading] = useState(true);
    const [savingCompany, setSavingCompany] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    
    const [companyData, setCompanyData] = useState<CompanyData>({
        company_name: '',
        legal_name: '',
        vat_number: '',
        tax_code: '',
        pec_email: '',
        phone: '',
        address: '',
        postal_code: '',
        website: '',
        company_type: '',
        logo_url: ''
    });

    // Carica dati aziendali esistenti
    useEffect(() => {
        const loadCompanyData = async () => {
            if (!user) return;
            
            try {
                const { data, error } = await supabase
                    .from('company_profiles')
                    .select('*')
                    .eq('user_id', user.id)
                    .single();

                if (error) throw error;

                if (data) {
                    setCompanyData({
                        company_name: data.company_name || '',
                        legal_name: data.legal_name || '',
                        vat_number: data.vat_number || '',
                        tax_code: data.tax_code || '',
                        pec_email: data.pec_email || '',
                        phone: data.phone || '',
                        address: data.address || '',
                        postal_code: data.postal_code || '',
                        website: data.website || '',
                        company_type: data.company_type || '',
                        logo_url: data.logo_url || ''
                    });
                }
            } catch (err) {
                console.error('Error loading company data:', err);
            } finally {
                setLoading(false);
            }
        };

        loadCompanyData();
    }, [user]);

    // Validazioni
    const validateVAT = (vat: string): boolean => /^\d{11}$/.test(vat);
    const validateTaxCode = (code: string): boolean => /^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/i.test(code);
    const validatePEC = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email) && email.toLowerCase().includes('.pec.');
    };

    // Salva settings email/notifiche
    const handleSaveSettings = (e: React.FormEvent) => {
        e.preventDefault();
        inboxService.saveSettings(settings);
        setMessage({ type: 'success', text: 'Configurazioni amministrative salvate!' });
        setTimeout(() => setMessage(null), 3000);
    };

    // Salva dati aziendali
    const handleSaveCompany = async () => {
        if (!user) return;

        // Validazioni
        if (companyData.vat_number && !validateVAT(companyData.vat_number)) {
            setMessage({ type: 'error', text: 'P.IVA non valida (11 cifre)' });
            return;
        }
        if (companyData.tax_code && !validateTaxCode(companyData.tax_code)) {
            setMessage({ type: 'error', text: 'Codice Fiscale non valido' });
            return;
        }
        if (companyData.pec_email && !validatePEC(companyData.pec_email)) {
            setMessage({ type: 'error', text: 'PEC non valida' });
            return;
        }

        setSavingCompany(true);
        setMessage(null);

        try {
            const { error } = await supabase
                .from('company_profiles')
                .update({
                    company_name: companyData.company_name,
                    legal_name: companyData.legal_name,
                    vat_number: companyData.vat_number,
                    tax_code: companyData.tax_code,
                    pec_email: companyData.pec_email,
                    phone: companyData.phone,
                    address: companyData.address,
                    postal_code: companyData.postal_code,
                    website: companyData.website,
                    company_type: companyData.company_type,
                    logo_url: companyData.logo_url,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', user.id);

            if (error) throw error;
            setMessage({ type: 'success', text: 'Profilo aziendale aggiornato!' });
            setTimeout(() => setMessage(null), 3000);
        } catch (err: any) {
            console.error('Error saving company:', err);
            setMessage({ type: 'error', text: 'Errore durante il salvataggio' });
        } finally {
            setSavingCompany(false);
        }
    };

    // Upload logo
    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        if (!file.type.startsWith('image/')) {
            setMessage({ type: 'error', text: 'Seleziona un\'immagine valida' });
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            setMessage({ type: 'error', text: 'Max 2MB' });
            return;
        }

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}_${Date.now()}.${fileExt}`;
            const filePath = `logos/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('company-assets')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('company-assets')
                .getPublicUrl(filePath);

            setCompanyData(prev => ({ ...prev, logo_url: publicUrl }));
            setMessage({ type: 'success', text: 'Logo caricato!' });
        } catch (err: any) {
            console.error('Upload error:', err);
            setMessage({ type: 'error', text: 'Errore caricamento logo' });
        } finally {
            setUploading(false);
        }
    };

    const togglePush = async () => {
        if (!settings.pushEnabled) {
            const granted = await notificationService.requestPushPermission();
            if (granted) setSettings({ ...settings, pushEnabled: true });
            else setMessage({ type: 'error', text: 'Permesso negato dal browser' });
        } else {
            setSettings({ ...settings, pushEnabled: false });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <h1 className="text-3xl font-black text-text-primary uppercase tracking-tighter">Impostazioni</h1>
            
            {/* Alert Messages */}
            {message && (
                <div className={`p-4 rounded-[24px] flex items-start gap-3 ${
                    message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}>
                    {message.type === 'success' ? (
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <p className={`text-sm font-bold uppercase ${
                        message.type === 'success' ? 'text-green-800' : 'text-red-800'
                    }`}>{message.text}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 space-y-8">
                    {/* PROFILO AZIENDALE */}
                    <div className="bg-white rounded-[40px] shadow-xl p-8 border-t-4 border-green-600">
                        <h2 className="text-xl font-black uppercase flex items-center gap-2 tracking-tighter mb-6">
                            <Building2 className="text-green-600"/> Profilo Aziendale
                        </h2>

                        {/* Logo */}
                        <div className="mb-6 p-6 bg-gray-50 rounded-[24px]">
                            <label className="text-[10px] font-black uppercase text-text-secondary ml-1 mb-3 block">Logo Aziendale</label>
                            <div className="flex items-center gap-6">
                                {companyData.logo_url ? (
                                    <img 
                                        src={companyData.logo_url} 
                                        alt="Logo" 
                                        className="w-20 h-20 object-contain border rounded-xl bg-white p-2"
                                    />
                                ) : (
                                    <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-white">
                                        <Building2 className="h-8 w-8 text-gray-400" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoUpload}
                                        className="hidden"
                                        id="logo-upload"
                                        disabled={uploading}
                                    />
                                    <label
                                        htmlFor="logo-upload"
                                        className={`inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl font-black uppercase text-[10px] cursor-pointer hover:bg-green-700 transition-colors ${
                                            uploading ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                    >
                                        <Upload size={16} />
                                        {uploading ? 'Caricamento...' : 'Carica'}
                                    </label>
                                    <p className="text-[9px] text-text-secondary mt-2 font-bold uppercase">PNG, JPG max 2MB</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1 mb-1 block">Nome Azienda</label>
                                    <input
                                        type="text"
                                        value={companyData.company_name}
                                        onChange={(e) => setCompanyData({ ...companyData, company_name: e.target.value })}
                                        placeholder="Azienda Agricola Rossi"
                                        className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1 mb-1 block">Ragione Sociale</label>
                                    <input
                                        type="text"
                                        value={companyData.legal_name}
                                        onChange={(e) => setCompanyData({ ...companyData, legal_name: e.target.value })}
                                        placeholder="Mario Rossi S.r.l."
                                        className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1 mb-1 block">Tipo</label>
                                    <select
                                        value={companyData.company_type}
                                        onChange={(e) => setCompanyData({ ...companyData, company_type: e.target.value })}
                                        className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none"
                                    >
                                        <option value="">Seleziona...</option>
                                        {COMPANY_TYPES.map(type => (
                                            <option key={type.value} value={type.value}>{type.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1 mb-1 block">P.IVA</label>
                                    <input
                                        type="text"
                                        value={companyData.vat_number}
                                        onChange={(e) => setCompanyData({ ...companyData, vat_number: e.target.value })}
                                        placeholder="11 cifre"
                                        maxLength={11}
                                        className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1 mb-1 block">Cod. Fiscale</label>
                                    <input
                                        type="text"
                                        value={companyData.tax_code}
                                        onChange={(e) => setCompanyData({ ...companyData, tax_code: e.target.value.toUpperCase() })}
                                        placeholder="16 caratteri"
                                        maxLength={16}
                                        className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none uppercase"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1 mb-1 block flex items-center gap-1">
                                        <Mail size={12} /> PEC
                                    </label>
                                    <input
                                        type="email"
                                        value={companyData.pec_email}
                                        onChange={(e) => setCompanyData({ ...companyData, pec_email: e.target.value })}
                                        placeholder="azienda@pec.it"
                                        className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1 mb-1 block flex items-center gap-1">
                                        <Phone size={12} /> Telefono
                                    </label>
                                    <input
                                        type="tel"
                                        value={companyData.phone}
                                        onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
                                        placeholder="+39 123 456 7890"
                                        className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase text-text-secondary ml-1 mb-1 block flex items-center gap-1">
                                    <Globe size={12} /> Sito Web
                                </label>
                                <input
                                    type="url"
                                    value={companyData.website}
                                    onChange={(e) => setCompanyData({ ...companyData, website: e.target.value })}
                                    placeholder="https://www.azienda.it"
                                    className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase text-text-secondary ml-1 mb-1 block">Indirizzo</label>
                                <input
                                    type="text"
                                    value={companyData.address}
                                    onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
                                    placeholder="Via, numero civico"
                                    className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase text-text-secondary ml-1 mb-1 block">CAP</label>
                                <input
                                    type="text"
                                    value={companyData.postal_code}
                                    onChange={(e) => setCompanyData({ ...companyData, postal_code: e.target.value })}
                                    placeholder="00000"
                                    maxLength={5}
                                    className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleSaveCompany}
                            disabled={savingCompany}
                            className="mt-6 w-full py-4 bg-green-600 text-white rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-green-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <Save size={18}/>
                            {savingCompany ? 'Salvataggio...' : 'Salva Profilo Aziendale'}
                        </button>
                    </div>

                    {/* EMAIL AMMINISTRAZIONE */}
                    <form onSubmit={handleSaveSettings} className="bg-white rounded-[40px] shadow-xl p-8 border-t-4 border-indigo-600">
                        <h2 className="text-xl font-black uppercase flex items-center gap-2 tracking-tighter mb-6">
                            <Mail className="text-indigo-600"/> Email Amministrazione
                        </h2>
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black uppercase text-text-secondary ml-1 mb-1 block">Email Principale</label>
                                <input 
                                    type="email" 
                                    className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none" 
                                    value={settings.emailAdmin}
                                    onChange={e => setSettings({...settings, emailAdmin: e.target.value})}
                                    placeholder="amministrazione@azienda.it"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1 mb-1 block">Alias Fatture</label>
                                    <input 
                                        className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none" 
                                        value={settings.emailAliasFatture}
                                        onChange={e => setSettings({...settings, emailAliasFatture: e.target.value})}
                                        placeholder="fatture+id@teraia.app"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1 mb-1 block">Alias Utenze</label>
                                    <input 
                                        className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none" 
                                        value={settings.emailAliasUtenze}
                                        onChange={e => setSettings({...settings, emailAliasUtenze: e.target.value})}
                                        placeholder="utenze+id@teraia.app"
                                    />
                                </div>
                            </div>
                            
                            <div className="p-6 bg-indigo-50 rounded-[32px] border border-indigo-100 flex gap-4">
                                <Info className="text-indigo-600 shrink-0" size={24}/>
                                <p className="text-[11px] text-indigo-800 font-bold uppercase leading-tight">
                                    Fornisci questi indirizzi ai tuoi fornitori per ricevere documenti automaticamente.
                                </p>
                            </div>

                            <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                                <Save size={18}/> Salva Email
                            </button>
                        </div>
                    </form>

                    {/* NOTIFICHE */}
                    <div className="bg-white rounded-[40px] shadow-xl p-8 border-t-4 border-primary">
                        <h2 className="text-xl font-black uppercase flex items-center gap-2 tracking-tighter mb-6">
                            <Bell className="text-primary"/> Notifiche & Alert
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-[24px]">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white rounded-xl text-primary"><BellRing size={20}/></div>
                                    <div>
                                        <p className="font-black text-xs uppercase">Notifiche In-App</p>
                                        <p className="text-[10px] font-bold text-text-secondary uppercase">Sempre visibili nel pannello</p>
                                    </div>
                                </div>
                                <input 
                                    type="checkbox" 
                                    className="w-6 h-6 accent-primary" 
                                    checked={settings.notificationsEnabled} 
                                    onChange={e=>setSettings({...settings, notificationsEnabled: e.target.checked})} 
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-[24px]">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white rounded-xl text-primary"><Smartphone size={20}/></div>
                                    <div>
                                        <p className="font-black text-xs uppercase">Web Push</p>
                                        <p className="text-[10px] font-bold text-text-secondary uppercase">Alert anche ad app chiusa</p>
                                    </div>
                                </div>
                                <button 
                                    type="button" 
                                    onClick={togglePush} 
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase ${settings.pushEnabled ? 'bg-primary text-white' : 'bg-gray-200 text-text-secondary'}`}
                                >
                                    {settings.pushEnabled ? 'ATTIVE' : 'ATTIVA'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-5">
                    <div className="bg-gray-900 rounded-[40px] p-8 text-white shadow-2xl sticky top-8">
                        <h3 className="text-xl font-black uppercase tracking-tighter mb-4">Info</h3>
                        <p className="text-xs opacity-60 mb-6 font-medium leading-relaxed">
                            Configura tutti i dati della tua azienda per avere un profilo completo e professionale. 
                            Le informazioni fiscali sono fondamentali per la gestione documentale.
                        </p>
                        <div className="p-4 bg-white/10 rounded-[24px]">
                            <p className="text-[10px] font-black uppercase tracking-wider mb-2">Status</p>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="opacity-60 uppercase font-bold">Logo</span>
                                    <span className={companyData.logo_url ? 'text-green-400' : 'text-yellow-400'}>
                                        {companyData.logo_url ? '✓ Caricato' : '⚠ Mancante'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="opacity-60 uppercase font-bold">P.IVA</span>
                                    <span className={companyData.vat_number ? 'text-green-400' : 'text-yellow-400'}>
                                        {companyData.vat_number ? '✓ Inserita' : '⚠ Mancante'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="opacity-60 uppercase font-bold">PEC</span>
                                    <span className={companyData.pec_email ? 'text-green-400' : 'text-yellow-400'}>
                                        {companyData.pec_email ? '✓ Configurata' : '⚠ Mancante'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;