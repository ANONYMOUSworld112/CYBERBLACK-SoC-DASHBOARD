import { useState } from 'react';
import { cn } from '../../lib/cn.js';

export function Tabs({ tabs, value, onChange, className }) {
  const [internal, setInternal] = useState(tabs[0]?.value);
  const current = value ?? internal;
  const setCurrent = (v) => {
    setInternal(v);
    onChange?.(v);
  };
  return (
    <div className={cn('border-b border-border-2 flex items-center gap-0', className)}>
      {tabs.map((t) => {
        const active = t.value === current;
        return (
          <button
            key={t.value}
            type="button"
            onClick={() => setCurrent(t.value)}
            className={cn(
              'px-4 h-9 font-orbitron text-[11px] tracking-widest2 uppercase',
              'border-b-2 -mb-px transition-colors',
              active
                ? 'text-text-1 border-text-1'
                : 'text-text-3 border-transparent hover:text-text-2',
            )}
          >
            {t.label}
            {typeof t.count === 'number' && (
              <span className="ml-2 font-mono text-[10px] text-text-3">
                [{String(t.count).padStart(2, '0')}]
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function TabPanel({ tabs, value, className, panelClassName }) {
  const [internal, setInternal] = useState(tabs[0]?.value);
  const current = value ?? internal;
  const setCurrent = (v) => setInternal(v);
  return (
    <div className={className}>
      <Tabs tabs={tabs} value={current} onChange={setCurrent} />
      <div className={panelClassName}>
        {tabs.find((t) => t.value === current)?.content}
      </div>
    </div>
  );
}
