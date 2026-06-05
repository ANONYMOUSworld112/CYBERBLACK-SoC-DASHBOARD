import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore.js';

export function useAuth() {
  const hydrate = useAuthStore((s) => s.hydrate);
  useEffect(() => { hydrate(); }, [hydrate]);
  return {
    token: useAuthStore((s) => s.token),
    user:  useAuthStore((s) => s.user),
    totpVerified: useAuthStore((s) => s.totpVerified),
    isAuthenticated: Boolean(useAuthStore((s) => s.token) && useAuthStore((s) => s.totpVerified)),
  };
}
