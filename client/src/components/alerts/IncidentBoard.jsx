import { useState } from 'react';
import { cn } from '../../lib/cn.js';
import Card from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';
import { formatUtc } from '../../utils/formatters.js';

const COLUMNS = [
  { id: 'triage',        label: 'Triage' },
  { id: 'investigating', label: 'Investigating' },
  { id: 'resolved',      label: 'Resolved' },
];

const STATUS_TO_COL = {
  open: 'triage',
  investigating: 'investigating',
  resolved: 'resolved',
  dismissed: 'resolved',
};

export default function IncidentBoard({ alerts, onMove }) {
  const grouped = COLUMNS.reduce((acc, c) => {
    acc[c.id] = alerts.filter((a) => STATUS_TO_COL[a.status] === c.id);
    return acc;
  }, {});

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {COLUMNS.map((col) => (
        <Card
          key={col.id}
          title={col.label}
          subtitle={`${grouped[col.id].length} ITEMS`}
          tight
        >
          <div className="space-y-1.5 min-h-[80px]">
            {grouped[col.id].length === 0 ? (
              <div className="font-mono text-[10px] text-text-4 text-center py-6 uppercase">
                EMPTY
              </div>
            ) : (
              grouped[col.id].map((a) => (
                <IncidentCard
                  key={a.id}
                  alert={a}
                  onMove={(status) => onMove?.(a.id, status)}
                />
              ))
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

function IncidentCard({ alert, onMove }) {
  const next = {
    triage: { label: '▸ Investigate', status: 'investigating' },
    investigating: { label: '✓ Resolve', status: 'resolved' },
    resolved: { label: '↺ Reopen', status: 'open' },
  };
  return (
    <div className="border border-border-2 bg-bg-2 px-2.5 py-2 sev-border-low">
      <div className="font-orbitron text-[10px] tracking-widest2 uppercase text-text-1 truncate">
        {alert.title}
      </div>
      <code className="font-mono text-[10px] text-text-3 block truncate">{alert.indicator || '—'}</code>
      <div className="flex items-center justify-between mt-1.5">
        <span className="font-mono text-[9px] text-text-4 uppercase">{formatUtc(alert.created_at)}</span>
        <button
          onClick={() => onMove(next[STATUS_TO_COL[alert.status]]?.status || 'open')}
          className="font-mono text-[10px] text-text-2 hover:text-text-1"
        >
          {next[STATUS_TO_COL[alert.status]]?.label || '▸ Move'}
        </button>
      </div>
    </div>
  );
}
