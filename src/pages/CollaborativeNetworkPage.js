import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useAuth } from '../store/useAuth';
import { api } from '../api/client';
import { Users, MessageSquare, UserCheck, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { Link } from 'react-router-dom';
import { ANGOLA_PROVINCES } from '../utils/provinces';
export function CollaborativeNetworkPage() {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({
        totalUsers: 0,
        byRole: {},
        activeToday: 0,
        verifiedUsers: 0,
        authorities: 0,
    });
    const [filter, setFilter] = useState({
        role: '',
        province: '',
    });
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState(null);
    const itemsPerPage = 10; // 10 membros por página
    useEffect(() => {
        loadStats();
    }, []);
    useEffect(() => {
        setCurrentPage(1); // Resetar para primeira página quando filtros mudarem
        loadUsers();
    }, [filter]);
    useEffect(() => {
        loadUsers();
    }, [currentPage]);
    const loadStats = async () => {
        try {
            const { data } = await api.get('/users/network/stats');
            setStats({
                totalUsers: data.totalUsers || 0,
                byRole: data.byRole || {},
                activeToday: data.activeToday || 0,
                verifiedUsers: data.verifiedUsers || 0,
                authorities: data.authorities || 0,
            });
        }
        catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
        }
    };
    const loadUsers = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filter.role)
                params.append('role', filter.role);
            if (filter.province)
                params.append('province', filter.province);
            params.append('page', String(currentPage));
            params.append('limit', String(itemsPerPage));
            const { data } = await api.get(`/users/network?${params.toString()}`);
            setUsers(data.users || []);
            setPagination(data.pagination || null);
        }
        catch (error) {
            console.error('Erro ao carregar usuários:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const getRoleLabel = (role) => {
        const labels = {
            CIDADAO: 'Cidadão',
            FAMILIAR: 'Familiar',
            VOLUNTARIO: 'Voluntário',
            MODERADOR: 'Moderador',
            AUTORIDADE: 'Autoridade',
            ADMIN: 'Administrador',
        };
        return labels[role] || role;
    };
    const getRoleColor = (role) => {
        const colors = {
            CIDADAO: 'bg-blue-100 text-blue-700',
            FAMILIAR: 'bg-purple-100 text-purple-700',
            VOLUNTARIO: 'bg-green-100 text-green-700',
            MODERADOR: 'bg-amber-100 text-amber-700',
            AUTORIDADE: 'bg-red-100 text-red-700',
            ADMIN: 'bg-slate-100 text-slate-700',
        };
        return colors[role] || 'bg-slate-100 text-slate-700';
    };
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && pagination && newPage <= pagination.totalPages) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };
    return (_jsx(ProtectedRoute, { allowedRoles: ['CIDADAO', 'FAMILIAR', 'VOLUNTARIO', 'MODERADOR', 'AUTORIDADE', 'ADMIN'], children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-slate-900", children: "Rede Colaborativa" }), _jsx("p", { className: "mt-1 text-slate-600", children: "Familiares, cidad\u00E3os e autoridades conectados em um \u00FAnico canal" })] }), _jsxs("div", { className: "grid gap-4 md:grid-cols-4", children: [_jsxs("div", { className: "rounded-lg border border-slate-200 bg-white p-4", children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsx(Users, { className: "h-5 w-5 text-blue-600" }), _jsx("h3", { className: "font-semibold text-slate-900", children: "Total de Usu\u00E1rios" })] }), _jsx("p", { className: "text-2xl font-bold text-slate-900", children: stats.totalUsers.toLocaleString() }), _jsx("p", { className: "text-sm text-slate-600", children: "Membros da rede" })] }), _jsxs("div", { className: "rounded-lg border border-slate-200 bg-white p-4", children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsx(UserCheck, { className: "h-5 w-5 text-green-600" }), _jsx("h3", { className: "font-semibold text-slate-900", children: "Verificados" })] }), _jsx("p", { className: "text-2xl font-bold text-slate-900", children: stats.verifiedUsers }), _jsx("p", { className: "text-sm text-slate-600", children: "Usu\u00E1rios verificados" })] }), _jsxs("div", { className: "rounded-lg border border-slate-200 bg-white p-4", children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsx(MessageSquare, { className: "h-5 w-5 text-amber-600" }), _jsx("h3", { className: "font-semibold text-slate-900", children: "Ativos Hoje" })] }), _jsx("p", { className: "text-2xl font-bold text-slate-900", children: stats.activeToday }), _jsx("p", { className: "text-sm text-slate-600", children: "Usu\u00E1rios ativos" })] }), _jsxs("div", { className: "rounded-lg border border-slate-200 bg-white p-4", children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsx(Shield, { className: "h-5 w-5 text-red-600" }), _jsx("h3", { className: "font-semibold text-slate-900", children: "Autoridades" })] }), _jsx("p", { className: "text-2xl font-bold text-slate-900", children: stats.authorities }), _jsx("p", { className: "text-sm text-slate-600", children: "Autoridades e admins" })] })] }), _jsx("div", { className: "rounded-lg border border-slate-200 bg-white p-4", children: _jsxs("div", { className: "flex flex-wrap gap-4 items-center", children: [_jsxs("select", { value: filter.role, onChange: (e) => setFilter({ ...filter, role: e.target.value }), className: "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20", children: [_jsx("option", { value: "", children: "Todos os Perfis" }), _jsx("option", { value: "CIDADAO", children: "Cidad\u00E3o" }), _jsx("option", { value: "FAMILIAR", children: "Familiar" }), _jsx("option", { value: "VOLUNTARIO", children: "Volunt\u00E1rio" }), _jsx("option", { value: "MODERADOR", children: "Moderador" }), _jsx("option", { value: "AUTORIDADE", children: "Autoridade" }), _jsx("option", { value: "ADMIN", children: "Administrador" })] }), _jsxs("select", { value: filter.province, onChange: (e) => setFilter({ ...filter, province: e.target.value }), className: "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20", children: [_jsx("option", { value: "", children: "Todas as Prov\u00EDncias" }), ANGOLA_PROVINCES.map((province) => (_jsx("option", { value: province, children: province }, province)))] })] }) }), loading ? (_jsx("div", { className: "text-center py-12", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" }) })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "rounded-lg border border-slate-200 bg-white p-6", children: [_jsx("h2", { className: "text-xl font-semibold text-slate-900 mb-4", children: "Membros da Rede" }), _jsx("div", { className: "space-y-3", children: users.map((networkUser) => (_jsxs("div", { className: "flex items-center justify-between p-4 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center", children: _jsx(Users, { className: "h-5 w-5 text-blue-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold text-slate-900", children: networkUser.fullName }), _jsxs("div", { className: "flex items-center gap-2 mt-1", children: [_jsx("span", { className: `px-2 py-1 rounded text-xs font-semibold ${getRoleColor(networkUser.role)}`, children: getRoleLabel(networkUser.role) }), networkUser.province && (_jsx("span", { className: "text-xs text-slate-500", children: networkUser.province })), networkUser.verifiedAt && (_jsx("span", { className: "text-xs text-green-600", children: "\u2713 Verificado" }))] })] })] }), _jsxs(Link, { to: `/usuarios/${networkUser.id}/casos`, className: "flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors", children: [_jsx(MessageSquare, { className: "h-4 w-4" }), "Ver Casos"] })] }, networkUser.id))) })] }), pagination && pagination.totalPages > 1 && (_jsxs("div", { className: "flex items-center justify-center gap-2 mt-8", children: [_jsxs("button", { onClick: () => handlePageChange(currentPage - 1), disabled: !pagination.hasPrevPage, className: `flex items-center gap-1 px-4 py-2 rounded-lg font-semibold transition-colors ${pagination.hasPrevPage
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`, children: [_jsx(ChevronLeft, { className: "h-4 w-4" }), "Anterior"] }), _jsx("div", { className: "flex items-center gap-1", children: Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => {
                                        if (pageNum === 1 ||
                                            pageNum === pagination.totalPages ||
                                            (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                                            return (_jsx("button", { onClick: () => handlePageChange(pageNum), className: `px-4 py-2 rounded-lg font-semibold transition-colors ${pageNum === currentPage
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`, children: pageNum }, pageNum));
                                        }
                                        else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                                            return _jsx("span", { className: "px-2 text-slate-500", children: "..." }, pageNum);
                                        }
                                        return null;
                                    }) }), _jsxs("button", { onClick: () => handlePageChange(currentPage + 1), disabled: !pagination.hasNextPage, className: `flex items-center gap-1 px-4 py-2 rounded-lg font-semibold transition-colors ${pagination.hasNextPage
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`, children: ["Pr\u00F3xima", _jsx(ChevronRight, { className: "h-4 w-4" })] })] })), pagination && (_jsxs("div", { className: "text-center text-sm text-slate-500 mt-4", children: ["Mostrando ", users.length, " de ", pagination.total, " membros (P\u00E1gina ", pagination.page, " de ", pagination.totalPages, ")"] }))] })), _jsx("div", { className: "rounded-lg border border-blue-200 bg-blue-50 p-4", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(Users, { className: "h-5 w-5 text-blue-600 mt-0.5" }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold text-blue-900", children: "Sobre a Rede Colaborativa" }), _jsx("p", { className: "text-sm text-blue-700 mt-1", children: "A rede conecta familiares, cidad\u00E3os, volunt\u00E1rios e autoridades em uma plataforma \u00FAnica, facilitando a comunica\u00E7\u00E3o e colabora\u00E7\u00E3o na busca por pessoas desaparecidas. Use o chat para se comunicar diretamente com outros membros da rede sobre casos espec\u00EDficos." })] })] }) })] }) }));
}
