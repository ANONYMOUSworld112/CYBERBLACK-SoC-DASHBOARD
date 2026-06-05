import { useEffect } from 'react';
import { api } from '../lib/api.js';
import { useAuthStore } from '../store/authStore.js';
import { useNetworkStore } from '../store/networkStore.js';

export function useNetwork() {
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (!token) return;
    let stop = false;
    const load = async () => {
      try {
        const [talkers, protocols, bw] = await Promise.all([
          api.get('/network/talkers', { token }),
          api.get('/network/protocols', { token }),
          api.get('/network/bandwidth', { token }),
        ]);
        if (stop) return;
        useNetworkStore.getState().setTopTalkers(talkers.talkers || []);
        useNetworkStore.getState().setProtocols(protocols.protocols || []);
        useNetworkStore.getState().setBandwidth(bw.history || []);
      } catch { /* swallow */ }
    };
    load();
    return () => { stop = true; };
  }, [token]);

  return {
    packets: useNetworkStore((s) => s.packets),
    bandwidthHistory: useNetworkStore((s) => s.bandwidthHistory),
    topTalkers: useNetworkStore((s) => s.topTalkers),
    protocols: useNetworkStore((s) => s.protocols),
    capture: useNetworkStore((s) => s.capture),
  };
}
