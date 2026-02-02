import { Navigate } from 'react-router-dom';
import { useAuth } from '../store/useAuth';
import { hasAnyRole, UserRole } from '../utils/roles';

type ProtectedRouteProps = {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
};

export function ProtectedRoute({ 
  children, 
  allowedRoles = [], 
  redirectTo = '/entrar' 
}: ProtectedRouteProps) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  if (allowedRoles.length > 0 && !hasAnyRole(user.role, allowedRoles)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}


