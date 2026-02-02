import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { ArrowLeft, User, Calendar, MapPin, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

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
  photos: { url: string }[];
};

type UserInfo = {
  id: string;
  fullName: string;
};

type PaginationInfo = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export function UserCasesPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [cases, setCases] = useState<MissingPerson[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 9;

  useEffect(() => {
    if (userId) {
      loadUserCases();
    }
  }, [userId, currentPage]);

  const loadUserCases = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/users/${userId}/cases`, {
        params: {
          page: currentPage,
          limit: itemsPerPage,
        },
      });
      setUser(response.data.user);
      setCases(response.data.cases || []);
      setPagination(response.data.pagination || null);
    } catch (error) {
      console.error('Erro ao carregar casos do usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && pagination && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/rede-colaborativa')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Casos de {user?.fullName || 'Usuário'}
          </h1>
          <p className="mt-1 text-slate-600">
            Casos reportados por este membro da rede
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : cases.length === 0 ? (
        <div className="text-center py-12 rounded-lg border border-slate-200 bg-white">
          <User className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">Este usuário ainda não reportou nenhum caso.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {cases.map((caseItem) => (
              <Link
                key={caseItem.id}
                to={`/casos/${caseItem.id}`}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-blue-500 transition-colors"
              >
                <div className="aspect-video overflow-hidden rounded-lg bg-slate-100 mb-3">
                  {caseItem.photos[0] ? (
                    <img
                      src={caseItem.photos[0].url}
                      alt={caseItem.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <User className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold text-slate-900">{caseItem.fullName}</p>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                      {caseItem.priority}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-slate-600">
                    <MapPin className="h-4 w-4" />
                    <span>{caseItem.province}</span>
                    {caseItem.municipality && <span>• {caseItem.municipality}</span>}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-slate-600">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(caseItem.missingDate).toLocaleDateString('pt-AO')}</span>
                  </div>
                  <div className="text-xs font-semibold text-amber-600">{caseItem.status}</div>
                </div>
              </Link>
            ))}
          </div>

          {/* Paginação */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
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
            <div className="text-center text-sm text-slate-500 mt-4">
              Mostrando {cases.length} de {pagination.total} casos (Página {pagination.page} de {pagination.totalPages})
            </div>
          )}
        </>
      )}
    </div>
  );
}


