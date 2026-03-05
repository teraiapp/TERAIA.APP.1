
import { Role, User, Farm, AssetType, Assignment } from '../types';

export const MOCK_USERS: User[] = [
    { id: 'u-1', name: 'Mario Rossi', role: Role.AGRICOLTORE, email: 'mario@rossi.it' },
    { id: 'u-2', name: 'Luigi Bianchi', role: Role.VETERINARIO, email: 'luigi@vet.it' },
    { id: 'u-3', name: 'Sara Verdi', role: Role.AGRONOMO, email: 'sara@agro.it' },
    { id: 'u-4', name: 'Antonio Fisco', role: Role.COMMERCIALISTA, email: 'antonio@fisco.it' },
    { id: 'u-5', name: 'Admin Tera', role: Role.ADMIN, email: 'admin@teraia.it' }
];

export const MOCK_FARMS: Farm[] = [
    { id: 'f-1', ownerId: 'u-1', name: 'Tenuta Smeralda', region: 'Toscana', province: 'FI', city: 'Siena', activities: [AssetType.CAMPI_APERTI, AssetType.ARBORETO], piva: '01234567890' },
    { id: 'f-2', ownerId: 'u-99', name: 'Masseria Vecchia', region: 'Puglia', province: 'BA', city: 'Altamura', activities: [AssetType.ALLEVAMENTO, AssetType.CAMPI_APERTI], piva: '09876543210' },
    { id: 'f-3', ownerId: 'u-98', name: 'Serre del Sole', region: 'Sicilia', province: 'CT', city: 'Pachino', activities: [AssetType.SERRE], piva: '11223344556' }
];

export const MOCK_ASSIGNMENTS: Assignment[] = [
    { id: 'as-1', proId: 'u-2', farmId: 'f-2', status: 'attivo', assignedAt: '2024-01-10T10:00:00Z' },
    { id: 'as-2', proId: 'u-3', farmId: 'f-1', status: 'attivo', assignedAt: '2024-02-15T10:00:00Z' },
    { id: 'as-3', proId: 'u-3', farmId: 'f-2', status: 'attivo', assignedAt: '2024-03-20T10:00:00Z' },
    { id: 'as-4', proId: 'u-4', farmId: 'f-1', status: 'attivo', assignedAt: '2024-04-01T10:00:00Z' }
];
