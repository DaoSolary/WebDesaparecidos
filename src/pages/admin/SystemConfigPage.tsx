import { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw } from 'lucide-react';
import { api } from '../../api/client';
import { InfoModal } from '../../components/InfoModal';

type UsageLimits = {
  maxCasesPerDay: number;
  maxReportsPerDay: number;
  maxSightingsPerDay: number;
  maxChatMessagesPerDay: number;
  rateLimitRequests: number;
  rateLimitWindow: number;
};

export function SystemConfigPage() {
  const [limits, setLimits] = useState<UsageLimits>({
    maxCasesPerDay: 10,
    maxReportsPerDay: 5,
    maxSightingsPerDay: 20,
    maxChatMessagesPerDay: 100,
    rateLimitRequests: 1000,
    rateLimitWindow: 3600,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    loadLimits();
  }, []);

  const loadLimits = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/system-config/limits/daily');
      if (data.limits) {
        setLimits(data.limits);
      }
    } catch (error: any) {
      console.error('Erro ao carregar limites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put('/system-config/limits/daily', limits);
      setShowSuccessModal(true);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao salvar limites');
    } finally {
      setSaving(false);
    }
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
        <h1 className="text-3xl font-bold text-slate-900">Configurações do Sistema</h1>
        <p className="mt-2 text-slate-600">Configure limites de uso diário para evitar abuso da plataforma</p>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Limites de Uso Diário
        </h2>

        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Máximo de Casos por Dia
              </label>
              <input
                type="number"
                value={limits.maxCasesPerDay}
                onChange={(e) => setLimits({ ...limits, maxCasesPerDay: parseInt(e.target.value) || 0 })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                min="1"
              />
              <p className="text-xs text-slate-500 mt-1">Número máximo de casos que um usuário pode criar por dia</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Máximo de Denúncias por Dia
              </label>
              <input
                type="number"
                value={limits.maxReportsPerDay}
                onChange={(e) => setLimits({ ...limits, maxReportsPerDay: parseInt(e.target.value) || 0 })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                min="1"
              />
              <p className="text-xs text-slate-500 mt-1">Número máximo de denúncias que um usuário pode fazer por dia</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Máximo de Avistamentos por Dia
              </label>
              <input
                type="number"
                value={limits.maxSightingsPerDay}
                onChange={(e) => setLimits({ ...limits, maxSightingsPerDay: parseInt(e.target.value) || 0 })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                min="1"
              />
              <p className="text-xs text-slate-500 mt-1">Número máximo de avistamentos que um usuário pode reportar por dia</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Máximo de Mensagens de Chat por Dia
              </label>
              <input
                type="number"
                value={limits.maxChatMessagesPerDay}
                onChange={(e) => setLimits({ ...limits, maxChatMessagesPerDay: parseInt(e.target.value) || 0 })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                min="1"
              />
              <p className="text-xs text-slate-500 mt-1">Número máximo de mensagens de chat por usuário por dia</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Limite de Requisições (Rate Limit)
              </label>
              <input
                type="number"
                value={limits.rateLimitRequests}
                onChange={(e) => setLimits({ ...limits, rateLimitRequests: parseInt(e.target.value) || 0 })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                min="1"
              />
              <p className="text-xs text-slate-500 mt-1">Número máximo de requisições permitidas no período</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Janela de Tempo (segundos)
              </label>
              <input
                type="number"
                value={limits.rateLimitWindow}
                onChange={(e) => setLimits({ ...limits, rateLimitWindow: parseInt(e.target.value) || 0 })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                min="1"
              />
              <p className="text-xs text-slate-500 mt-1">Período em segundos para o rate limit (ex: 3600 = 1 hora)</p>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
            <button
              onClick={loadLimits}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Restaurar Padrões
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Salvando...' : 'Salvar Configurações'}
            </button>
          </div>
        </div>
      </div>

      <InfoModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Sucesso"
        message="Limites de uso atualizados com sucesso!"
        variant="success"
      />
    </div>
  );
}








