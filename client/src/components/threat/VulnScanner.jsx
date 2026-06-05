import { useState } from 'react';
import Input, { Select } from '../ui/Input.jsx';
import Button from '../ui/Button.jsx';
import Table from '../ui/Table.jsx';
import SeverityPill from '../ui/SeverityPill.jsx';
import { api } from '../../lib/api.js';
import { useAuthStore } from '../../store/authStore.js';

const PROFILES = [
  { value: 'quick',  label: 'Quick (top 100 ports)' },
  { value: 'full',   label: 'Full (1-65535)' },
  { value: 'web',    label: 'Web (HTTP/HTTPS only)' },
  { value: 'heart',  label: 'Heartbleed check' },
];

export default function VulnScanner() {
  const [target, setTarget] = useState('');
  const [profile, setProfile] = useState('quick');
  const [findings, setFindings] = useState([]);
  const [running, setRunning] = useState(false);
  const token = useAuthStore((s) => s.token);

  const submit = async (e) => {
    e.preventDefault();
    if (!target.trim()) return;
    setRunning(true);
    setFindings([]);
    try {
      const data = await api.post('/scanner/vuln', { target, profile }, { token });
      setFindings(data.findings || []);
    } catch { setFindings([]); }
    finally { setRunning(false); }
  };

  return (
    <div className="space-y-3">
      <form onSubmit={submit} className="grid grid-cols-12 gap-2">
        <div className="col-span-7">
          <Input
            label="Target"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="https://app.example.com or 10.0.0.5"
            disabled={running}
          />
        </div>
        <div className="col-span-3">
          <Select
            className="w-full"
            value={profile}
            onChange={(e) => setProfile(e.target.value)}
            disabled={running}
          >
            {PROFILES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </Select>
        </div>
        <div className="col-span-2 flex items-end">
          <Button variant="primary" type="submit" className="w-full" disabled={running || !target.trim()}>
            {running ? '…' : '▸ Scan'}
          </Button>
        </div>
      </form>

      <Table
        dense
        columns={[
          { key: 'severity', label: 'Sev', render: (r) => <SeverityPill severity={r.severity} size="sm" /> },
          { key: 'cve',      label: 'CVE / ID', mono: true },
          { key: 'title',    label: 'Title' },
          { key: 'port',     label: 'Port', align: 'right' },
          { key: 'cvss',     label: 'CVSS', align: 'right' },
        ]}
        rows={findings}
        empty={running ? 'Scanning…' : 'No findings yet — run a scan to begin.'}
      />
    </div>
  );
}
