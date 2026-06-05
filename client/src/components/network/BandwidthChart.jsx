import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Card from '../ui/Card.jsx';
import { formatRate } from '../../utils/formatters.js';

export default function BandwidthChart({ data, title = 'Bandwidth' }) {
  return (
    <Card title={title} subtitle="RX/TX · 1H">
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 6, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="bwFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
            </defs>
            <XAxis dataKey="t" tick={{ fill: '#606060', fontSize: 10, fontFamily: 'JetBrains Mono' }} stroke="#1a1a1a" />
            <YAxis tick={{ fill: '#606060', fontSize: 10, fontFamily: 'JetBrains Mono' }} stroke="#1a1a1a" />
            <Tooltip
              contentStyle={{ background: '#111111', border: '1px solid #2a2a2a', fontFamily: 'JetBrains Mono', fontSize: 11 }}
              labelStyle={{ color: '#a0a0a0' }}
              formatter={(v) => formatRate(v)}
            />
            <Area
              type="monotone"
              dataKey="rx"
              stroke="#ffffff"
              strokeWidth="1.5"
              fill="url(#bwFill)"
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="tx"
              stroke="#a0a0a0"
              strokeWidth="1"
              strokeDasharray="4 4"
              fill="none"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center gap-4 mt-2 font-mono text-[10px] uppercase text-text-3">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-px bg-text-1" /> RX
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-px bg-text-2 border-t border-dashed" /> TX
        </span>
      </div>
    </Card>
  );
}
