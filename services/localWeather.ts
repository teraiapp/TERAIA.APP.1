
import { GeoLocation } from '../types';

export interface WeatherForecast {
    day: string;
    temp: number;
    condition: 'Sunny' | 'Rainy' | 'Cloudy' | 'Windy' | 'Frost';
    humidity: number;
    risk: number;
}

export const getLocalWeather = (location: GeoLocation): WeatherForecast[] => {
    // Cache logic
    const cacheKey = `teraia_weather_cache_${location.communeCode}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
        const parsed = JSON.parse(cached);
        const age = Date.now() - parsed.timestamp;
        if (age < 3600000) return parsed.data; // 1h cache
    }

    // Simulazione variazione climatica Nord/Sud
    const isNorth = ["01", "02", "03", "04", "05", "06", "07", "08"].includes(location.regionCode);
    const baseTemp = isNorth ? 18 : 26;

    const days = ["Oggi", "Domani", "Mer", "Gio", "Ven", "Sab", "Dom"];
    const data: WeatherForecast[] = days.map((day, i) => ({
        day,
        temp: baseTemp + Math.floor(Math.random() * 5) - i,
        condition: i % 3 === 0 ? 'Cloudy' : i % 5 === 0 ? 'Rainy' : 'Sunny',
        humidity: 40 + Math.floor(Math.random() * 30),
        risk: Math.floor(Math.random() * 100)
    }));

    localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data }));
    return data;
};
