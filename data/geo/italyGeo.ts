
export interface GeoRegion {
    code: string;
    name: string;
}

export interface GeoProvince {
    code: string;
    name: string;
    regionCode: string;
}

export interface GeoCity {
    name: string;
    provinceCode: string;
}

export const REGIONS: GeoRegion[] = [
    { code: 'ABR', name: 'Abruzzo' }, { code: 'BAS', name: 'Basilicata' }, { code: 'CAL', name: 'Calabria' },
    { code: 'CAM', name: 'Campania' }, { code: 'EMR', name: 'Emilia-Romagna' }, { code: 'FVG', name: 'Friuli Venezia Giulia' },
    { code: 'LAZ', name: 'Lazio' }, { code: 'LIG', name: 'Liguria' }, { code: 'LOM', name: 'Lombardia' },
    { code: 'MAR', name: 'Marche' }, { code: 'MOL', name: 'Molise' }, { code: 'PIE', name: 'Piemonte' },
    { code: 'PUG', name: 'Puglia' }, { code: 'SAR', name: 'Sardegna' }, { code: 'SIC', name: 'Sicilia' },
    { code: 'TOS', name: 'Toscana' }, { code: 'TAA', name: 'Trentino-Alto Adige' }, { code: 'UMB', name: 'Umbria' },
    { code: 'VAO', name: 'Valle d\'Aosta' }, { code: 'VEN', name: 'Veneto' }
];

export const PROVINCES: GeoProvince[] = [
    { code: 'AG', name: 'Agrigento', regionCode: 'SIC' }, { code: 'AL', name: 'Alessandria', regionCode: 'PIE' },
    { code: 'BA', name: 'Bari', regionCode: 'PUG' }, { code: 'BG', name: 'Bergamo', regionCode: 'LOM' },
    { code: 'FI', name: 'Firenze', regionCode: 'TOS' }, { code: 'MI', name: 'Milano', regionCode: 'LOM' },
    { code: 'PA', name: 'Palermo', regionCode: 'SIC' }, { code: 'RM', name: 'Roma', regionCode: 'LAZ' },
    { code: 'VR', name: 'Verona', regionCode: 'VEN' }, { code: 'CT', name: 'Catania', regionCode: 'SIC' }
    // Nota: Dataset completo verrebbe caricato da JSON esterno, qui forniamo lo schema e i principali
];

export const CITIES: GeoCity[] = [
    { name: 'Palermo', provinceCode: 'PA' }, { name: 'Bagheria', provinceCode: 'PA' },
    { name: 'Catania', provinceCode: 'CT' }, { name: 'Misterbianco', provinceCode: 'CT' },
    { name: 'Firenze', provinceCode: 'FI' }, { name: 'Scandicci', provinceCode: 'FI' },
    { name: 'Bari', provinceCode: 'BA' }, { name: 'Altamura', provinceCode: 'BA' },
    { name: 'Milano', provinceCode: 'MI' }, { name: 'Sesto San Giovanni', provinceCode: 'MI' },
    { name: 'Verona', provinceCode: 'VR' }, { name: 'Villafranca di Verona', provinceCode: 'VR' }
];
