import { create } from 'zustand';

export const useNetworkStore = create((set, get) => ({
  packets: [],
  bandwidthHistory: [],
  topTalkers: [],
  protocols: [],
  capture: { source: 'mock', running: true, pps: 0 },

  appendPackets: (p) => set({ packets: [...get().packets, ...p].slice(-500) }),
  setBandwidth: (h) => set({ bandwidthHistory: h }),
  pushBandwidthPoint: (point) =>
    set({ bandwidthHistory: [...get().bandwidthHistory, point].slice(-120) }),
  setTopTalkers: (t) => set({ topTalkers: t }),
  setProtocols: (p) => set({ protocols: p }),
  setCapture: (c) => set({ capture: { ...get().capture, ...c } }),
}));
