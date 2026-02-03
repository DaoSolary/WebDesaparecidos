import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Image, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { api } from '../../api/client';
import { InfoModal } from '../../components/InfoModal';
export function ImageAnalysisPage() {
    const [analyses, setAnalyses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [selectedPhotoId, setSelectedPhotoId] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    useEffect(() => {
        loadAnalyses();
    }, [filter]);
    const loadAnalyses = async () => {
        try {
            setLoading(true);
            const params = filter ? `?isManipulated=${filter}` : '';
            const { data } = await api.get(`/image-analysis${params}`);
            setAnalyses(data.analyses || []);
        }
        catch (error) {
            console.error('Erro ao carregar análises:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleAnalyze = async (photoId) => {
        try {
            setAnalyzing(true);
            await api.post(`/image-analysis/analyze/${photoId}`, {
                analysisType: 'FULL_ANALYSIS',
            });
            setSuccessMessage('Análise concluída com sucesso!');
            setShowSuccessModal(true);
            await loadAnalyses();
        }
        catch (error) {
            alert(error.response?.data?.message || 'Erro ao analisar imagem');
        }
        finally {
            setAnalyzing(false);
        }
    };
    const handleAnalyzeCase = async (caseId) => {
        try {
            setAnalyzing(true);
            await api.post(`/image-analysis/case/${caseId}/analyze-all`);
            setSuccessMessage('Análise de todas as imagens do caso concluída!');
            setShowSuccessModal(true);
            await loadAnalyses();
        }
        catch (error) {
            alert(error.response?.data?.message || 'Erro ao analisar imagens do caso');
        }
        finally {
            setAnalyzing(false);
        }
    };
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center min-h-screen", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" }), _jsx("p", { className: "mt-4 text-slate-600", children: "Carregando an\u00E1lises..." })] }) }));
    }
    return (_jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h1", { className: "text-3xl font-bold text-slate-900", children: "An\u00E1lise de Imagens" }), _jsx("p", { className: "mt-2 text-slate-600", children: "Detecte edi\u00E7\u00F5es e manipula\u00E7\u00F5es em fotos de casos" })] }), _jsxs("div", { className: "mb-6 flex gap-4", children: [_jsxs("select", { value: filter, onChange: (e) => setFilter(e.target.value), className: "px-4 py-2 rounded-lg border border-slate-300 bg-white", children: [_jsx("option", { value: "", children: "Todas as Imagens" }), _jsx("option", { value: "true", children: "Manipuladas" }), _jsx("option", { value: "false", children: "N\u00E3o Manipuladas" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "text", placeholder: "ID da foto para an\u00E1lise", value: selectedPhotoId, onChange: (e) => setSelectedPhotoId(e.target.value), className: "px-4 py-2 rounded-lg border border-slate-300" }), _jsxs("button", { onClick: () => selectedPhotoId && handleAnalyze(selectedPhotoId), disabled: !selectedPhotoId || analyzing, className: "px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2", children: [_jsx(RefreshCw, { className: `h-5 w-5 ${analyzing ? 'animate-spin' : ''}` }), "Analisar Foto"] })] })] }), _jsx("div", { className: "space-y-4", children: analyses.length === 0 ? (_jsxs("div", { className: "text-center py-12 bg-white rounded-lg border border-slate-200", children: [_jsx(Image, { className: "h-16 w-16 text-slate-300 mx-auto mb-4" }), _jsx("p", { className: "text-slate-600", children: "Nenhuma an\u00E1lise encontrada" })] })) : (analyses.map((analysis) => (_jsx("div", { className: "bg-white rounded-lg border border-slate-200 p-6 shadow-sm", children: _jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { className: "w-32 h-32 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0", children: _jsx("img", { src: analysis.photo.url, alt: "Foto analisada", className: "w-full h-full object-cover", onError: (e) => {
                                        const target = e.currentTarget;
                                        target.style.display = 'none';
                                    } }) }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-start justify-between mb-3", children: [_jsxs("div", { children: [_jsxs("p", { className: "font-semibold text-slate-900", children: ["Caso: ", analysis.photo.missingPerson.fullName] }), _jsxs("p", { className: "text-sm text-slate-600", children: ["Analisado em ", new Date(analysis.analyzedAt).toLocaleString('pt-AO')] })] }), analysis.isManipulated ? (_jsxs("span", { className: "px-3 py-1 rounded text-sm font-semibold bg-red-100 text-red-700 flex items-center gap-1", children: [_jsx(AlertTriangle, { className: "h-4 w-4" }), "Manipulada"] })) : (_jsxs("span", { className: "px-3 py-1 rounded text-sm font-semibold bg-green-100 text-green-700 flex items-center gap-1", children: [_jsx(CheckCircle, { className: "h-4 w-4" }), "Original"] }))] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { children: [_jsxs("p", { className: "text-sm text-slate-600", children: [_jsx("strong", { children: "Confian\u00E7a:" }), " ", (analysis.confidence * 100).toFixed(1), "%"] }), _jsxs("p", { className: "text-sm text-slate-600", children: [_jsx("strong", { children: "Tipo de An\u00E1lise:" }), " ", analysis.analysisType] })] }), analysis.isManipulated && analysis.manipulationDetails && (_jsxs("div", { className: "p-3 bg-red-50 rounded-lg border border-red-200", children: [_jsx("p", { className: "text-sm font-semibold text-red-900 mb-1", children: "Detalhes da Manipula\u00E7\u00E3o:" }), _jsx("p", { className: "text-sm text-red-700", children: analysis.manipulationDetails })] })), analysis.result && (_jsxs("details", { className: "mt-2", children: [_jsx("summary", { className: "text-sm text-slate-600 cursor-pointer hover:text-slate-900", children: "Ver detalhes t\u00E9cnicos" }), _jsx("pre", { className: "mt-2 p-3 bg-slate-50 rounded text-xs overflow-auto", children: JSON.stringify(analysis.result, null, 2) })] })), _jsx("a", { href: `/casos/${analysis.photo.missingPerson.id}`, target: "_blank", rel: "noopener noreferrer", className: "text-sm text-blue-600 hover:underline inline-block", children: "Ver caso completo \u2192" })] })] })] }) }, analysis.id)))) }), _jsx(InfoModal, { isOpen: showSuccessModal, onClose: () => {
                    setShowSuccessModal(false);
                    setSuccessMessage('');
                }, title: "Sucesso", message: successMessage, variant: "success" })] }));
}
