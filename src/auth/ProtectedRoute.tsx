import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { isTokenExpired } from '../utils/tokenUtils';
import { STORAGE_KEYS } from '../constants/storageKeys';

interface Props {
  children: React.ReactNode;
}

const ADMIN_ROLES = new Set(['ADMIN']);

/**
 * Check whether the cabinet user_token belongs to an admin and is not expired.
 */
function hasValidAdminUserToken(): boolean {
  const userRole = localStorage.getItem(STORAGE_KEYS.USER_ROLE);
  const userToken = localStorage.getItem(STORAGE_KEYS.USER_TOKEN);
  return (
    !!userToken &&
    !!userRole &&
    ADMIN_ROLES.has(userRole) &&
    !isTokenExpired(userToken)
  );
}

export default function ProtectedRoute({ children }: Props) {
  const { isAuthenticated, token } = useAuth();

  // If admin token exists but is expired — treat as unauthenticated
  const adminTokenValid = isAuthenticated && !!token && !isTokenExpired(token);

  if (!adminTokenValid && !hasValidAdminUserToken()) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
