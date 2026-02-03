import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Megaphone, Plus, Edit, Trash2, Save, X, AlertCircle, Bell, FileText, Wrench } from 'lucide-react';
import { api } from '../../api/client';
import { InfoModal } from '../../components/InfoModal';
import { ConfirmModal } from '../../components/ConfirmModal';
const ANGOLAN_PROVINCES = [
    'Bengo', 'Benguela', 'Bié', 'Cabinda', 'Cuando-Cubango', 'Cuanza-Norte',
    'Cuanza-Sul', 'Cunene', 'Huambo', 'Huíla', 'Luanda', 'Lunda-Norte',
    'Lunda-Sul', 'Malanje', 'Moxico', 'Namibe', 'Uíge', 'Zaire'
];
const USER_ROLES = [
    { value: 'CIDADAO', label: 'Cidadão' },
    { value: 'FAMILIAR', label: 'Familiar' },
    { value: 'VOLUNTARIO', label: 'Voluntário' },
    { value: 'MODERADOR', label: 'Moderador' },
    { value: 'ADMIN', label: 'Admin' },
    { value: 'AUTORIDADE', label: 'Autoridade' },
];
export function AnnouncementsPage() {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        type: 'NOTICIA',
        title: '',
        content: '',
        priority: 'NORMAL',
        targetRoles: [],
        expiresAt: '',
    });
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [filter, setFilter] = useState('');
    useEffect(() => {
        loadAnnouncements();
    }, [filter]);
    const loadAnnouncements = async () => {
        try {
            setLoading(true);
            const params = filter ? `?type=${filter}` : '';
            const { data } = await api.get(`/announcements${params}`);
            setAnnouncements(data.announcements || []);
        }
        catch (error) {
            console.error('Erro ao carregar comunicados:', error);
            alert('Erro ao carregar comunicados');
        }
        finally {
            setLoading(false);
        }
    };
    const handleCreate = async () => {
        try {
            await api.post('/announcements', {
                ...formData,
                expiresAt: formData.expiresAt || null,
                targetRoles: formData.targetRoles.length > 0 ? formData.targetRoles : null,
            });
            setSuccessMessage('Comunicado criado e enviado com sucesso!');
            setShowSuccessModal(true);
            setShowCreateModal(false);
            setFormData({ type: 'NOTICIA', title: '', content: '', priority: 'NORMAL', targetRoles: [], expiresAt: '' });
            await loadAnnouncements();
        }
        catch (error) {
            alert(error.response?.data?.message || 'Erro ao criar comunicado');
        }
    };
    const handleUpdate = async (id) => {
        try {
            await api.put(`/announcements/${id}`, formData);
            setSuccessMessage('Comunicado atualizado com sucesso!');
            setShowSuccessModal(true);
            setEditingId(null);
            setFormData({ type: 'NOTICIA', title: '', content: '', priority: 'NORMAL', targetRoles: [], expiresAt: '' });
            await loadAnnouncements();
        }
        catch (error) {
            alert(error.response?.data?.message || 'Erro ao atualizar comunicado');
        }
    };
    const handleDelete = async () => {
        if (!deletingId)
            return;
        try {
            await api.delete(`/announcements/${deletingId}`);
            setSuccessMessage('Comunicado deletado com sucesso!');
            setShowSuccessModal(true);
            setShowDeleteModal(false);
            setDeletingId(null);
            await loadAnnouncements();
        }
        catch (error) {
            alert(error.response?.data?.message || 'Erro ao deletar comunicado');
        }
    };
    const startEdit = (announcement) => {
        setEditingId(announcement.id);
        setFormData({
            type: announcement.type,
            title: announcement.title,
            content: announcement.content,
            priority: announcement.priority,
            targetRoles: announcement.targetRoles || [],
            expiresAt: announcement.expiresAt ? announcement.expiresAt.split('T')[0] : '',
        });
    };
    const cancelEdit = () => {
        setEditingId(null);
        setFormData({ type: 'NOTICIA', title: '', content: '', priority: 'NORMAL', targetRoles: [], expiresAt: '' });
    };
    const getTypeIcon = (type) => {
        switch (type) {
            case 'ALERTA_URGENTE':
                return _jsx(AlertCircle, { className: "h-5 w-5 text-red-600" });
            case 'NOTICIA':
                return _jsx(Bell, { className: "h-5 w-5 text-blue-600" });
            case 'INSTRUCAO':
                return _jsx(FileText, { className: "h-5 w-5 text-green-600" });
            case 'MANUTENCAO':
                return _jsx(Wrench, { className: "h-5 w-5 text-amber-600" });
            default:
                return _jsx(Megaphone, { className: "h-5 w-5 text-slate-600" });
        }
    };
    const getTypeLabel = (type) => {
        const labels = {
            NOTICIA: 'Notícia',
            ALERTA_URGENTE: 'Alerta Urgente',
            INSTRUCAO: 'Instrução',
            MANUTENCAO: 'Manutenção',
            OUTRO: 'Outro',
        };
        return labels[type] || type;
    };
    const getPriorityLabel = (priority) => {
        const labels = {
            LOW: 'Baixa',
            NORMAL: 'Normal',
            HIGH: 'Alta',
            URGENT: 'Urgente',
        };
        return labels[priority] || priority;
    };
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center min-h-screen", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" }), _jsx("p", { className: "mt-4 text-slate-600", children: "Carregando..." })] }) }));
    }
    return (_jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsxs("div", { className: "mb-6 flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-slate-900", children: "Comunicados Globais" }), _jsx("p", { className: "mt-2 text-slate-600", children: "Envie not\u00EDcias, alertas e instru\u00E7\u00F5es para todos os usu\u00E1rios" })] }), _jsxs("button", { onClick: () => {
                            setShowCreateModal(true);
                            setFormData({ type: 'NOTICIA', title: '', content: '', priority: 'NORMAL', targetRoles: [], expiresAt: '' });
                        }, className: "px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 flex items-center gap-2", children: [_jsx(Plus, { className: "h-5 w-5" }), "Novo Comunicado"] })] }), _jsx("div", { className: "mb-6", children: _jsxs("select", { value: filter, onChange: (e) => setFilter(e.target.value), className: "px-4 py-2 rounded-lg border border-slate-300 bg-white", children: [_jsx("option", { value: "", children: "Todos os Tipos" }), _jsx("option", { value: "NOTICIA", children: "Not\u00EDcias" }), _jsx("option", { value: "ALERTA_URGENTE", children: "Alertas Urgentes" }), _jsx("option", { value: "INSTRUCAO", children: "Instru\u00E7\u00F5es" }), _jsx("option", { value: "MANUTENCAO", children: "Manuten\u00E7\u00E3o" }), _jsx("option", { value: "OUTRO", children: "Outro" })] }) }), _jsx("div", { className: "space-y-4", children: announcements.map((announcement) => (_jsx("div", { className: "bg-white rounded-lg border border-slate-200 p-6", children: editingId === announcement.id ? (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "Tipo" }), _jsxs("select", { value: formData.type, onChange: (e) => setFormData({ ...formData, type: e.target.value }), className: "w-full rounded-lg border border-slate-300 px-3 py-2", children: [_jsx("option", { value: "NOTICIA", children: "Not\u00EDcia" }), _jsx("option", { value: "ALERTA_URGENTE", children: "Alerta Urgente" }), _jsx("option", { value: "INSTRUCAO", children: "Instru\u00E7\u00E3o" }), _jsx("option", { value: "MANUTENCAO", children: "Manuten\u00E7\u00E3o" }), _jsx("option", { value: "OUTRO", children: "Outro" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "T\u00EDtulo" }), _jsx("input", { type: "text", value: formData.title, onChange: (e) => setFormData({ ...formData, title: e.target.value }), className: "w-full rounded-lg border border-slate-300 px-3 py-2" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "Conte\u00FAdo" }), _jsx("textarea", { value: formData.content, onChange: (e) => setFormData({ ...formData, content: e.target.value }), className: "w-full rounded-lg border border-slate-300 px-3 py-2", rows: 6 })] }), _jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "Prioridade" }), _jsxs("select", { value: formData.priority, onChange: (e) => setFormData({ ...formData, priority: e.target.value }), className: "w-full rounded-lg border border-slate-300 px-3 py-2", children: [_jsx("option", { value: "LOW", children: "Baixa" }), _jsx("option", { value: "NORMAL", children: "Normal" }), _jsx("option", { value: "HIGH", children: "Alta" }), _jsx("option", { value: "URGENT", children: "Urgente" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "Expira em (opcional)" }), _jsx("input", { type: "date", value: formData.expiresAt, onChange: (e) => setFormData({ ...formData, expiresAt: e.target.value }), className: "w-full rounded-lg border border-slate-300 px-3 py-2" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "Roles Alvo (deixe vazio para todos)" }), _jsx("div", { className: "flex flex-wrap gap-2 mt-2", children: USER_ROLES.map((role) => (_jsxs("label", { className: "flex items-center gap-2", children: [_jsx("input", { type: "checkbox", checked: formData.targetRoles.includes(role.value), onChange: (e) => {
                                                        if (e.target.checked) {
                                                            setFormData({ ...formData, targetRoles: [...formData.targetRoles, role.value] });
                                                        }
                                                        else {
                                                            setFormData({ ...formData, targetRoles: formData.targetRoles.filter(r => r !== role.value) });
                                                        }
                                                    }, className: "rounded" }), _jsx("span", { className: "text-sm text-slate-700", children: role.label })] }, role.value))) })] }), _jsxs("div", { className: "flex gap-2 justify-end", children: [_jsxs("button", { onClick: cancelEdit, className: "px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 flex items-center gap-2", children: [_jsx(X, { className: "h-4 w-4" }), "Cancelar"] }), _jsxs("button", { onClick: () => handleUpdate(announcement.id), className: "px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2", children: [_jsx(Save, { className: "h-4 w-4" }), "Salvar"] })] })] })) : (_jsx(_Fragment, { children: _jsxs("div", { className: "flex items-start justify-between mb-3", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [getTypeIcon(announcement.type), _jsx("span", { className: "px-3 py-1 rounded text-sm font-semibold bg-blue-100 text-blue-700", children: getTypeLabel(announcement.type) }), _jsx("span", { className: `px-2 py-1 rounded text-xs font-semibold ${announcement.priority === 'URGENT' ? 'bg-red-100 text-red-700' :
                                                        announcement.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                                                            announcement.priority === 'NORMAL' ? 'bg-blue-100 text-blue-700' :
                                                                'bg-slate-100 text-slate-700'}`, children: getPriorityLabel(announcement.priority) }), announcement.isActive ? (_jsx("span", { className: "px-2 py-1 rounded text-xs bg-green-100 text-green-700", children: "Ativo" })) : (_jsx("span", { className: "px-2 py-1 rounded text-xs bg-red-100 text-red-700", children: "Inativo" }))] }), _jsx("h3", { className: "text-xl font-semibold text-slate-900 mb-2", children: announcement.title }), _jsx("div", { className: "prose max-w-none text-slate-600 whitespace-pre-wrap", children: announcement.content }), _jsxs("p", { className: "text-xs text-slate-500 mt-3", children: ["Criado por ", announcement.createdByUser.fullName, " em ", new Date(announcement.createdAt).toLocaleDateString('pt-AO'), announcement.targetRoles && announcement.targetRoles.length > 0 && (_jsxs(_Fragment, { children: [" \u2022 Para: ", announcement.targetRoles.join(', ')] })), announcement.expiresAt && (_jsxs(_Fragment, { children: [" \u2022 Expira em: ", new Date(announcement.expiresAt).toLocaleDateString('pt-AO')] }))] })] }), _jsxs("div", { className: "flex gap-2 ml-4", children: [_jsx("button", { onClick: () => startEdit(announcement), className: "p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors", title: "Editar", children: _jsx(Edit, { className: "h-4 w-4" }) }), _jsx("button", { onClick: () => {
                                                setDeletingId(announcement.id);
                                                setShowDeleteModal(true);
                                            }, className: "p-2 text-red-600 hover:bg-red-50 rounded transition-colors", title: "Deletar", children: _jsx(Trash2, { className: "h-4 w-4" }) })] })] }) })) }, announcement.id))) }), showCreateModal && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4", children: _jsxs("div", { className: "bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto", children: [_jsx("h3", { className: "text-lg font-semibold text-slate-900 mb-4", children: "Criar Novo Comunicado" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "Tipo *" }), _jsxs("select", { value: formData.type, onChange: (e) => setFormData({ ...formData, type: e.target.value }), className: "w-full rounded-lg border border-slate-300 px-3 py-2", children: [_jsx("option", { value: "NOTICIA", children: "Not\u00EDcia" }), _jsx("option", { value: "ALERTA_URGENTE", children: "Alerta Urgente" }), _jsx("option", { value: "INSTRUCAO", children: "Instru\u00E7\u00E3o" }), _jsx("option", { value: "MANUTENCAO", children: "Manuten\u00E7\u00E3o" }), _jsx("option", { value: "OUTRO", children: "Outro" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "T\u00EDtulo *" }), _jsx("input", { type: "text", value: formData.title, onChange: (e) => setFormData({ ...formData, title: e.target.value }), className: "w-full rounded-lg border border-slate-300 px-3 py-2", placeholder: "Ex: Nova funcionalidade dispon\u00EDvel" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "Conte\u00FAdo *" }), _jsx("textarea", { value: formData.content, onChange: (e) => setFormData({ ...formData, content: e.target.value }), className: "w-full rounded-lg border border-slate-300 px-3 py-2", rows: 8, placeholder: "Digite o conte\u00FAdo do comunicado aqui..." })] }), _jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "Prioridade" }), _jsxs("select", { value: formData.priority, onChange: (e) => setFormData({ ...formData, priority: e.target.value }), className: "w-full rounded-lg border border-slate-300 px-3 py-2", children: [_jsx("option", { value: "LOW", children: "Baixa" }), _jsx("option", { value: "NORMAL", children: "Normal" }), _jsx("option", { value: "HIGH", children: "Alta" }), _jsx("option", { value: "URGENT", children: "Urgente" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "Expira em (opcional)" }), _jsx("input", { type: "date", value: formData.expiresAt, onChange: (e) => setFormData({ ...formData, expiresAt: e.target.value }), className: "w-full rounded-lg border border-slate-300 px-3 py-2" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "Roles Alvo (deixe vazio para todos)" }), _jsx("div", { className: "flex flex-wrap gap-2 mt-2", children: USER_ROLES.map((role) => (_jsxs("label", { className: "flex items-center gap-2", children: [_jsx("input", { type: "checkbox", checked: formData.targetRoles.includes(role.value), onChange: (e) => {
                                                            if (e.target.checked) {
                                                                setFormData({ ...formData, targetRoles: [...formData.targetRoles, role.value] });
                                                            }
                                                            else {
                                                                setFormData({ ...formData, targetRoles: formData.targetRoles.filter(r => r !== role.value) });
                                                            }
                                                        }, className: "rounded" }), _jsx("span", { className: "text-sm text-slate-700", children: role.label })] }, role.value))) })] })] }), _jsxs("div", { className: "flex gap-3 justify-end mt-6", children: [_jsx("button", { onClick: () => setShowCreateModal(false), className: "px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50", children: "Cancelar" }), _jsx("button", { onClick: handleCreate, disabled: !formData.title || !formData.content, className: "px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50", children: "Criar e Enviar" })] })] }) })), _jsx(ConfirmModal, { isOpen: showDeleteModal, onClose: () => {
                    setShowDeleteModal(false);
                    setDeletingId(null);
                }, onConfirm: handleDelete, title: "Deletar Comunicado", message: "Tem certeza que deseja deletar este comunicado? Esta a\u00E7\u00E3o n\u00E3o pode ser desfeita.", confirmText: "Deletar", cancelText: "Cancelar", variant: "warning" }), _jsx(InfoModal, { isOpen: showSuccessModal, onClose: () => {
                    setShowSuccessModal(false);
                    setSuccessMessage('');
                }, title: "Sucesso", message: successMessage, variant: "success" })] }));
}
