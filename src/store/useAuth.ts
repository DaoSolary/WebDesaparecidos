import { create } from 'zustand';
import { api } from '../api/client';
import { initSocket, disconnectSocket } from '../services/socket';

type User = {
  id: string;
  fullName: string;
  email?: string;
  role: string;
  phone?: string;
  province?: string;
  municipality?: string;
  verifiedAt?: string;
  createdAt?: string;
};

type AuthStore = {
  user?: User;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: Record<string, string>) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
};

export const useAuth = create<AuthStore>((set, get) => ({
  loading: false,
  async login(email, password) {
    set({ loading: true });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('bdpd_token', data.token);
      set({ user: data.user });
      // Buscar dados completos do usuário após login
      await get().fetchUser();
      
      // Inicializar Socket.IO imediatamente após login para notificações em tempo real
      if (data.user?.id) {
        initSocket(data.user.id, data.user.role);
        console.log('Socket.IO inicializado após login para usuário:', data.user.id, 'role:', data.user.role);
      }
    } catch (error) {
      set({ loading: false });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  async register(payload) {
    try {
      await api.post('/auth/register', payload);
    } catch (error) {
      throw error;
    }
  },
  async fetchUser() {
    const token = localStorage.getItem('bdpd_token');
    if (!token) return;
    
    try {
      const { data } = await api.get('/auth/me');
      set({ user: data.user });
      
      // Inicializar Socket.IO se ainda não foi inicializado
      if (data.user?.id) {
        initSocket(data.user.id, data.user.role);
      }
    } catch (error) {
      // Se o token for inválido, fazer logout
      localStorage.removeItem('bdpd_token');
      set({ user: undefined });
    }
  },
  async updateProfile(profileData) {
    const { data } = await api.put('/auth/profile', profileData);
    set({ user: data.user });
  },
  async changePassword(currentPassword, newPassword) {
    await api.put('/auth/change-password', { currentPassword, newPassword });
  },
  logout() {
    localStorage.removeItem('bdpd_token');
    set({ user: undefined });
    // Desconectar socket ao fazer logout
    disconnectSocket();
  },
}));

