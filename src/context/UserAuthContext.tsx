import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { isTokenExpired, getTokenExpMs, clearAllTokens } from '../utils/tokenUtils';

interface UserAuthState {
  userToken: string | null;
  userId: number | null;
  userRole: string | null;
  isLoading: boolean;
  login: (token: string, role?: string) => void;
  logout: () => void;
}

const UserAuthContext = createContext<UserAuthState | null>(null);

/** JWT payload: sub = userId (string), role = "USER" | "ADMIN" */
function parseJwtPayload(token: string): { sub?: string; role?: string } {
  try {
    const payload = token.split('.')[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch {
    return {};
  }
}

export function UserAuthProvider({ children }: { children: ReactNode }) {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.USER_TOKEN);
    if (token && !isTokenExpired(token)) {
      const payload = parseJwtPayload(token);
      setUserToken(token);
      setUserId(payload.sub ? parseInt(payload.sub, 10) : null);
      setUserRole(localStorage.getItem(STORAGE_KEYS.USER_ROLE) ?? payload.role ?? null);
    } else if (token) {
      // Token exists but is expired — clean up silently
      clearAllTokens();
    }
    setIsLoading(false);
  }, []);

  // Schedule auto-logout exactly when token expires
  useEffect(() => {
    if (!userToken) return;
    const expMs = getTokenExpMs(userToken);
    if (expMs === null) return;
    const msUntilExpiry = expMs - Date.now();
    if (msUntilExpiry <= 0) {
      clearAllTokens();
      setUserToken(null);
      setUserId(null);
      setUserRole(null);
      window.location.href = '/cabinet/login';
      return;
    }
    const timer = setTimeout(() => {
      clearAllTokens();
      setUserToken(null);
      setUserId(null);
      setUserRole(null);
      window.location.href = '/cabinet/login';
    }, msUntilExpiry);
    return () => clearTimeout(timer);
  }, [userToken]);

  const login = (token: string, role?: string) => {
    const payload = parseJwtPayload(token);
    const resolvedRole = role ?? payload.role ?? null;
    const resolvedId = payload.sub ? parseInt(payload.sub, 10) : null;

    localStorage.setItem(STORAGE_KEYS.USER_TOKEN, token);
    if (resolvedRole) localStorage.setItem(STORAGE_KEYS.USER_ROLE, resolvedRole);

    setUserToken(token);
    setUserId(resolvedId);
    setUserRole(resolvedRole);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_ROLE);
    setUserToken(null);
    setUserId(null);
    setUserRole(null);
  };

  return (
    <UserAuthContext.Provider value={{ userToken, userId, userRole, isLoading, login, logout }}>
      {children}
    </UserAuthContext.Provider>
  );
}

export function useUserAuth() {
  const ctx = useContext(UserAuthContext);
  if (!ctx) throw new Error('useUserAuth must be used inside UserAuthProvider');
  return ctx;
}
