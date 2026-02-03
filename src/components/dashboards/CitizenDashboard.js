import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../store/useAuth';
import { api } from '../../api/client';
import { Search, Plus, Heart, MapPin, Bell, MessageSquare, Eye, Calendar, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { ShareButtons } from '../ShareButtons';
import { initSocket, onChatMessage, onNotification } from '../../services/socket';
import { ANGOLA_PROVINCES } from '../../utils/provinces';
export function CitizenDashboard() {
    const { user } = useAuth();
    const [cases, setCases] = useState([]);
    const [favorites, setFavorites] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [messageCount, setMessageCount] = useState(0);
    const [myCases, setMyCases] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        province: '',
        gender: '',
        status: '',
        priority: '',
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState(null);
    const itemsPerPage = 9; // 9 casos por página para usuários comuns
    useEffect(() => {
        loadCases();
        loadFavorites();
        if (user) {
            loadMyCases();
        }
    }, [user]);
    useEffect(() => {
        // Configurar Socket.IO para notificações em tempo real
        if (user) {
            initSocket(user.id, user.role);
            // Escutar novas mensagens de chat
            const handleChatMessage = (data) => {
                // Verificar se a mensagem é de um caso do usuário
                setMyCases((currentCases) => {
                    if (currentCases.some(c => c.id === data.caseId)) {
                        setMessageCount(prev => prev + 1);
                    }
                    return currentCases;
                });
            };
            // Escutar notificações
            const handleNotification = (notification) => {
                if (notification.type === 'new_chat_message') {
                    setMessageCount(prev => prev + 1);
                }
            };
            onChatMessage(handleChatMessage);
            onNotification(handleNotification);
        }
    }, [user]);
    const loadMyCases = async () => {
        try {
            const { data } = await api.get('/missing-persons');
            const myCasesList = (data.items || []).filter((c) => c.reporterId === user?.id || (c.reporter && c.reporter.email === user?.email));
            setMyCases(myCasesList);
            // Contar mensagens (simulado - em produção, buscar do backend)
            // Por enquanto, vamos usar um contador baseado em notificações
        }
        catch (error) {
            console.error('Erro ao carregar meus casos:', error);
        }
    };
    const loadCases = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filters.province)
                params.append('province', filters.province);
            if (filters.gender)
                params.append('gender', filters.gender);
            if (filters.status)
                params.append('status', filters.status);
            if (filters.priority)
                params.append('priority', filters.priority);
            if (searchTerm)
                params.append('name', searchTerm);
            params.append('page', String(currentPage));
            params.append('limit', String(itemsPerPage));
            const { data } = await api.get(`/missing-persons?${params.toString()}`);
            setCases(data.items || []);
            setPagination(data.pagination || null);
        }
        catch (error) {
            console.error('Erro ao carregar casos:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const loadFavorites = async () => {
        try {
            const { data } = await api.get('/favorites');
            setFavorites(new Set(data.favorites?.map((f) => f.missingPersonId) || []));
        }
        catch (error) {
            // Favoritos podem não existir ainda
        }
    };
    const toggleFavorite = async (caseId) => {
        try {
            if (favorites.has(caseId)) {
                await api.delete(`/favorites/${caseId}`);
                setFavorites(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(caseId);
                    return newSet;
                });
            }
            else {
                await api.post('/favorites', { missingPersonId: caseId });
                setFavorites(prev => new Set(prev).add(caseId));
            }
        }
        catch (error) {
            console.error('Erro ao atualizar favorito:', error);
        }
    };
    useEffect(() => {
        setCurrentPage(1); // Resetar para primeira página quando filtros ou busca mudarem
        loadCases();
    }, [filters, searchTerm]);
    // Recarregar quando a página mudar
    useEffect(() => {
        loadCases();
    }, [currentPage]);
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && pagination && newPage <= pagination.totalPages) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };
    // Casos já vêm filtrados do backend (apenas aprovados)
    const filteredCases = cases;
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-3xl font-bold text-slate-900", children: ["Bem-vindo, ", user?.fullName] }), _jsx("p", { className: "mt-1 text-slate-600", children: "Plataforma de Pessoas Desaparecidas em Angola" })] }), _jsxs(Link, { to: "/casos/novo", className: "flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700 transition-colors", children: [_jsx(Plus, { className: "h-5 w-5" }), "Reportar Desaparecimento"] })] }), _jsxs("div", { className: "grid gap-4 md:grid-cols-4", children: [_jsx("div", { className: "rounded-lg border border-slate-200 bg-white p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "rounded-full bg-blue-100 p-2", children: _jsx(User, { className: "h-5 w-5 text-blue-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-2xl font-bold text-slate-900", children: pagination?.total || filteredCases.length }), _jsx("p", { className: "text-sm text-slate-600", children: "Casos Ativos" })] })] }) }), _jsx("div", { className: "rounded-lg border border-slate-200 bg-white p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "rounded-full bg-red-100 p-2", children: _jsx(Heart, { className: "h-5 w-5 text-red-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-2xl font-bold text-slate-900", children: favorites.size }), _jsx("p", { className: "text-sm text-slate-600", children: "Favoritos" })] })] }) }), _jsx("div", { className: "rounded-lg border border-slate-200 bg-white p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "rounded-full bg-green-100 p-2", children: _jsx(Bell, { className: "h-5 w-5 text-green-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-2xl font-bold text-slate-900", children: "0" }), _jsx("p", { className: "text-sm text-slate-600", children: "Notifica\u00E7\u00F5es" })] })] }) }), _jsx("div", { className: "rounded-lg border border-slate-200 bg-white p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "rounded-full bg-amber-100 p-2", children: _jsx(MessageSquare, { className: "h-5 w-5 text-amber-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-2xl font-bold text-slate-900", children: messageCount }), _jsx("p", { className: "text-sm text-slate-600", children: "Mensagens" })] })] }) })] }), _jsx("div", { className: "rounded-lg border border-slate-200 bg-white p-4", children: _jsxs("div", { className: "flex flex-col md:flex-row gap-4", children: [_jsxs("div", { className: "flex-1 relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" }), _jsx("input", { type: "text", placeholder: "Pesquisar por nome ou localiza\u00E7\u00E3o...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs("select", { value: filters.province, onChange: (e) => setFilters({ ...filters, province: e.target.value }), className: "rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20", children: [_jsx("option", { value: "", children: "Todas Prov\u00EDncias" }), ANGOLA_PROVINCES.map((province) => (_jsx("option", { value: province, children: province }, province)))] }), _jsxs("select", { value: filters.gender, onChange: (e) => setFilters({ ...filters, gender: e.target.value }), className: "rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20", children: [_jsx("option", { value: "", children: "Todos" }), _jsx("option", { value: "MASCULINO", children: "Masculino" }), _jsx("option", { value: "FEMININO", children: "Feminino" }), _jsx("option", { value: "OUTRO", children: "Outro" })] }), _jsxs("select", { value: filters.priority, onChange: (e) => setFilters({ ...filters, priority: e.target.value }), className: "rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20", children: [_jsx("option", { value: "", children: "Todas Prioridades" }), _jsx("option", { value: "URGENTE", children: "Urgente" }), _jsx("option", { value: "CRIANCA", children: "Crian\u00E7a" }), _jsx("option", { value: "IDOSO", children: "Idoso" })] })] })] }) }), loading ? (_jsxs("div", { className: "text-center py-12", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" }), _jsx("p", { className: "mt-4 text-slate-600", children: "Carregando casos..." })] })) : filteredCases.length === 0 ? (_jsx("div", { className: "text-center py-12 rounded-lg border border-slate-200 bg-white", children: _jsx("p", { className: "text-slate-600", children: "Nenhum caso encontrado." }) })) : (_jsxs("div", { className: "grid gap-6 md:grid-cols-2 lg:grid-cols-3", children: [filteredCases.map((caseItem) => (_jsxs("div", { className: "rounded-lg border border-slate-200 bg-white overflow-hidden hover:shadow-lg transition-shadow", children: [caseItem.photos[0] && (_jsx("div", { className: "aspect-video overflow-hidden bg-slate-100", children: _jsx("img", { src: caseItem.photos[0].url, alt: caseItem.fullName, className: "w-full h-full object-cover" }) })), _jsxs("div", { className: "p-4", children: [_jsxs("div", { className: "flex items-start justify-between mb-2", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-slate-900", children: caseItem.fullName }), caseItem.age && (_jsxs("p", { className: "text-sm text-slate-600", children: [caseItem.age, " anos"] }))] }), _jsx("button", { onClick: () => toggleFavorite(caseItem.id), className: `p-1.5 rounded transition-colors ${favorites.has(caseItem.id)
                                                    ? 'text-red-600 hover:bg-red-50'
                                                    : 'text-slate-400 hover:bg-slate-50'}`, children: _jsx(Heart, { className: `h-5 w-5 ${favorites.has(caseItem.id) ? 'fill-current' : ''}` }) })] }), _jsxs("div", { className: "space-y-1.5 mb-3", children: [_jsxs("div", { className: "flex items-center gap-1.5 text-sm text-slate-600", children: [_jsx(MapPin, { className: "h-4 w-4" }), _jsx("span", { children: caseItem.lastSeenLocation })] }), _jsxs("div", { className: "flex items-center gap-1.5 text-sm text-slate-600", children: [_jsx(Calendar, { className: "h-4 w-4" }), _jsx("span", { children: new Date(caseItem.missingDate).toLocaleDateString('pt-AO') })] })] }), _jsxs("div", { className: "flex items-center gap-2 mb-3", children: [_jsx("span", { className: `px-2 py-1 rounded text-xs font-semibold ${caseItem.priority === 'URGENTE' ? 'bg-red-100 text-red-700' :
                                                    caseItem.priority === 'CRIANCA' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-blue-100 text-blue-700'}`, children: caseItem.priority }), _jsx("span", { className: "px-2 py-1 rounded bg-slate-100 text-slate-700 text-xs font-semibold", children: caseItem.status })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Link, { to: `/casos/${caseItem.id}`, className: "flex-1 flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors", children: [_jsx(Eye, { className: "h-4 w-4" }), "Ver Detalhes"] }), _jsx("div", { className: "flex items-center justify-center", children: _jsx(ShareButtons, { caseData: caseItem }) })] })] })] }, caseItem.id))), pagination && pagination.totalPages > 1 && (_jsxs("div", { className: "col-span-full flex items-center justify-center gap-2 mt-8", children: [_jsxs("button", { onClick: () => handlePageChange(currentPage - 1), disabled: !pagination.hasPrevPage, className: `flex items-center gap-1 px-4 py-2 rounded-lg font-semibold transition-colors ${pagination.hasPrevPage
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
                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`, children: ["Pr\u00F3xima", _jsx(ChevronRight, { className: "h-4 w-4" })] })] })), pagination && (_jsxs("div", { className: "col-span-full text-center text-sm text-slate-500 mt-4", children: ["Mostrando ", filteredCases.length, " de ", pagination.total, " casos (P\u00E1gina ", pagination.page, " de ", pagination.totalPages, ")"] }))] }))] }));
}
