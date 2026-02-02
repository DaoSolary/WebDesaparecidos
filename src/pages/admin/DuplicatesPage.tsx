import { useState, useEffect } from 'react';
import { AlertTriangle, Trash2, CheckCircle, XCircle, RefreshCw, Search } from 'lucide-react';
import { api } from '../../api/client';
import { ConfirmModal } from '../../components/ConfirmModal';
import { InfoModal } from '../../components/InfoModal';

type DuplicateCase = {
  id: string;
  originalCaseId: string;
  duplicateCaseId: string;
  similarityScore: number;
  status: string;
  detectedAt: string;
  resolutionNotes?: string;
  originalCase: {
    id: string;
    fullName: string;
    age?: number;
    missingDate: string;
    province: string;
    municipality?: string;
    photos: Array<{ url: string }>;
    reporter: {
      fullName: string;
      email: string;
    };
  };
  duplicateCase: {
    id: string;
    fullName: string;
    age?: number;
    missingDate: string;
    province: string;
    municipality?: string;
    photos: Array<{ url: string }>;
    reporter: {
      fullName: string;
      email: string;
    };
  };
};

export function DuplicatesPage() {
  const [duplicates, setDuplicates] = useState<DuplicateCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [detecting, setDetecting] = useState(false);
  const [filter, setFilter] = useState<string>('');
  const [selectedDuplicate, setSelectedDuplicate] = useState<DuplicateCase | null>(null);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [resolutionStatus, setResolutionStatus] = useState<string>('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [deleteDuplicate, setDeleteDuplicate] = useState(false);

  useEffect(() => {
    loadDuplicates();
  }, [filter]);

  const loadDuplicates = async () => {
    try {
      setLoading(true);
      const params = filter ? `?status=${filter}` : '';
      const { data } = await api.get(`/duplicates${params}`);
      setDuplicates(data.duplicates || []);
    } catch (error: any) {
      console.error('Erro ao carregar duplicados:', error);
      alert('Erro ao carregar casos duplicados');
    } finally {
      setLoading(false);
    }
  };

  const handleDetect = async () => {
    try {
      setDetecting(true);
      const { data } = await api.post('/duplicates/detect', { threshold: 0.7 });
      setSuccessMessage(`Detecção concluída! ${data.total} caso(s) duplicado(s) encontrado(s).`);
      setShowSuccessModal(true);
      await loadDuplicates();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao detectar casos duplicados');
    } finally {
      setDetecting(false);
    }
  };

  const handleResolve = (duplicate: DuplicateCase, status: string) => {
    setSelectedDuplicate(duplicate);
    setResolutionStatus(status);
    setResolutionNotes('');
    setDeleteDuplicate(false);
    setShowResolveModal(true);
  };

  const confirmResolve = async () => {
    if (!selectedDuplicate) return;

    try {
      await api.patch(`/duplicates/${selectedDuplicate.id}/resolve`, {
        status: resolutionStatus,
        resolutionNotes,
        deleteDuplicate: resolutionStatus === 'CONFIRMADO' ? deleteDuplicate : false,
      });
      setSuccessMessage(
        resolutionStatus === 'CONFIRMADO' && deleteDuplicate
          ? 'Caso duplicado confirmado e removido com sucesso!'
          : 'Status do caso duplicado atualizado com sucesso!'
      );
      setShowSuccessModal(true);
      setShowResolveModal(false);
      setSelectedDuplicate(null);
      await loadDuplicates();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao resolver caso duplicado');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDENTE':
        return 'bg-amber-100 text-amber-700';
      case 'CONFIRMADO':
        return 'bg-red-100 text-red-700';
      case 'REJEITADO':
        return 'bg-green-100 text-green-700';
      case 'RESOLVIDO':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDENTE':
        return 'Pendente';
      case 'CONFIRMADO':
        return 'Confirmado';
      case 'REJEITADO':
        return 'Rejeitado';
      case 'RESOLVIDO':
        return 'Resolvido';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Carregando casos duplicados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Detecção de Casos Duplicados</h1>
        <p className="mt-2 text-slate-600">Detecte e gerencie casos duplicados na plataforma</p>
      </div>

      {/* Ações */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={handleDetect}
          disabled={detecting}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          <RefreshCw className={`h-5 w-5 ${detecting ? 'animate-spin' : ''}`} />
          {detecting ? 'Detectando...' : 'Detectar Duplicados'}
        </button>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-slate-300 bg-white"
        >
          <option value="">Todos os Status</option>
          <option value="PENDENTE">Pendente</option>
          <option value="CONFIRMADO">Confirmado</option>
          <option value="REJEITADO">Rejeitado</option>
          <option value="RESOLVIDO">Resolvido</option>
        </select>
      </div>

      {/* Lista de Duplicados */}
      <div className="space-y-4">
        {duplicates.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
            <AlertTriangle className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">Nenhum caso duplicado encontrado</p>
            <p className="text-sm text-slate-500 mt-2">Clique em "Detectar Duplicados" para iniciar a análise</p>
          </div>
        ) : (
          duplicates.map((dup) => (
            <div key={dup.id} className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded text-sm font-semibold ${getStatusColor(dup.status)}`}>
                      {getStatusLabel(dup.status)}
                    </span>
                    <span className="text-sm text-slate-600">
                      Similaridade: {(dup.similarityScore * 100).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Detectado em {new Date(dup.detectedAt).toLocaleString('pt-AO')}
                  </p>
                </div>
                {dup.status === 'PENDENTE' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleResolve(dup, 'CONFIRMADO')}
                      className="px-3 py-1 text-sm rounded bg-red-600 text-white hover:bg-red-700 flex items-center gap-1"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Confirmar
                    </button>
                    <button
                      onClick={() => handleResolve(dup, 'REJEITADO')}
                      className="px-3 py-1 text-sm rounded bg-green-600 text-white hover:bg-green-700 flex items-center gap-1"
                    >
                      <XCircle className="h-4 w-4" />
                      Rejeitar
                    </button>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Caso Original */}
                <div className="border border-slate-200 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Caso Original
                  </h3>
                  <div className="space-y-2">
                    {dup.originalCase.photos[0] && (
                      <img
                        src={dup.originalCase.photos[0].url}
                        alt={dup.originalCase.fullName}
                        className="w-full h-32 object-cover rounded"
                      />
                    )}
                    <p className="font-semibold text-slate-900">{dup.originalCase.fullName}</p>
                    <p className="text-sm text-slate-600">
                      Idade: {dup.originalCase.age || 'N/A'} | Data: {new Date(dup.originalCase.missingDate).toLocaleDateString('pt-AO')}
                    </p>
                    <p className="text-sm text-slate-600">
                      {dup.originalCase.province} {dup.originalCase.municipality ? `- ${dup.originalCase.municipality}` : ''}
                    </p>
                    <p className="text-xs text-slate-500">Reportado por: {dup.originalCase.reporter.fullName}</p>
                    <a
                      href={`/casos/${dup.originalCase.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Ver caso completo →
                    </a>
                  </div>
                </div>

                {/* Caso Duplicado */}
                <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    Caso Duplicado
                  </h3>
                  <div className="space-y-2">
                    {dup.duplicateCase.photos[0] && (
                      <img
                        src={dup.duplicateCase.photos[0].url}
                        alt={dup.duplicateCase.fullName}
                        className="w-full h-32 object-cover rounded"
                      />
                    )}
                    <p className="font-semibold text-slate-900">{dup.duplicateCase.fullName}</p>
                    <p className="text-sm text-slate-600">
                      Idade: {dup.duplicateCase.age || 'N/A'} | Data: {new Date(dup.duplicateCase.missingDate).toLocaleDateString('pt-AO')}
                    </p>
                    <p className="text-sm text-slate-600">
                      {dup.duplicateCase.province} {dup.duplicateCase.municipality ? `- ${dup.duplicateCase.municipality}` : ''}
                    </p>
                    <p className="text-xs text-slate-500">Reportado por: {dup.duplicateCase.reporter.fullName}</p>
                    <a
                      href={`/casos/${dup.duplicateCase.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Ver caso completo →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Resolução */}
      <ConfirmModal
        isOpen={showResolveModal}
        onClose={() => {
          setShowResolveModal(false);
          setSelectedDuplicate(null);
          setResolutionNotes('');
          setDeleteDuplicate(false);
        }}
        onConfirm={confirmResolve}
        title={`${resolutionStatus === 'CONFIRMADO' ? 'Confirmar' : resolutionStatus === 'REJEITADO' ? 'Rejeitar' : 'Resolver'} Caso Duplicado`}
        message={
          selectedDuplicate
            ? `Deseja ${resolutionStatus === 'CONFIRMADO' ? 'confirmar' : resolutionStatus === 'REJEITADO' ? 'rejeitar' : 'resolver'} este caso duplicado?`
            : ''
        }
        confirmText="Confirmar"
        cancelText="Cancelar"
        variant={resolutionStatus === 'CONFIRMADO' ? 'warning' : 'info'}
      >
        {resolutionStatus === 'CONFIRMADO' && (
          <div className="mt-4">
            <label className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={deleteDuplicate}
                onChange={(e) => setDeleteDuplicate(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-slate-700">Excluir caso duplicado após confirmação</span>
            </label>
          </div>
        )}
        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">Notas (opcional)</label>
          <textarea
            value={resolutionNotes}
            onChange={(e) => setResolutionNotes(e.target.value)}
            placeholder="Adicione notas sobre a resolução..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
            rows={3}
          />
        </div>
      </ConfirmModal>

      {/* Modal de Sucesso */}
      <InfoModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          setSuccessMessage('');
        }}
        title="Sucesso"
        message={successMessage}
        variant="success"
      />
    </div>
  );
}








