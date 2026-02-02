import { useState, useEffect } from 'react';
import { Database, Download, Play, Calendar, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { api } from '../../api/client';
import { InfoModal } from '../../components/InfoModal';
import { ConfirmModal } from '../../components/ConfirmModal';

type Backup = {
  id: string;
  type: string;
  status: string;
  filePath?: string;
  fileSize?: number;
  startedAt: string;
  completedAt?: string;
  error?: string;
  startedByUser?: {
    fullName: string;
  };
};

type BackupConfig = {
  enabled: boolean;
  frequency: string;
  time: string;
  retentionDays: number;
  types: string[];
};

export function BackupsPage() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [config, setConfig] = useState<BackupConfig>({
    enabled: true,
    frequency: 'daily',
    time: '02:00',
    retentionDays: 30,
    types: ['FULL'],
  });
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);

  useEffect(() => {
    loadBackups();
    loadConfig();
  }, []);

  const loadBackups = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/backups');
      setBackups(data.backups || []);
    } catch (error: any) {
      console.error('Erro ao carregar backups:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadConfig = async () => {
    try {
      const { data } = await api.get('/backups/config');
      if (data.config) {
        setConfig(data.config);
      }
    } catch (error: any) {
      console.error('Erro ao carregar configuração:', error);
    }
  };

  const handleCreateBackup = async (type: string) => {
    try {
      setCreating(true);
      await api.post('/backups', { type });
      setSuccessMessage(`Backup do tipo ${type} iniciado com sucesso!`);
      setShowSuccessModal(true);
      setTimeout(() => {
        loadBackups();
      }, 2000);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao criar backup');
    } finally {
      setCreating(false);
    }
  };

  const handleDownload = async (backupId: string) => {
    try {
      const response = await api.get(`/backups/${backupId}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `backup-${backupId}.sql`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error: any) {
      alert('Erro ao fazer download do backup');
    }
  };

  const handleSaveConfig = async () => {
    try {
      setSavingConfig(true);
      await api.put('/backups/config', config);
      setSuccessMessage('Configuração de backup atualizada com sucesso!');
      setShowSuccessModal(true);
      setShowConfigModal(false);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao salvar configuração');
    } finally {
      setSavingConfig(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'FAILED':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'IN_PROGRESS':
        return <Clock className="h-5 w-5 text-blue-600 animate-spin" />;
      default:
        return <AlertCircle className="h-5 w-5 text-amber-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: 'Pendente',
      IN_PROGRESS: 'Em Progresso',
      COMPLETED: 'Concluído',
      FAILED: 'Falhou',
      CANCELLED: 'Cancelado',
    };
    return labels[status] || status;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
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
          <h1 className="text-3xl font-bold text-slate-900">Backups</h1>
          <p className="mt-2 text-slate-600">Gerencie backups automáticos e manuais do sistema</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowConfigModal(true)}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
          >
            <Calendar className="h-5 w-5" />
            Configurar
          </button>
        </div>
      </div>

      {/* Criar Backup */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Criar Backup Manual</h2>
        <div className="flex gap-3">
          <button
            onClick={() => handleCreateBackup('FULL')}
            disabled={creating}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            Backup Completo
          </button>
          <button
            onClick={() => handleCreateBackup('DATABASE_ONLY')}
            disabled={creating}
            className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Database className="h-4 w-4" />
            Apenas Banco de Dados
          </button>
          <button
            onClick={() => handleCreateBackup('FILES_ONLY')}
            disabled={creating}
            className="px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Database className="h-4 w-4" />
            Apenas Arquivos
          </button>
        </div>
      </div>

      {/* Lista de Backups */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Tamanho</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Iniciado</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Concluído</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {backups.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Nenhum backup encontrado
                  </td>
                </tr>
              ) : (
                backups.map((backup) => (
                  <tr key={backup.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-700">
                        {backup.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(backup.status)}
                        <span className="text-sm text-slate-900">{getStatusLabel(backup.status)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{formatFileSize(backup.fileSize)}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(backup.startedAt).toLocaleString('pt-AO')}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {backup.completedAt ? new Date(backup.completedAt).toLocaleString('pt-AO') : '-'}
                    </td>
                    <td className="px-6 py-4">
                      {backup.status === 'COMPLETED' && backup.filePath && (
                        <button
                          onClick={() => handleDownload(backup.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Configuração */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Configuração de Backup Automático</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.enabled}
                  onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                  className="rounded"
                />
                <label className="text-sm text-slate-700">Ativar backups automáticos</label>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Frequência</label>
                <select
                  value={config.frequency}
                  onChange={(e) => setConfig({ ...config, frequency: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                >
                  <option value="daily">Diário</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensal</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Horário (HH:mm)</label>
                <input
                  type="time"
                  value={config.time}
                  onChange={(e) => setConfig({ ...config, time: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Retenção (dias)</label>
                <input
                  type="number"
                  value={config.retentionDays}
                  onChange={(e) => setConfig({ ...config, retentionDays: parseInt(e.target.value) || 30 })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  min="1"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveConfig}
                disabled={savingConfig}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {savingConfig ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <InfoModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Sucesso"
        message={successMessage}
        variant="success"
      />
    </div>
  );
}








