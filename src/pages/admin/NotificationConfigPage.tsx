import { useState, useEffect } from 'react';
import { Bell, Save, ToggleLeft, ToggleRight } from 'lucide-react';
import { api } from '../../api/client';
import { InfoModal } from '../../components/InfoModal';

type NotificationConfig = {
  eventType: string;
  enabled: boolean;
  template: string | null;
  targetRoles: string[] | null;
  updatedAt: string;
};

const EVENT_TYPES = [
  { value: 'new_case', label: 'Novo Caso Reportado', description: 'Quando um novo caso é criado' },
  { value: 'case_approved', label: 'Caso Aprovado', description: 'Quando um caso é aprovado pelo moderador' },
  { value: 'case_rejected', label: 'Caso Rejeitado', description: 'Quando um caso é rejeitado pelo moderador' },
  { value: 'new_sighting', label: 'Novo Avistamento', description: 'Quando um novo avistamento é reportado' },
  { value: 'case_status_changed', label: 'Status do Caso Alterado', description: 'Quando o status de um caso é alterado' },
  { value: 'new_chat_message', label: 'Nova Mensagem no Chat', description: 'Quando uma nova mensagem é enviada no chat' },
  { value: 'new_authority_chat', label: 'Nova Conversa com Autoridade', description: 'Quando uma nova conversa com autoridade é iniciada' },
  { value: 'global_announcement', label: 'Comunicado Global', description: 'Quando um comunicado global é enviado' },
];

const USER_ROLES = [
  { value: 'CIDADAO', label: 'Cidadão' },
  { value: 'FAMILIAR', label: 'Familiar' },
  { value: 'VOLUNTARIO', label: 'Voluntário' },
  { value: 'MODERADOR', label: 'Moderador' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'AUTORIDADE', label: 'Autoridade' },
];

export function NotificationConfigPage() {
  const [configs, setConfigs] = useState<NotificationConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<{ template: string; targetRoles: string[] }>({
    template: '',
    targetRoles: [],
  });

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/notification-config');
      setConfigs(data.configs || []);
    } catch (error: any) {
      console.error('Erro ao carregar configurações:', error);
      alert('Erro ao carregar configurações de notificações');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (eventType: string, enabled: boolean) => {
    try {
      setSaving(eventType);
      await api.put(`/notification-config/${eventType}`, { enabled: !enabled });
      await loadConfigs();
      setShowSuccessModal(true);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao atualizar configuração');
    } finally {
      setSaving(null);
    }
  };

  const handleEdit = (config: NotificationConfig) => {
    setEditingConfig(config.eventType);
    setEditFormData({
      template: config.template || '',
      targetRoles: config.targetRoles || [],
    });
  };

  const handleSaveEdit = async (eventType: string) => {
    try {
      setSaving(eventType);
      await api.put(`/notification-config/${eventType}`, editFormData);
      setEditingConfig(null);
      await loadConfigs();
      setShowSuccessModal(true);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao salvar configuração');
    } finally {
      setSaving(null);
    }
  };

  const getEventLabel = (eventType: string) => {
    const event = EVENT_TYPES.find(e => e.value === eventType);
    return event ? event.label : eventType;
  };

  const getEventDescription = (eventType: string) => {
    const event = EVENT_TYPES.find(e => e.value === eventType);
    return event ? event.description : '';
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Configurações de Notificações</h1>
        <p className="mt-2 text-slate-600">Gerencie notificações automáticas da plataforma</p>
      </div>

      <div className="space-y-4">
        {configs.map((config) => (
          <div key={config.eventType} className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Bell className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-slate-900">{getEventLabel(config.eventType)}</h3>
                  <button
                    onClick={() => handleToggle(config.eventType, config.enabled)}
                    disabled={saving === config.eventType}
                    className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${
                      config.enabled
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {config.enabled ? (
                      <>
                        <ToggleRight className="h-4 w-4" />
                        Ativado
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="h-4 w-4" />
                        Desativado
                      </>
                    )}
                  </button>
                </div>
                <p className="text-sm text-slate-600 mb-4">{getEventDescription(config.eventType)}</p>

                {editingConfig === config.eventType ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Template da Mensagem</label>
                      <textarea
                        value={editFormData.template}
                        onChange={(e) => setEditFormData({ ...editFormData, template: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2"
                        rows={3}
                        placeholder="Ex: Novo caso reportado: {caseName}"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Use variáveis como {'{caseName}'}, {'{status}'}, {'{reason}'} conforme o tipo de evento
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Roles Alvo (deixe vazio para todos)</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {USER_ROLES.map((role) => (
                          <label key={role.value} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={editFormData.targetRoles.includes(role.value)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setEditFormData({ ...editFormData, targetRoles: [...editFormData.targetRoles, role.value] });
                                } else {
                                  setEditFormData({ ...editFormData, targetRoles: editFormData.targetRoles.filter(r => r !== role.value) });
                                }
                              }}
                              className="rounded"
                            />
                            <span className="text-sm text-slate-700">{role.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingConfig(null)}
                        className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => handleSaveEdit(config.eventType)}
                        disabled={saving === config.eventType}
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        Salvar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {config.template && (
                      <div>
                        <p className="text-sm font-medium text-slate-700">Template:</p>
                        <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded">{config.template}</p>
                      </div>
                    )}
                    {config.targetRoles && config.targetRoles.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-slate-700">Roles Alvo:</p>
                        <p className="text-sm text-slate-600">{config.targetRoles.join(', ')}</p>
                      </div>
                    )}
                    <button
                      onClick={() => handleEdit(config)}
                      className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm"
                    >
                      Editar Configuração
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <InfoModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Sucesso"
        message="Configuração atualizada com sucesso!"
        variant="success"
      />
    </div>
  );
}








