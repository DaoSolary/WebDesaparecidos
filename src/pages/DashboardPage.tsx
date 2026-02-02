import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/useAuth';
import { CitizenDashboard } from '../components/dashboards/CitizenDashboard';
import { ModeratorDashboard } from '../components/dashboards/ModeratorDashboard';
import { AuthorityDashboard } from '../components/dashboards/AuthorityDashboard';
import { AdminDashboard } from '../components/dashboards/AdminDashboard';
import { hasAnyRole } from '../utils/roles';

export function DashboardPage() {
  const { user, fetchUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('bdpd_token');
    if (token && !user) {
      fetchUser();
    } else if (!token) {
      navigate('/entrar');
    }
  }, [user, fetchUser, navigate]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Renderizar dashboard baseado no role
  if (hasAnyRole(user.role, ['ADMIN'])) {
    return <AdminDashboard />;
  }

  if (hasAnyRole(user.role, ['AUTORIDADE'])) {
    return <AuthorityDashboard />;
  }

  if (hasAnyRole(user.role, ['MODERADOR'])) {
    return <ModeratorDashboard />;
  }

  // CIDADAO, FAMILIAR, VOLUNTARIO
  return <CitizenDashboard />;
}


