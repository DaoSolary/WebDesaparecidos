import { useState, useEffect } from 'react';
import { useAuth } from '../../store/useAuth';
import { api } from '../../api/client';
import { FileText, User, Calendar, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

type LogEntry = {
  id: string;
  action: string;
  user: {
    name: string;
    email: string;
    role: string;
  } | null;
  timestamp: string;
  details: string;
  type: 'create' | 'update' | 'delete' | 'approve' | 'reject' | 'other';
};

type PaginationInfo = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export function ActivityLogsPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState({
    type: '',
    date: '',
  });

  useEffect(() => {
    loadLogs();
  }, [filter, currentPage]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', String(currentPage));
      params.append('limit', '10');
      if (filter.type) params.append('type', filter.type);
      if (filter.date) params.append('date', filter.date);

      const { data } = await api.get(`/admin/logs?${params.toString()}`);
      setLogs(data.logs || []);
      setPagination(data.pagination || null);
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'create':
        return 'bg-blue-100 text-blue-700';
      case 'update':
        return 'bg-amber-100 text-amber-700';
      case 'delete':
        return 'bg-red-100 text-red-700';
      case 'approve':
        return 'bg-green-100 text-green-700';
      case 'reject':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Logs de Atividade</h1>
        <p className="mt-1 text-slate-600">Registro de todas as ações realizadas na plataforma</p>
      </div>

      {/* Filtros */}
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-slate-400" />
            <span className="text-sm font-medium text-slate-700">Filtros:</span>
          </div>
          <select
            value={filter.type}
            onChange={(e) => {
              setFilter({ ...filter, type: e.target.value });
              setCurrentPage(1);
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Todos os Tipos</option>
            <option value="create">Criar</option>
            <option value="update">Atualizar</option>
            <option value="delete">Deletar</option>
            <option value="approve">Aprovar</option>
            <option value="reject">Rejeitar</option>
          </select>
          <input
            type="date"
            value={filter.date}
            onChange={(e) => {
              setFilter({ ...filter, date: e.target.value });
              setCurrentPage(1);
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Lista de Logs */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Carregando logs...</p>
        </div>
      ) : (
        <>
          <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
            <div className="divide-y divide-slate-200">
              {logs.length === 0 ? (
                <div className="p-8 text-center text-slate-600">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                  <p>Nenhum log encontrado</p>
                </div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${getTypeColor(log.type)}`}>
                            {log.type.toUpperCase()}
                          </span>
                          <p className="font-semibold text-slate-900">{log.action}</p>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{log.details}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          {log.user ? (
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {log.user.name} ({log.user.role})
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              Sistema
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(log.timestamp).toLocaleString('pt-AO')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Paginação */}
          {pagination && (
            <div className="flex items-center justify-center px-4 py-4 border-t border-slate-200 bg-white rounded-lg">
              <p className="text-sm text-slate-600">
                Mostrando {logs.length} de {pagination.total} logs
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

