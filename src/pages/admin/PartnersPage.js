import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Send, Building2, Shield, Users, Plus } from 'lucide-react';
import { api } from '../../api/client';
import { InfoModal } from '../../components/InfoModal';
export function PartnersPage() {
    const [partners, setPartners] = useState([]);
    const [forwardings, setForwardings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showForwardModal, setShowForwardModal] = useState(false);
    const [selectedCase, setSelectedCase] = useState('');
    const [selectedPartner, setSelectedPartner] = useState('');
    const [forwardNotes, setForwardNotes] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        type: 'POLICIA',
        contactName: '',
        email: '',
        phone: '',
        address: '',
    });
    const [successMessage, setSuccessMessage] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    useEffect(() => {
        loadPartners();
        loadForwardings();
    }, []);
    const loadPartners = async () => {
        try {
            const { data } = await api.get('/partners');
            setPartners(data.partners || []);
        }
        catch (error) {
            console.error('Erro ao carregar parceiros:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const loadForwardings = async () => {
        try {
            const { data } = await api.get('/partners/forwardings');
            setForwardings(data.forwardings || []);
        }
        catch (error) {
            console.error('Erro ao carregar envios:', error);
        }
    };
    const handleCreatePartner = async () => {
        try {
            await api.post('/partners', formData);
            setSuccessMessage('Parceiro criado com sucesso!');
            setShowSuccessModal(true);
            setShowCreateModal(false);
            setFormData({
                name: '',
                type: 'POLICIA',
                contactName: '',
                email: '',
                phone: '',
                address: '',
            });
            await loadPartners();
        }
        catch (error) {
            alert(error.response?.data?.message || 'Erro ao criar parceiro');
        }
    };
    const handleForwardCase = async () => {
        if (!selectedCase || !selectedPartner) {
            alert('Selecione um caso e um parceiro');
            return;
        }
        try {
            await api.post('/partners/forward', {
                missingPersonId: selectedCase,
                partnerId: selectedPartner,
                notes: forwardNotes,
            });
            setSuccessMessage('Caso enviado para o parceiro com sucesso!');
            setShowSuccessModal(true);
            setShowForwardModal(false);
            setSelectedCase('');
            setSelectedPartner('');
            setForwardNotes('');
            await loadForwardings();
        }
        catch (error) {
            alert(error.response?.data?.message || 'Erro ao enviar caso');
        }
    };
    const getPartnerTypeLabel = (type) => {
        switch (type) {
            case 'POLICIA':
                return 'Polícia';
            case 'PROTECAO_CIVIL':
                return 'Proteção Civil';
            case 'ORGAO_PARCEIRO':
                return 'Órgão Parceiro';
            case 'OUTRO':
                return 'Outro';
            default:
                return type;
        }
    };
    const getPartnerTypeIcon = (type) => {
        switch (type) {
            case 'POLICIA':
                return Shield;
            case 'PROTECAO_CIVIL':
                return Building2;
            default:
                return Users;
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'ENVIADO':
                return 'bg-blue-100 text-blue-700';
            case 'RECEBIDO':
                return 'bg-green-100 text-green-700';
            case 'EM_ANALISE':
                return 'bg-amber-100 text-amber-700';
            case 'ACEITE':
                return 'bg-green-100 text-green-700';
            case 'REJEITADO':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-slate-100 text-slate-700';
        }
    };
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center min-h-screen", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" }), _jsx("p", { className: "mt-4 text-slate-600", children: "Carregando..." })] }) }));
    }
    return (_jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsxs("div", { className: "mb-6 flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-slate-900", children: "Parceiros Externos" }), _jsx("p", { className: "mt-2 text-slate-600", children: "Gerencie parceiros e envie casos para pol\u00EDcia, prote\u00E7\u00E3o civil e outros \u00F3rg\u00E3os" })] }), _jsxs("button", { onClick: () => setShowCreateModal(true), className: "px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 flex items-center gap-2", children: [_jsx(Plus, { className: "h-5 w-5" }), "Novo Parceiro"] })] }), _jsx("div", { className: "grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8", children: partners.map((partner) => {
                    const Icon = getPartnerTypeIcon(partner.type);
                    return (_jsxs("div", { className: "bg-white rounded-lg border border-slate-200 p-4", children: [_jsxs("div", { className: "flex items-start justify-between mb-3", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center", children: _jsx(Icon, { className: "h-5 w-5 text-blue-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold text-slate-900", children: partner.name }), _jsx("p", { className: "text-xs text-slate-600", children: getPartnerTypeLabel(partner.type) })] })] }), partner.isActive ? (_jsx("span", { className: "px-2 py-1 rounded text-xs bg-green-100 text-green-700", children: "Ativo" })) : (_jsx("span", { className: "px-2 py-1 rounded text-xs bg-red-100 text-red-700", children: "Inativo" }))] }), partner.contactName && (_jsxs("p", { className: "text-sm text-slate-600 mb-1", children: [_jsx("strong", { children: "Contato:" }), " ", partner.contactName] })), partner.email && (_jsxs("p", { className: "text-sm text-slate-600 mb-1", children: [_jsx("strong", { children: "Email:" }), " ", partner.email] })), partner.phone && (_jsxs("p", { className: "text-sm text-slate-600 mb-1", children: [_jsx("strong", { children: "Telefone:" }), " ", partner.phone] }))] }, partner.id));
                }) }), _jsxs("div", { className: "mb-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h2", { className: "text-xl font-semibold text-slate-900", children: "Envios de Casos" }), _jsxs("button", { onClick: () => setShowForwardModal(true), className: "px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 flex items-center gap-2", children: [_jsx(Send, { className: "h-5 w-5" }), "Enviar Caso"] })] }), _jsx("div", { className: "bg-white rounded-lg border border-slate-200 overflow-hidden", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-slate-50 border-b border-slate-200", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-semibold text-slate-700", children: "Caso" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-semibold text-slate-700", children: "Parceiro" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-semibold text-slate-700", children: "Enviado por" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-semibold text-slate-700", children: "Status" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-semibold text-slate-700", children: "Data" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-200", children: forwardings.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 5, className: "px-6 py-8 text-center text-slate-500", children: "Nenhum envio registrado" }) })) : (forwardings.map((forwarding) => (_jsxs("tr", { className: "hover:bg-slate-50", children: [_jsx("td", { className: "px-6 py-4", children: _jsx("a", { href: `/casos/${forwarding.missingPersonId}`, target: "_blank", rel: "noopener noreferrer", className: "text-blue-600 hover:underline", children: forwarding.missingPerson.fullName }) }), _jsxs("td", { className: "px-6 py-4", children: [_jsx("p", { className: "font-semibold text-slate-900", children: forwarding.partner.name }), _jsx("p", { className: "text-xs text-slate-600", children: getPartnerTypeLabel(forwarding.partner.type) })] }), _jsxs("td", { className: "px-6 py-4", children: [_jsx("p", { className: "text-sm text-slate-900", children: forwarding.forwardedByUser.fullName }), _jsx("p", { className: "text-xs text-slate-600", children: forwarding.forwardedByUser.role })] }), _jsx("td", { className: "px-6 py-4", children: _jsx("span", { className: `px-2 py-1 rounded text-xs font-semibold ${getStatusColor(forwarding.status)}`, children: forwarding.status }) }), _jsx("td", { className: "px-6 py-4 text-sm text-slate-600", children: new Date(forwarding.createdAt).toLocaleDateString('pt-AO') })] }, forwarding.id)))) })] }) }) })] }), showCreateModal && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4", children: _jsxs("div", { className: "bg-white rounded-lg max-w-md w-full p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-slate-900 mb-4", children: "Criar Novo Parceiro" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "Nome *" }), _jsx("input", { type: "text", value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }), className: "w-full rounded-lg border border-slate-300 px-3 py-2", placeholder: "Ex: Pol\u00EDcia Nacional de Angola" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "Tipo *" }), _jsxs("select", { value: formData.type, onChange: (e) => setFormData({ ...formData, type: e.target.value }), className: "w-full rounded-lg border border-slate-300 px-3 py-2", children: [_jsx("option", { value: "POLICIA", children: "Pol\u00EDcia" }), _jsx("option", { value: "PROTECAO_CIVIL", children: "Prote\u00E7\u00E3o Civil" }), _jsx("option", { value: "ORGAO_PARCEIRO", children: "\u00D3rg\u00E3o Parceiro" }), _jsx("option", { value: "OUTRO", children: "Outro" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "Nome do Contato" }), _jsx("input", { type: "text", value: formData.contactName, onChange: (e) => setFormData({ ...formData, contactName: e.target.value }), className: "w-full rounded-lg border border-slate-300 px-3 py-2" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "Email" }), _jsx("input", { type: "email", value: formData.email, onChange: (e) => setFormData({ ...formData, email: e.target.value }), className: "w-full rounded-lg border border-slate-300 px-3 py-2" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "Telefone" }), _jsx("input", { type: "text", value: formData.phone, onChange: (e) => setFormData({ ...formData, phone: e.target.value }), className: "w-full rounded-lg border border-slate-300 px-3 py-2" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "Endere\u00E7o" }), _jsx("textarea", { value: formData.address, onChange: (e) => setFormData({ ...formData, address: e.target.value }), className: "w-full rounded-lg border border-slate-300 px-3 py-2", rows: 2 })] })] }), _jsxs("div", { className: "flex gap-3 justify-end mt-6", children: [_jsx("button", { onClick: () => {
                                        setShowCreateModal(false);
                                        setFormData({
                                            name: '',
                                            type: 'POLICIA',
                                            contactName: '',
                                            email: '',
                                            phone: '',
                                            address: '',
                                        });
                                    }, className: "px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50", children: "Cancelar" }), _jsx("button", { onClick: handleCreatePartner, disabled: !formData.name, className: "px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50", children: "Criar" })] })] }) })), showForwardModal && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4", children: _jsxs("div", { className: "bg-white rounded-lg max-w-md w-full p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-slate-900 mb-4", children: "Enviar Caso para Parceiro" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "ID do Caso *" }), _jsx("input", { type: "text", value: selectedCase, onChange: (e) => setSelectedCase(e.target.value), className: "w-full rounded-lg border border-slate-300 px-3 py-2", placeholder: "Cole o ID do caso aqui" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "Parceiro *" }), _jsxs("select", { value: selectedPartner, onChange: (e) => setSelectedPartner(e.target.value), className: "w-full rounded-lg border border-slate-300 px-3 py-2", children: [_jsx("option", { value: "", children: "Selecione um parceiro" }), partners.filter((p) => p.isActive).map((partner) => (_jsxs("option", { value: partner.id, children: [partner.name, " (", getPartnerTypeLabel(partner.type), ")"] }, partner.id)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "Notas (opcional)" }), _jsx("textarea", { value: forwardNotes, onChange: (e) => setForwardNotes(e.target.value), className: "w-full rounded-lg border border-slate-300 px-3 py-2", rows: 3, placeholder: "Adicione informa\u00E7\u00F5es relevantes sobre o caso..." })] })] }), _jsxs("div", { className: "flex gap-3 justify-end mt-6", children: [_jsx("button", { onClick: () => {
                                        setShowForwardModal(false);
                                        setSelectedCase('');
                                        setSelectedPartner('');
                                        setForwardNotes('');
                                    }, className: "px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50", children: "Cancelar" }), _jsxs("button", { onClick: handleForwardCase, disabled: !selectedCase || !selectedPartner, className: "px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center gap-2", children: [_jsx(Send, { className: "h-4 w-4" }), "Enviar"] })] })] }) })), _jsx(InfoModal, { isOpen: showSuccessModal, onClose: () => {
                    setShowSuccessModal(false);
                    setSuccessMessage('');
                }, title: "Sucesso", message: successMessage, variant: "success" })] }));
}
