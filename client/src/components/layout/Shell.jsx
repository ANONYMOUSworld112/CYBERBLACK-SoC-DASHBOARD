import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import TopBar from './TopBar.jsx';
import ScanlineOverlay from './ScanlineOverlay.jsx';
import { useSocket } from '../../hooks/useSocket.js';
import { useSystemStore } from '../../store/systemStore.js';
import { api } from '../../lib/api.js';
import { useAuthStore } from '../../store/authStore.js';

export default function Shell() {
  const token = useAuthStore((s) => s.token);
  useSocket(token);
  const setHealth = useSystemStore((s) => s.setHealth);

  useEffect(() => {
    let stop = false;
    const tick = async () => {
      try {
        const data = await api.get('/system/health', { token });
        if (!stop) setHealth(data);
      } catch { /* silent */ }
    };
    tick();
    const id = setInterval(tick, 5000);
    return () => { stop = true; clearInterval(id); };
  }, [token, setHealth]);

  return (
    <div className="h-screen w-screen flex flex-col bg-void text-text-1 overflow-hidden">
      <div className="classification-stripe" />
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar />
          <main className="flex-1 min-h-0 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
      <ScanlineOverlay />
    </div>
  );
}
