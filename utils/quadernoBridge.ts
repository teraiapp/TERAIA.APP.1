
import { QuadernoEvent, EventType, EventSource } from '../data/quadernoV2Data';

const STORAGE_KEY = 'teraia_quaderno_v1';

export const getQuadernoEvents = (): QuadernoEvent[] => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
};

export const saveQuadernoEvents = (events: QuadernoEvent[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
};

export const addEventToQuaderno = (event: Omit<QuadernoEvent, 'id'>) => {
    const events = getQuadernoEvents();
    const newEvent: QuadernoEvent = {
        ...event,
        id: `evt-${Date.now()}`
    };
    saveQuadernoEvents([newEvent, ...events]);
    return newEvent;
};

export const deleteEventFromQuaderno = (id: string) => {
    const events = getQuadernoEvents();
    saveQuadernoEvents(events.filter(e => e.id !== id));
};
