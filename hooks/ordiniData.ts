
// REFACTORED: Updated status and category types for the new interactive order management system.
export type OrderStatus = 'In attesa' | 'Accettato' | 'Spedito' | 'Completato' | 'Annullato';
export type OrderCategory = 'Vivai' | 'Concimi' | 'Sensori' | 'Altro';

export interface OrderItem {
    name: string;
    quantity: number | string;
}

export interface Order {
    id: number;
    providerId: number;
    category: OrderCategory;
    status: OrderStatus;
    date: string;
    amount: number; // Estimated amount
    items: OrderItem[];
    notes?: string;
}

export interface Supplier {
    id: number;
    name: string;
    contact: {
        phone: string;
        email: string;
        whatsapp: string; // Phone number for wa.me link
    };
    products: string[];
}

export const suppliers: Supplier[] = [
    { id: 1, name: 'Vivaio "Il Germoglio"', contact: { phone: '+390451234567', email: 'info@ilgermoglio.it', whatsapp: '393331234567' }, products: ['Piantine di pomodoro', 'Insalata', 'Zucchine'] },
    { id: 2, name: 'Agraria Rossi', contact: { phone: '+390807654321', email: 'ordini@agrariarossi.com', whatsapp: '393337654321' }, products: ['Sementi di grano', 'Concime NPK', 'Fitosanitari'] },
    { id: 3, name: 'AgriTech Solutions', contact: { phone: '+390919876543', email: 'support@agritech.it', whatsapp: '393339876543' }, products: ['Sensore Umidità Terreno', 'Gateway LoraWAN'] },
];

// REFACTORED: Updated initial orders to serve as a default for localStorage.
export const initialOrders: Order[] = [
    {
        id: 1,
        providerId: 1,
        category: 'Vivai',
        status: 'Completato',
        date: '2024-05-10',
        amount: 350.00,
        items: [{ name: 'Piantine di Pomodoro San Marzano', quantity: 1000 }],
        notes: 'Consegna urgente richiesta per trapianto.'
    },
    {
        id: 2,
        providerId: 2,
        category: 'Concimi',
        status: 'Spedito',
        date: '2024-06-18',
        amount: 1200.00,
        items: [{ name: 'Concime NPK 20-10-10', quantity: '500 kg' }],
    },
    {
        id: 3,
        providerId: 3,
        category: 'Sensori',
        status: 'Accettato',
        date: '2024-06-20',
        amount: 800.00,
        items: [{ name: 'Sensore Umidità Terreno', quantity: 5 }],
        notes: 'Verificare compatibilità con gateway esistente.'
    },
     {
        id: 4,
        providerId: 2,
        category: 'Altro',
        status: 'In attesa',
        date: '2024-06-21',
        amount: 150.00,
        items: [{ name: 'Tubi irrigazione a goccia', quantity: '100m' }],
    }
];
