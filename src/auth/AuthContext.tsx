import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authApi } from '../api/authApi';
import type { LoginRequest } from '../types';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { isTokenExpired, getTokenExpMs, clearAllTokens } from '../utils/tokenUtils';

interface AuthState {
  token: string | null;
  role: string | null;
  userId: number | null;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const storedToken = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
  const validInitialToken = storedToken && !isTokenExpired(storedToken) ? storedToken : null;
  if (storedToken && !validInitialToken) {
    clearAllTokens();
  }

  const [token, setToken] = useState<string | null>(validInitialToken);
  const [role, setRole] = useState<string | null>(
    validInitialToken ? localStorage.getItem(STORAGE_KEYS.ADMIN_ROLE) : null
  );
  const [userId, setUserId] = useState<number | null>(() => {
    if (!validInitialToken) return null;
    const stored = localStorage.getItem(STORAGE_KEYS.ADMIN_USER_ID);
    return stored ? Number(stored) : null;
  });

  const isAuthenticated = !!token;

  // Schedule auto-logout exactly when admin token expires
  useEffect(() => {
    if (!token) return;
    const expMs = getTokenExpMs(token);
    if (expMs === null) return;
    const msUntilExpiry = expMs - Date.now();
    if (msUntilExpiry <= 0) {
      clearAllTokens();
      setToken(null);
      setRole(null);
      setUserId(null);
      window.location.href = '/login';
      return;
    }
    const timer = setTimeout(() => {
      clearAllTokens();
      setToken(null);
      setRole(null);
      setUserId(null);
      window.location.href = '/login';
    }, msUntilExpiry);
    return () => clearTimeout(timer);
  }, [token]);

  const login = async (data: LoginRequest) => {
    const response = await authApi.login(data);
    localStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN, response.token);
    localStorage.setItem(STORAGE_KEYS.ADMIN_ROLE, response.role);
    localStorage.setItem(STORAGE_KEYS.ADMIN_USER_ID, String(response.userId));
    setToken(response.token);
    setRole(response.role);
    setUserId(response.userId);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.ADMIN_ROLE);
    localStorage.removeItem(STORAGE_KEYS.ADMIN_USER_ID);
    localStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_ROLE);
    setToken(null);
    setRole(null);
    setUserId(null);
  };

  return (
    <AuthContext.Provider value={{ token, role, userId, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
