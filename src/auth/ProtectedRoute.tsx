import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { isTokenExpired } from '../utils/tokenUtils';

interface Props {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const { isAuthenticated, token } = useAuth();

  const adminTokenValid = isAuthenticated && !!token && !isTokenExpired(token);

  if (!adminTokenValid) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
