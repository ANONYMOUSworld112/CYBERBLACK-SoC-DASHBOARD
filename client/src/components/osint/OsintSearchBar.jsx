import { useState } from 'react';
import Input from '../ui/Input.jsx';
import Button from '../ui/Button.jsx';

export default function OsintSearchBar({ onLookup, busy = false }) {
  const [indicator, setIndicator] = useState('');
  const submit = (e) => {
    e.preventDefault();
    if (!indicator.trim()) return;
    onLookup?.(indicator.trim());
  };
  return (
    <form onSubmit={submit} className="flex items-end gap-2">
      <Input
        className="flex-1"
        label="Indicator"
        value={indicator}
        onChange={(e) => setIndicator(e.target.value)}
        placeholder="8.8.8.8, example.com, 44d88612fea8a8f36de82e1278abb02f…"
        disabled={busy}
      />
      <Button type="submit" variant="primary" disabled={busy || !indicator.trim()}>
        {busy ? 'Running…' : '▸ Lookup'}
      </Button>
    </form>
  );
}
