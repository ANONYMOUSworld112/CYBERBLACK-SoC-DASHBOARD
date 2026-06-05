import { cn } from '../../lib/cn.js';
import { SEVERITY_BORDER_CLASS, SEVERITY_GLYPH } from '../../utils/severity.js';
import { formatUtc, relativeTime } from '../../utils/formatters.js';
import SeverityPill from '../ui/SeverityPill.jsx';

export default function AlertCard({ alert, onClick, compact = false }) {
  const borderClass = SEVERITY_BORDER_CLASS[alert.severity] || 'sev-border-low';
  return (
    <article
      onClick={onClick}
      className={cn(
        'group bg-bg-3 border border-border-2 hover:border-border-3 transition-colors',
        'pl-3 pr-3 py-2.5 cursor-pointer',
        borderClass,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <SeverityPill severity={alert.severity} size="sm" />
          <span className="font-orbitron text-[10px] tracking-widest2 uppercase text-text-3 truncate">
            {alert.source}
          </span>
        </div>
        <span className="font-mono text-[10px] text-text-3 shrink-0">
          {relativeTime(alert.created_at)}
        </span>
      </div>
      <h4 className="font-orbitron text-[12px] tracking-wider2 uppercase text-text-1 mt-1.5 truncate">
        {alert.title}
      </h4>
      {!compact && alert.summary && (
        <p className="font-rajdhani text-[12px] text-text-2 mt-1 line-clamp-2">
          {alert.summary}
        </p>
      )}
      <div className="flex items-center justify-between gap-2 mt-2">
        <code className="font-mono text-[10px] text-text-2 truncate">
          {alert.indicator || '—'}
        </code>
        <span className="font-mono text-[10px] text-text-4 shrink-0">
          {formatUtc(alert.created_at)}
        </span>
      </div>
    </article>
  );
}
