import { create } from 'zustand';
import api from '../utils/axios';

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  // Load user initially
  checkAuth: async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      set({ isLoading: true, error: null });
      const res = await api.get('/auth/me');
      if (res.data.success) {
         set({ user: res.data.data.user, isAuthenticated: true, isLoading: false });
      }
    } catch (error) {
      console.error('Auth verification failed', error);
      // Let interceptor handle token clear if it's 401
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email, password) => {
    try {
      set({ isLoading: true, error: null });
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { user, accessToken, refreshToken } = res.data.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        set({ user, isAuthenticated: true, isLoading: false, error: null });
        return { success: true };
      }
      return { success: false, message: 'Invalid response' };
    } catch (error) {
       const message = error.response?.data?.message || 'Login failed';
       set({ isLoading: false, error: message });
       return { success: false, message };
    }
  },

  register: async (name, email, password) => {
      try {
        set({ isLoading: true, error: null });
        const res = await api.post('/auth/register', { name, email, password });
        if (res.data.success) {
          const { user, accessToken, refreshToken } = res.data.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          set({ user, isAuthenticated: true, isLoading: false, error: null });
          return { success: true };
        }
        return { success: false, message: 'Invalid response' };
      } catch (error) {
         const message = error.response?.data?.message || 'Registration failed';
         set({ isLoading: false, error: message });
         return { success: false, message };
      }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // ignore
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      set({ user: null, isAuthenticated: false, error: null });
    }
  },
  
  clearError: () => set({ error: null })
}));

// Listener for unauthorized events from axios interceptor
if (typeof window !== 'undefined') {
    window.addEventListener('auth:unauthorized', () => {
       useAuthStore.getState().logout();
    });
}

export default useAuthStore;
