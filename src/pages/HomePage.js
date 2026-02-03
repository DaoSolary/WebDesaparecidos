import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, Map, Users, LogIn, Mail, Lock, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../store/useAuth';
import { useState } from 'react';
const features = [
    {
        icon: AlertTriangle,
        title: 'Alertas instantâneos',
        description: 'Notificações push por proximidade e filtros personalizados.',
        route: '/alertas',
        allowedRoles: ['CIDADAO', 'FAMILIAR', 'VOLUNTARIO', 'AUTORIDADE', 'ADMIN'],
    },
    {
        icon: Map,
        title: 'Geolocalização inteligente',
        description: 'Heatmap, últimas coordenadas e áreas sugeridas de busca.',
        route: '/geolocalizacao',
        allowedRoles: ['AUTORIDADE', 'ADMIN', 'MODERADOR'],
    },
    {
        icon: Users,
        title: 'Rede colaborativa',
        description: 'Familiares, cidadãos e autoridades conectados em um único canal.',
        route: '/rede-colaborativa',
        allowedRoles: ['CIDADAO', 'FAMILIAR', 'VOLUNTARIO', 'MODERADOR', 'AUTORIDADE', 'ADMIN'],
    },
];
export function HomePage() {
    const { login, user } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState();
    const { register, handleSubmit, formState: { isSubmitting }, } = useForm();
    const onSubmit = handleSubmit(async (values) => {
        try {
            setError(undefined);
            await login(values.email, values.password);
            navigate('/casos');
        }
        catch (err) {
            setError(err.response?.data?.message || 'Erro ao fazer login. Verifique suas credenciais.');
        }
    });
    return (_jsxs("div", { className: "space-y-12", children: [_jsxs("section", { className: "grid gap-8 lg:grid-cols-2 items-center", children: [_jsxs("div", { className: "space-y-6", children: [_jsx("span", { className: "inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800", children: "Plataforma Nacional" }), _jsx("h1", { className: "text-4xl font-bold text-slate-900", children: "Base de Dados de Pessoas Desaparecidas" }), _jsx("p", { className: "text-lg text-slate-600", children: "Centralizamos den\u00FAncias, investigamos padr\u00F5es e coordenamos miss\u00F5es de campo para acelerar a localiza\u00E7\u00E3o de pessoas desaparecidas em todo o pa\u00EDs." }), _jsx("div", { className: "flex gap-4", children: _jsx(Link, { to: "/entrar", className: "rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700", children: "Entrar" }) })] }), _jsxs("div", { className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-lg", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h3", { className: "text-lg font-semibold text-slate-900 mb-1", children: "Acesso r\u00E1pido" }), _jsx("p", { className: "text-sm text-slate-500", children: "Fa\u00E7a login para acessar todas as funcionalidades" })] }), error && (_jsxs("div", { className: "mb-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700", children: [_jsx(AlertCircle, { className: "h-5 w-5 flex-shrink-0 mt-0.5" }), _jsx("span", { children: error })] })), _jsxs("form", { onSubmit: onSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "home-email", className: "mb-1.5 block text-sm font-medium text-slate-700", children: "Email" }), _jsxs("div", { className: "relative", children: [_jsx(Mail, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" }), _jsx("input", { id: "home-email", type: "email", ...register('email', { required: true }), className: "w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20", placeholder: "seu@email.com" })] })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "home-password", className: "mb-1.5 block text-sm font-medium text-slate-700", children: "Palavra-passe" }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" }), _jsx("input", { id: "home-password", type: "password", ...register('password', { required: true }), className: "w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" })] })] }), _jsx("button", { type: "submit", disabled: isSubmitting, className: "w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2", children: isSubmitting ? (_jsxs(_Fragment, { children: [_jsxs("svg", { className: "h-4 w-4 animate-spin", viewBox: "0 0 24 24", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4", fill: "none" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })] }), "A entrar..."] })) : (_jsxs(_Fragment, { children: [_jsx(LogIn, { className: "h-4 w-4" }), "Entrar"] })) })] }), _jsx("div", { className: "mt-4 text-center", children: _jsxs("p", { className: "text-xs text-slate-600", children: ["N\u00E3o tem conta?", ' ', _jsx(Link, { to: "/registar", className: "font-semibold text-blue-600 hover:text-blue-700 hover:underline", children: "Crie uma conta" })] }) })] })] }), _jsx("section", { className: "grid gap-6 md:grid-cols-3", children: features.map((feature) => {
                    const hasAccess = !user || feature.allowedRoles.includes(user.role);
                    return (_jsxs(Link, { to: hasAccess ? feature.route : '/entrar', className: `rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all ${hasAccess
                            ? 'hover:shadow-md hover:border-blue-300 cursor-pointer'
                            : 'opacity-60 cursor-not-allowed'}`, children: [_jsx(feature.icon, { className: "h-8 w-8 text-blue-600" }), _jsx("h3", { className: "mt-4 text-lg font-semibold", children: feature.title }), _jsx("p", { className: "text-sm text-slate-500", children: feature.description }), !hasAccess && user && (_jsx("p", { className: "mt-2 text-xs text-amber-600", children: "Acesso restrito ao seu perfil" })), !user && (_jsx("p", { className: "mt-2 text-xs text-blue-600", children: "Fa\u00E7a login para acessar" }))] }, feature.title));
                }) })] }));
}
