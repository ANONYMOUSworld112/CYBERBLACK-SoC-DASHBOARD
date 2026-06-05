import { create } from 'zustand';
import { api } from '../lib/api.js';

export const useSettingsStore = create((set, get) => ({
  settings: {
    classification: 'RESTRICTED',
    notifications: { email: false, webhook: false, webhookUrl: '' },
    apiKeys: { vt: '', shodan: '', abuseipdb: '' },
  },
  loaded: false,

  load: async () => {
    if (get().loaded) return;
    try {
      const data = await api.get('/settings');
      set({ settings: { ...get().settings, ...data }, loaded: true });
    } catch { set({ loaded: true }); }
  },

  save: async (patch) => {
    const next = { ...get().settings, ...patch };
    set({ settings: next });
    try { await api.put('/settings', next); } catch { /* swallow */ }
  },
}));
