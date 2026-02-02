import { useState, useEffect } from 'react';
import { FileText, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { api } from '../../api/client';
import { InfoModal } from '../../components/InfoModal';
import { ConfirmModal } from '../../components/ConfirmModal';

type Content = {
  id: string;
  type: string;
  title: string;
  content: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdByUser: { fullName: string };
  updatedByUser?: { fullName: string };
};

export function InstitutionalContentPage() {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    type: 'FAQ',
    title: '',
    content: '',
    order: 0,
    isActive: true,
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('');

  useEffect(() => {
    loadContents();
  }, [filter]);

  const loadContents = async () => {
    try {
      setLoading(true);
      const params = filter ? `?type=${filter}` : '';
      const { data } = await api.get(`/institutional-content${params}`);
      setContents(data.content || []);
    } catch (error: any) {
      console.error('Erro ao carregar conteúdo:', error);
      alert('Erro ao carregar conteúdo institucional');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await api.post('/institutional-content', formData);
      setSuccessMessage('Conteúdo criado com sucesso!');
      setShowSuccessModal(true);
      setShowCreateModal(false);
      setFormData({ type: 'FAQ', title: '', content: '', order: 0, isActive: true });
      await loadContents();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao criar conteúdo');
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      await api.put(`/institutional-content/${id}`, formData);
      setSuccessMessage('Conteúdo atualizado com sucesso!');
      setShowSuccessModal(true);
      setEditingId(null);
      setFormData({ type: 'FAQ', title: '', content: '', order: 0, isActive: true });
      await loadContents();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao atualizar conteúdo');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await api.delete(`/institutional-content/${deletingId}`);
      setSuccessMessage('Conteúdo deletado com sucesso!');
      setShowSuccessModal(true);
      setShowDeleteModal(false);
      setDeletingId(null);
      await loadContents();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao deletar conteúdo');
    }
  };

  const startEdit = (content: Content) => {
    setEditingId(content.id);
    setFormData({
      type: content.type,
      title: content.title,
      content: content.content,
      order: content.order,
      isActive: content.isActive,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ type: 'FAQ', title: '', content: '', order: 0, isActive: true });
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      FAQ: 'FAQ',
      INSTRUCOES: 'Instruções',
      CONTACTO_EMERGENCIA: 'Contacto de Emergência',
      SOBRE_NOS: 'Sobre Nós',
      TERMOS_USO: 'Termos de Uso',
      POLITICA_PRIVACIDADE: 'Política de Privacidade',
      OUTRO: 'Outro',
    };
    return labels[type] || type;
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
          <h1 className="text-3xl font-bold text-slate-900">Conteúdo Institucional</h1>
          <p className="mt-2 text-slate-600">Gerencie FAQs, instruções e contactos de emergência</p>
        </div>
        <button
          onClick={() => {
            setShowCreateModal(true);
            setFormData({ type: 'FAQ', title: '', content: '', order: 0, isActive: true });
          }}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Novo Conteúdo
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
          <option value="FAQ">FAQ</option>
          <option value="INSTRUCOES">Instruções</option>
          <option value="CONTACTO_EMERGENCIA">Contacto de Emergência</option>
          <option value="SOBRE_NOS">Sobre Nós</option>
          <option value="TERMOS_USO">Termos de Uso</option>
          <option value="POLITICA_PRIVACIDADE">Política de Privacidade</option>
          <option value="OUTRO">Outro</option>
        </select>
      </div>

      {/* Lista de Conteúdo */}
      <div className="space-y-4">
        {contents.map((content) => (
          <div key={content.id} className="bg-white rounded-lg border border-slate-200 p-6">
            {editingId === content.id ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  >
                    <option value="FAQ">FAQ</option>
                    <option value="INSTRUCOES">Instruções</option>
                    <option value="CONTACTO_EMERGENCIA">Contacto de Emergência</option>
                    <option value="SOBRE_NOS">Sobre Nós</option>
                    <option value="TERMOS_USO">Termos de Uso</option>
                    <option value="POLITICA_PRIVACIDADE">Política de Privacidade</option>
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
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm text-slate-700">Ativo</span>
                  </label>
                  <div className="flex-1" />
                  <button
                    onClick={cancelEdit}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleUpdate(content.id)}
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
                      <span className="px-3 py-1 rounded text-sm font-semibold bg-blue-100 text-blue-700">
                        {getTypeLabel(content.type)}
                      </span>
                      {content.isActive ? (
                        <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700">Ativo</span>
                      ) : (
                        <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-700">Inativo</span>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">{content.title}</h3>
                    <div className="prose max-w-none text-slate-600 whitespace-pre-wrap">{content.content}</div>
                    <p className="text-xs text-slate-500 mt-3">
                      Criado por {content.createdByUser.fullName} em {new Date(content.createdAt).toLocaleDateString('pt-AO')}
                      {content.updatedByUser && ` • Atualizado por ${content.updatedByUser.fullName}`}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => startEdit(content)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setDeletingId(content.id);
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
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Criar Novo Conteúdo</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                >
                  <option value="FAQ">FAQ</option>
                  <option value="INSTRUCOES">Instruções</option>
                  <option value="CONTACTO_EMERGENCIA">Contacto de Emergência</option>
                  <option value="SOBRE_NOS">Sobre Nós</option>
                  <option value="TERMOS_USO">Termos de Uso</option>
                  <option value="POLITICA_PRIVACIDADE">Política de Privacidade</option>
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
                  placeholder="Ex: Como reportar um desaparecimento?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Conteúdo *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  rows={8}
                  placeholder="Digite o conteúdo aqui..."
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded"
                />
                <label className="text-sm text-slate-700">Ativo</label>
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
                Criar
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
        title="Deletar Conteúdo"
        message="Tem certeza que deseja deletar este conteúdo? Esta ação não pode ser desfeita."
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








