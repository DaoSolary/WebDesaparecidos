import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { ArrowLeft, User, Calendar, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
export function UserCasesPage() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [cases, setCases] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const itemsPerPage = 9;
    useEffect(() => {
        if (userId) {
            loadUserCases();
        }
    }, [userId, currentPage]);
    const loadUserCases = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/users/${userId}/cases`, {
                params: {
                    page: currentPage,
                    limit: itemsPerPage,
                },
            });
            setUser(response.data.user);
            setCases(response.data.cases || []);
            setPagination(response.data.pagination || null);
        }
        catch (error) {
            console.error('Erro ao carregar casos do usuário:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && pagination && newPage <= pagination.totalPages) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("button", { onClick: () => navigate('/rede-colaborativa'), className: "flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors", children: [_jsx(ArrowLeft, { className: "h-4 w-4" }), "Voltar"] }), _jsxs("div", { children: [_jsxs("h1", { className: "text-3xl font-bold text-slate-900", children: ["Casos de ", user?.fullName || 'Usuário'] }), _jsx("p", { className: "mt-1 text-slate-600", children: "Casos reportados por este membro da rede" })] })] }), loading ? (_jsx("div", { className: "text-center py-12", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" }) })) : cases.length === 0 ? (_jsxs("div", { className: "text-center py-12 rounded-lg border border-slate-200 bg-white", children: [_jsx(User, { className: "h-12 w-12 text-slate-400 mx-auto mb-4" }), _jsx("p", { className: "text-slate-600", children: "Este usu\u00E1rio ainda n\u00E3o reportou nenhum caso." })] })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3", children: cases.map((caseItem) => (_jsxs(Link, { to: `/casos/${caseItem.id}`, className: "rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-blue-500 transition-colors", children: [_jsx("div", { className: "aspect-video overflow-hidden rounded-lg bg-slate-100 mb-3", children: caseItem.photos[0] ? (_jsx("img", { src: caseItem.photos[0].url, alt: caseItem.fullName, className: "w-full h-full object-cover" })) : (_jsx("div", { className: "w-full h-full flex items-center justify-center text-slate-400", children: _jsx(User, { className: "h-8 w-8" }) })) }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("p", { className: "text-lg font-semibold text-slate-900", children: caseItem.fullName }), _jsx("span", { className: "rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600", children: caseItem.priority })] }), _jsxs("div", { className: "flex items-center gap-1.5 text-sm text-slate-600", children: [_jsx(MapPin, { className: "h-4 w-4" }), _jsx("span", { children: caseItem.province }), caseItem.municipality && _jsxs("span", { children: ["\u2022 ", caseItem.municipality] })] }), _jsxs("div", { className: "flex items-center gap-1.5 text-sm text-slate-600", children: [_jsx(Calendar, { className: "h-4 w-4" }), _jsx("span", { children: new Date(caseItem.missingDate).toLocaleDateString('pt-AO') })] }), _jsx("div", { className: "text-xs font-semibold text-amber-600", children: caseItem.status })] })] }, caseItem.id))) }), pagination && pagination.totalPages > 1 && (_jsxs("div", { className: "flex items-center justify-center gap-2 mt-8", children: [_jsxs("button", { onClick: () => handlePageChange(currentPage - 1), disabled: !pagination.hasPrevPage, className: `flex items-center gap-1 px-4 py-2 rounded-lg font-semibold transition-colors ${pagination.hasPrevPage
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
                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`, children: ["Pr\u00F3xima", _jsx(ChevronRight, { className: "h-4 w-4" })] })] })), pagination && (_jsxs("div", { className: "text-center text-sm text-slate-500 mt-4", children: ["Mostrando ", cases.length, " de ", pagination.total, " casos (P\u00E1gina ", pagination.page, " de ", pagination.totalPages, ")"] }))] }))] }));
}
