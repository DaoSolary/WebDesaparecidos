import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Mail, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { api } from '../api/client';
export function ForgotPasswordModal({ isOpen, onClose }) {
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState();
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, formState: { isSubmitting }, reset, } = useForm();
    const onSubmit = handleSubmit(async (data) => {
        try {
            setError(undefined);
            setLoading(true);
            await api.post('/auth/forgot-password', { email: data.email });
            setSuccess(true);
            reset();
        }
        catch (err) {
            setError(err.response?.data?.message || 'Erro ao solicitar recuperação de senha. Tente novamente.');
        }
        finally {
            setLoading(false);
        }
    });
    const handleClose = () => {
        setSuccess(false);
        setError(undefined);
        reset();
        onClose();
    };
    if (!isOpen)
        return null;
    return (_jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4", children: [_jsx("div", { className: "fixed inset-0 bg-black/50 transition-opacity", onClick: handleClose }), _jsx("div", { className: "relative bg-white rounded-2xl shadow-xl max-w-md w-full z-10", children: _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex items-start justify-between mb-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-xl font-semibold text-slate-900 mb-1", children: "Recuperar Senha" }), _jsx("p", { className: "text-sm text-slate-600", children: "Digite seu email cadastrado para receber instru\u00E7\u00F5es de recupera\u00E7\u00E3o" })] }), _jsx("button", { onClick: handleClose, className: "flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors", children: _jsx(X, { className: "h-5 w-5" }) })] }), success ? (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-start gap-3 rounded-lg bg-green-50 p-4 text-sm text-green-700", children: [_jsx(CheckCircle, { className: "h-5 w-5 flex-shrink-0 mt-0.5" }), _jsxs("div", { children: [_jsx("p", { className: "font-medium mb-1", children: "Email enviado com sucesso!" }), _jsx("p", { className: "text-green-600", children: "Se o email estiver cadastrado, voc\u00EA receber\u00E1 um link para recupera\u00E7\u00E3o de senha. Verifique sua caixa de entrada e spam." })] })] }), _jsx("button", { onClick: handleClose, className: "w-full rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700 transition-colors", children: "Fechar" })] })) : (_jsxs("form", { onSubmit: onSubmit, className: "space-y-4", children: [error && (_jsxs("div", { className: "flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700", children: [_jsx(AlertCircle, { className: "h-5 w-5 flex-shrink-0 mt-0.5" }), _jsx("span", { children: error })] })), _jsxs("div", { children: [_jsx("label", { htmlFor: "forgot-email", className: "mb-2 block text-sm font-medium text-slate-700", children: "Email" }), _jsxs("div", { className: "relative", children: [_jsx(Mail, { className: "absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" }), _jsx("input", { id: "forgot-email", type: "email", ...register('email', {
                                                        required: 'Email é obrigatório',
                                                        pattern: {
                                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                            message: 'Email inválido'
                                                        }
                                                    }), className: "w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20", placeholder: "seu@email.com", disabled: loading || isSubmitting })] })] }), _jsxs("div", { className: "flex gap-3 pt-2", children: [_jsx("button", { type: "button", onClick: handleClose, disabled: loading || isSubmitting, className: "flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed", children: "Cancelar" }), _jsx("button", { type: "submit", disabled: loading || isSubmitting, className: "flex-1 flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed", children: (loading || isSubmitting) ? (_jsxs(_Fragment, { children: [_jsx(Loader, { className: "h-4 w-4 animate-spin" }), "Enviando..."] })) : ('Enviar') })] })] }))] }) })] }));
}
