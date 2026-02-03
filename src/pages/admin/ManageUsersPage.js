import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useAuth } from '../../store/useAuth';
import { api } from '../../api/client';
import { Search, Plus, Edit, Trash2, Mail, Phone, MapPin, CheckCircle, XCircle, ChevronLeft, ChevronRight, Ban, Unlock } from 'lucide-react';
import { ConfirmModal } from '../../components/ConfirmModal';
import { InfoModal } from '../../components/InfoModal';
import { ANGOLA_PROVINCES } from '../../utils/provinces';
const ROLES = ['CIDADAO', 'FAMILIAR', 'VOLUNTARIO', 'MODERADOR', 'AUTORIDADE', 'ADMIN'];
export function ManageUsersPage() {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        role: '',
        province: '',
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showNoUsersModal, setShowNoUsersModal] = useState(false);
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [showUnblockModal, setShowUnblockModal] = useState(false);
    const [blockReason, setBlockReason] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        role: 'CIDADAO',
        phone: '',
        province: '',
        municipality: '',
    });
    useEffect(() => {
        loadUsers();
    }, [currentPage, filters, searchTerm]);
    const loadUsers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', String(currentPage));
            params.append('limit', '10');
            if (filters.role)
                params.append('role', filters.role);
            if (filters.province)
                params.append('province', filters.province);
            if (searchTerm)
                params.append('search', searchTerm);
            const { data } = await api.get(`/admin/users?${params.toString()}`);
            const loadedUsers = data.users || [];
            setUsers(loadedUsers);
            setPagination(data.pagination || null);
            // Mostrar modal se não houver usuários e houver filtro de província
            if (loadedUsers.length === 0 && filters.province) {
                setShowNoUsersModal(true);
            }
        }
        catch (error) {
            console.error('Erro ao carregar usuários:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleCreate = async () => {
        try {
            await api.post('/admin/users', formData);
            setShowCreateModal(false);
            setSuccessMessage('Usuário criado com sucesso!');
            setShowSuccessModal(true);
            resetForm();
            loadUsers();
        }
        catch (error) {
            alert(error.response?.data?.message || 'Erro ao criar usuário');
        }
    };
    const handleUpdate = async () => {
        if (!selectedUser)
            return;
        try {
            const { password, ...updateData } = formData;
            const payload = { ...updateData };
            if (password)
                payload.password = password;
            await api.put(`/admin/users/${selectedUser.id}`, payload);
            setShowEditModal(false);
            setSuccessMessage('Usuário atualizado com sucesso!');
            setShowSuccessModal(true);
            resetForm();
            loadUsers();
        }
        catch (error) {
            alert(error.response?.data?.message || 'Erro ao atualizar usuário');
        }
    };
    const handleDelete = async () => {
        if (!selectedUser)
            return;
        try {
            await api.delete(`/admin/users/${selectedUser.id}`);
            setShowDeleteModal(false);
            setSuccessMessage('Usuário deletado com sucesso!');
            setShowSuccessModal(true);
            setSelectedUser(null);
            loadUsers();
        }
        catch (error) {
            alert(error.response?.data?.message || 'Erro ao deletar usuário');
        }
    };
    const handleEditClick = (user) => {
        setSelectedUser(user);
        setFormData({
            fullName: user.fullName,
            email: user.email,
            password: '',
            role: user.role,
            phone: user.phone || '',
            province: user.province || '',
            municipality: user.municipality || '',
        });
        setShowEditModal(true);
    };
    const handleDeleteClick = (userItem) => {
        if (userItem.id === user?.id) {
            alert('Não é possível deletar sua própria conta');
            return;
        }
        setSelectedUser(userItem);
        setShowDeleteModal(true);
    };
    const resetForm = () => {
        setFormData({
            fullName: '',
            email: '',
            password: '',
            role: 'CIDADAO',
            phone: '',
            province: '',
            municipality: '',
        });
        setSelectedUser(null);
    };
    const getRoleLabel = (role) => {
        const labels = {
            'CIDADAO': 'Cidadão',
            'FAMILIAR': 'Familiar',
            'VOLUNTARIO': 'Voluntário',
            'MODERADOR': 'Moderador',
            'AUTORIDADE': 'Autoridade',
            'ADMIN': 'Administrador',
        };
        return labels[role] || role;
    };
    const getRoleColor = (role) => {
        const colors = {
            'CIDADAO': 'bg-blue-100 text-blue-700',
            'FAMILIAR': 'bg-purple-100 text-purple-700',
            'VOLUNTARIO': 'bg-green-100 text-green-700',
            'MODERADOR': 'bg-amber-100 text-amber-700',
            'AUTORIDADE': 'bg-red-100 text-red-700',
            'ADMIN': 'bg-slate-100 text-slate-700',
        };
        return colors[role] || 'bg-slate-100 text-slate-700';
    };
    if (user?.role !== 'ADMIN') {
        return (_jsx("div", { className: "text-center py-12", children: _jsx("p", { className: "text-slate-600", children: "Acesso negado. Apenas administradores podem acessar esta p\u00E1gina." }) }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-slate-900", children: "Gerenciar Usu\u00E1rios" }), _jsx("p", { className: "mt-1 text-slate-600", children: "Criar, editar e gerenciar contas de usu\u00E1rios" })] }), _jsxs("button", { onClick: () => {
                            resetForm();
                            setShowCreateModal(true);
                        }, className: "flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700 transition-colors", children: [_jsx(Plus, { className: "h-5 w-5" }), "Novo Usu\u00E1rio"] })] }), _jsx("div", { className: "rounded-lg border border-slate-200 bg-white p-4", children: _jsxs("div", { className: "flex flex-col md:flex-row gap-4", children: [_jsxs("div", { className: "flex-1 relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" }), _jsx("input", { type: "text", placeholder: "Pesquisar por nome ou email...", value: searchTerm, onChange: (e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }, className: "w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs("select", { value: filters.role, onChange: (e) => {
                                        setFilters({ ...filters, role: e.target.value });
                                        setCurrentPage(1);
                                    }, className: "rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20", children: [_jsx("option", { value: "", children: "Todos os Roles" }), ROLES.map((role) => (_jsx("option", { value: role, children: getRoleLabel(role) }, role)))] }), _jsxs("select", { value: filters.province, onChange: (e) => {
                                        setFilters({ ...filters, province: e.target.value });
                                        setCurrentPage(1);
                                    }, className: "rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20", children: [_jsx("option", { value: "", children: "Todas Prov\u00EDncias" }), ANGOLA_PROVINCES.map((p) => (_jsx("option", { value: p, children: p }, p)))] })] })] }) }), loading ? (_jsxs("div", { className: "text-center py-12", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" }), _jsx("p", { className: "mt-4 text-slate-600", children: "Carregando usu\u00E1rios..." })] })) : (_jsxs("div", { className: "rounded-lg border border-slate-200 bg-white overflow-hidden", children: [_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-slate-50 border-b border-slate-200", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase", children: "Usu\u00E1rio" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase", children: "Role" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase", children: "Localiza\u00E7\u00E3o" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase", children: "Casos" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase", children: "Status" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase", children: "A\u00E7\u00F5es" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-200", children: users.map((userItem) => (_jsxs("tr", { className: "hover:bg-slate-50", children: [_jsx("td", { className: "px-6 py-4", children: _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("p", { className: "font-semibold text-slate-900", children: userItem.fullName }), userItem.isBlocked ? (_jsxs("span", { className: "px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-700 flex items-center gap-1", children: [_jsx(Ban, { className: "h-3 w-3" }), "Bloqueado"] })) : (_jsx("span", { className: "px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-700", children: "Ativo" }))] }), _jsxs("p", { className: "text-sm text-slate-600 flex items-center gap-1", children: [_jsx(Mail, { className: "h-3 w-3" }), userItem.email] }), userItem.phone && (_jsxs("p", { className: "text-sm text-slate-600 flex items-center gap-1", children: [_jsx(Phone, { className: "h-3 w-3" }), userItem.phone] }))] }) }), _jsx("td", { className: "px-6 py-4", children: _jsx("span", { className: `px-2 py-1 rounded text-xs font-semibold ${getRoleColor(userItem.role)}`, children: getRoleLabel(userItem.role) }) }), _jsx("td", { className: "px-6 py-4", children: userItem.province && (_jsxs("p", { className: "text-sm text-slate-600 flex items-center gap-1", children: [_jsx(MapPin, { className: "h-3 w-3" }), userItem.province, userItem.municipality && ` - ${userItem.municipality}`] })) }), _jsx("td", { className: "px-6 py-4", children: _jsx("span", { className: "text-sm font-semibold text-slate-900", children: userItem._count.missingPeople }) }), _jsx("td", { className: "px-6 py-4", children: _jsxs("div", { className: "space-y-1", children: [userItem.verifiedAt ? (_jsxs("span", { className: "flex items-center gap-1 text-green-600 text-sm", children: [_jsx(CheckCircle, { className: "h-4 w-4" }), "Verificado"] })) : (_jsxs("span", { className: "flex items-center gap-1 text-amber-600 text-sm", children: [_jsx(XCircle, { className: "h-4 w-4" }), "N\u00E3o verificado"] })), userItem.isBlocked && (_jsxs("span", { className: "flex items-center gap-1 text-red-600 text-sm", children: [_jsx(Ban, { className: "h-4 w-4" }), "Bloqueado"] }))] }) }), _jsx("td", { className: "px-6 py-4", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { onClick: () => handleEditClick(userItem), className: "p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors", title: "Editar", children: _jsx(Edit, { className: "h-4 w-4" }) }), userItem.id !== user?.id && userItem.role !== 'ADMIN' && (_jsxs(_Fragment, { children: [userItem.isBlocked ? (_jsx("button", { onClick: () => {
                                                                        setSelectedUser(userItem);
                                                                        setShowUnblockModal(true);
                                                                    }, className: "p-2 text-green-600 hover:bg-green-50 rounded transition-colors", title: "Desbloquear", children: _jsx(Unlock, { className: "h-4 w-4" }) })) : (_jsx("button", { onClick: () => {
                                                                        setSelectedUser(userItem);
                                                                        setBlockReason('');
                                                                        setShowBlockModal(true);
                                                                    }, className: "p-2 text-red-600 hover:bg-red-50 rounded transition-colors", title: "Bloquear", children: _jsx(Ban, { className: "h-4 w-4" }) })), _jsx("button", { onClick: () => handleDeleteClick(userItem), className: "p-2 text-red-600 hover:bg-red-50 rounded transition-colors", title: "Deletar", children: _jsx(Trash2, { className: "h-4 w-4" }) })] }))] }) })] }, userItem.id))) })] }) }), pagination && pagination.totalPages > 1 && (_jsxs("div", { className: "px-6 py-4 border-t border-slate-200 flex items-center justify-between", children: [_jsxs("p", { className: "text-sm text-slate-600", children: ["Mostrando ", users.length, " de ", pagination.total, " usu\u00E1rios"] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { onClick: () => setCurrentPage(p => Math.max(1, p - 1)), disabled: !pagination.hasPrevPage, className: `p-2 rounded ${pagination.hasPrevPage ? 'hover:bg-slate-100' : 'opacity-50 cursor-not-allowed'}`, children: _jsx(ChevronLeft, { className: "h-5 w-5" }) }), _jsxs("span", { className: "text-sm text-slate-700", children: ["P\u00E1gina ", pagination.page, " de ", pagination.totalPages] }), _jsx("button", { onClick: () => setCurrentPage(p => Math.min(pagination.totalPages, p + 1)), disabled: !pagination.hasNextPage, className: `p-2 rounded ${pagination.hasNextPage ? 'hover:bg-slate-100' : 'opacity-50 cursor-not-allowed'}`, children: _jsx(ChevronRight, { className: "h-5 w-5" }) })] })] }))] })), _jsx(ConfirmModal, { isOpen: showBlockModal, onClose: () => {
                    setShowBlockModal(false);
                    setSelectedUser(null);
                    setBlockReason('');
                }, onConfirm: async () => {
                    if (!selectedUser)
                        return;
                    try {
                        setProcessing(true);
                        await api.patch(`/admin/users/${selectedUser.id}/block`, {
                            reason: blockReason || 'Bloqueado pelo administrador',
                        });
                        setSuccessMessage(`Usuário ${selectedUser.fullName} bloqueado com sucesso!`);
                        setShowSuccessModal(true);
                        setShowBlockModal(false);
                        setSelectedUser(null);
                        setBlockReason('');
                        await loadUsers();
                    }
                    catch (error) {
                        alert(error.response?.data?.message || 'Erro ao bloquear usuário');
                    }
                    finally {
                        setProcessing(false);
                    }
                }, title: "Bloquear Usu\u00E1rio", message: selectedUser
                    ? `Deseja bloquear o usuário ${selectedUser.fullName}? O usuário não poderá mais acessar a plataforma.`
                    : '', confirmText: processing ? 'Bloqueando...' : 'Bloquear', cancelText: "Cancelar", variant: "warning", children: _jsxs("div", { className: "mt-4", children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-2", children: "Motivo do bloqueio (opcional)" }), _jsx("textarea", { value: blockReason, onChange: (e) => setBlockReason(e.target.value), placeholder: "Ex: Coment\u00E1rios ofensivos, spam, etc.", className: "w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20", rows: 3 })] }) }), _jsx(ConfirmModal, { isOpen: showUnblockModal, onClose: () => {
                    setShowUnblockModal(false);
                    setSelectedUser(null);
                }, onConfirm: async () => {
                    if (!selectedUser)
                        return;
                    try {
                        setProcessing(true);
                        await api.patch(`/admin/users/${selectedUser.id}/unblock`);
                        setSuccessMessage(`Usuário ${selectedUser.fullName} desbloqueado com sucesso!`);
                        setShowSuccessModal(true);
                        setShowUnblockModal(false);
                        setSelectedUser(null);
                        await loadUsers();
                    }
                    catch (error) {
                        alert(error.response?.data?.message || 'Erro ao desbloquear usuário');
                    }
                    finally {
                        setProcessing(false);
                    }
                }, title: "Desbloquear Usu\u00E1rio", message: selectedUser
                    ? `Deseja desbloquear o usuário ${selectedUser.fullName}? O usuário poderá acessar a plataforma novamente.`
                    : '', confirmText: processing ? 'Desbloqueando...' : 'Desbloquear', cancelText: "Cancelar", variant: "info" }), showCreateModal && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4", children: _jsx("div", { className: "bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto", children: _jsxs("div", { className: "p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-slate-900 mb-4", children: "Criar Novo Usu\u00E1rio" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "Nome Completo *" }), _jsx("input", { type: "text", value: formData.fullName, onChange: (e) => setFormData({ ...formData, fullName: e.target.value }), className: "w-full rounded-lg border border-slate-300 px-3 py-2" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "Email *" }), _jsx("input", { type: "email", value: formData.email, onChange: (e) => setFormData({ ...formData, email: e.target.value }), className: "w-full rounded-lg border border-slate-300 px-3 py-2" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "Senha *" }), _jsx("input", { type: "password", value: formData.password, onChange: (e) => setFormData({ ...formData, password: e.target.value }), className: "w-full rounded-lg border border-slate-300 px-3 py-2" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "Role *" }), _jsx("select", { value: formData.role, onChange: (e) => setFormData({ ...formData, role: e.target.value }), className: "w-full rounded-lg border border-slate-300 px-3 py-2", children: ROLES.map((role) => (_jsx("option", { value: role, children: getRoleLabel(role) }, role))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "Telefone" }), _jsx("input", { type: "text", value: formData.phone, onChange: (e) => setFormData({ ...formData, phone: e.target.value }), className: "w-full rounded-lg border border-slate-300 px-3 py-2" })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "Prov\u00EDncia" }), _jsxs("select", { value: formData.province, onChange: (e) => setFormData({ ...formData, province: e.target.value }), className: "w-full rounded-lg border border-slate-300 px-3 py-2", children: [_jsx("option", { value: "", children: "Selecione" }), ANGOLA_PROVINCES.map((p) => (_jsx("option", { value: p, children: p }, p)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "Munic\u00EDpio" }), _jsx("input", { type: "text", value: formData.municipality, onChange: (e) => setFormData({ ...formData, municipality: e.target.value }), className: "w-full rounded-lg border border-slate-300 px-3 py-2" })] })] })] }), _jsxs("div", { className: "flex gap-3 justify-end mt-6", children: [_jsx("button", { onClick: () => {
                                            setShowCreateModal(false);
                                            resetForm();
                                        }, className: "px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50", children: "Cancelar" }), _jsx("button", { onClick: handleCreate, disabled: !formData.fullName || !formData.email || !formData.password || !formData.phone, className: "px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed", children: "Criar Usu\u00E1rio" })] })] }) }) })), showEditModal && selectedUser && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4", children: _jsx("div", { className: "bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto", children: _jsxs("div", { className: "p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-slate-900 mb-4", children: "Editar Usu\u00E1rio" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "Nome Completo *" }), _jsx("input", { type: "text", value: formData.fullName, onChange: (e) => setFormData({ ...formData, fullName: e.target.value }), className: "w-full rounded-lg border border-slate-300 px-3 py-2" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "Email *" }), _jsx("input", { type: "email", value: formData.email, onChange: (e) => setFormData({ ...formData, email: e.target.value }), className: "w-full rounded-lg border border-slate-300 px-3 py-2" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "Nova Senha (deixe em branco para n\u00E3o alterar)" }), _jsx("input", { type: "password", value: formData.password, onChange: (e) => setFormData({ ...formData, password: e.target.value }), className: "w-full rounded-lg border border-slate-300 px-3 py-2", placeholder: "Deixe em branco para manter a senha atual" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "Role *" }), _jsx("select", { value: formData.role, onChange: (e) => setFormData({ ...formData, role: e.target.value }), className: "w-full rounded-lg border border-slate-300 px-3 py-2", children: ROLES.map((role) => (_jsx("option", { value: role, children: getRoleLabel(role) }, role))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "Telefone" }), _jsx("input", { type: "text", value: formData.phone, onChange: (e) => setFormData({ ...formData, phone: e.target.value }), className: "w-full rounded-lg border border-slate-300 px-3 py-2" })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "Prov\u00EDncia" }), _jsxs("select", { value: formData.province, onChange: (e) => setFormData({ ...formData, province: e.target.value }), className: "w-full rounded-lg border border-slate-300 px-3 py-2", children: [_jsx("option", { value: "", children: "Selecione" }), ANGOLA_PROVINCES.map((p) => (_jsx("option", { value: p, children: p }, p)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "Munic\u00EDpio" }), _jsx("input", { type: "text", value: formData.municipality, onChange: (e) => setFormData({ ...formData, municipality: e.target.value }), className: "w-full rounded-lg border border-slate-300 px-3 py-2" })] })] })] }), _jsxs("div", { className: "flex gap-3 justify-end mt-6", children: [_jsx("button", { onClick: () => {
                                            setShowEditModal(false);
                                            resetForm();
                                        }, className: "px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50", children: "Cancelar" }), _jsx("button", { onClick: handleUpdate, disabled: !formData.fullName || !formData.email || !formData.phone, className: "px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed", children: "Salvar Altera\u00E7\u00F5es" })] })] }) }) })), _jsx(ConfirmModal, { isOpen: showDeleteModal, onClose: () => {
                    setShowDeleteModal(false);
                    setSelectedUser(null);
                }, onConfirm: handleDelete, title: "Deletar Usu\u00E1rio", message: `Tem certeza que deseja deletar o usuário "${selectedUser?.fullName}"? Esta ação não pode ser desfeita.`, confirmText: "Deletar", cancelText: "Cancelar", variant: "danger" }), _jsx(InfoModal, { isOpen: showSuccessModal, onClose: () => setShowSuccessModal(false), title: "Sucesso", message: successMessage, variant: "success" }), _jsx(InfoModal, { isOpen: showNoUsersModal, onClose: () => setShowNoUsersModal(false), title: "Nenhum Usu\u00E1rio Encontrado", message: `Não há usuários cadastrados na província "${filters.province}".`, variant: "info" })] }));
}
