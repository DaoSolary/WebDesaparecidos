import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../store/useAuth';
import { api } from '../../api/client';
import { 
  Search, 
  Plus, 
  Heart, 
  Share2, 
  MapPin, 
  Filter,
  Bell,
  MessageSquare,
  Eye,
  Calendar,
  User,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { ShareButtons } from '../ShareButtons';
import { initSocket, onChatMessage, onNotification } from '../../services/socket';
import { ANGOLA_PROVINCES } from '../../utils/provinces';

type MissingPerson = {
  id: string;
  fullName: string;
  age?: number;
  gender?: string;
  missingDate: string;
  lastSeenLocation: string;
  province: string;
  municipality?: string;
  priority: string;
  status: string;
  approved: boolean;
  photos: Array<{ url: string }>;
};

export function CitizenDashboard() {
  const { user } = useAuth();
  const [cases, setCases] = useState<MissingPerson[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [messageCount, setMessageCount] = useState(0);
  const [myCases, setMyCases] = useState<MissingPerson[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    province: '',
    gender: '',
    status: '',
    priority: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  } | null>(null);
  const itemsPerPage = 9; // 9 casos por página para usuários comuns

  useEffect(() => {
    loadCases();
    loadFavorites();
    if (user) {
      loadMyCases();
    }
  }, [user]);

  useEffect(() => {
    // Configurar Socket.IO para notificações em tempo real
    if (user) {
      initSocket(user.id, user.role);
      
      // Escutar novas mensagens de chat
      const handleChatMessage = (data: any) => {
        // Verificar se a mensagem é de um caso do usuário
        setMyCases((currentCases) => {
          if (currentCases.some(c => c.id === data.caseId)) {
            setMessageCount(prev => prev + 1);
          }
          return currentCases;
        });
      };
      
      // Escutar notificações
      const handleNotification = (notification: any) => {
        if (notification.type === 'new_chat_message') {
          setMessageCount(prev => prev + 1);
        }
      };
      
      onChatMessage(handleChatMessage);
      onNotification(handleNotification);
    }
  }, [user]);
  
  const loadMyCases = async () => {
    try {
      const { data } = await api.get('/missing-persons');
      const myCasesList = (data.items || []).filter((c: MissingPerson) => 
        c.reporterId === user?.id || (c.reporter && c.reporter.email === user?.email)
      );
      setMyCases(myCasesList);
      
      // Contar mensagens (simulado - em produção, buscar do backend)
      // Por enquanto, vamos usar um contador baseado em notificações
    } catch (error) {
      console.error('Erro ao carregar meus casos:', error);
    }
  };

  const loadCases = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.province) params.append('province', filters.province);
      if (filters.gender) params.append('gender', filters.gender);
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (searchTerm) params.append('name', searchTerm);
      params.append('page', String(currentPage));
      params.append('limit', String(itemsPerPage));

      const { data } = await api.get(`/missing-persons?${params.toString()}`);
      setCases(data.items || []);
      setPagination(data.pagination || null);
    } catch (error) {
      console.error('Erro ao carregar casos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const { data } = await api.get('/favorites');
      setFavorites(new Set(data.favorites?.map((f: any) => f.missingPersonId) || []));
    } catch (error) {
      // Favoritos podem não existir ainda
    }
  };

  const toggleFavorite = async (caseId: string) => {
    try {
      if (favorites.has(caseId)) {
        await api.delete(`/favorites/${caseId}`);
        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(caseId);
          return newSet;
        });
      } else {
        await api.post('/favorites', { missingPersonId: caseId });
        setFavorites(prev => new Set(prev).add(caseId));
      }
    } catch (error) {
      console.error('Erro ao atualizar favorito:', error);
    }
  };


  useEffect(() => {
    setCurrentPage(1); // Resetar para primeira página quando filtros ou busca mudarem
    loadCases();
  }, [filters, searchTerm]);

  // Recarregar quando a página mudar
  useEffect(() => {
    loadCases();
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && pagination && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Casos já vêm filtrados do backend (apenas aprovados)
  const filteredCases = cases;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Bem-vindo, {user?.fullName}
          </h1>
          <p className="mt-1 text-slate-600">
            Plataforma de Pessoas Desaparecidas em Angola
          </p>
        </div>
        <Link
          to="/casos/novo"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Reportar Desaparecimento
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-100 p-2">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{pagination?.total || filteredCases.length}</p>
              <p className="text-sm text-slate-600">Casos Ativos</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-red-100 p-2">
              <Heart className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{favorites.size}</p>
              <p className="text-sm text-slate-600">Favoritos</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-green-100 p-2">
              <Bell className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">0</p>
              <p className="text-sm text-slate-600">Notificações</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-amber-100 p-2">
              <MessageSquare className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{messageCount}</p>
              <p className="text-sm text-slate-600">Mensagens</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar por nome ou localização..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filters.province}
              onChange={(e) => setFilters({ ...filters, province: e.target.value })}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Todas Províncias</option>
              {ANGOLA_PROVINCES.map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
            <select
              value={filters.gender}
              onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Todos</option>
              <option value="MASCULINO">Masculino</option>
              <option value="FEMININO">Feminino</option>
              <option value="OUTRO">Outro</option>
            </select>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Todas Prioridades</option>
              <option value="URGENTE">Urgente</option>
              <option value="CRIANCA">Criança</option>
              <option value="IDOSO">Idoso</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cases Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Carregando casos...</p>
        </div>
      ) : filteredCases.length === 0 ? (
        <div className="text-center py-12 rounded-lg border border-slate-200 bg-white">
          <p className="text-slate-600">Nenhum caso encontrado.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCases.map((caseItem) => (
            <div
              key={caseItem.id}
              className="rounded-lg border border-slate-200 bg-white overflow-hidden hover:shadow-lg transition-shadow"
            >
              {caseItem.photos[0] && (
                <div className="aspect-video overflow-hidden bg-slate-100">
                  <img
                    src={caseItem.photos[0].url}
                    alt={caseItem.fullName}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-slate-900">{caseItem.fullName}</h3>
                    {caseItem.age && (
                      <p className="text-sm text-slate-600">{caseItem.age} anos</p>
                    )}
                  </div>
                  <button
                    onClick={() => toggleFavorite(caseItem.id)}
                    className={`p-1.5 rounded transition-colors ${
                      favorites.has(caseItem.id)
                        ? 'text-red-600 hover:bg-red-50'
                        : 'text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    <Heart className={`h-5 w-5 ${favorites.has(caseItem.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>
                
                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center gap-1.5 text-sm text-slate-600">
                    <MapPin className="h-4 w-4" />
                    <span>{caseItem.lastSeenLocation}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-slate-600">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(caseItem.missingDate).toLocaleDateString('pt-AO')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    caseItem.priority === 'URGENTE' ? 'bg-red-100 text-red-700' :
                    caseItem.priority === 'CRIANCA' ? 'bg-amber-100 text-amber-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {caseItem.priority}
                  </span>
                  <span className="px-2 py-1 rounded bg-slate-100 text-slate-700 text-xs font-semibold">
                    {caseItem.status}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Link
                    to={`/casos/${caseItem.id}`}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    Ver Detalhes
                  </Link>
                  <div className="flex items-center justify-center">
                    <ShareButtons caseData={caseItem} />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Paginação */}
          {pagination && pagination.totalPages > 1 && (
            <div className="col-span-full flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!pagination.hasPrevPage}
                className={`flex items-center gap-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                  pagination.hasPrevPage
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => {
                  // Mostrar apenas algumas páginas ao redor da página atual
                  if (
                    pageNum === 1 ||
                    pageNum === pagination.totalPages ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                          pageNum === currentPage
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                    return <span key={pageNum} className="px-2 text-slate-500">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className={`flex items-center gap-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                  pagination.hasNextPage
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                Próxima
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {pagination && (
            <div className="col-span-full text-center text-sm text-slate-500 mt-4">
              Mostrando {filteredCases.length} de {pagination.total} casos (Página {pagination.page} de {pagination.totalPages})
            </div>
          )}
        </div>
      )}
    </div>
  );
}

