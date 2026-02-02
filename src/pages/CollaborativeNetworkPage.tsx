import { useState, useEffect } from 'react';
import { useAuth } from '../store/useAuth';
import { api } from '../api/client';
import { Users, MessageSquare, UserCheck, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { Link } from 'react-router-dom';
import { ANGOLA_PROVINCES } from '../utils/provinces';

type NetworkUser = {
  id: string;
  fullName: string;
  role: string;
  province?: string | null;
  municipality?: string | null;
  verifiedAt?: string | null;
  createdAt: string;
};

type NetworkStats = {
  totalUsers: number;
  byRole: Record<string, number>;
  activeToday: number;
  verifiedUsers: number;
  authorities: number;
};

type PaginationInfo = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export function CollaborativeNetworkPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<NetworkUser[]>([]);
  const [stats, setStats] = useState<NetworkStats>({
    totalUsers: 0,
    byRole: {},
    activeToday: 0,
    verifiedUsers: 0,
    authorities: 0,
  });
  const [filter, setFilter] = useState({
    role: '',
    province: '',
  });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const itemsPerPage = 10; // 10 membros por página

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    setCurrentPage(1); // Resetar para primeira página quando filtros mudarem
    loadUsers();
  }, [filter]);

  useEffect(() => {
    loadUsers();
  }, [currentPage]);

  const loadStats = async () => {
    try {
      const { data } = await api.get('/users/network/stats');
      setStats({
        totalUsers: data.totalUsers || 0,
        byRole: data.byRole || {},
        activeToday: data.activeToday || 0,
        verifiedUsers: data.verifiedUsers || 0,
        authorities: data.authorities || 0,
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter.role) params.append('role', filter.role);
      if (filter.province) params.append('province', filter.province);
      params.append('page', String(currentPage));
      params.append('limit', String(itemsPerPage));

      const { data } = await api.get(`/users/network?${params.toString()}`);
      setUsers(data.users || []);
      setPagination(data.pagination || null);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (role: string): string => {
    const labels: Record<string, string> = {
      CIDADAO: 'Cidadão',
      FAMILIAR: 'Familiar',
      VOLUNTARIO: 'Voluntário',
      MODERADOR: 'Moderador',
      AUTORIDADE: 'Autoridade',
      ADMIN: 'Administrador',
    };
    return labels[role] || role;
  };

  const getRoleColor = (role: string): string => {
    const colors: Record<string, string> = {
      CIDADAO: 'bg-blue-100 text-blue-700',
      FAMILIAR: 'bg-purple-100 text-purple-700',
      VOLUNTARIO: 'bg-green-100 text-green-700',
      MODERADOR: 'bg-amber-100 text-amber-700',
      AUTORIDADE: 'bg-red-100 text-red-700',
      ADMIN: 'bg-slate-100 text-slate-700',
    };
    return colors[role] || 'bg-slate-100 text-slate-700';
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && pagination && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <ProtectedRoute allowedRoles={['CIDADAO', 'FAMILIAR', 'VOLUNTARIO', 'MODERADOR', 'AUTORIDADE', 'ADMIN']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Rede Colaborativa</h1>
          <p className="mt-1 text-slate-600">
            Familiares, cidadãos e autoridades conectados em um único canal
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-3 mb-2">
              <Users className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-slate-900">Total de Usuários</h3>
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.totalUsers.toLocaleString()}</p>
            <p className="text-sm text-slate-600">Membros da rede</p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-3 mb-2">
              <UserCheck className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-slate-900">Verificados</h3>
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.verifiedUsers}</p>
            <p className="text-sm text-slate-600">Usuários verificados</p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-3 mb-2">
              <MessageSquare className="h-5 w-5 text-amber-600" />
              <h3 className="font-semibold text-slate-900">Ativos Hoje</h3>
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.activeToday}</p>
            <p className="text-sm text-slate-600">Usuários ativos</p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="h-5 w-5 text-red-600" />
              <h3 className="font-semibold text-slate-900">Autoridades</h3>
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.authorities}</p>
            <p className="text-sm text-slate-600">Autoridades e admins</p>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <select
              value={filter.role}
              onChange={(e) => setFilter({ ...filter, role: e.target.value })}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Todos os Perfis</option>
              <option value="CIDADAO">Cidadão</option>
              <option value="FAMILIAR">Familiar</option>
              <option value="VOLUNTARIO">Voluntário</option>
              <option value="MODERADOR">Moderador</option>
              <option value="AUTORIDADE">Autoridade</option>
              <option value="ADMIN">Administrador</option>
            </select>
            <select
              value={filter.province}
              onChange={(e) => setFilter({ ...filter, province: e.target.value })}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Todas as Províncias</option>
              {ANGOLA_PROVINCES.map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Users List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <>
            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Membros da Rede</h2>
              <div className="space-y-3">
                {users.map((networkUser) => (
                  <div
                    key={networkUser.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{networkUser.fullName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${getRoleColor(networkUser.role)}`}>
                            {getRoleLabel(networkUser.role)}
                          </span>
                          {networkUser.province && (
                            <span className="text-xs text-slate-500">{networkUser.province}</span>
                          )}
                          {networkUser.verifiedAt && (
                            <span className="text-xs text-green-600">✓ Verificado</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Link
                      to={`/usuarios/${networkUser.id}/casos`}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Ver Casos
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Paginação */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                    pagination.hasPrevPage
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => {
                    if (
                      pageNum === 1 ||
                      pageNum === pagination.totalPages ||
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                            pageNum === currentPage
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                      return <span key={pageNum} className="px-2 text-slate-500">...</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                    pagination.hasNextPage
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Próxima
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {pagination && (
              <div className="text-center text-sm text-slate-500 mt-4">
                Mostrando {users.length} de {pagination.total} membros (Página {pagination.page} de {pagination.totalPages})
              </div>
            )}
          </>
        )}

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900">Sobre a Rede Colaborativa</p>
              <p className="text-sm text-blue-700 mt-1">
                A rede conecta familiares, cidadãos, voluntários e autoridades em uma plataforma única,
                facilitando a comunicação e colaboração na busca por pessoas desaparecidas. Use o chat
                para se comunicar diretamente com outros membros da rede sobre casos específicos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

