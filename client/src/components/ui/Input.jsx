import { forwardRef } from 'react';
import { cn } from '../../lib/cn.js';

const Input = forwardRef(function Input(
  { className, type = 'text', prefix, suffix, error, ...rest },
  ref,
) {
  return (
    <div className="flex flex-col gap-1">
      <div
        className={cn(
          'flex items-center gap-2 h-9 px-2',
          'bg-bg-input border border-border-2',
          'focus-within:border-text-1',
          error && 'border-text-1',
          className,
        )}
      >
        {prefix && <span className="font-mono text-[10px] text-text-3 uppercase shrink-0">{prefix}</span>}
        <input
          ref={ref}
          type={type}
          className="flex-1 bg-transparent outline-none font-mono text-[12px] text-text-1 placeholder:text-text-4 min-w-0"
          {...rest}
        />
        {suffix && <span className="font-mono text-[10px] text-text-3 uppercase shrink-0">{suffix}</span>}
      </div>
      {error && <span className="font-mono text-[10px] text-text-2 uppercase">{error}</span>}
    </div>
  );
});

export const Textarea = forwardRef(function Textarea({ className, ...rest }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        'w-full bg-bg-input border border-border-2 px-2 py-1.5',
        'focus:border-text-1 outline-none font-mono text-[12px] text-text-1 placeholder:text-text-4 resize-y',
        className,
      )}
      {...rest}
    />
  );
});

export const Select = forwardRef(function Select({ className, children, ...rest }, ref) {
  return (
    <select
      ref={ref}
      className={cn(
        'h-9 px-2 bg-bg-input border border-border-2',
        'focus:border-text-1 outline-none font-mono text-[12px] text-text-1 cursor-pointer',
        'appearance-none pr-7',
        className,
      )}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path d='M0 0l5 6 5-6z' fill='%23a0a0a0'/></svg>\")",
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 8px center',
        backgroundSize: '8px 5px',
      }}
      {...rest}
    >
      {children}
    </select>
  );
});

export default Input;
