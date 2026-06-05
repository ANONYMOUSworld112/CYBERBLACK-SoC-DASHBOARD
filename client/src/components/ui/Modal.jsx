import { useEffect } from 'react';
import { cn } from '../../lib/cn.js';

export default function Modal({ open, onClose, title, children, footer, size = 'md', className }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[96vw] h-[90vh]',
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-void/85"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative w-full bg-bg-3 border border-border-2 flex flex-col',
          sizes[size],
          className,
        )}
      >
        {title && (
          <header className="flex items-center justify-between px-4 py-2.5 border-b border-border-2">
            <h2 className="font-orbitron text-[11px] tracking-widest2 uppercase text-text-1">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="font-mono text-[14px] text-text-2 hover:text-text-1 px-2"
            >
              ×
            </button>
          </header>
        )}
        <div className="flex-1 overflow-auto p-4">{children}</div>
        {footer && (
          <footer className="px-4 py-2.5 border-t border-border-2 flex items-center justify-end gap-2">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}
