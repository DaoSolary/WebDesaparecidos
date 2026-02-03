import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Bell, Save, ToggleLeft, ToggleRight } from 'lucide-react';
import { api } from '../../api/client';
import { InfoModal } from '../../components/InfoModal';
const EVENT_TYPES = [
    { value: 'new_case', label: 'Novo Caso Reportado', description: 'Quando um novo caso é criado' },
    { value: 'case_approved', label: 'Caso Aprovado', description: 'Quando um caso é aprovado pelo moderador' },
    { value: 'case_rejected', label: 'Caso Rejeitado', description: 'Quando um caso é rejeitado pelo moderador' },
    { value: 'new_sighting', label: 'Novo Avistamento', description: 'Quando um novo avistamento é reportado' },
    { value: 'case_status_changed', label: 'Status do Caso Alterado', description: 'Quando o status de um caso é alterado' },
    { value: 'new_chat_message', label: 'Nova Mensagem no Chat', description: 'Quando uma nova mensagem é enviada no chat' },
    { value: 'new_authority_chat', label: 'Nova Conversa com Autoridade', description: 'Quando uma nova conversa com autoridade é iniciada' },
    { value: 'global_announcement', label: 'Comunicado Global', description: 'Quando um comunicado global é enviado' },
];
const USER_ROLES = [
    { value: 'CIDADAO', label: 'Cidadão' },
    { value: 'FAMILIAR', label: 'Familiar' },
    { value: 'VOLUNTARIO', label: 'Voluntário' },
    { value: 'MODERADOR', label: 'Moderador' },
    { value: 'ADMIN', label: 'Admin' },
    { value: 'AUTORIDADE', label: 'Autoridade' },
];
export function NotificationConfigPage() {
    const [configs, setConfigs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [editingConfig, setEditingConfig] = useState(null);
    const [editFormData, setEditFormData] = useState({
        template: '',
        targetRoles: [],
    });
    useEffect(() => {
        loadConfigs();
    }, []);
    const loadConfigs = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/notification-config');
            setConfigs(data.configs || []);
        }
        catch (error) {
            console.error('Erro ao carregar configurações:', error);
            alert('Erro ao carregar configurações de notificações');
        }
        finally {
            setLoading(false);
        }
    };
    const handleToggle = async (eventType, enabled) => {
        try {
            setSaving(eventType);
            await api.put(`/notification-config/${eventType}`, { enabled: !enabled });
            await loadConfigs();
            setShowSuccessModal(true);
        }
        catch (error) {
            alert(error.response?.data?.message || 'Erro ao atualizar configuração');
        }
        finally {
            setSaving(null);
        }
    };
    const handleEdit = (config) => {
        setEditingConfig(config.eventType);
        setEditFormData({
            template: config.template || '',
            targetRoles: config.targetRoles || [],
        });
    };
    const handleSaveEdit = async (eventType) => {
        try {
            setSaving(eventType);
            await api.put(`/notification-config/${eventType}`, editFormData);
            setEditingConfig(null);
            await loadConfigs();
            setShowSuccessModal(true);
        }
        catch (error) {
            alert(error.response?.data?.message || 'Erro ao salvar configuração');
        }
        finally {
            setSaving(null);
        }
    };
    const getEventLabel = (eventType) => {
        const event = EVENT_TYPES.find(e => e.value === eventType);
        return event ? event.label : eventType;
    };
    const getEventDescription = (eventType) => {
        const event = EVENT_TYPES.find(e => e.value === eventType);
        return event ? event.description : '';
    };
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center min-h-screen", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" }), _jsx("p", { className: "mt-4 text-slate-600", children: "Carregando..." })] }) }));
    }
    return (_jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h1", { className: "text-3xl font-bold text-slate-900", children: "Configura\u00E7\u00F5es de Notifica\u00E7\u00F5es" }), _jsx("p", { className: "mt-2 text-slate-600", children: "Gerencie notifica\u00E7\u00F5es autom\u00E1ticas da plataforma" })] }), _jsx("div", { className: "space-y-4", children: configs.map((config) => (_jsx("div", { className: "bg-white rounded-lg border border-slate-200 p-6", children: _jsx("div", { className: "flex items-start justify-between", children: _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsx(Bell, { className: "h-5 w-5 text-blue-600" }), _jsx("h3", { className: "text-lg font-semibold text-slate-900", children: getEventLabel(config.eventType) }), _jsx("button", { onClick: () => handleToggle(config.eventType, config.enabled), disabled: saving === config.eventType, className: `flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${config.enabled
                                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`, children: config.enabled ? (_jsxs(_Fragment, { children: [_jsx(ToggleRight, { className: "h-4 w-4" }), "Ativado"] })) : (_jsxs(_Fragment, { children: [_jsx(ToggleLeft, { className: "h-4 w-4" }), "Desativado"] })) })] }), _jsx("p", { className: "text-sm text-slate-600 mb-4", children: getEventDescription(config.eventType) }), editingConfig === config.eventType ? (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "Template da Mensagem" }), _jsx("textarea", { value: editFormData.template, onChange: (e) => setEditFormData({ ...editFormData, template: e.target.value }), className: "w-full rounded-lg border border-slate-300 px-3 py-2", rows: 3, placeholder: "Ex: Novo caso reportado: {caseName}" }), _jsxs("p", { className: "text-xs text-slate-500 mt-1", children: ["Use vari\u00E1veis como ", '{caseName}', ", ", '{status}', ", ", '{reason}', " conforme o tipo de evento"] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "Roles Alvo (deixe vazio para todos)" }), _jsx("div", { className: "flex flex-wrap gap-2 mt-2", children: USER_ROLES.map((role) => (_jsxs("label", { className: "flex items-center gap-2", children: [_jsx("input", { type: "checkbox", checked: editFormData.targetRoles.includes(role.value), onChange: (e) => {
                                                                    if (e.target.checked) {
                                                                        setEditFormData({ ...editFormData, targetRoles: [...editFormData.targetRoles, role.value] });
                                                                    }
                                                                    else {
                                                                        setEditFormData({ ...editFormData, targetRoles: editFormData.targetRoles.filter(r => r !== role.value) });
                                                                    }
                                                                }, className: "rounded" }), _jsx("span", { className: "text-sm text-slate-700", children: role.label })] }, role.value))) })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => setEditingConfig(null), className: "px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50", children: "Cancelar" }), _jsxs("button", { onClick: () => handleSaveEdit(config.eventType), disabled: saving === config.eventType, className: "px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2", children: [_jsx(Save, { className: "h-4 w-4" }), "Salvar"] })] })] })) : (_jsxs("div", { className: "space-y-2", children: [config.template && (_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-slate-700", children: "Template:" }), _jsx("p", { className: "text-sm text-slate-600 bg-slate-50 p-2 rounded", children: config.template })] })), config.targetRoles && config.targetRoles.length > 0 && (_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-slate-700", children: "Roles Alvo:" }), _jsx("p", { className: "text-sm text-slate-600", children: config.targetRoles.join(', ') })] })), _jsx("button", { onClick: () => handleEdit(config), className: "px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm", children: "Editar Configura\u00E7\u00E3o" })] }))] }) }) }, config.eventType))) }), _jsx(InfoModal, { isOpen: showSuccessModal, onClose: () => setShowSuccessModal(false), title: "Sucesso", message: "Configura\u00E7\u00E3o atualizada com sucesso!", variant: "success" })] }));
}
