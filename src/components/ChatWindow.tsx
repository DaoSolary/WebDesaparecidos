import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../store/useAuth';
import { api } from '../api/client';
import { joinCaseRoom, leaveCaseRoom, onChatMessage, onUserJoinedChat, initSocket } from '../services/socket';
import { MessageSquare, Send, X } from 'lucide-react';

type ChatWindowProps = {
  caseId: string;
  isOpen: boolean;
  onClose: () => void;
};

type Message = {
  id: string;
  content: string;
  senderId: string;
  senderName?: string;
  createdAt: string;
};

export function ChatWindow({ caseId, isOpen, onClose }: ChatWindowProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Carregar mensagens anteriores quando o chat é aberto
  useEffect(() => {
    if (isOpen && user && caseId) {
      setLoading(true);
      // Carregar mensagens do servidor
      api.get(`/chat/${caseId}/messages`)
        .then((response) => {
          const loadedMessages = response.data.messages || [];
          setMessages(loadedMessages);
        })
        .catch((error) => {
          console.error('Erro ao carregar mensagens:', error);
        })
        .finally(() => {
          setLoading(false);
        });

      // Configurar Socket.IO - garantir que está na sala de notificações
      initSocket(user.id, user.role);
      
      // Aguardar um pouco para garantir que o socket está conectado
      setTimeout(() => {
        joinCaseRoom(caseId, user.id, user.fullName);
      }, 100);
      
      const handleMessage = (data: any) => {
        // Verificar se a mensagem já não existe (evitar duplicatas)
        // Comparar por conteúdo, senderId e timestamp (dentro de 2 segundos)
        setMessages((prev) => {
          const exists = prev.some(m => {
            const timeDiff = Math.abs(
              new Date(m.createdAt).getTime() - new Date(data.createdAt || Date.now()).getTime()
            );
            return (
              m.content === data.message && 
              m.senderId === data.senderId &&
              timeDiff < 2000 // 2 segundos de tolerância
            );
          });
          
          if (exists) {
            console.log('[CHAT] Mensagem duplicada ignorada:', data.message);
            return prev;
          }
          
          return [
            ...prev,
            {
              id: `${data.senderId}-${Date.now()}-${Math.random()}`,
              content: data.message,
              senderId: data.senderId,
              senderName: data.senderName,
              createdAt: data.createdAt || new Date().toISOString(),
            },
          ];
        });
      };

      const handleUserJoined = (data: any) => {
        if (data.userId !== user.id) {
          setMessages((prev) => [
            ...prev,
            {
              id: `join-${Date.now()}`,
              content: data.message || `${data.userName} entrou no chat`,
              senderId: 'system',
              senderName: 'Sistema',
              createdAt: new Date().toISOString(),
            },
          ]);
        }
      };

      onChatMessage(handleMessage);
      onUserJoinedChat(handleUserJoined);

      return () => {
        leaveCaseRoom(caseId);
      };
    }
  }, [isOpen, caseId, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const messageContent = newMessage.trim();
    setNewMessage('');

    // Otimistic update
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      content: messageContent,
      senderId: user.id,
      senderName: user.fullName,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMessage]);

    try {
      // Enviar mensagem via API (que salva no banco e notifica)
      const response = await api.post(`/chat/${caseId}/messages`, {
        content: messageContent,
      });

      // Substituir mensagem temporária pela real
      if (response.data.message) {
        setMessages((prev) => 
          prev.map(msg => 
            msg.id === tempMessage.id 
              ? {
                  id: response.data.message.id,
                  content: response.data.message.content,
                  senderId: response.data.message.senderId,
                  senderName: response.data.message.senderName,
                  createdAt: response.data.message.createdAt,
                }
              : msg
          )
        );
      }

      // Não precisa enviar via Socket.IO novamente, pois a API já faz o broadcast
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      // Remover mensagem temporária em caso de erro
      setMessages((prev) => prev.filter(msg => msg.id !== tempMessage.id));
      setNewMessage(messageContent); // Restaurar mensagem
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-white rounded-lg shadow-xl border border-slate-200 flex flex-col z-50">
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-slate-900">Chat do Caso</h3>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <p className="text-center text-slate-500 text-sm py-8">
            Carregando mensagens...
          </p>
        ) : messages.length === 0 ? (
          <p className="text-center text-slate-500 text-sm py-8">
            Nenhuma mensagem ainda. Seja o primeiro a comentar!
          </p>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.senderId === user?.id;
            return (
              <div
                key={msg.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 ${
                    isOwn
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-900'
                  }`}
                >
                  {!isOwn && msg.senderName && (
                    <p className="text-xs font-semibold mb-1">{msg.senderName}</p>
                  )}
                  <p className="text-sm">{msg.content}</p>
                  <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-slate-500'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString('pt-AO', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-slate-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

