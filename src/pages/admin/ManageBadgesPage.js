import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Award, CheckCircle, XCircle, RefreshCw, Search, User } from 'lucide-react';
import { api } from '../../api/client';
import { InfoModal } from '../../components/InfoModal';
import { ConfirmModal } from '../../components/ConfirmModal';
const BADGE_INFO = {
    FIRST_CASE: {
        name: 'Primeiro Caso',
        description: 'Reportou seu primeiro caso de desaparecimento',
        criteria: '1 caso reportado',
    },
    ACTIVE_CONTRIBUTOR: {
        name: 'Contribuidor Ativo',
        description: 'Contribuidor ativo da comunidade',
        criteria: '5 casos ou 10 avistamentos',
    },
    HELPER: {
        name: 'Ajudante',
        description: 'Ajudou com avistamentos',
        criteria: '3 avistamentos',
    },
    VERIFIED: {
        name: 'Verificado',
        description: 'Usuário verificado',
        criteria: 'Outorgado manualmente pelo admin',
    },
    TOP_REPORTER: {
        name: 'Top Reporter',
        description: 'Top reporter de casos',
        criteria: '10 casos reportados',
    },
    COMMUNITY_HERO: {
        name: 'Herói da Comunidade',
        description: 'Herói da comunidade',
        criteria: '20 casos ou 30 avistamentos',
    },
};
export function ManageBadgesPage() {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedBadge, setSelectedBadge] = useState(null);
    const [showAwardModal, setShowAwardModal] = useState(false);
    const [showRemoveModal, setShowRemoveModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showCheckModal, setShowCheckModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [processing, setProcessing] = useState(false);
    const [checkingAll, setCheckingAll] = useState(false);
    useEffect(() => {
        loadUsers();
    }, []);
    useEffect(() => {
        if (searchTerm) {
            const filtered = users.filter((user) => user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase()));
            setFilteredUsers(filtered);
        }
        else {
            setFilteredUsers(users);
        }
    }, [searchTerm, users]);
    const loadUsers = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/badges/admin/users-stats');
            setUsers(data.users || []);
            setFilteredUsers(data.users || []);
        }
        catch (error) {
            console.error('Erro ao carregar usuários:', error);
            alert('Erro ao carregar usuários. Tente novamente.');
        }
        finally {
            setLoading(false);
        }
    };
    const handleAwardBadge = (user, badgeType) => {
        setSelectedUser(user);
        setSelectedBadge(badgeType);
        setShowAwardModal(true);
    };
    const handleRemoveBadge = (user, badgeType) => {
        setSelectedUser(user);
        setSelectedBadge(badgeType);
        setShowRemoveModal(true);
    };
    const confirmAwardBadge = async () => {
        if (!selectedUser || !selectedBadge)
            return;
        try {
            setProcessing(true);
            await api.post('/badges/admin/award', {
                userId: selectedUser.id,
                badgeType: selectedBadge,
            });
            setSuccessMessage(`Badge "${BADGE_INFO[selectedBadge].name}" outorgado com sucesso a ${selectedUser.fullName}!`);
            setShowSuccessModal(true);
            setShowAwardModal(false);
            await loadUsers();
        }
        catch (error) {
            alert(error.response?.data?.message || 'Erro ao outorgar badge');
        }
        finally {
            setProcessing(false);
        }
    };
    const confirmRemoveBadge = async () => {
        if (!selectedUser || !selectedBadge)
            return;
        try {
            setProcessing(true);
            await api.delete(`/badges/admin/remove/${selectedUser.id}/${selectedBadge}`);
            setSuccessMessage(`Badge "${BADGE_INFO[selectedBadge].name}" removido com sucesso de ${selectedUser.fullName}!`);
            setShowSuccessModal(true);
            setShowRemoveModal(false);
            await loadUsers();
        }
        catch (error) {
            alert(error.response?.data?.message || 'Erro ao remover badge');
        }
        finally {
            setProcessing(false);
        }
    };
    const handleCheckUserBadges = async (userId) => {
        try {
            setProcessing(true);
            const { data } = await api.post(`/badges/admin/check-and-award/${userId}`);
            setSuccessMessage(`Verificação concluída! ${data.count} badge(s) outorgado(s) automaticamente baseado nos critérios.`);
            setShowSuccessModal(true);
            setShowCheckModal(false);
            await loadUsers();
        }
        catch (error) {
            alert('Erro ao verificar badges. Tente novamente.');
        }
        finally {
            setProcessing(false);
        }
    };
    const handleCheckAllBadges = async () => {
        if (!confirm('Deseja verificar e outorgar badges para todos os usuários? Isso pode levar alguns minutos.')) {
            return;
        }
        try {
            setCheckingAll(true);
            const { data } = await api.post('/badges/admin/check-all');
            setSuccessMessage(`Verificação concluída! ${data.totalBadgesAwarded} badge(s) outorgado(s) para ${data.totalUsers} usuário(s).`);
            setShowSuccessModal(true);
            await loadUsers();
        }
        catch (error) {
            alert('Erro ao verificar badges. Tente novamente.');
        }
        finally {
            setCheckingAll(false);
        }
    };
    const hasBadge = (user, badgeType) => {
        return user.stats.badges.includes(badgeType);
    };
    const canEarnBadge = (user, badgeType) => {
        const stats = user.stats;
        switch (badgeType) {
            case 'FIRST_CASE':
                return stats.casesCount >= 1;
            case 'ACTIVE_CONTRIBUTOR':
                return stats.casesCount >= 5 || stats.sightingsCount >= 10;
            case 'HELPER':
                return stats.sightingsCount >= 3;
            case 'TOP_REPORTER':
                return stats.casesCount >= 10;
            case 'COMMUNITY_HERO':
                return stats.casesCount >= 20 || stats.sightingsCount >= 30;
            case 'VERIFIED':
                return true; // Pode ser outorgado manualmente
            default:
                return false;
        }
    };
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center min-h-screen", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" }), _jsx("p", { className: "mt-4 text-slate-600", children: "Carregando usu\u00E1rios..." })] }) }));
    }
    return (_jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h1", { className: "text-3xl font-bold text-slate-900", children: "Gerenciar Conquistas e Badges" }), _jsx("p", { className: "mt-2 text-slate-600", children: "Outorgue badges aos usu\u00E1rios baseado em crit\u00E9rios ou manualmente" })] }), _jsx("div", { className: "mb-6 flex gap-4", children: _jsxs("button", { onClick: handleCheckAllBadges, disabled: checkingAll, className: "px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2", children: [_jsx(RefreshCw, { className: `h-5 w-5 ${checkingAll ? 'animate-spin' : ''}` }), checkingAll ? 'Verificando...' : 'Verificar Todos os Usuários'] }) }), _jsx("div", { className: "mb-6", children: _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" }), _jsx("input", { type: "text", placeholder: "Buscar por nome ou email...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500" })] }) }), _jsx("div", { className: "space-y-4", children: filteredUsers.length === 0 ? (_jsx("div", { className: "text-center py-12 bg-white rounded-lg border border-slate-200", children: _jsx("p", { className: "text-slate-600", children: "Nenhum usu\u00E1rio encontrado" }) })) : (filteredUsers.map((user) => (_jsxs("div", { className: "bg-white rounded-lg border border-slate-200 p-6 shadow-sm", children: [_jsxs("div", { className: "flex items-start justify-between mb-4", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsx(User, { className: "h-5 w-5 text-slate-600" }), _jsx("h3", { className: "text-lg font-semibold text-slate-900", children: user.fullName }), _jsx("span", { className: "text-xs px-2 py-1 rounded bg-slate-100 text-slate-700", children: user.role })] }), _jsx("p", { className: "text-sm text-slate-600", children: user.email })] }), _jsxs("button", { onClick: () => {
                                        setSelectedUser(user);
                                        setShowCheckModal(true);
                                    }, className: "px-3 py-1 text-sm rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center gap-2", children: [_jsx(RefreshCw, { className: "h-4 w-4" }), "Verificar"] })] }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 mb-4", children: [_jsxs("div", { className: "p-3 bg-blue-50 rounded-lg", children: [_jsx("p", { className: "text-2xl font-bold text-blue-600", children: user.stats.casesCount }), _jsx("p", { className: "text-xs text-slate-600", children: "Casos" })] }), _jsxs("div", { className: "p-3 bg-green-50 rounded-lg", children: [_jsx("p", { className: "text-2xl font-bold text-green-600", children: user.stats.sightingsCount }), _jsx("p", { className: "text-xs text-slate-600", children: "Avistamentos" })] }), _jsxs("div", { className: "p-3 bg-amber-50 rounded-lg", children: [_jsx("p", { className: "text-2xl font-bold text-amber-600", children: user.stats.favoritesCount }), _jsx("p", { className: "text-xs text-slate-600", children: "Favoritos" })] }), _jsxs("div", { className: "p-3 bg-purple-50 rounded-lg", children: [_jsx("p", { className: "text-2xl font-bold text-purple-600", children: user.stats.badgesCount }), _jsx("p", { className: "text-xs text-slate-600", children: "Badges" })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-sm font-semibold text-slate-900 mb-3", children: "Badges Dispon\u00EDveis" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3", children: Object.keys(BADGE_INFO).map((badgeType) => {
                                        const hasIt = hasBadge(user, badgeType);
                                        const canEarn = canEarnBadge(user, badgeType);
                                        const info = BADGE_INFO[badgeType];
                                        return (_jsxs("div", { className: `p-3 rounded-lg border-2 ${hasIt
                                                ? 'bg-green-50 border-green-300'
                                                : canEarn
                                                    ? 'bg-blue-50 border-blue-300'
                                                    : 'bg-slate-50 border-slate-200'}`, children: [_jsxs("div", { className: "flex items-start justify-between mb-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Award, { className: `h-5 w-5 ${hasIt ? 'text-green-600' : 'text-slate-400'}` }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold text-slate-900 text-sm", children: info.name }), _jsx("p", { className: "text-xs text-slate-600", children: info.description })] })] }), hasIt && _jsx(CheckCircle, { className: "h-5 w-5 text-green-600" })] }), _jsxs("p", { className: "text-xs text-slate-500 mb-2", children: ["Crit\u00E9rio: ", info.criteria] }), _jsx("div", { className: "flex gap-2", children: hasIt ? (_jsxs("button", { onClick: () => handleRemoveBadge(user, badgeType), className: "flex-1 px-2 py-1 text-xs rounded bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center gap-1", children: [_jsx(XCircle, { className: "h-3 w-3" }), "Remover"] })) : (_jsxs("button", { onClick: () => handleAwardBadge(user, badgeType), disabled: !canEarn && badgeType !== 'VERIFIED', className: "flex-1 px-2 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1", children: [_jsx(Award, { className: "h-3 w-3" }), "Outorgar"] })) })] }, badgeType));
                                    }) })] })] }, user.id)))) }), _jsx(ConfirmModal, { isOpen: showAwardModal, onClose: () => {
                    setShowAwardModal(false);
                    setSelectedUser(null);
                    setSelectedBadge(null);
                }, onConfirm: confirmAwardBadge, title: "Outorgar Badge", message: selectedUser && selectedBadge
                    ? `Deseja outorgar o badge "${BADGE_INFO[selectedBadge].name}" a ${selectedUser.fullName}?`
                    : '', confirmText: processing ? 'Outorgando...' : 'Confirmar', cancelText: "Cancelar", variant: "info" }), _jsx(ConfirmModal, { isOpen: showRemoveModal, onClose: () => {
                    setShowRemoveModal(false);
                    setSelectedUser(null);
                    setSelectedBadge(null);
                }, onConfirm: confirmRemoveBadge, title: "Remover Badge", message: selectedUser && selectedBadge
                    ? `Deseja remover o badge "${BADGE_INFO[selectedBadge].name}" de ${selectedUser.fullName}?`
                    : '', confirmText: processing ? 'Removendo...' : 'Confirmar', cancelText: "Cancelar", variant: "warning" }), _jsx(ConfirmModal, { isOpen: showCheckModal, onClose: () => {
                    setShowCheckModal(false);
                    setSelectedUser(null);
                }, onConfirm: () => selectedUser && handleCheckUserBadges(selectedUser.id), title: "Verificar Badges", message: selectedUser
                    ? `Deseja verificar e outorgar badges automaticamente para ${selectedUser.fullName} baseado nos critérios?`
                    : '', confirmText: processing ? 'Verificando...' : 'Confirmar', cancelText: "Cancelar", variant: "info" }), _jsx(InfoModal, { isOpen: showSuccessModal, onClose: () => {
                    setShowSuccessModal(false);
                    setSuccessMessage('');
                }, title: "Sucesso", message: successMessage, variant: "success" })] }));
}
