import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuth } from '../../store/useAuth';
import { api } from '../../api/client';
import { initSocket, onNotification } from '../../services/socket';
import { InfoModal } from '../InfoModal';
import { CheckCircle, XCircle, AlertCircle, Eye, Edit, Filter, ChevronLeft, ChevronRight, Image, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';

type MissingPerson = {
  id: string;
  fullName: string;
  age?: number;
  gender?: string;
  missingDate: string;
  lastSeenLocation: string;
  province: string;
  approved?: boolean | null;
  rejectionReason?: string | null;
  status: string;
  reporter: { fullName: string; email: string };
  photos: Array<{ url: string; id?: string }>;
};

type ImageAnalysis = {
  id: string;
  photoId: string;
  isManipulated: boolean;
  confidence: number;
  manipulationDetails?: string;
  analyzedAt: string;
  result: any;
};

type PaginationInfo = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export function ModeratorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pendingCases, setPendingCases] = useState<MissingPerson[]>([]);
  const [allCases, setAllCases] = useState<MissingPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingCaseId, setRejectingCaseId] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const itemsPerPage = 15; // 15 casos por página para moderadores
  const [analyzingCaseId, setAnalyzingCaseId] = useState<string | null>(null);
  const [caseAnalyses, setCaseAnalyses] = useState<Record<string, ImageAnalysis[]>>({});
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [selectedCaseForAnalysis, setSelectedCaseForAnalysis] = useState<MissingPerson | null>(null);
  
  // Estatísticas globais (de todos os casos, não apenas da página atual)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  // Carregar casos sempre que o componente monta ou quando o filtro ou página muda
  useEffect(() => {
    if (user) {
      setCurrentPage(1); // Resetar para primeira página quando mudar o filtro
      loadCases();
      loadStats(); // Carregar estatísticas globais
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, user]);

  // Recarregar quando a página mudar
  useEffect(() => {
    if (user) {
      loadCases();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // Escutar evento para mostrar casos pendentes quando navegar via notificação
  useEffect(() => {
    const handleShowPending = (event: CustomEvent) => {
      if (event.detail?.caseId) {
        setFilter('pending');
        setTimeout(() => {
          loadCases();
        }, 200);
      }
    };

    window.addEventListener('show-pending-cases', handleShowPending as EventListener);
    return () => {
      window.removeEventListener('show-pending-cases', handleShowPending as EventListener);
    };
  }, []);

  // Configurar Socket.IO para notificações em tempo real de novos casos
  useEffect(() => {
    if (user) {
      console.log('[MODERADOR] Inicializando Socket.IO para moderador:', user.id);
      
      // Inicializar socket
      const socket = initSocket(user.id, user.role);
      
      // Função para lidar com notificações
      const handleNotification = (notification: any) => {
        console.log('[MODERADOR] Notificação recebida:', notification);
        
        if (notification.type === 'new_pending_case') {
          console.log('[MODERADOR] Novo caso pendente detectado!', notification);
          
          // Forçar filtro para pendentes
          setFilter('pending');
          
          // Recarregar casos pendentes com delay para garantir que o caso está no banco
          setTimeout(() => {
            console.log('[MODERADOR] Recarregando lista de casos pendentes...');
            loadCases();
          }, 500);
        }
      };

      // Registrar listener de notificações
      let cleanup: (() => void) | undefined;
      
      const registerListener = () => {
        if (socket?.connected) {
          cleanup = onNotification(handleNotification);
          console.log('[MODERADOR] Listener de notificações registrado (socket conectado)');
        } else {
          // Se não estiver conectado, aguardar conexão
          socket?.once('connect', () => {
            cleanup = onNotification(handleNotification);
            console.log('[MODERADOR] Listener de notificações registrado (após conexão)');
          });
        }
      };

      // Tentar registrar imediatamente ou após um delay
      if (socket?.connected) {
        registerListener();
      } else {
        setTimeout(registerListener, 1000);
      }

      return () => {
        // Remover callback ao desmontar
        if (cleanup) {
          cleanup();
        }
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Carregar estatísticas globais (todos os casos, sem paginação)
  const loadStats = async () => {
    try {
      // Buscar todos os casos sem paginação para calcular estatísticas
      const { data } = await api.get('/missing-persons', {
        params: {
          page: 1,
          limit: 10000, // Limite alto para pegar todos os casos
        },
      });
      const allCasesForStats = data.items || [];
      
      // Calcular estatísticas globais
      const total = allCasesForStats.length;
      const pending = allCasesForStats.filter((c: any) => {
        const isApproved = c.approved === true;
        const hasRejectionReason = c.rejectionReason && String(c.rejectionReason).trim() !== '';
        return !isApproved && !hasRejectionReason;
      }).length;
      const approved = allCasesForStats.filter((c: any) => c.approved === true).length;
      const rejected = allCasesForStats.filter((c: any) => c.approved === false && c.rejectionReason).length;
      
      setStats({
        total,
        pending,
        approved,
        rejected,
      });
    } catch (error) {
      console.error('[MODERADOR] Erro ao carregar estatísticas:', error);
    }
  };

  const loadCases = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/missing-persons', {
        params: {
          page: currentPage,
          limit: itemsPerPage,
        },
      });
      const cases = data.items || [];
      setPagination(data.pagination || null);
      
      console.log(`[MODERADOR] Total de casos recebidos do servidor: ${cases.length}`);
      console.log(`[MODERADOR] Primeiros casos:`, cases.slice(0, 3).map((c: any) => ({
        id: c.id,
        name: c.fullName,
        approved: c.approved
      })));
      
      // Sempre atualizar ambas as listas
      // Casos pendentes são aqueles que não foram aprovados E não foram rejeitados
      // Casos rejeitados (com rejectionReason) NÃO devem aparecer como pendentes
      const pending = cases.filter((c: any) => {
        // Verificar explicitamente se approved não é true
        // approved pode ser: true, false, null, ou undefined
        const isApproved = c.approved === true;
        // Verificar se tem rejectionReason (caso rejeitado)
        const hasRejectionReason = c.rejectionReason && String(c.rejectionReason).trim() !== '';
        // Caso pendente = não aprovado E não rejeitado
        const isPending = !isApproved && !hasRejectionReason;
        
        if (!isPending && hasRejectionReason) {
          console.log(`[MODERADOR] Caso rejeitado filtrado: ${c.fullName} (${c.id}) - motivo: ${c.rejectionReason}`);
        }
        
        return isPending;
      });
      
      // Sempre atualizar com os casos do servidor
      setPendingCases(pending);
      setAllCases(cases);
      
      // Debug: verificar se as fotos têm id
      if (cases.length > 0) {
        const firstCase = cases[0];
        console.log(`[MODERADOR] Primeiro caso - fotos:`, firstCase.photos);
        console.log(`[MODERADOR] Primeiro caso - tem fotos:`, firstCase.photos?.length > 0);
        if (firstCase.photos && firstCase.photos.length > 0) {
          console.log(`[MODERADOR] Primeira foto tem id:`, firstCase.photos[0].id);
        }
      }
      
      console.log(`[MODERADOR] Casos carregados: ${cases.length} total, ${pending.length} pendentes`);
      console.log(`[MODERADOR] Detalhes dos casos pendentes:`, pending.map((c: any) => ({
        id: c.id,
        name: c.fullName,
        approved: c.approved,
        photosCount: c.photos?.length || 0
      })));
    } catch (error) {
      console.error('[MODERADOR] Erro ao carregar casos:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveCase = async (caseId: string) => {
    try {
      const caseItem = pendingCases.find(c => c.id === caseId) || allCases.find(c => c.id === caseId);
      const caseName = caseItem?.fullName || 'o caso';
      
      await api.patch(`/missing-persons/${caseId}/approve`, { approved: true });
      // Remover o caso da lista de pendentes após aprovação
      setPendingCases((prev) => prev.filter(c => c.id !== caseId));
      // Recarregar todos os casos para atualizar estatísticas
      loadCases();
      // Recarregar estatísticas globais
      loadStats();
      
      // Mostrar modal de sucesso
      setSuccessMessage(`Caso aprovado e publicado com sucesso! O caso "${caseName}" está agora visível para todos os usuários.`);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Erro ao aprovar caso:', error);
      alert('Erro ao aprovar caso');
    }
  };

  const handleRejectClick = (e: React.MouseEvent<HTMLButtonElement>, caseId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setRejectingCaseId(caseId);
    setShowRejectModal(true);
    setRejectReason('');
  };

  const handleRejectConfirm = async () => {
    if (!rejectingCaseId || !rejectReason.trim()) {
      alert('Por favor, forneça um motivo para rejeição');
      return;
    }
    setRejecting(true);
    try {
      const response = await api.patch(`/missing-persons/${rejectingCaseId}/approve`, { 
        approved: false, 
        rejectionReason: rejectReason.trim()
      });
      
      console.log('[MODERADOR] Caso rejeitado com sucesso:', response.data);
      
      // Remover o caso da lista de pendentes imediatamente
      setPendingCases((prev) => {
        const filtered = prev.filter(c => c.id !== rejectingCaseId);
        console.log(`[MODERADOR] Caso removido da lista. Pendentes restantes: ${filtered.length}`);
        return filtered;
      });
      
      // Atualizar também a lista de todos os casos para refletir a rejeição
      setAllCases((prev) => {
        return prev.map(c => 
          c.id === rejectingCaseId 
            ? { ...c, approved: false, rejectionReason: rejectReason.trim() }
            : c
        );
      });
      
      // Recarregar todos os casos e estatísticas globais
      // Aguardar um pouco para garantir que o backend processou a atualização
      setTimeout(async () => {
        try {
          await loadCases();
          await loadStats(); // Recarregar estatísticas globais
        } catch (error) {
          console.error('[MODERADOR] Erro ao recarregar casos após rejeição:', error);
        }
      }, 500);
      
      // Fechar modal de rejeição e limpar estado
      setShowRejectModal(false);
      setRejectReason('');
      setRejectingCaseId(null);
      
      // Mostrar modal de sucesso
      setSuccessMessage('Caso rejeitado com sucesso. O reporter foi notificado.');
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error('Erro ao rejeitar caso:', error);
      alert(error.response?.data?.message || 'Erro ao rejeitar caso. Tente novamente.');
    } finally {
      setRejecting(false);
    }
  };

  const handleRejectCancel = () => {
    setShowRejectModal(false);
    setRejectReason('');
    setRejectingCaseId(null);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && pagination && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAnalyzeImages = async (caseItem: MissingPerson) => {
    try {
      setAnalyzingCaseId(caseItem.id);
      console.log('[ANÁLISE] Iniciando análise para caso:', caseItem.id);
      console.log('[ANÁLISE] Fotos do caso:', caseItem.photos);
      
      const { data } = await api.post(`/image-analysis/case/${caseItem.id}/analyze-all`);
      console.log('[ANÁLISE] Resposta da análise:', data);
      
      // Aguardar um pouco para garantir que as análises foram salvas
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Carregar análises do caso - buscar por casoId através das fotos
      if (caseItem.photos && caseItem.photos.length > 0) {
        // Buscar análises por cada foto individualmente usando o id da foto
        const photoIds = caseItem.photos.map(p => p.id).filter(Boolean);
        console.log('[ANÁLISE] Buscando análises para fotos com IDs:', photoIds);
        
        if (photoIds.length > 0) {
          const analysesPromises = photoIds.map(photoId => 
            api.get(`/image-analysis?photoId=${photoId}`).catch(err => {
              console.warn(`[ANÁLISE] Erro ao buscar análise para foto ${photoId}:`, err);
              return { data: { analyses: [] } };
            })
          );
          const analysesResponses = await Promise.all(analysesPromises);
          const allAnalyses = analysesResponses.flatMap(res => res.data.analyses || []);
          
          console.log('[ANÁLISE] Análises encontradas:', allAnalyses.length);
          setCaseAnalyses(prev => ({
            ...prev,
            [caseItem.id]: allAnalyses,
          }));
        } else {
          // Se não houver IDs, usar as análises retornadas pela API
          if (data.analyses && data.analyses.length > 0) {
            setCaseAnalyses(prev => ({
              ...prev,
              [caseItem.id]: data.analyses,
            }));
          }
        }
      }
      
      setSelectedCaseForAnalysis(caseItem);
      setShowAnalysisModal(true);
      setSuccessMessage(`Análise concluída! ${data.analyses?.length || 0} imagem(ns) analisada(s).`);
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error('Erro ao analisar imagens:', error);
      alert(error.response?.data?.message || 'Erro ao analisar imagens do caso');
    } finally {
      setAnalyzingCaseId(null);
    }
  };

  const casesToShow = filter === 'pending' ? pendingCases : allCases;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Painel de Moderação</h1>
          <p className="mt-1 text-slate-600">Valide e gerencie casos de desaparecimento</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              filter === 'pending'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Pendentes ({pendingCases.length})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Todos os Casos
          </button>
        </div>
      </div>

      {/* Stats - Estatísticas globais (de todos os casos) */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-2xl font-bold text-slate-900">{stats.pending}</p>
          <p className="text-sm text-slate-600">Casos Pendentes</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
          <p className="text-sm text-slate-600">Total de Casos</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
          <p className="text-sm text-slate-600">Aprovados</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
          <p className="text-sm text-slate-600">Rejeitados</p>
        </div>
      </div>

      {/* Cases List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : casesToShow.length === 0 ? (
        <div className="text-center py-12 rounded-lg border border-slate-200 bg-white">
          <p className="text-slate-600">Nenhum caso encontrado.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {casesToShow.map((caseItem) => (
            <div
              key={caseItem.id}
              className="rounded-lg border border-slate-200 bg-white p-6"
            >
              <div className="flex gap-6">
                {caseItem.photos[0] && (
                  <div className="w-32 h-32 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                    <img
                      src={caseItem.photos[0].url}
                      alt={caseItem.fullName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900">
                        {caseItem.fullName}
                      </h3>
                      <p className="text-sm text-slate-600 mt-1">
                        Reportado por: {caseItem.reporter?.fullName || 'N/A'}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {!caseItem.approved && (
                        <>
                          <button
                            onClick={() => approveCase(caseItem.id)}
                            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Aprovar
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleRejectClick(e, caseItem.id)}
                            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                          >
                            <XCircle className="h-4 w-4" />
                            Rejeitar
                          </button>
                        </>
                      )}
                      {(caseItem.photos && Array.isArray(caseItem.photos) && caseItem.photos.length > 0) ? (
                        <button
                          onClick={() => handleAnalyzeImages(caseItem)}
                          disabled={analyzingCaseId === caseItem.id}
                          className="flex items-center gap-2 rounded-lg border border-purple-300 bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-700 hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Analisar imagens do caso"
                        >
                          {analyzingCaseId === caseItem.id ? (
                            <>
                              <RefreshCw className="h-4 w-4 animate-spin" />
                              Analisando...
                            </>
                          ) : (
                            <>
                              <Image className="h-4 w-4" />
                              Analisar Imagens
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 px-2 py-1">Sem fotos</span>
                      )}
                      <Link
                        to={`/casos/${caseItem.id}`}
                        className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <Eye className="h-4 w-4" />
                        Ver Detalhes
                      </Link>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500">Localização</p>
                      <p className="font-medium">{caseItem.lastSeenLocation}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Província</p>
                      <p className="font-medium">{caseItem.province}</p>
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
            </div>
          ))}

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
              Mostrando {casesToShow.length} de {pagination.total} casos (Página {pagination.page} de {pagination.totalPages})
            </div>
          )}
        </div>
      )}

      {/* Reject Case Modal */}
      {showRejectModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={handleRejectCancel}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Rejeitar Caso</h3>
            <p className="text-sm text-slate-600 mb-4">
              Por favor, forneça um motivo para rejeitar este caso. O reporter será notificado.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRejectReason(e.target.value)}
              placeholder="Motivo da rejeição..."
              className="w-full rounded-lg border border-slate-200 p-3 min-h-[100px] mb-4"
              rows={4}
            />
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={handleRejectCancel}
                disabled={rejecting}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleRejectConfirm}
                disabled={rejecting || !rejectReason.trim()}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {rejecting ? 'Rejeitando...' : 'Rejeitar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      <InfoModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          setSuccessMessage('');
        }}
        title={successMessage.includes('aprovado') ? 'Caso Aprovado' : 'Caso Rejeitado'}
        message={successMessage}
        variant="success"
      />

      {/* Modal de Análise de Imagens */}
      {showAnalysisModal && selectedCaseForAnalysis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  Análise de Imagens - {selectedCaseForAnalysis.fullName}
                </h3>
                <button
                  onClick={() => {
                    setShowAnalysisModal(false);
                    setSelectedCaseForAnalysis(null);
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              {caseAnalyses[selectedCaseForAnalysis.id]?.length > 0 ? (
                <div className="space-y-4">
                  {caseAnalyses[selectedCaseForAnalysis.id].map((analysis, index) => {
                    // Tentar encontrar a foto pelo ID, se não encontrar, usar a primeira disponível
                    let photo = selectedCaseForAnalysis.photos.find(p => p.id && p.id === analysis.photoId);
                    if (!photo && selectedCaseForAnalysis.photos.length > index) {
                      photo = selectedCaseForAnalysis.photos[index];
                    } else if (!photo && selectedCaseForAnalysis.photos.length > 0) {
                      photo = selectedCaseForAnalysis.photos[0];
                    }
                    return (
                      <div key={analysis.id || index} className="border border-slate-200 rounded-lg p-4">
                        <div className="flex items-start gap-4">
                          {photo && photo.url && (
                            <div className="w-32 h-32 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                              <img
                                src={photo.url}
                                alt="Foto analisada"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.currentTarget;
                                  target.style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              {analysis.isManipulated ? (
                                <span className="px-3 py-1 rounded text-sm font-semibold bg-red-100 text-red-700 flex items-center gap-1">
                                  <AlertTriangle className="h-4 w-4" />
                                  Manipulada
                                </span>
                              ) : (
                                <span className="px-3 py-1 rounded text-sm font-semibold bg-green-100 text-green-700 flex items-center gap-1">
                                  <CheckCircle2 className="h-4 w-4" />
                                  Original
                                </span>
                              )}
                              <span className="text-sm text-slate-600">
                                Confiança: {(analysis.confidence * 100).toFixed(1)}%
                              </span>
                            </div>
                            {analysis.isManipulated && analysis.manipulationDetails && (
                              <div className="p-3 bg-red-50 rounded-lg border border-red-200 mt-2">
                                <p className="text-sm font-semibold text-red-900 mb-1">Detalhes da Manipulação:</p>
                                <p className="text-sm text-red-700">{analysis.manipulationDetails}</p>
                              </div>
                            )}
                            <p className="text-xs text-slate-500 mt-2">
                              Analisado em {new Date(analysis.analyzedAt).toLocaleString('pt-AO')}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-600">Nenhuma análise disponível para este caso.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

