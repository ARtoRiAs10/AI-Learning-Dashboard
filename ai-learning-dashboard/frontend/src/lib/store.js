import { create } from 'zustand';
import Cookies from 'js-cookie';
import { authAPI } from '@/lib/api';

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  loading: false,

  initialize: async () => {
    const token = Cookies.get('access_token');
    if (!token) return;
    try {
      const { data } = await authAPI.getProfile();
      set({ user: data, isAuthenticated: true });
    } catch {
      Cookies.remove('access_token');
      Cookies.remove('refresh_token');
    }
  },

  login: async (credentials) => {
    set({ loading: true });
    try {
      const { data } = await authAPI.login(credentials);
      Cookies.set('access_token', data.tokens.access, { expires: 1 });
      Cookies.set('refresh_token', data.tokens.refresh, { expires: 7 });
      set({ user: data.user, isAuthenticated: true, loading: false });
      return { success: true };
    } catch (error) {
      set({ loading: false });
      return { success: false, error: error.response?.data };
    }
  },

  register: async (userData) => {
    set({ loading: true });
    try {
      const { data } = await authAPI.register(userData);
      Cookies.set('access_token', data.tokens.access, { expires: 1 });
      Cookies.set('refresh_token', data.tokens.refresh, { expires: 7 });
      set({ user: data.user, isAuthenticated: true, loading: false });
      return { success: true };
    } catch (error) {
      set({ loading: false });
      return { success: false, error: error.response?.data };
    }
  },

  logout: async () => {
    try {
      const refresh = Cookies.get('refresh_token');
      await authAPI.logout(refresh);
    } finally {
      Cookies.remove('access_token');
      Cookies.remove('refresh_token');
      set({ user: null, isAuthenticated: false });
    }
  },

  updateUser: (userData) => set({ user: { ...get().user, ...userData } }),
}));

export default useAuthStore;
