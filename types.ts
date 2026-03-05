
import React from 'react';
import { LucideIcon } from 'lucide-react';

export enum Role {
    AGRICOLTORE = 'Agricoltore',
    ALLEVATORE = 'Allevatore',
    AZIENDA_MISTA = 'Azienda Mista',
    AGRONOMO = 'Agronomo',
    VETERINARIO = 'Veterinario',
    COMMERCIALISTA = 'Commercialista',
    TECNICO = 'Tecnico',
    ADMIN = 'Admin',
    FORNITORE = 'Fornitore'
}

export enum AssetType {
    CAMPI_APERTI = 'Campi Aperti',
    SERRE = 'Serre',
    ARBORETO = 'Arboreto',
    ALLEVAMENTO = 'Allevamento'
}

export type LivestockSpecies = "BOVINI"|"BUFALINI"|"OVINI"|"CAPRINI"|"SUINI"|"POLLAME"|"CONIGLI"|"EQUINI"|"API"|"ALTRO";
export type LivestockPurpose = "LATTE"|"CARNE"|"UOVA"|"LANA"|"RIPRODUZIONE"|"MISTO";
export type LivestockSystem = "STALLA"|"PASCOLO"|"MISTO";
// Fix: Added HYBRID to ManagementMode
export type ManagementMode = "GROUP"|"INDIVIDUAL"|"HYBRID";
export type AnimalStatus = "ATTIVO"|"VENDUTO"|"MORTO"|"ISOLAMENTO";

export interface LivestockUnit {
    id: string;
    name: string;
    species: LivestockSpecies;
    purpose?: LivestockPurpose[];
    system?: LivestockSystem;
    location?: { region: string; province: string; city: string };
    capacityEstimate?: number;
    notes?: string;
    createdAt: number;
    updatedAt?: number;
    // Added properties used in components
    managementMode?: ManagementMode;
    headCount?: number;
    // Fix: added missing productionType
    productionType?: ProductionType;
}

export interface LivestockGroup {
    id: string;
    unitId: string;
    name: string;
    category: string; // es: "Vitelli", "Ovaiole"
    trackingMode: ManagementMode;
    headCount: number;
    createdAt: number;
    updatedAt: number;
    // Added properties used in components
    breed?: string;
    stage?: string;
}

export interface LivestockAnimal {
    id: string;
    unitId: string;
    groupId: string;
    tagId: string;
    sex: "M" | "F";
    birthDate: string;
    status: AnimalStatus;
    notes?: string;
    // Added properties used in components
    breed?: string;
    createdAt?: number;
    updatedAt?: number;
}

export interface LivestockProductionLog {
    id: string;
    unitId: string;
    groupId?: string;
    animalId?: string;
    date: number;
    type: "LATTE" | "UOVA" | "LANA" | "CARNE" | "ALTRO";
    quantity: number;
    unit: string;
    destination: "VENDITA" | "USO_INTERNO";
    createdAt: number;
    // Added properties used in sections
    milkLiters?: number;
    eggsCount?: number;
    woolKg?: number;
    weightAvgKg?: number;
    // Fix: added missing notes
    notes?: string;
}

export interface LivestockFeedingLog {
    id: string;
    unitId: string;
    groupId?: string;
    date: number;
    items: Array<{
        inventoryItemId: string;
        name: string;
        qty: number;
        unit: string;
        cost: number;
    }>;
    totalCost: number;
    notes?: string;
    // Added properties used in sections
    rationType?: string;
    costEuro?: number;
}

export interface LivestockHealthEvent {
    id: string;
    unitId: string;
    groupId?: string;
    animalId?: string;
    date: number;
    category: "MALATTIA"|"SINTOMO"|"TRATTAMENTO"|"FERITA"|"VISITA"|"ALLERTA";
    title: string;
    description: string;
    productName?: string;
    withdrawalDays?: number;
    vetId?: string;
    outcome?: string;
    followUpDate?: string;
    notes?: string;
    // Added properties used in sections
    eventType?: string;
    medicine?: string;
    // Fix: added missing veterinarian
    veterinarian?: string;
    inventoryItemId?: string;
    inventoryQty?: number;
    manualCost?: number;
}

export interface LivestockVaccinePlan {
    id: string;
    unitId: string;
    name: string;
    species: LivestockSpecies;
    rows: Array<{
        id: string;
        vaccineName: string;
        frequencyDays: number;
        lastDate?: string;
        nextDueDate: string;
        active: boolean;
    }>;
}

export interface LivestockAlert {
    id: string;
    scope: "UNIT"|"REGION"|"NATIONAL";
    region?: string;
    disease?: string;
    severity: "low" | "medium" | "high";
    message: string;
    source: "VET"|"AI"|"MINISTERO";
    date: number;
    read: boolean;
}

// Fix: Added missing interfaces for livestock storage and pages
export interface LivestockWelfareEntry {
    id: string;
    unitId: string;
    date: string;
    beddingType: string;
    ventilation: 'automatica' | 'manuale' | 'assente';
    cleanlinessScore: 1 | 2 | 3 | 4 | 5;
    stressSignals: string[];
    notes?: string;
}

export interface LivestockDeadline {
    id: string;
    unitId: string;
    dueDate: string;
    title: string;
    status: 'da_fare' | 'completata';
    createdAt: string;
}

export interface LivestockVetAssignment {
    id: string;
    name: string;
    email: string;
    assignedUnitIds: string[];
}

// --- QUADERNO ---
export type QuadernoEntryType = 
  | "IRRIGAZIONE" | "TRATTAMENTO" | "FERTILIZZAZIONE" 
  | "LAVORAZIONE" | "RACCOLTA" | "SEMINA" | "TRAPIANTO" 
  | "ALIMENTAZIONE" | "VACCINAZIONE" | "VISITA_VETERINARIA" | "EVENTO_SANITARIO"
  | "PRODUZIONE_ALLEVAMENTO" | "ALIMENTAZIONE_ALLEVAMENTO" | "SANITA_ALLEVAMENTO";

export interface QuadernoEntry {
  id: string;
  type: QuadernoEntryType;
  createdAt: number;
  date: number; 
  unitId: string | null;
  unitName?: string;
  notes?: string | null;
  operator?: string | null;
  sourceModule: string;
  status?: "DRAFT" | "CONFIRMED";
  cost?: number;
  products?: any[];
  livestock?: any;
  quantities?: any;
  // Added properties used in specialized modules
  crop?: any;
  zoneId?: string;
  zoneName?: string;
  ecValue?: number;
  equipment?: string;
}

// --- CORE ---
export interface GeoLocation { regionCode: string; provinceCode: string; communeCode: string; regionName: string; provinceName: string; communeName: string; region?: string; }
export interface CompanyProfile { localization: GeoLocation; businessType: 'agricoltura' | 'allevamento' | 'entrambi'; assets: AssetType[]; goals: string[]; operatingModes: string[]; technology: string; constraints: string[]; }
export interface User { id: string; name: string; role: Role; email: string; avatar?: string; personalLocation?: GeoLocation; plan?: Plan; }
export enum Plan { FREE = 'Free', PRO = 'Pro', BUSINESS = 'Business' }
export interface Farm { id: string; ownerId: string; name: string; region: string; province: string; city: string; activities: AssetType[]; piva?: string; }
export interface UIPrefs { compactMode: boolean; sidebarOpen: boolean; lastVisited: string; }
// Fix: Added NotificationSeverity type
export type NotificationSeverity = 'info' | 'warning' | 'critical';
export interface AppNotification { id: string; type: string; title: string; message: string; severity: NotificationSeverity; createdAtISO: string; readAtISO?: string; actionLabel?: string; actionRoute?: string; }
export interface RouteConfig { id: string; path: string; label: string; icon: LucideIcon; section: string; roles: (Role | '*')[]; assets?: AssetType[]; }

// --- INVENTORY ---
export type MovementType = 'IN' | 'OUT' | 'ADJUST';
export type MovementSource = 'manual' | 'invoice' | 'feeding' | 'livestock_feeding' | 'livestock_sanitary';
export interface InventoryItem { 
    id: string; 
    name: string; 
    category: string; 
    unit: string; 
    currentQty: number; 
    avgCost: number; 
    minThreshold?: number; 
    tags: string[]; 
    createdAt: string; 
}
export interface InventoryMovement { 
    id: string; 
    itemId: string; 
    type: MovementType; 
    qty: number; 
    unitCost?: number; 
    totalCost?: number; 
    date: string; 
    source: string; 
    note?: string; 
    sourceRef?: { module: string; entityId: string; key?: string };
}

// --- AI & FORECAST ---
export interface AiPredictiveResult {
    generatedAt: number;
    horizonDays: number;
    confidence: number;
    alerts: AiPredictiveAlert[];
    insights: AiPredictiveInsight[];
    trends: AiPredictiveTrend[];
}

export interface AiPredictiveAlert {
    id: string;
    severity: "high" | "medium" | "low";
    domain: string;
    title: string;
    description: string;
    why: string[];
    recommendedActions: { label: string; route: string }[];
    relatedUnits?: string[];
}

export interface AiPredictiveTrend {
    id: string;
    metric: string;
    direction: "up" | "down" | "stable";
    explanation: string;
}

export interface AiPredictiveInsight {
    id: string;
    title: string;
    description: string;
    metrics?: Record<string, string | number>;
}

export interface CompanyForecastDigest {
    generatedAt: number;
    totalUnits: number;
    globalAgriConfidence: number;
    globalLivestockConfidence: number;
    topRisks: string[];
    summary: string;
}

export enum SoilType {
    SABBIA = 'Sabbia',
    LIMO = 'Limo',
    ARGILLA = 'Argilla',
    MEDIO_IMPASTO = 'Medio Impasto'
}

export enum CropStage {
    SEMINA = 'Semina',
    GERMINAZIONE = 'Germinazione',
    ACCRESCIMENTO = 'Accrescimento',
    FIORITURA = 'Fioritura',
    ALLEGAGIONE = 'Allegagione',
    MATURAZIONE = 'Maturazione',
    RACCOLTA = 'Raccolta'
}

export enum IrrigationSystem {
    GOCCIA = 'Goccia',
    ASPERSIONE = 'Aspersione',
    SUBIRRIGAZIONE = 'Subirrigazione'
}

// --- ECONOMY & LEDGER ---
export type LedgerScope = "AGRICOLTURA" | "ALLEVAMENTO" | "GENERALE";
export type LedgerType = "COSTO" | "RICAVO";
export type LedgerCategory = "MANGIMI" | "VETERINARIO" | "FARMACI" | "CARBURANTE" | "RICAMBI" | "MANODOPERA" | "VENDITE" | "ALTRO";
export type LedgerSource = "MANUALE" | "MAGAZZINO" | "FATTURA" | "EVENTO_APP";

export interface LedgerEntry {
  id: string;
  date: string; // ISO
  scope: LedgerScope;
  unitId?: string;
  groupId?: string;
  animalId?: string;
  type: LedgerType;
  category: LedgerCategory;
  description: string;
  amount: number;
  currency: "EUR";
  source: LedgerSource;
  sourceRef?: {
    module: string;
    entityId: string;
    key?: string;
  };
  attachment?: {
    kind: "PHOTO" | "FILE";
    urlOrDataUrl: string;
  };
  createdAt: string; // ISO
  paymentStatus?: PaymentStatus; // For backward compatibility with AccountingEntry
}

export type InboxStatus = 'NEW' | 'PARSED' | 'CONFIRMED' | 'ARCHIVED';
export type PaymentStatus = 'PAGATO' | 'DA_PAGARE';
export type InboxDocType = 'FATTURA' | 'SCONTRINO' | 'DDT' | 'BOLLETTA' | 'PREVENTIVO' | 'CONTRATTO' | 'ALTRO';

export interface InboxDocRow {
    id: string;
    description: string;
    category: string;
    qty: number;
    unit: string;
    unitPrice: number;
    total: number;
}

export interface InboxSettings {
    autoArchiveConfirmed: boolean;
    defaultCurrency: string;
    notificationsEnabled: boolean;
}

export interface InboxDocument {
    id: string;
    fileName: string;
    fileMime: string;
    fileDataUrl: string;
    docType: InboxDocType;
    supplierName: string;
    docDateISO: string;
    totalAmount: number;
    currency: string;
    notes?: string;
    status: InboxStatus;
    rows: InboxDocRow[];
    createdAt: string;
    updateInventory: boolean;
}

// --- PROFESSIONALS & ASSIGNMENTS ---
export interface Assignment {
    id: string;
    proId: string;
    farmId: string;
    status: 'attivo' | 'pendente';
    assignedAt: string;
}

export interface Professional {
    id: string;
    name: string;
    email: string;
    role: Role;
    status: 'attivo' | 'pendente';
    invitedAt: string;
    image?: string;
}

// --- IRRIGATION ---
export enum ValveType {
    MANUALE = 'MANUALE',
    AUTOMATICA = 'AUTOMATICA'
}

export interface IrrigationZone {
    id: string;
    name: string;
    unitId: string;
    valveType: ValveType;
    flowRateLpm: number;
    isActive: boolean;
    isRunning: boolean;
    runningSince?: number;
    maxRunMinutes: number;
    safetyLock: boolean;
    notes?: string;
    lastRunAt?: number;
}

export interface AiProposal {
    suggestedDurationMin: number;
    suggestedVolumeL: number;
    suggestedEcTargetMsCm: number;
    reasoningShort: string;
    confidence: number;
    factors: string[];
}

export interface EcData {
    enabled: boolean;
    targetMsCm: number | null;
    source: string;
    sensor: {
        available: boolean;
        lastValueMsCm: number | null;
        lastUpdatedAt: string | null;
    };
    manual: {
        startMsCm: number | null;
        endMsCm: number | null;
        singleMsCm: number | null;
    };
}

export interface IrrigationRun {
    id: string;
    zoneId: string;
    zoneName: string;
    unitId: string;
    mode: 'manual' | 'ai';
    plannedMin: number;
    flowLpm: number;
    startedAt: number;
    stoppedAt?: number;
    actualDurationMin?: number;
    volumeLiters?: number;
    status: 'running' | 'completed' | 'error';
    ec: EcData;
}

// --- DECISION SUPPORT & GOVERNANCE ---
export type LocationData = GeoLocation;

export interface AiSuggestion {
    id: number;
    timestamp: string;
    imageSrc: string;
    problem: string;
    crop: string;
    sources: string[];
    warnings: string[];
    isDecisionSupport: boolean;
    headline?: string;
    explanation?: string;
    recommendedAction?: {
        type: string;
        details: string;
        suggestedProducts?: string[];
        actionLink?: {
            text: string;
            link: string;
            state: any;
        };
    };
}

export interface KnowledgeBase {
    disciplinariRegionali: Record<string, Record<string, { allowedActiveIngredients: string[]; restrictions: string[] }>>;
    fitogestLogic: Record<string, { name: string; type: string; bio: boolean }[]>;
    territorialMemory: { region: string; province: string; problem: string; crop: string; date: string }[];
}

export interface SmartAction {
    id: string;
    type: string;
    title: string;
    description: string;
    priority: 'bassa' | 'media' | 'alta';
    prefilledData: any;
    triggerSource: string;
    status: 'proposta' | 'accettata' | 'rifiutata';
    governance: AiGovernanceInfo;
}

export interface AiGovernanceInfo {
    confidenceScore: number;
    sourceType: 'regulatory' | 'collective_memory' | 'weather_model';
    sourceReference: string;
    limitations: string[];
    validationRequired: boolean;
}

// --- RENTALS & AUDIT ---
export type RentalCategory = 'trattore' | 'trincia' | 'atomizzatore' | 'drone' | 'sensori' | 'pompe' | 'generatori' | 'altro';

export interface RentalItem {
    id: string;
    name: string;
    category: RentalCategory;
    description: string;
    zone: string;
    pricePerDay: number;
    ownerId: string;
    rating: number;
    image: string;
    deposit: number;
}

export interface RentalBooking {
    id: string;
    itemId: string;
    renterId: string;
    startDate: string;
    endDate: string;
    totalPrice: number;
    fee: number;
    status: 'richiesta' | 'accettata' | 'rifiutata' | 'in_corso' | 'completata';
    timestamp: string;
}

export interface AuditLogEntry {
    id: string;
    userId: string;
    userName: string;
    role: Role;
    action: string;
    module: string;
    timestamp: string;
}

// --- COLLECTIVE MEMORY & 4D RISKS ---
export type OutcomeLevel = 'risolto' | 'parziale' | 'fallito';

export interface CaseReport {
    id: string;
    ownerId: string;
    timestamp: string;
    territory: GeoLocation;
    unitType: AssetType;
    target: string;
    problem: string;
    intervention: string;
    productUsed?: string;
    outcome: OutcomeLevel;
    daysToResult?: number;
    source: string;
    privacy: { consent: boolean; level: string };
    quality: { completeness: number; reliability: number; isSuspicious: boolean; moderationStatus: 'pending' | 'approved' | 'rejected' };
    conditions?: any;
}

export interface TerritoryPattern {
    id: string;
    problem: string;
    topSolution: string;
    successRate: number;
    avgDays: number;
    casesCount: number;
}

export interface RiskScore4D {
    fungi: number;
    insects: number;
    water: number;
    nutrition: number;
    health?: number;
}

export type RiskLevel = 'basso' | 'medio' | 'alto' | 'critico';

export interface PredictiveAlert {
    id: string;
    unitId: string;
    unitName: string;
    title: string;
    description: string;
    severity: RiskLevel;
    type: string;
    suggestedAction: string;
    targetRoute: string;
    routeState?: any;
    timestamp: string;
    status: string;
    reasons: string[];
}

// --- VISION & INTEGUTIONS ---
export type RiskType = 'fungi' | 'insects' | 'water' | 'nutrition' | 'health';

export interface VisionReport {
    id: string;
    timestamp: string;
    imageUrl: string;
    issueType: RiskType;
    problemLabel: string;
    confidence: number;
    severity: RiskLevel;
    detectedCrop: string;
    description: string;
    why: string[];
    status: string;
}

export type DataSource = 'manual' | 'sensors' | 'external_system';
export type IntegrationStatus = 'connected' | 'disconnected' | 'error';

export interface IntegrationConfig {
    id: string;
    name: string;
    type: string;
    status: IntegrationStatus;
    syncFrequency: string;
    mappedSensors: string[];
    lastSync?: string;
}

export interface OrchardCycle {
    id: string;
    unitId: string;
    species: string;
    variety: string;
    plantingYear: number;
    spacing: string;
    history: { year: number; yield: number; mainProblems: string[]; qualityScore: number }[];
}

export interface IntegrationLog {
    id: string;
    timestamp: string;
    source: string;
    status: 'success' | 'warning' | 'error';
    message: string;
    details?: string;
}

// --- DEADLINES & SEASONAL ---
export type DeadlineStatus = 'attiva' | 'scaduta' | 'rinnovata';
export type DeadlineType = 'patentino_fitosanitario' | 'assicurazione_mezzo' | 'revisione_mezzo' | 'vaccinazione_allevamento';

export interface RenewalHistoryEntry {
    date: string;
    note: string;
    operator: string;
}

export interface Deadline {
    id: string;
    type: DeadlineType;
    title: string;
    description: string;
    dueDate: string;
    alertDaysBefore: number;
    status: DeadlineStatus;
    moduleLink?: string;
    entityId?: string;
    history: RenewalHistoryEntry[];
    notes?: string;
}

export interface SeasonMetrics {
    year: number;
    yieldTotal: number;
    irrigationVolume: number;
    irrigationEvents: number;
    treatmentsCount: number;
    fertilizationsCount: number;
    avgEcTarget: number;
    healthEventsCount: number;
    feedStabilityScore: number;
}

export interface SeasonComparison {
    unitId: string;
    unitName: string;
    seasonsCompared: [number, number];
    deltas: {
        yieldDeltaPercent: number;
        irrigationDeltaPercent: number;
        treatmentsDeltaPercent: number;
        ecDelta: number;
    };
    correlations: {
        metric: string;
        relation: "positiva" | "negativa" | "debole";
        explanation: string;
    }[];
    recommendations: string[];
}

export interface AgriForecast {
    unitId: string;
    unitName: string;
    horizonDays: number;
    confidence: number;
    predictedYieldKg: number | null;
    predictedYieldRangeKg: [number, number] | null;
    predictedIrrigationEvents: number;
    predictedWaterLiters: number | null;
    diseaseRisk: "low" | "medium" | "high";
    why: string[];
    recommendations: { label: string; route: string }[];
}

export interface LivestockForecast {
    unitId: string;
    unitName: string;
    horizonDays: number;
    confidence: number;
    predictedFeedQty: number | null;
    predictedFeedCost: number | null;
    healthRisk: "low" | "medium" | "high";
    predictedProduction: { milkLiters: number | null; eggs: number | null };
    missingDataHints: string[];
    recommendations: { label: string; route: string }[];
}

// --- UTILITY ALIASES ---
export type LivestockProductionEntry = LivestockProductionLog;
export type LivestockFeedingEntry = LivestockFeedingLog;
export type LivestockHealthEntry = LivestockHealthEvent;
export type UnitLivestock = LivestockUnit;
export type Species = LivestockSpecies;
export type ProductionType = LivestockPurpose;
// Fix: Added missing types for notification service
export type NotificationType = string;
