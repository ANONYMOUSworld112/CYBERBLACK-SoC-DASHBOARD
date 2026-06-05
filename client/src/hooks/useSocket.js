import { useEffect } from 'react';
import { getSocket, disconnectSocket } from '../lib/socket.js';
import { useAuthStore } from '../store/authStore.js';
import { useAlertStore } from '../store/alertStore.js';
import { useNetworkStore } from '../store/networkStore.js';

export function useSocket(token) {
  useEffect(() => {
    if (!token) return undefined;
    const s = getSocket(token);

    const onAlert = (a) => useAlertStore.getState().prependAlert(a);
    const onAlertUpdate = (a) => useAlertStore.getState().updateAlert(a.id, a);
    const onPackets = (p) => useNetworkStore.getState().appendPackets(Array.isArray(p) ? p : [p]);
    const onBandwidth = (p) => useNetworkStore.getState().pushBandwidthPoint(p);

    s.on('alert:new', onAlert);
    s.on('alert:update', onAlertUpdate);
    s.on('packet:capture', onPackets);
    s.on('bandwidth:tick', onBandwidth);

    s.on('connect_error', (err) => {
      // eslint-disable-next-line no-console
      console.warn('[socket] connect_error', err.message);
    });

    return () => {
      s.off('alert:new', onAlert);
      s.off('alert:update', onAlertUpdate);
      s.off('packet:capture', onPackets);
      s.off('bandwidth:tick', onBandwidth);
      disconnectSocket();
    };
  }, [token]);
}
