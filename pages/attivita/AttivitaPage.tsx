
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ListFilter, X } from 'lucide-react';

type Status = 'Da fare' | 'In corso' | 'Fatto';
interface Activity {
    id: number;
    title: string;
    status: Status;
    dueDate: string;
    details: string;
    moduleRoute: string; // Changed from moduleLink to moduleRoute
}

const activitiesData: Activity[] = [
    { id: 1, title: 'Irrigare Campo 1', status: 'Da fare', dueDate: 'Oggi', details: 'Eseguire irrigazione a goccia per 30 minuti.', moduleRoute: '/irrigazione' },
    { id: 2, title: 'Controllo afidi Serra 2', status: 'Da fare', dueDate: 'Oggi', details: 'Verificare presenza di afidi sulle piante di pomodoro.', moduleRoute: '/produzione' },
    { id: 3, title: 'Trattamento preventivo Uliveto', status: 'In corso', dueDate: 'Domani', details: 'Applicare prodotto a base di rame.', moduleRoute: '/produzione' },
    { id: 4, title: 'Ordinare mangime', status: 'Fatto', dueDate: 'Ieri', details: 'Ordine di 50 sacchi di mangime completato.', moduleRoute: '/allevamento' },
    { id: 5, title: 'Controllo sensori avanzato', status: 'Da fare', dueDate: 'Oggi', details: 'Verificare i dati dai sensori PLC/SCADA.', moduleRoute: '' }, // Example with unavailable module
];

const AttivitaPage: React.FC = () => {
    const [filter, setFilter] = useState('Oggi');
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
    const navigate = useNavigate();

    const filteredActivities = activitiesData.filter(a => {
        if (filter === 'Tutte') return true;
        if (filter === 'Settimana') return true; // Mock: show all for week
        return a.dueDate === 'Oggi';
    });

    const handleNavigation = (route: string) => {
        if (route) {
            setSelectedActivity(null); // Close modal first
            navigate(route);
        } else {
            alert('Modulo non disponibile');
        }
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-text-primary">Gestione Attività</h1>

            <div className="bg-surface rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Lista Attività</h2>
                    <div className="flex items-center gap-2">
                        <ListFilter size={20} className="text-text-secondary"/>
                        {['Oggi', 'Settimana', 'Tutte'].map(f => (
                            <button 
                                key={f} 
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1 text-sm font-semibold rounded-full ${filter === f ? 'bg-primary text-white' : 'bg-gray-200 text-text-primary'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-3">
                    {filteredActivities.map(activity => (
                        <div key={activity.id} onClick={() => setSelectedActivity(activity)} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                            <div>
                                <p className="font-bold">{activity.title}</p>
                                <p className="text-sm text-text-secondary">Scadenza: {activity.dueDate}</p>
                            </div>
                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                                activity.status === 'Fatto' ? 'bg-green-100 text-green-800' :
                                activity.status === 'In corso' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                            }`}>{activity.status}</span>
                        </div>
                    ))}
                </div>
            </div>

            {selectedActivity && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedActivity(null)}>
                    <div className="bg-surface rounded-xl shadow-2xl p-8 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-2xl font-bold">{selectedActivity.title}</h3>
                            <button onClick={() => setSelectedActivity(null)} className="p-1 rounded-full hover:bg-gray-200">
                                <X size={24}/>
                            </button>
                        </div>
                        <p className="mb-2"><strong>Stato:</strong> {selectedActivity.status}</p>
                        <p className="mb-4"><strong>Scadenza:</strong> {selectedActivity.dueDate}</p>
                        <p className="mb-6 bg-gray-50 p-4 rounded-md">{selectedActivity.details}</p>
                        <button onClick={() => handleNavigation(selectedActivity.moduleRoute)} className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-primary-dark">
                            Vai al Modulo Correlato
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AttivitaPage;
