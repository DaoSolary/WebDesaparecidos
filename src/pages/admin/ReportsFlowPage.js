import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { api } from '../../api/client';
export function ReportsFlowPage() {
    const [dailyFlow, setDailyFlow] = useState([]);
    const [topReported, setTopReported] = useState([]);
    const [stats, setStats] = useState({
        totalReports: 0,
        byStatus: {},
    });
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(30);
    useEffect(() => {
        loadData();
    }, [days]);
    const loadData = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/reports/daily-flow?days=${days}`);
            setDailyFlow(data.dailyFlow || []);
            setTopReported(data.topReported || []);
            setStats({
                totalReports: data.totalReports || 0,
                byStatus: data.byStatus || {},
            });
        }
        catch (error) {
            console.error('Erro ao carregar fluxo de denúncias:', error);
            alert('Erro ao carregar dados');
        }
        finally {
            setLoading(false);
        }
    };
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center min-h-screen", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" }), _jsx("p", { className: "mt-4 text-slate-600", children: "Carregando fluxo de den\u00FAncias..." })] }) }));
    }
    return (_jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h1", { className: "text-3xl font-bold text-slate-900", children: "Fluxo de Den\u00FAncias" }), _jsx("p", { className: "mt-2 text-slate-600", children: "Acompanhe as den\u00FAncias recebidas por dia" })] }), _jsxs("div", { className: "mb-6", children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-2", children: "Per\u00EDodo (dias)" }), _jsxs("select", { value: days, onChange: (e) => setDays(Number(e.target.value)), className: "px-4 py-2 rounded-lg border border-slate-300 bg-white", children: [_jsx("option", { value: 7, children: "\u00DAltimos 7 dias" }), _jsx("option", { value: 30, children: "\u00DAltimos 30 dias" }), _jsx("option", { value: 90, children: "\u00DAltimos 90 dias" }), _jsx("option", { value: 365, children: "\u00DAltimo ano" })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-6", children: [_jsxs("div", { className: "bg-white rounded-lg border border-slate-200 p-4", children: [_jsx("p", { className: "text-sm text-slate-600", children: "Total de Den\u00FAncias" }), _jsx("p", { className: "text-2xl font-bold text-slate-900", children: stats.totalReports })] }), _jsxs("div", { className: "bg-white rounded-lg border border-slate-200 p-4", children: [_jsx("p", { className: "text-sm text-slate-600", children: "Pendentes" }), _jsx("p", { className: "text-2xl font-bold text-amber-600", children: stats.byStatus.PENDENTE || 0 })] }), _jsxs("div", { className: "bg-white rounded-lg border border-slate-200 p-4", children: [_jsx("p", { className: "text-sm text-slate-600", children: "Aceitas" }), _jsx("p", { className: "text-2xl font-bold text-green-600", children: stats.byStatus.ACEITE || 0 })] }), _jsxs("div", { className: "bg-white rounded-lg border border-slate-200 p-4", children: [_jsx("p", { className: "text-sm text-slate-600", children: "Rejeitadas" }), _jsx("p", { className: "text-2xl font-bold text-red-600", children: stats.byStatus.REJEITADO || 0 })] })] }), _jsxs("div", { className: "bg-white rounded-lg border border-slate-200 p-6 mb-6", children: [_jsx("h2", { className: "text-lg font-semibold text-slate-900 mb-4", children: "Den\u00FAncias por Dia" }), _jsx("div", { className: "space-y-2", children: dailyFlow.length === 0 ? (_jsx("p", { className: "text-center text-slate-500 py-8", children: "Nenhum dado dispon\u00EDvel" })) : (dailyFlow.map((day) => (_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-24 text-sm text-slate-600", children: new Date(day.date).toLocaleDateString('pt-AO', { day: '2-digit', month: 'short' }) }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "bg-blue-600 h-6 rounded", style: { width: `${(day.total / Math.max(...dailyFlow.map((d) => d.total))) * 100}%` } }), _jsx("span", { className: "text-sm font-semibold text-slate-900", children: day.total })] }), _jsxs("div", { className: "flex gap-4 mt-1 text-xs text-slate-500", children: [_jsxs("span", { children: ["Pend: ", day.pending] }), _jsxs("span", { children: ["An\u00E1lise: ", day.in_analysis] }), _jsxs("span", { children: ["Aceitas: ", day.accepted] }), _jsxs("span", { children: ["Rejeitadas: ", day.rejected] })] })] })] }, day.date)))) })] }), _jsxs("div", { className: "bg-white rounded-lg border border-slate-200 p-6", children: [_jsx("h2", { className: "text-lg font-semibold text-slate-900 mb-4", children: "Casos Mais Denunciados" }), topReported.length === 0 ? (_jsx("p", { className: "text-center text-slate-500 py-8", children: "Nenhum caso denunciado" })) : (_jsx("div", { className: "space-y-3", children: topReported.map((item, index) => (_jsxs("div", { className: "flex items-center justify-between p-3 border border-slate-200 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold", children: index + 1 }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold text-slate-900", children: item.case?.fullName || 'Caso não encontrado' }), _jsx("p", { className: "text-sm text-slate-600", children: item.case?.province || 'N/A' })] })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("span", { className: "px-3 py-1 rounded bg-red-100 text-red-700 font-semibold", children: [item.reportCount, " den\u00FAncia(s)"] }), item.case && (_jsx("a", { href: `/casos/${item.case.id}`, target: "_blank", rel: "noopener noreferrer", className: "text-sm text-blue-600 hover:underline", children: "Ver caso \u2192" }))] })] }, item.caseId))) }))] })] }));
}
