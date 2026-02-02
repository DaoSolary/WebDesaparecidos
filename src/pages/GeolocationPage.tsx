import { useState, useEffect } from 'react';
import { useAuth } from '../store/useAuth';
import { api } from '../api/client';
import { HeatmapMap } from '../components/HeatmapMap';
import { MapPin, BarChart3, Filter } from 'lucide-react';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { ANGOLA_PROVINCES } from '../utils/provinces';

type MissingPerson = {
  id: string;
  fullName: string;
  lastSeenLocation: string;
  province: string;
  municipality?: string;
  missingDate: string;
  createdAt: string;
  status: string;
  approved?: boolean;
  lastSignalLat?: number;
  lastSignalLng?: number;
};

type ProvinceStats = {
  province: string;
  count: number;
  lat: number;
  lng: number;
};

export function GeolocationPage() {
  const { user } = useAuth();
  const [cases, setCases] = useState<MissingPerson[]>([]);
  const [allApprovedCases, setAllApprovedCases] = useState<MissingPerson[]>([]);
  const [provinceStats, setProvinceStats] = useState<ProvinceStats[]>([]);
  const [stats, setStats] = useState({
    totalCases: 0,
    criticalProvinces: 0,
    lastUpdate: null as Date | null,
  });
  const [filter, setFilter] = useState({
    province: '',
    status: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllCases();
  }, [filter]);

  const loadAllCases = async () => {
    try {
      setLoading(true);
      // Construir parâmetros de busca com filtros
      const params = new URLSearchParams();
      params.append('page', '1');
      params.append('limit', '10000'); // Limite alto para pegar todos
      
      if (filter.province) {
        params.append('province', filter.province);
      }
      
      if (filter.status) {
        params.append('status', filter.status);
      }
      
      // Buscar casos aprovados com filtros aplicados
      const { data } = await api.get(`/missing-persons?${params.toString()}`);
      
      const allCases = (data.items || []).filter((c: any) => c.approved === true);
      
      // Adicionar coordenadas baseadas na província
      const casesWithCoords = allCases.map((c: any) => {
        const coords = getProvinceCoords(c.province);
        return {
          ...c,
          lastSignalLat: coords.lat,
          lastSignalLng: coords.lng,
        };
      });
      
      setAllApprovedCases(casesWithCoords);
      setCases(casesWithCoords); // Atualizar casos filtrados também
      
      // Para estatísticas, buscar TODOS os casos aprovados (sem filtros)
      const statsParams = new URLSearchParams();
      statsParams.append('page', '1');
      statsParams.append('limit', '10000');
      
      const { data: statsData } = await api.get(`/missing-persons?${statsParams.toString()}`);
      const allApprovedForStats = (statsData.items || []).filter((c: any) => c.approved === true);
      
      // Calcular estatísticas por província com TODOS os casos
      calculateProvinceStats(allApprovedForStats.map((c: any) => {
        const coords = getProvinceCoords(c.province);
        return {
          ...c,
          lastSignalLat: coords.lat,
          lastSignalLng: coords.lng,
        };
      }));
      
      // Calcular estatísticas gerais com TODOS os casos
      const lastUpdate = allApprovedForStats.length > 0
        ? new Date(Math.max(...allApprovedForStats.map((c: any) => {
            const dateStr = c.createdAt || c.missingDate;
            return new Date(dateStr).getTime();
          })))
        : null;
      
      setStats({
        totalCases: allApprovedForStats.length,
        criticalProvinces: new Set(allApprovedForStats.map((c: any) => c.province)).size,
        lastUpdate,
      });
    } catch (error) {
      console.error('Erro ao carregar casos:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProvinceStats = (casesList: MissingPerson[]) => {
    // Agrupar casos por província
    const provinceCounts: Record<string, number> = {};
    casesList.forEach((c) => {
      if (c.province) {
        provinceCounts[c.province] = (provinceCounts[c.province] || 0) + 1;
      }
    });

    // Criar array de estatísticas por província com coordenadas
    const stats: ProvinceStats[] = Object.entries(provinceCounts).map(([province, count]) => {
      const coords = getProvinceCoords(province);
      return {
        province,
        count,
        lat: coords.lat,
        lng: coords.lng,
      };
    });

    // Ordenar por quantidade (mais casos primeiro)
    stats.sort((a, b) => b.count - a.count);
    setProvinceStats(stats);
  };

  // Coordenadas aproximadas das províncias de Angola
  const getProvinceCoords = (province: string): { lat: number; lng: number } => {
    const coords: Record<string, { lat: number; lng: number }> = {
      'Luanda': { lat: -8.8383, lng: 13.2344 },
      'Benguela': { lat: -12.5763, lng: 13.4055 },
      'Huíla': { lat: -14.9281, lng: 13.5795 },
      'Huambo': { lat: -12.7761, lng: 15.7393 },
      'Bié': { lat: -12.3586, lng: 16.9706 },
      'Malanje': { lat: -9.5402, lng: 16.3410 },
      'Uíge': { lat: -7.6087, lng: 15.0613 },
      'Zaire': { lat: -6.2670, lng: 12.3500 },
      'Cabinda': { lat: -5.5500, lng: 12.2000 },
      'Cuanza-Norte': { lat: -9.3000, lng: 14.9000 },
      'Cuanza-Sul': { lat: -10.2000, lng: 15.1000 },
      'Cuando-Cubango': { lat: -16.2000, lng: 18.0000 },
      'Cunene': { lat: -16.5000, lng: 15.5000 },
      'Lunda-Norte': { lat: -8.5000, lng: 20.5000 },
      'Lunda-Sul': { lat: -10.5000, lng: 20.5000 },
      'Moxico': { lat: -11.5000, lng: 20.0000 },
      'Namibe': { lat: -15.2000, lng: 12.1500 },
      'Bengo': { lat: -9.0000, lng: 13.5000 },
    };
    return coords[province] || { lat: -12.3500, lng: 17.3500 }; // Centro de Angola como padrão
  };

  return (
    <ProtectedRoute allowedRoles={['AUTORIDADE', 'ADMIN', 'MODERADOR']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Geolocalização Inteligente</h1>
          <p className="mt-1 text-slate-600">
            Heatmap, últimas coordenadas e áreas sugeridas de busca
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-slate-400" />
              <span className="text-sm font-medium text-slate-700">Filtros:</span>
            </div>
            <select
              value={filter.province}
              onChange={(e) => setFilter({ ...filter, province: e.target.value })}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Todas as Províncias</option>
              {ANGOLA_PROVINCES.map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Todos os Status</option>
              <option value="ABERTO">Aberto</option>
              <option value="EM_INVESTIGACAO">Em Investigação</option>
              <option value="AVISTADO">Avistado</option>
              <option value="ENCONTRADO">Encontrado</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <>
            <HeatmapMap cases={allApprovedCases} provinceStats={provinceStats} />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-3 mb-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-slate-900">Casos no Mapa</h3>
                </div>
                <p className="text-2xl font-bold text-slate-900">{stats.totalCases}</p>
                <p className="text-sm text-slate-600">Total de casos publicados</p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-slate-900">Áreas Críticas</h3>
                </div>
                <p className="text-2xl font-bold text-slate-900">{stats.criticalProvinces}</p>
                <p className="text-sm text-slate-600">Províncias com casos reportados</p>
                {provinceStats.length > 0 && (
                  <p className="text-xs text-slate-500 mt-1">
                    Top: {provinceStats[0].province} ({provinceStats[0].count} casos)
                  </p>
                )}
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-3 mb-2">
                  <MapPin className="h-5 w-5 text-amber-600" />
                  <h3 className="font-semibold text-slate-900">Última Atualização</h3>
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.lastUpdate 
                    ? stats.lastUpdate.toLocaleDateString('pt-AO')
                    : 'N/A'
                  }
                </p>
                <p className="text-sm text-slate-600">Data da última publicação</p>
              </div>
            </div>

            {/* Top Províncias */}
            {provinceStats.length > 0 && (
              <div className="rounded-lg border border-slate-200 bg-white p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Casos por Província</h3>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {provinceStats.slice(0, 9).map((stat) => (
                    <div key={stat.province} className="flex items-center justify-between p-3 rounded-lg border border-slate-100">
                      <span className="font-medium text-slate-900">{stat.province}</span>
                      <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                        {stat.count} {stat.count === 1 ? 'caso' : 'casos'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}

