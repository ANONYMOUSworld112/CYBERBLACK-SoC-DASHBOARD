import { Tabs } from '../ui/Tabs.jsx';
import Spinner from '../ui/Spinner.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import { useState } from 'react';

const KIND_LABEL = {
  whois: 'WHOIS',
  dns: 'DNS',
  shodan: 'SHODAN',
  threat: 'THREAT INTEL',
};

function ResultPanel({ data, loading, label }) {
  if (loading) {
    return (
      <div className="font-mono text-[11px] text-text-2 flex items-center gap-2 py-6 justify-center">
        <Spinner size={12} /> QUERYING {label}…
      </div>
    );
  }
  if (!data) {
    return <EmptyState title={`No ${label} data`} description="Run a lookup to populate this panel." icon="∅" />;
  }
  if (data.error) {
    return (
      <div className="font-mono text-[11px] text-text-1 border border-border-2 bg-bg-3 p-3">
        ⚠ {data.error}
      </div>
    );
  }
  return (
    <pre className="font-mono text-[11px] text-text-1 bg-void border border-border-2 p-3 overflow-auto max-h-96 whitespace-pre-wrap">
{JSON.stringify(data, null, 2)}
    </pre>
  );
}

export default function OsintDrawer({ results, loading, onTab, active }) {
  const tabs = ['whois', 'dns', 'shodan', 'threat'].map((k) => ({
    value: k,
    label: KIND_LABEL[k],
  }));
  return (
    <div>
      <Tabs tabs={tabs} value={active} onChange={onTab} />
      <div className="pt-3">
        <ResultPanel data={results[active]} loading={loading[active]} label={KIND_LABEL[active]} />
      </div>
    </div>
  );
}
