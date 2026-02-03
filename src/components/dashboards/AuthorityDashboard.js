import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../store/useAuth';
import { api } from '../../api/client';
import { MapPin, BarChart3, Users, FileText } from 'lucide-react';
import { HeatmapMap } from '../HeatmapMap';
export function AuthorityDashboard() {
    const { user } = useAuth();
    const [cases, setCases] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        porProvincia: {},
        porStatus: {},
    });
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        loadCases();
        loadStats();
    }, []);
    const loadCases = async () => {
        try {
            const { data } = await api.get('/missing-persons?status=EM_INVESTIGACAO,ABERTO');
            setCases(data.items || []);
        }
        catch (error) {
            console.error('Erro ao carregar casos:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const loadStats = async () => {
        try {
            const { data } = await api.get('/stats/authorities');
            setStats(data);
        }
        catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-slate-900", children: "Painel de Autoridades" }), _jsx("p", { className: "mt-1 text-slate-600", children: "Ferramentas de investiga\u00E7\u00E3o e an\u00E1lise" })] }), _jsxs("div", { className: "grid gap-4 md:grid-cols-4", children: [_jsx("div", { className: "rounded-lg border border-slate-200 bg-white p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "rounded-full bg-blue-100 p-2", children: _jsx(Users, { className: "h-5 w-5 text-blue-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-2xl font-bold text-slate-900", children: stats.total }), _jsx("p", { className: "text-sm text-slate-600", children: "Total de Casos" })] })] }) }), _jsx("div", { className: "rounded-lg border border-slate-200 bg-white p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "rounded-full bg-green-100 p-2", children: _jsx(BarChart3, { className: "h-5 w-5 text-green-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-2xl font-bold text-slate-900", children: Object.keys(stats.porProvincia).length }), _jsx("p", { className: "text-sm text-slate-600", children: "Prov\u00EDncias" })] })] }) }), _jsx("div", { className: "rounded-lg border border-slate-200 bg-white p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "rounded-full bg-amber-100 p-2", children: _jsx(FileText, { className: "h-5 w-5 text-amber-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-2xl font-bold text-slate-900", children: cases.length }), _jsx("p", { className: "text-sm text-slate-600", children: "Em Investiga\u00E7\u00E3o" })] })] }) }), _jsx("div", { className: "rounded-lg border border-slate-200 bg-white p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "rounded-full bg-red-100 p-2", children: _jsx(MapPin, { className: "h-5 w-5 text-red-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-2xl font-bold text-slate-900", children: "0" }), _jsx("p", { className: "text-sm text-slate-600", children: "Heatmaps" })] })] }) })] }), _jsxs("div", { className: "rounded-lg border border-slate-200 bg-white p-6", children: [_jsx("h2", { className: "text-xl font-semibold text-slate-900 mb-4", children: "Casos em Investiga\u00E7\u00E3o" }), loading ? (_jsx("div", { className: "text-center py-12", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" }) })) : cases.length === 0 ? (_jsx("p", { className: "text-slate-600 text-center py-8", children: "Nenhum caso em investiga\u00E7\u00E3o." })) : (_jsx("div", { className: "space-y-4", children: cases.map((caseItem) => (_jsx("div", { className: "border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex gap-4 flex-1", children: [caseItem.photos[0] && (_jsx("img", { src: caseItem.photos[0].url, alt: caseItem.fullName, className: "w-20 h-20 rounded-lg object-cover" })), _jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "font-semibold text-slate-900", children: caseItem.fullName }), _jsxs("div", { className: "mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("p", { className: "text-slate-500", children: "Localiza\u00E7\u00E3o" }), _jsx("p", { className: "font-medium", children: caseItem.lastSeenLocation })] }), _jsxs("div", { children: [_jsx("p", { className: "text-slate-500", children: "Reporter" }), _jsx("p", { className: "font-medium", children: caseItem.reporter?.fullName || 'N/A' })] }), _jsxs("div", { children: [_jsx("p", { className: "text-slate-500", children: "Data" }), _jsx("p", { className: "font-medium", children: new Date(caseItem.missingDate).toLocaleDateString('pt-AO') })] }), _jsxs("div", { children: [_jsx("p", { className: "text-slate-500", children: "Status" }), _jsx("p", { className: "font-medium", children: caseItem.status })] })] })] })] }), _jsx(Link, { to: `/casos/${caseItem.id}`, className: "ml-4 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors", children: "Ver Detalhes" })] }) }, caseItem.id))) }))] }), cases.length > 0 && (_jsx("div", { className: "mt-6", children: _jsx(HeatmapMap, { cases: cases }) }))] }));
}
