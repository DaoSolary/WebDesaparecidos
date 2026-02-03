import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { ChevronLeft, ChevronRight } from 'lucide-react';
export function CasesPage() {
    const [items, setItems] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const itemsPerPage = 9; // 9 casos por página para usuários comuns
    useEffect(() => {
        loadCases();
    }, [currentPage]);
    const loadCases = async () => {
        setLoading(true);
        try {
            const response = await api.get('/missing-persons', {
                params: {
                    page: currentPage,
                    limit: itemsPerPage,
                },
            });
            setItems(response.data.items || []);
            setPagination(response.data.pagination || null);
        }
        catch (error) {
            console.error('Erro ao carregar casos:', error);
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
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-semibold text-slate-900", children: "Casos activos" }), _jsx("p", { className: "text-sm text-slate-500", children: "Filtre por localiza\u00E7\u00E3o, g\u00E9nero, data ou prioridade." })] }), loading ? (_jsx("div", { className: "text-center py-12", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" }) })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3", children: items.map((person) => (_jsxs(Link, { to: `/casos/${person.id}`, className: "rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-blue-500", children: [_jsx("div", { className: "aspect-video overflow-hidden rounded-lg bg-slate-100", children: person.photos[0] ? _jsx("img", { src: person.photos[0].url, alt: person.fullName, className: "h-full w-full object-cover" }) : null }), _jsxs("div", { className: "mt-4 space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("p", { className: "text-lg font-semibold text-slate-900", children: person.fullName }), _jsx("span", { className: "rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600", children: person.priority })] }), _jsxs("p", { className: "text-sm text-slate-500", children: [person.province, " ", person.municipality ? `• ${person.municipality}` : ''] }), person.reporter && (_jsxs("p", { className: "text-xs text-slate-500", children: ["Reportado por: ", person.reporter.fullName] })), _jsx("div", { className: "text-xs font-semibold text-amber-600", children: person.status })] })] }, person.id))) }), pagination && pagination.totalPages > 1 && (_jsxs("div", { className: "flex items-center justify-center gap-2 mt-8", children: [_jsxs("button", { onClick: () => handlePageChange(currentPage - 1), disabled: !pagination.hasPrevPage, className: `flex items-center gap-1 px-4 py-2 rounded-lg font-semibold transition-colors ${pagination.hasPrevPage
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`, children: [_jsx(ChevronLeft, { className: "h-4 w-4" }), "Anterior"] }), _jsx("div", { className: "flex items-center gap-1", children: Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => {
                                    // Mostrar apenas algumas páginas ao redor da página atual
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
                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`, children: ["Pr\u00F3xima", _jsx(ChevronRight, { className: "h-4 w-4" })] })] })), pagination && (_jsxs("div", { className: "text-center text-sm text-slate-500 mt-4", children: ["Mostrando ", items.length, " de ", pagination.total, " casos (P\u00E1gina ", pagination.page, " de ", pagination.totalPages, ")"] }))] }))] }));
}
