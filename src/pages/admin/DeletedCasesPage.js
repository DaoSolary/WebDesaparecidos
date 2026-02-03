import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Trash2, RotateCcw, Calendar } from 'lucide-react';
import { api } from '../../api/client';
import { ConfirmModal } from '../../components/ConfirmModal';
import { InfoModal } from '../../components/InfoModal';
export function DeletedCasesPage() {
    const [deletedCases, setDeletedCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showRestoreModal, setShowRestoreModal] = useState(false);
    const [restoringId, setRestoringId] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [filter, setFilter] = useState('');
    useEffect(() => {
        loadDeletedCases();
    }, [filter]);
    const loadDeletedCases = async () => {
        try {
            setLoading(true);
            const params = filter ? `?restored=${filter === 'restored'}` : '';
            const { data } = await api.get(`/deleted-cases${params}`);
            setDeletedCases(data.deletedCases || []);
        }
        catch (error) {
            console.error('Erro ao carregar casos deletados:', error);
            alert('Erro ao carregar casos deletados');
        }
        finally {
            setLoading(false);
        }
    };
    const handleRestore = async () => {
        if (!restoringId)
            return;
        try {
            await api.post(`/deleted-cases/${restoringId}/restore`);
            setSuccessMessage('Caso restaurado com sucesso!');
            setShowSuccessModal(true);
            setShowRestoreModal(false);
            setRestoringId(null);
            await loadDeletedCases();
        }
        catch (error) {
            alert(error.response?.data?.message || 'Erro ao restaurar caso');
        }
    };
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center min-h-screen", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" }), _jsx("p", { className: "mt-4 text-slate-600", children: "Carregando..." })] }) }));
    }
    return (_jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h1", { className: "text-3xl font-bold text-slate-900", children: "Casos Deletados" }), _jsx("p", { className: "mt-2 text-slate-600", children: "Gerencie e restaure casos deletados acidentalmente" })] }), _jsx("div", { className: "mb-6", children: _jsxs("select", { value: filter, onChange: (e) => setFilter(e.target.value), className: "px-4 py-2 rounded-lg border border-slate-300 bg-white", children: [_jsx("option", { value: "", children: "Todos" }), _jsx("option", { value: "not-restored", children: "N\u00E3o Restaurados" }), _jsx("option", { value: "restored", children: "Restaurados" })] }) }), _jsx("div", { className: "space-y-4", children: deletedCases.length === 0 ? (_jsxs("div", { className: "text-center py-12 bg-white rounded-lg border border-slate-200", children: [_jsx(Trash2, { className: "h-16 w-16 text-slate-300 mx-auto mb-4" }), _jsx("p", { className: "text-slate-600", children: "Nenhum caso deletado encontrado" })] })) : (deletedCases.map((deletedCase) => (_jsx("div", { className: "bg-white rounded-lg border border-slate-200 p-6", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsx("h3", { className: "text-xl font-semibold text-slate-900", children: deletedCase.caseData?.fullName || 'Caso sem nome' }), deletedCase.restoredAt ? (_jsx("span", { className: "px-3 py-1 rounded text-sm font-semibold bg-green-100 text-green-700", children: "Restaurado" })) : (_jsx("span", { className: "px-3 py-1 rounded text-sm font-semibold bg-red-100 text-red-700", children: "Deletado" }))] }), _jsxs("div", { className: "space-y-1 text-sm text-slate-600", children: [_jsxs("p", { children: [_jsx("strong", { children: "ID do Caso:" }), " ", deletedCase.caseId] }), deletedCase.caseData?.age && (_jsxs("p", { children: [_jsx("strong", { children: "Idade:" }), " ", deletedCase.caseData.age] })), deletedCase.caseData?.province && (_jsxs("p", { children: [_jsx("strong", { children: "Prov\u00EDncia:" }), " ", deletedCase.caseData.province] })), deletedCase.deletionReason && (_jsxs("p", { children: [_jsx("strong", { children: "Motivo da Dele\u00E7\u00E3o:" }), " ", deletedCase.deletionReason] })), _jsxs("p", { className: "flex items-center gap-1", children: [_jsx(Calendar, { className: "h-4 w-4" }), "Deletado em ", new Date(deletedCase.deletedAt).toLocaleString('pt-AO'), " por", ' ', deletedCase.deletedByUser.fullName, " (", deletedCase.deletedByUser.role, ")"] }), deletedCase.restoredAt && deletedCase.restoredByUser && (_jsxs("p", { className: "text-green-600", children: ["Restaurado em ", new Date(deletedCase.restoredAt).toLocaleString('pt-AO'), " por", ' ', deletedCase.restoredByUser.fullName] }))] })] }), !deletedCase.restoredAt && (_jsxs("button", { onClick: () => {
                                    setRestoringId(deletedCase.id);
                                    setShowRestoreModal(true);
                                }, className: "px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 flex items-center gap-2", children: [_jsx(RotateCcw, { className: "h-4 w-4" }), "Restaurar"] }))] }) }, deletedCase.id)))) }), _jsx(ConfirmModal, { isOpen: showRestoreModal, onClose: () => {
                    setShowRestoreModal(false);
                    setRestoringId(null);
                }, onConfirm: handleRestore, title: "Restaurar Caso", message: "Tem certeza que deseja restaurar este caso? O caso ser\u00E1 restaurado com todos os seus dados originais.", confirmText: "Restaurar", cancelText: "Cancelar", variant: "info" }), _jsx(InfoModal, { isOpen: showSuccessModal, onClose: () => {
                    setShowSuccessModal(false);
                    setSuccessMessage('');
                }, title: "Sucesso", message: successMessage, variant: "success" })] }));
}
