import { create } from 'zustand';

export const useOsintStore = create((set, get) => ({
  results: { whois: null, dns: null, shodan: null, threat: null },
  loading: { whois: false, dns: false, shodan: false, threat: false },
  history: [],
  indicator: '',

  setIndicator: (i) => set({ indicator: i }),
  setLoading: (kind, v) => set({ loading: { ...get().loading, [kind]: v } }),
  setResult: (kind, data) => set({ results: { ...get().results, [kind]: data } }),
  pushHistory: (entry) => set({ history: [entry, ...get().history].slice(0, 50) }),
  clear: () => set({ results: { whois: null, dns: null, shodan: null, threat: null } }),
}));
