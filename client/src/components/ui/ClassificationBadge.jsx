import { cn } from '../../lib/cn.js';

/**
 * Top-secret style classification badge.
 * White bg, black text, Orbitron 10px, letter-spacing 0.2em.
 */
export default function ClassificationBadge({ level = 'UNCLASSIFIED', className, size = 'md' }) {
  const sizes = {
    sm: 'h-5 px-2 text-[9px]',
    md: 'h-6 px-2.5 text-[10px]',
    lg: 'h-7 px-3 text-[11px]',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center font-orbitron uppercase',
        'bg-text-1 text-void',
        sizes[size],
        className,
      )}
    >
      ▲ {level}
    </span>
  );
}
