import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/useAuth';
import { useEffect, useState } from 'react';
import { User, LogOut, Menu } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';
import { NotificationsBell } from './NotificationsBell';

export function Header() {
  const { user, logout, fetchUser } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('bdpd_token');
    if (token && !user) {
      fetchUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowMenu(false);
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
    setShowMenu(false);
  };

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        {user && (
          <Link to="/" className="text-lg font-semibold text-blue-700 hover:text-blue-800">
            Base de Dados
          </Link>
        )}
        
        <nav className="hidden md:flex gap-4 text-sm font-medium text-slate-600">
          <Link to="/informacoes" className="hover:text-blue-600">
            Informações
          </Link>
          {user && (
            <>
              <Link to="/dashboard" className="hover:text-blue-600">
                Dashboard
              </Link>
              <Link to="/casos" className="hover:text-blue-600">
                Casos
              </Link>
            </>
          )}
        </nav>

        {user ? (
          <div className="flex items-center gap-2">
            <NotificationsBell />
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{user.fullName}</span>
                <Menu className="h-4 w-4 sm:hidden" />
              </button>
              
              {showMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 rounded-lg border border-slate-200 bg-white shadow-lg z-20">
                    <div className="p-3 border-b border-slate-200">
                      <p className="text-sm font-semibold text-slate-900">{user.fullName}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                      <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                        {user.role}
                      </span>
                    </div>
                    <div className="p-1">
                      <Link
                        to="/perfil"
                        onClick={() => setShowMenu(false)}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded"
                      >
                        <User className="h-4 w-4" />
                        Meu Perfil
                      </Link>
                      <button
                        onClick={handleLogoutClick}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
                      >
                        <LogOut className="h-4 w-4" />
                        Sair
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <Link 
            to="/entrar" 
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Entrar
          </Link>
        )}
      </div>

      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title="Confirmar Saída"
        message="Deseja sair do sistema?"
        confirmText="Sair"
        cancelText="Cancelar"
        variant="warning"
      />
    </header>
  );
}
