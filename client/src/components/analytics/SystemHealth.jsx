import Card from '../ui/Card.jsx';

function Bar({ value, label, sub }) {
  const v = Math.max(0, Math.min(100, value || 0));
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <span className="font-orbitron text-[10px] tracking-widest2 uppercase text-text-2">{label}</span>
        <span className="font-mono text-[11px] text-text-1">{v.toFixed(0)}%</span>
      </div>
      <div className="h-1.5 bg-border-1 border border-border-2 overflow-hidden">
        <div
          className="h-full bg-text-1 transition-all duration-500"
          style={{ width: `${v}%` }}
        />
      </div>
      {sub && <div className="font-mono text-[9px] text-text-4 mt-1 uppercase">{sub}</div>}
    </div>
  );
}

export default function SystemHealth({ health }) {
  const memUsedGB = ((health.memoryTotal || 0) - (health.memoryAvailable || 0)) / 1e9;
  return (
    <Card title="System Health" subtitle={health.hostname}>
      <div className="space-y-3">
        <Bar value={health.cpu}    label="CPU"     sub={`${(health.cpus?.length || '—')} cores`} />
        <Bar value={health.memory} label="Memory"  sub={memUsedGB ? `${memUsedGB.toFixed(1)} GB in use` : '—'} />
        <Bar value={health.disk}   label="Disk"    sub={health.diskPath || '/'} />
      </div>
      <div className="mt-4 pt-3 border-t border-border-2 grid grid-cols-2 gap-2 font-mono text-[10px] text-text-3 uppercase">
        <div>OS <span className="text-text-1">{health.os || '—'}</span></div>
        <div>UPTIME <span className="text-text-1">{Math.floor((health.uptime || 0) / 3600)}h</span></div>
        <div>LOAD 1M <span className="text-text-1">{(health.loadavg?.[0] || 0).toFixed(2)}</span></div>
        <div>LOAD 5M <span className="text-text-1">{(health.loadavg?.[1] || 0).toFixed(2)}</span></div>
      </div>
    </Card>
  );
}
