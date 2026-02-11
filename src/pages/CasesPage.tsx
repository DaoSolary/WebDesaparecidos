import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { API_BASE_URL } from '../config';
import { SERVER_BASE_URL } from '../config';



type MissingPerson = {
  id: string;
  fullName: string;
  age?: number;
  gender?: string;
  province: string;
  municipality?: string;
  priority: string;
  status: string;
  photos: { url: string }[];
  reporter?: {
    fullName: string;
    phone?: string;
  };
};

type PaginationInfo = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export function CasesPage() {
  const [items, setItems] = useState<MissingPerson[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 9; // 9 casos por página para usuários comuns

  useEffect(() => {
    loadCases();
  }, [currentPage]);

  const loadCases = async () => {
    setLoading(true);
    try {
      const response = await api.get('/missing-persons', {
        params: {
          page: currentPage,
          limit: itemsPerPage,
        },
      });
      setItems(response.data.items || []);
      setPagination(response.data.pagination || null);
    } catch (error) {
      console.error('Erro ao carregar casos:', error);
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
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Casos activos</h2>
        <p className="text-sm text-slate-500">Filtre por localização, género, data ou prioridade.</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((person) => (
              <Link key={person.id} to={`/casos/${person.id}`} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-blue-500">
                <div className="aspect-video overflow-hidden rounded-lg bg-slate-100">
                  {person.photos[0] ? <img src={`${SERVER_BASE_URL}${person.photos[0].url}`} alt={person.fullName} className="h-full w-full object-cover" /> : null}
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold text-slate-900">{person.fullName}</p>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">{person.priority}</span>
                  </div>
                  <p className="text-sm text-slate-500">
                    {person.province} {person.municipality ? `• ${person.municipality}` : ''}
                  </p>
                  {person.reporter && (
                    <p className="text-xs text-slate-500">
                      Reportado por: {person.reporter.fullName}
                    </p>
                  )}
                  <div className="text-xs font-semibold text-amber-600">{person.status}</div>
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
            <div className="text-center text-sm text-slate-500 mt-4">
              Mostrando {items.length} de {pagination.total} casos (Página {pagination.page} de {pagination.totalPages})
            </div>
          )}
        </>
      )}
    </div>
  );
}


