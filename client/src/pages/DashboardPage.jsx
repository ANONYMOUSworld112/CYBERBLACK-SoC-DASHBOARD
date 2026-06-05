import { useEffect } from 'react';
import Card from '../components/ui/Card.jsx';
import RiskGauge from '../components/analytics/RiskGauge.jsx';
import SystemHealth from '../components/analytics/SystemHealth.jsx';
import BandwidthChart from '../components/network/BandwidthChart.jsx';
import ProtocolDonut from '../components/network/ProtocolDonut.jsx';
import ThreatIntelFeed from '../components/threat/ThreatIntelFeed.jsx';
import AlertPanel from '../components/alerts/AlertPanel.jsx';
import { useAlerts } from '../hooks/useAlerts.js';
import { useNetwork } from '../hooks/useNetwork.js';
import { useSystem } from '../hooks/useSystem.js';
import { computeRisk } from '../utils/riskCalculator.js';
import { formatNumber } from '../utils/formatters.js';

function Metric({ label, value, sub }) {
  return (
    <div className="border border-border-2 bg-bg-3 px-3 py-2">
      <div className="font-orbitron text-xl text-text-1 leading-none">{value}</div>
      <div className="font-mono text-[10px] text-text-3 uppercase mt-1">{label}</div>
      {sub && <div className="font-mono text-[9px] text-text-4 mt-0.5 uppercase">{sub}</div>}
    </div>
  );
}

export default function DashboardPage() {
  const { alerts } = useAlerts();
  const { bandwidthHistory, topTalkers, protocols, packets, capture } = useNetwork();
  const health = useSystem();
  const risk = computeRisk(alerts);
  const counts = {
    critical: alerts.filter((a) => a.severity === 'critical' && a.status === 'open').length,
    open:     alerts.filter((a) => a.status === 'open').length,
    hosts:    new Set(packets.map((p) => p.src)).size,
  };

  return (
    <div className="p-4 space-y-3">
      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Metric label="Risk Index"   value={risk} sub="0-100 scale" />
        <Metric label="Open Alerts"  value={formatNumber(counts.open)} />
        <Metric label="Critical"     value={formatNumber(counts.critical)} sub="Unresolved" />
        <Metric label="Active Hosts" value={formatNumber(counts.hosts)} sub={`${capture.source} capture`} />
        <Metric label="PPS"          value={formatNumber(capture.pps || 0)} sub="packets/sec" />
      </div>

      <div className="grid grid-cols-12 gap-3">
        <Card className="col-span-12 md:col-span-3" title="Posture">
          <div className="flex items-center justify-center py-2">
            <RiskGauge value={risk} size={220} />
          </div>
        </Card>
        <div className="col-span-12 md:col-span-9">
          <AlertPanel alerts={alerts} title="Live Alerts" limit={6} />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 md:col-span-5">
          <BandwidthChart data={bandwidthHistory} />
        </div>
        <div className="col-span-12 md:col-span-3">
          <ProtocolDonut data={protocols} />
        </div>
        <div className="col-span-12 md:col-span-4">
          <SystemHealth health={health} />
        </div>
      </div>

      <ThreatIntelFeed />
    </div>
  );
}
