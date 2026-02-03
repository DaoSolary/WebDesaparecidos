import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../store/useAuth';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Lock, Save, AlertCircle, CheckCircle, Settings, Shield, Eye, EyeOff, History, Award, MessageSquare } from 'lucide-react';
import { api } from '../api/client';
import { AuthorityChatModal } from '../components/AuthorityChatModal';
export function ProfilePage() {
    const { user, fetchUser, updateProfile, changePassword } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('basic');
    const [profileSuccess, setProfileSuccess] = useState();
    const [profileError, setProfileError] = useState();
    const [passwordSuccess, setPasswordSuccess] = useState();
    const [passwordError, setPasswordError] = useState();
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [history, setHistory] = useState(null);
    const [badges, setBadges] = useState([]);
    const [authorities, setAuthorities] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [selectedAuthority, setSelectedAuthority] = useState(null);
    const [showChatModal, setShowChatModal] = useState(false);
    const profileForm = useForm({
        defaultValues: {
            fullName: user?.fullName || '',
            email: user?.email || '',
            phone: user?.phone || '',
            province: user?.province || '',
            municipality: user?.municipality || '',
        },
    });
    const passwordForm = useForm();
    useEffect(() => {
        if (!user) {
            const token = localStorage.getItem('bdpd_token');
            if (token) {
                fetchUser();
            }
            else {
                navigate('/entrar');
            }
        }
        else {
            profileForm.reset({
                fullName: user.fullName || '',
                email: user.email || '',
                phone: user.phone || '',
                province: user.province || '',
                municipality: user.municipality || '',
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);
    const onProfileSubmit = profileForm.handleSubmit(async (data) => {
        try {
            setProfileError(undefined);
            setProfileSuccess(undefined);
            await updateProfile(data);
            setProfileSuccess('Perfil atualizado com sucesso!');
            setTimeout(() => setProfileSuccess(undefined), 3000);
        }
        catch (err) {
            setProfileError(err.response?.data?.message || 'Erro ao atualizar perfil. Tente novamente.');
        }
    });
    const onPasswordSubmit = passwordForm.handleSubmit(async (data) => {
        if (data.newPassword !== data.confirmPassword) {
            setPasswordError('As senhas não coincidem.');
            return;
        }
        if (data.newPassword.length < 6) {
            setPasswordError('A nova senha deve ter pelo menos 6 caracteres.');
            return;
        }
        try {
            setPasswordError(undefined);
            setPasswordSuccess(undefined);
            await changePassword(data.currentPassword, data.newPassword);
            setPasswordSuccess('Senha alterada com sucesso!');
            passwordForm.reset();
            setTimeout(() => setPasswordSuccess(undefined), 3000);
        }
        catch (err) {
            setPasswordError(err.response?.data?.message || 'Erro ao alterar senha. Verifique a senha atual.');
        }
    });
    if (!user) {
        return (_jsx("div", { className: "flex items-center justify-center min-h-[400px]", children: _jsx("p", { className: "text-slate-500", children: "Carregando..." }) }));
    }
    const tabs = [
        { id: 'basic', label: 'Básico', icon: User },
        { id: 'medium', label: 'Médio', icon: MapPin },
        { id: 'advanced', label: 'Avançado', icon: Settings },
        { id: 'history', label: 'Histórico', icon: History },
        { id: 'badges', label: 'Conquistas', icon: Award },
        { id: 'authority-chat', label: 'Chat Autoridades', icon: MessageSquare },
    ];
    useEffect(() => {
        if ((activeTab === 'history' || activeTab === 'badges' || activeTab === 'authority-chat') && user) {
            loadAdditionalData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, user]);
    const loadAdditionalData = async () => {
        if (!user)
            return;
        setLoadingHistory(true);
        try {
            if (activeTab === 'history') {
                const { data } = await api.get('/user/history');
                setHistory(data);
            }
            else if (activeTab === 'badges') {
                const { data } = await api.get('/badges');
                setBadges(data.badges || []);
            }
            else if (activeTab === 'authority-chat') {
                // Buscar autoridades disponíveis
                try {
                    const { data } = await api.get('/authorities');
                    setAuthorities(data.authorities || []);
                }
                catch (error) {
                    console.error('Erro ao buscar autoridades:', error);
                    setAuthorities([]);
                }
            }
        }
        catch (error) {
            console.error('Erro ao carregar dados:', error);
        }
        finally {
            setLoadingHistory(false);
        }
    };
    return (_jsxs("div", { className: "mx-auto max-w-4xl", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h1", { className: "text-3xl font-bold text-slate-900", children: "Meu Perfil" }), _jsx("p", { className: "mt-2 text-slate-600", children: "Gerencie suas informa\u00E7\u00F5es pessoais e configura\u00E7\u00F5es" })] }), _jsx("div", { className: "mb-6 border-b border-slate-200", children: _jsx("nav", { className: "flex gap-1", children: tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (_jsxs("button", { onClick: () => setActiveTab(tab.id), className: `flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${activeTab === tab.id
                                ? 'border-b-2 border-blue-600 text-blue-600'
                                : 'text-slate-600 hover:text-slate-900'}`, children: [_jsx(Icon, { className: "h-4 w-4" }), tab.label] }, tab.id));
                    }) }) }), activeTab === 'basic' && (_jsxs("div", { className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h2", { className: "text-xl font-semibold text-slate-900", children: "Informa\u00E7\u00F5es B\u00E1sicas" }), _jsx("p", { className: "mt-1 text-sm text-slate-500", children: "Atualize seu nome, email e telefone" })] }), profileSuccess && (_jsxs("div", { className: "mb-4 flex items-start gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700", children: [_jsx(CheckCircle, { className: "h-5 w-5 flex-shrink-0 mt-0.5" }), _jsx("span", { children: profileSuccess })] })), profileError && (_jsxs("div", { className: "mb-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700", children: [_jsx(AlertCircle, { className: "h-5 w-5 flex-shrink-0 mt-0.5" }), _jsx("span", { children: profileError })] })), _jsxs("form", { onSubmit: onProfileSubmit, className: "space-y-5", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "fullName", className: "mb-2 block text-sm font-medium text-slate-700", children: "Nome Completo" }), _jsxs("div", { className: "relative", children: [_jsx(User, { className: "absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" }), _jsx("input", { id: "fullName", type: "text", ...profileForm.register('fullName', { required: 'Nome é obrigatório' }), className: "w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20", placeholder: "Seu nome completo" })] })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "email", className: "mb-2 block text-sm font-medium text-slate-700", children: "Email" }), _jsxs("div", { className: "relative", children: [_jsx(Mail, { className: "absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" }), _jsx("input", { id: "email", type: "email", ...profileForm.register('email'), disabled: true, className: "w-full rounded-lg border border-slate-300 bg-slate-50 pl-10 pr-4 py-2.5 text-slate-500 cursor-not-allowed", placeholder: "seu@email.com" }), _jsx("p", { className: "mt-1 text-xs text-slate-500", children: "O email n\u00E3o pode ser alterado" })] })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "phone", className: "mb-2 block text-sm font-medium text-slate-700", children: "Telefone" }), _jsxs("div", { className: "relative", children: [_jsx(Phone, { className: "absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" }), _jsx("input", { id: "phone", type: "tel", ...profileForm.register('phone'), className: "w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20", placeholder: "+244 900 000 000" })] })] }), _jsx("div", { className: "flex justify-end", children: _jsxs("button", { type: "submit", disabled: profileForm.formState.isSubmitting, className: "flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors", children: [_jsx(Save, { className: "h-4 w-4" }), profileForm.formState.isSubmitting ? 'Salvando...' : 'Salvar Alterações'] }) })] })] })), activeTab === 'medium' && (_jsxs("div", { className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h2", { className: "text-xl font-semibold text-slate-900", children: "Localiza\u00E7\u00E3o" }), _jsx("p", { className: "mt-1 text-sm text-slate-500", children: "Informe sua prov\u00EDncia e munic\u00EDpio para receber alertas relevantes" })] }), profileSuccess && (_jsxs("div", { className: "mb-4 flex items-start gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700", children: [_jsx(CheckCircle, { className: "h-5 w-5 flex-shrink-0 mt-0.5" }), _jsx("span", { children: profileSuccess })] })), profileError && (_jsxs("div", { className: "mb-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700", children: [_jsx(AlertCircle, { className: "h-5 w-5 flex-shrink-0 mt-0.5" }), _jsx("span", { children: profileError })] })), _jsxs("form", { onSubmit: onProfileSubmit, className: "space-y-5", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "province", className: "mb-2 block text-sm font-medium text-slate-700", children: "Prov\u00EDncia" }), _jsxs("div", { className: "relative", children: [_jsx(MapPin, { className: "absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" }), _jsx("input", { id: "province", type: "text", ...profileForm.register('province'), className: "w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20", placeholder: "Ex: Luanda" })] })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "municipality", className: "mb-2 block text-sm font-medium text-slate-700", children: "Munic\u00EDpio" }), _jsxs("div", { className: "relative", children: [_jsx(MapPin, { className: "absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" }), _jsx("input", { id: "municipality", type: "text", ...profileForm.register('municipality'), className: "w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20", placeholder: "Ex: Belas" })] })] }), _jsx("div", { className: "flex justify-end", children: _jsxs("button", { type: "submit", disabled: profileForm.formState.isSubmitting, className: "flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors", children: [_jsx(Save, { className: "h-4 w-4" }), profileForm.formState.isSubmitting ? 'Salvando...' : 'Salvar Alterações'] }) })] })] })), activeTab === 'advanced' && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm", children: [_jsxs("div", { className: "mb-6", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(Lock, { className: "h-5 w-5 text-slate-600" }), _jsx("h2", { className: "text-xl font-semibold text-slate-900", children: "Alterar Senha" })] }), _jsx("p", { className: "text-sm text-slate-500", children: "Atualize sua senha para manter sua conta segura" })] }), passwordSuccess && (_jsxs("div", { className: "mb-4 flex items-start gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700", children: [_jsx(CheckCircle, { className: "h-5 w-5 flex-shrink-0 mt-0.5" }), _jsx("span", { children: passwordSuccess })] })), passwordError && (_jsxs("div", { className: "mb-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700", children: [_jsx(AlertCircle, { className: "h-5 w-5 flex-shrink-0 mt-0.5" }), _jsx("span", { children: passwordError })] })), _jsxs("form", { onSubmit: onPasswordSubmit, className: "space-y-5", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "currentPassword", className: "mb-2 block text-sm font-medium text-slate-700", children: "Senha Atual" }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" }), _jsx("input", { id: "currentPassword", type: showCurrentPassword ? 'text' : 'password', ...passwordForm.register('currentPassword', { required: 'Senha atual é obrigatória' }), className: "w-full rounded-lg border border-slate-300 bg-white pl-10 pr-10 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" }), _jsx("button", { type: "button", onClick: () => setShowCurrentPassword(!showCurrentPassword), className: "absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600", children: showCurrentPassword ? _jsx(EyeOff, { className: "h-5 w-5" }) : _jsx(Eye, { className: "h-5 w-5" }) })] })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "newPassword", className: "mb-2 block text-sm font-medium text-slate-700", children: "Nova Senha" }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" }), _jsx("input", { id: "newPassword", type: showNewPassword ? 'text' : 'password', ...passwordForm.register('newPassword', { required: 'Nova senha é obrigatória', minLength: { value: 6, message: 'A senha deve ter pelo menos 6 caracteres' } }), className: "w-full rounded-lg border border-slate-300 bg-white pl-10 pr-10 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" }), _jsx("button", { type: "button", onClick: () => setShowNewPassword(!showNewPassword), className: "absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600", children: showNewPassword ? _jsx(EyeOff, { className: "h-5 w-5" }) : _jsx(Eye, { className: "h-5 w-5" }) })] })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "confirmPassword", className: "mb-2 block text-sm font-medium text-slate-700", children: "Confirmar Nova Senha" }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" }), _jsx("input", { id: "confirmPassword", type: showConfirmPassword ? 'text' : 'password', ...passwordForm.register('confirmPassword', { required: 'Confirmação de senha é obrigatória' }), className: "w-full rounded-lg border border-slate-300 bg-white pl-10 pr-10 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" }), _jsx("button", { type: "button", onClick: () => setShowConfirmPassword(!showConfirmPassword), className: "absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600", children: showConfirmPassword ? _jsx(EyeOff, { className: "h-5 w-5" }) : _jsx(Eye, { className: "h-5 w-5" }) })] })] }), _jsx("div", { className: "flex justify-end", children: _jsxs("button", { type: "submit", disabled: passwordForm.formState.isSubmitting, className: "flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors", children: [_jsx(Lock, { className: "h-4 w-4" }), passwordForm.formState.isSubmitting ? 'Alterando...' : 'Alterar Senha'] }) })] })] }), _jsxs("div", { className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm", children: [_jsxs("div", { className: "mb-6", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(Shield, { className: "h-5 w-5 text-slate-600" }), _jsx("h2", { className: "text-xl font-semibold text-slate-900", children: "Informa\u00E7\u00F5es da Conta" })] }), _jsx("p", { className: "text-sm text-slate-500", children: "Detalhes sobre sua conta e permiss\u00F5es" })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between py-3 border-b border-slate-200", children: [_jsx("span", { className: "text-sm font-medium text-slate-700", children: "Tipo de Conta" }), _jsx("span", { className: "px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold", children: user.role })] }), user.verifiedAt && (_jsxs("div", { className: "flex items-center justify-between py-3 border-b border-slate-200", children: [_jsx("span", { className: "text-sm font-medium text-slate-700", children: "Verificado em" }), _jsx("span", { className: "text-sm text-slate-600", children: new Date(user.verifiedAt).toLocaleDateString('pt-AO') })] })), _jsxs("div", { className: "flex items-center justify-between py-3 border-b border-slate-200", children: [_jsx("span", { className: "text-sm font-medium text-slate-700", children: "Membro desde" }), _jsx("span", { className: "text-sm text-slate-600", children: user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-AO') : 'N/A' })] })] })] })] })), activeTab === 'history' && (_jsxs("div", { className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h2", { className: "text-xl font-semibold text-slate-900", children: "Hist\u00F3rico de Atividades" }), _jsx("p", { className: "mt-1 text-sm text-slate-500", children: "Todas as suas contribui\u00E7\u00F5es e atividades na plataforma" })] }), loadingHistory ? (_jsxs("div", { className: "text-center py-12", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" }), _jsx("p", { className: "mt-4 text-slate-600", children: "Carregando hist\u00F3rico..." })] })) : history ? (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "p-4 bg-blue-50 rounded-lg", children: [_jsx("p", { className: "text-2xl font-bold text-blue-600", children: history.stats?.totalCases || 0 }), _jsx("p", { className: "text-sm text-slate-600", children: "Casos Reportados" })] }), _jsxs("div", { className: "p-4 bg-green-50 rounded-lg", children: [_jsx("p", { className: "text-2xl font-bold text-green-600", children: history.stats?.totalSightings || 0 }), _jsx("p", { className: "text-sm text-slate-600", children: "Avistamentos" })] }), _jsxs("div", { className: "p-4 bg-amber-50 rounded-lg", children: [_jsx("p", { className: "text-2xl font-bold text-amber-600", children: history.stats?.totalFavorites || 0 }), _jsx("p", { className: "text-sm text-slate-600", children: "Favoritos" })] }), _jsxs("div", { className: "p-4 bg-purple-50 rounded-lg", children: [_jsx("p", { className: "text-2xl font-bold text-purple-600", children: history.stats?.totalBadges || 0 }), _jsx("p", { className: "text-sm text-slate-600", children: "Conquistas" })] })] }), history.cases && history.cases.length > 0 && (_jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-slate-900 mb-3", children: "Casos Reportados" }), _jsx("div", { className: "space-y-3", children: history.cases.map((caseItem) => (_jsxs("div", { className: "flex items-center gap-4 p-3 border border-slate-200 rounded-lg", children: [caseItem.photos[0] && (_jsx("img", { src: caseItem.photos[0].url, alt: caseItem.fullName, className: "w-16 h-16 rounded object-cover" })), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "font-semibold text-slate-900", children: caseItem.fullName }), _jsx("p", { className: "text-sm text-slate-600", children: new Date(caseItem.createdAt).toLocaleDateString('pt-AO') }), _jsx("span", { className: `text-xs px-2 py-1 rounded ${caseItem.approved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`, children: caseItem.approved ? 'Aprovado' : 'Pendente' })] })] }, caseItem.id))) })] })), history.sightings && history.sightings.length > 0 && (_jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-slate-900 mb-3", children: "Avistamentos Reportados" }), _jsx("div", { className: "space-y-3", children: history.sightings.map((sighting) => (_jsxs("div", { className: "p-3 border border-slate-200 rounded-lg", children: [_jsx("p", { className: "font-semibold text-slate-900", children: sighting.missingPerson?.fullName }), _jsx("p", { className: "text-sm text-slate-600", children: sighting.description }), _jsx("p", { className: "text-xs text-slate-500 mt-1", children: new Date(sighting.createdAt).toLocaleDateString('pt-AO') })] }, sighting.id))) })] }))] })) : (_jsx("p", { className: "text-center text-slate-600 py-12", children: "Nenhum hist\u00F3rico dispon\u00EDvel" }))] })), activeTab === 'badges' && (_jsxs("div", { className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h2", { className: "text-xl font-semibold text-slate-900", children: "Conquistas e Badges" }), _jsx("p", { className: "mt-1 text-sm text-slate-500", children: "Suas recompensas por contribuir com a comunidade" })] }), loadingHistory ? (_jsx("div", { className: "text-center py-12", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" }) })) : badges.length > 0 ? (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: badges.map((badge) => (_jsx("div", { className: "p-4 border border-slate-200 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center", children: _jsx(Award, { className: "h-6 w-6 text-white" }) }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "font-semibold text-slate-900", children: getBadgeName(badge.badgeType) }), _jsx("p", { className: "text-xs text-slate-600", children: badge.description }), _jsxs("p", { className: "text-xs text-slate-500 mt-1", children: ["Obtido em ", new Date(badge.earnedAt).toLocaleDateString('pt-AO')] })] })] }) }, badge.id))) })) : (_jsxs("div", { className: "text-center py-12", children: [_jsx(Award, { className: "h-16 w-16 text-slate-300 mx-auto mb-4" }), _jsx("p", { className: "text-slate-600", children: "Voc\u00EA ainda n\u00E3o possui conquistas" }), _jsx("p", { className: "text-sm text-slate-500 mt-2", children: "Continue contribuindo para ganhar badges!" })] }))] })), activeTab === 'authority-chat' && (_jsxs("div", { className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h2", { className: "text-xl font-semibold text-slate-900", children: "Chat com Autoridades" }), _jsx("p", { className: "mt-1 text-sm text-slate-500", children: "Entre em contato direto com autoridades para reportar informa\u00E7\u00F5es importantes" })] }), loadingHistory ? (_jsx("div", { className: "text-center py-12", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" }) })) : (_jsxs("div", { className: "space-y-4", children: [_jsx("p", { className: "text-sm text-slate-600 mb-4", children: "Selecione uma autoridade para iniciar uma conversa ou continue uma conversa existente." }), authorities.length > 0 ? (_jsx("div", { className: "space-y-3", children: authorities.map((auth) => (_jsx("div", { className: "p-4 border border-slate-200 rounded-lg hover:bg-slate-50", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "font-semibold text-slate-900", children: auth.fullName }), _jsx("p", { className: "text-sm text-slate-600", children: auth.role })] }), _jsx("button", { onClick: () => {
                                                    setSelectedAuthority(auth);
                                                    setShowChatModal(true);
                                                }, className: "px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700", children: "Iniciar Chat" })] }) }, auth.id))) })) : (_jsx("p", { className: "text-center text-slate-600 py-8", children: "Nenhuma autoridade dispon\u00EDvel no momento" }))] }))] })), showChatModal && selectedAuthority && (_jsx(AuthorityChatModal, { isOpen: showChatModal, onClose: () => {
                    setShowChatModal(false);
                    setSelectedAuthority(null);
                }, authorityId: selectedAuthority.id, authorityName: selectedAuthority.fullName }))] }));
}
function getBadgeName(badgeType) {
    const names = {
        FIRST_CASE: 'Primeiro Caso',
        ACTIVE_CONTRIBUTOR: 'Colaborador Ativo',
        HELPER: 'Ajudante',
        VERIFIED: 'Verificado',
        TOP_REPORTER: 'Top Reporter',
        COMMUNITY_HERO: 'Herói da Comunidade',
    };
    return names[badgeType] || badgeType;
}
