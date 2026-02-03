import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function initSocket(userId?: string, userRole?: string) {
  // Se já existe um socket conectado, reutilizar
  if (socket?.connected) {
    if (userId) {
      // Garantir que está na sala do usuário e da role
      socket.emit('join-user-room', { userId, userRole });
    }
    return socket;
  }

  // Se existe mas não está conectado, aguardar um pouco antes de criar novo
  if (socket && !socket.connected) {
    console.log('[SOCKET] Socket desconectado detectado, aguardando reconexão...');
    // Aguardar um pouco para ver se reconecta
    setTimeout(() => {
      if (!socket?.connected && userId) {
        console.log('[SOCKET] Reconexão falhou, criando novo socket...');
        socket?.disconnect();
        socket = null;
        createNewSocket(userId);
      }
    }, 2000);
    return socket;
  }

  // Criar novo socket apenas se não existir
  if (!socket) {
    createNewSocket(userId);
  }

  return socket;
}

function createNewSocket(userId?: string, userRole?: string) {
  console.log('[SOCKET] Criando nova conexão Socket.IO...');
  
  // Resetar flag de listener quando criar novo socket
  notificationListenerRegistered = false;
  
  socket = io(import.meta.env.VITE_API_URL || 'http://localhost:4001', {
    transports: ['websocket', 'polling'], // Permitir fallback para polling
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    timeout: 20000,
  });

  socket.on('connect', () => {
    console.log('[SOCKET] Socket conectado:', socket?.id);
    
    // Resetar flag para permitir reconfiguração do listener
    notificationListenerRegistered = false;
    
    if (userId) {
      // Emitir imediatamente ao conectar
      socket?.emit('join-user-room', { userId, userRole });
      console.log(`[SOCKET] Emitido join-user-room para usuário ${userId} (role: ${userRole})`);
      
      // Também tentar novamente após um pequeno delay para garantir
      setTimeout(() => {
        if (socket?.connected) {
          socket.emit('join-user-room', { userId, userRole });
          console.log(`[SOCKET] Re-emitido join-user-room para usuário ${userId} (role: ${userRole}) (garantia)`);
        }
      }, 500);
    }
    
    // Configurar listener de notificações se houver callbacks registrados
    if (notificationCallbacks.size > 0) {
      setupNotificationListener();
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('[SOCKET] Socket desconectado:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('[SOCKET] Erro de conexão Socket.IO:', error);
  });

  socket.on('reconnect', (attemptNumber) => {
    console.log(`[SOCKET] Reconectado após ${attemptNumber} tentativa(s)`);
    if (userId) {
      socket?.emit('join-user-room', { userId, userRole });
    }
  });

  socket.on('reconnect_error', (error) => {
    console.error('[SOCKET] Erro ao reconectar:', error);
  });
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getSocket() {
  return socket;
}

export function joinCaseRoom(caseId: string, userId: string, userName: string) {
  socket?.emit('join-case-room', { caseId, userId, userName });
}

export function leaveCaseRoom(caseId: string) {
  socket?.emit('leave-case-room', caseId);
}

export function sendChatMessage(caseId: string, message: string, senderId: string, senderName: string) {
  socket?.emit('chat-message', { caseId, message, senderId, senderName });
}

export function onUserJoinedChat(callback: (data: any) => void) {
  socket?.on('user-joined-chat', callback);
}

// Armazenar todos os callbacks para notificações (múltiplos listeners)
const notificationCallbacks: Set<(notification: any) => void> = new Set();
let notificationListenerRegistered = false;

function setupNotificationListener() {
  if (!socket || notificationListenerRegistered) {
    return;
  }

  // Criar um listener único que chama todos os callbacks
  socket.on('notification', (notification) => {
    console.log(`[SOCKET] Notificação recebida no frontend, distribuindo para ${notificationCallbacks.size} callback(s):`, notification);
    notificationCallbacks.forEach(cb => {
      try {
        cb(notification);
      } catch (error) {
        console.error('[SOCKET] Erro ao executar callback de notificação:', error);
      }
    });
  });
  
  notificationListenerRegistered = true;
  console.log('[SOCKET] Listener de notificação configurado');
}

// Função para remover callback (útil para cleanup)
export function offNotification(callback: (notification: any) => void) {
  notificationCallbacks.delete(callback);
  console.log(`[SOCKET] Callback removido. Total de callbacks: ${notificationCallbacks.size}`);
}

export function onNotification(callback: (notification: any) => void) {
  if (!socket) {
    console.warn('[SOCKET] Tentativa de registrar listener de notificação sem socket conectado');
    return;
  }
  
  // Verificar se o callback já existe para evitar duplicatas
  const callbackExists = Array.from(notificationCallbacks).some(cb => cb === callback);
  if (callbackExists) {
    console.log('[SOCKET] Callback já registrado, ignorando duplicata');
    return;
  }
  
  // Adicionar callback à lista
  notificationCallbacks.add(callback);
  console.log(`[SOCKET] Callback adicionado. Total de callbacks: ${notificationCallbacks.size}`);
  
  // Se já está conectado, configurar listener imediatamente
  if (socket.connected) {
    setupNotificationListener();
  } else {
    // Se não está conectado, aguardar conexão
    console.log('[SOCKET] Aguardando conexão para configurar listener...');
    socket.once('connect', () => {
      setupNotificationListener();
    });
  }
  
  // Retornar função de cleanup
  return () => {
    offNotification(callback);
  };
}

export function onChatMessage(callback: (data: any) => void) {
  socket?.on('new-message', callback);
}

