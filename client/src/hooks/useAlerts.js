import { useEffect } from 'react';
import { api } from '../lib/api.js';
import { useAuthStore } from '../store/authStore.js';
import { useAlertStore } from '../store/alertStore.js';

export function useAlerts() {
  const token = useAuthStore((s) => s.token);
  const setAlerts = useAlertStore((s) => s.setAlerts);

  useEffect(() => {
    if (!token) return;
    let stop = false;
    const load = async () => {
      try {
        const data = await api.get('/alerts', { token });
        if (!stop) setAlerts(data.alerts || []);
      } catch { /* swallow */ }
    };
    load();
    return () => { stop = true; };
  }, [token, setAlerts]);

  return {
    alerts: useAlertStore((s) => s.alerts),
    filtered: useAlertStore((s) => s.filtered()),
    filters: useAlertStore((s) => s.filters),
    setFilter: useAlertStore((s) => s.setFilter),
    select: useAlertStore((s) => s.select),
    selected: useAlertStore((s) => s.selected),
    update: useAlertStore((s) => s.updateAlert),
  };
}
