import { useState, useEffect } from 'react';
import { useAuth } from '../../store/useAuth';
import { api } from '../../api/client';
import { 
  Users, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Shield, 
  Mail, 
  Phone, 
  MapPin,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  Ban,
  Unlock
} from 'lucide-react';
import { ConfirmModal } from '../../components/ConfirmModal';
import { InfoModal } from '../../components/InfoModal';
import { ANGOLA_PROVINCES } from '../../utils/provinces';

type User = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  province?: string;
  municipality?: string;
  verifiedAt?: string;
  isBlocked?: boolean;
  blockedAt?: string;
  blockedReason?: string;
  createdAt: string;
  _count: {
    missingPeople: number;
  };
};

type PaginationInfo = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

const ROLES = ['CIDADAO', 'FAMILIAR', 'VOLUNTARIO', 'MODERADOR', 'AUTORIDADE', 'ADMIN'];

export function ManageUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    role: '',
    province: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showNoUsersModal, setShowNoUsersModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showUnblockModal, setShowUnblockModal] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'CIDADAO',
    phone: '',
    province: '',
    municipality: '',
  });

  useEffect(() => {
    loadUsers();
  }, [currentPage, filters, searchTerm]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', String(currentPage));
      params.append('limit', '10');
      if (filters.role) params.append('role', filters.role);
      if (filters.province) params.append('province', filters.province);
      if (searchTerm) params.append('search', searchTerm);

      const { data } = await api.get(`/admin/users?${params.toString()}`);
      const loadedUsers = data.users || [];
      setUsers(loadedUsers);
      setPagination(data.pagination || null);
      
      // Mostrar modal se não houver usuários e houver filtro de província
      if (loadedUsers.length === 0 && filters.province) {
        setShowNoUsersModal(true);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await api.post('/admin/users', formData);
      setShowCreateModal(false);
      setSuccessMessage('Usuário criado com sucesso!');
      setShowSuccessModal(true);
      resetForm();
      loadUsers();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao criar usuário');
    }
  };

  const handleUpdate = async () => {
    if (!selectedUser) return;
    try {
      const { password, ...updateData } = formData;
      const payload: any = { ...updateData };
      if (password) payload.password = password;
      
      await api.put(`/admin/users/${selectedUser.id}`, payload);
      setShowEditModal(false);
      setSuccessMessage('Usuário atualizado com sucesso!');
      setShowSuccessModal(true);
      resetForm();
      loadUsers();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao atualizar usuário');
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      await api.delete(`/admin/users/${selectedUser.id}`);
      setShowDeleteModal(false);
      setSuccessMessage('Usuário deletado com sucesso!');
      setShowSuccessModal(true);
      setSelectedUser(null);
      loadUsers();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao deletar usuário');
    }
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setFormData({
      fullName: user.fullName,
      email: user.email,
      password: '',
      role: user.role,
      phone: user.phone || '',
      province: user.province || '',
      municipality: user.municipality || '',
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (userItem: User) => {
    if (userItem.id === user?.id) {
      alert('Não é possível deletar sua própria conta');
      return;
    }
    setSelectedUser(userItem);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      password: '',
      role: 'CIDADAO',
      phone: '',
      province: '',
      municipality: '',
    });
    setSelectedUser(null);
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      'CIDADAO': 'Cidadão',
      'FAMILIAR': 'Familiar',
      'VOLUNTARIO': 'Voluntário',
      'MODERADOR': 'Moderador',
      'AUTORIDADE': 'Autoridade',
      'ADMIN': 'Administrador',
    };
    return labels[role] || role;
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      'CIDADAO': 'bg-blue-100 text-blue-700',
      'FAMILIAR': 'bg-purple-100 text-purple-700',
      'VOLUNTARIO': 'bg-green-100 text-green-700',
      'MODERADOR': 'bg-amber-100 text-amber-700',
      'AUTORIDADE': 'bg-red-100 text-red-700',
      'ADMIN': 'bg-slate-100 text-slate-700',
    };
    return colors[role] || 'bg-slate-100 text-slate-700';
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">Acesso negado. Apenas administradores podem acessar esta página.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gerenciar Usuários</h1>
          <p className="mt-1 text-slate-600">Criar, editar e gerenciar contas de usuários</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowCreateModal(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Novo Usuário
        </button>
      </div>

      {/* Filtros */}
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar por nome ou email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filters.role}
              onChange={(e) => {
                setFilters({ ...filters, role: e.target.value });
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Todos os Roles</option>
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {getRoleLabel(role)}
                </option>
              ))}
            </select>
            <select
              value={filters.province}
              onChange={(e) => {
                setFilters({ ...filters, province: e.target.value });
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Todas Províncias</option>
              {ANGOLA_PROVINCES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabela de Usuários */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Carregando usuários...</p>
        </div>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Usuário</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Localização</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Casos</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {users.map((userItem) => (
                  <tr key={userItem.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-slate-900">{userItem.fullName}</p>
                          {userItem.isBlocked ? (
                            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-700 flex items-center gap-1">
                              <Ban className="h-3 w-3" />
                              Bloqueado
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-700">
                              Ativo
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {userItem.email}
                        </p>
                        {userItem.phone && (
                          <p className="text-sm text-slate-600 flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {userItem.phone}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getRoleColor(userItem.role)}`}>
                        {getRoleLabel(userItem.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {userItem.province && (
                        <p className="text-sm text-slate-600 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {userItem.province}
                          {userItem.municipality && ` - ${userItem.municipality}`}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-slate-900">{userItem._count.missingPeople}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {userItem.verifiedAt ? (
                          <span className="flex items-center gap-1 text-green-600 text-sm">
                            <CheckCircle className="h-4 w-4" />
                            Verificado
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-amber-600 text-sm">
                            <XCircle className="h-4 w-4" />
                            Não verificado
                          </span>
                        )}
                        {userItem.isBlocked && (
                          <span className="flex items-center gap-1 text-red-600 text-sm">
                            <Ban className="h-4 w-4" />
                            Bloqueado
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditClick(userItem)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {userItem.id !== user?.id && userItem.role !== 'ADMIN' && (
                          <>
                            {userItem.isBlocked ? (
                              <button
                                onClick={() => {
                                  setSelectedUser(userItem);
                                  setShowUnblockModal(true);
                                }}
                                className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                                title="Desbloquear"
                              >
                                <Unlock className="h-4 w-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setSelectedUser(userItem);
                                  setBlockReason('');
                                  setShowBlockModal(true);
                                }}
                                className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Bloquear"
                              >
                                <Ban className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteClick(userItem)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Deletar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          {pagination && pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Mostrando {users.length} de {pagination.total} usuários
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={!pagination.hasPrevPage}
                  className={`p-2 rounded ${pagination.hasPrevPage ? 'hover:bg-slate-100' : 'opacity-50 cursor-not-allowed'}`}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="text-sm text-slate-700">
                  Página {pagination.page} de {pagination.totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={!pagination.hasNextPage}
                  className={`p-2 rounded ${pagination.hasNextPage ? 'hover:bg-slate-100' : 'opacity-50 cursor-not-allowed'}`}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal Bloquear Usuário */}
      <ConfirmModal
        isOpen={showBlockModal}
        onClose={() => {
          setShowBlockModal(false);
          setSelectedUser(null);
          setBlockReason('');
        }}
        onConfirm={async () => {
          if (!selectedUser) return;
          try {
            setProcessing(true);
            await api.patch(`/admin/users/${selectedUser.id}/block`, {
              reason: blockReason || 'Bloqueado pelo administrador',
            });
            setSuccessMessage(`Usuário ${selectedUser.fullName} bloqueado com sucesso!`);
            setShowSuccessModal(true);
            setShowBlockModal(false);
            setSelectedUser(null);
            setBlockReason('');
            await loadUsers();
          } catch (error: any) {
            alert(error.response?.data?.message || 'Erro ao bloquear usuário');
          } finally {
            setProcessing(false);
          }
        }}
        title="Bloquear Usuário"
        message={
          selectedUser
            ? `Deseja bloquear o usuário ${selectedUser.fullName}? O usuário não poderá mais acessar a plataforma.`
            : ''
        }
        confirmText={processing ? 'Bloqueando...' : 'Bloquear'}
        cancelText="Cancelar"
        variant="warning"
      >
        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">Motivo do bloqueio (opcional)</label>
          <textarea
            value={blockReason}
            onChange={(e) => setBlockReason(e.target.value)}
            placeholder="Ex: Comentários ofensivos, spam, etc."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            rows={3}
          />
        </div>
      </ConfirmModal>

      {/* Modal Desbloquear Usuário */}
      <ConfirmModal
        isOpen={showUnblockModal}
        onClose={() => {
          setShowUnblockModal(false);
          setSelectedUser(null);
        }}
        onConfirm={async () => {
          if (!selectedUser) return;
          try {
            setProcessing(true);
            await api.patch(`/admin/users/${selectedUser.id}/unblock`);
            setSuccessMessage(`Usuário ${selectedUser.fullName} desbloqueado com sucesso!`);
            setShowSuccessModal(true);
            setShowUnblockModal(false);
            setSelectedUser(null);
            await loadUsers();
          } catch (error: any) {
            alert(error.response?.data?.message || 'Erro ao desbloquear usuário');
          } finally {
            setProcessing(false);
          }
        }}
        title="Desbloquear Usuário"
        message={
          selectedUser
            ? `Deseja desbloquear o usuário ${selectedUser.fullName}? O usuário poderá acessar a plataforma novamente.`
            : ''
        }
        confirmText={processing ? 'Desbloqueando...' : 'Desbloquear'}
        cancelText="Cancelar"
        variant="info"
      />

      {/* Modal Criar Usuário */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Criar Novo Usuário</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Senha *</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Role *</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    >
                      {ROLES.map((role) => (
                        <option key={role} value={role}>
                          {getRoleLabel(role)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Província</label>
                    <select
                      value={formData.province}
                      onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    >
                      <option value="">Selecione</option>
                      {ANGOLA_PROVINCES.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Município</label>
                    <input
                      type="text"
                      value={formData.municipality}
                      onChange={(e) => setFormData({ ...formData, municipality: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!formData.fullName || !formData.email || !formData.password || !formData.phone}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Criar Usuário
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Usuário */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Editar Usuário</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nova Senha (deixe em branco para não alterar)</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    placeholder="Deixe em branco para manter a senha atual"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Role *</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    >
                      {ROLES.map((role) => (
                        <option key={role} value={role}>
                          {getRoleLabel(role)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Província</label>
                    <select
                      value={formData.province}
                      onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    >
                      <option value="">Selecione</option>
                      {ANGOLA_PROVINCES.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Município</label>
                    <input
                      type="text"
                      value={formData.municipality}
                      onChange={(e) => setFormData({ ...formData, municipality: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={!formData.fullName || !formData.email || !formData.phone}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Salvar Alterações
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Deletar */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedUser(null);
        }}
        onConfirm={handleDelete}
        title="Deletar Usuário"
        message={`Tem certeza que deseja deletar o usuário "${selectedUser?.fullName}"? Esta ação não pode ser desfeita.`}
        confirmText="Deletar"
        cancelText="Cancelar"
        variant="danger"
      />

      {/* Modal Sucesso */}
      <InfoModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Sucesso"
        message={successMessage}
        variant="success"
      />

      {/* Modal Sem Usuários */}
      <InfoModal
        isOpen={showNoUsersModal}
        onClose={() => setShowNoUsersModal(false)}
        title="Nenhum Usuário Encontrado"
        message={`Não há usuários cadastrados na província "${filters.province}".`}
        variant="info"
      />
    </div>
  );
}

