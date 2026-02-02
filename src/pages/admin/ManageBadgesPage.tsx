import { useState, useEffect } from 'react';
import { Award, CheckCircle, XCircle, RefreshCw, Search, User, TrendingUp } from 'lucide-react';
import { api } from '../../api/client';
import { InfoModal } from '../../components/InfoModal';
import { ConfirmModal } from '../../components/ConfirmModal';

type BadgeType = 'FIRST_CASE' | 'ACTIVE_CONTRIBUTOR' | 'HELPER' | 'VERIFIED' | 'TOP_REPORTER' | 'COMMUNITY_HERO';

type UserWithStats = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  createdAt: string;
  stats: {
    casesCount: number;
    sightingsCount: number;
    favoritesCount: number;
    badgesCount: number;
    badges: BadgeType[];
  };
};

const BADGE_INFO: Record<BadgeType, { name: string; description: string; criteria: string }> = {
  FIRST_CASE: {
    name: 'Primeiro Caso',
    description: 'Reportou seu primeiro caso de desaparecimento',
    criteria: '1 caso reportado',
  },
  ACTIVE_CONTRIBUTOR: {
    name: 'Contribuidor Ativo',
    description: 'Contribuidor ativo da comunidade',
    criteria: '5 casos ou 10 avistamentos',
  },
  HELPER: {
    name: 'Ajudante',
    description: 'Ajudou com avistamentos',
    criteria: '3 avistamentos',
  },
  VERIFIED: {
    name: 'Verificado',
    description: 'Usuário verificado',
    criteria: 'Outorgado manualmente pelo admin',
  },
  TOP_REPORTER: {
    name: 'Top Reporter',
    description: 'Top reporter de casos',
    criteria: '10 casos reportados',
  },
  COMMUNITY_HERO: {
    name: 'Herói da Comunidade',
    description: 'Herói da comunidade',
    criteria: '20 casos ou 30 avistamentos',
  },
};

export function ManageBadgesPage() {
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserWithStats | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<BadgeType | null>(null);
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCheckModal, setShowCheckModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [processing, setProcessing] = useState(false);
  const [checkingAll, setCheckingAll] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(
        (user) =>
          user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/badges/admin/users-stats');
      setUsers(data.users || []);
      setFilteredUsers(data.users || []);
    } catch (error: any) {
      console.error('Erro ao carregar usuários:', error);
      alert('Erro ao carregar usuários. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleAwardBadge = (user: UserWithStats, badgeType: BadgeType) => {
    setSelectedUser(user);
    setSelectedBadge(badgeType);
    setShowAwardModal(true);
  };

  const handleRemoveBadge = (user: UserWithStats, badgeType: BadgeType) => {
    setSelectedUser(user);
    setSelectedBadge(badgeType);
    setShowRemoveModal(true);
  };

  const confirmAwardBadge = async () => {
    if (!selectedUser || !selectedBadge) return;

    try {
      setProcessing(true);
      await api.post('/badges/admin/award', {
        userId: selectedUser.id,
        badgeType: selectedBadge,
      });
      setSuccessMessage(`Badge "${BADGE_INFO[selectedBadge].name}" outorgado com sucesso a ${selectedUser.fullName}!`);
      setShowSuccessModal(true);
      setShowAwardModal(false);
      await loadUsers();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao outorgar badge');
    } finally {
      setProcessing(false);
    }
  };

  const confirmRemoveBadge = async () => {
    if (!selectedUser || !selectedBadge) return;

    try {
      setProcessing(true);
      await api.delete(`/badges/admin/remove/${selectedUser.id}/${selectedBadge}`);
      setSuccessMessage(`Badge "${BADGE_INFO[selectedBadge].name}" removido com sucesso de ${selectedUser.fullName}!`);
      setShowSuccessModal(true);
      setShowRemoveModal(false);
      await loadUsers();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao remover badge');
    } finally {
      setProcessing(false);
    }
  };

  const handleCheckUserBadges = async (userId: string) => {
    try {
      setProcessing(true);
      const { data } = await api.post(`/badges/admin/check-and-award/${userId}`);
      setSuccessMessage(
        `Verificação concluída! ${data.count} badge(s) outorgado(s) automaticamente baseado nos critérios.`
      );
      setShowSuccessModal(true);
      setShowCheckModal(false);
      await loadUsers();
    } catch (error: any) {
      alert('Erro ao verificar badges. Tente novamente.');
    } finally {
      setProcessing(false);
    }
  };

  const handleCheckAllBadges = async () => {
    if (!confirm('Deseja verificar e outorgar badges para todos os usuários? Isso pode levar alguns minutos.')) {
      return;
    }

    try {
      setCheckingAll(true);
      const { data } = await api.post('/badges/admin/check-all');
      setSuccessMessage(
        `Verificação concluída! ${data.totalBadgesAwarded} badge(s) outorgado(s) para ${data.totalUsers} usuário(s).`
      );
      setShowSuccessModal(true);
      await loadUsers();
    } catch (error: any) {
      alert('Erro ao verificar badges. Tente novamente.');
    } finally {
      setCheckingAll(false);
    }
  };

  const hasBadge = (user: UserWithStats, badgeType: BadgeType) => {
    return user.stats.badges.includes(badgeType);
  };

  const canEarnBadge = (user: UserWithStats, badgeType: BadgeType) => {
    const stats = user.stats;
    switch (badgeType) {
      case 'FIRST_CASE':
        return stats.casesCount >= 1;
      case 'ACTIVE_CONTRIBUTOR':
        return stats.casesCount >= 5 || stats.sightingsCount >= 10;
      case 'HELPER':
        return stats.sightingsCount >= 3;
      case 'TOP_REPORTER':
        return stats.casesCount >= 10;
      case 'COMMUNITY_HERO':
        return stats.casesCount >= 20 || stats.sightingsCount >= 30;
      case 'VERIFIED':
        return true; // Pode ser outorgado manualmente
      default:
        return false;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Carregando usuários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Gerenciar Conquistas e Badges</h1>
        <p className="mt-2 text-slate-600">Outorgue badges aos usuários baseado em critérios ou manualmente</p>
      </div>

      {/* Ações Rápidas */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={handleCheckAllBadges}
          disabled={checkingAll}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          <RefreshCw className={`h-5 w-5 ${checkingAll ? 'animate-spin' : ''}`} />
          {checkingAll ? 'Verificando...' : 'Verificar Todos os Usuários'}
        </button>
      </div>

      {/* Busca */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Lista de Usuários */}
      <div className="space-y-4">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
            <p className="text-slate-600">Nenhum usuário encontrado</p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div key={user.id} className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="h-5 w-5 text-slate-600" />
                    <h3 className="text-lg font-semibold text-slate-900">{user.fullName}</h3>
                    <span className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-700">{user.role}</span>
                  </div>
                  <p className="text-sm text-slate-600">{user.email}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedUser(user);
                    setShowCheckModal(true);
                  }}
                  className="px-3 py-1 text-sm rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Verificar
                </button>
              </div>

              {/* Estatísticas */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{user.stats.casesCount}</p>
                  <p className="text-xs text-slate-600">Casos</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{user.stats.sightingsCount}</p>
                  <p className="text-xs text-slate-600">Avistamentos</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg">
                  <p className="text-2xl font-bold text-amber-600">{user.stats.favoritesCount}</p>
                  <p className="text-xs text-slate-600">Favoritos</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{user.stats.badgesCount}</p>
                  <p className="text-xs text-slate-600">Badges</p>
                </div>
              </div>

              {/* Badges */}
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-3">Badges Disponíveis</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(Object.keys(BADGE_INFO) as BadgeType[]).map((badgeType) => {
                    const hasIt = hasBadge(user, badgeType);
                    const canEarn = canEarnBadge(user, badgeType);
                    const info = BADGE_INFO[badgeType];

                    return (
                      <div
                        key={badgeType}
                        className={`p-3 rounded-lg border-2 ${
                          hasIt
                            ? 'bg-green-50 border-green-300'
                            : canEarn
                            ? 'bg-blue-50 border-blue-300'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Award className={`h-5 w-5 ${hasIt ? 'text-green-600' : 'text-slate-400'}`} />
                            <div>
                              <p className="font-semibold text-slate-900 text-sm">{info.name}</p>
                              <p className="text-xs text-slate-600">{info.description}</p>
                            </div>
                          </div>
                          {hasIt && <CheckCircle className="h-5 w-5 text-green-600" />}
                        </div>
                        <p className="text-xs text-slate-500 mb-2">Critério: {info.criteria}</p>
                        <div className="flex gap-2">
                          {hasIt ? (
                            <button
                              onClick={() => handleRemoveBadge(user, badgeType)}
                              className="flex-1 px-2 py-1 text-xs rounded bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center gap-1"
                            >
                              <XCircle className="h-3 w-3" />
                              Remover
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAwardBadge(user, badgeType)}
                              disabled={!canEarn && badgeType !== 'VERIFIED'}
                              className="flex-1 px-2 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                            >
                              <Award className="h-3 w-3" />
                              Outorgar
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Confirmação - Outorgar */}
      <ConfirmModal
        isOpen={showAwardModal}
        onClose={() => {
          setShowAwardModal(false);
          setSelectedUser(null);
          setSelectedBadge(null);
        }}
        onConfirm={confirmAwardBadge}
        title="Outorgar Badge"
        message={
          selectedUser && selectedBadge
            ? `Deseja outorgar o badge "${BADGE_INFO[selectedBadge].name}" a ${selectedUser.fullName}?`
            : ''
        }
        confirmText={processing ? 'Outorgando...' : 'Confirmar'}
        cancelText="Cancelar"
        variant="info"
      />

      {/* Modal de Confirmação - Remover */}
      <ConfirmModal
        isOpen={showRemoveModal}
        onClose={() => {
          setShowRemoveModal(false);
          setSelectedUser(null);
          setSelectedBadge(null);
        }}
        onConfirm={confirmRemoveBadge}
        title="Remover Badge"
        message={
          selectedUser && selectedBadge
            ? `Deseja remover o badge "${BADGE_INFO[selectedBadge].name}" de ${selectedUser.fullName}?`
            : ''
        }
        confirmText={processing ? 'Removendo...' : 'Confirmar'}
        cancelText="Cancelar"
        variant="warning"
      />

      {/* Modal de Confirmação - Verificar */}
      <ConfirmModal
        isOpen={showCheckModal}
        onClose={() => {
          setShowCheckModal(false);
          setSelectedUser(null);
        }}
        onConfirm={() => selectedUser && handleCheckUserBadges(selectedUser.id)}
        title="Verificar Badges"
        message={
          selectedUser
            ? `Deseja verificar e outorgar badges automaticamente para ${selectedUser.fullName} baseado nos critérios?`
            : ''
        }
        confirmText={processing ? 'Verificando...' : 'Confirmar'}
        cancelText="Cancelar"
        variant="info"
      />

      {/* Modal de Sucesso */}
      <InfoModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          setSuccessMessage('');
        }}
        title="Sucesso"
        message={successMessage}
        variant="success"
      />
    </div>
  );
}


