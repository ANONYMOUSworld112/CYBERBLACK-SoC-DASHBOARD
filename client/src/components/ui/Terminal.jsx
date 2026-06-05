import { forwardRef } from 'react';
import { cn } from '../../lib/cn.js';

/**
 * Black terminal panel with white blinking block cursor.
 * Children render as lines; pass <span> children with their own mono styling.
 */
const Terminal = forwardRef(function Terminal({ className, title, children, cursor = true, ...rest }, ref) {
  return (
    <div
      ref={ref}
      className={cn(
        'bg-void border border-border-2 font-mono text-[12px] leading-[1.5] text-text-1',
        'p-3 overflow-auto',
        className,
      )}
      {...rest}
    >
      {title && (
        <div className="flex items-center gap-2 pb-2 mb-2 border-b border-border-1">
          <span className="inline-block w-1.5 h-1.5 bg-text-1" />
          <span className="font-orbitron text-[10px] tracking-widest2 uppercase text-text-2">
            {title}
          </span>
        </div>
      )}
      <pre className="m-0 whitespace-pre-wrap break-words">
        {children}
        {cursor && (
          <span
            aria-hidden
            className="inline-block w-2 h-3 bg-text-1 align-middle ml-0.5 animate-blink-cursor"
          />
        )}
      </pre>
    </div>
  );
});

export default Terminal;
