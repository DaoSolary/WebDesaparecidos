import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { api } from '../api/client';
import { X, AlertTriangle, CheckCircle } from 'lucide-react';
export function ReportCaseModal({ isOpen, onClose, caseId, caseName }) {
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState();
    const { register, handleSubmit, formState: { isSubmitting }, reset, } = useForm();
    const onSubmit = handleSubmit(async (data) => {
        try {
            setError(undefined);
            await api.post('/reports', {
                missingPersonId: caseId,
                ...data,
            });
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                reset();
                onClose();
            }, 2000);
        }
        catch (err) {
            setError(err.response?.data?.message || 'Erro ao reportar caso. Tente novamente.');
        }
    });
    if (!isOpen)
        return null;
    return (_jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4", children: [_jsx("div", { className: "fixed inset-0 bg-black/50", onClick: onClose }), _jsx("div", { className: "relative bg-white rounded-2xl shadow-xl max-w-md w-full z-10", children: _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex items-start justify-between mb-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-xl font-semibold text-slate-900 mb-1", children: "Denunciar Caso" }), _jsxs("p", { className: "text-sm text-slate-600", children: ["Reportar: ", _jsx("strong", { children: caseName })] })] }), _jsx("button", { onClick: onClose, className: "text-slate-400 hover:text-slate-600", children: _jsx(X, { className: "h-5 w-5" }) })] }), success ? (_jsxs("div", { className: "flex items-center gap-3 rounded-lg bg-green-50 p-4 text-green-700", children: [_jsx(CheckCircle, { className: "h-5 w-5" }), _jsx("p", { children: "Den\u00FAncia enviada com sucesso. Ser\u00E1 analisada por um moderador." })] })) : (_jsxs("form", { onSubmit: onSubmit, className: "space-y-4", children: [error && (_jsxs("div", { className: "flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700", children: [_jsx(AlertTriangle, { className: "h-5 w-5 flex-shrink-0 mt-0.5" }), _jsx("span", { children: error })] })), _jsxs("div", { children: [_jsx("label", { className: "mb-2 block text-sm font-medium text-slate-700", children: "Motivo da Den\u00FAncia *" }), _jsxs("select", { ...register('reason', { required: 'Motivo é obrigatório' }), className: "w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20", children: [_jsx("option", { value: "", children: "Selecione um motivo" }), _jsx("option", { value: "Caso falso ou fraudulento", children: "Caso falso ou fraudulento" }), _jsx("option", { value: "Informa\u00E7\u00F5es incorretas", children: "Informa\u00E7\u00F5es incorretas" }), _jsx("option", { value: "Foto n\u00E3o corresponde", children: "Foto n\u00E3o corresponde" }), _jsx("option", { value: "Spam ou abuso", children: "Spam ou abuso" }), _jsx("option", { value: "Outro", children: "Outro" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-2 block text-sm font-medium text-slate-700", children: "Descri\u00E7\u00E3o *" }), _jsx("textarea", { ...register('description', {
                                                required: 'Descrição é obrigatória',
                                                minLength: { value: 10, message: 'Mínimo 10 caracteres' }
                                            }), rows: 4, className: "w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20", placeholder: "Descreva o motivo da den\u00FAncia em detalhes..." })] }), _jsxs("div", { className: "flex gap-3 pt-2", children: [_jsx("button", { type: "button", onClick: onClose, className: "flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors", children: "Cancelar" }), _jsx("button", { type: "submit", disabled: isSubmitting, className: "flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed", children: isSubmitting ? 'Enviando...' : 'Enviar Denúncia' })] })] }))] }) })] }));
}
