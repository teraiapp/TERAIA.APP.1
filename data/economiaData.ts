
export interface Transaction {
    id: number;
    unitId: string | number; // Collegamento obbligatorio all'unità
    date: string;
    description: string;
    amount: number;
    type: 'cost' | 'revenue';
    category: string;
    linkedTo: string; // Etichetta descrittiva (es. Nome Unità)
    // Campi aggiuntivi per vendite dettagliate
    quantity?: number;
    unitPrice?: number;
}

export const initialTransactions: Transaction[] = [];
