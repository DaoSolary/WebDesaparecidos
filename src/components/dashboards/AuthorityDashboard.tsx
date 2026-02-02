import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../store/useAuth';
import { api } from '../../api/client';
import { MapPin, BarChart3, Users, Search, FileText } from 'lucide-react';
import { HeatmapMap } from '../HeatmapMap';

type MissingPerson = {
  id: string;
  fullName: string;
  age?: number;
  gender?: string;
  missingDate: string;
  lastSeenLocation: string;
  province: string;
  status: string;
  reporter: { fullName: string; email: string; phone?: string };
  photos: Array<{ url: string }>;
};

export function AuthorityDashboard() {
  const { user } = useAuth();
  const [cases, setCases] = useState<MissingPerson[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    porProvincia: {} as Record<string, number>,
    porStatus: {} as Record<string, number>,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCases();
    loadStats();
  }, []);

  const loadCases = async () => {
    try {
      const { data } = await api.get('/missing-persons?status=EM_INVESTIGACAO,ABERTO');
      setCases(data.items || []);
    } catch (error) {
      console.error('Erro ao carregar casos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { data } = await api.get('/stats/authorities');
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Painel de Autoridades</h1>
        <p className="mt-1 text-slate-600">Ferramentas de investigação e análise</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-100 p-2">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              <p className="text-sm text-slate-600">Total de Casos</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-green-100 p-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {Object.keys(stats.porProvincia).length}
              </p>
              <p className="text-sm text-slate-600">Províncias</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-amber-100 p-2">
              <FileText className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{cases.length}</p>
              <p className="text-sm text-slate-600">Em Investigação</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-red-100 p-2">
              <MapPin className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">0</p>
              <p className="text-sm text-slate-600">Heatmaps</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cases List */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Casos em Investigação</h2>
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : cases.length === 0 ? (
          <p className="text-slate-600 text-center py-8">Nenhum caso em investigação.</p>
        ) : (
          <div className="space-y-4">
            {cases.map((caseItem) => (
              <div
                key={caseItem.id}
                className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-4 flex-1">
                    {caseItem.photos[0] && (
                      <img
                        src={caseItem.photos[0].url}
                        alt={caseItem.fullName}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{caseItem.fullName}</h3>
                      <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-slate-500">Localização</p>
                          <p className="font-medium">{caseItem.lastSeenLocation}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Reporter</p>
                          <p className="font-medium">{caseItem.reporter?.fullName || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Data</p>
                          <p className="font-medium">
                            {new Date(caseItem.missingDate).toLocaleDateString('pt-AO')}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500">Status</p>
                          <p className="font-medium">{caseItem.status}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Link
                    to={`/casos/${caseItem.id}`}
                    className="ml-4 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Ver Detalhes
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Heatmap */}
      {cases.length > 0 && (
        <div className="mt-6">
          <HeatmapMap cases={cases} />
        </div>
      )}
    </div>
  );
}

