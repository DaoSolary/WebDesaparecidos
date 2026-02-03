import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/useAuth';
import { CitizenDashboard } from '../components/dashboards/CitizenDashboard';
import { ModeratorDashboard } from '../components/dashboards/ModeratorDashboard';
import { AuthorityDashboard } from '../components/dashboards/AuthorityDashboard';
import { AdminDashboard } from '../components/dashboards/AdminDashboard';
import { hasAnyRole } from '../utils/roles';
export function DashboardPage() {
    const { user, fetchUser } = useAuth();
    const navigate = useNavigate();
    useEffect(() => {
        const token = localStorage.getItem('bdpd_token');
        if (token && !user) {
            fetchUser();
        }
        else if (!token) {
            navigate('/entrar');
        }
    }, [user, fetchUser, navigate]);
    if (!user) {
        return (_jsx("div", { className: "flex items-center justify-center min-h-screen", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" }), _jsx("p", { className: "mt-4 text-slate-600", children: "Carregando..." })] }) }));
    }
    // Renderizar dashboard baseado no role
    if (hasAnyRole(user.role, ['ADMIN'])) {
        return _jsx(AdminDashboard, {});
    }
    if (hasAnyRole(user.role, ['AUTORIDADE'])) {
        return _jsx(AuthorityDashboard, {});
    }
    if (hasAnyRole(user.role, ['MODERADOR'])) {
        return _jsx(ModeratorDashboard, {});
    }
    // CIDADAO, FAMILIAR, VOLUNTARIO
    return _jsx(CitizenDashboard, {});
}
