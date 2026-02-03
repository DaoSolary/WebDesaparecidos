import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useAuth } from '../../store/useAuth';
import { api } from '../../api/client';
import { FileText, User, Calendar, Filter } from 'lucide-react';
export function ActivityLogsPage() {
    const { user } = useAuth();
    const [logs, setLogs] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [filter, setFilter] = useState({
        type: '',
        date: '',
    });
    useEffect(() => {
        loadLogs();
    }, [filter, currentPage]);
    const loadLogs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', String(currentPage));
            params.append('limit', '10');
            if (filter.type)
                params.append('type', filter.type);
            if (filter.date)
                params.append('date', filter.date);
            const { data } = await api.get(`/admin/logs?${params.toString()}`);
            setLogs(data.logs || []);
            setPagination(data.pagination || null);
        }
        catch (error) {
            console.error('Erro ao carregar logs:', error);
        }
        finally {
            setLoading(false);
        }
    };
    if (user?.role !== 'ADMIN') {
        return (_jsx("div", { className: "text-center py-12", children: _jsx("p", { className: "text-slate-600", children: "Acesso negado. Apenas administradores podem acessar esta p\u00E1gina." }) }));
    }
    const getTypeColor = (type) => {
        switch (type) {
            case 'create':
                return 'bg-blue-100 text-blue-700';
            case 'update':
                return 'bg-amber-100 text-amber-700';
            case 'delete':
                return 'bg-red-100 text-red-700';
            case 'approve':
                return 'bg-green-100 text-green-700';
            case 'reject':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-slate-100 text-slate-700';
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-slate-900", children: "Logs de Atividade" }), _jsx("p", { className: "mt-1 text-slate-600", children: "Registro de todas as a\u00E7\u00F5es realizadas na plataforma" })] }), _jsx("div", { className: "rounded-lg border border-slate-200 bg-white p-4", children: _jsxs("div", { className: "flex flex-wrap gap-4 items-center", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Filter, { className: "h-5 w-5 text-slate-400" }), _jsx("span", { className: "text-sm font-medium text-slate-700", children: "Filtros:" })] }), _jsxs("select", { value: filter.type, onChange: (e) => {
                                setFilter({ ...filter, type: e.target.value });
                                setCurrentPage(1);
                            }, className: "rounded-lg border border-slate-300 px-3 py-2 text-sm", children: [_jsx("option", { value: "", children: "Todos os Tipos" }), _jsx("option", { value: "create", children: "Criar" }), _jsx("option", { value: "update", children: "Atualizar" }), _jsx("option", { value: "delete", children: "Deletar" }), _jsx("option", { value: "approve", children: "Aprovar" }), _jsx("option", { value: "reject", children: "Rejeitar" })] }), _jsx("input", { type: "date", value: filter.date, onChange: (e) => {
                                setFilter({ ...filter, date: e.target.value });
                                setCurrentPage(1);
                            }, className: "rounded-lg border border-slate-300 px-3 py-2 text-sm" })] }) }), loading ? (_jsxs("div", { className: "text-center py-12", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" }), _jsx("p", { className: "mt-4 text-slate-600", children: "Carregando logs..." })] })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "rounded-lg border border-slate-200 bg-white overflow-hidden", children: _jsx("div", { className: "divide-y divide-slate-200", children: logs.length === 0 ? (_jsxs("div", { className: "p-8 text-center text-slate-600", children: [_jsx(FileText, { className: "h-12 w-12 mx-auto mb-4 text-slate-400" }), _jsx("p", { children: "Nenhum log encontrado" })] })) : (logs.map((log) => (_jsx("div", { className: "p-4 hover:bg-slate-50 transition-colors", children: _jsx("div", { className: "flex items-start justify-between", children: _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsx("span", { className: `px-2 py-1 rounded text-xs font-semibold ${getTypeColor(log.type)}`, children: log.type.toUpperCase() }), _jsx("p", { className: "font-semibold text-slate-900", children: log.action })] }), _jsx("p", { className: "text-sm text-slate-600 mb-2", children: log.details }), _jsxs("div", { className: "flex items-center gap-4 text-xs text-slate-500", children: [log.user ? (_jsxs("span", { className: "flex items-center gap-1", children: [_jsx(User, { className: "h-3 w-3" }), log.user.name, " (", log.user.role, ")"] })) : (_jsxs("span", { className: "flex items-center gap-1", children: [_jsx(User, { className: "h-3 w-3" }), "Sistema"] })), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Calendar, { className: "h-3 w-3" }), new Date(log.timestamp).toLocaleString('pt-AO')] })] })] }) }) }, log.id)))) }) }), pagination && (_jsx("div", { className: "flex items-center justify-center px-4 py-4 border-t border-slate-200 bg-white rounded-lg", children: _jsxs("p", { className: "text-sm text-slate-600", children: ["Mostrando ", logs.length, " de ", pagination.total, " logs"] }) }))] }))] }));
}
