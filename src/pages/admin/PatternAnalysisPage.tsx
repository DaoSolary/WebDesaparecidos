import { useState, useEffect } from 'react';
import { useAuth } from '../../store/useAuth';
import { api } from '../../api/client';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  MapPin, 
  Clock,
  Users,
  Calendar
} from 'lucide-react';

type Pattern = {
  type: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  location?: string;
  frequency: number;
  trend: 'increasing' | 'decreasing' | 'stable';
};

export function PatternAnalysisPage() {
  const { user } = useAuth();
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatterns();
  }, []);

  const loadPatterns = async () => {
    setLoading(true);
    try {
      // Buscar casos para análise
      const { data: casesData } = await api.get('/missing-persons', {
        params: { page: 1, limit: 1000 },
      });
      
      const cases = casesData.items || [];
      
      // Análise de padrões
      const detectedPatterns: Pattern[] = [];
      
      // Padrão 1: Províncias com mais casos
      const provinceCounts: Record<string, number> = {};
      cases.forEach((c: any) => {
        if (c.province) {
          provinceCounts[c.province] = (provinceCounts[c.province] || 0) + 1;
        }
      });
      
      const topProvince = Object.entries(provinceCounts)
        .sort(([, a], [, b]) => b - a)[0];
      
      if (topProvince && topProvince[1] > 5) {
        detectedPatterns.push({
          type: 'hotspot',
          description: `Alta concentração de casos em ${topProvince[0]}`,
          severity: topProvince[1] > 20 ? 'high' : 'medium',
          location: topProvince[0],
          frequency: topProvince[1],
          trend: 'increasing',
        });
      }
      
      // Padrão 2: Casos não resolvidos há muito tempo
      const oldCases = cases.filter((c: any) => {
        const createdAt = new Date(c.createdAt);
        const daysSince = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
        return daysSince > 30 && c.status !== 'ENCONTRADO' && c.status !== 'ENCERRADO';
      });
      
      if (oldCases.length > 10) {
        detectedPatterns.push({
          type: 'stale_cases',
          description: `${oldCases.length} casos não resolvidos há mais de 30 dias`,
          severity: 'high',
          frequency: oldCases.length,
          trend: 'increasing',
        });
      }
      
      // Padrão 3: Horários de pico
      const hourCounts: Record<number, number> = {};
      cases.forEach((c: any) => {
        const hour = new Date(c.createdAt).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      });
      
      const peakHour = Object.entries(hourCounts)
        .sort(([, a], [, b]) => b - a)[0];
      
      if (peakHour) {
        detectedPatterns.push({
          type: 'peak_time',
          description: `Maior número de casos reportados às ${peakHour[0]}:00`,
          severity: 'low',
          frequency: peakHour[1],
          trend: 'stable',
        });
      }
      
      setPatterns(detectedPatterns);
    } catch (error) {
      console.error('Erro ao analisar padrões:', error);
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">Acesso negado. Apenas administradores podem acessar esta página.</p>
      </div>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Análise de Padrões</h1>
        <p className="mt-1 text-slate-600">Detecção inteligente de padrões e tendências</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Analisando padrões...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {patterns.map((pattern, index) => (
            <div
              key={index}
              className={`rounded-lg border p-6 ${getSeverityColor(pattern.severity)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-5 w-5" />
                    <h3 className="font-semibold">{pattern.description}</h3>
                  </div>
                  {pattern.location && (
                    <p className="text-sm flex items-center gap-1 mb-2">
                      <MapPin className="h-4 w-4" />
                      {pattern.location}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      Frequência: {pattern.frequency}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Tendência: {pattern.trend === 'increasing' ? 'Aumentando' : pattern.trend === 'decreasing' ? 'Diminuindo' : 'Estável'}
                    </span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded text-xs font-semibold ${getSeverityColor(pattern.severity)}`}>
                  {pattern.severity.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


