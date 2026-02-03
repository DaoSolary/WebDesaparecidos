import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useAuth } from '../../store/useAuth';
import { api } from '../../api/client';
import { Brain, TrendingUp, MapPin, Clock } from 'lucide-react';
export function PatternAnalysisPage() {
    const { user } = useAuth();
    const [patterns, setPatterns] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        loadPatterns();
    }, []);
    const loadPatterns = async () => {
        setLoading(true);
        try {
            // Buscar casos para análise
            const { data: casesData } = await api.get('/missing-persons', {
                params: { page: 1, limit: 1000 },
            });
            const cases = casesData.items || [];
            // Análise de padrões
            const detectedPatterns = [];
            // Padrão 1: Províncias com mais casos
            const provinceCounts = {};
            cases.forEach((c) => {
                if (c.province) {
                    provinceCounts[c.province] = (provinceCounts[c.province] || 0) + 1;
                }
            });
            const topProvince = Object.entries(provinceCounts)
                .sort(([, a], [, b]) => b - a)[0];
            if (topProvince && topProvince[1] > 5) {
                detectedPatterns.push({
                    type: 'hotspot',
                    description: `Alta concentração de casos em ${topProvince[0]}`,
                    severity: topProvince[1] > 20 ? 'high' : 'medium',
                    location: topProvince[0],
                    frequency: topProvince[1],
                    trend: 'increasing',
                });
            }
            // Padrão 2: Casos não resolvidos há muito tempo
            const oldCases = cases.filter((c) => {
                const createdAt = new Date(c.createdAt);
                const daysSince = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
                return daysSince > 30 && c.status !== 'ENCONTRADO' && c.status !== 'ENCERRADO';
            });
            if (oldCases.length > 10) {
                detectedPatterns.push({
                    type: 'stale_cases',
                    description: `${oldCases.length} casos não resolvidos há mais de 30 dias`,
                    severity: 'high',
                    frequency: oldCases.length,
                    trend: 'increasing',
                });
            }
            // Padrão 3: Horários de pico
            const hourCounts = {};
            cases.forEach((c) => {
                const hour = new Date(c.createdAt).getHours();
                hourCounts[hour] = (hourCounts[hour] || 0) + 1;
            });
            const peakHour = Object.entries(hourCounts)
                .sort(([, a], [, b]) => b - a)[0];
            if (peakHour) {
                detectedPatterns.push({
                    type: 'peak_time',
                    description: `Maior número de casos reportados às ${peakHour[0]}:00`,
                    severity: 'low',
                    frequency: peakHour[1],
                    trend: 'stable',
                });
            }
            setPatterns(detectedPatterns);
        }
        catch (error) {
            console.error('Erro ao analisar padrões:', error);
        }
        finally {
            setLoading(false);
        }
    };
    if (user?.role !== 'ADMIN') {
        return (_jsx("div", { className: "text-center py-12", children: _jsx("p", { className: "text-slate-600", children: "Acesso negado. Apenas administradores podem acessar esta p\u00E1gina." }) }));
    }
    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'high':
                return 'bg-red-100 text-red-700 border-red-200';
            case 'medium':
                return 'bg-amber-100 text-amber-700 border-amber-200';
            default:
                return 'bg-blue-100 text-blue-700 border-blue-200';
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-slate-900", children: "An\u00E1lise de Padr\u00F5es" }), _jsx("p", { className: "mt-1 text-slate-600", children: "Detec\u00E7\u00E3o inteligente de padr\u00F5es e tend\u00EAncias" })] }), loading ? (_jsxs("div", { className: "text-center py-12", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" }), _jsx("p", { className: "mt-4 text-slate-600", children: "Analisando padr\u00F5es..." })] })) : (_jsx("div", { className: "grid gap-4", children: patterns.map((pattern, index) => (_jsx("div", { className: `rounded-lg border p-6 ${getSeverityColor(pattern.severity)}`, children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(Brain, { className: "h-5 w-5" }), _jsx("h3", { className: "font-semibold", children: pattern.description })] }), pattern.location && (_jsxs("p", { className: "text-sm flex items-center gap-1 mb-2", children: [_jsx(MapPin, { className: "h-4 w-4" }), pattern.location] })), _jsxs("div", { className: "flex items-center gap-4 text-sm", children: [_jsxs("span", { className: "flex items-center gap-1", children: [_jsx(TrendingUp, { className: "h-4 w-4" }), "Frequ\u00EAncia: ", pattern.frequency] }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Clock, { className: "h-4 w-4" }), "Tend\u00EAncia: ", pattern.trend === 'increasing' ? 'Aumentando' : pattern.trend === 'decreasing' ? 'Diminuindo' : 'Estável'] })] })] }), _jsx("span", { className: `px-3 py-1 rounded text-xs font-semibold ${getSeverityColor(pattern.severity)}`, children: pattern.severity.toUpperCase() })] }) }, index))) }))] }));
}
