
import { REGULATORY_DOCS } from '../data/regulatoryDocuments';
import { FITOGEST_CATALOG, FitogestProduct } from '../data/fitogestCatalog';

export interface ComplianceResult {
    status: 'allowed' | 'none' | 'restricted';
    allowedProducts: FitogestProduct[];
    excludedProducts: { product: FitogestProduct; reason: string }[];
    regulatoryNote: string;
    sourceDoc: string;
}

export const checkCompliance = (
    region: string,
    crop: string,
    adversity: string,
    isBio: boolean
): ComplianceResult => {
    // 1. Trova il disciplinare
    const doc = REGULATORY_DOCS.find(d => d.region.toLowerCase() === region.toLowerCase());
    const section = doc?.sections.find(s => 
        s.crop.toLowerCase() === crop.toLowerCase() && 
        s.adversity.toLowerCase() === adversity.toLowerCase()
    );

    if (!section) {
        return {
            status: 'none',
            allowedProducts: [],
            excludedProducts: [],
            regulatoryNote: `Nessun disciplinare trovato per ${crop} / ${adversity} in ${region}.`,
            sourceDoc: 'N/D'
        };
    }

    const allowedProducts: FitogestProduct[] = [];
    const excludedProducts: { product: FitogestProduct; reason: string }[] = [];

    // 2. Filtra il catalogo Fitogest
    FITOGEST_CATALOG.forEach(product => {
        const matchesTarget = product.crops.includes(crop) && product.adversities.includes(adversity);
        
        if (matchesTarget) {
            // Verifica se il principio attivo è ammesso dal disciplinare
            const isIngredientAllowed = section.allowedActives.includes(product.activeIngredient);
            const isIngredientForbidden = section.forbiddenActives.includes(product.activeIngredient);
            
            if (isBio && !product.isBio) {
                excludedProducts.push({ product, reason: 'Non compatibile con regime Biologico.' });
            } else if (isIngredientForbidden) {
                excludedProducts.push({ product, reason: 'Principio attivo vietato da questo disciplinare.' });
            } else if (!isIngredientAllowed) {
                excludedProducts.push({ product, reason: 'Principio attivo non presente nella lista degli ammessi per questa avversità.' });
            } else {
                allowedProducts.push(product);
            }
        }
    });

    return {
        status: allowedProducts.length > 0 ? 'allowed' : 'restricted',
        allowedProducts,
        excludedProducts,
        regulatoryNote: section.constraints,
        sourceDoc: section.source
    };
};
