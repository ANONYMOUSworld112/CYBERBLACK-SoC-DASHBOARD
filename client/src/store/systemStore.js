import { create } from 'zustand';

export const useSystemStore = create((set) => ({
  health: {
    cpu: 0,
    memory: 0,
    memoryTotal: 0,
    disk: 0,
    uptime: 0,
    hostname: '—',
    os: '—',
    loadavg: [0, 0, 0],
  },
  setHealth: (h) => set({ health: h }),
}));
