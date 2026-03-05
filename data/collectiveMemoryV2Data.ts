
import { CaseReport, AssetType } from '../types';

export const INITIAL_PUBLIC_CASES: CaseReport[] = [
    {
        id: 'pub-1',
        ownerId: 'anon-1',
        timestamp: '2024-05-15T10:00:00Z',
        // Fixed: Updated territory to satisfy GeoLocation interface (province/city replaced with correct required fields).
        territory: { 
            regionCode: 'PUG', 
            regionName: 'Puglia', 
            provinceCode: 'BA', 
            provinceName: 'Bari', 
            communeCode: 'ALTAMURA', 
            communeName: 'Altamura',
            region: 'Puglia' 
        },
        unitType: AssetType.CAMPI_APERTI,
        target: 'Vite',
        problem: 'Peronospora',
        intervention: 'Trattamento preventivo precoce post-pioggia.',
        productUsed: 'Cuprofix 30',
        outcome: 'risolto',
        daysToResult: 5,
        source: 'quaderno',
        privacy: { consent: true, level: 'nazionale' },
        quality: { completeness: 95, reliability: 90, isSuspicious: false, moderationStatus: 'approved' }
    },
    {
        id: 'pub-2',
        ownerId: 'anon-2',
        timestamp: '2024-06-02T08:30:00Z',
        // Fixed: Updated territory to satisfy GeoLocation interface (province/city replaced with correct required fields).
        territory: { 
            regionCode: 'TOS', 
            regionName: 'Toscana', 
            provinceCode: 'FI', 
            provinceName: 'Firenze', 
            communeCode: 'SCANDICCI', 
            communeName: 'Scandicci',
            region: 'Toscana' 
        },
        unitType: AssetType.ARBORETO,
        target: 'Olivo',
        problem: 'Occhio di Pavone',
        intervention: 'Concimazione fogliare e rameici.',
        productUsed: 'Rame Idrossido',
        outcome: 'parziale',
        daysToResult: 12,
        source: 'manuale',
        privacy: { consent: true, level: 'territorio' },
        quality: { completeness: 80, reliability: 70, isSuspicious: false, moderationStatus: 'approved' }
    }
];
