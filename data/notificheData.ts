
// Added React import to fix namespace error
import React from 'react';
import { User, CompanyProfile, Role, AssetType } from '../types';
import { CloudRain, Droplets, FileText, ShieldCheck, Stethoscope, BrainCircuit } from 'lucide-react';

export interface Notification {
  id: string;
  type: 'meteo' | 'operativa' | 'normativa' | 'ai';
  severity: 'info' | 'attenzione' | 'critico';
  title: string;
  message: string;
  actionText: string;
  actionLink: string;
  timestamp: string;
  status: 'nuova' | 'letta' | 'risolta';
  relatedEntity?: string;
  icon: React.ElementType;
}

const allNotifications: Omit<Notification, 'id' | 'timestamp' | 'status'>[] = [
    {
        type: 'meteo',
        severity: 'critico',
        title: 'Rischio Peronospora Elevato',
        message: 'Le condizioni di pioggia e umidità previste nelle prossime 48h sono ideali per lo sviluppo della Peronospora sulla vite. Ispezionare le foglie e considerare un trattamento preventivo.',
        actionText: 'Vai a Trattamenti',
        actionLink: '/produzione',
        relatedEntity: 'Arboreto',
        icon: CloudRain,
    },
    {
        type: 'meteo',
        severity: 'attenzione',
        title: 'Stress Idrico Previsto',
        message: 'Le alte temperature di domani pomeriggio potrebbero causare stress idrico al pomodoro. Assicurarsi che l\'impianto di irrigazione sia pronto.',
        actionText: 'Controlla Irrigazione',
        actionLink: '/produzione',
        relatedEntity: 'Campi Aperti / Serre',
        icon: Droplets,
    },
    {
        type: 'normativa',
        severity: 'attenzione',
        title: 'Patentino Fitosanitario in Scadenza',
        message: 'Il tuo patentino scade tra 15 giorni. È obbligatorio per l\'acquisto e l\'uso di fitofarmaci.',
        actionText: 'Vedi Dettagli e Rinnova',
        actionLink: '/scadenze/patentino',
        icon: FileText,
    },
     {
        type: 'normativa',
        severity: 'info',
        title: 'Assicurazione Trattore',
        message: 'La polizza assicurativa per il tuo trattore scade tra 30 giorni. Inizia a confrontare le nuove offerte.',
        actionText: 'Confronta Assicurazioni',
        actionLink: '/scadenze/assicurazione-trattore',
        icon: ShieldCheck,
    },
    {
        type: 'operativa',
        severity: 'critico',
        title: 'Vaccino Mancante - Bovino #23',
        message: 'Il richiamo vaccinale per il capo #23 è scaduto da 3 giorni. Procedere immediatamente per non compromettere la salute del gruppo.',
        actionText: 'Vai a Scheda Sanitaria',
        actionLink: '/allevamento',
        relatedEntity: 'Allevamento',
        icon: Stethoscope,
    },
     {
        type: 'ai',
        severity: 'info',
        title: 'Previsione AI: Rischio Muffa Grigia',
        message: 'Analizzando i dati storici della tua zona, a Settembre si verifica spesso un picco di muffa grigia sul pomodoro. Le condizioni meteo attuali sono simili a quelle degli anni passati.',
        actionText: 'Leggi l\'analisi AI',
        actionLink: '/ai-decisioni',
        relatedEntity: 'Campi Aperti / Serre',
        icon: BrainCircuit,
    }
];

export const getNotifications = (user: User, profile: CompanyProfile): Notification[] => {
    let filteredNotifications: Omit<Notification, 'id' | 'timestamp' | 'status'>[] = [];

    const hasAsset = (assetType: AssetType) => profile.assets.includes(assetType);
    
    // Everyone sees bureaucratic notifications
    filteredNotifications.push(...allNotifications.filter(n => n.type === 'normativa'));

    // Fix: Updated Role checks to map to existing Role enum members
    if ([Role.AGRICOLTORE, Role.AZIENDA_MISTA, Role.AGRONOMO, Role.ADMIN].includes(user.role)) {
        if (hasAsset(AssetType.ARBORETO)) {
            filteredNotifications.push(allNotifications.find(n => n.title.includes('Peronospora'))!);
        }
        if (hasAsset(AssetType.CAMPI_APERTI) || hasAsset(AssetType.SERRE)) {
             filteredNotifications.push(allNotifications.find(n => n.title.includes('Stress Idrico'))!);
             filteredNotifications.push(allNotifications.find(n => n.title.includes('Muffa Grigia'))!);
        }
    }
    
    // Fix: Updated Role checks to map to existing Role enum members
    if ([Role.ALLEVATORE, Role.AZIENDA_MISTA, Role.VETERINARIO, Role.ADMIN].includes(user.role)) {
         if (hasAsset(AssetType.ALLEVAMENTO)) {
             filteredNotifications.push(allNotifications.find(n => n.title.includes('Vaccino Mancante'))!);
         }
    }

    if (user.role === Role.COMMERCIALISTA) {
         filteredNotifications = allNotifications.filter(n => n.type === 'normativa');
    }
    
    // Fix: Updated Role check for partner
    if(user.role === Role.FORNITORE) {
        return []; // Partners don't get operational notifications for now
    }


    // Add unique IDs and timestamps
    return filteredNotifications
        .filter(Boolean) // Remove any undefined entries
        .map((n, index) => ({
            ...n,
            id: `notif-${index}-${new Date().getTime()}`,
            timestamp: new Date(Date.now() - index * 1000 * 60 * 60).toISOString(),
            status: index < 3 ? 'nuova' : 'letta', // Mock some as new, some as read
        }));
};
