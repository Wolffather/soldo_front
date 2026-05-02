import axios from 'axios';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { isTokenExpired, clearAllTokens } from '../utils/tokenUtils';

const client = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

const ADMIN_ROLES = new Set(['ADMIN']);

/**
 * Resolve the bearer token for admin API calls.
 * Priority:
 *   1. Explicit admin-panel token (stored by AuthContext.login / CabinetLogin password flow)
 *   2. Cabinet user_token if it has an ADMIN role
 */
function resolveAdminToken(): string | null {
  const adminToken = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
  if (adminToken) return adminToken; // already "Bearer xxx"

  const userToken = localStorage.getItem(STORAGE_KEYS.USER_TOKEN);
  const userRole = localStorage.getItem(STORAGE_KEYS.USER_ROLE);
  if (userToken && userRole && ADMIN_ROLES.has(userRole)) {
    return `Bearer ${userToken}`;
  }

  return null;
}

// Добавляем токен к каждому запросу; если токен истёк — редиректим сразу
client.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
  const userToken = localStorage.getItem(STORAGE_KEYS.USER_TOKEN);

  // Check admin token expiry
  if (adminToken && isTokenExpired(adminToken)) {
    clearAllTokens();
    window.location.href = '/login';
    return Promise.reject(new Error('Token expired'));
  }

  // Check user token expiry (for admins logged in via cabinet)
  if (!adminToken && userToken && isTokenExpired(userToken)) {
    clearAllTokens();
    window.location.href = '/login';
    return Promise.reject(new Error('Token expired'));
  }

  const token = resolveAdminToken();
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});

// Если 401 — разлогиниваем
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
