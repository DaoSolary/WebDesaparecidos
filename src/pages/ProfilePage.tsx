import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../store/useAuth';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Lock, 
  Save, 
  AlertCircle, 
  CheckCircle,
  Settings,
  Shield,
  Bell,
  Eye,
  EyeOff,
  History,
  Award,
  MessageSquare
} from 'lucide-react';
import { api } from '../api/client';
import { AuthorityChatModal } from '../components/AuthorityChatModal';

type ProfileForm = {
  fullName: string;
  email: string;
  phone?: string;
  province?: string;
  municipality?: string;
};

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type TabType = 'basic' | 'medium' | 'advanced' | 'history' | 'badges' | 'authority-chat';

export function ProfilePage() {
  const { user, fetchUser, updateProfile, changePassword } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [profileSuccess, setProfileSuccess] = useState<string>();
  const [profileError, setProfileError] = useState<string>();
  const [passwordSuccess, setPasswordSuccess] = useState<string>();
  const [passwordError, setPasswordError] = useState<string>();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [history, setHistory] = useState<any>(null);
  const [badges, setBadges] = useState<any[]>([]);
  const [authorities, setAuthorities] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedAuthority, setSelectedAuthority] = useState<any>(null);
  const [showChatModal, setShowChatModal] = useState(false);

  const profileForm = useForm<ProfileForm>({
    defaultValues: {
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      province: user?.province || '',
      municipality: user?.municipality || '',
    },
  });

  const passwordForm = useForm<PasswordForm>();

  useEffect(() => {
    if (!user) {
      const token = localStorage.getItem('bdpd_token');
      if (token) {
        fetchUser();
      } else {
        navigate('/entrar');
      }
    } else {
      profileForm.reset({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        province: user.province || '',
        municipality: user.municipality || '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const onProfileSubmit = profileForm.handleSubmit(async (data) => {
    try {
      setProfileError(undefined);
      setProfileSuccess(undefined);
      await updateProfile(data);
      setProfileSuccess('Perfil atualizado com sucesso!');
      setTimeout(() => setProfileSuccess(undefined), 3000);
    } catch (err: any) {
      setProfileError(err.response?.data?.message || 'Erro ao atualizar perfil. Tente novamente.');
    }
  });

  const onPasswordSubmit = passwordForm.handleSubmit(async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      setPasswordError('As senhas não coincidem.');
      return;
    }

    if (data.newPassword.length < 6) {
      setPasswordError('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    try {
      setPasswordError(undefined);
      setPasswordSuccess(undefined);
      await changePassword(data.currentPassword, data.newPassword);
      setPasswordSuccess('Senha alterada com sucesso!');
      passwordForm.reset();
      setTimeout(() => setPasswordSuccess(undefined), 3000);
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Erro ao alterar senha. Verifique a senha atual.');
    }
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-slate-500">Carregando...</p>
      </div>
    );
  }

  const tabs = [
    { id: 'basic' as TabType, label: 'Básico', icon: User },
    { id: 'medium' as TabType, label: 'Médio', icon: MapPin },
    { id: 'advanced' as TabType, label: 'Avançado', icon: Settings },
    { id: 'history' as TabType, label: 'Histórico', icon: History },
    { id: 'badges' as TabType, label: 'Conquistas', icon: Award },
    { id: 'authority-chat' as TabType, label: 'Chat Autoridades', icon: MessageSquare },
  ];

  useEffect(() => {
    if ((activeTab === 'history' || activeTab === 'badges' || activeTab === 'authority-chat') && user) {
      loadAdditionalData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, user]);

  const loadAdditionalData = async () => {
    if (!user) return;
    
    setLoadingHistory(true);
    try {
      if (activeTab === 'history') {
        const { data } = await api.get('/user/history');
        setHistory(data);
      } else if (activeTab === 'badges') {
        const { data } = await api.get('/badges');
        setBadges(data.badges || []);
      } else if (activeTab === 'authority-chat') {
        // Buscar autoridades disponíveis
        try {
          const { data } = await api.get('/authorities');
          setAuthorities(data.authorities || []);
        } catch (error) {
          console.error('Erro ao buscar autoridades:', error);
          setAuthorities([]);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Meu Perfil</h1>
        <p className="mt-2 text-slate-600">Gerencie suas informações pessoais e configurações</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-slate-200">
        <nav className="flex gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Basic Tab */}
      {activeTab === 'basic' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900">Informações Básicas</h2>
            <p className="mt-1 text-sm text-slate-500">Atualize seu nome, email e telefone</p>
          </div>

          {profileSuccess && (
            <div className="mb-4 flex items-start gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
              <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>{profileSuccess}</span>
            </div>
          )}

          {profileError && (
            <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={onProfileSubmit} className="space-y-5">
            <div>
              <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-slate-700">
                Nome Completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  id="fullName"
                  type="text"
                  {...profileForm.register('fullName', { required: 'Nome é obrigatório' })}
                  className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Seu nome completo"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  {...profileForm.register('email')}
                  disabled
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 pl-10 pr-4 py-2.5 text-slate-500 cursor-not-allowed"
                  placeholder="seu@email.com"
                />
                <p className="mt-1 text-xs text-slate-500">O email não pode ser alterado</p>
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="mb-2 block text-sm font-medium text-slate-700">
                Telefone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  id="phone"
                  type="tel"
                  {...profileForm.register('phone')}
                  className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="+244 900 000 000"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={profileForm.formState.isSubmitting}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="h-4 w-4" />
                {profileForm.formState.isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Medium Tab */}
      {activeTab === 'medium' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900">Localização</h2>
            <p className="mt-1 text-sm text-slate-500">Informe sua província e município para receber alertas relevantes</p>
          </div>

          {profileSuccess && (
            <div className="mb-4 flex items-start gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
              <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>{profileSuccess}</span>
            </div>
          )}

          {profileError && (
            <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={onProfileSubmit} className="space-y-5">
            <div>
              <label htmlFor="province" className="mb-2 block text-sm font-medium text-slate-700">
                Província
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  id="province"
                  type="text"
                  {...profileForm.register('province')}
                  className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Ex: Luanda"
                />
              </div>
            </div>

            <div>
              <label htmlFor="municipality" className="mb-2 block text-sm font-medium text-slate-700">
                Município
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  id="municipality"
                  type="text"
                  {...profileForm.register('municipality')}
                  className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Ex: Belas"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={profileForm.formState.isSubmitting}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="h-4 w-4" />
                {profileForm.formState.isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Advanced Tab */}
      {activeTab === 'advanced' && (
        <div className="space-y-6">
          {/* Change Password */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="h-5 w-5 text-slate-600" />
                <h2 className="text-xl font-semibold text-slate-900">Alterar Senha</h2>
              </div>
              <p className="text-sm text-slate-500">Atualize sua senha para manter sua conta segura</p>
            </div>

            {passwordSuccess && (
              <div className="mb-4 flex items-start gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
                <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={onPasswordSubmit} className="space-y-5">
              <div>
                <label htmlFor="currentPassword" className="mb-2 block text-sm font-medium text-slate-700">
                  Senha Atual
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    id="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    {...passwordForm.register('currentPassword', { required: 'Senha atual é obrigatória' })}
                    className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-10 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="newPassword" className="mb-2 block text-sm font-medium text-slate-700">
                  Nova Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    {...passwordForm.register('newPassword', { required: 'Nova senha é obrigatória', minLength: { value: 6, message: 'A senha deve ter pelo menos 6 caracteres' } })}
                    className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-10 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-slate-700">
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    {...passwordForm.register('confirmPassword', { required: 'Confirmação de senha é obrigatória' })}
                    className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-10 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={passwordForm.formState.isSubmitting}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Lock className="h-4 w-4" />
                  {passwordForm.formState.isSubmitting ? 'Alterando...' : 'Alterar Senha'}
                </button>
              </div>
            </form>
          </div>

          {/* Account Info */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-slate-600" />
                <h2 className="text-xl font-semibold text-slate-900">Informações da Conta</h2>
              </div>
              <p className="text-sm text-slate-500">Detalhes sobre sua conta e permissões</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-slate-200">
                <span className="text-sm font-medium text-slate-700">Tipo de Conta</span>
                <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold">
                  {user.role}
                </span>
              </div>
              
              {user.verifiedAt && (
                <div className="flex items-center justify-between py-3 border-b border-slate-200">
                  <span className="text-sm font-medium text-slate-700">Verificado em</span>
                  <span className="text-sm text-slate-600">
                    {new Date(user.verifiedAt).toLocaleDateString('pt-AO')}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between py-3 border-b border-slate-200">
                <span className="text-sm font-medium text-slate-700">Membro desde</span>
                <span className="text-sm text-slate-600">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-AO') : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900">Histórico de Atividades</h2>
            <p className="mt-1 text-sm text-slate-500">Todas as suas contribuições e atividades na plataforma</p>
          </div>

          {loadingHistory ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-slate-600">Carregando histórico...</p>
            </div>
          ) : history ? (
            <div className="space-y-6">
              {/* Estatísticas */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{history.stats?.totalCases || 0}</p>
                  <p className="text-sm text-slate-600">Casos Reportados</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{history.stats?.totalSightings || 0}</p>
                  <p className="text-sm text-slate-600">Avistamentos</p>
                </div>
                <div className="p-4 bg-amber-50 rounded-lg">
                  <p className="text-2xl font-bold text-amber-600">{history.stats?.totalFavorites || 0}</p>
                  <p className="text-sm text-slate-600">Favoritos</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{history.stats?.totalBadges || 0}</p>
                  <p className="text-sm text-slate-600">Conquistas</p>
                </div>
              </div>

              {/* Casos Reportados */}
              {history.cases && history.cases.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Casos Reportados</h3>
                  <div className="space-y-3">
                    {history.cases.map((caseItem: any) => (
                      <div key={caseItem.id} className="flex items-center gap-4 p-3 border border-slate-200 rounded-lg">
                        {caseItem.photos[0] && (
                          <img src={caseItem.photos[0].url} alt={caseItem.fullName} className="w-16 h-16 rounded object-cover" />
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">{caseItem.fullName}</p>
                          <p className="text-sm text-slate-600">{new Date(caseItem.createdAt).toLocaleDateString('pt-AO')}</p>
                          <span className={`text-xs px-2 py-1 rounded ${caseItem.approved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                            {caseItem.approved ? 'Aprovado' : 'Pendente'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Avistamentos */}
              {history.sightings && history.sightings.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Avistamentos Reportados</h3>
                  <div className="space-y-3">
                    {history.sightings.map((sighting: any) => (
                      <div key={sighting.id} className="p-3 border border-slate-200 rounded-lg">
                        <p className="font-semibold text-slate-900">{sighting.missingPerson?.fullName}</p>
                        <p className="text-sm text-slate-600">{sighting.description}</p>
                        <p className="text-xs text-slate-500 mt-1">{new Date(sighting.createdAt).toLocaleDateString('pt-AO')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-center text-slate-600 py-12">Nenhum histórico disponível</p>
          )}
        </div>
      )}

      {/* Badges Tab */}
      {activeTab === 'badges' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900">Conquistas e Badges</h2>
            <p className="mt-1 text-sm text-slate-500">Suas recompensas por contribuir com a comunidade</p>
          </div>

          {loadingHistory ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : badges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {badges.map((badge: any) => (
                <div key={badge.id} className="p-4 border border-slate-200 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
                      <Award className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{getBadgeName(badge.badgeType)}</p>
                      <p className="text-xs text-slate-600">{badge.description}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Obtido em {new Date(badge.earnedAt).toLocaleDateString('pt-AO')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Award className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">Você ainda não possui conquistas</p>
              <p className="text-sm text-slate-500 mt-2">Continue contribuindo para ganhar badges!</p>
            </div>
          )}
        </div>
      )}

      {/* Authority Chat Tab */}
      {activeTab === 'authority-chat' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900">Chat com Autoridades</h2>
            <p className="mt-1 text-sm text-slate-500">Entre em contato direto com autoridades para reportar informações importantes</p>
          </div>

          {loadingHistory ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 mb-4">
                Selecione uma autoridade para iniciar uma conversa ou continue uma conversa existente.
              </p>
              {authorities.length > 0 ? (
                <div className="space-y-3">
                  {authorities.map((auth: any) => (
                    <div key={auth.id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">{auth.fullName}</p>
                          <p className="text-sm text-slate-600">{auth.role}</p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedAuthority(auth);
                            setShowChatModal(true);
                          }}
                          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
                        >
                          Iniciar Chat
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-600 py-8">Nenhuma autoridade disponível no momento</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Authority Chat Modal */}
      {showChatModal && selectedAuthority && (
        <AuthorityChatModal
          isOpen={showChatModal}
          onClose={() => {
            setShowChatModal(false);
            setSelectedAuthority(null);
          }}
          authorityId={selectedAuthority.id}
          authorityName={selectedAuthority.fullName}
        />
      )}
    </div>
  );
}

function getBadgeName(badgeType: string): string {
  const names: Record<string, string> = {
    FIRST_CASE: 'Primeiro Caso',
    ACTIVE_CONTRIBUTOR: 'Colaborador Ativo',
    HELPER: 'Ajudante',
    VERIFIED: 'Verificado',
    TOP_REPORTER: 'Top Reporter',
    COMMUNITY_HERO: 'Herói da Comunidade',
  };
  return names[badgeType] || badgeType;
}

