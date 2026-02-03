import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/useAuth';
import { useEffect, useState } from 'react';
import { User, LogOut, Menu } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';
import { NotificationsBell } from './NotificationsBell';
export function Header() {
    const { user, logout, fetchUser } = useAuth();
    const navigate = useNavigate();
    const [showMenu, setShowMenu] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    useEffect(() => {
        const token = localStorage.getItem('bdpd_token');
        if (token && !user) {
            fetchUser();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);
    const handleLogout = () => {
        logout();
        navigate('/');
        setShowMenu(false);
    };
    const handleLogoutClick = () => {
        setShowLogoutModal(true);
        setShowMenu(false);
    };
    return (_jsxs("header", { className: "border-b border-slate-200 bg-white", children: [_jsxs("div", { className: "mx-auto flex max-w-6xl items-center justify-between px-4 py-4", children: [user && (_jsx(Link, { to: "/", className: "text-lg font-semibold text-blue-700 hover:text-blue-800", children: "Base de Dados" })), _jsxs("nav", { className: "hidden md:flex gap-4 text-sm font-medium text-slate-600", children: [_jsx(Link, { to: "/informacoes", className: "hover:text-blue-600", children: "Informa\u00E7\u00F5es" }), user && (_jsxs(_Fragment, { children: [_jsx(Link, { to: "/dashboard", className: "hover:text-blue-600", children: "Dashboard" }), _jsx(Link, { to: "/casos", className: "hover:text-blue-600", children: "Casos" })] }))] }), user ? (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(NotificationsBell, {}), _jsxs("div", { className: "relative", children: [_jsxs("button", { onClick: () => setShowMenu(!showMenu), className: "flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors", children: [_jsx(User, { className: "h-4 w-4" }), _jsx("span", { className: "hidden sm:inline", children: user.fullName }), _jsx(Menu, { className: "h-4 w-4 sm:hidden" })] }), showMenu && (_jsxs(_Fragment, { children: [_jsx("div", { className: "fixed inset-0 z-10", onClick: () => setShowMenu(false) }), _jsxs("div", { className: "absolute right-0 mt-2 w-48 rounded-lg border border-slate-200 bg-white shadow-lg z-20", children: [_jsxs("div", { className: "p-3 border-b border-slate-200", children: [_jsx("p", { className: "text-sm font-semibold text-slate-900", children: user.fullName }), _jsx("p", { className: "text-xs text-slate-500", children: user.email }), _jsx("span", { className: "inline-block mt-1 text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700", children: user.role })] }), _jsxs("div", { className: "p-1", children: [_jsxs(Link, { to: "/perfil", onClick: () => setShowMenu(false), className: "flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded", children: [_jsx(User, { className: "h-4 w-4" }), "Meu Perfil"] }), _jsxs("button", { onClick: handleLogoutClick, className: "flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded", children: [_jsx(LogOut, { className: "h-4 w-4" }), "Sair"] })] })] })] }))] })] })) : (_jsx(Link, { to: "/entrar", className: "rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors", children: "Entrar" }))] }), _jsx(ConfirmModal, { isOpen: showLogoutModal, onClose: () => setShowLogoutModal(false), onConfirm: handleLogout, title: "Confirmar Sa\u00EDda", message: "Deseja sair do sistema?", confirmText: "Sair", cancelText: "Cancelar", variant: "warning" })] }));
}
