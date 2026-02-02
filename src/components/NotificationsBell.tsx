import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X } from 'lucide-react';
import { useAuth } from '../store/useAuth';
import { initSocket, onNotification, disconnectSocket } from '../services/socket';
import { api } from '../api/client';
import { AuthorityChatModal } from './AuthorityChatModal';

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  caseId?: string;
  chatId?: string;
};

export function NotificationsBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthorityChat, setShowAuthorityChat] = useState(false);
  const [authorityChatData, setAuthorityChatData] = useState<{ chatId: string; authorityId: string; authorityName: string } | null>(null);
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (user) {
      console.log('[NOTIFICATIONS] Inicializando socket para usuário:', user.id);
      
      // Inicializar socket e garantir que está na sala de notificações
      const socket = initSocket(user.id, user.role);

      const handleNotification = (notification: any) => {
        console.log('[NOTIFICATIONS] Notificação recebida no sino:', notification);
        setNotifications((prev) => {
          // Verificar se já existe uma notificação com o mesmo caseId e tipo para evitar duplicatas
          const isDuplicate = prev.some(
            n => n.type === notification.type && 
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
        } else {
          socket?.once('connect', () => {
            onNotification(handleNotification);
            console.log('[NOTIFICATIONS] Listener registrado (após conexão)');
          });
        }
      };

      let cleanup: (() => void) | undefined;
      
      if (socket?.connected) {
        cleanup = onNotification(handleNotification);
        console.log('[NOTIFICATIONS] Listener registrado (socket conectado)');
      } else {
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

  const handleNotificationClick = async (notification: Notification) => {
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
        let otherParticipantId: string;
        let otherParticipantName: string;
        
        if (user?.id === chat.authorityId) {
          // Usuário atual é a autoridade, então o outro participante é o usuário que iniciou o chat
          otherParticipantId = chat.user.id;
          otherParticipantName = chat.user.fullName;
        } else {
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
      } catch (error) {
        console.error('Erro ao buscar detalhes do chat:', error);
        alert('Erro ao abrir o chat. Tente novamente.');
      }
    }
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors"
      >
        <Bell className="h-5 w-5 text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-semibold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 rounded-lg border border-slate-200 bg-white shadow-xl z-20 max-h-96 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900">Notificações</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  Marcar todas como lidas
                </button>
              )}
            </div>
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">
                  Nenhuma notificação
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-slate-900">
                          {notification.title}
                        </p>
                        <p className="text-sm text-slate-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-slate-400 mt-2">
                          {new Date(notification.createdAt).toLocaleString('pt-AO')}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="ml-2 h-2 w-2 rounded-full bg-blue-600" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* Authority Chat Modal */}
      {showAuthorityChat && authorityChatData && (
        <AuthorityChatModal
          isOpen={showAuthorityChat}
          onClose={() => {
            setShowAuthorityChat(false);
            setAuthorityChatData(null);
          }}
          authorityId={authorityChatData.authorityId}
          authorityName={authorityChatData.authorityName}
          chatId={authorityChatData.chatId}
        />
      )}
    </div>
  );
}

