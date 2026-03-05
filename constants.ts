import { 
    Home, Leaf, PawPrint, Banknote, BrainCircuit, Store, Settings, 
    Bell, ShoppingCart, Tractor, Droplets, BookText, 
    Users, CloudSun, ShieldCheck, Radar, Globe, Briefcase, 
    ClipboardList, Syringe, HardDrive, FileText, LayoutGrid, 
    Layers, PenTool, Database, DatabaseZap, ShieldAlert,
    Scan, Cpu, Clock, Terminal, CheckSquare, Boxes, Inbox, Waves, History, TrendingUp, Wheat, Activity,
    Tag, Stethoscope
} from 'lucide-react';
import { Role, AssetType, RouteConfig } from './types';

export enum NAV_AREAS {
    DASHBOARD = 'Dashboard',
    INBOX = 'Inbox Documenti',
    MAGAZZINO = 'Magazzino & Stock',
    PRODUZIONE = 'Produzione Agricola',
    ALLEVAMENTO = 'Allevamento',
    QUADERNO = 'Quaderno di Campagna',
    ECONOMIA = 'Bilancio & Economia',
    METEO = 'Meteo',
    IMPOSTAZIONI = 'Impostazioni',
    NOTIFICHE = 'Centro Notifiche',
    SCADENZE = 'Scadenze & Rinnovi',
    ORDINI = 'Ordini & Acquisti',
    NOLEGGI = 'Noleggi P2P',
    MARKETPLACE = 'Marketplace',
    DIAGNOSTICA = 'Diagnostica Sistema',
    VISION_AI = 'Vision AI',
    PREDITTIVA = 'AI Predittiva',
    SEASONAL = 'Apprendimento Stagionale',
    FORECAST = 'Simulazione & Previsione',
    MEMORIA = 'Memoria Collettiva',
    AZIENDE_ASSEGNATE = 'Aziende Assegnate',
    IRRIGAZIONE = 'Irrigazione'
}

export const ROUTE_REGISTRY: RouteConfig[] = [
    { id: 'dash', path: '/', label: 'Dashboard', icon: Home, section: 'main', roles: ['*'] },
    
    // OPERATIVITÀ
    { id: 'prod', path: '/produzione', label: 'Produzione Agricola', icon: Leaf, section: 'operativita', roles: [Role.AGRICOLTORE, Role.AZIENDA_MISTA, Role.AGRONOMO, Role.ADMIN], assets: [AssetType.CAMPI_APERTI, AssetType.SERRE, AssetType.ARBORETO] },
    
    // ALLEVAMENTO (HUB PRINCIPALE)
    { id: 'livestock_dash', path: '/allevamento', label: 'Allevamento', icon: PawPrint, section: 'operativita', roles: [Role.AGRICOLTORE, Role.ALLEVATORE, Role.AZIENDA_MISTA, Role.VETERINARIO, Role.ADMIN], assets: [AssetType.ALLEVAMENTO] },
    
    // SOTTO-ROTTE ALLEVAMENTO
    { id: 'livestock_units', path: '/allevamento/unita', label: 'Unità Operative', icon: LayoutGrid, section: 'operativita', roles: [Role.AGRICOLTORE, Role.ALLEVATORE, Role.AZIENDA_MISTA, Role.ADMIN], assets: [AssetType.ALLEVAMENTO] },
    { id: 'livestock_groups', path: '/allevamento/gruppi', label: 'Gestione Gruppi', icon: Users, section: 'operativita', roles: [Role.AGRICOLTORE, Role.ALLEVATORE, Role.AZIENDA_MISTA, Role.ADMIN], assets: [AssetType.ALLEVAMENTO] },
    { id: 'livestock_animals', path: '/allevamento/animali', label: 'Tracciabilità Capi', icon: Tag, section: 'operativita', roles: [Role.AGRICOLTORE, Role.ALLEVATORE, Role.AZIENDA_MISTA, Role.ADMIN], assets: [AssetType.ALLEVAMENTO] },
    { id: 'livestock_feeding', path: '/allevamento/alimentazione', label: 'Alimentazione', icon: Wheat, section: 'operativita', roles: [Role.AGRICOLTORE, Role.ALLEVATORE, Role.AZIENDA_MISTA, Role.ADMIN], assets: [AssetType.ALLEVAMENTO] },
    { id: 'livestock_sanitary', path: '/allevamento/registro-sanitario', label: 'Registro Sanitario', icon: Stethoscope, section: 'operativita', roles: [Role.AGRICOLTORE, Role.ALLEVATORE, Role.AZIENDA_MISTA, Role.VETERINARIO, Role.ADMIN], assets: [AssetType.ALLEVAMENTO] },
    { id: 'livestock_vaccines', path: '/allevamento/piani-vaccinali', label: 'Piani Vaccinali', icon: Activity, section: 'operativita', roles: [Role.AGRICOLTORE, Role.ALLEVATORE, Role.AZIENDA_MISTA, Role.VETERINARIO, Role.ADMIN], assets: [AssetType.ALLEVAMENTO] },

    { id: 'quaderno', path: '/quaderno-campagna', label: 'Quaderno di Campagna', icon: BookText, section: 'operativita', roles: ['*'] },
    { id: 'irrigation', path: '/irrigazione', label: 'Irrigazione', icon: Waves, section: 'operativita', roles: [Role.AGRICOLTORE, Role.AZIENDA_MISTA, Role.ADMIN], assets: [AssetType.CAMPI_APERTI, AssetType.SERRE, AssetType.ARBORETO] },
    
    // INTELLIGENCE
    { id: 'predict', path: '/ai-predittiva', label: 'AI Predittiva', icon: Radar, section: 'intelligence', roles: ['*'] },
    { id: 'forecast', path: '/ai-previsioni', label: 'Simulazione & Previsione', icon: TrendingUp, section: 'intelligence', roles: ['*'] },
    { id: 'seasonal', path: '/ai-stagionale', label: 'Apprendimento Stagionale', icon: History, section: 'intelligence', roles: ['*'] },
    { id: 'vision', path: '/vision-ai', label: 'Vision AI Expert', icon: Scan, section: 'intelligence', roles: ['*'] },
    { id: 'memory', path: '/memoria-collettiva', label: 'Memoria Collettiva', icon: DatabaseZap, section: 'intelligence', roles: ['*'] },
    
    // AMMINISTRAZIONE
    { id: 'economy', path: '/economia', label: 'Bilancio & Economia', icon: Banknote, section: 'amministrazione', roles: [Role.AGRICOLTORE, Role.ALLEVATORE, Role.AZIENDA_MISTA, Role.COMMERCIALISTA, Role.ADMIN] },
    { id: 'inventory', path: '/magazzino', label: 'Magazzino & Stock', icon: Boxes, section: 'amministrazione', roles: [Role.AGRICOLTORE, Role.ALLEVATORE, Role.AZIENDA_MISTA, Role.ADMIN] },
    { id: 'inbox', path: '/inbox', label: 'Inbox Documenti', icon: Inbox, section: 'amministrazione', roles: [Role.AGRICOLTORE, Role.ALLEVATORE, Role.AZIENDA_MISTA, Role.COMMERCIALISTA, Role.ADMIN] },
    
    // MARKETPLACE
    { id: 'market', path: '/marketplace', label: 'Marketplace', icon: Store, section: 'market', roles: ['*'] },
    { id: 'rentals', path: '/noleggi', label: 'Noleggi P2P', icon: Tractor, section: 'market', roles: [Role.AGRICOLTORE, Role.ALLEVATORE, Role.AZIENDA_MISTA, Role.ADMIN] },
    { id: 'orders', path: '/ordini', label: 'Ordini & Acquisti', icon: ShoppingCart, section: 'market', roles: [Role.AGRICOLTORE, Role.ALLEVATORE, Role.AZIENDA_MISTA, Role.ADMIN] },
    
    // SISTEMA
    { id: 'meteo', path: '/meteo', label: 'Meteo', icon: CloudSun, section: 'sistema', roles: ['*'] },
    { id: 'deadlines', path: '/scadenze', label: 'Scadenze & Rinnovi', icon: Clock, section: 'sistema', roles: ['*'] },
    { id: 'notif', path: '/notifiche', label: 'Notifiche', icon: Bell, section: 'sistema', roles: ['*'] },
    { id: 'settings', path: '/settings', label: 'Impostazioni', icon: Settings, section: 'sistema', roles: ['*'] },

    // PROFESSIONISTI
    { id: 'pro_farms', path: '/aziende-assegnate', label: 'Clienti Assegnati', icon: Users, section: 'main', roles: [Role.AGRONOMO, Role.VETERINARIO, Role.COMMERCIALISTA, Role.TECNICO, Role.ADMIN] },

    // ADMIN
    { id: 'diag', path: '/admin/diagnostica', label: 'Diagnostica', icon: Terminal, section: 'admin', roles: [Role.ADMIN] },
    { id: 'checklist', path: '/admin/checklist', label: 'QA Checklist', icon: CheckSquare, section: 'admin', roles: [Role.ADMIN] }
];

export const SECTION_LABELS = {
    main: 'Principale',
    operativita: 'Gestione Operativa',
    intelligence: 'AI & Intelligence',
    amministrazione: 'Amministrazione',
    market: 'Mercato & Risorse',
    sistema: 'Strumenti & Sistema',
    admin: 'Amministrazione TeraIA'
};

export const COST_CATEGORIES = [
    { id: 'utenze', label: 'Utenze (Luce/Acqua/Gas)', isPhysical: false },
    { id: 'servizi', label: 'Servizi', isPhysical: false },
    { id: 'manutenzione', label: 'Manutenzione', isPhysical: false },
    { id: 'carburanti', label: 'Carburanti', isPhysical: true },
    { id: 'lubrificanti', label: 'Lubrificanti', isPhysical: true },
    { id: 'ricambi', label: 'Ricambi', isPhysical: true },
    { id: 'attrezzature', label: 'Attrezzature', isPhysical: true },
    { id: 'dpi', label: 'DPI (Sicurezza)', isPhysical: true },
    { id: 'fitosanitari', label: 'Fitosanitari', isPhysical: true },
    { id: 'concimi', label: 'Concimi / Ammendanti', isPhysical: true },
    { id: 'sementi', label: 'Semi / Piantine', isPhysical: true },
    { id: 'mangimi', label: 'Mangimi', isPhysical: true },
    { id: 'integratori', label: 'Integratori', isPhysical: true },
    { id: 'farmaci_vet', label: 'Farmaci Veterinari', isPhysical: true },
    { id: 'lettiera', label: 'Lettiera / Paglia', isPhysical: true },
    { id: 'stalla', label: 'Materiale Stalla', isPhysical: true },
    { id: 'manodopera', label: 'Manodopera', isPhysical: false },
    { id: 'altro', label: 'Altro', isPhysical: false }
];

export const ROLE_PERMISSIONS: Record<Role, NAV_AREAS[]> = {
    [Role.AGRICOLTORE]: Object.values(NAV_AREAS),
    [Role.ALLEVATORE]: Object.values(NAV_AREAS),
    [Role.AZIENDA_MISTA]: Object.values(NAV_AREAS),
    [Role.ADMIN]: Object.values(NAV_AREAS),
    [Role.AGRONOMO]: [NAV_AREAS.DASHBOARD, NAV_AREAS.PRODUZIONE, NAV_AREAS.QUADERNO, NAV_AREAS.METEO, NAV_AREAS.VISION_AI, NAV_AREAS.PREDITTIVA, NAV_AREAS.SEASONAL, NAV_AREAS.FORECAST, NAV_AREAS.MEMORIA, NAV_AREAS.AZIENDE_ASSEGNATE],
    [Role.VETERINARIO]: [NAV_AREAS.DASHBOARD, NAV_AREAS.ALLEVAMENTO, NAV_AREAS.METEO, NAV_AREAS.PREDITTIVA, NAV_AREAS.FORECAST, NAV_AREAS.MEMORIA, NAV_AREAS.AZIENDE_ASSEGNATE],
    [Role.COMMERCIALISTA]: [NAV_AREAS.DASHBOARD, NAV_AREAS.ECONOMIA, NAV_AREAS.INBOX, NAV_AREAS.AZIENDE_ASSEGNATE],
    [Role.TECNICO]: [NAV_AREAS.DASHBOARD, NAV_AREAS.DIAGNOSTICA, NAV_AREAS.AZIENDE_ASSEGNATE],
    [Role.FORNITORE]: [NAV_AREAS.DASHBOARD, NAV_AREAS.MARKETPLACE]
};

export const ASSET_VISIBILITY: Partial<Record<NAV_AREAS, AssetType[]>> = {
    [NAV_AREAS.PRODUZIONE]: [AssetType.CAMPI_APERTI, AssetType.SERRE, AssetType.ARBORETO],
    [NAV_AREAS.ALLEVAMENTO]: [AssetType.ALLEVAMENTO],
    [NAV_AREAS.IRRIGAZIONE]: [AssetType.CAMPI_APERTI, AssetType.SERRE, AssetType.ARBORETO]
};

export const WAREHOUSE_CATEGORIES = {
    COMUNI: [{ id: 'carburanti', label: 'Carburanti' }, { id: 'manutenzione', label: 'Manutenzione' }],
    AGRICOLTURA: [{ id: 'sementi', label: 'Sementi' }, { id: 'concimi', label: 'Concimi' }, { id: 'fitosanitari', label: 'Fitosanitari' }],
    ALLEVAMENTO: [{ id: 'mangimi', label: 'Mangimi' }, { id: 'integratori', label: 'Integratori' }, { id: 'farmaci_vet', label: 'Farmaci' }]
};