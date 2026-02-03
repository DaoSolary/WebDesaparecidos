import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Database, Download, Play, Calendar, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { api } from '../../api/client';
import { InfoModal } from '../../components/InfoModal';
export function BackupsPage() {
    const [backups, setBackups] = useState([]);
    const [config, setConfig] = useState({
        enabled: true,
        frequency: 'daily',
        time: '02:00',
        retentionDays: 30,
        types: ['FULL'],
    });
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showConfigModal, setShowConfigModal] = useState(false);
    const [savingConfig, setSavingConfig] = useState(false);
    useEffect(() => {
        loadBackups();
        loadConfig();
    }, []);
    const loadBackups = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/backups');
            setBackups(data.backups || []);
        }
        catch (error) {
            console.error('Erro ao carregar backups:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const loadConfig = async () => {
        try {
            const { data } = await api.get('/backups/config');
            if (data.config) {
                setConfig(data.config);
            }
        }
        catch (error) {
            console.error('Erro ao carregar configuração:', error);
        }
    };
    const handleCreateBackup = async (type) => {
        try {
            setCreating(true);
            await api.post('/backups', { type });
            setSuccessMessage(`Backup do tipo ${type} iniciado com sucesso!`);
            setShowSuccessModal(true);
            setTimeout(() => {
                loadBackups();
            }, 2000);
        }
        catch (error) {
            alert(error.response?.data?.message || 'Erro ao criar backup');
        }
        finally {
            setCreating(false);
        }
    };
    const handleDownload = async (backupId) => {
        try {
            const response = await api.get(`/backups/${backupId}/download`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `backup-${backupId}.sql`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        }
        catch (error) {
            alert('Erro ao fazer download do backup');
        }
    };
    const handleSaveConfig = async () => {
        try {
            setSavingConfig(true);
            await api.put('/backups/config', config);
            setSuccessMessage('Configuração de backup atualizada com sucesso!');
            setShowSuccessModal(true);
            setShowConfigModal(false);
        }
        catch (error) {
            alert(error.response?.data?.message || 'Erro ao salvar configuração');
        }
        finally {
            setSavingConfig(false);
        }
    };
    const getStatusIcon = (status) => {
        switch (status) {
            case 'COMPLETED':
                return _jsx(CheckCircle, { className: "h-5 w-5 text-green-600" });
            case 'FAILED':
                return _jsx(XCircle, { className: "h-5 w-5 text-red-600" });
            case 'IN_PROGRESS':
                return _jsx(Clock, { className: "h-5 w-5 text-blue-600 animate-spin" });
            default:
                return _jsx(AlertCircle, { className: "h-5 w-5 text-amber-600" });
        }
    };
    const getStatusLabel = (status) => {
        const labels = {
            PENDING: 'Pendente',
            IN_PROGRESS: 'Em Progresso',
            COMPLETED: 'Concluído',
            FAILED: 'Falhou',
            CANCELLED: 'Cancelado',
        };
        return labels[status] || status;
    };
    const formatFileSize = (bytes) => {
        if (!bytes)
            return 'N/A';
        const mb = bytes / (1024 * 1024);
        return `${mb.toFixed(2)} MB`;
    };
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center min-h-screen", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" }), _jsx("p", { className: "mt-4 text-slate-600", children: "Carregando..." })] }) }));
    }
    return (_jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsxs("div", { className: "mb-6 flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-slate-900", children: "Backups" }), _jsx("p", { className: "mt-2 text-slate-600", children: "Gerencie backups autom\u00E1ticos e manuais do sistema" })] }), _jsx("div", { className: "flex gap-2", children: _jsxs("button", { onClick: () => setShowConfigModal(true), className: "px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 flex items-center gap-2", children: [_jsx(Calendar, { className: "h-5 w-5" }), "Configurar"] }) })] }), _jsxs("div", { className: "bg-white rounded-lg border border-slate-200 p-6 mb-6", children: [_jsx("h2", { className: "text-lg font-semibold text-slate-900 mb-4", children: "Criar Backup Manual" }), _jsxs("div", { className: "flex gap-3", children: [_jsxs("button", { onClick: () => handleCreateBackup('FULL'), disabled: creating, className: "px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2", children: [_jsx(Play, { className: "h-4 w-4" }), "Backup Completo"] }), _jsxs("button", { onClick: () => handleCreateBackup('DATABASE_ONLY'), disabled: creating, className: "px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center gap-2", children: [_jsx(Database, { className: "h-4 w-4" }), "Apenas Banco de Dados"] }), _jsxs("button", { onClick: () => handleCreateBackup('FILES_ONLY'), disabled: creating, className: "px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2", children: [_jsx(Database, { className: "h-4 w-4" }), "Apenas Arquivos"] })] })] }), _jsx("div", { className: "bg-white rounded-lg border border-slate-200 overflow-hidden", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-slate-50 border-b border-slate-200", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-semibold text-slate-700", children: "Tipo" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-semibold text-slate-700", children: "Status" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-semibold text-slate-700", children: "Tamanho" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-semibold text-slate-700", children: "Iniciado" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-semibold text-slate-700", children: "Conclu\u00EDdo" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-semibold text-slate-700", children: "A\u00E7\u00F5es" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-200", children: backups.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 6, className: "px-6 py-8 text-center text-slate-500", children: "Nenhum backup encontrado" }) })) : (backups.map((backup) => (_jsxs("tr", { className: "hover:bg-slate-50", children: [_jsx("td", { className: "px-6 py-4", children: _jsx("span", { className: "px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-700", children: backup.type }) }), _jsx("td", { className: "px-6 py-4", children: _jsxs("div", { className: "flex items-center gap-2", children: [getStatusIcon(backup.status), _jsx("span", { className: "text-sm text-slate-900", children: getStatusLabel(backup.status) })] }) }), _jsx("td", { className: "px-6 py-4 text-sm text-slate-600", children: formatFileSize(backup.fileSize) }), _jsx("td", { className: "px-6 py-4 text-sm text-slate-600", children: new Date(backup.startedAt).toLocaleString('pt-AO') }), _jsx("td", { className: "px-6 py-4 text-sm text-slate-600", children: backup.completedAt ? new Date(backup.completedAt).toLocaleString('pt-AO') : '-' }), _jsx("td", { className: "px-6 py-4", children: backup.status === 'COMPLETED' && backup.filePath && (_jsx("button", { onClick: () => handleDownload(backup.id), className: "p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors", title: "Download", children: _jsx(Download, { className: "h-4 w-4" }) })) })] }, backup.id)))) })] }) }) }), showConfigModal && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4", children: _jsxs("div", { className: "bg-white rounded-lg max-w-md w-full p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-slate-900 mb-4", children: "Configura\u00E7\u00E3o de Backup Autom\u00E1tico" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("input", { type: "checkbox", checked: config.enabled, onChange: (e) => setConfig({ ...config, enabled: e.target.checked }), className: "rounded" }), _jsx("label", { className: "text-sm text-slate-700", children: "Ativar backups autom\u00E1ticos" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "Frequ\u00EAncia" }), _jsxs("select", { value: config.frequency, onChange: (e) => setConfig({ ...config, frequency: e.target.value }), className: "w-full rounded-lg border border-slate-300 px-3 py-2", children: [_jsx("option", { value: "daily", children: "Di\u00E1rio" }), _jsx("option", { value: "weekly", children: "Semanal" }), _jsx("option", { value: "monthly", children: "Mensal" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "Hor\u00E1rio (HH:mm)" }), _jsx("input", { type: "time", value: config.time, onChange: (e) => setConfig({ ...config, time: e.target.value }), className: "w-full rounded-lg border border-slate-300 px-3 py-2" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "Reten\u00E7\u00E3o (dias)" }), _jsx("input", { type: "number", value: config.retentionDays, onChange: (e) => setConfig({ ...config, retentionDays: parseInt(e.target.value) || 30 }), className: "w-full rounded-lg border border-slate-300 px-3 py-2", min: "1" })] })] }), _jsxs("div", { className: "flex gap-3 justify-end mt-6", children: [_jsx("button", { onClick: () => setShowConfigModal(false), className: "px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50", children: "Cancelar" }), _jsx("button", { onClick: handleSaveConfig, disabled: savingConfig, className: "px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50", children: savingConfig ? 'Salvando...' : 'Salvar' })] })] }) })), _jsx(InfoModal, { isOpen: showSuccessModal, onClose: () => setShowSuccessModal(false), title: "Sucesso", message: successMessage, variant: "success" })] }));
}
