import Constants from 'expo-constants';

// Use the URL from app.json if available, otherwise fall back to hardcoded URL
// Remove the '/api' part as that is added in the axios config
export const API_URL = Constants.expoConfig?.extra?.API_URL || 'http://192.168.1.13:3304';
export const SOCKET_URL = Constants.expoConfig?.extra?.SOCKET_URL || 'http://192.168.1.13:3304';

// Log the API URL for debugging
console.log('API URL:', API_URL);