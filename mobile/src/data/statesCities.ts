// Comprehensive Indian Cities Data - 4000+ cities
// Data source: Indian Cities Database
// This file will be populated with complete city data

export const INDIAN_CITIES_URL = 'https://raw.githubusercontent.com/nshntarora/Indian-Cities-JSON/master/cities.json';

// Import and process cities data
import citiesData from './cities_complete.json';

interface City {
    id: string;
    name: string;
    state: string;
}

// Group cities by state
const groupCitiesByState = (cities: City[]) => {
    const grouped: { [key: string]: string[] } = {};

    cities.forEach(city => {
        if (!grouped[city.state]) {
            grouped[city.state] = [];
        }
        grouped[city.state].push(city.name);
    });

    // Sort cities alphabetically within each state
    Object.keys(grouped).forEach(state => {
        grouped[state].sort();
    });

    return grouped;
};

export const STATES_CITIES = groupCitiesByState(citiesData as City[]);

export const STATES = Object.keys(STATES_CITIES)
    .sort()
    .map(state => ({
        label: state,
        value: state,
    }));

export const getCitiesByState = (state: string) => {
    return (STATES_CITIES[state] || []).map(city => ({
        label: city,
        value: city,
    }));
};
