import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import ClassificationBadge from '../ui/ClassificationBadge.jsx';
import NotificationBell from '../alerts/NotificationBell.jsx';
import Button from '../ui/Button.jsx';
import Modal from '../ui/Modal.jsx';
import NmapTerminal from '../threat/NmapTerminal.jsx';
import VulnScanner from '../threat/VulnScanner.jsx';
import MalwarePanel from '../threat/MalwarePanel.jsx';
import PhishingPanel from '../threat/PhishingPanel.jsx';
import { useAuthStore } from '../../store/authStore.js';

const TOOLS = [
  { id: 'nmap',     label: 'Nmap Scanner'  },
  { id: 'vuln',     label: 'Vuln Scanner'  },
  { id: 'malware',  label: 'Malware Check' },
  { id: 'phishing', label: 'Phishing URL'  },
];

function Clock() {
  const [t, setT] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="flex flex-col items-end leading-none">
      <span className="font-mono text-[12px] text-text-1">
        {format(t, 'HH:mm:ss')}
      </span>
      <span className="font-mono text-[9px] text-text-3 uppercase mt-0.5">
        {format(t, 'yyyy-MM-dd')} UTC
      </span>
    </div>
  );
}

export default function TopBar() {
  const [toolsOpen, setToolsOpen] = useState(false);
  const [activeTool, setActiveTool] = useState(null);
  const [userMenu, setUserMenu] = useState(false);
  const userRef = useRef(null);
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    const onClick = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) setUserMenu(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <header className="h-12 shrink-0 bg-void border-b border-border-1 flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <ClassificationBadge level="RESTRICTED // SOC" size="md" />
        <span className="font-mono text-[10px] text-text-3 uppercase">
          / MONITORING / LIVE
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setToolsOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={toolsOpen}
        >
          ◇ TOOLS ▾
        </Button>
        <NotificationBell />
        <Clock />
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setUserMenu((v) => !v)}
            className="flex items-center gap-2 h-7 px-2 border border-border-2 hover:border-text-1 transition-colors"
          >
            <span className="inline-block w-5 h-5 bg-bg-3 border border-border-2 flex items-center justify-center font-orbitron text-[9px]">
              {(user?.username || 'OP').slice(0, 2).toUpperCase()}
            </span>
            <span className="font-mono text-[11px] text-text-2 uppercase">
              {user?.username || 'operator'}
            </span>
          </button>
          {userMenu && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-bg-3 border border-border-2 z-50 animate-slide-in">
              <div className="px-3 py-2 border-b border-border-1">
                <div className="font-orbitron text-[10px] tracking-widest2 uppercase text-text-1">
                  {user?.username || 'operator'}
                </div>
                <div className="font-mono text-[10px] text-text-3">
                  {user?.email || '—'}
                </div>
              </div>
              <button
                onClick={() => { setUserMenu(false); navigate('/settings'); }}
                className="w-full text-left px-3 py-2 font-mono text-[11px] text-text-2 hover:bg-bg-2 hover:text-text-1"
              >
                ⚙ Settings
              </button>
              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="w-full text-left px-3 py-2 font-mono text-[11px] text-text-1 border-t border-border-1 hover:bg-bg-2"
              >
                ✕ Sign out
              </button>
            </div>
          )}
        </div>
      </div>

      {toolsOpen && (
        <div className="absolute right-4 top-12 mt-1 w-56 bg-bg-3 border border-border-2 z-40 animate-slide-in">
          {TOOLS.map((t) => (
            <button
              key={t.id}
              onClick={() => { setActiveTool(t.id); setToolsOpen(false); }}
              className="w-full text-left px-3 py-2 font-mono text-[12px] text-text-2 hover:bg-bg-2 hover:text-text-1 border-b border-border-1 last:border-b-0"
            >
              ▸ {t.label}
            </button>
          ))}
        </div>
      )}

      <Modal
        open={Boolean(activeTool)}
        onClose={() => setActiveTool(null)}
        title={
          activeTool === 'nmap'     ? 'Nmap // Network Scanner' :
          activeTool === 'vuln'     ? 'Vulnerability Scanner'  :
          activeTool === 'malware'  ? 'Malware Hash Check'     :
          activeTool === 'phishing' ? 'Phishing URL Analyzer'  : ''
        }
        size="xl"
        footer={
          <Button variant="secondary" onClick={() => setActiveTool(null)}>
            Close
          </Button>
        }
      >
        {activeTool === 'nmap'     && <NmapTerminal />}
        {activeTool === 'vuln'     && <VulnScanner />}
        {activeTool === 'malware'  && <MalwarePanel />}
        {activeTool === 'phishing' && <PhishingPanel />}
      </Modal>
    </header>
  );
}
