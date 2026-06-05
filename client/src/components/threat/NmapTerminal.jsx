import { useEffect, useRef, useState } from 'react';
import Input from '../ui/Input.jsx';
import Button from '../ui/Button.jsx';
import Terminal from '../ui/Terminal.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import { api } from '../../lib/api.js';
import { useAuthStore } from '../../store/authStore.js';
import { cn } from '../../lib/cn.js';

const INSECURE_PORTS = new Set([21, 23, 69, 135, 139, 445, 1433, 3389]);

const TEMPLATE = [
  { port: 22,    state: 'open',    service: 'ssh'    },
  { port: 80,    state: 'open',    service: 'http'   },
  { port: 443,   state: 'open',    service: 'https'  },
  { port: 3389,  state: 'open',    service: 'rdp',   insecure: true },
  { port: 8080,  state: 'open',    service: 'http-alt'},
  { port: 21,    state: 'filtered', service: 'ftp'   },
  { port: 25,    state: 'closed',  service: 'smtp'   },
  { port: 3306,  state: 'open',    service: 'mysql'  },
];

function portColor(state, insecure) {
  if (insecure) return 'text-text-1 font-bold';
  if (state === 'open')    return 'text-text-1 font-bold';
  if (state === 'filtered') return 'text-text-5';
  if (state === 'closed')  return 'text-text-4';
  return 'text-text-3';
}

function buildOutput(target, ports) {
  const lines = [];
  lines.push(`Starting Nmap 7.94 ( https://nmap.org ) at ${new Date().toISOString()}`);
  lines.push(`Initiating SYN Stealth Scan against ${target}`);
  lines.push(`Scanning ${target} [${ports.length} ports]`);
  lines.push('Discovered open port on ' + target);
  lines.push('');
  lines.push('PORT       STATE     SERVICE       INFO');
  lines.push('─'.repeat(60));
  for (const p of ports) {
    const port = String(p.port).padEnd(10);
    const state = p.state.padEnd(10);
    const svc = (p.service || '').padEnd(14);
    const info = p.insecure ? '⚠ INSECURE / expose to public' : (p.note || '');
    lines.push(`${port}${state}${svc}${info}`);
  }
  lines.push('');
  lines.push('Nmap done: 1 IP address (1 host up) scanned in ' + (1 + Math.random() * 4).toFixed(2) + ' seconds');
  return lines.join('\n');
}

export default function NmapTerminal({ defaultTarget = '127.0.0.1' }) {
  const [target, setTarget] = useState(defaultTarget);
  const [lines, setLines] = useState([]);
  const [running, setRunning] = useState(false);
  const [ports, setPorts] = useState([]);
  const [error, setError] = useState(null);
  const token = useAuthStore((s) => s.token);
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && lines.length) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [lines]);

  const run = async (e) => {
    e?.preventDefault();
    if (!target.trim()) return;
    setRunning(true);
    setError(null);
    setPorts([]);
    setLines([`> nmap -sS -Pn -T4 ${target}`]);

    try {
      const data = await api.post('/scanner/nmap', { target }, { token });
      if (data.unavailable) {
        setLines((l) => [
          ...l,
          '[!] nmap binary not found on PATH — falling back to SYNTHETIC output',
          '    Install nmap: https://nmap.org/download.html',
        ]);
        const out = buildOutput(target, TEMPLATE);
        for (const chunk of out.split('\n').reduce((acc, _, i, arr) => {
          if (i % 4 === 0) acc.push(arr.slice(i, i + 4));
          return acc;
        }, [])) {
          await new Promise((r) => setTimeout(r, 60));
          setLines((l) => [...l, ...chunk]);
        }
        setPorts(TEMPLATE);
        return;
      }
      for (const ln of (data.output || '').split('\n')) {
        await new Promise((r) => setTimeout(r, 12));
        setLines((l) => [...l, ln]);
      }
      setPorts(data.ports || []);
    } catch (err) {
      setError(err.message);
      setLines((l) => [...l, `error: ${err.message}`]);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-3">
      <form onSubmit={run} className="flex items-end gap-2">
        <Input
          className="flex-1"
          label="Target host / CIDR"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="10.10.10.0/24 or example.com"
          disabled={running}
        />
        <Button type="submit" variant="primary" disabled={running || !target.trim()}>
          {running ? 'Scanning…' : '▸ Run'}
        </Button>
      </form>

      <div ref={ref} className="h-72 overflow-auto bg-void border border-border-2 p-3 font-mono text-[12px] leading-[1.5]">
        {lines.length === 0 ? (
          <EmptyState
            title="No scan executed"
            description="Enter a target and press Run. Output streams here in real time."
            icon="⊕"
            className="border-0 bg-transparent h-full"
          />
        ) : (
          lines.map((l, i) => <div key={i} className="text-text-1 whitespace-pre-wrap">{l}</div>)
        )}
        {running && (
          <div className="flex items-center gap-1 mt-1">
            <span className="inline-block w-2 h-3 bg-text-1 animate-blink-cursor" />
          </div>
        )}
      </div>

      {error && <div className="font-mono text-[11px] text-text-1">⚠ {error}</div>}

      {ports.length > 0 && (
        <div className="border border-border-2 bg-void">
          <div className="px-3 py-1.5 border-b border-border-2 font-orbitron text-[10px] tracking-widest2 uppercase text-text-2">
            Port Inventory
          </div>
          <table className="w-full">
            <thead className="bg-bg-2">
              <tr>
                <th className="text-left font-orbitron text-[10px] tracking-widest2 uppercase text-text-2 px-3 py-1.5">Port</th>
                <th className="text-left font-orbitron text-[10px] tracking-widest2 uppercase text-text-2 px-3 py-1.5">State</th>
                <th className="text-left font-orbitron text-[10px] tracking-widest2 uppercase text-text-2 px-3 py-1.5">Service</th>
                <th className="text-left font-orbitron text-[10px] tracking-widest2 uppercase text-text-2 px-3 py-1.5">Note</th>
              </tr>
            </thead>
            <tbody>
              {ports.map((p) => (
                <tr key={p.port} className="border-t border-border-1">
                  <td className="font-mono text-[12px] text-text-1 px-3 py-1.5">{p.port}</td>
                  <td className={cn('font-mono text-[12px] px-3 py-1.5', portColor(p.state, p.insecure))}>{p.state}</td>
                  <td className="font-mono text-[12px] text-text-2 px-3 py-1.5">{p.service}</td>
                  <td className="font-mono text-[12px] text-text-1 px-3 py-1.5">
                    {p.insecure && <span className="font-bold">⚠ INSECURE</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
