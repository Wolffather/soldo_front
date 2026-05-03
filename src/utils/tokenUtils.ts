import { STORAGE_KEYS } from '../constants/storageKeys';

/** Decodes JWT payload and returns `exp` in milliseconds, or null if malformed */
export function getTokenExpMs(token: string): number | null {
  try {
    const raw = token.startsWith('Bearer ') ? token.slice(7) : token;
    const payload = raw.split('.')[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    if (typeof decoded.exp === 'number') {
      return decoded.exp * 1000;
    }
    return null;
  } catch {
    return null;
  }
}

/** Returns true if the token is expired or cannot be parsed */
export function isTokenExpired(token: string): boolean {
  const expMs = getTokenExpMs(token);
  if (expMs === null) return true;
  return Date.now() >= expMs;
}

/** Clears all auth-related keys from localStorage */
export function clearAllTokens(): void {
  localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.ADMIN_ROLE);
  localStorage.removeItem(STORAGE_KEYS.ADMIN_USER_ID);
}
