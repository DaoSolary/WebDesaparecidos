import { useState, useEffect, useRef } from 'react';
import { X, Send, User } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../store/useAuth';
import { initSocket, onNotification } from '../services/socket';

type AuthorityChatModalProps = {
  isOpen: boolean;
  onClose: () => void;
  authorityId: string;
  authorityName: string;
  chatId?: string;
};

export function AuthorityChatModal({ isOpen, onClose, authorityId, authorityName, chatId: initialChatId }: AuthorityChatModalProps) {
  const { user } = useAuth();
  const [chatId, setChatId] = useState<string | null>(initialChatId || null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sincronizar chatId quando initialChatId mudar
  useEffect(() => {
    if (initialChatId && initialChatId !== chatId) {
      setChatId(initialChatId);
    }
  }, [initialChatId]);

  useEffect(() => {
    if (isOpen && chatId) {
      loadMessages();
      initSocket(user?.id, user?.role);
      
      const handleNotification = (notification: any) => {
        if (notification.type === 'authority_chat_message' && notification.chatId === chatId) {
          loadMessages();
        }
      };
      
      const cleanup = onNotification(handleNotification);
      return cleanup;
    }
  }, [isOpen, chatId, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    if (!chatId) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/authority-chat/${chatId}/messages`);
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    } finally {
      setLoading(false);
    }
  };

  const startChat = async () => {
    if (!subject.trim() || !newMessage.trim()) {
      alert('Por favor, preencha o assunto e a mensagem inicial');
      return;
    }

    setSending(true);
    try {
      const { data } = await api.post('/authority-chat', {
        authorityId,
        subject: subject.trim(),
        message: newMessage.trim(),
      });
      setChatId(data.chat.id);
      setSubject('');
      setNewMessage('');
      await loadMessages();
    } catch (error: any) {
      console.error('Erro ao iniciar chat:', error);
      alert(error.response?.data?.message || 'Erro ao iniciar chat');
    } finally {
      setSending(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !chatId) return;

    setSending(true);
    try {
      await api.post(`/authority-chat/${chatId}/messages`, {
        content: newMessage.trim(),
      });
      setNewMessage('');
      await loadMessages();
    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);
      alert(error.response?.data?.message || 'Erro ao enviar mensagem');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] flex flex-col">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Chat com {authorityName}</h3>
            <p className="text-sm text-slate-600">Linha direta com autoridades</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!chatId ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Assunto *
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ex: Informação importante sobre caso..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Mensagem Inicial *
                </label>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rows={6}
                  placeholder="Descreva sua mensagem..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>
              <button
                onClick={startChat}
                disabled={sending || !subject.trim() || !newMessage.trim()}
                className="w-full px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {sending ? 'Iniciando...' : 'Iniciar Conversa'}
              </button>
            </div>
          ) : (
            <>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : messages.length === 0 ? (
                <p className="text-center text-slate-600 py-8">Nenhuma mensagem ainda</p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.sender.id === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        msg.sender.id === user?.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-4 w-4" />
                        <span className="text-xs font-semibold">{msg.sender.fullName}</span>
                      </div>
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-xs mt-1 ${msg.sender.id === user?.id ? 'text-blue-100' : 'text-slate-500'}`}>
                        {new Date(msg.createdAt).toLocaleString('pt-AO')}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {chatId && (
          <div className="p-4 border-t border-slate-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Digite sua mensagem..."
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2"
              />
              <button
                onClick={sendMessage}
                disabled={sending || !newMessage.trim()}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

