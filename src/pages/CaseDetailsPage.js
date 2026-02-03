import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
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
import { MessageSquare, AlertTriangle, CheckCircle, XCircle, Eye, Trash2, Edit } from 'lucide-react';
export function CaseDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [details, setDetails] = useState();
    const [showReportModal, setShowReportModal] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [pendingStatus, setPendingStatus] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showSightingModal, setShowSightingModal] = useState(false);
    const [deletingSightingId, setDeletingSightingId] = useState(null);
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
    const { register, handleSubmit, reset } = useForm();
    const isModeratorOrAdmin = user?.role === 'MODERADOR' || user?.role === 'ADMIN';
    const isAdmin = user?.role === 'ADMIN';
    const isAuthority = user?.role === 'AUTORIDADE';
    const canChangeStatus = isModeratorOrAdmin || isAuthority;
    const isPending = details?.approved === false || details?.approved === null || details?.approved === undefined;
    // Escutar evento para abrir chat quando navegar via notificação
    useEffect(() => {
        const handleOpenChat = (event) => {
            if (event.detail?.caseId === id) {
                setShowChat(true);
            }
        };
        window.addEventListener('open-chat', handleOpenChat);
        return () => {
            window.removeEventListener('open-chat', handleOpenChat);
        };
    }, [id]);
    useEffect(() => {
        if (!id)
            return;
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
        if (!id)
            return;
        setLoading(true);
        try {
            await api.patch(`/missing-persons/${id}/approve`, { approved: true });
            // Recarregar dados do caso
            const refreshed = await api.get(`/missing-persons/${id}`);
            setDetails(refreshed.data.missingPerson);
            alert('Caso aprovado com sucesso! Agora está disponível para todos.');
        }
        catch (error) {
            console.error('Erro ao aprovar caso:', error);
            alert(error.response?.data?.message || 'Erro ao aprovar caso');
        }
        finally {
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
        }
        catch (error) {
            console.error('Erro ao rejeitar caso:', error);
            alert(error.response?.data?.message || 'Erro ao rejeitar caso');
        }
        finally {
            setLoading(false);
        }
    };
    const handleStatusChangeClick = (newStatus) => {
        setPendingStatus(newStatus);
        setShowStatusModal(true);
    };
    const handleStatusChangeConfirm = async () => {
        if (!id || !pendingStatus)
            return;
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
        }
        catch (error) {
            console.error('Erro ao alterar status:', error);
            alert(error.response?.data?.message || 'Erro ao alterar status do caso');
        }
        finally {
            setUpdatingStatus(false);
        }
    };
    const getStatusLabel = (status) => {
        const labels = {
            'ABERTO': 'Aberto',
            'EM_INVESTIGACAO': 'Em Investigação',
            'AVISTADO': 'Avistado',
            'ENCONTRADO': 'Encontrado',
            'ENCERRADO': 'Encerrado',
        };
        return labels[status] || status;
    };
    const getStatusMessage = (status) => {
        const messages = {
            'EM_INVESTIGACAO': 'O caso será marcado como "Em Investigação". O reporter será notificado sobre esta mudança.',
            'AVISTADO': 'O caso será marcado como "Avistado". O reporter será notificado sobre esta mudança.',
            'ENCONTRADO': 'O caso será marcado como "Encontrado". O reporter será notificado sobre esta mudança.',
            'ENCERRADO': 'O caso será marcado como "Encerrado". O reporter será notificado sobre esta mudança.',
            'ABERTO': 'O caso será reaberto. O reporter será notificado sobre esta mudança.',
        };
        return messages[status] || 'O status do caso será alterado. O reporter será notificado.';
    };
    const handleEditCase = async () => {
        if (!id)
            return;
        setEditingCase(true);
        try {
            const updateData = {};
            if (editFormData.fullName)
                updateData.fullName = editFormData.fullName;
            if (editFormData.age)
                updateData.age = parseInt(editFormData.age);
            if (editFormData.gender)
                updateData.gender = editFormData.gender;
            if (editFormData.missingDate)
                updateData.missingDate = editFormData.missingDate;
            if (editFormData.lastSeenLocation)
                updateData.lastSeenLocation = editFormData.lastSeenLocation;
            if (editFormData.province)
                updateData.province = editFormData.province;
            if (editFormData.municipality !== undefined)
                updateData.municipality = editFormData.municipality;
            if (editFormData.description !== undefined)
                updateData.description = editFormData.description;
            if (editFormData.priority)
                updateData.priority = editFormData.priority;
            if (editFormData.status)
                updateData.status = editFormData.status;
            await api.put(`/missing-persons/${id}`, updateData);
            const refreshed = await api.get(`/missing-persons/${id}`);
            setDetails(refreshed.data.missingPerson);
            setShowEditModal(false);
            setSuccessMessage('Caso atualizado com sucesso!');
            setShowSuccessModal(true);
        }
        catch (error) {
            alert(error.response?.data?.message || 'Erro ao atualizar caso');
        }
        finally {
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
        }
        catch (error) {
            alert(error.response?.data?.message || 'Erro ao deletar caso');
        }
        finally {
            setLoading(false);
        }
    };
    if (!details)
        return _jsx("p", { children: "Carregando..." });
    return (_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm", children: [_jsxs("div", { className: "flex flex-wrap items-start justify-between gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-slate-500", children: new Date(details.missingDate).toLocaleDateString() }), _jsx("h2", { className: "text-3xl font-bold text-slate-900", children: details.fullName }), _jsxs("p", { className: "text-sm text-slate-500", children: ["\u00DAltimo local visto: ", _jsx("span", { className: "font-medium text-slate-800", children: details.lastSeenLocation })] })] }), _jsxs("div", { className: "space-y-2 text-right", children: [_jsx("span", { className: "rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600", children: details.priority }), _jsx("p", { className: "text-sm font-semibold text-amber-600", children: details.status })] })] }), details.photos[0] && (_jsx("div", { className: "mt-6 overflow-hidden rounded-xl", children: _jsx("img", { src: details.photos[0].url, alt: details.fullName, className: "h-64 w-full object-cover" }) })), _jsx("p", { className: "mt-4 text-slate-600", children: details.description }), details.reporter && (_jsxs("div", { className: "mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200", children: [_jsx("p", { className: "text-sm font-semibold text-slate-700 mb-1", children: "Reportado por:" }), _jsx("p", { className: "text-sm text-slate-900", children: details.reporter.fullName })] })), isModeratorOrAdmin && isPending && (_jsxs("div", { className: "mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg", children: [_jsx("p", { className: "text-sm font-semibold text-amber-800 mb-2", children: "\u26A0\uFE0F Caso pendente de aprova\u00E7\u00E3o" }), _jsx("p", { className: "text-xs text-amber-700", children: "Este caso ainda n\u00E3o foi aprovado e n\u00E3o est\u00E1 vis\u00EDvel para usu\u00E1rios comuns." })] })), isModeratorOrAdmin && details.approved === true && (_jsxs("div", { className: "mt-4 p-4 bg-green-50 border border-green-200 rounded-lg", children: [_jsx("p", { className: "text-sm font-semibold text-green-800", children: "\u2705 Caso aprovado" }), _jsx("p", { className: "text-xs text-green-700", children: "Este caso est\u00E1 dispon\u00EDvel para todos os usu\u00E1rios." })] })), isAdmin && (_jsxs("div", { className: "mt-4 p-4 bg-red-50 border border-red-200 rounded-lg", children: [_jsx("p", { className: "text-sm font-semibold text-red-800 mb-3", children: "A\u00E7\u00F5es Administrativas" }), _jsxs("div", { className: "flex gap-2", children: [_jsxs("button", { onClick: () => setShowEditModal(true), className: "flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700", children: [_jsx(Edit, { className: "h-4 w-4" }), "Editar Caso"] }), _jsxs("button", { onClick: () => setShowDeleteModal(true), className: "flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700", children: [_jsx(Trash2, { className: "h-4 w-4" }), "Deletar Caso"] })] })] })), _jsxs("div", { className: "mt-6 flex flex-wrap gap-3", children: [isModeratorOrAdmin && isPending && (_jsxs(_Fragment, { children: [_jsxs("button", { onClick: handleApprove, disabled: loading, className: "flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed", children: [_jsx(CheckCircle, { className: "h-4 w-4" }), "Aprovar Caso"] }), _jsxs("button", { onClick: () => setShowRejectModal(true), disabled: loading, className: "flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed", children: [_jsx(XCircle, { className: "h-4 w-4" }), "Rejeitar Caso"] })] })), canChangeStatus && details.approved === true && (_jsxs("div", { className: "w-full border-t border-slate-200 pt-4 mt-4", children: [_jsx("p", { className: "text-sm font-semibold text-slate-700 mb-3", children: "Alterar Status do Caso:" }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx("button", { onClick: () => handleStatusChangeClick('EM_INVESTIGACAO'), disabled: updatingStatus || details.status === 'EM_INVESTIGACAO', className: "flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm", children: "Em Investiga\u00E7\u00E3o" }), _jsx("button", { onClick: () => handleStatusChangeClick('AVISTADO'), disabled: updatingStatus || details.status === 'AVISTADO', className: "flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-600 text-white font-semibold hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm", children: "Avistado" }), _jsx("button", { onClick: () => handleStatusChangeClick('ENCONTRADO'), disabled: updatingStatus || details.status === 'ENCONTRADO', className: "flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm", children: "Encontrado" }), _jsx("button", { onClick: () => handleStatusChangeClick('ENCERRADO'), disabled: updatingStatus || details.status === 'ENCERRADO', className: "flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-600 text-white font-semibold hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm", children: "Encerrado" }), details.status !== 'ABERTO' && (_jsx("button", { onClick: () => handleStatusChangeClick('ABERTO'), disabled: updatingStatus || details.status === 'ABERTO', className: "flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm", children: "Reabrir Caso" }))] })] })), (details.approved === true || isModeratorOrAdmin) && (_jsxs(_Fragment, { children: [_jsxs("button", { onClick: () => setShowSightingModal(true), className: "flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors", children: [_jsx(Eye, { className: "h-4 w-4" }), "Reportar Avistamento"] }), _jsx(ShareButtons, { caseData: details }), _jsxs("button", { onClick: () => setShowChat(!showChat), className: "flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors", children: [_jsx(MessageSquare, { className: "h-4 w-4" }), "Chat"] }), _jsxs("button", { onClick: () => setShowReportModal(true), className: "flex items-center gap-2 px-4 py-2 rounded-lg border border-red-300 text-red-600 font-semibold hover:bg-red-50 transition-colors", children: [_jsx(AlertTriangle, { className: "h-4 w-4" }), "Denunciar"] })] }))] })] }), showChat && id && (_jsx(ChatWindow, { caseId: id, isOpen: showChat, onClose: () => setShowChat(false) })), showReportModal && id && details && (_jsx(ReportCaseModal, { caseId: id, caseName: details.fullName, isOpen: showReportModal, onClose: () => setShowReportModal(false) })), showSightingModal && id && details && (_jsx(SightingModal, { caseId: id, caseName: details.fullName, isOpen: showSightingModal, onClose: () => setShowSightingModal(false), onSuccess: async () => {
                    // Recarregar dados do caso após avistamento
                    const refreshed = await api.get(`/missing-persons/${id}`);
                    setDetails(refreshed.data.missingPerson);
                    setSuccessMessage('Avistamento reportado com sucesso!');
                    setShowSuccessModal(true);
                } })), showRejectModal && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50", children: _jsxs("div", { className: "bg-white rounded-lg p-6 max-w-md w-full mx-4", children: [_jsx("h3", { className: "text-lg font-semibold text-slate-900 mb-4", children: "Rejeitar Caso" }), _jsx("p", { className: "text-sm text-slate-600 mb-4", children: "Por favor, forne\u00E7a um motivo para rejeitar este caso. O reporter ser\u00E1 notificado." }), _jsx("textarea", { value: rejectReason, onChange: (e) => setRejectReason(e.target.value), placeholder: "Motivo da rejei\u00E7\u00E3o...", className: "w-full rounded-lg border border-slate-200 p-3 min-h-[100px] mb-4", rows: 4 }), _jsxs("div", { className: "flex gap-3 justify-end", children: [_jsx("button", { onClick: () => {
                                        setShowRejectModal(false);
                                        setRejectReason('');
                                    }, className: "px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors", children: "Cancelar" }), _jsx("button", { onClick: handleReject, disabled: loading || !rejectReason.trim(), className: "px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed", children: loading ? 'Rejeitando...' : 'Rejeitar' })] })] }) })), _jsx(ConfirmModal, { isOpen: showStatusModal, onClose: () => {
                    setShowStatusModal(false);
                    setPendingStatus(null);
                }, onConfirm: handleStatusChangeConfirm, title: `Alterar Status para "${pendingStatus ? getStatusLabel(pendingStatus) : ''}"`, message: pendingStatus ? getStatusMessage(pendingStatus) : '', confirmText: updatingStatus ? 'Alterando...' : 'Confirmar', cancelText: "Cancelar", variant: "info" }), _jsx(InfoModal, { isOpen: showSuccessModal, onClose: () => setShowSuccessModal(false), title: "Status Alterado", message: successMessage, variant: "success" }), _jsx(ConfirmModal, { isOpen: showDeleteSightingModal, onClose: () => {
                    setShowDeleteSightingModal(false);
                    setDeletingSightingId(null);
                }, onConfirm: async () => {
                    if (!deletingSightingId)
                        return;
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
                    }
                    catch (error) {
                        alert(error.response?.data?.message || 'Erro ao remover comentário');
                    }
                }, title: "Remover Coment\u00E1rio", message: "Deseja remover este coment\u00E1rio? Esta a\u00E7\u00E3o n\u00E3o pode ser desfeita.", confirmText: "Remover", cancelText: "Cancelar", variant: "warning" }), _jsxs("div", { className: "grid gap-6 lg:grid-cols-2", children: [_jsxs("div", { className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm", children: [_jsx("h3", { className: "text-lg font-semibold text-slate-900", children: "Reportar avistamento" }), _jsxs("form", { onSubmit: onSubmit, className: "mt-4 space-y-3", children: [_jsx("textarea", { ...register('description', { required: true }), placeholder: "Descreva o que viu...", className: "w-full rounded-lg border border-slate-200 p-3" }), _jsxs("div", { className: "grid gap-3 md:grid-cols-2", children: [_jsx("input", { ...register('province'), placeholder: "Prov\u00EDncia", className: "rounded-lg border border-slate-200 p-3" }), _jsx("input", { ...register('municipality'), placeholder: "Munic\u00EDpio", className: "rounded-lg border border-slate-200 p-3" })] }), _jsx("button", { type: "submit", className: "w-full rounded-xl bg-blue-600 py-3 font-semibold text-white", children: "Enviar alerta" })] })] }), _jsxs("div", { className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm", children: [_jsx("h3", { className: "text-lg font-semibold text-slate-900", children: "\u00DAltimas actualiza\u00E7\u00F5es" }), _jsx("div", { className: "mt-4 space-y-4", children: details.sightings.length === 0 ? (_jsx("p", { className: "text-sm text-slate-500 text-center py-4", children: "Nenhum avistamento reportado ainda" })) : (details.sightings.map((sighting) => (_jsxs("div", { className: "rounded-lg border border-slate-100 p-3 space-y-2 relative", children: [isModeratorOrAdmin && (_jsx("button", { onClick: () => {
                                                setDeletingSightingId(sighting.id);
                                                setShowDeleteSightingModal(true);
                                            }, className: "absolute top-2 right-2 p-1 rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors", title: "Remover coment\u00E1rio", children: _jsx(Trash2, { className: "h-4 w-4" }) })), sighting.evidenceUrl && (_jsx("div", { className: "rounded-lg overflow-hidden bg-slate-100", children: _jsx("img", { src: sighting.evidenceUrl, alt: "Evid\u00EAncia do avistamento", className: "w-full h-48 object-cover", onError: (e) => {
                                                    const target = e.currentTarget;
                                                    target.style.display = 'none';
                                                } }) })), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-slate-900", children: sighting.description }), sighting.reporterName && (_jsxs("p", { className: "text-xs text-slate-700 mt-1", children: [_jsx("span", { className: "font-semibold", children: "Reportado por:" }), " ", sighting.reporterName] })), sighting.location && (_jsxs("p", { className: "text-xs text-slate-600 mt-1", children: [_jsx("span", { className: "font-semibold", children: "Localiza\u00E7\u00E3o:" }), " ", sighting.location] })), _jsxs("p", { className: "text-xs text-slate-500 mt-1", children: [sighting.province, " ", sighting.municipality ? `- ${sighting.municipality}` : ''] }), _jsx("p", { className: "text-xs text-amber-600 mt-1", children: new Date(sighting.createdAt).toLocaleString('pt-AO') })] })] }, sighting.id)))) })] })] })] }));
}
