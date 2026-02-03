import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../store/useAuth';
import { useState, useEffect } from 'react';
import { AlertCircle, LogIn, Mail, Lock, CheckCircle } from 'lucide-react';
import { ForgotPasswordModal } from '../components/ForgotPasswordModal';
import { InfoModal } from '../components/InfoModal';
export function LoginPage() {
    const { login, user } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState();
    const [success, setSuccess] = useState(false);
    const [userName, setUserName] = useState();
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [showBlockedModal, setShowBlockedModal] = useState(false);
    const [blockedReason, setBlockedReason] = useState('');
    const { register, handleSubmit, formState: { isSubmitting }, } = useForm();
    // Atualizar nome do usuário quando o user mudar
    useEffect(() => {
        if (user?.fullName && success) {
            setUserName(user.fullName);
        }
    }, [user, success]);
    const onSubmit = handleSubmit(async (values) => {
        try {
            setError(undefined);
            setSuccess(false);
            await login(values.email, values.password);
            setSuccess(true);
            // Aguardar um pouco para o fetchUser completar
            setTimeout(() => {
                navigate('/dashboard');
            }, 2500);
        }
        catch (err) {
            setSuccess(false);
            // Verificar se o usuário está bloqueado
            if (err.response?.data?.blocked) {
                setBlockedReason(err.response?.data?.reason || 'Usuário bloqueado pelo administrador');
                setShowBlockedModal(true);
                setError(undefined);
            }
            else {
                setError(err.response?.data?.message || 'Erro ao fazer login. Verifique suas credenciais.');
            }
        }
    });
    return (_jsxs("div", { className: "mx-auto max-w-md", children: [_jsxs("div", { className: "rounded-2xl border border-slate-200 bg-white p-8 shadow-lg", children: [_jsxs("div", { className: "mb-6 text-center", children: [_jsx("div", { className: "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100", children: _jsx(LogIn, { className: "h-8 w-8 text-blue-600" }) }), _jsx("h2", { className: "text-2xl font-bold text-slate-900", children: "Entrar na sua conta" }), _jsx("p", { className: "mt-2 text-sm text-slate-500", children: "Acesse o painel e contribua para localizar pessoas desaparecidas" })] }), success && (_jsxs("div", { className: "mb-4 flex items-start gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700", children: [_jsx(CheckCircle, { className: "h-5 w-5 flex-shrink-0 mt-0.5" }), _jsxs("span", { children: ["Bem vindo ", userName || user?.fullName || 'ao sistema', " ao sistema! Redirecionando..."] })] })), error && (_jsxs("div", { className: "mb-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700", children: [_jsx(AlertCircle, { className: "h-5 w-5 flex-shrink-0 mt-0.5" }), _jsx("span", { children: error })] })), _jsxs("form", { onSubmit: onSubmit, className: "space-y-5", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "email", className: "mb-2 block text-sm font-medium text-slate-700", children: "Email" }), _jsxs("div", { className: "relative", children: [_jsx(Mail, { className: "absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" }), _jsx("input", { id: "email", type: "email", ...register('email', { required: 'Email é obrigatório' }), className: "w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors", placeholder: "seu@email.com" })] })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("label", { htmlFor: "password", className: "block text-sm font-medium text-slate-700", children: "Palavra-passe" }), _jsx("button", { type: "button", onClick: () => setShowForgotPassword(true), className: "text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline", children: "Esqueceu a senha?" })] }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" }), _jsx("input", { id: "password", type: "password", ...register('password', { required: 'Palavra-passe é obrigatória' }), className: "w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" })] })] }), _jsx("button", { type: "submit", disabled: isSubmitting, className: "w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors", children: isSubmitting ? (_jsxs("span", { className: "flex items-center justify-center gap-2", children: [_jsxs("svg", { className: "h-5 w-5 animate-spin", viewBox: "0 0 24 24", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4", fill: "none" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })] }), "A entrar..."] })) : ('Entrar') })] }), _jsx("div", { className: "mt-6 text-center", children: _jsxs("p", { className: "text-sm text-slate-600", children: ["N\u00E3o tem conta?", ' ', _jsx(Link, { to: "/registar", className: "font-semibold text-blue-600 hover:text-blue-700 hover:underline", children: "Crie uma conta" })] }) }), _jsx("div", { className: "mt-6 border-t border-slate-200 pt-6", children: _jsxs("p", { className: "text-xs text-center text-slate-500", children: ["Ao entrar, voc\u00EA concorda com nossos", ' ', _jsx(Link, { to: "/termos", className: "text-blue-600 hover:underline", children: "Termos de Uso" }), ' ', "e", ' ', _jsx(Link, { to: "/privacidade", className: "text-blue-600 hover:underline", children: "Pol\u00EDtica de Privacidade" })] }) })] }), _jsx(ForgotPasswordModal, { isOpen: showForgotPassword, onClose: () => setShowForgotPassword(false) }), _jsx(InfoModal, { isOpen: showBlockedModal, onClose: () => setShowBlockedModal(false), title: "Usu\u00E1rio Bloqueado", message: _jsxs("div", { children: [_jsx("p", { className: "mb-2", children: "Sua conta foi bloqueada pelo administrador." }), blockedReason && (_jsxs("p", { className: "mb-2 text-sm text-slate-600", children: [_jsx("strong", { children: "Motivo:" }), " ", blockedReason] })), _jsx("p", { className: "text-sm text-slate-600", children: "Entre em contacto com o suporte para mais informa\u00E7\u00F5es." })] }), variant: "warning" })] }));
}
