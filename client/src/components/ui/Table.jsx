import { cn } from '../../lib/cn.js';

/**
 * Flat black, no zebra striping, no rounded corners.
 * Header row uses Orbitron uppercase; data rows use JetBrains Mono.
 */
export default function Table({ columns, rows, empty, className, rowKey = 'id', onRowClick, dense = false }) {
  if (!rows?.length) {
    return (
      <div className="border border-border-2 bg-void">
        {empty || (
          <div className="px-4 py-8 text-center font-mono text-[11px] text-text-3 uppercase">
            NO RECORDS
          </div>
        )}
      </div>
    );
  }
  return (
    <div className={cn('border border-border-2 bg-void overflow-auto', className)}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-bg-2">
            {columns.map((c) => (
              <th
                key={c.key}
                className={cn(
                  'text-left font-orbitron text-[10px] tracking-widest2 uppercase text-text-2',
                  'px-3 py-2 border-b border-border-1',
                  c.align === 'right' && 'text-right',
                  c.align === 'center' && 'text-center',
                )}
                style={c.width ? { width: c.width } : undefined}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r[rowKey]}
              onClick={onRowClick ? () => onRowClick(r) : undefined}
              className={cn(
                'hover:bg-bg-2 transition-colors',
                onRowClick && 'cursor-pointer',
              )}
            >
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={cn(
                    'font-mono text-[12px] text-text-1 border-b border-border-1 whitespace-nowrap',
                    dense ? 'px-3 py-1.5' : 'px-3 py-2',
                    c.align === 'right' && 'text-right',
                    c.align === 'center' && 'text-center',
                    c.mono === false && 'font-rajdhani',
                    c.dim && 'text-text-3',
                  )}
                >
                  {c.render ? c.render(r) : r[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
