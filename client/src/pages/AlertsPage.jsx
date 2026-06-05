import { useState } from 'react';
import Card from '../components/ui/Card.jsx';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';
import SeverityPill from '../components/ui/SeverityPill.jsx';
import AlertCard from '../components/alerts/AlertCard.jsx';
import IncidentBoard from '../components/alerts/IncidentBoard.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { Tabs } from '../components/ui/Tabs.jsx';
import { useAlerts } from '../hooks/useAlerts.js';
import { useAlertStore } from '../store/alertStore.js';
import { api } from '../lib/api.js';
import { useAuthStore } from '../store/authStore.js';
import toast from 'react-hot-toast';

const SEV_OPTIONS = ['all', 'critical', 'high', 'medium', 'low'];
const STATUS_OPTIONS = ['all', 'open', 'investigating', 'resolved', 'dismissed'];

export default function AlertsPage() {
  const { alerts, filtered, filters, setFilter } = useAlerts();
  const update = useAlertStore((s) => s.updateAlert);
  const [tab, setTab] = useState('queue');
  const [busy, setBusy] = useState(null);
  const token = useAuthStore((s) => s.token);

  const move = async (id, status) => {
    setBusy(id);
    try {
      const updated = await api.patch(`/alerts/${id}`, { status }, { token });
      if (updated && updated.id) update(updated.id, updated);
      toast.success(`Marked ${status}`);
    } catch (err) {
      toast.error(err.message);
    } finally { setBusy(null); }
  };

  return (
    <div className="p-4 space-y-3">
      <Card
        title="Alert Operations"
        subtitle={`${alerts.length} TOTAL / ${filtered.length} VISIBLE`}
        actions={
          <Tabs
            tabs={[
              { value: 'queue',    label: 'Queue' },
              { value: 'board',    label: 'Incident Board' },
            ]}
            value={tab}
            onChange={setTab}
            className="border-0"
          />
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
          <Input
            placeholder="search title / summary / indicator"
            value={filters.search}
            onChange={(e) => setFilter({ search: e.target.value })}
            prefix="⌕"
          />
          <div className="flex items-center gap-1 flex-wrap">
            {SEV_OPTIONS.map((s) => (
              <Button
                key={s}
                size="sm"
                variant={filters.severity === s ? 'primary' : 'secondary'}
                onClick={() => setFilter({ severity: s })}
              >
                {s}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            {STATUS_OPTIONS.map((s) => (
              <Button
                key={s}
                size="sm"
                variant={filters.status === s ? 'primary' : 'secondary'}
                onClick={() => setFilter({ status: s })}
              >
                {s}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {tab === 'queue' && (
        filtered.length === 0 ? (
          <EmptyState
            title="Queue clear"
            description="No alerts match your current filters. Loosen filters or wait for new events."
            icon="✓"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
            {filtered.map((a) => (
              <div key={a.id} className="space-y-1.5">
                <AlertCard alert={a} />
                <div className="flex items-center gap-1 px-1">
                  <Button size="sm" variant="secondary" disabled={busy === a.id || a.status === 'investigating'} onClick={() => move(a.id, 'investigating')}>
                    Investigate
                  </Button>
                  <Button size="sm" variant="secondary" disabled={busy === a.id || a.status === 'resolved'} onClick={() => move(a.id, 'resolved')}>
                    Resolve
                  </Button>
                  <Button size="sm" variant="ghost" disabled={busy === a.id} onClick={() => move(a.id, 'dismissed')}>
                    Dismiss
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'board' && <IncidentBoard alerts={filtered} onMove={move} />}
    </div>
  );
}
