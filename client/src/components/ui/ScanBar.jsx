import { cn } from '../../lib/cn.js';

/**
 * Animated scan bar — sweeps a 1px white line left → right.
 * Used for loading states and "in progress" indicators.
 */
export default function ScanBar({ className, height = 1, label }) {
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <div className="font-mono text-[10px] text-text-3 uppercase mb-1">{label}</div>
      )}
      <div
        className="relative w-full bg-border-1 overflow-hidden"
        style={{ height }}
      >
        <div
          className="absolute top-0 bottom-0 w-1/3 bg-text-1 animate-scan-h"
          style={{ boxShadow: '0 0 8px rgba(255,255,255,0.4)' }}
        />
      </div>
    </div>
  );
}
