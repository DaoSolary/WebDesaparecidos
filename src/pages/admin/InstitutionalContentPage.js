import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { api } from '../../api/client';
import { InfoModal } from '../../components/InfoModal';
import { ConfirmModal } from '../../components/ConfirmModal';
export function InstitutionalContentPage() {
    const [contents, setContents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        type: 'FAQ',
        title: '',
        content: '',
        order: 0,
        isActive: true,
    });
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [filter, setFilter] = useState('');
    useEffect(() => {
        loadContents();
    }, [filter]);
    const loadContents = async () => {
        try {
            setLoading(true);
            const params = filter ? `?type=${filter}` : '';
            const { data } = await api.get(`/institutional-content${params}`);
            setContents(data.content || []);
        }
        catch (error) {
            console.error('Erro ao carregar conteúdo:', error);
            alert('Erro ao carregar conteúdo institucional');
        }
        finally {
            setLoading(false);
        }
    };
    const handleCreate = async () => {
        try {
            await api.post('/institutional-content', formData);
            setSuccessMessage('Conteúdo criado com sucesso!');
            setShowSuccessModal(true);
            setShowCreateModal(false);
            setFormData({ type: 'FAQ', title: '', content: '', order: 0, isActive: true });
            await loadContents();
        }
        catch (error) {
            alert(error.response?.data?.message || 'Erro ao criar conteúdo');
        }
    };
    const handleUpdate = async (id) => {
        try {
            await api.put(`/institutional-content/${id}`, formData);
            setSuccessMessage('Conteúdo atualizado com sucesso!');
            setShowSuccessModal(true);
            setEditingId(null);
            setFormData({ type: 'FAQ', title: '', content: '', order: 0, isActive: true });
            await loadContents();
        }
        catch (error) {
            alert(error.response?.data?.message || 'Erro ao atualizar conteúdo');
        }
    };
    const handleDelete = async () => {
        if (!deletingId)
            return;
        try {
            await api.delete(`/institutional-content/${deletingId}`);
            setSuccessMessage('Conteúdo deletado com sucesso!');
            setShowSuccessModal(true);
            setShowDeleteModal(false);
            setDeletingId(null);
            await loadContents();
        }
        catch (error) {
            alert(error.response?.data?.message || 'Erro ao deletar conteúdo');
        }
    };
    const startEdit = (content) => {
        setEditingId(content.id);
        setFormData({
            type: content.type,
            title: content.title,
            content: content.content,
            order: content.order,
            isActive: content.isActive,
        });
    };
    const cancelEdit = () => {
        setEditingId(null);
        setFormData({ type: 'FAQ', title: '', content: '', order: 0, isActive: true });
    };
    const getTypeLabel = (type) => {
        const labels = {
            FAQ: 'FAQ',
            INSTRUCOES: 'Instruções',
            CONTACTO_EMERGENCIA: 'Contacto de Emergência',
            SOBRE_NOS: 'Sobre Nós',
            TERMOS_USO: 'Termos de Uso',
            POLITICA_PRIVACIDADE: 'Política de Privacidade',
            OUTRO: 'Outro',
        };
        return labels[type] || type;
    };
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center min-h-screen", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" }), _jsx("p", { className: "mt-4 text-slate-600", children: "Carregando..." })] }) }));
    }
    return (_jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsxs("div", { className: "mb-6 flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-slate-900", children: "Conte\u00FAdo Institucional" }), _jsx("p", { className: "mt-2 text-slate-600", children: "Gerencie FAQs, instru\u00E7\u00F5es e contactos de emerg\u00EAncia" })] }), _jsxs("button", { onClick: () => {
                            setShowCreateModal(true);
                            setFormData({ type: 'FAQ', title: '', content: '', order: 0, isActive: true });
                        }, className: "px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 flex items-center gap-2", children: [_jsx(Plus, { className: "h-5 w-5" }), "Novo Conte\u00FAdo"] })] }), _jsx("div", { className: "mb-6", children: _jsxs("select", { value: filter, onChange: (e) => setFilter(e.target.value), className: "px-4 py-2 rounded-lg border border-slate-300 bg-white", children: [_jsx("option", { value: "", children: "Todos os Tipos" }), _jsx("option", { value: "FAQ", children: "FAQ" }), _jsx("option", { value: "INSTRUCOES", children: "Instru\u00E7\u00F5es" }), _jsx("option", { value: "CONTACTO_EMERGENCIA", children: "Contacto de Emerg\u00EAncia" }), _jsx("option", { value: "SOBRE_NOS", children: "Sobre N\u00F3s" }), _jsx("option", { value: "TERMOS_USO", children: "Termos de Uso" }), _jsx("option", { value: "POLITICA_PRIVACIDADE", children: "Pol\u00EDtica de Privacidade" }), _jsx("option", { value: "OUTRO", children: "Outro" })] }) }), _jsx("div", { className: "space-y-4", children: contents.map((content) => (_jsx("div", { className: "bg-white rounded-lg border border-slate-200 p-6", children: editingId === content.id ? (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "Tipo" }), _jsxs("select", { value: formData.type, onChange: (e) => setFormData({ ...formData, type: e.target.value }), className: "w-full rounded-lg border border-slate-300 px-3 py-2", children: [_jsx("option", { value: "FAQ", children: "FAQ" }), _jsx("option", { value: "INSTRUCOES", children: "Instru\u00E7\u00F5es" }), _jsx("option", { value: "CONTACTO_EMERGENCIA", children: "Contacto de Emerg\u00EAncia" }), _jsx("option", { value: "SOBRE_NOS", children: "Sobre N\u00F3s" }), _jsx("option", { value: "TERMOS_USO", children: "Termos de Uso" }), _jsx("option", { value: "POLITICA_PRIVACIDADE", children: "Pol\u00EDtica de Privacidade" }), _jsx("option", { value: "OUTRO", children: "Outro" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "T\u00EDtulo" }), _jsx("input", { type: "text", value: formData.title, onChange: (e) => setFormData({ ...formData, title: e.target.value }), className: "w-full rounded-lg border border-slate-300 px-3 py-2" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "Conte\u00FAdo" }), _jsx("textarea", { value: formData.content, onChange: (e) => setFormData({ ...formData, content: e.target.value }), className: "w-full rounded-lg border border-slate-300 px-3 py-2", rows: 6 })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("label", { className: "flex items-center gap-2", children: [_jsx("input", { type: "checkbox", checked: formData.isActive, onChange: (e) => setFormData({ ...formData, isActive: e.target.checked }), className: "rounded" }), _jsx("span", { className: "text-sm text-slate-700", children: "Ativo" })] }), _jsx("div", { className: "flex-1" }), _jsxs("button", { onClick: cancelEdit, className: "px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 flex items-center gap-2", children: [_jsx(X, { className: "h-4 w-4" }), "Cancelar"] }), _jsxs("button", { onClick: () => handleUpdate(content.id), className: "px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2", children: [_jsx(Save, { className: "h-4 w-4" }), "Salvar"] })] })] })) : (_jsx(_Fragment, { children: _jsxs("div", { className: "flex items-start justify-between mb-3", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsx("span", { className: "px-3 py-1 rounded text-sm font-semibold bg-blue-100 text-blue-700", children: getTypeLabel(content.type) }), content.isActive ? (_jsx("span", { className: "px-2 py-1 rounded text-xs bg-green-100 text-green-700", children: "Ativo" })) : (_jsx("span", { className: "px-2 py-1 rounded text-xs bg-red-100 text-red-700", children: "Inativo" }))] }), _jsx("h3", { className: "text-xl font-semibold text-slate-900 mb-2", children: content.title }), _jsx("div", { className: "prose max-w-none text-slate-600 whitespace-pre-wrap", children: content.content }), _jsxs("p", { className: "text-xs text-slate-500 mt-3", children: ["Criado por ", content.createdByUser.fullName, " em ", new Date(content.createdAt).toLocaleDateString('pt-AO'), content.updatedByUser && ` • Atualizado por ${content.updatedByUser.fullName}`] })] }), _jsxs("div", { className: "flex gap-2 ml-4", children: [_jsx("button", { onClick: () => startEdit(content), className: "p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors", title: "Editar", children: _jsx(Edit, { className: "h-4 w-4" }) }), _jsx("button", { onClick: () => {
                                                setDeletingId(content.id);
                                                setShowDeleteModal(true);
                                            }, className: "p-2 text-red-600 hover:bg-red-50 rounded transition-colors", title: "Deletar", children: _jsx(Trash2, { className: "h-4 w-4" }) })] })] }) })) }, content.id))) }), showCreateModal && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4", children: _jsxs("div", { className: "bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto", children: [_jsx("h3", { className: "text-lg font-semibold text-slate-900 mb-4", children: "Criar Novo Conte\u00FAdo" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "Tipo *" }), _jsxs("select", { value: formData.type, onChange: (e) => setFormData({ ...formData, type: e.target.value }), className: "w-full rounded-lg border border-slate-300 px-3 py-2", children: [_jsx("option", { value: "FAQ", children: "FAQ" }), _jsx("option", { value: "INSTRUCOES", children: "Instru\u00E7\u00F5es" }), _jsx("option", { value: "CONTACTO_EMERGENCIA", children: "Contacto de Emerg\u00EAncia" }), _jsx("option", { value: "SOBRE_NOS", children: "Sobre N\u00F3s" }), _jsx("option", { value: "TERMOS_USO", children: "Termos de Uso" }), _jsx("option", { value: "POLITICA_PRIVACIDADE", children: "Pol\u00EDtica de Privacidade" }), _jsx("option", { value: "OUTRO", children: "Outro" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "T\u00EDtulo *" }), _jsx("input", { type: "text", value: formData.title, onChange: (e) => setFormData({ ...formData, title: e.target.value }), className: "w-full rounded-lg border border-slate-300 px-3 py-2", placeholder: "Ex: Como reportar um desaparecimento?" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "Conte\u00FAdo *" }), _jsx("textarea", { value: formData.content, onChange: (e) => setFormData({ ...formData, content: e.target.value }), className: "w-full rounded-lg border border-slate-300 px-3 py-2", rows: 8, placeholder: "Digite o conte\u00FAdo aqui..." })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("input", { type: "checkbox", checked: formData.isActive, onChange: (e) => setFormData({ ...formData, isActive: e.target.checked }), className: "rounded" }), _jsx("label", { className: "text-sm text-slate-700", children: "Ativo" })] })] }), _jsxs("div", { className: "flex gap-3 justify-end mt-6", children: [_jsx("button", { onClick: () => setShowCreateModal(false), className: "px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50", children: "Cancelar" }), _jsx("button", { onClick: handleCreate, disabled: !formData.title || !formData.content, className: "px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50", children: "Criar" })] })] }) })), _jsx(ConfirmModal, { isOpen: showDeleteModal, onClose: () => {
                    setShowDeleteModal(false);
                    setDeletingId(null);
                }, onConfirm: handleDelete, title: "Deletar Conte\u00FAdo", message: "Tem certeza que deseja deletar este conte\u00FAdo? Esta a\u00E7\u00E3o n\u00E3o pode ser desfeita.", confirmText: "Deletar", cancelText: "Cancelar", variant: "warning" }), _jsx(InfoModal, { isOpen: showSuccessModal, onClose: () => {
                    setShowSuccessModal(false);
                    setSuccessMessage('');
                }, title: "Sucesso", message: successMessage, variant: "success" })] }));
}
