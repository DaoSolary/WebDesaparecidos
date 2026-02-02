import { useState } from 'react';
import { useAuth } from '../../store/useAuth';
import { Settings, Save, Bell, Mail, Shield, Database, Globe } from 'lucide-react';
import { InfoModal } from '../../components/InfoModal';

export function SettingsPage() {
  const { user } = useAuth();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [settings, setSettings] = useState({
    notifications: {
      emailEnabled: true,
      pushEnabled: true,
      smsEnabled: false,
    },
    security: {
      requireVerification: true,
      twoFactorAuth: false,
      sessionTimeout: 30,
    },
    platform: {
      maintenanceMode: false,
      allowRegistration: true,
      requireApproval: true,
      maxCasesPerUser: 10,
    },
    email: {
      smtpHost: '',
      smtpPort: 587,
      smtpUser: '',
      smtpFrom: '',
    },
  });

  const handleSave = () => {
    // Aqui você salvaria as configurações no backend
    setShowSuccessModal(true);
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
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Configurações da Plataforma</h1>
        <p className="mt-1 text-slate-600">Gerencie as configurações gerais da plataforma</p>
      </div>

      {/* Notificações */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-slate-900">Notificações</h2>
        </div>
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <span className="text-sm text-slate-700">Notificações por Email</span>
            <input
              type="checkbox"
              checked={settings.notifications.emailEnabled}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, emailEnabled: e.target.checked },
                })
              }
              className="rounded"
            />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm text-slate-700">Notificações Push</span>
            <input
              type="checkbox"
              checked={settings.notifications.pushEnabled}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, pushEnabled: e.target.checked },
                })
              }
              className="rounded"
            />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm text-slate-700">Notificações SMS</span>
            <input
              type="checkbox"
              checked={settings.notifications.smsEnabled}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, smsEnabled: e.target.checked },
                })
              }
              className="rounded"
            />
          </label>
        </div>
      </div>

      {/* Segurança */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-green-600" />
          <h2 className="text-lg font-semibold text-slate-900">Segurança</h2>
        </div>
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <span className="text-sm text-slate-700">Requerer Verificação de Email</span>
            <input
              type="checkbox"
              checked={settings.security.requireVerification}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  security: { ...settings.security, requireVerification: e.target.checked },
                })
              }
              className="rounded"
            />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm text-slate-700">Autenticação de Dois Fatores</span>
            <input
              type="checkbox"
              checked={settings.security.twoFactorAuth}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  security: { ...settings.security, twoFactorAuth: e.target.checked },
                })
              }
              className="rounded"
            />
          </label>
          <div>
            <label className="block text-sm text-slate-700 mb-1">Timeout de Sessão (minutos)</label>
            <input
              type="number"
              value={settings.security.sessionTimeout}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  security: { ...settings.security, sessionTimeout: parseInt(e.target.value) || 30 },
                })
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              min="5"
              max="1440"
            />
          </div>
        </div>
      </div>

      {/* Plataforma */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="h-5 w-5 text-amber-600" />
          <h2 className="text-lg font-semibold text-slate-900">Plataforma</h2>
        </div>
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <span className="text-sm text-slate-700">Modo de Manutenção</span>
            <input
              type="checkbox"
              checked={settings.platform.maintenanceMode}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  platform: { ...settings.platform, maintenanceMode: e.target.checked },
                })
              }
              className="rounded"
            />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm text-slate-700">Permitir Registro de Novos Usuários</span>
            <input
              type="checkbox"
              checked={settings.platform.allowRegistration}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  platform: { ...settings.platform, allowRegistration: e.target.checked },
                })
              }
              className="rounded"
            />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm text-slate-700">Requerer Aprovação de Casos</span>
            <input
              type="checkbox"
              checked={settings.platform.requireApproval}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  platform: { ...settings.platform, requireApproval: e.target.checked },
                })
              }
              className="rounded"
            />
          </label>
          <div>
            <label className="block text-sm text-slate-700 mb-1">Máximo de Casos por Usuário</label>
            <input
              type="number"
              value={settings.platform.maxCasesPerUser}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  platform: { ...settings.platform, maxCasesPerUser: parseInt(e.target.value) || 10 },
                })
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              min="1"
              max="100"
            />
          </div>
        </div>
      </div>

      {/* Email */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="h-5 w-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-slate-900">Configurações de Email</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-700 mb-1">SMTP Host</label>
            <input
              type="text"
              value={settings.email.smtpHost}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  email: { ...settings.email, smtpHost: e.target.value },
                })
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              placeholder="smtp.gmail.com"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-700 mb-1">SMTP Port</label>
              <input
                type="number"
                value={settings.email.smtpPort}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    email: { ...settings.email, smtpPort: parseInt(e.target.value) || 587 },
                  })
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-700 mb-1">SMTP User</label>
              <input
                type="text"
                value={settings.email.smtpUser}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    email: { ...settings.email, smtpUser: e.target.value },
                  })
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-700 mb-1">Email Remetente</label>
            <input
              type="email"
              value={settings.email.smtpFrom}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  email: { ...settings.email, smtpFrom: e.target.value },
                })
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              placeholder="noreply@desaparecidos.gov"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          <Save className="h-5 w-5" />
          Salvar Configurações
        </button>
      </div>

      <InfoModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Configurações Salvas"
        message="As configurações foram salvas com sucesso!"
        variant="success"
      />
    </div>
  );
}


