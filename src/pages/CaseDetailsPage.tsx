import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { api } from '../api/client';
import { useAuth } from '../store/useAuth';
import { ShareButtons } from '../components/ShareButtons';
import { ReportCaseModal } from '../components/ReportCaseModal';
import { ChatWindow } from '../components/ChatWindow';
import { ConfirmModal } from '../components/ConfirmModal';
import { InfoModal } from '../components/InfoModal';
import { SightingModal } from '../components/SightingModal';
import { MessageSquare, AlertTriangle, CheckCircle, XCircle, Eye, Trash2, Edit, Save } from 'lucide-react';

type CaseDetails = {
  id: string;
  fullName: string;
  description?: string;
  priority: string;
  status: string;
  province: string;
  municipality?: string;
  lastSeenLocation: string;
  missingDate: string;
  approved?: boolean;
  photos: { url: string }[];
  reporter?: {
    fullName: string;
    email: string;
    phone?: string;
  };
  sightings: {
    id: string;
    description?: string;
    province?: string;
    municipality?: string;
    reporterName?: string;
    reporterContact?: string;
    evidenceUrl?: string;
    location?: string;
    createdAt: string;
    status: string;
  }[];
};

type SightingForm = {
  description: string;
  province?: string;
  municipality?: string;
};

export function CaseDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [details, setDetails] = useState<CaseDetails>();
  const [showReportModal, setShowReportModal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSightingModal, setShowSightingModal] = useState(false);
  const [deletingSightingId, setDeletingSightingId] = useState<string | null>(null);
  const [showDeleteSightingModal, setShowDeleteSightingModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [editingCase, setEditingCase] = useState(false);
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    age: '',
    gender: '',
    missingDate: '',
    lastSeenLocation: '',
    province: '',
    municipality: '',
    description: '',
    priority: '',
    status: '',
  });
  const { register, handleSubmit, reset } = useForm<SightingForm>();
  
  const isModeratorOrAdmin = user?.role === 'MODERADOR' || user?.role === 'ADMIN';
  const isAdmin = user?.role === 'ADMIN';
  const isAuthority = user?.role === 'AUTORIDADE';
  const canChangeStatus = isModeratorOrAdmin || isAuthority;
  const isPending = details?.approved === false || details?.approved === null || details?.approved === undefined;

  // Escutar evento para abrir chat quando navegar via notificação
  useEffect(() => {
    const handleOpenChat = (event: CustomEvent) => {
      if (event.detail?.caseId === id) {
        setShowChat(true);
      }
    };

    window.addEventListener('open-chat', handleOpenChat as EventListener);
    return () => {
      window.removeEventListener('open-chat', handleOpenChat as EventListener);
    };
  }, [id]);

  useEffect(() => {
    if (!id) return;
    api.get(`/missing-persons/${id}`).then((response) => {
      setDetails(response.data.missingPerson);
      // Preencher formulário de edição
      const caseData = response.data.missingPerson;
      setEditFormData({
        fullName: caseData.fullName || '',
        age: caseData.age?.toString() || '',
        gender: caseData.gender || '',
        missingDate: caseData.missingDate ? new Date(caseData.missingDate).toISOString().split('T')[0] : '',
        lastSeenLocation: caseData.lastSeenLocation || '',
        province: caseData.province || '',
        municipality: caseData.municipality || '',
        description: caseData.description || '',
        priority: caseData.priority || '',
        status: caseData.status || '',
      });
    });
  }, [id]);

  const onSubmit = handleSubmit(async (payload) => {
    await api.post(`/sightings/${id}`, payload);
    reset();
    const refreshed = await api.get(`/missing-persons/${id}`);
    setDetails(refreshed.data.missingPerson);
  });

  const handleApprove = async () => {
    if (!id) return;
    setLoading(true);
    try {
      await api.patch(`/missing-persons/${id}/approve`, { approved: true });
      // Recarregar dados do caso
      const refreshed = await api.get(`/missing-persons/${id}`);
      setDetails(refreshed.data.missingPerson);
      alert('Caso aprovado com sucesso! Agora está disponível para todos.');
    } catch (error: any) {
      console.error('Erro ao aprovar caso:', error);
      alert(error.response?.data?.message || 'Erro ao aprovar caso');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!id || !rejectReason.trim()) {
      alert('Por favor, forneça um motivo para rejeição');
      return;
    }
    setLoading(true);
    try {
      await api.patch(`/missing-persons/${id}/approve`, { 
        approved: false, 
        rejectionReason: rejectReason 
      });
      // Recarregar dados do caso
      const refreshed = await api.get(`/missing-persons/${id}`);
      setDetails(refreshed.data.missingPerson);
      setShowRejectModal(false);
      setRejectReason('');
      alert('Caso rejeitado com sucesso.');
    } catch (error: any) {
      console.error('Erro ao rejeitar caso:', error);
      alert(error.response?.data?.message || 'Erro ao rejeitar caso');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChangeClick = (newStatus: string) => {
    setPendingStatus(newStatus);
    setShowStatusModal(true);
  };

  const handleStatusChangeConfirm = async () => {
    if (!id || !pendingStatus) return;
    setUpdatingStatus(true);
    try {
      await api.patch(`/missing-persons/${id}/status`, { status: pendingStatus });
      // Recarregar dados do caso
      const refreshed = await api.get(`/missing-persons/${id}`);
      setDetails(refreshed.data.missingPerson);
      
      // Mostrar modal de sucesso
      setSuccessMessage(`Status alterado para: ${getStatusLabel(pendingStatus)}`);
      setShowSuccessModal(true);
      setPendingStatus(null);
    } catch (error: any) {
      console.error('Erro ao alterar status:', error);
      alert(error.response?.data?.message || 'Erro ao alterar status do caso');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      'ABERTO': 'Aberto',
      'EM_INVESTIGACAO': 'Em Investigação',
      'AVISTADO': 'Avistado',
      'ENCONTRADO': 'Encontrado',
      'ENCERRADO': 'Encerrado',
    };
    return labels[status] || status;
  };

  const getStatusMessage = (status: string): string => {
    const messages: Record<string, string> = {
      'EM_INVESTIGACAO': 'O caso será marcado como "Em Investigação". O reporter será notificado sobre esta mudança.',
      'AVISTADO': 'O caso será marcado como "Avistado". O reporter será notificado sobre esta mudança.',
      'ENCONTRADO': 'O caso será marcado como "Encontrado". O reporter será notificado sobre esta mudança.',
      'ENCERRADO': 'O caso será marcado como "Encerrado". O reporter será notificado sobre esta mudança.',
      'ABERTO': 'O caso será reaberto. O reporter será notificado sobre esta mudança.',
    };
    return messages[status] || 'O status do caso será alterado. O reporter será notificado.';
  };

  const handleEditCase = async () => {
    if (!id) return;
    setEditingCase(true);
    try {
      const updateData: any = {};
      if (editFormData.fullName) updateData.fullName = editFormData.fullName;
      if (editFormData.age) updateData.age = parseInt(editFormData.age);
      if (editFormData.gender) updateData.gender = editFormData.gender;
      if (editFormData.missingDate) updateData.missingDate = editFormData.missingDate;
      if (editFormData.lastSeenLocation) updateData.lastSeenLocation = editFormData.lastSeenLocation;
      if (editFormData.province) updateData.province = editFormData.province;
      if (editFormData.municipality !== undefined) updateData.municipality = editFormData.municipality;
      if (editFormData.description !== undefined) updateData.description = editFormData.description;
      if (editFormData.priority) updateData.priority = editFormData.priority;
      if (editFormData.status) updateData.status = editFormData.status;

      await api.put(`/missing-persons/${id}`, updateData);
      const refreshed = await api.get(`/missing-persons/${id}`);
      setDetails(refreshed.data.missingPerson);
      setShowEditModal(false);
      setSuccessMessage('Caso atualizado com sucesso!');
      setShowSuccessModal(true);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao atualizar caso');
    } finally {
      setEditingCase(false);
    }
  };

  const handleDeleteCase = async () => {
    if (!id || !deleteReason.trim()) {
      alert('Por favor, forneça um motivo para deletar o caso');
      return;
    }
    setLoading(true);
    try {
      await api.delete(`/missing-persons/${id}`, { data: { reason: deleteReason } });
      setSuccessMessage('Caso deletado com sucesso. Pode ser restaurado posteriormente.');
      setShowSuccessModal(true);
      setShowDeleteModal(false);
      setDeleteReason('');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao deletar caso');
    } finally {
      setLoading(false);
    }
  };

  if (!details) return <p>Carregando...</p>;

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-500">{new Date(details.missingDate).toLocaleDateString()}</p>
            <h2 className="text-3xl font-bold text-slate-900">{details.fullName}</h2>
            <p className="text-sm text-slate-500">
              Último local visto: <span className="font-medium text-slate-800">{details.lastSeenLocation}</span>
            </p>
          </div>
          <div className="space-y-2 text-right">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">{details.priority}</span>
            <p className="text-sm font-semibold text-amber-600">{details.status}</p>
          </div>
        </div>
        {details.photos[0] && (
          <div className="mt-6 overflow-hidden rounded-xl">
            <img src={`${SERVER_BASE_URL}${person.photos[0].url}`} alt={details.fullName} className="h-64 w-full object-cover" />
          </div>
        )}
        <p className="mt-4 text-slate-600">{details.description}</p>
        
        {/* Reporter Info */}
        {details.reporter && (
          <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-sm font-semibold text-slate-700 mb-1">Reportado por:</p>
            <p className="text-sm text-slate-900">{details.reporter.fullName}</p>
          </div>
        )}

        {/* Approval Status Banner */}
        {isModeratorOrAdmin && isPending && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm font-semibold text-amber-800 mb-2">⚠️ Caso pendente de aprovação</p>
            <p className="text-xs text-amber-700">Este caso ainda não foi aprovado e não está visível para usuários comuns.</p>
          </div>
        )}

        {isModeratorOrAdmin && details.approved === true && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-semibold text-green-800">✅ Caso aprovado</p>
            <p className="text-xs text-green-700">Este caso está disponível para todos os usuários.</p>
          </div>
        )}
        
        {/* Admin Actions - Editar/Deletar */}
        {isAdmin && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm font-semibold text-red-800 mb-3">Ações Administrativas</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
              >
                <Edit className="h-4 w-4" />
                Editar Caso
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4" />
                Deletar Caso
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap gap-3">
          {/* Moderator/Admin Actions - Aprovar/Rejeitar */}
          {isModeratorOrAdmin && isPending && (
            <>
              <button
                onClick={handleApprove}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle className="h-4 w-4" />
                Aprovar Caso
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <XCircle className="h-4 w-4" />
                Rejeitar Caso
              </button>
            </>
          )}

          {/* Status Change Actions - Para Admin/Moderador/Autoridade */}
          {canChangeStatus && details.approved === true && (
            <div className="w-full border-t border-slate-200 pt-4 mt-4">
              <p className="text-sm font-semibold text-slate-700 mb-3">Alterar Status do Caso:</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleStatusChangeClick('EM_INVESTIGACAO')}
                  disabled={updatingStatus || details.status === 'EM_INVESTIGACAO'}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Em Investigação
                </button>
                <button
                  onClick={() => handleStatusChangeClick('AVISTADO')}
                  disabled={updatingStatus || details.status === 'AVISTADO'}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-600 text-white font-semibold hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Avistado
                </button>
                <button
                  onClick={() => handleStatusChangeClick('ENCONTRADO')}
                  disabled={updatingStatus || details.status === 'ENCONTRADO'}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Encontrado
                </button>
                <button
                  onClick={() => handleStatusChangeClick('ENCERRADO')}
                  disabled={updatingStatus || details.status === 'ENCERRADO'}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-600 text-white font-semibold hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Encerrado
                </button>
                {details.status !== 'ABERTO' && (
                  <button
                    onClick={() => handleStatusChangeClick('ABERTO')}
                    disabled={updatingStatus || details.status === 'ABERTO'}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    Reabrir Caso
                  </button>
                )}
              </div>
            </div>
          )}
          
          {/* Regular User Actions - Mostrar apenas se caso aprovado OU se for moderador/admin */}
          {(details.approved === true || isModeratorOrAdmin) && (
            <>
              <button
                onClick={() => setShowSightingModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors"
              >
                <Eye className="h-4 w-4" />
                Reportar Avistamento
              </button>
              <ShareButtons caseData={details} />
              <button
                onClick={() => setShowChat(!showChat)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
              >
                <MessageSquare className="h-4 w-4" />
                Chat
              </button>
              <button
                onClick={() => setShowReportModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-300 text-red-600 font-semibold hover:bg-red-50 transition-colors"
              >
                <AlertTriangle className="h-4 w-4" />
                Denunciar
              </button>
            </>
          )}
        </div>
      </div>
      
      {showChat && id && (
        <ChatWindow caseId={id} isOpen={showChat} onClose={() => setShowChat(false)} />
      )}
      
      {showReportModal && id && details && (
        <ReportCaseModal
          caseId={id}
          caseName={details.fullName}
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
        />
      )}

      {showSightingModal && id && details && (
        <SightingModal
          caseId={id}
          caseName={details.fullName}
          isOpen={showSightingModal}
          onClose={() => setShowSightingModal(false)}
          onSuccess={async () => {
            // Recarregar dados do caso após avistamento
            const refreshed = await api.get(`/missing-persons/${id}`);
            setDetails(refreshed.data.missingPerson);
            setSuccessMessage('Avistamento reportado com sucesso!');
            setShowSuccessModal(true);
          }}
        />
      )}

      {/* Reject Case Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Rejeitar Caso</h3>
            <p className="text-sm text-slate-600 mb-4">
              Por favor, forneça um motivo para rejeitar este caso. O reporter será notificado.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Motivo da rejeição..."
              className="w-full rounded-lg border border-slate-200 p-3 min-h-[100px] mb-4"
              rows={4}
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleReject}
                disabled={loading || !rejectReason.trim()}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Rejeitando...' : 'Rejeitar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Confirmation Modal */}
      <ConfirmModal
        isOpen={showStatusModal}
        onClose={() => {
          setShowStatusModal(false);
          setPendingStatus(null);
        }}
        onConfirm={handleStatusChangeConfirm}
        title={`Alterar Status para "${pendingStatus ? getStatusLabel(pendingStatus) : ''}"`}
        message={pendingStatus ? getStatusMessage(pendingStatus) : ''}
        confirmText={updatingStatus ? 'Alterando...' : 'Confirmar'}
        cancelText="Cancelar"
        variant="info"
      />

      {/* Success Modal */}
      <InfoModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Status Alterado"
        message={successMessage}
        variant="success"
      />

      {/* Delete Sighting Modal */}
      <ConfirmModal
        isOpen={showDeleteSightingModal}
        onClose={() => {
          setShowDeleteSightingModal(false);
          setDeletingSightingId(null);
        }}
        onConfirm={async () => {
          if (!deletingSightingId) return;
          try {
            await api.delete(`/sightings/${deletingSightingId}`);
            setSuccessMessage('Comentário removido com sucesso!');
            setShowSuccessModal(true);
            setShowDeleteSightingModal(false);
            setDeletingSightingId(null);
            // Recarregar detalhes do caso
            if (id) {
              const response = await api.get(`/missing-persons/${id}`);
              setDetails(response.data.missingPerson);
            }
          } catch (error: any) {
            alert(error.response?.data?.message || 'Erro ao remover comentário');
          }
        }}
        title="Remover Comentário"
        message="Deseja remover este comentário? Esta ação não pode ser desfeita."
        confirmText="Remover"
        cancelText="Cancelar"
        variant="warning"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Reportar avistamento</h3>
          <form onSubmit={onSubmit} className="mt-4 space-y-3">
            <textarea {...register('description', { required: true })} placeholder="Descreva o que viu..." className="w-full rounded-lg border border-slate-200 p-3" />
            <div className="grid gap-3 md:grid-cols-2">
              <input {...register('province')} placeholder="Província" className="rounded-lg border border-slate-200 p-3" />
              <input {...register('municipality')} placeholder="Município" className="rounded-lg border border-slate-200 p-3" />
            </div>
            <button type="submit" className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white">
              Enviar alerta
            </button>
          </form>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Últimas actualizações</h3>
          <div className="mt-4 space-y-4">
            {details.sightings.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">Nenhum avistamento reportado ainda</p>
            ) : (
              details.sightings.map((sighting) => (
                <div key={sighting.id} className="rounded-lg border border-slate-100 p-3 space-y-2 relative">
                  {isModeratorOrAdmin && (
                    <button
                      onClick={() => {
                        setDeletingSightingId(sighting.id);
                        setShowDeleteSightingModal(true);
                      }}
                      className="absolute top-2 right-2 p-1 rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      title="Remover comentário"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                  {sighting.evidenceUrl && (
                    <div className="rounded-lg overflow-hidden bg-slate-100">
                      <img
                        src={sighting.evidenceUrl}
                        alt="Evidência do avistamento"
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{sighting.description}</p>
                    {sighting.reporterName && (
                      <p className="text-xs text-slate-700 mt-1">
                        <span className="font-semibold">Reportado por:</span> {sighting.reporterName}
                      </p>
                    )}
                    {sighting.location && (
                      <p className="text-xs text-slate-600 mt-1">
                        <span className="font-semibold">Localização:</span> {sighting.location}
                      </p>
                    )}
                    <p className="text-xs text-slate-500 mt-1">
                      {sighting.province} {sighting.municipality ? `- ${sighting.municipality}` : ''}
                    </p>
                    <p className="text-xs text-amber-600 mt-1">{new Date(sighting.createdAt).toLocaleString('pt-AO')}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


