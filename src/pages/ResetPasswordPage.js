import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { Lock, AlertCircle, CheckCircle, Eye, EyeOff, Loader } from 'lucide-react';
export function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');
    const [loading, setLoading] = useState(true);
    const [validToken, setValidToken] = useState(false);
    const [tokenError, setTokenError] = useState();
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [userEmail, setUserEmail] = useState();
    const { register, handleSubmit, formState: { isSubmitting }, watch, } = useForm();
    const password = watch('password');
    useEffect(() => {
        const validateToken = async () => {
            if (!token) {
                setTokenError('Token não fornecido. Verifique o link do email.');
                setLoading(false);
                return;
            }
            try {
                const { data } = await api.get(`/auth/reset-password/${token}`);
                if (data.valid === true) {
                    setValidToken(true);
                    setUserEmail(data.email);
                }
                else {
                    setTokenError(data.message || 'Token inválido ou expirado.');
                }
            }
            catch (err) {
                const errorMessage = err.response?.data?.message ||
                    err.response?.data?.valid === false
                    ? err.response?.data?.message
                    : 'Token inválido ou expirado. Solicite um novo link de recuperação.';
                setTokenError(errorMessage);
            }
            finally {
                setLoading(false);
            }
        };
        validateToken();
    }, [token]);
    const onSubmit = handleSubmit(async (data) => {
        if (data.password !== data.confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }
        if (data.password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }
        try {
            setError(undefined);
            await api.post('/auth/reset-password', {
                token,
                password: data.password,
            });
            setSuccess(true);
            setTimeout(() => {
                navigate('/entrar');
            }, 3000);
        }
        catch (err) {
            setError(err.response?.data?.message ||
                'Erro ao redefinir senha. O token pode ter expirado. Solicite um novo link.');
        }
    });
    if (loading) {
        return (_jsx("div", { className: "mx-auto max-w-md", children: _jsxs("div", { className: "rounded-2xl border border-slate-200 bg-white p-8 shadow-lg", children: [_jsx("div", { className: "flex items-center justify-center py-8", children: _jsx(Loader, { className: "h-8 w-8 animate-spin text-blue-600" }) }), _jsx("p", { className: "text-center text-slate-600", children: "Validando token..." })] }) }));
    }
    if (tokenError || !validToken) {
        return (_jsx("div", { className: "mx-auto max-w-md", children: _jsxs("div", { className: "rounded-2xl border border-slate-200 bg-white p-8 shadow-lg", children: [_jsxs("div", { className: "mb-6 text-center", children: [_jsx("div", { className: "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100", children: _jsx(AlertCircle, { className: "h-8 w-8 text-red-600" }) }), _jsx("h2", { className: "text-2xl font-bold text-slate-900", children: "Token Inv\u00E1lido" }), _jsx("p", { className: "mt-2 text-sm text-slate-500", children: tokenError || 'O link de recuperação não é válido ou expirou.' })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "rounded-lg bg-amber-50 p-4 text-sm text-amber-800", children: [_jsx("p", { className: "font-medium mb-1", children: "O que fazer agora?" }), _jsxs("ul", { className: "list-disc list-inside space-y-1 text-amber-700", children: [_jsx("li", { children: "Verifique se copiou o link completo do email" }), _jsx("li", { children: "Os links expiram ap\u00F3s 1 hora" }), _jsx("li", { children: "Solicite um novo link de recupera\u00E7\u00E3o" })] })] }), _jsxs("div", { className: "flex gap-3", children: [_jsx(Link, { to: "/entrar", className: "flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-center font-semibold text-white hover:bg-blue-700 transition-colors", children: "Voltar ao Login" }), _jsx("button", { onClick: () => window.location.reload(), className: "flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-center font-semibold text-slate-700 hover:bg-slate-50 transition-colors", children: "Tentar Novamente" })] })] })] }) }));
    }
    if (success) {
        return (_jsx("div", { className: "mx-auto max-w-md", children: _jsxs("div", { className: "rounded-2xl border border-slate-200 bg-white p-8 shadow-lg", children: [_jsxs("div", { className: "mb-6 text-center", children: [_jsx("div", { className: "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100", children: _jsx(CheckCircle, { className: "h-8 w-8 text-green-600" }) }), _jsx("h2", { className: "text-2xl font-bold text-slate-900", children: "Senha Redefinida!" }), _jsx("p", { className: "mt-2 text-sm text-slate-500", children: "Sua senha foi redefinida com sucesso. Voc\u00EA ser\u00E1 redirecionado para a p\u00E1gina de login." })] }), _jsxs("div", { className: "rounded-lg bg-green-50 p-4 text-sm text-green-700", children: [_jsx("p", { className: "font-medium", children: "Pr\u00F3ximos passos:" }), _jsxs("ul", { className: "mt-2 list-disc list-inside space-y-1 text-green-600", children: [_jsx("li", { children: "Use sua nova senha para fazer login" }), _jsx("li", { children: "Mantenha sua senha segura" })] })] }), _jsx(Link, { to: "/entrar", className: "mt-6 block w-full rounded-lg bg-blue-600 px-4 py-2.5 text-center font-semibold text-white hover:bg-blue-700 transition-colors", children: "Ir para Login" })] }) }));
    }
    return (_jsx("div", { className: "mx-auto max-w-md", children: _jsxs("div", { className: "rounded-2xl border border-slate-200 bg-white p-8 shadow-lg", children: [_jsxs("div", { className: "mb-6 text-center", children: [_jsx("div", { className: "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100", children: _jsx(Lock, { className: "h-8 w-8 text-blue-600" }) }), _jsx("h2", { className: "text-2xl font-bold text-slate-900", children: "Redefinir Senha" }), _jsxs("p", { className: "mt-2 text-sm text-slate-500", children: [userEmail && (_jsxs("span", { children: ["Defina uma nova senha para ", _jsx("strong", { children: userEmail })] })), !userEmail && 'Defina uma nova senha para sua conta'] })] }), error && (_jsxs("div", { className: "mb-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700", children: [_jsx(AlertCircle, { className: "h-5 w-5 flex-shrink-0 mt-0.5" }), _jsx("span", { children: error })] })), _jsxs("form", { onSubmit: onSubmit, className: "space-y-5", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "password", className: "mb-2 block text-sm font-medium text-slate-700", children: "Nova Senha" }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" }), _jsx("input", { id: "password", type: showPassword ? 'text' : 'password', ...register('password', {
                                                required: 'Senha é obrigatória',
                                                minLength: {
                                                    value: 6,
                                                    message: 'A senha deve ter pelo menos 6 caracteres'
                                                }
                                            }), className: "w-full rounded-lg border border-slate-300 bg-white pl-10 pr-10 py-2.5 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" }), _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600", children: showPassword ? _jsx(EyeOff, { className: "h-5 w-5" }) : _jsx(Eye, { className: "h-5 w-5" }) })] }), _jsx("p", { className: "mt-1 text-xs text-slate-500", children: "M\u00EDnimo de 6 caracteres" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "confirmPassword", className: "mb-2 block text-sm font-medium text-slate-700", children: "Confirmar Nova Senha" }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" }), _jsx("input", { id: "confirmPassword", type: showConfirmPassword ? 'text' : 'password', ...register('confirmPassword', {
                                                required: 'Confirmação de senha é obrigatória',
                                                validate: (value) => value === password || 'As senhas não coincidem'
                                            }), className: "w-full rounded-lg border border-slate-300 bg-white pl-10 pr-10 py-2.5 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" }), _jsx("button", { type: "button", onClick: () => setShowConfirmPassword(!showConfirmPassword), className: "absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600", children: showConfirmPassword ? _jsx(EyeOff, { className: "h-5 w-5" }) : _jsx(Eye, { className: "h-5 w-5" }) })] })] }), _jsx("button", { type: "submit", disabled: isSubmitting, className: "w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors", children: isSubmitting ? (_jsxs("span", { className: "flex items-center justify-center gap-2", children: [_jsx(Loader, { className: "h-5 w-5 animate-spin" }), "Redefinindo..."] })) : ('Redefinir Senha') })] }), _jsx("div", { className: "mt-6 text-center", children: _jsx(Link, { to: "/entrar", className: "text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline", children: "Voltar ao Login" }) })] }) }));
}
