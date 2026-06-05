import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/cn.js';

const ITEMS = [
  { to: '/dashboard', label: 'Dashboard', glyph: '◉' },
  { to: '/alerts',    label: 'Alerts',    glyph: '⚠' },
  { to: '/network',   label: 'Network',   glyph: '◈' },
  { to: '/osint',     label: 'OSINT',     glyph: '◎' },
  { to: '/settings',  label: 'Settings',  glyph: '⚙' },
];

export default function Sidebar() {
  return (
    <aside className="w-[200px] shrink-0 bg-void border-r border-border-1 flex flex-col">
      <div className="h-14 px-4 flex items-center border-b border-border-1">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-text-1 animate-pulse-core" />
          <div>
            <div className="font-orbitron text-[11px] tracking-widest2 uppercase text-text-1 leading-none">
              SOC//OPS
            </div>
            <div className="font-mono text-[9px] text-text-3 leading-none mt-0.5">
              v2.0 / TIER-1
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-2">
        {ITEMS.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 h-9 pl-4 pr-3 font-orbitron text-[11px] uppercase tracking-widest2',
                'border-l-[3px] transition-colors',
                isActive
                  ? 'border-text-1 bg-bg-2 text-text-1'
                  : 'border-transparent text-text-5 hover:text-text-2 hover:bg-bg-input',
              )
            }
          >
            <span className="font-mono text-[12px] text-text-3 group-hover:text-text-2 w-3 text-center">
              {it.glyph}
            </span>
            <span>{it.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-3 border-t border-border-1">
        <div className="flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 bg-text-1 animate-pulse-glow" />
          <span className="font-mono text-[9px] uppercase text-text-3">OPERATIONAL</span>
        </div>
        <div className="font-mono text-[9px] text-text-4 mt-1">
          NODE-01 / 24-7
        </div>
      </div>
    </aside>
  );
}
