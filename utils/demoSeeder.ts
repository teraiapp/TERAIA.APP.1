
import { AssetType, Role, Plan } from '../types';

export const seedDemoData = () => {
    console.log("TeraIA Demo Seeder Started...");

    // 1. Unità Produttive
    const units = [
        { id: 'u-demo-1', name: 'Serra Idroponica A', category: 'Serra', crop_key: 'pomodoro', stage_key: 'fioritura', area: 0.5, areaUnit: 'ha', region: 'Puglia', province: 'BA', comune: 'Bari', plantDate: '2024-03-01', cycle: 'Annuale' },
        { id: 'u-demo-2', name: 'Campo Grande Nord', category: 'Campo aperto', crop_key: 'vite', stage_key: 'accrescimento', area: 12, areaUnit: 'ha', region: 'Puglia', province: 'BA', comune: 'Altamura', plantDate: '2020-01-01', cycle: 'Pluriennale' },
        { id: 'u-demo-3', name: 'Allevamento Stalla 1', category: 'Allevamento', type: 'Allevamento', species: 'Bovini', area: 2000, areaUnit: 'm²', region: 'Puglia', province: 'BA', comune: 'Altamura' }
    ];
    localStorage.setItem('teraia_production_units_v1', JSON.stringify(units));

    // 2. Quaderno
    const entries = [
        { id: 'q-demo-1', date: '2024-05-10', type: 'trattamento', unitId: 'u-demo-1', unitName: 'Serra Idroponica A', crop: 'Pomodoro', description: 'Trattamento anti-afidi bio', products: [{ name: 'Olio di Neem', dose: '2', unit: 'L/ha' }], operator: 'Mario Rossi', source: 'manuale', status: 'confermato' },
        { id: 'q-demo-2', date: '2024-05-15', type: 'irrigazione', unitId: 'u-demo-2', unitName: 'Campo Grande Nord', crop: 'Vite', description: 'Irrigazione notturna soccorso', waterVolume: 50, operator: 'Sistema', source: 'Irrigazione', status: 'confermato' }
    ];
    localStorage.setItem('teraia_quaderno_v1', JSON.stringify(entries));

    // 3. Economia
    const movements = [
        { id: 'mv-demo-1', date: '2024-05-01', type: 'costo', category: 'Sementi', amount: 1200, description: 'Acquisto sementi stagione 2024', method: 'manuale' },
        { id: 'mv-demo-2', date: '2024-05-20', type: 'ricavo', category: 'Vendita', amount: 8500, description: 'Acconto vendita pomodoro', method: 'ocr' }
    ];
    localStorage.setItem('teraia_economy_movements_v2', JSON.stringify(movements));

    // 4. Scadenze
    const deadlines = [
        { id: 'd-demo-1', type: 'patentino_fitosanitario', title: 'Patentino Fitosanitario', description: 'Rinnovo quinquennale obbligatorio', dueDate: '2024-07-15', alertDaysBefore: 60, status: 'attiva', history: [] },
        { id: 'd-demo-2', type: 'assicurazione_mezzo', title: 'RC Trattore John Deere', description: 'Polizza annuale', dueDate: '2024-06-30', alertDaysBefore: 30, status: 'attiva', history: [] }
    ];
    localStorage.setItem('teraia_deadlines_v1', JSON.stringify(deadlines));

    // 5. Integrazioni
    const systems = [
        { id: 'i-demo-1', name: 'Stazione Meteo Campo', type: 'weather_station', status: 'connected', syncFrequency: '15m', mappedSensors: ['Temp', 'Rain'], lastSync: new Date().toISOString() },
        { id: 'i-demo-2', name: 'Sensore Suolo #4', type: 'iot_sensor', status: 'error', syncFrequency: '1h', mappedSensors: ['Humidity'] }
    ];
    localStorage.setItem('teraia_integrations_v1', JSON.stringify(systems));

    alert("Dati Demo caricati con successo!");
};

export const resetAllData = () => {
    const keys = [
        'teraia_production_units_v1', 'teraia_quaderno_v1', 
        'teraia_economy_movements_v2', 'teraia_deadlines_v1', 
        'teraia_integrations_v1', 'teraia_notifications_v1',
        'teraia_ai_risks_v1', 'teraia_vision_reports_v1'
    ];
    keys.forEach(k => localStorage.removeItem(k));
    alert("Dati resettati. L'app tornerà allo stato iniziale.");
    window.location.reload();
};
