import Card from '../ui/Card.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import SeverityPill from '../ui/SeverityPill.jsx';
import { relativeTime } from '../../utils/formatters.js';

export default function ThreatIntelFeed({ items = [], title = 'Threat Intelligence' }) {
  return (
    <Card title={title} subtitle="LIVE FEED">
      {items.length === 0 ? (
        <EmptyState
          title="No intel events"
          description="Feeds are polled every 30s. Indicators will appear here as correlations are detected."
          icon="∅"
        />
      ) : (
        <ul className="space-y-1.5 -mx-1 max-h-72 overflow-auto">
          {items.map((it) => (
            <li
              key={it.id}
              className="flex items-center gap-3 px-2 py-1.5 border-b border-border-1 last:border-b-0 hover:bg-bg-2"
            >
              <SeverityPill severity={it.severity} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="font-orbitron text-[11px] tracking-wider2 uppercase text-text-1 truncate">
                  {it.title}
                </div>
                <code className="font-mono text-[10px] text-text-3 truncate block">{it.indicator}</code>
              </div>
              <span className="font-mono text-[10px] text-text-3 shrink-0">{relativeTime(it.ts)}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
