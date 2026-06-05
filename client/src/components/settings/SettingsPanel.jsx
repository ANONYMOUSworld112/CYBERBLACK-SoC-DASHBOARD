import { useState } from 'react';
import Card from '../ui/Card.jsx';
import Input from '../ui/Input.jsx';
import Button from '../ui/Button.jsx';
import { useSettingsStore } from '../../store/settingsStore.js';
import { useAuthStore } from '../../store/authStore.js';
import { api } from '../../lib/api.js';
import toast from 'react-hot-toast';

function Section({ title, children, action }) {
  return (
    <Card
      title={title}
      actions={action}
    >
      {children}
    </Card>
  );
}

function Field({ label, children, hint }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-orbitron text-[10px] tracking-widest2 uppercase text-text-2">{label}</span>
      {children}
      {hint && <span className="font-mono text-[10px] text-text-3">{hint}</span>}
    </label>
  );
}

export default function SettingsPanel() {
  const settings = useSettingsStore((s) => s.settings);
  const save = useSettingsStore((s) => s.save);
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const [pwForm, setPwForm] = useState({ current: '', next: '' });
  const [pwBusy, setPwBusy] = useState(false);

  const update = (patch) => save(patch);

  const changePassword = async (e) => {
    e.preventDefault();
    if (!pwForm.current || !pwForm.next) return;
    setPwBusy(true);
    try {
      await api.post('/auth/change-password', pwForm, { token });
      toast.success('Password updated');
      setPwForm({ current: '', next: '' });
    } catch (err) {
      toast.error(err.message || 'Password change failed');
    } finally {
      setPwBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <Section title="Operator Profile">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Username">
            <Input value={user?.username || ''} readOnly />
          </Field>
          <Field label="Email">
            <Input value={user?.email || ''} readOnly />
          </Field>
          <Field label="Role">
            <Input value={user?.role || 'analyst'} readOnly />
          </Field>
          <Field label="2FA">
            <Input value={user?.totp_enabled ? 'ENABLED' : 'NOT ENROLLED'} readOnly />
          </Field>
        </div>
      </Section>

      <Section
        title="Security"
        action={<span className="font-mono text-[10px] text-text-3 uppercase">REQUIRES RE-LOGIN</span>}
      >
        <form onSubmit={changePassword} className="grid grid-cols-2 gap-3">
          <Field label="Current passphrase">
            <Input
              type="password"
              value={pwForm.current}
              onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })}
              autoComplete="current-password"
            />
          </Field>
          <Field label="New passphrase">
            <Input
              type="password"
              value={pwForm.next}
              onChange={(e) => setPwForm({ ...pwForm, next: e.target.value })}
              autoComplete="new-password"
            />
          </Field>
          <div className="col-span-2 flex justify-end">
            <Button type="submit" variant="primary" disabled={pwBusy || !pwForm.current || !pwForm.next}>
              {pwBusy ? 'Updating…' : 'Update passphrase'}
            </Button>
          </div>
        </form>
      </Section>

      <Section title="Classification">
        <Field label="Banner label" hint="Shown in the TopBar classification badge.">
          <Input
            value={settings.classification}
            onChange={(e) => update({ classification: e.target.value.toUpperCase() })}
          />
        </Field>
      </Section>

      <Section title="API Keys">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Field label="VirusTotal">
            <Input
              type="password"
              value={settings.apiKeys.vt}
              onChange={(e) => update({ apiKeys: { ...settings.apiKeys, vt: e.target.value } })}
              placeholder="••••••••••••"
            />
          </Field>
          <Field label="Shodan">
            <Input
              type="password"
              value={settings.apiKeys.shodan}
              onChange={(e) => update({ apiKeys: { ...settings.apiKeys, shodan: e.target.value } })}
              placeholder="••••••••••••"
            />
          </Field>
          <Field label="AbuseIPDB">
            <Input
              type="password"
              value={settings.apiKeys.abuseipdb}
              onChange={(e) => update({ apiKeys: { ...settings.apiKeys, abuseipdb: e.target.value } })}
              placeholder="••••••••••••"
            />
          </Field>
        </div>
      </Section>
    </div>
  );
}
