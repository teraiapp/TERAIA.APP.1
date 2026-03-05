
import { InboxDocument, InboxStatus, InboxDocType, LedgerEntry, LedgerScope, LedgerCategory, InboxSettings } from '../types';
import { inventoryService } from './inventoryService';
import { ledgerService } from './ledgerService';
import { notificationService } from './notificationService';

const INBOX_KEY = 'teraia_inbox_documents_v1';
const SETTINGS_KEY = 'teraia_inbox_settings_v1';

export const inboxService = {
    getSettings: (): InboxSettings => {
        try {
            const saved = localStorage.getItem(SETTINGS_KEY);
            return saved ? JSON.parse(saved) : {
                autoArchiveConfirmed: false,
                defaultCurrency: 'EUR',
                notificationsEnabled: true
            };
        } catch (e) {
            return { autoArchiveConfirmed: false, defaultCurrency: 'EUR', notificationsEnabled: true };
        }
    },

    saveSettings: (settings: InboxSettings) => {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    },

    getDocuments: (): InboxDocument[] => {
        try {
            const saved = localStorage.getItem(INBOX_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error("Error loading documents", e);
            return [];
        }
    },

    saveDocuments: (docs: InboxDocument[]) => {
        localStorage.setItem(INBOX_KEY, JSON.stringify(docs));
        window.dispatchEvent(new CustomEvent('teraia:inbox-changed'));
    },

    uploadDocument: (file: { name: string, mime: string, dataUrl: string }) => {
        const docs = inboxService.getDocuments();
        const newDoc: InboxDocument = {
            id: `doc-${Date.now()}`,
            fileName: file.name,
            fileMime: file.mime,
            fileDataUrl: file.dataUrl,
            docType: 'ALTRO',
            supplierName: '',
            docDateISO: new Date().toISOString().split('T')[0],
            totalAmount: 0,
            currency: 'EUR',
            notes: '',
            status: 'NEW',
            rows: [],
            createdAt: new Date().toISOString(),
            updateInventory: true
        };
        
        inboxService.saveDocuments([newDoc, ...docs]);
        
        notificationService.notify({
            type: 'DOC_ARRIVATO',
            title: 'Documento caricato',
            message: `Il file ${file.name} è pronto per essere elaborato in Inbox.`,
            severity: 'info',
            actionRoute: '/inbox',
            actionLabel: 'Vai a Inbox'
        });
        
        return newDoc;
    },

    updateDocument: (doc: InboxDocument) => {
        const docs = inboxService.getDocuments();
        const updated = docs.map(d => d.id === doc.id ? doc : d);
        inboxService.saveDocuments(updated);
    },

    confirmAndRegister: (doc: InboxDocument) => {
        // 1. Create Ledger Entry
        const scope: LedgerScope = 'GENERALE'; // Default
        const category: LedgerCategory = doc.docType === 'BOLLETTA' ? 'ALTRO' : 'ALTRO'; // Simplified mapping
        
        // Deduplication is handled by ledgerService using sourceRef
        const ledgerRes = ledgerService.addEntry({
            date: doc.docDateISO,
            scope: scope,
            type: 'COSTO',
            category: category,
            description: `${doc.docType}: ${doc.supplierName || doc.fileName}`,
            amount: doc.totalAmount,
            source: 'FATTURA',
            sourceRef: { module: 'INBOX', entityId: doc.id }
        });

        // 2. Update Inventory if requested
        if (doc.updateInventory && doc.rows.length > 0 && ['FATTURA', 'SCONTRINO', 'DDT'].includes(doc.docType)) {
            doc.rows.forEach(row => {
                // Find or create item
                const items = inventoryService.getItems();
                let item = items.find(i => i.name.toLowerCase() === row.description.toLowerCase());
                
                if (!item) {
                    const res = inventoryService.saveItem({
                        name: row.description,
                        category: row.category || 'ALTRO',
                        unit: row.unit || 'pz',
                        tags: ['agricoltura']
                    });
                    if (res.success && res.item) item = res.item;
                }

                if (item) {
                    inventoryService.registerMovement({
                        itemId: item.id,
                        type: 'IN',
                        qty: row.qty,
                        unitCost: row.unitPrice,
                        source: 'invoice',
                        note: `Carico da doc: ${doc.id}`,
                        sourceRef: { module: 'INBOX', entityId: doc.id, key: row.id }
                    });
                }
            });
        }

        // 3. Update Document Status
        const updatedDoc: InboxDocument = { ...doc, status: 'CONFIRMED' };
        inboxService.updateDocument(updatedDoc);

        notificationService.notify({
            type: 'SYSTEM',
            title: 'Documento Registrato',
            message: `Documento ${doc.id} confermato e registrato in Bilancio/Magazzino.`,
            severity: 'info'
        });

        return { success: true };
    },

    deleteDocument: (id: string) => {
        const docs = inboxService.getDocuments().filter(d => d.id !== id);
        inboxService.saveDocuments(docs);
    },

    seed: () => {
        const docs = inboxService.getDocuments();
        if (docs.length === 0) {
            const demoDocs: InboxDocument[] = [
                {
                    id: 'doc-demo-1',
                    fileName: 'fattura_fitofarmaci.pdf',
                    fileMime: 'application/pdf',
                    fileDataUrl: '',
                    docType: 'FATTURA',
                    supplierName: 'AgroForniture Rossi',
                    docDateISO: '2024-05-10',
                    totalAmount: 450.00,
                    currency: 'EUR',
                    status: 'NEW',
                    rows: [
                        { id: 'r1', description: 'Fitosanitario X', category: 'fitofarmaci', qty: 10, unit: 'lt', unitPrice: 35, total: 350 },
                        { id: 'r2', description: 'Guanti Protettivi', category: 'ricambi', qty: 5, unit: 'pz', unitPrice: 20, total: 100 }
                    ],
                    createdAt: new Date().toISOString(),
                    updateInventory: true
                },
                {
                    id: 'doc-demo-2',
                    fileName: 'scontrino_mangimi.jpg',
                    fileMime: 'image/jpeg',
                    fileDataUrl: 'https://picsum.photos/seed/receipt/400/600',
                    docType: 'SCONTRINO',
                    supplierName: 'Consorzio Agrario',
                    docDateISO: '2024-05-12',
                    totalAmount: 120.50,
                    currency: 'EUR',
                    status: 'NEW',
                    rows: [
                        { id: 'r3', description: 'Mangime Ovaiole', category: 'mangimi', qty: 2, unit: 'q.li', unitPrice: 60.25, total: 120.50 }
                    ],
                    createdAt: new Date().toISOString(),
                    updateInventory: true
                },
                {
                    id: 'doc-demo-3',
                    fileName: 'bolletta_enel.pdf',
                    fileMime: 'application/pdf',
                    fileDataUrl: '',
                    docType: 'BOLLETTA',
                    supplierName: 'Enel Energia',
                    docDateISO: '2024-05-01',
                    totalAmount: 215.40,
                    currency: 'EUR',
                    status: 'NEW',
                    rows: [],
                    createdAt: new Date().toISOString(),
                    updateInventory: false
                }
            ];
            inboxService.saveDocuments(demoDocs);
        }
    }
};
