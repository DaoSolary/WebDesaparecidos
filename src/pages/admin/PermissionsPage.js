import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useAuth } from '../../store/useAuth';
import { Shield, CheckCircle, XCircle, Save } from 'lucide-react';
import { InfoModal } from '../../components/InfoModal';
const ROLES = [
    {
        name: 'CIDADAO',
        label: 'Cidadão',
        permissions: {
            viewCases: true,
            createCases: true,
            editCases: false,
            deleteCases: false,
            approveCases: false,
            rejectCases: false,
            changeStatus: false,
            viewUsers: false,
            manageUsers: false,
            viewAnalytics: false,
            manageSettings: false,
        },
    },
    {
        name: 'FAMILIAR',
        label: 'Familiar',
        permissions: {
            viewCases: true,
            createCases: true,
            editCases: true,
            deleteCases: false,
            approveCases: false,
            rejectCases: false,
            changeStatus: false,
            viewUsers: false,
            manageUsers: false,
            viewAnalytics: false,
            manageSettings: false,
        },
    },
    {
        name: 'VOLUNTARIO',
        label: 'Voluntário',
        permissions: {
            viewCases: true,
            createCases: true,
            editCases: false,
            deleteCases: false,
            approveCases: false,
            rejectCases: false,
            changeStatus: false,
            viewUsers: false,
            manageUsers: false,
            viewAnalytics: false,
            manageSettings: false,
        },
    },
    {
        name: 'MODERADOR',
        label: 'Moderador',
        permissions: {
            viewCases: true,
            createCases: true,
            editCases: true,
            deleteCases: false,
            approveCases: true,
            rejectCases: true,
            changeStatus: true,
            viewUsers: true,
            manageUsers: false,
            viewAnalytics: true,
            manageSettings: false,
        },
    },
    {
        name: 'AUTORIDADE',
        label: 'Autoridade',
        permissions: {
            viewCases: true,
            createCases: true,
            editCases: true,
            deleteCases: false,
            approveCases: false,
            rejectCases: false,
            changeStatus: true,
            viewUsers: true,
            manageUsers: false,
            viewAnalytics: true,
            manageSettings: false,
        },
    },
    {
        name: 'ADMIN',
        label: 'Administrador',
        permissions: {
            viewCases: true,
            createCases: true,
            editCases: true,
            deleteCases: true,
            approveCases: true,
            rejectCases: true,
            changeStatus: true,
            viewUsers: true,
            manageUsers: true,
            viewAnalytics: true,
            manageSettings: true,
        },
    },
];
const PERMISSION_LABELS = {
    viewCases: 'Visualizar Casos',
    createCases: 'Criar Casos',
    editCases: 'Editar Casos',
    deleteCases: 'Deletar Casos',
    approveCases: 'Aprovar Casos',
    rejectCases: 'Rejeitar Casos',
    changeStatus: 'Alterar Status',
    viewUsers: 'Visualizar Usuários',
    manageUsers: 'Gerenciar Usuários',
    viewAnalytics: 'Visualizar Analytics',
    manageSettings: 'Gerenciar Configurações',
};
export function PermissionsPage() {
    const { user } = useAuth();
    const [roles, setRoles] = useState(ROLES);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const togglePermission = (roleName, permission) => {
        setRoles((prev) => prev.map((role) => role.name === roleName
            ? {
                ...role,
                permissions: {
                    ...role.permissions,
                    [permission]: !role.permissions[permission],
                },
            }
            : role));
    };
    const handleSave = () => {
        // Aqui você salvaria as permissões no backend
        // Por enquanto, apenas mostra mensagem de sucesso
        setShowSuccessModal(true);
    };
    if (user?.role !== 'ADMIN') {
        return (_jsx("div", { className: "text-center py-12", children: _jsx("p", { className: "text-slate-600", children: "Acesso negado. Apenas administradores podem acessar esta p\u00E1gina." }) }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-slate-900", children: "Permiss\u00F5es e Roles" }), _jsx("p", { className: "mt-1 text-slate-600", children: "Gerencie permiss\u00F5es e acesso por role" })] }), _jsxs("div", { className: "rounded-lg border border-slate-200 bg-white p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Shield, { className: "h-5 w-5 text-blue-600" }), _jsx("h2", { className: "text-lg font-semibold text-slate-900", children: "Configura\u00E7\u00E3o de Permiss\u00F5es" })] }), _jsxs("button", { onClick: handleSave, className: "flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 transition-colors", children: [_jsx(Save, { className: "h-4 w-4" }), "Salvar Altera\u00E7\u00F5es"] })] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-slate-200", children: [_jsx("th", { className: "px-4 py-3 text-left text-sm font-semibold text-slate-700", children: "Role" }), Object.keys(PERMISSION_LABELS).map((key) => (_jsx("th", { className: "px-4 py-3 text-center text-xs font-semibold text-slate-700", children: PERMISSION_LABELS[key] }, key)))] }) }), _jsx("tbody", { className: "divide-y divide-slate-200", children: roles.map((role) => (_jsxs("tr", { className: "hover:bg-slate-50", children: [_jsx("td", { className: "px-4 py-3", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-3 h-3 rounded-full bg-blue-600" }), _jsx("span", { className: "font-semibold text-slate-900", children: role.label })] }) }), Object.keys(PERMISSION_LABELS).map((permission) => (_jsx("td", { className: "px-4 py-3 text-center", children: _jsx("button", { onClick: () => togglePermission(role.name, permission), className: `p-2 rounded transition-colors ${role.permissions[permission]
                                                        ? 'text-green-600 hover:bg-green-50'
                                                        : 'text-slate-300 hover:bg-slate-50'}`, children: role.permissions[permission] ? (_jsx(CheckCircle, { className: "h-5 w-5" })) : (_jsx(XCircle, { className: "h-5 w-5" })) }) }, permission)))] }, role.name))) })] }) })] }), _jsx(InfoModal, { isOpen: showSuccessModal, onClose: () => setShowSuccessModal(false), title: "Permiss\u00F5es Atualizadas", message: "As permiss\u00F5es foram atualizadas com sucesso!", variant: "success" })] }));
}
