import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlertStore } from '../../store/alertStore.js';

export default function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const unread = useAlertStore((s) => s.alerts.filter((a) => a.status === 'open' && a.severity === 'critical').length);
  const recent = useAlertStore((s) => s.alerts.filter((a) => a.status === 'open').slice(0, 6));

  useEffect(() => {
    const onClick = (e) => {
      if (!e.target.closest?.('[data-bell]')) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div className="relative" data-bell>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative h-7 w-9 flex items-center justify-center border border-border-2 hover:border-text-1"
        aria-label="Notifications"
      >
        <span className="font-mono text-[14px] leading-none">◔</span>
        {unread > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 bg-text-1 text-void font-orbitron text-[9px] flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-80 bg-bg-3 border border-border-2 z-50 animate-slide-in">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border-2">
            <span className="font-orbitron text-[10px] tracking-widest2 uppercase text-text-1">
              Critical Queue
            </span>
            <button
              onClick={() => { setOpen(false); navigate('/alerts'); }}
              className="font-mono text-[10px] text-text-2 hover:text-text-1 uppercase"
            >
              View all →
            </button>
          </div>
          {recent.length === 0 ? (
            <div className="px-3 py-6 font-mono text-[11px] text-text-3 text-center uppercase">
              Queue empty
            </div>
          ) : (
            <ul className="max-h-80 overflow-auto">
              {recent.map((a) => (
                <li
                  key={a.id}
                  className="px-3 py-2 border-b border-border-1 last:border-b-0 hover:bg-bg-2 cursor-pointer"
                  onClick={() => { setOpen(false); navigate('/alerts'); }}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-text-1">
                      {a.severity === 'critical' ? '⚠' : a.severity === 'high' ? '▲' : a.severity === 'medium' ? '●' : '■'}
                    </span>
                    <span className="font-orbitron text-[10px] tracking-widest2 uppercase text-text-1 truncate">
                      {a.title}
                    </span>
                  </div>
                  <code className="font-mono text-[10px] text-text-3 block truncate">{a.indicator || '—'}</code>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
