import Constants from 'expo-constants';

// Fallback to direct URLs if Constants.expoConfig?.extra is not available
export const API_URL = Constants.expoConfig?.extra?.API_URL || 'http://192.168.1.3:3304';
export const SOCKET_URL = Constants.expoConfig?.extra?.SOCKET_URL || 'http://192.168.1.3:3304';

// Log the API URL for debugging
console.log('API URL:', API_URL);