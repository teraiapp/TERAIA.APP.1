
export type TipoInterventoSanitario = 'Visita' | 'Terapia' | 'Vaccinazione' | 'Emergenza' | 'Controllo Periodico' | 'Altro';
export type EsitoIntervento = 'In corso' | 'Risolto' | 'In osservazione' | 'Deceduto';

export interface InterventoSanitario {
    id: string;
    allevamentoId: string;
    animaleId: string; // ID dell'animale o del gruppo
    data: string;
    tipo: TipoInterventoSanitario;
    descrizione: string;
    farmaco?: string;
    dose?: string;
    esito: EsitoIntervento;
    note?: string;
    inseritoDa: string; // Nome del veterinario
    timestamp: string;
    // Integrazioni
    pianoVaccinaleId?: string;
    prossimaScadenzaData?: string;
    scadenzaGenerataId?: string;
}

export interface VaccinazioneProgrammata {
    id: string;
    nomeVaccino: string;
    periodicita: string; // Es. "Ogni 6 mesi"
    dataProssimaDose: string;
    note?: string;
    stato: 'Da fare' | 'Completata' | 'Ritardo';
}

export interface PianoVaccinale {
    id: string;
    allevamentoId: string;
    titolo: string;
    specie: string;
    vaccinazioni: VaccinazioneProgrammata[];
}

// Mock Assegnazioni: Veterinario ID '3' (Luca Bianchi) -> Allevamento 'allev-1'
export const MOCK_VET_ASSIGNMENTS: { [vetId: string]: string[] } = {
    '3': ['allev-1']
};

export const initialInterventi: InterventoSanitario[] = [
    {
        id: 'int-1',
        allevamentoId: 'allev-1',
        animaleId: 'anim-1',
        data: '2024-06-20',
        tipo: 'Visita',
        descrizione: 'Controllo generale post-parto. L\'animale appare in buona salute.',
        esito: 'Risolto',
        inseritoDa: 'Luca Bianchi',
        timestamp: new Date().toISOString()
    }
];

export const initialPianiVaccinali: PianoVaccinale[] = [
    {
        id: 'pv-1',
        allevamentoId: 'allev-1',
        titolo: 'Piano Standard Rimonta Bovini',
        specie: 'Bovini',
        vaccinazioni: [
            { id: 'vp-1', nomeVaccino: 'IBR (Infettiv. Bovine Rhinotr.)', periodicita: 'Annuale', dataProssimaDose: '2024-12-15', stato: 'Da fare' },
            { id: 'vp-2', nomeVaccino: 'BVD (Diarrhea Virale Bovine)', periodicita: 'Annuale', dataProssimaDose: '2024-07-10', stato: 'Da fare' }
        ]
    }
];
