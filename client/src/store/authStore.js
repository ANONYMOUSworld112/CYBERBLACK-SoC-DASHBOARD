import { create } from 'zustand';
import { api } from '../lib/api.js';

const STORAGE_KEY = 'soc.auth.v2';

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

function persist(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      token: state.token,
      totpVerified: state.totpVerified,
      user: state.user,
    }));
  } catch { /* ignore */ }
}

export const useAuthStore = create((set, get) => ({
  token: null,
  totpVerified: false,
  user: null,
  loading: false,
  error: null,

  hydrate: () => {
    const data = load();
    if (data) set({ token: data.token, totpVerified: data.totpVerified, user: data.user });
  },

  login: async (username, password) => {
    set({ loading: true, error: null });
    try {
      const data = await api.post('/auth/login', { username, password });
      set({ token: data.token, totpVerified: false, user: data.user });
      persist(get());
      return data;
    } catch (err) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  verify2FA: async (code) => {
    const { token } = get();
    set({ loading: true, error: null });
    try {
      const data = await api.post('/auth/verify-2fa', { code }, { token });
      set({ totpVerified: true });
      persist(get());
      return data;
    } catch (err) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  setup2FA: async () => {
    const { token } = get();
    const data = await api.post('/auth/setup-2fa', {}, { token });
    return data;
  },

  confirm2FASetup: async (code) => {
    const { token } = get();
    set({ loading: true, error: null });
    try {
      const data = await api.post('/auth/confirm-2fa', { code }, { token });
      set({ totpVerified: true, user: { ...(get().user || {}), totp_enabled: true } });
      persist(get());
      return data;
    } catch (err) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  logout: () => {
    const { token } = get();
    if (token) api.post('/auth/logout', {}, { token }).catch(() => {});
    localStorage.removeItem(STORAGE_KEY);
    set({ token: null, totpVerified: false, user: null });
  },
}));
