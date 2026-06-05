import { create } from 'zustand';

export const useAlertStore = create((set, get) => ({
  alerts: [],
  selected: null,
  filters: { severity: 'all', status: 'all', search: '' },

  setAlerts: (alerts) => set({ alerts }),
  prependAlert: (a) => set({ alerts: [a, ...get().alerts].slice(0, 500) }),
  updateAlert: (id, patch) =>
    set({ alerts: get().alerts.map((a) => (a.id === id ? { ...a, ...patch } : a)) }),
  select: (id) => set({ selected: id }),

  setFilter: (patch) => set({ filters: { ...get().filters, ...patch } }),

  filtered: () => {
    const { alerts, filters } = get();
    return alerts.filter((a) => {
      if (filters.severity !== 'all' && a.severity !== filters.severity) return false;
      if (filters.status !== 'all' && a.status !== filters.status) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (
          !(a.title || '').toLowerCase().includes(q) &&
          !(a.summary || '').toLowerCase().includes(q) &&
          !(a.indicator || '').toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  },

  unreadCritical: () => get().alerts.filter((a) => a.severity === 'critical' && a.status === 'open').length,
}));
