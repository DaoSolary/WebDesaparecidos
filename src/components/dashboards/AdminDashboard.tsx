import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../store/useAuth';
import { api } from '../../api/client';
import { 
  Users, 
  FileText, 
  BarChart3, 
  Settings, 
  Shield,
  AlertTriangle,
  TrendingUp,
  MapPin,
  AlertCircle,
  Award,
  Trash2,
  Database,
  Megaphone,
  Bell
} from 'lucide-react';

export function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCases: 0,
    resolvedCases: 0,
    casesByProvince: {} as Record<string, number>,
    casesByMonth: [] as Array<{ month: string; count: number }>,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data } = await api.get('/admin/stats');
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const resolutionRate = stats.totalCases > 0 
    ? ((stats.resolvedCases / stats.totalCases) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Painel Administrativo</h1>
        <p className="mt-1 text-slate-600">Gestão completa da plataforma</p>
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-full bg-blue-100 p-2">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-sm text-slate-600">Total de Usuários</p>
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.totalUsers}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-full bg-green-100 p-2">
              <FileText className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-sm text-slate-600">Total de Casos</p>
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.totalCases}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-full bg-amber-100 p-2">
              <TrendingUp className="h-5 w-5 text-amber-600" />
            </div>
            <p className="text-sm text-slate-600">Taxa de Resolução</p>
          </div>
          <p className="text-3xl font-bold text-slate-900">{resolutionRate}%</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-full bg-red-100 p-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <p className="text-sm text-slate-600">Casos Resolvidos</p>
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.resolvedCases}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Casos por Província
          </h2>
          <div className="space-y-3">
            {Object.entries(stats.casesByProvince)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([province, count]) => (
                <div key={province} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-700">{province}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${(count / Math.max(...Object.values(stats.casesByProvince))) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="font-semibold text-slate-900 w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Casos por Mês
          </h2>
          <div className="space-y-3">
            {stats.casesByMonth.slice(-6).map((item) => (
              <div key={item.month} className="flex items-center justify-between">
                <span className="text-slate-700">{item.month}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${(item.count / Math.max(...stats.casesByMonth.map(m => m.count), 1)) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="font-semibold text-slate-900 w-8 text-right">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Ações Rápidas</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link
            to="/admin/usuarios"
            className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-blue-300 transition-colors"
          >
            <Users className="h-5 w-5 text-blue-600" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Gerir Usuários</p>
              <p className="text-sm text-slate-600">Criar e editar contas</p>
            </div>
          </Link>
          <Link
            to="/admin/permissoes"
            className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-green-300 transition-colors"
          >
            <Shield className="h-5 w-5 text-green-600" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Permissões</p>
              <p className="text-sm text-slate-600">Gerir roles e acesso</p>
            </div>
          </Link>
          <Link
            to="/admin/configuracoes"
            className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-amber-300 transition-colors"
          >
            <Settings className="h-5 w-5 text-amber-600" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Configurações</p>
              <p className="text-sm text-slate-600">Configurar plataforma</p>
            </div>
          </Link>
          <Link
            to="/admin/relatorios"
            className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-purple-300 transition-colors"
          >
            <FileText className="h-5 w-5 text-purple-600" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Relatórios</p>
              <p className="text-sm text-slate-600">Análises e exportações</p>
            </div>
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-4">
          <Link
            to="/admin/analise-padroes"
            className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-indigo-300 transition-colors"
          >
            <BarChart3 className="h-5 w-5 text-indigo-600" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Análise de Padrões</p>
              <p className="text-sm text-slate-600">Detecção inteligente</p>
            </div>
          </Link>
          <Link
            to="/admin/logs"
            className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors"
          >
            <FileText className="h-5 w-5 text-slate-600" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Logs de Atividade</p>
              <p className="text-sm text-slate-600">Registro de ações</p>
            </div>
          </Link>
          <Link
            to="/admin/badges"
            className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-amber-300 transition-colors"
          >
            <Award className="h-5 w-5 text-amber-600" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Conquistas e Badges</p>
              <p className="text-sm text-slate-600">Outorgar badges aos usuários</p>
            </div>
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-4">
          <Link
            to="/admin/duplicados"
            className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-red-300 transition-colors"
          >
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Casos Duplicados</p>
              <p className="text-sm text-slate-600">Detectar e excluir</p>
            </div>
          </Link>
          <Link
            to="/admin/denuncias-fluxo"
            className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-orange-300 transition-colors"
          >
            <TrendingUp className="h-5 w-5 text-orange-600" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Fluxo de Denúncias</p>
              <p className="text-sm text-slate-600">Estatísticas diárias</p>
            </div>
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-4">
          <Link
            to="/admin/conteudo-institucional"
            className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-indigo-300 transition-colors"
          >
            <FileText className="h-5 w-5 text-indigo-600" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Conteúdo Institucional</p>
              <p className="text-sm text-slate-600">FAQs e instruções</p>
            </div>
          </Link>
          <Link
            to="/admin/configuracoes-sistema"
            className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-cyan-300 transition-colors"
          >
            <Settings className="h-5 w-5 text-cyan-600" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Configurações</p>
              <p className="text-sm text-slate-600">Limites de uso</p>
            </div>
          </Link>
          <Link
            to="/admin/casos-deletados"
            className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-rose-300 transition-colors"
          >
            <Trash2 className="h-5 w-5 text-rose-600" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Casos Deletados</p>
              <p className="text-sm text-slate-600">Restaurar casos</p>
            </div>
          </Link>
          <Link
            to="/admin/backups"
            className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-violet-300 transition-colors"
          >
            <Database className="h-5 w-5 text-violet-600" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Backups</p>
              <p className="text-sm text-slate-600">Gerenciar backups</p>
            </div>
          </Link>
          <Link
            to="/admin/comunicados"
            className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-pink-300 transition-colors"
          >
            <Megaphone className="h-5 w-5 text-pink-600" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Comunicados Globais</p>
              <p className="text-sm text-slate-600">Enviar notícias e alertas</p>
            </div>
          </Link>
          <Link
            to="/admin/notificacoes"
            className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-cyan-300 transition-colors"
          >
            <Bell className="h-5 w-5 text-cyan-600" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Notificações</p>
              <p className="text-sm text-slate-600">Configurar notificações</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

