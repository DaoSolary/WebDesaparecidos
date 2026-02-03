import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useAuth } from '../../store/useAuth';
import { Save, Bell, Mail, Shield, Globe } from 'lucide-react';
import { InfoModal } from '../../components/InfoModal';
export function SettingsPage() {
    const { user } = useAuth();
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [settings, setSettings] = useState({
        notifications: {
            emailEnabled: true,
            pushEnabled: true,
            smsEnabled: false,
        },
        security: {
            requireVerification: true,
            twoFactorAuth: false,
            sessionTimeout: 30,
        },
        platform: {
            maintenanceMode: false,
            allowRegistration: true,
            requireApproval: true,
            maxCasesPerUser: 10,
        },
        email: {
            smtpHost: '',
            smtpPort: 587,
            smtpUser: '',
            smtpFrom: '',
        },
    });
    const handleSave = () => {
        // Aqui você salvaria as configurações no backend
        setShowSuccessModal(true);
    };
    if (user?.role !== 'ADMIN') {
        return (_jsx("div", { className: "text-center py-12", children: _jsx("p", { className: "text-slate-600", children: "Acesso negado. Apenas administradores podem acessar esta p\u00E1gina." }) }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-slate-900", children: "Configura\u00E7\u00F5es da Plataforma" }), _jsx("p", { className: "mt-1 text-slate-600", children: "Gerencie as configura\u00E7\u00F5es gerais da plataforma" })] }), _jsxs("div", { className: "rounded-lg border border-slate-200 bg-white p-6", children: [_jsxs("div", { className: "flex items-center gap-2 mb-4", children: [_jsx(Bell, { className: "h-5 w-5 text-blue-600" }), _jsx("h2", { className: "text-lg font-semibold text-slate-900", children: "Notifica\u00E7\u00F5es" })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("label", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-slate-700", children: "Notifica\u00E7\u00F5es por Email" }), _jsx("input", { type: "checkbox", checked: settings.notifications.emailEnabled, onChange: (e) => setSettings({
                                            ...settings,
                                            notifications: { ...settings.notifications, emailEnabled: e.target.checked },
                                        }), className: "rounded" })] }), _jsxs("label", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-slate-700", children: "Notifica\u00E7\u00F5es Push" }), _jsx("input", { type: "checkbox", checked: settings.notifications.pushEnabled, onChange: (e) => setSettings({
                                            ...settings,
                                            notifications: { ...settings.notifications, pushEnabled: e.target.checked },
                                        }), className: "rounded" })] }), _jsxs("label", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-slate-700", children: "Notifica\u00E7\u00F5es SMS" }), _jsx("input", { type: "checkbox", checked: settings.notifications.smsEnabled, onChange: (e) => setSettings({
                                            ...settings,
                                            notifications: { ...settings.notifications, smsEnabled: e.target.checked },
                                        }), className: "rounded" })] })] })] }), _jsxs("div", { className: "rounded-lg border border-slate-200 bg-white p-6", children: [_jsxs("div", { className: "flex items-center gap-2 mb-4", children: [_jsx(Shield, { className: "h-5 w-5 text-green-600" }), _jsx("h2", { className: "text-lg font-semibold text-slate-900", children: "Seguran\u00E7a" })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("label", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-slate-700", children: "Requerer Verifica\u00E7\u00E3o de Email" }), _jsx("input", { type: "checkbox", checked: settings.security.requireVerification, onChange: (e) => setSettings({
                                            ...settings,
                                            security: { ...settings.security, requireVerification: e.target.checked },
                                        }), className: "rounded" })] }), _jsxs("label", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-slate-700", children: "Autentica\u00E7\u00E3o de Dois Fatores" }), _jsx("input", { type: "checkbox", checked: settings.security.twoFactorAuth, onChange: (e) => setSettings({
                                            ...settings,
                                            security: { ...settings.security, twoFactorAuth: e.target.checked },
                                        }), className: "rounded" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm text-slate-700 mb-1", children: "Timeout de Sess\u00E3o (minutos)" }), _jsx("input", { type: "number", value: settings.security.sessionTimeout, onChange: (e) => setSettings({
                                            ...settings,
                                            security: { ...settings.security, sessionTimeout: parseInt(e.target.value) || 30 },
                                        }), className: "w-full rounded-lg border border-slate-300 px-3 py-2", min: "5", max: "1440" })] })] })] }), _jsxs("div", { className: "rounded-lg border border-slate-200 bg-white p-6", children: [_jsxs("div", { className: "flex items-center gap-2 mb-4", children: [_jsx(Globe, { className: "h-5 w-5 text-amber-600" }), _jsx("h2", { className: "text-lg font-semibold text-slate-900", children: "Plataforma" })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("label", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-slate-700", children: "Modo de Manuten\u00E7\u00E3o" }), _jsx("input", { type: "checkbox", checked: settings.platform.maintenanceMode, onChange: (e) => setSettings({
                                            ...settings,
                                            platform: { ...settings.platform, maintenanceMode: e.target.checked },
                                        }), className: "rounded" })] }), _jsxs("label", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-slate-700", children: "Permitir Registro de Novos Usu\u00E1rios" }), _jsx("input", { type: "checkbox", checked: settings.platform.allowRegistration, onChange: (e) => setSettings({
                                            ...settings,
                                            platform: { ...settings.platform, allowRegistration: e.target.checked },
                                        }), className: "rounded" })] }), _jsxs("label", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-slate-700", children: "Requerer Aprova\u00E7\u00E3o de Casos" }), _jsx("input", { type: "checkbox", checked: settings.platform.requireApproval, onChange: (e) => setSettings({
                                            ...settings,
                                            platform: { ...settings.platform, requireApproval: e.target.checked },
                                        }), className: "rounded" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm text-slate-700 mb-1", children: "M\u00E1ximo de Casos por Usu\u00E1rio" }), _jsx("input", { type: "number", value: settings.platform.maxCasesPerUser, onChange: (e) => setSettings({
                                            ...settings,
                                            platform: { ...settings.platform, maxCasesPerUser: parseInt(e.target.value) || 10 },
                                        }), className: "w-full rounded-lg border border-slate-300 px-3 py-2", min: "1", max: "100" })] })] })] }), _jsxs("div", { className: "rounded-lg border border-slate-200 bg-white p-6", children: [_jsxs("div", { className: "flex items-center gap-2 mb-4", children: [_jsx(Mail, { className: "h-5 w-5 text-purple-600" }), _jsx("h2", { className: "text-lg font-semibold text-slate-900", children: "Configura\u00E7\u00F5es de Email" })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm text-slate-700 mb-1", children: "SMTP Host" }), _jsx("input", { type: "text", value: settings.email.smtpHost, onChange: (e) => setSettings({
                                            ...settings,
                                            email: { ...settings.email, smtpHost: e.target.value },
                                        }), className: "w-full rounded-lg border border-slate-300 px-3 py-2", placeholder: "smtp.gmail.com" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm text-slate-700 mb-1", children: "SMTP Port" }), _jsx("input", { type: "number", value: settings.email.smtpPort, onChange: (e) => setSettings({
                                                    ...settings,
                                                    email: { ...settings.email, smtpPort: parseInt(e.target.value) || 587 },
                                                }), className: "w-full rounded-lg border border-slate-300 px-3 py-2" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm text-slate-700 mb-1", children: "SMTP User" }), _jsx("input", { type: "text", value: settings.email.smtpUser, onChange: (e) => setSettings({
                                                    ...settings,
                                                    email: { ...settings.email, smtpUser: e.target.value },
                                                }), className: "w-full rounded-lg border border-slate-300 px-3 py-2" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm text-slate-700 mb-1", children: "Email Remetente" }), _jsx("input", { type: "email", value: settings.email.smtpFrom, onChange: (e) => setSettings({
                                            ...settings,
                                            email: { ...settings.email, smtpFrom: e.target.value },
                                        }), className: "w-full rounded-lg border border-slate-300 px-3 py-2", placeholder: "noreply@desaparecidos.gov" })] })] })] }), _jsx("div", { className: "flex justify-end", children: _jsxs("button", { onClick: handleSave, className: "flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 transition-colors", children: [_jsx(Save, { className: "h-5 w-5" }), "Salvar Configura\u00E7\u00F5es"] }) }), _jsx(InfoModal, { isOpen: showSuccessModal, onClose: () => setShowSuccessModal(false), title: "Configura\u00E7\u00F5es Salvas", message: "As configura\u00E7\u00F5es foram salvas com sucesso!", variant: "success" })] }));
}
