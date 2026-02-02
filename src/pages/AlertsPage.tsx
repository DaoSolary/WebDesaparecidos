import { useState, useEffect } from 'react';
import { useAuth } from '../store/useAuth';
import { api } from '../api/client';
import { Bell, MapPin, Settings, CheckCircle } from 'lucide-react';
import { ProtectedRoute } from '../components/ProtectedRoute';

type AlertSettings = {
  enabled: boolean;
  province: string;
  radius: number; // em km
  priority: string[];
  status: string[];
};

export function AlertsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<AlertSettings>({
    enabled: true,
    province: user?.province || '',
    radius: 50,
    priority: ['URGENTE', 'CRIANCA', 'IDOSO'],
    status: ['ABERTO', 'EM_INVESTIGACAO'],
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Carregar configurações salvas do usuário
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    try {
      // Em produção, buscar do backend
      const savedSettings = localStorage.getItem(`alert_settings_${user?.id}`);
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const saveSettings = async () => {
    try {
      // Salvar no localStorage (em produção, salvar no backend)
      localStorage.setItem(`alert_settings_${user?.id}`, JSON.stringify(settings));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    }
  };

  const togglePriority = (priority: string) => {
    setSettings((prev) => ({
      ...prev,
      priority: prev.priority.includes(priority)
        ? prev.priority.filter((p) => p !== priority)
        : [...prev.priority, priority],
    }));
  };

  const toggleStatus = (status: string) => {
    setSettings((prev) => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter((s) => s !== status)
        : [...prev.status, status],
    }));
  };

  return (
    <ProtectedRoute allowedRoles={['CIDADAO', 'FAMILIAR', 'VOLUNTARIO', 'AUTORIDADE', 'ADMIN']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Alertas Instantâneos</h1>
          <p className="mt-1 text-slate-600">
            Configure notificações por proximidade e filtros personalizados
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-100 p-2">
              <Bell className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Configurações de Notificações</h2>
              <p className="text-sm text-slate-600">Receba alertas quando novos casos aparecerem na sua área</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200">
              <div>
                <p className="font-semibold text-slate-900">Ativar Alertas</p>
                <p className="text-sm text-slate-600">Receber notificações em tempo real</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enabled}
                  onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Província
              </label>
              <select
                value={settings.province}
                onChange={(e) => setSettings({ ...settings, province: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">Todas as Províncias</option>
                <option value="Luanda">Luanda</option>
                <option value="Benguela">Benguela</option>
                <option value="Huíla">Huíla</option>
                <option value="Huambo">Huambo</option>
                <option value="Bié">Bié</option>
                <option value="Malanje">Malanje</option>
                <option value="Uíge">Uíge</option>
                <option value="Zaire">Zaire</option>
                <option value="Cabinda">Cabinda</option>
                <option value="Cuanza-Norte">Cuanza-Norte</option>
                <option value="Cuanza-Sul">Cuanza-Sul</option>
                <option value="Cuando-Cubango">Cuando-Cubango</option>
                <option value="Cunene">Cunene</option>
                <option value="Lunda-Norte">Lunda-Norte</option>
                <option value="Lunda-Sul">Lunda-Sul</option>
                <option value="Moxico">Moxico</option>
                <option value="Namibe">Namibe</option>
                <option value="Bengo">Bengo</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Raio de Proximidade: {settings.radius} km
              </label>
              <input
                type="range"
                min="10"
                max="200"
                step="10"
                value={settings.radius}
                onChange={(e) => setSettings({ ...settings, radius: Number(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>10 km</span>
                <span>200 km</span>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Prioridades
              </label>
              <div className="flex flex-wrap gap-2">
                {['URGENTE', 'CRIANCA', 'IDOSO', 'DEFICIENCIA', 'GERAL'].map((priority) => (
                  <button
                    key={priority}
                    type="button"
                    onClick={() => togglePriority(priority)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      settings.priority.includes(priority)
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {priority}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Status dos Casos
              </label>
              <div className="flex flex-wrap gap-2">
                {['ABERTO', 'EM_INVESTIGACAO', 'AVISTADO', 'ENCONTRADO'].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => toggleStatus(status)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      settings.status.includes(status)
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <MapPin className="h-4 w-4" />
              <span>Você receberá notificações de casos dentro de {settings.radius} km da sua província</span>
            </div>
            <button
              onClick={saveSettings}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
            >
              {saved ? (
                <>
                  <CheckCircle className="h-5 w-5" />
                  Salvo!
                </>
              ) : (
                <>
                  <Settings className="h-5 w-5" />
                  Salvar Configurações
                </>
              )}
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <Bell className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900">Como funcionam os Alertas Instantâneos?</p>
              <p className="text-sm text-blue-700 mt-1">
                Quando um novo caso de desaparecimento for publicado na sua província ou dentro do raio configurado,
                você receberá uma notificação em tempo real. Isso ajuda a aumentar a visibilidade dos casos e
                acelera a localização de pessoas desaparecidas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}


