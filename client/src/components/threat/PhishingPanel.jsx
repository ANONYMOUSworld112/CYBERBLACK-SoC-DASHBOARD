import { useState } from 'react';
import Input from '../ui/Input.jsx';
import Button from '../ui/Button.jsx';
import { api } from '../../lib/api.js';
import { useAuthStore } from '../../store/authStore.js';

export default function PhishingPanel() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const token = useAuthStore((s) => s.token);

  const submit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    setBusy(true);
    try {
      const data = await api.post('/scanner/phishing', { url: url.trim() }, { token });
      setResult(data);
    } catch (err) {
      setResult({ error: err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <form onSubmit={submit} className="flex items-end gap-2">
        <Input
          className="flex-1"
          label="URL to analyze"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://login-secure-paypa1.com/verify"
          disabled={busy}
        />
        <Button type="submit" variant="primary" disabled={busy || !url.trim()}>
          {busy ? 'Analyzing…' : '▸ Analyze'}
        </Button>
      </form>

      {result && !result.error && (
        <div className="border border-border-2 bg-bg-3 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-orbitron text-[14px] tracking-wider2 uppercase text-text-1">
              VERDICT: {result.verdict}
            </span>
            <span className="font-mono text-[10px] text-text-3 uppercase">SCORE: {result.score}/100</span>
          </div>
          <div className="h-1.5 bg-border-1 border border-border-2">
            <div className="h-full bg-text-1" style={{ width: `${result.score}%` }} />
          </div>
          {result.signals?.length > 0 && (
            <ul className="font-mono text-[11px] space-y-1">
              {result.signals.map((s, i) => (
                <li key={i} className="text-text-2 flex items-start gap-2">
                  <span className="text-text-1">▸</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {result?.error && (
        <div className="border border-border-2 bg-bg-3 p-3 font-mono text-[11px] text-text-1">⚠ {result.error}</div>
      )}
    </div>
  );
}
