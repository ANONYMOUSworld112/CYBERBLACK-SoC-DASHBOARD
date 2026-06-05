import { useEffect, useRef } from 'react';
import { cn } from '../../lib/cn.js';
import Card from '../ui/Card.jsx';
import { formatUtc } from '../../utils/formatters.js';

function portColor(state, isInsecure) {
  if (isInsecure) return 'text-text-1 font-bold'; // bold white, glyph marks insecure
  if (state === 'open')    return 'text-text-1 font-bold';
  if (state === 'filtered') return 'text-text-5';
  if (state === 'closed')  return 'text-text-4';
  return 'text-text-3';
}

export default function PacketFeed({ packets = [], title = 'Packet Feed' }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [packets.length]);

  return (
    <Card title={title} subtitle={`${packets.length} pkts`}>
      <div
        ref={ref}
        className="font-mono text-[11px] leading-[1.45] h-72 overflow-auto bg-void border border-border-1 p-2"
      >
        {packets.length === 0 ? (
          <div className="text-text-4 uppercase text-[10px]">// waiting for packets</div>
        ) : (
          packets.map((p, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-text-3 shrink-0">{formatUtc(p.ts).slice(11)}</span>
              <span className="text-text-2 shrink-0 w-24 truncate">{p.src}</span>
              <span className="text-text-3">→</span>
              <span className="text-text-2 shrink-0 w-24 truncate">{p.dst}</span>
              <span className="text-text-2 shrink-0 w-12">{p.proto || 'TCP'}</span>
              <span className={cn('shrink-0 w-12', portColor(p.state, p.insecure))}>
                {p.port || '—'}
              </span>
              {p.insecure && <span className="text-text-1 font-bold">⚠ INSECURE</span>}
              {p.note && <span className="text-text-2 truncate">{p.note}</span>}
            </div>
          ))
        )}
        <div className="flex items-center gap-1 mt-1">
          <span className="inline-block w-2 h-3 bg-text-1 animate-blink-cursor" />
        </div>
      </div>
    </Card>
  );
}
