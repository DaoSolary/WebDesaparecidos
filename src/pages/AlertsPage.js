import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useAuth } from '../store/useAuth';
import { Bell, MapPin, Settings, CheckCircle } from 'lucide-react';
import { ProtectedRoute } from '../components/ProtectedRoute';
export function AlertsPage() {
    const { user } = useAuth();
    const [settings, setSettings] = useState({
        enabled: true,
        province: user?.province || '',
        radius: 50,
        priority: ['URGENTE', 'CRIANCA', 'IDOSO'],
        status: ['ABERTO', 'EM_INVESTIGACAO'],
    });
    const [saved, setSaved] = useState(false);
    useEffect(() => {
        // Carregar configurações salvas do usuário
        loadSettings();
    }, [user]);
    const loadSettings = async () => {
        try {
            // Em produção, buscar do backend
            const savedSettings = localStorage.getItem(`alert_settings_${user?.id}`);
            if (savedSettings) {
                setSettings(JSON.parse(savedSettings));
            }
        }
        catch (error) {
            console.error('Erro ao carregar configurações:', error);
        }
    };
    const saveSettings = async () => {
        try {
            // Salvar no localStorage (em produção, salvar no backend)
            localStorage.setItem(`alert_settings_${user?.id}`, JSON.stringify(settings));
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        }
        catch (error) {
            console.error('Erro ao salvar configurações:', error);
        }
    };
    const togglePriority = (priority) => {
        setSettings((prev) => ({
            ...prev,
            priority: prev.priority.includes(priority)
                ? prev.priority.filter((p) => p !== priority)
                : [...prev.priority, priority],
        }));
    };
    const toggleStatus = (status) => {
        setSettings((prev) => ({
            ...prev,
            status: prev.status.includes(status)
                ? prev.status.filter((s) => s !== status)
                : [...prev.status, status],
        }));
    };
    return (_jsx(ProtectedRoute, { allowedRoles: ['CIDADAO', 'FAMILIAR', 'VOLUNTARIO', 'AUTORIDADE', 'ADMIN'], children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-slate-900", children: "Alertas Instant\u00E2neos" }), _jsx("p", { className: "mt-1 text-slate-600", children: "Configure notifica\u00E7\u00F5es por proximidade e filtros personalizados" })] }), _jsxs("div", { className: "rounded-lg border border-slate-200 bg-white p-6 space-y-6", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "rounded-full bg-blue-100 p-2", children: _jsx(Bell, { className: "h-6 w-6 text-blue-600" }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-semibold text-slate-900", children: "Configura\u00E7\u00F5es de Notifica\u00E7\u00F5es" }), _jsx("p", { className: "text-sm text-slate-600", children: "Receba alertas quando novos casos aparecerem na sua \u00E1rea" })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between p-4 rounded-lg border border-slate-200", children: [_jsxs("div", { children: [_jsx("p", { className: "font-semibold text-slate-900", children: "Ativar Alertas" }), _jsx("p", { className: "text-sm text-slate-600", children: "Receber notifica\u00E7\u00F5es em tempo real" })] }), _jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: settings.enabled, onChange: (e) => setSettings({ ...settings, enabled: e.target.checked }), className: "sr-only peer" }), _jsx("div", { className: "w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-2 block text-sm font-medium text-slate-700", children: "Prov\u00EDncia" }), _jsxs("select", { value: settings.province, onChange: (e) => setSettings({ ...settings, province: e.target.value }), className: "w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20", children: [_jsx("option", { value: "", children: "Todas as Prov\u00EDncias" }), _jsx("option", { value: "Luanda", children: "Luanda" }), _jsx("option", { value: "Benguela", children: "Benguela" }), _jsx("option", { value: "Hu\u00EDla", children: "Hu\u00EDla" }), _jsx("option", { value: "Huambo", children: "Huambo" }), _jsx("option", { value: "Bi\u00E9", children: "Bi\u00E9" }), _jsx("option", { value: "Malanje", children: "Malanje" }), _jsx("option", { value: "U\u00EDge", children: "U\u00EDge" }), _jsx("option", { value: "Zaire", children: "Zaire" }), _jsx("option", { value: "Cabinda", children: "Cabinda" }), _jsx("option", { value: "Cuanza-Norte", children: "Cuanza-Norte" }), _jsx("option", { value: "Cuanza-Sul", children: "Cuanza-Sul" }), _jsx("option", { value: "Cuando-Cubango", children: "Cuando-Cubango" }), _jsx("option", { value: "Cunene", children: "Cunene" }), _jsx("option", { value: "Lunda-Norte", children: "Lunda-Norte" }), _jsx("option", { value: "Lunda-Sul", children: "Lunda-Sul" }), _jsx("option", { value: "Moxico", children: "Moxico" }), _jsx("option", { value: "Namibe", children: "Namibe" }), _jsx("option", { value: "Bengo", children: "Bengo" })] })] }), _jsxs("div", { children: [_jsxs("label", { className: "mb-2 block text-sm font-medium text-slate-700", children: ["Raio de Proximidade: ", settings.radius, " km"] }), _jsx("input", { type: "range", min: "10", max: "200", step: "10", value: settings.radius, onChange: (e) => setSettings({ ...settings, radius: Number(e.target.value) }), className: "w-full" }), _jsxs("div", { className: "flex justify-between text-xs text-slate-500 mt-1", children: [_jsx("span", { children: "10 km" }), _jsx("span", { children: "200 km" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-2 block text-sm font-medium text-slate-700", children: "Prioridades" }), _jsx("div", { className: "flex flex-wrap gap-2", children: ['URGENTE', 'CRIANCA', 'IDOSO', 'DEFICIENCIA', 'GERAL'].map((priority) => (_jsx("button", { type: "button", onClick: () => togglePriority(priority), className: `px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${settings.priority.includes(priority)
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`, children: priority }, priority))) })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-2 block text-sm font-medium text-slate-700", children: "Status dos Casos" }), _jsx("div", { className: "flex flex-wrap gap-2", children: ['ABERTO', 'EM_INVESTIGACAO', 'AVISTADO', 'ENCONTRADO'].map((status) => (_jsx("button", { type: "button", onClick: () => toggleStatus(status), className: `px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${settings.status.includes(status)
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`, children: status }, status))) })] })] }), _jsxs("div", { className: "flex items-center justify-between pt-4 border-t border-slate-200", children: [_jsxs("div", { className: "flex items-center gap-2 text-sm text-slate-600", children: [_jsx(MapPin, { className: "h-4 w-4" }), _jsxs("span", { children: ["Voc\u00EA receber\u00E1 notifica\u00E7\u00F5es de casos dentro de ", settings.radius, " km da sua prov\u00EDncia"] })] }), _jsx("button", { onClick: saveSettings, className: "flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors", children: saved ? (_jsxs(_Fragment, { children: [_jsx(CheckCircle, { className: "h-5 w-5" }), "Salvo!"] })) : (_jsxs(_Fragment, { children: [_jsx(Settings, { className: "h-5 w-5" }), "Salvar Configura\u00E7\u00F5es"] })) })] })] }), _jsx("div", { className: "rounded-lg border border-blue-200 bg-blue-50 p-4", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(Bell, { className: "h-5 w-5 text-blue-600 mt-0.5" }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold text-blue-900", children: "Como funcionam os Alertas Instant\u00E2neos?" }), _jsx("p", { className: "text-sm text-blue-700 mt-1", children: "Quando um novo caso de desaparecimento for publicado na sua prov\u00EDncia ou dentro do raio configurado, voc\u00EA receber\u00E1 uma notifica\u00E7\u00E3o em tempo real. Isso ajuda a aumentar a visibilidade dos casos e acelera a localiza\u00E7\u00E3o de pessoas desaparecidas." })] })] }) })] }) }));
}
