import { useState } from 'react';
import Card from '../components/ui/Card.jsx';
import OsintSearchBar from '../components/osint/OsintSearchBar.jsx';
import OsintDrawer from '../components/osint/OsintDrawer.jsx';
import Table from '../components/ui/Table.jsx';
import { useOsint } from '../hooks/useOsint.js';
import { relativeTime } from '../utils/formatters.js';

export default function OsintPage() {
  const osint = useOsint();
  const [tab, setTab] = useState('whois');
  const [busy, setBusy] = useState(false);

  const run = async (indicator) => {
    setBusy(true);
    osint.clear();
    osint.setIndicator(indicator);
    try {
      await Promise.allSettled([
        osint.lookup('whois', indicator),
        osint.lookup('dns', indicator),
        osint.lookup('shodan', indicator),
        osint.lookup('threat', indicator),
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-4 space-y-3">
      <Card title="OSINT Lookup" subtitle="WHOIS / DNS / SHODAN / THREAT INTEL">
        <OsintSearchBar onLookup={run} busy={busy} />
        {osint.indicator && (
          <div className="mt-3 font-mono text-[11px] text-text-3">
            ACTIVE INDICATOR: <span className="text-text-1">{osint.indicator}</span>
          </div>
        )}
      </Card>

      <Card title="Indicator Results">
        <OsintDrawer
          results={osint.results}
          loading={osint.loading}
          active={tab}
          onTab={setTab}
        />
      </Card>

      <Card title="Recent Lookups">
        <Table
          dense
          columns={[
            { key: 'indicator', label: 'Indicator' },
            { key: 'kind',      label: 'Kind' },
            { key: 'ts',        label: 'When', render: (r) => relativeTime(r.ts) },
          ]}
          rows={osint.history}
          empty="No lookups yet"
        />
      </Card>
    </div>
  );
}
