
export interface GeoItem {
    code?: string;
    name: string;
    regCode?: string;
    p?: string; // province code for communes
}

class GeoService {
    private regions: GeoItem[] = [];
    private provinces: GeoItem[] = [];
    private communes: GeoItem[] = [];
    private isLoaded = false;

    async loadAll() {
        if (this.isLoaded) return;
        try {
            const [r, p, c] = await Promise.all([
                fetch('/geo/italy-regions.json').then(res => res.json()),
                fetch('/geo/italy-provinces.json').then(res => res.json()),
                fetch('/geo/italy-comunes.json').then(res => res.json())
            ]);
            this.regions = r;
            this.provinces = p;
            this.communes = c;
            this.isLoaded = true;
            console.log(`[GeoService] Database Loaded: ${r.length} Reg, ${p.length} Prov, ${c.length} Com.`);
        } catch (e) {
            console.error("Failed to load geo data", e);
        }
    }

    getRegions() { return this.regions; }

    getProvinces(regionCode: string) {
        if (!regionCode) return [];
        return this.provinces.filter(p => p.regCode === regionCode);
    }

    getCommunes(provinceCode: string) {
        if (!provinceCode) return [];
        return this.communes.filter(c => c.p === provinceCode);
    }

    getStats() {
        return {
            r: this.regions.length,
            p: this.provinces.length,
            c: this.communes.length
        };
    }

    // Lookup methods
    getRegionByCode(code: string) { return this.regions.find(r => r.code === code); }
    getProvinceByCode(code: string) { return this.provinces.find(p => p.code === code); }
}

export const geoService = new GeoService();
