
import { KnowledgeBase } from '../types';

export const knowledgeBase: KnowledgeBase = {
    disciplinariRegionali: {
        'Toscana': {
            'Vite': {
                allowedActiveIngredients: ['Rame', 'Zolfo'],
                restrictions: ['Non superare i 4 kg/ha/anno di Rame metallo.'],
            },
            'Olivo': {
                allowedActiveIngredients: ['Rame', 'Caolino'],
                restrictions: [],
            }
        },
        'Puglia': {
            'Vite': {
                allowedActiveIngredients: ['Rame', 'Zolfo', 'Bacillus thuringiensis'],
                restrictions: [],
            },
            'Pomodoro': {
                allowedActiveIngredients: ['Rame', 'Azadiractina'],
                restrictions: ["Usare Azadiractina solo in post-fioritura."],
            }
        }
    },
    fitogestLogic: {
        'Peronospora della Vite': [
            { name: 'Rame', type: 'fungicida', bio: true },
            { name: 'Metalaxil', type: 'fungicida', bio: false },
        ],
        'Oidio del Pomodoro': [
            { name: 'Zolfo', type: 'fungicida', bio: true },
            { name: 'Penconazolo', type: 'fungicida', bio: false },
        ],
        'Ticchiolatura del Melo': [
            { name: 'Rame', type: 'fungicida', bio: true },
            { name: 'Polisolfuro di calcio', type: 'fungicida', bio: true },
        ]
    },
    territorialMemory: [
        {
            region: 'Puglia',
            province: 'BA',
            problem: 'Peronospora della Vite',
            crop: 'Vite',
            date: new Date(Date.now() - 86400000 * 5).toISOString(),
        },
        {
            region: 'Toscana',
            province: 'FI',
            problem: 'Oidio del Pomodoro',
            crop: 'Pomodoro',
            date: new Date(Date.now() - 86400000 * 3).toISOString(),
        }
    ]
};
