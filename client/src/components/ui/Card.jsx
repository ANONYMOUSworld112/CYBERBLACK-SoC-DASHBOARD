import { cn } from '../../lib/cn.js';

export default function Card({
  className,
  title,
  subtitle,
  actions,
  children,
  hover = true,
  tight = false,
}) {
  return (
    <section
      className={cn(
        'bg-bg-3 border border-border-2',
        hover && 'transition-colors duration-100 hover:border-border-3',
        className,
      )}
    >
      {(title || actions) && (
        <header className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-border-2">
          <div className="flex items-baseline gap-3 min-w-0">
            {title && (
              <h3 className="font-orbitron text-[11px] tracking-widest2 uppercase text-text-1 truncate">
                {title}
              </h3>
            )}
            {subtitle && (
              <span className="font-mono text-[10px] text-text-3 truncate">{subtitle}</span>
            )}
          </div>
          {actions && <div className="flex items-center gap-1 shrink-0">{actions}</div>}
        </header>
      )}
      <div className={cn(tight ? 'p-3' : 'p-4')}>{children}</div>
    </section>
  );
}
