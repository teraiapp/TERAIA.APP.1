
import { Deadline } from '../types';

export const INITIAL_DEADLINES: Deadline[] = [
    {
        id: 'dead-1',
        type: 'patentino_fitosanitario',
        title: 'Patentino Fitosanitario',
        description: 'Abilitazione all\'acquisto e utilizzo di prodotti fitosanitari professionali.',
        dueDate: '2024-12-15',
        alertDaysBefore: 60,
        status: 'attiva',
        moduleLink: '/quaderno-campagna',
        history: [],
        notes: 'Rinnovo quinquennale'
    },
    {
        id: 'dead-2',
        type: 'assicurazione_mezzo',
        title: 'RC Trattore John Deere',
        description: 'Polizza assicurativa obbligatoria per circolazione stradale.',
        dueDate: '2024-07-30',
        alertDaysBefore: 30,
        status: 'attiva',
        moduleLink: '/noleggi',
        entityId: 'trattore-jd-01',
        history: [{ date: '2023-07-28', note: 'Rinnovo annuale con AgriAssicurazioni', operator: 'Mario Rossi' }],
    },
    {
        id: 'dead-3',
        type: 'revisione_mezzo',
        title: 'Revisione Atomizzatore',
        description: 'Controllo funzionale e taratura obbligatoria delle macchine irroratrici.',
        dueDate: '2024-05-10',
        alertDaysBefore: 15,
        status: 'scaduta',
        history: [],
    },
    {
        id: 'dead-4',
        type: 'vaccinazione_allevamento',
        title: 'Richiamo IBR Bovini',
        description: 'Piano vaccinale obbligatorio per eradicazione IBR.',
        dueDate: '2024-09-01',
        alertDaysBefore: 7,
        status: 'attiva',
        moduleLink: '/allevamento',
        history: [],
    }
];
