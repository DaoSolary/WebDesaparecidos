import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useAuth } from '../../store/useAuth';
import { api } from '../../api/client';
import { FileText, Download, TrendingUp, MapPin, Users, BarChart3, Filter } from 'lucide-react';
import { ANGOLA_PROVINCES } from '../../utils/provinces';
import { InfoModal } from '../../components/InfoModal';
export function ReportsPage() {
    const { user } = useAuth();
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        start: '',
        end: '',
    });
    const [filters, setFilters] = useState({
        province: '',
        status: '',
    });
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportFormat, setExportFormat] = useState(null);
    const [exporting, setExporting] = useState(false);
    useEffect(() => {
        loadReportData();
    }, [dateRange, filters]);
    const loadReportData = async () => {
        setLoading(true);
        try {
            // Buscar dados de admin stats
            const { data: adminStats } = await api.get('/admin/stats');
            // Buscar estatísticas de usuários por role usando o endpoint de network stats
            const { data: networkStats } = await api.get('/users/network/stats');
            const usersByRole = networkStats?.byRole || {};
            // Buscar casos em lotes para análise detalhada (máximo 100 por vez)
            let allCases = [];
            let currentPage = 1;
            const pageSize = 100;
            let hasMore = true;
            while (hasMore) {
                try {
                    const { data: casesData } = await api.get('/missing-persons', {
                        params: {
                            page: currentPage,
                            limit: pageSize
                        },
                    });
                    const cases = casesData.items || [];
                    allCases = [...allCases, ...cases];
                    // Verificar se há mais páginas
                    hasMore = casesData.pagination?.hasNextPage || false;
                    currentPage++;
                    // Limitar a busca para evitar loops infinitos (máximo 50 páginas = 5000 casos)
                    if (currentPage > 50) {
                        hasMore = false;
                    }
                }
                catch (error) {
                    console.error('Erro ao buscar casos na página', currentPage, error);
                    hasMore = false;
                }
            }
            // Calcular top reporters
            const reporterCounts = {};
            allCases.forEach((c) => {
                if (c.reporter?.fullName) {
                    reporterCounts[c.reporter.fullName] = (reporterCounts[c.reporter.fullName] || 0) + 1;
                }
            });
            const topReporters = Object.entries(reporterCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10)
                .map(([name, count]) => ({ name, count }));
            // Calcular tempo médio de resolução
            const resolvedCases = allCases.filter((c) => c.status === 'ENCONTRADO' || c.status === 'ENCERRADO');
            let averageResolutionTime = 0;
            if (resolvedCases.length > 0) {
                const totalDays = resolvedCases.reduce((sum, c) => {
                    const created = new Date(c.createdAt);
                    const resolved = c.approvedAt ? new Date(c.approvedAt) : new Date();
                    const days = (resolved.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
                    return sum + days;
                }, 0);
                averageResolutionTime = Math.round(totalDays / resolvedCases.length);
            }
            // Combinar dados
            setReportData({
                totalCases: adminStats.totalCases || 0,
                totalUsers: networkStats?.totalUsers || 0,
                resolvedCases: adminStats.resolvedCases || 0,
                pendingCases: adminStats.pendingCases || 0,
                rejectedCases: adminStats.rejectedCases || 0,
                casesByProvince: adminStats.casesByProvince || {},
                casesByStatus: adminStats.casesByStatus || {},
                casesByMonth: adminStats.casesByMonth || [],
                usersByRole: usersByRole || {},
                averageResolutionTime,
                topReporters,
            });
        }
        catch (error) {
            console.error('Erro ao carregar dados do relatório:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleExport = (format) => {
        setExportFormat(format);
        setShowExportModal(true);
    };
    const confirmExport = async () => {
        if (!exportFormat || !reportData)
            return;
        setExporting(true);
        try {
            // Preparar dados do relatório
            const reportContent = {
                titulo: 'Relatório Completo - Base de Dados de Pessoas Desaparecidas',
                dataGeracao: new Date().toLocaleString('pt-AO'),
                periodo: dateRange.start && dateRange.end
                    ? `${dateRange.start} a ${dateRange.end}`
                    : 'Todos os períodos',
                resumo: {
                    totalCasos: reportData.totalCases,
                    totalUsuarios: reportData.totalUsers,
                    casosResolvidos: reportData.resolvedCases,
                    casosPendentes: reportData.pendingCases,
                    casosRejeitados: reportData.rejectedCases,
                    taxaResolucao: reportData.totalCases > 0
                        ? ((reportData.resolvedCases / reportData.totalCases) * 100).toFixed(2) + '%'
                        : '0%',
                    tempoMedioResolucao: `${reportData.averageResolutionTime} dias`,
                },
                casosPorProvincia: reportData.casesByProvince,
                casosPorStatus: reportData.casesByStatus,
                casosPorMes: reportData.casesByMonth,
                usuariosPorRole: reportData.usersByRole,
                topReporters: reportData.topReporters,
            };
            if (exportFormat === 'csv') {
                // Gerar CSV
                const csvRows = [];
                // Cabeçalho
                csvRows.push('RELATÓRIO - BASE DE DADOS DE PESSOAS DESAPARECIDAS');
                csvRows.push(`Data de Geração: ${reportContent.dataGeracao}`);
                csvRows.push('');
                // Resumo
                csvRows.push('RESUMO EXECUTIVO');
                csvRows.push(`Total de Casos,${reportContent.resumo.totalCasos}`);
                csvRows.push(`Total de Usuários,${reportContent.resumo.totalUsuarios}`);
                csvRows.push(`Casos Resolvidos,${reportContent.resumo.casosResolvidos}`);
                csvRows.push(`Casos Pendentes,${reportContent.resumo.casosPendentes}`);
                csvRows.push(`Taxa de Resolução,${reportContent.resumo.taxaResolucao}`);
                csvRows.push(`Tempo Médio de Resolução,${reportContent.resumo.tempoMedioResolucao}`);
                csvRows.push('');
                // Casos por Província
                csvRows.push('CASOS POR PROVÍNCIA');
                csvRows.push('Província,Quantidade');
                Object.entries(reportContent.casosPorProvincia).forEach(([province, count]) => {
                    csvRows.push(`${province},${count}`);
                });
                csvRows.push('');
                // Casos por Status
                csvRows.push('CASOS POR STATUS');
                csvRows.push('Status,Quantidade');
                Object.entries(reportContent.casosPorStatus).forEach(([status, count]) => {
                    csvRows.push(`${status},${count}`);
                });
                csvRows.push('');
                // Usuários por Role
                csvRows.push('USUÁRIOS POR ROLE');
                csvRows.push('Role,Quantidade');
                Object.entries(reportContent.usuariosPorRole).forEach(([role, count]) => {
                    csvRows.push(`${role},${count}`);
                });
                csvRows.push('');
                // Top Reporters
                csvRows.push('TOP 10 REPORTERS');
                csvRows.push('Nome,Quantidade de Casos');
                reportContent.topReporters.forEach(({ name, count }) => {
                    csvRows.push(`${name},${count}`);
                });
                // Criar blob e download
                const csvContent = csvRows.join('\n');
                const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', `relatorio-desaparecidos-${new Date().toISOString().split('T')[0]}.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
            else {
                // Para PDF, criar um documento HTML e abrir em nova janela para impressão
                const htmlContent = generatePDFContent(reportContent);
                // Criar uma nova janela
                const printWindow = window.open('', '_blank');
                if (!printWindow) {
                    alert('Por favor, permita pop-ups para exportar o PDF.');
                    return;
                }
                // Escrever o conteúdo na janela
                printWindow.document.open();
                printWindow.document.write(htmlContent);
                printWindow.document.close();
                // Aguardar o carregamento completo antes de imprimir
                printWindow.onload = () => {
                    // Pequeno delay para garantir que o conteúdo foi renderizado
                    setTimeout(() => {
                        printWindow.print();
                        // Fechar a janela após um tempo (opcional, mas útil)
                        // O usuário pode cancelar a impressão se quiser
                        setTimeout(() => {
                            // Não fechar automaticamente, deixar o usuário decidir
                            // printWindow.close();
                        }, 1000);
                    }, 500);
                };
                // Fallback caso onload não dispare
                setTimeout(() => {
                    if (printWindow.document.readyState === 'complete') {
                        printWindow.print();
                    }
                }, 1000);
            }
            setShowExportModal(false);
            setExportFormat(null);
        }
        catch (error) {
            console.error('Erro ao exportar relatório:', error);
            alert('Erro ao exportar relatório. Tente novamente.');
        }
        finally {
            setExporting(false);
        }
    };
    const generatePDFContent = (data) => {
        return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Relatório - Base de Dados de Pessoas Desaparecidas</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px; }
            h2 { color: #334155; margin-top: 30px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #1e40af; color: white; }
            .summary { background-color: #f1f5f9; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .summary-item { margin: 5px 0; }
          </style>
        </head>
        <body>
          <h1>${data.titulo}</h1>
          <p><strong>Data de Geração:</strong> ${data.dataGeracao}</p>
          <p><strong>Período:</strong> ${data.periodo}</p>
          
          <div class="summary">
            <h2>Resumo Executivo</h2>
            <div class="summary-item"><strong>Total de Casos:</strong> ${data.resumo.totalCasos}</div>
            <div class="summary-item"><strong>Total de Usuários:</strong> ${data.resumo.totalUsuarios}</div>
            <div class="summary-item"><strong>Casos Resolvidos:</strong> ${data.resumo.casosResolvidos}</div>
            <div class="summary-item"><strong>Casos Pendentes:</strong> ${data.resumo.casosPendentes}</div>
            <div class="summary-item"><strong>Taxa de Resolução:</strong> ${data.resumo.taxaResolucao}</div>
            <div class="summary-item"><strong>Tempo Médio de Resolução:</strong> ${data.resumo.tempoMedioResolucao}</div>
          </div>
          
          <h2>Casos por Província</h2>
          <table>
            <tr><th>Província</th><th>Quantidade</th></tr>
            ${Object.entries(data.casosPorProvincia).map(([p, c]) => `<tr><td>${p}</td><td>${c}</td></tr>`).join('')}
          </table>
          
          <h2>Casos por Status</h2>
          <table>
            <tr><th>Status</th><th>Quantidade</th></tr>
            ${Object.entries(data.casosPorStatus).map(([s, c]) => `<tr><td>${s}</td><td>${c}</td></tr>`).join('')}
          </table>
          
          <h2>Usuários por Role</h2>
          <table>
            <tr><th>Role</th><th>Quantidade</th></tr>
            ${Object.entries(data.usuariosPorRole).map(([r, c]) => `<tr><td>${r}</td><td>${c}</td></tr>`).join('')}
          </table>
          
          <h2>Top 10 Reporters</h2>
          <table>
            <tr><th>Nome</th><th>Quantidade de Casos</th></tr>
            ${data.topReporters.map((r) => `<tr><td>${r.name}</td><td>${r.count}</td></tr>`).join('')}
          </table>
        </body>
      </html>
    `;
    };
    if (user?.role !== 'ADMIN') {
        return (_jsx("div", { className: "text-center py-12", children: _jsx("p", { className: "text-slate-600", children: "Acesso negado. Apenas administradores podem acessar esta p\u00E1gina." }) }));
    }
    if (loading) {
        return (_jsxs("div", { className: "text-center py-12", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" }), _jsx("p", { className: "mt-4 text-slate-600", children: "Carregando relat\u00F3rios..." })] }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-slate-900", children: "Relat\u00F3rios e An\u00E1lises" }), _jsx("p", { className: "mt-1 text-slate-600", children: "An\u00E1lises detalhadas e exporta\u00E7\u00E3o de dados" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs("button", { onClick: () => handleExport('csv'), className: "flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700 transition-colors", children: [_jsx(Download, { className: "h-4 w-4" }), "Exportar CSV"] }), _jsxs("button", { onClick: () => handleExport('pdf'), className: "flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 transition-colors", children: [_jsx(Download, { className: "h-4 w-4" }), "Exportar PDF"] })] })] }), reportData && (_jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [_jsxs("div", { className: "rounded-lg border border-slate-200 bg-white p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-slate-900 mb-4", children: "Tempo M\u00E9dio de Resolu\u00E7\u00E3o" }), _jsxs("p", { className: "text-3xl font-bold text-slate-900", children: [reportData.averageResolutionTime, " dias"] }), _jsx("p", { className: "text-sm text-slate-600 mt-2", children: "Tempo m\u00E9dio para resolu\u00E7\u00E3o de casos" })] }), _jsxs("div", { className: "rounded-lg border border-slate-200 bg-white p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-slate-900 mb-4", children: "Top 10 Reporters" }), _jsx("div", { className: "space-y-2", children: reportData.topReporters.slice(0, 10).map((reporter, index) => (_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-slate-700", children: reporter.name }), _jsxs("span", { className: "font-semibold text-slate-900", children: [reporter.count, " casos"] })] }, index))) })] })] })), _jsx("div", { className: "rounded-lg border border-slate-200 bg-white p-4", children: _jsxs("div", { className: "flex flex-wrap gap-4 items-center", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Filter, { className: "h-5 w-5 text-slate-400" }), _jsx("span", { className: "text-sm font-medium text-slate-700", children: "Filtros:" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs text-slate-600 mb-1", children: "Data In\u00EDcio" }), _jsx("input", { type: "date", value: dateRange.start, onChange: (e) => setDateRange({ ...dateRange, start: e.target.value }), className: "rounded-lg border border-slate-300 px-3 py-2 text-sm" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs text-slate-600 mb-1", children: "Data Fim" }), _jsx("input", { type: "date", value: dateRange.end, onChange: (e) => setDateRange({ ...dateRange, end: e.target.value }), className: "rounded-lg border border-slate-300 px-3 py-2 text-sm" })] }), _jsxs("select", { value: filters.province, onChange: (e) => setFilters({ ...filters, province: e.target.value }), className: "rounded-lg border border-slate-300 px-3 py-2 text-sm", children: [_jsx("option", { value: "", children: "Todas Prov\u00EDncias" }), ANGOLA_PROVINCES.map((p) => (_jsx("option", { value: p, children: p }, p)))] })] }) }), _jsxs("div", { className: "grid gap-4 md:grid-cols-4", children: [_jsxs("div", { className: "rounded-lg border border-slate-200 bg-white p-4", children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsx(FileText, { className: "h-5 w-5 text-blue-600" }), _jsx("p", { className: "text-sm text-slate-600", children: "Total de Casos" })] }), _jsx("p", { className: "text-3xl font-bold text-slate-900", children: reportData?.totalCases || 0 })] }), _jsxs("div", { className: "rounded-lg border border-slate-200 bg-white p-4", children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsx(Users, { className: "h-5 w-5 text-green-600" }), _jsx("p", { className: "text-sm text-slate-600", children: "Total de Usu\u00E1rios" })] }), _jsx("p", { className: "text-3xl font-bold text-slate-900", children: reportData?.totalUsers || 0 })] }), _jsxs("div", { className: "rounded-lg border border-slate-200 bg-white p-4", children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsx(TrendingUp, { className: "h-5 w-5 text-amber-600" }), _jsx("p", { className: "text-sm text-slate-600", children: "Taxa de Resolu\u00E7\u00E3o" })] }), _jsxs("p", { className: "text-3xl font-bold text-slate-900", children: [reportData?.totalCases
                                        ? ((reportData.resolvedCases / reportData.totalCases) * 100).toFixed(1)
                                        : 0, "%"] })] }), _jsxs("div", { className: "rounded-lg border border-slate-200 bg-white p-4", children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsx(BarChart3, { className: "h-5 w-5 text-purple-600" }), _jsx("p", { className: "text-sm text-slate-600", children: "Casos Pendentes" })] }), _jsx("p", { className: "text-3xl font-bold text-slate-900", children: reportData?.pendingCases || 0 })] })] }), _jsxs("div", { className: "grid gap-6 md:grid-cols-2", children: [_jsxs("div", { className: "rounded-lg border border-slate-200 bg-white p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-slate-900 mb-4", children: "Casos por Prov\u00EDncia" }), _jsx("div", { className: "space-y-3", children: Object.entries(reportData?.casesByProvince || {})
                                    .sort(([, a], [, b]) => b - a)
                                    .slice(0, 10)
                                    .map(([province, count]) => (_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(MapPin, { className: "h-4 w-4 text-slate-400" }), _jsx("span", { className: "text-slate-700", children: province })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-32 bg-slate-200 rounded-full h-2", children: _jsx("div", { className: "bg-blue-600 h-2 rounded-full", style: {
                                                            width: `${(count /
                                                                Math.max(...Object.values(reportData?.casesByProvince || {}), 1)) *
                                                                100}%`,
                                                        } }) }), _jsx("span", { className: "font-semibold text-slate-900 w-8 text-right", children: count })] })] }, province))) })] }), _jsxs("div", { className: "rounded-lg border border-slate-200 bg-white p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-slate-900 mb-4", children: "Casos por Status" }), _jsx("div", { className: "space-y-3", children: Object.entries(reportData?.casesByStatus || {}).map(([status, count]) => (_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-slate-700", children: status }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-32 bg-slate-200 rounded-full h-2", children: _jsx("div", { className: "bg-green-600 h-2 rounded-full", style: {
                                                            width: `${(count /
                                                                Math.max(...Object.values(reportData?.casesByStatus || {}), 1)) *
                                                                100}%`,
                                                        } }) }), _jsx("span", { className: "font-semibold text-slate-900 w-8 text-right", children: count })] })] }, status))) })] }), _jsxs("div", { className: "rounded-lg border border-slate-200 bg-white p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-slate-900 mb-4", children: "Usu\u00E1rios por Role" }), _jsx("div", { className: "space-y-3", children: Object.entries(reportData?.usersByRole || {}).map(([role, count]) => (_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-slate-700", children: role }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-32 bg-slate-200 rounded-full h-2", children: _jsx("div", { className: "bg-purple-600 h-2 rounded-full", style: {
                                                            width: `${(count /
                                                                Math.max(...Object.values(reportData?.usersByRole || {}), 1)) *
                                                                100}%`,
                                                        } }) }), _jsx("span", { className: "font-semibold text-slate-900 w-8 text-right", children: count })] })] }, role))) })] }), _jsxs("div", { className: "rounded-lg border border-slate-200 bg-white p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-slate-900 mb-4", children: "Casos por M\u00EAs" }), _jsx("div", { className: "space-y-3", children: reportData?.casesByMonth.slice(-6).map((item) => (_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-slate-700", children: item.month }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-32 bg-slate-200 rounded-full h-2", children: _jsx("div", { className: "bg-amber-600 h-2 rounded-full", style: {
                                                            width: `${(item.count /
                                                                Math.max(...(reportData?.casesByMonth.map((m) => m.count) || []), 1)) *
                                                                100}%`,
                                                        } }) }), _jsx("span", { className: "font-semibold text-slate-900 w-8 text-right", children: item.count })] })] }, item.month))) })] })] }), _jsxs(InfoModal, { isOpen: showExportModal, onClose: () => {
                    if (!exporting) {
                        setShowExportModal(false);
                        setExportFormat(null);
                    }
                }, title: `Exportar Relatório em ${exportFormat?.toUpperCase()}`, message: exportFormat === 'csv'
                    ? 'O relatório será exportado em formato CSV (Excel). O arquivo conterá todas as informações relevantes: resumo executivo, casos por província, casos por status, usuários por role, top reporters e estatísticas detalhadas. Clique em "Exportar" para iniciar o download.'
                    : 'O relatório será exportado em formato PDF. Uma nova janela será aberta com o relatório. Na janela de impressão que aparecer, selecione "Salvar como PDF" como destino e clique em "Salvar" para baixar o arquivo PDF. O relatório contém todas as informações relevantes organizadas e estruturadas.', variant: "info", children: [exporting && (_jsxs("div", { className: "mt-4 text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" }), _jsx("p", { className: "mt-2 text-sm text-slate-600", children: "Gerando relat\u00F3rio..." })] })), !exporting && (_jsxs("div", { className: "mt-4 flex gap-3 justify-end", children: [_jsx("button", { onClick: () => {
                                    setShowExportModal(false);
                                    setExportFormat(null);
                                }, className: "px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50", children: "Cancelar" }), _jsx("button", { onClick: confirmExport, className: "px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700", children: "Exportar" })] }))] })] }));
}
