import { cn } from '../../lib/cn.js';

export default function Spinner({ size = 14, className }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn('inline-block', className)}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        className="animate-spin"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="9" opacity="0.2" />
        <path d="M21 12a9 9 0 0 0-9-9" strokeLinecap="square" />
      </svg>
    </span>
  );
}
