import { useCallback } from 'react';
import { api } from '../lib/api.js';
import { useAuthStore } from '../store/authStore.js';
import { useOsintStore } from '../store/osintStore.js';

export function useOsint() {
  const token = useAuthStore((s) => s.token);
  const setLoading = useOsintStore((s) => s.setLoading);
  const setResult = useOsintStore((s) => s.setResult);
  const pushHistory = useOsintStore((s) => s.pushHistory);

  const lookup = useCallback(async (kind, indicator) => {
    setLoading(kind, true);
    try {
      const data = await api.get(`/osint/${kind}?indicator=${encodeURIComponent(indicator)}`, { token });
      setResult(kind, data);
      pushHistory({ indicator, kind, ts: Date.now() });
      return data;
    } catch (err) {
      setResult(kind, { error: err.message });
      throw err;
    } finally {
      setLoading(kind, false);
    }
  }, [token, setLoading, setResult, pushHistory]);

  return {
    results: useOsintStore((s) => s.results),
    loading: useOsintStore((s) => s.loading),
    history: useOsintStore((s) => s.history),
    indicator: useOsintStore((s) => s.indicator),
    setIndicator: useOsintStore((s) => s.setIndicator),
    clear: useOsintStore((s) => s.clear),
    lookup,
  };
}
