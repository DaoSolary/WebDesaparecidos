import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw } from 'lucide-react';
import { api } from '../../api/client';
import { InfoModal } from '../../components/InfoModal';
export function SystemConfigPage() {
    const [limits, setLimits] = useState({
        maxCasesPerDay: 10,
        maxReportsPerDay: 5,
        maxSightingsPerDay: 20,
        maxChatMessagesPerDay: 100,
        rateLimitRequests: 1000,
        rateLimitWindow: 3600,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    useEffect(() => {
        loadLimits();
    }, []);
    const loadLimits = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/system-config/limits/daily');
            if (data.limits) {
                setLimits(data.limits);
            }
        }
        catch (error) {
            console.error('Erro ao carregar limites:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleSave = async () => {
        try {
            setSaving(true);
            await api.put('/system-config/limits/daily', limits);
            setShowSuccessModal(true);
        }
        catch (error) {
            alert(error.response?.data?.message || 'Erro ao salvar limites');
        }
        finally {
            setSaving(false);
        }
    };
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center min-h-screen", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" }), _jsx("p", { className: "mt-4 text-slate-600", children: "Carregando..." })] }) }));
    }
    return (_jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h1", { className: "text-3xl font-bold text-slate-900", children: "Configura\u00E7\u00F5es do Sistema" }), _jsx("p", { className: "mt-2 text-slate-600", children: "Configure limites de uso di\u00E1rio para evitar abuso da plataforma" })] }), _jsxs("div", { className: "bg-white rounded-lg border border-slate-200 p-6", children: [_jsxs("h2", { className: "text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2", children: [_jsx(Settings, { className: "h-5 w-5" }), "Limites de Uso Di\u00E1rio"] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-2", children: "M\u00E1ximo de Casos por Dia" }), _jsx("input", { type: "number", value: limits.maxCasesPerDay, onChange: (e) => setLimits({ ...limits, maxCasesPerDay: parseInt(e.target.value) || 0 }), className: "w-full rounded-lg border border-slate-300 px-3 py-2", min: "1" }), _jsx("p", { className: "text-xs text-slate-500 mt-1", children: "N\u00FAmero m\u00E1ximo de casos que um usu\u00E1rio pode criar por dia" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-2", children: "M\u00E1ximo de Den\u00FAncias por Dia" }), _jsx("input", { type: "number", value: limits.maxReportsPerDay, onChange: (e) => setLimits({ ...limits, maxReportsPerDay: parseInt(e.target.value) || 0 }), className: "w-full rounded-lg border border-slate-300 px-3 py-2", min: "1" }), _jsx("p", { className: "text-xs text-slate-500 mt-1", children: "N\u00FAmero m\u00E1ximo de den\u00FAncias que um usu\u00E1rio pode fazer por dia" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-2", children: "M\u00E1ximo de Avistamentos por Dia" }), _jsx("input", { type: "number", value: limits.maxSightingsPerDay, onChange: (e) => setLimits({ ...limits, maxSightingsPerDay: parseInt(e.target.value) || 0 }), className: "w-full rounded-lg border border-slate-300 px-3 py-2", min: "1" }), _jsx("p", { className: "text-xs text-slate-500 mt-1", children: "N\u00FAmero m\u00E1ximo de avistamentos que um usu\u00E1rio pode reportar por dia" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-2", children: "M\u00E1ximo de Mensagens de Chat por Dia" }), _jsx("input", { type: "number", value: limits.maxChatMessagesPerDay, onChange: (e) => setLimits({ ...limits, maxChatMessagesPerDay: parseInt(e.target.value) || 0 }), className: "w-full rounded-lg border border-slate-300 px-3 py-2", min: "1" }), _jsx("p", { className: "text-xs text-slate-500 mt-1", children: "N\u00FAmero m\u00E1ximo de mensagens de chat por usu\u00E1rio por dia" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-2", children: "Limite de Requisi\u00E7\u00F5es (Rate Limit)" }), _jsx("input", { type: "number", value: limits.rateLimitRequests, onChange: (e) => setLimits({ ...limits, rateLimitRequests: parseInt(e.target.value) || 0 }), className: "w-full rounded-lg border border-slate-300 px-3 py-2", min: "1" }), _jsx("p", { className: "text-xs text-slate-500 mt-1", children: "N\u00FAmero m\u00E1ximo de requisi\u00E7\u00F5es permitidas no per\u00EDodo" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-2", children: "Janela de Tempo (segundos)" }), _jsx("input", { type: "number", value: limits.rateLimitWindow, onChange: (e) => setLimits({ ...limits, rateLimitWindow: parseInt(e.target.value) || 0 }), className: "w-full rounded-lg border border-slate-300 px-3 py-2", min: "1" }), _jsx("p", { className: "text-xs text-slate-500 mt-1", children: "Per\u00EDodo em segundos para o rate limit (ex: 3600 = 1 hora)" })] })] }), _jsxs("div", { className: "flex gap-3 justify-end pt-4 border-t border-slate-200", children: [_jsxs("button", { onClick: loadLimits, className: "px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 flex items-center gap-2", children: [_jsx(RefreshCw, { className: "h-4 w-4" }), "Restaurar Padr\u00F5es"] }), _jsxs("button", { onClick: handleSave, disabled: saving, className: "px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2", children: [_jsx(Save, { className: "h-4 w-4" }), saving ? 'Salvando...' : 'Salvar Configurações'] })] })] })] }), _jsx(InfoModal, { isOpen: showSuccessModal, onClose: () => setShowSuccessModal(false), title: "Sucesso", message: "Limites de uso atualizados com sucesso!", variant: "success" })] }));
}
