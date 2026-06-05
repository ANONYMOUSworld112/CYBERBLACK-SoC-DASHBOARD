import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import Card from '../ui/Card.jsx';

/* Neutral shades only — no chromatic palette */
const SHADES = ['#ffffff', '#a0a0a0', '#707070', '#505050', '#303030', '#1a1a1a'];

export default function ProtocolDonut({ data, title = 'Protocols' }) {
  const total = (data || []).reduce((a, d) => a + d.value, 0);
  return (
    <Card title={title} subtitle={`${total} flows`}>
      <div className="h-48 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={48}
              outerRadius={72}
              stroke="var(--void-black)"
              strokeWidth={2}
              isAnimationActive={false}
            >
              {(data || []).map((_, i) => (
                <Cell key={i} fill={SHADES[i % SHADES.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: '#111111', border: '1px solid #2a2a2a', fontFamily: 'JetBrains Mono', fontSize: 11 }}
              labelStyle={{ color: '#a0a0a0' }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="font-orbitron text-2xl text-text-1 leading-none">{total}</div>
            <div className="font-mono text-[9px] text-text-3 uppercase mt-1">FLOWS</div>
          </div>
        </div>
      </div>
      <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 font-mono text-[10px] text-text-2">
        {(data || []).slice(0, 6).map((d, i) => (
          <li key={d.name} className="flex items-center gap-2">
            <span
              className="inline-block w-2 h-2"
              style={{ background: SHADES[i % SHADES.length] }}
            />
            <span className="text-text-2 truncate">{d.name}</span>
            <span className="ml-auto text-text-1">{d.value}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
