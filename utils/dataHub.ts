
import { DataSource, IntegrationConfig } from '../types';

export const getDataHubSource = (): DataSource => {
    const integrations = JSON.parse(localStorage.getItem('teraia_integrations_v1') || '[]') as IntegrationConfig[];
    const activeModes = JSON.parse(localStorage.getItem('teraia_company_modes_v1') || '[]');
    
    if (integrations.some(i => i.status === 'connected')) return 'external_system';
    if (activeModes.includes('high-tech')) return 'sensors';
    return 'manual';
};

export const getHubData = () => {
    const source = getDataHubSource();
    
    // Mock data basato su fonte
    const baseData = {
        temp: 24.5,
        humidity: 62,
        wind: 12,
        rain: 0,
        co2: 410,
        sourceLabel: source === 'external_system' ? 'Sistema Esterno (Connesso)' : 
                     source === 'sensors' ? 'Rete Sensori IoT' : 'Stima Manuale/Meteo Web'
    };

    if (source === 'external_system') {
        return { ...baseData, temp: 24.8, humidity: 61, co2: 415 };
    }
    
    return baseData;
};

export const logIntegrationEvent = (source: string, status: 'success' | 'warning' | 'error', message: string, details?: string) => {
    const logs = JSON.parse(localStorage.getItem('teraia_integration_logs_v1') || '[]');
    const newLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        source,
        status,
        message,
        details
    };
    localStorage.setItem('teraia_integration_logs_v1', JSON.stringify([newLog, ...logs].slice(0, 50)));
};
