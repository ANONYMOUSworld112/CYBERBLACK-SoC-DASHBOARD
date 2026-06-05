import { cn } from '../../lib/cn.js';

const VARIANTS = {
  primary: 'bg-text-1 text-void hover:bg-text-2 border border-text-1',
  secondary: 'bg-transparent text-text-1 border border-border-3 hover:border-text-1',
  danger: 'bg-bg-3 text-text-1 border border-text-1 hover:bg-text-1 hover:text-void',
  ghost: 'bg-transparent text-text-2 border border-transparent hover:text-text-1 hover:border-border-2',
};

const SIZES = {
  sm: 'h-7 px-3 text-[11px]',
  md: 'h-9 px-5 text-xs',
  lg: 'h-11 px-6 text-sm',
};

export default function Button({
  variant = 'secondary',
  size = 'md',
  className,
  type = 'button',
  disabled = false,
  children,
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-orbitron tracking-wider2 uppercase select-none',
        'transition-colors duration-100',
        'disabled:opacity-30 disabled:cursor-not-allowed',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
