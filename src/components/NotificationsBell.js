import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useAuth } from '../store/useAuth';
import { initSocket, onNotification } from '../services/socket';
import { api } from '../api/client';
import { AuthorityChatModal } from './AuthorityChatModal';
export function NotificationsBell() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [showAuthorityChat, setShowAuthorityChat] = useState(false);
    const [authorityChatData, setAuthorityChatData] = useState(null);
    const unreadCount = notifications.filter((n) => !n.read).length;
    useEffect(() => {
        if (user) {
            console.log('[NOTIFICATIONS] Inicializando socket para usuário:', user.id);
            // Inicializar socket e garantir que está na sala de notificações
            const socket = initSocket(user.id, user.role);
            const handleNotification = (notification) => {
                console.log('[NOTIFICATIONS] Notificação recebida no sino:', notification);
                setNotifications((prev) => {
                    // Verificar se já existe uma notificação com o mesmo caseId e tipo para evitar duplicatas
                    const isDuplicate = prev.some(n => n.type === notification.type &&
                        n.caseId === notification.caseId &&
                        !n.read // Só verificar duplicatas em notificações não lidas
                    );
                    if (isDuplicate) {
                        console.log('[NOTIFICATIONS] Notificação duplicada ignorada:', notification.caseId);
                        return prev;
                    }
                    return [
                        {
                            id: `${notification.type}-${notification.caseId || notification.chatId}-${Date.now()}`,
                            type: notification.type || 'info',
                            title: notification.title || 'Nova notificação',
                            message: notification.message || '',
                            createdAt: new Date().toISOString(),
                            read: false,
                            caseId: notification.caseId,
                            chatId: notification.chatId,
                        },
                        ...prev,
                    ];
                });
            };
            // Registrar listener de notificações
            // Aguardar um pouco para garantir que o socket está conectado
            const registerListener = () => {
                if (socket?.connected) {
                    onNotification(handleNotification);
                    console.log('[NOTIFICATIONS] Listener registrado (socket conectado)');
                }
                else {
                    socket?.once('connect', () => {
                        onNotification(handleNotification);
                        console.log('[NOTIFICATIONS] Listener registrado (após conexão)');
                    });
                }
            };
            let cleanup;
            if (socket?.connected) {
                cleanup = onNotification(handleNotification);
                console.log('[NOTIFICATIONS] Listener registrado (socket conectado)');
            }
            else {
                setTimeout(() => {
                    cleanup = onNotification(handleNotification);
                    console.log('[NOTIFICATIONS] Listener registrado (após conexão)');
                }, 500);
            }
            return () => {
                // Remover callback ao desmontar
                if (cleanup) {
                    cleanup();
                }
            };
        }
    }, [user]);
    const handleNotificationClick = async (notification) => {
        markAsRead(notification.id);
        setIsOpen(false);
        // Se for notificação de chat, navegar para o caso e abrir o chat
        if (notification.type === 'new_chat_message' && notification.caseId) {
            navigate(`/casos/${notification.caseId}`);
            setTimeout(() => {
                window.dispatchEvent(new CustomEvent('open-chat', { detail: { caseId: notification.caseId } }));
            }, 500);
        }
        // Se for notificação de novo caso pendente (para moderadores), navegar diretamente para o caso
        if (notification.type === 'new_pending_case' && notification.caseId) {
            navigate(`/casos/${notification.caseId}`);
        }
        // Se for notificação de novo avistamento, navegar para o caso
        if (notification.type === 'new_sighting' && notification.caseId) {
            navigate(`/casos/${notification.caseId}`);
        }
        // Se for notificação de chat com autoridade, buscar detalhes e abrir o modal
        if ((notification.type === 'new_authority_chat' || notification.type === 'authority_chat_message') && notification.chatId) {
            try {
                const { data } = await api.get(`/authority-chat/${notification.chatId}`);
                const chat = data.chat;
                // Determinar qual é o outro participante do chat
                // Se o usuário atual é a autoridade, mostrar o chat com o usuário que iniciou
                // Se o usuário atual é o cidadão, mostrar o chat com a autoridade
                let otherParticipantId;
                let otherParticipantName;
                if (user?.id === chat.authorityId) {
                    // Usuário atual é a autoridade, então o outro participante é o usuário que iniciou o chat
                    otherParticipantId = chat.user.id;
                    otherParticipantName = chat.user.fullName;
                }
                else {
                    // Usuário atual é o cidadão, então o outro participante é a autoridade
                    otherParticipantId = chat.authority.id;
                    otherParticipantName = chat.authority.fullName;
                }
                setAuthorityChatData({
                    chatId: notification.chatId,
                    authorityId: otherParticipantId,
                    authorityName: otherParticipantName,
                });
                setShowAuthorityChat(true);
            }
            catch (error) {
                console.error('Erro ao buscar detalhes do chat:', error);
                alert('Erro ao abrir o chat. Tente novamente.');
            }
        }
    };
    const markAsRead = (id) => {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    };
    const markAllAsRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };
    return (_jsxs("div", { className: "relative", children: [_jsxs("button", { onClick: () => setIsOpen(!isOpen), className: "relative p-2 rounded-lg hover:bg-slate-100 transition-colors", children: [_jsx(Bell, { className: "h-5 w-5 text-slate-600" }), unreadCount > 0 && (_jsx("span", { className: "absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-semibold text-white", children: unreadCount > 9 ? '9+' : unreadCount }))] }), isOpen && (_jsxs(_Fragment, { children: [_jsx("div", { className: "fixed inset-0 z-10", onClick: () => setIsOpen(false) }), _jsxs("div", { className: "absolute right-0 mt-2 w-80 rounded-lg border border-slate-200 bg-white shadow-xl z-20 max-h-96 overflow-hidden flex flex-col", children: [_jsxs("div", { className: "flex items-center justify-between p-4 border-b border-slate-200", children: [_jsx("h3", { className: "font-semibold text-slate-900", children: "Notifica\u00E7\u00F5es" }), unreadCount > 0 && (_jsx("button", { onClick: markAllAsRead, className: "text-xs text-blue-600 hover:text-blue-700", children: "Marcar todas como lidas" }))] }), _jsx("div", { className: "overflow-y-auto flex-1", children: notifications.length === 0 ? (_jsx("div", { className: "p-8 text-center text-slate-500 text-sm", children: "Nenhuma notifica\u00E7\u00E3o" })) : (notifications.map((notification) => (_jsx("div", { onClick: () => handleNotificationClick(notification), className: `p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${!notification.read ? 'bg-blue-50' : ''}`, children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "font-semibold text-sm text-slate-900", children: notification.title }), _jsx("p", { className: "text-sm text-slate-600 mt-1", children: notification.message }), _jsx("p", { className: "text-xs text-slate-400 mt-2", children: new Date(notification.createdAt).toLocaleString('pt-AO') })] }), !notification.read && (_jsx("div", { className: "ml-2 h-2 w-2 rounded-full bg-blue-600" }))] }) }, notification.id)))) })] })] })), showAuthorityChat && authorityChatData && (_jsx(AuthorityChatModal, { isOpen: showAuthorityChat, onClose: () => {
                    setShowAuthorityChat(false);
                    setAuthorityChatData(null);
                }, authorityId: authorityChatData.authorityId, authorityName: authorityChatData.authorityName, chatId: authorityChatData.chatId }))] }));
}
