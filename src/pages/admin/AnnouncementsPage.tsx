import { useState, useEffect } from 'react';
import { Megaphone, Plus, Edit, Trash2, Save, X, AlertCircle, Bell, FileText, Wrench } from 'lucide-react';
import { api } from '../../api/client';
import { InfoModal } from '../../components/InfoModal';
import { ConfirmModal } from '../../components/ConfirmModal';

type Announcement = {
  id: string;
  type: string;
  title: string;
  content: string;
  priority: string;
  isActive: boolean;
  targetRoles?: string[] | null;
  expiresAt?: string | null;
  createdAt: string;
  createdByUser: { fullName: string };
};

const ANGOLAN_PROVINCES = [
  'Bengo', 'Benguela', 'Bié', 'Cabinda', 'Cuando-Cubango', 'Cuanza-Norte',
  'Cuanza-Sul', 'Cunene', 'Huambo', 'Huíla', 'Luanda', 'Lunda-Norte',
  'Lunda-Sul', 'Malanje', 'Moxico', 'Namibe', 'Uíge', 'Zaire'
];

const USER_ROLES = [
  { value: 'CIDADAO', label: 'Cidadão' },
  { value: 'FAMILIAR', label: 'Familiar' },
  { value: 'VOLUNTARIO', label: 'Voluntário' },
  { value: 'MODERADOR', label: 'Moderador' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'AUTORIDADE', label: 'Autoridade' },
];

export function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    type: 'NOTICIA',
    title: '',
    content: '',
    priority: 'NORMAL',
    targetRoles: [] as string[],
    expiresAt: '',
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('');

  useEffect(() => {
    loadAnnouncements();
  }, [filter]);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const params = filter ? `?type=${filter}` : '';
      const { data } = await api.get(`/announcements${params}`);
      setAnnouncements(data.announcements || []);
    } catch (error: any) {
      console.error('Erro ao carregar comunicados:', error);
      alert('Erro ao carregar comunicados');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await api.post('/announcements', {
        ...formData,
        expiresAt: formData.expiresAt || null,
        targetRoles: formData.targetRoles.length > 0 ? formData.targetRoles : null,
      });
      setSuccessMessage('Comunicado criado e enviado com sucesso!');
      setShowSuccessModal(true);
      setShowCreateModal(false);
      setFormData({ type: 'NOTICIA', title: '', content: '', priority: 'NORMAL', targetRoles: [], expiresAt: '' });
      await loadAnnouncements();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao criar comunicado');
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      await api.put(`/announcements/${id}`, formData);
      setSuccessMessage('Comunicado atualizado com sucesso!');
      setShowSuccessModal(true);
      setEditingId(null);
      setFormData({ type: 'NOTICIA', title: '', content: '', priority: 'NORMAL', targetRoles: [], expiresAt: '' });
      await loadAnnouncements();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao atualizar comunicado');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await api.delete(`/announcements/${deletingId}`);
      setSuccessMessage('Comunicado deletado com sucesso!');
      setShowSuccessModal(true);
      setShowDeleteModal(false);
      setDeletingId(null);
      await loadAnnouncements();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao deletar comunicado');
    }
  };

  const startEdit = (announcement: Announcement) => {
    setEditingId(announcement.id);
    setFormData({
      type: announcement.type,
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority,
      targetRoles: announcement.targetRoles || [],
      expiresAt: announcement.expiresAt ? announcement.expiresAt.split('T')[0] : '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ type: 'NOTICIA', title: '', content: '', priority: 'NORMAL', targetRoles: [], expiresAt: '' });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ALERTA_URGENTE':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'NOTICIA':
        return <Bell className="h-5 w-5 text-blue-600" />;
      case 'INSTRUCAO':
        return <FileText className="h-5 w-5 text-green-600" />;
      case 'MANUTENCAO':
        return <Wrench className="h-5 w-5 text-amber-600" />;
      default:
        return <Megaphone className="h-5 w-5 text-slate-600" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      NOTICIA: 'Notícia',
      ALERTA_URGENTE: 'Alerta Urgente',
      INSTRUCAO: 'Instrução',
      MANUTENCAO: 'Manutenção',
      OUTRO: 'Outro',
    };
    return labels[type] || type;
  };

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = {
      LOW: 'Baixa',
      NORMAL: 'Normal',
      HIGH: 'Alta',
      URGENT: 'Urgente',
    };
    return labels[priority] || priority;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Comunicados Globais</h1>
          <p className="mt-2 text-slate-600">Envie notícias, alertas e instruções para todos os usuários</p>
        </div>
        <button
          onClick={() => {
            setShowCreateModal(true);
            setFormData({ type: 'NOTICIA', title: '', content: '', priority: 'NORMAL', targetRoles: [], expiresAt: '' });
          }}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Novo Comunicado
        </button>
      </div>

      {/* Filtro */}
      <div className="mb-6">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-slate-300 bg-white"
        >
          <option value="">Todos os Tipos</option>
          <option value="NOTICIA">Notícias</option>
          <option value="ALERTA_URGENTE">Alertas Urgentes</option>
          <option value="INSTRUCAO">Instruções</option>
          <option value="MANUTENCAO">Manutenção</option>
          <option value="OUTRO">Outro</option>
        </select>
      </div>

      {/* Lista de Comunicados */}
      <div className="space-y-4">
        {announcements.map((announcement) => (
          <div key={announcement.id} className="bg-white rounded-lg border border-slate-200 p-6">
            {editingId === announcement.id ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  >
                    <option value="NOTICIA">Notícia</option>
                    <option value="ALERTA_URGENTE">Alerta Urgente</option>
                    <option value="INSTRUCAO">Instrução</option>
                    <option value="MANUTENCAO">Manutenção</option>
                    <option value="OUTRO">Outro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Conteúdo</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    rows={6}
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Prioridade</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    >
                      <option value="LOW">Baixa</option>
                      <option value="NORMAL">Normal</option>
                      <option value="HIGH">Alta</option>
                      <option value="URGENT">Urgente</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Expira em (opcional)</label>
                    <input
                      type="date"
                      value={formData.expiresAt}
                      onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Roles Alvo (deixe vazio para todos)</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {USER_ROLES.map((role) => (
                      <label key={role.value} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.targetRoles.includes(role.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, targetRoles: [...formData.targetRoles, role.value] });
                            } else {
                              setFormData({ ...formData, targetRoles: formData.targetRoles.filter(r => r !== role.value) });
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm text-slate-700">{role.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={cancelEdit}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleUpdate(announcement.id)}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Salvar
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getTypeIcon(announcement.type)}
                      <span className="px-3 py-1 rounded text-sm font-semibold bg-blue-100 text-blue-700">
                        {getTypeLabel(announcement.type)}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        announcement.priority === 'URGENT' ? 'bg-red-100 text-red-700' :
                        announcement.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                        announcement.priority === 'NORMAL' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {getPriorityLabel(announcement.priority)}
                      </span>
                      {announcement.isActive ? (
                        <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700">Ativo</span>
                      ) : (
                        <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-700">Inativo</span>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">{announcement.title}</h3>
                    <div className="prose max-w-none text-slate-600 whitespace-pre-wrap">{announcement.content}</div>
                    <p className="text-xs text-slate-500 mt-3">
                      Criado por {announcement.createdByUser.fullName} em {new Date(announcement.createdAt).toLocaleDateString('pt-AO')}
                      {announcement.targetRoles && announcement.targetRoles.length > 0 && (
                        <> • Para: {announcement.targetRoles.join(', ')}</>
                      )}
                      {announcement.expiresAt && (
                        <> • Expira em: {new Date(announcement.expiresAt).toLocaleDateString('pt-AO')}</>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => startEdit(announcement)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setDeletingId(announcement.id);
                        setShowDeleteModal(true);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Deletar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Modal Criar */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Criar Novo Comunicado</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                >
                  <option value="NOTICIA">Notícia</option>
                  <option value="ALERTA_URGENTE">Alerta Urgente</option>
                  <option value="INSTRUCAO">Instrução</option>
                  <option value="MANUTENCAO">Manutenção</option>
                  <option value="OUTRO">Outro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Título *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  placeholder="Ex: Nova funcionalidade disponível"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Conteúdo *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  rows={8}
                  placeholder="Digite o conteúdo do comunicado aqui..."
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Prioridade</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  >
                    <option value="LOW">Baixa</option>
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">Alta</option>
                    <option value="URGENT">Urgente</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Expira em (opcional)</label>
                  <input
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Roles Alvo (deixe vazio para todos)</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {USER_ROLES.map((role) => (
                    <label key={role.value} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.targetRoles.includes(role.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, targetRoles: [...formData.targetRoles, role.value] });
                          } else {
                            setFormData({ ...formData, targetRoles: formData.targetRoles.filter(r => r !== role.value) });
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm text-slate-700">{role.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={!formData.title || !formData.content}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Criar e Enviar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Deletar */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingId(null);
        }}
        onConfirm={handleDelete}
        title="Deletar Comunicado"
        message="Tem certeza que deseja deletar este comunicado? Esta ação não pode ser desfeita."
        confirmText="Deletar"
        cancelText="Cancelar"
        variant="warning"
      />

      {/* Modal Sucesso */}
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








