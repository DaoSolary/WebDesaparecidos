import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { api } from '../../api/client';
import { ConfirmModal } from '../../components/ConfirmModal';
import { InfoModal } from '../../components/InfoModal';
export function DuplicatesPage() {
    const [duplicates, setDuplicates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [detecting, setDetecting] = useState(false);
    const [filter, setFilter] = useState('');
    const [selectedDuplicate, setSelectedDuplicate] = useState(null);
    const [showResolveModal, setShowResolveModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [resolutionStatus, setResolutionStatus] = useState('');
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
        }
        catch (error) {
            console.error('Erro ao carregar duplicados:', error);
            alert('Erro ao carregar casos duplicados');
        }
        finally {
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
        }
        catch (error) {
            alert(error.response?.data?.message || 'Erro ao detectar casos duplicados');
        }
        finally {
            setDetecting(false);
        }
    };
    const handleResolve = (duplicate, status) => {
        setSelectedDuplicate(duplicate);
        setResolutionStatus(status);
        setResolutionNotes('');
        setDeleteDuplicate(false);
        setShowResolveModal(true);
    };
    const confirmResolve = async () => {
        if (!selectedDuplicate)
            return;
        try {
            await api.patch(`/duplicates/${selectedDuplicate.id}/resolve`, {
                status: resolutionStatus,
                resolutionNotes,
                deleteDuplicate: resolutionStatus === 'CONFIRMADO' ? deleteDuplicate : false,
            });
            setSuccessMessage(resolutionStatus === 'CONFIRMADO' && deleteDuplicate
                ? 'Caso duplicado confirmado e removido com sucesso!'
                : 'Status do caso duplicado atualizado com sucesso!');
            setShowSuccessModal(true);
            setShowResolveModal(false);
            setSelectedDuplicate(null);
            await loadDuplicates();
        }
        catch (error) {
            alert(error.response?.data?.message || 'Erro ao resolver caso duplicado');
        }
    };
    const getStatusColor = (status) => {
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
    const getStatusLabel = (status) => {
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
        return (_jsx("div", { className: "flex items-center justify-center min-h-screen", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" }), _jsx("p", { className: "mt-4 text-slate-600", children: "Carregando casos duplicados..." })] }) }));
    }
    return (_jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h1", { className: "text-3xl font-bold text-slate-900", children: "Detec\u00E7\u00E3o de Casos Duplicados" }), _jsx("p", { className: "mt-2 text-slate-600", children: "Detecte e gerencie casos duplicados na plataforma" })] }), _jsxs("div", { className: "mb-6 flex gap-4", children: [_jsxs("button", { onClick: handleDetect, disabled: detecting, className: "px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2", children: [_jsx(RefreshCw, { className: `h-5 w-5 ${detecting ? 'animate-spin' : ''}` }), detecting ? 'Detectando...' : 'Detectar Duplicados'] }), _jsxs("select", { value: filter, onChange: (e) => setFilter(e.target.value), className: "px-4 py-2 rounded-lg border border-slate-300 bg-white", children: [_jsx("option", { value: "", children: "Todos os Status" }), _jsx("option", { value: "PENDENTE", children: "Pendente" }), _jsx("option", { value: "CONFIRMADO", children: "Confirmado" }), _jsx("option", { value: "REJEITADO", children: "Rejeitado" }), _jsx("option", { value: "RESOLVIDO", children: "Resolvido" })] })] }), _jsx("div", { className: "space-y-4", children: duplicates.length === 0 ? (_jsxs("div", { className: "text-center py-12 bg-white rounded-lg border border-slate-200", children: [_jsx(AlertTriangle, { className: "h-16 w-16 text-slate-300 mx-auto mb-4" }), _jsx("p", { className: "text-slate-600", children: "Nenhum caso duplicado encontrado" }), _jsx("p", { className: "text-sm text-slate-500 mt-2", children: "Clique em \"Detectar Duplicados\" para iniciar a an\u00E1lise" })] })) : (duplicates.map((dup) => (_jsxs("div", { className: "bg-white rounded-lg border border-slate-200 p-6 shadow-sm", children: [_jsxs("div", { className: "flex items-start justify-between mb-4", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsx("span", { className: `px-3 py-1 rounded text-sm font-semibold ${getStatusColor(dup.status)}`, children: getStatusLabel(dup.status) }), _jsxs("span", { className: "text-sm text-slate-600", children: ["Similaridade: ", (dup.similarityScore * 100).toFixed(1), "%"] })] }), _jsxs("p", { className: "text-xs text-slate-500", children: ["Detectado em ", new Date(dup.detectedAt).toLocaleString('pt-AO')] })] }), dup.status === 'PENDENTE' && (_jsxs("div", { className: "flex gap-2", children: [_jsxs("button", { onClick: () => handleResolve(dup, 'CONFIRMADO'), className: "px-3 py-1 text-sm rounded bg-red-600 text-white hover:bg-red-700 flex items-center gap-1", children: [_jsx(CheckCircle, { className: "h-4 w-4" }), "Confirmar"] }), _jsxs("button", { onClick: () => handleResolve(dup, 'REJEITADO'), className: "px-3 py-1 text-sm rounded bg-green-600 text-white hover:bg-green-700 flex items-center gap-1", children: [_jsx(XCircle, { className: "h-4 w-4" }), "Rejeitar"] })] }))] }), _jsxs("div", { className: "grid md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "border border-slate-200 rounded-lg p-4", children: [_jsxs("h3", { className: "font-semibold text-slate-900 mb-3 flex items-center gap-2", children: [_jsx(CheckCircle, { className: "h-5 w-5 text-green-600" }), "Caso Original"] }), _jsxs("div", { className: "space-y-2", children: [dup.originalCase.photos[0] && (_jsx("img", { src: dup.originalCase.photos[0].url, alt: dup.originalCase.fullName, className: "w-full h-32 object-cover rounded" })), _jsx("p", { className: "font-semibold text-slate-900", children: dup.originalCase.fullName }), _jsxs("p", { className: "text-sm text-slate-600", children: ["Idade: ", dup.originalCase.age || 'N/A', " | Data: ", new Date(dup.originalCase.missingDate).toLocaleDateString('pt-AO')] }), _jsxs("p", { className: "text-sm text-slate-600", children: [dup.originalCase.province, " ", dup.originalCase.municipality ? `- ${dup.originalCase.municipality}` : ''] }), _jsxs("p", { className: "text-xs text-slate-500", children: ["Reportado por: ", dup.originalCase.reporter.fullName] }), _jsx("a", { href: `/casos/${dup.originalCase.id}`, target: "_blank", rel: "noopener noreferrer", className: "text-xs text-blue-600 hover:underline", children: "Ver caso completo \u2192" })] })] }), _jsxs("div", { className: "border border-red-200 rounded-lg p-4 bg-red-50", children: [_jsxs("h3", { className: "font-semibold text-slate-900 mb-3 flex items-center gap-2", children: [_jsx(AlertTriangle, { className: "h-5 w-5 text-red-600" }), "Caso Duplicado"] }), _jsxs("div", { className: "space-y-2", children: [dup.duplicateCase.photos[0] && (_jsx("img", { src: dup.duplicateCase.photos[0].url, alt: dup.duplicateCase.fullName, className: "w-full h-32 object-cover rounded" })), _jsx("p", { className: "font-semibold text-slate-900", children: dup.duplicateCase.fullName }), _jsxs("p", { className: "text-sm text-slate-600", children: ["Idade: ", dup.duplicateCase.age || 'N/A', " | Data: ", new Date(dup.duplicateCase.missingDate).toLocaleDateString('pt-AO')] }), _jsxs("p", { className: "text-sm text-slate-600", children: [dup.duplicateCase.province, " ", dup.duplicateCase.municipality ? `- ${dup.duplicateCase.municipality}` : ''] }), _jsxs("p", { className: "text-xs text-slate-500", children: ["Reportado por: ", dup.duplicateCase.reporter.fullName] }), _jsx("a", { href: `/casos/${dup.duplicateCase.id}`, target: "_blank", rel: "noopener noreferrer", className: "text-xs text-blue-600 hover:underline", children: "Ver caso completo \u2192" })] })] })] })] }, dup.id)))) }), _jsxs(ConfirmModal, { isOpen: showResolveModal, onClose: () => {
                    setShowResolveModal(false);
                    setSelectedDuplicate(null);
                    setResolutionNotes('');
                    setDeleteDuplicate(false);
                }, onConfirm: confirmResolve, title: `${resolutionStatus === 'CONFIRMADO' ? 'Confirmar' : resolutionStatus === 'REJEITADO' ? 'Rejeitar' : 'Resolver'} Caso Duplicado`, message: selectedDuplicate
                    ? `Deseja ${resolutionStatus === 'CONFIRMADO' ? 'confirmar' : resolutionStatus === 'REJEITADO' ? 'rejeitar' : 'resolver'} este caso duplicado?`
                    : '', confirmText: "Confirmar", cancelText: "Cancelar", variant: resolutionStatus === 'CONFIRMADO' ? 'warning' : 'info', children: [resolutionStatus === 'CONFIRMADO' && (_jsx("div", { className: "mt-4", children: _jsxs("label", { className: "flex items-center gap-2 mb-2", children: [_jsx("input", { type: "checkbox", checked: deleteDuplicate, onChange: (e) => setDeleteDuplicate(e.target.checked), className: "rounded" }), _jsx("span", { className: "text-sm text-slate-700", children: "Excluir caso duplicado ap\u00F3s confirma\u00E7\u00E3o" })] }) })), _jsxs("div", { className: "mt-4", children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-2", children: "Notas (opcional)" }), _jsx("textarea", { value: resolutionNotes, onChange: (e) => setResolutionNotes(e.target.value), placeholder: "Adicione notas sobre a resolu\u00E7\u00E3o...", className: "w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900", rows: 3 })] })] }), _jsx(InfoModal, { isOpen: showSuccessModal, onClose: () => {
                    setShowSuccessModal(false);
                    setSuccessMessage('');
                }, title: "Sucesso", message: successMessage, variant: "success" })] }));
}
