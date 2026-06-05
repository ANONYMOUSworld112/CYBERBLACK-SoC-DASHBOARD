import { useMemo } from 'react';

/**
 * RiskGauge — semicircular SVG gauge.
 * White needle, neutral segment shades. No chromatic accents.
 */
export default function RiskGauge({ value = 0, size = 200, label = 'RISK INDEX' }) {
  const clamped = Math.max(0, Math.min(100, value));
  const angle = useMemo(() => (clamped / 100) * 180, [clamped]);
  const radius = size / 2 - 14;
  const cx = size / 2;
  const cy = size / 2;
  const polar = (deg, r = radius) => {
    const rad = (deg - 180) * (Math.PI / 180);
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };
  const needleEnd = polar(angle);
  const ticks = [0, 25, 50, 75, 100];

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size / 2 + 28} className="overflow-visible">
        {/* Track arc */}
        <path
          d={`M 14 ${cy} A ${radius} ${radius} 0 0 1 ${size - 14} ${cy}`}
          fill="none"
          stroke="#2a2a2a"
          strokeWidth="2"
        />
        {/* Segments — 4 shade bands */}
        {[0, 25, 50, 75].map((v, i) => {
          const a1 = polar(v);
          const a2 = polar(ticks[i + 1]);
          return (
            <line
              key={v}
              x1={a1.x} y1={a1.y} x2={a2.x} y2={a2.y}
              stroke={['#404040', '#606060', '#a0a0a0', '#ffffff'][i]}
              strokeWidth="4"
            />
          );
        })}
        {/* Tick marks */}
        {ticks.map((v) => {
          const p1 = polar(v, radius - 4);
          const p2 = polar(v, radius - 12);
          return (
            <line key={v} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#a0a0a0" strokeWidth="1" />
          );
        })}
        {/* Needle */}
        <line
          x1={cx} y1={cy} x2={needleEnd.x} y2={needleEnd.y}
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="square"
        />
        <circle cx={cx} cy={cy} r="4" fill="#ffffff" />
      </svg>
      <div className="-mt-2 text-center">
        <div className="font-orbitron text-3xl text-text-1 leading-none">{clamped}</div>
        <div className="font-mono text-[10px] text-text-3 uppercase mt-1">{label}</div>
      </div>
    </div>
  );
}
