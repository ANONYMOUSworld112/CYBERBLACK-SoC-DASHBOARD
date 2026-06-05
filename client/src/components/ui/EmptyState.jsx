import { cn } from '../../lib/cn.js';

export default function EmptyState({ title = 'NO DATA', description, icon = '∅', action, className }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-10 px-4',
        'border border-dashed border-border-2 bg-void',
        className,
      )}
    >
      <div className="font-mono text-[28px] text-text-4 mb-2">{icon}</div>
      <div className="font-orbitron text-[11px] tracking-widest2 uppercase text-text-2 mb-1">
        {title}
      </div>
      {description && (
        <div className="font-mono text-[11px] text-text-3 max-w-md">{description}</div>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
