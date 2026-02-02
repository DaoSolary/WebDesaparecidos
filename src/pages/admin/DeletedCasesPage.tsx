import { useState, useEffect } from 'react';
import { Trash2, RotateCcw, Eye, Calendar } from 'lucide-react';
import { api } from '../../api/client';
import { ConfirmModal } from '../../components/ConfirmModal';
import { InfoModal } from '../../components/InfoModal';

type DeletedCase = {
  id: string;
  caseId: string;
  caseData: any;
  deletionReason?: string;
  deletedAt: string;
  restoredAt?: string;
  deletedByUser: {
    fullName: string;
    role: string;
  };
  restoredByUser?: {
    fullName: string;
  };
};

export function DeletedCasesPage() {
  const [deletedCases, setDeletedCases] = useState<DeletedCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [filter, setFilter] = useState<string>('');

  useEffect(() => {
    loadDeletedCases();
  }, [filter]);

  const loadDeletedCases = async () => {
    try {
      setLoading(true);
      const params = filter ? `?restored=${filter === 'restored'}` : '';
      const { data } = await api.get(`/deleted-cases${params}`);
      setDeletedCases(data.deletedCases || []);
    } catch (error: any) {
      console.error('Erro ao carregar casos deletados:', error);
      alert('Erro ao carregar casos deletados');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!restoringId) return;
    try {
      await api.post(`/deleted-cases/${restoringId}/restore`);
      setSuccessMessage('Caso restaurado com sucesso!');
      setShowSuccessModal(true);
      setShowRestoreModal(false);
      setRestoringId(null);
      await loadDeletedCases();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao restaurar caso');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Casos Deletados</h1>
        <p className="mt-2 text-slate-600">Gerencie e restaure casos deletados acidentalmente</p>
      </div>

      {/* Filtro */}
      <div className="mb-6">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-slate-300 bg-white"
        >
          <option value="">Todos</option>
          <option value="not-restored">Não Restaurados</option>
          <option value="restored">Restaurados</option>
        </select>
      </div>

      {/* Lista */}
      <div className="space-y-4">
        {deletedCases.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
            <Trash2 className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">Nenhum caso deletado encontrado</p>
          </div>
        ) : (
          deletedCases.map((deletedCase) => (
            <div key={deletedCase.id} className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-slate-900">
                      {deletedCase.caseData?.fullName || 'Caso sem nome'}
                    </h3>
                    {deletedCase.restoredAt ? (
                      <span className="px-3 py-1 rounded text-sm font-semibold bg-green-100 text-green-700">
                        Restaurado
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded text-sm font-semibold bg-red-100 text-red-700">
                        Deletado
                      </span>
                    )}
                  </div>
                  <div className="space-y-1 text-sm text-slate-600">
                    <p>
                      <strong>ID do Caso:</strong> {deletedCase.caseId}
                    </p>
                    {deletedCase.caseData?.age && (
                      <p>
                        <strong>Idade:</strong> {deletedCase.caseData.age}
                      </p>
                    )}
                    {deletedCase.caseData?.province && (
                      <p>
                        <strong>Província:</strong> {deletedCase.caseData.province}
                      </p>
                    )}
                    {deletedCase.deletionReason && (
                      <p>
                        <strong>Motivo da Deleção:</strong> {deletedCase.deletionReason}
                      </p>
                    )}
                    <p className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Deletado em {new Date(deletedCase.deletedAt).toLocaleString('pt-AO')} por{' '}
                      {deletedCase.deletedByUser.fullName} ({deletedCase.deletedByUser.role})
                    </p>
                    {deletedCase.restoredAt && deletedCase.restoredByUser && (
                      <p className="text-green-600">
                        Restaurado em {new Date(deletedCase.restoredAt).toLocaleString('pt-AO')} por{' '}
                        {deletedCase.restoredByUser.fullName}
                      </p>
                    )}
                  </div>
                </div>
                {!deletedCase.restoredAt && (
                  <button
                    onClick={() => {
                      setRestoringId(deletedCase.id);
                      setShowRestoreModal(true);
                    }}
                    className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Restaurar
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Restaurar */}
      <ConfirmModal
        isOpen={showRestoreModal}
        onClose={() => {
          setShowRestoreModal(false);
          setRestoringId(null);
        }}
        onConfirm={handleRestore}
        title="Restaurar Caso"
        message="Tem certeza que deseja restaurar este caso? O caso será restaurado com todos os seus dados originais."
        confirmText="Restaurar"
        cancelText="Cancelar"
        variant="info"
      />

      {/* Modal Sucesso */}
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








