import { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, Calendar, BarChart3 } from 'lucide-react';
import { api } from '../../api/client';

type DailyReport = {
  date: string;
  total: number;
  pending: number;
  in_analysis: number;
  accepted: number;
  rejected: number;
};

type TopReported = {
  caseId: string;
  case: {
    id: string;
    fullName: string;
    province: string;
  } | null;
  reportCount: number;
};

export function ReportsFlowPage() {
  const [dailyFlow, setDailyFlow] = useState<DailyReport[]>([]);
  const [topReported, setTopReported] = useState<TopReported[]>([]);
  const [stats, setStats] = useState({
    totalReports: 0,
    byStatus: {} as Record<string, number>,
  });
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    loadData();
  }, [days]);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/reports/daily-flow?days=${days}`);
      setDailyFlow(data.dailyFlow || []);
      setTopReported(data.topReported || []);
      setStats({
        totalReports: data.totalReports || 0,
        byStatus: data.byStatus || {},
      });
    } catch (error: any) {
      console.error('Erro ao carregar fluxo de denúncias:', error);
      alert('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Carregando fluxo de denúncias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Fluxo de Denúncias</h1>
        <p className="mt-2 text-slate-600">Acompanhe as denúncias recebidas por dia</p>
      </div>

      {/* Filtros */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">Período (dias)</label>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="px-4 py-2 rounded-lg border border-slate-300 bg-white"
        >
          <option value={7}>Últimos 7 dias</option>
          <option value={30}>Últimos 30 dias</option>
          <option value={90}>Últimos 90 dias</option>
          <option value={365}>Último ano</option>
        </select>
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Total de Denúncias</p>
          <p className="text-2xl font-bold text-slate-900">{stats.totalReports}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Pendentes</p>
          <p className="text-2xl font-bold text-amber-600">{stats.byStatus.PENDENTE || 0}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Aceitas</p>
          <p className="text-2xl font-bold text-green-600">{stats.byStatus.ACEITE || 0}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Rejeitadas</p>
          <p className="text-2xl font-bold text-red-600">{stats.byStatus.REJEITADO || 0}</p>
        </div>
      </div>

      {/* Gráfico de Fluxo Diário */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Denúncias por Dia</h2>
        <div className="space-y-2">
          {dailyFlow.length === 0 ? (
            <p className="text-center text-slate-500 py-8">Nenhum dado disponível</p>
          ) : (
            dailyFlow.map((day) => (
              <div key={day.date} className="flex items-center gap-4">
                <div className="w-24 text-sm text-slate-600">
                  {new Date(day.date).toLocaleDateString('pt-AO', { day: '2-digit', month: 'short' })}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="bg-blue-600 h-6 rounded"
                      style={{ width: `${(day.total / Math.max(...dailyFlow.map((d) => d.total))) * 100}%` }}
                    />
                    <span className="text-sm font-semibold text-slate-900">{day.total}</span>
                  </div>
                  <div className="flex gap-4 mt-1 text-xs text-slate-500">
                    <span>Pend: {day.pending}</span>
                    <span>Análise: {day.in_analysis}</span>
                    <span>Aceitas: {day.accepted}</span>
                    <span>Rejeitadas: {day.rejected}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Top Casos Mais Denunciados */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Casos Mais Denunciados</h2>
        {topReported.length === 0 ? (
          <p className="text-center text-slate-500 py-8">Nenhum caso denunciado</p>
        ) : (
          <div className="space-y-3">
            {topReported.map((item, index) => (
              <div key={item.caseId} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">
                      {item.case?.fullName || 'Caso não encontrado'}
                    </p>
                    <p className="text-sm text-slate-600">{item.case?.province || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 rounded bg-red-100 text-red-700 font-semibold">
                    {item.reportCount} denúncia(s)
                  </span>
                  {item.case && (
                    <a
                      href={`/casos/${item.case.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Ver caso →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}








