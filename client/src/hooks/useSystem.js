import { useEffect } from 'react';
import { api } from '../lib/api.js';
import { useAuthStore } from '../store/authStore.js';
import { useSystemStore } from '../store/systemStore.js';

export function useSystem() {
  const token = useAuthStore((s) => s.token);
  useEffect(() => {
    if (!token) return;
    let stop = false;
    const tick = async () => {
      try {
        const data = await api.get('/system/health', { token });
        if (!stop) useSystemStore.getState().setHealth(data);
      } catch { /* swallow */ }
    };
    tick();
    const id = setInterval(tick, 5000);
    return () => { stop = true; clearInterval(id); };
  }, [token]);
  return useSystemStore((s) => s.health);
}
