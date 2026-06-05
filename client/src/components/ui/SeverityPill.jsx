import { cn } from '../../lib/cn.js';
import { SEVERITY_GLYPH } from '../../utils/severity.js';

/**
 * SeverityPill — encodes severity by border shade + glyph + label only.
 * No chromatic color. All variants are black-bg with white/gray borders.
 */
const SHADE = {
  critical: 'border-text-1',           /* brightest white */
  high:     'border-text-2',           /* a0a0a0 */
  medium:   'border-text-3',           /* 606060 */
  low:      'border-border-3',         /* 404040 */
};

const TEXT = {
  critical: 'text-text-1',
  high:     'text-text-2',
  medium:   'text-text-3',
  low:      'text-text-3',
};

export default function SeverityPill({ severity = 'low', className, size = 'md', withGlyph = true, label }) {
  const sev = SHADE[severity] ? severity : 'low';
  const sizes = {
    sm: 'h-5 px-1.5 text-[9px] gap-1',
    md: 'h-6 px-2 text-[10px] gap-1.5',
    lg: 'h-7 px-2.5 text-[11px] gap-1.5',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center font-orbitron uppercase tracking-wider2',
        'border bg-bg-3',
        SHADE[sev],
        TEXT[sev],
        sizes[size],
        className,
      )}
    >
      {withGlyph && <span aria-hidden>{SEVERITY_GLYPH[sev]}</span>}
      <span>{label || sev}</span>
    </span>
  );
}
