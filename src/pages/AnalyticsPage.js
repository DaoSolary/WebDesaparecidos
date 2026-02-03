import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { api } from '../api/client';
const COLORS = ['#2563eb', '#f97316', '#0ea5e9', '#16a34a', '#a855f7'];
export function AnalyticsPage() {
    const [summary, setSummary] = useState();
    useEffect(() => {
        api.get('/stats/summary').then((res) => setSummary(res.data));
    }, []);
    if (!summary)
        return _jsx("p", { children: "A carregar estat\u00EDsticas..." });
    const genderData = summary.demographics.map((item) => ({ name: item.gender ?? 'Não informado', value: item._count._all }));
    const hotspotData = summary.hotspots.map((item) => ({ name: item.province, value: item._count._all }));
    return (_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { className: "grid gap-4 md:grid-cols-3", children: [_jsx(Card, { label: "Casos registados", value: summary.totalCases }), _jsx(Card, { label: "Casos activos", value: summary.activeCases }), _jsx(Card, { label: "Casos resolvidos", value: summary.resolvedCases })] }), _jsxs("div", { className: "grid gap-6 lg:grid-cols-2", children: [_jsxs("div", { className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm", children: [_jsx("h3", { className: "text-lg font-semibold text-slate-900", children: "Distribui\u00E7\u00E3o por g\u00E9nero" }), _jsx(ResponsiveContainer, { width: "100%", height: 250, children: _jsxs(PieChart, { children: [_jsx(Pie, { data: genderData, dataKey: "value", nameKey: "name", label: true, children: genderData.map((_, index) => (_jsx(Cell, { fill: COLORS[index % COLORS.length] }, `cell-${index}`))) }), _jsx(Tooltip, {})] }) })] }), _jsxs("div", { className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm", children: [_jsx("h3", { className: "text-lg font-semibold text-slate-900", children: "Zonas cr\u00EDticas" }), _jsx(ResponsiveContainer, { width: "100%", height: 250, children: _jsxs(BarChart, { data: hotspotData, children: [_jsx(XAxis, { dataKey: "name" }), _jsx(YAxis, { allowDecimals: false }), _jsx(Tooltip, {}), _jsx(Bar, { dataKey: "value", fill: "#2563eb", radius: [4, 4, 0, 0] })] }) })] })] })] }));
}
function Card({ label, value }) {
    return (_jsxs("div", { className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm", children: [_jsx("p", { className: "text-sm font-semibold text-slate-500", children: label }), _jsx("p", { className: "mt-2 text-3xl font-bold text-slate-900", children: value })] }));
}
