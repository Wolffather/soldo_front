import axios from 'axios';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { isTokenExpired, clearAllTokens } from '../utils/tokenUtils';

const client = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);

  if (adminToken && isTokenExpired(adminToken)) {
    clearAllTokens();
    window.location.href = '/login';
    return Promise.reject(new Error('Token expired'));
  }

  if (adminToken) {
    config.headers.Authorization = adminToken;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAllTokens();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default client;
