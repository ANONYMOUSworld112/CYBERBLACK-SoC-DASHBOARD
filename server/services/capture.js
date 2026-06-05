import { db } from '../db.js';
import { broadcast } from '../sockets/index.js';
import { recordAlert } from './alertEngine.js';
import { logger } from '../utils/logger.js';

const INSECURE_PORTS = new Set([21, 23, 69, 135, 139, 445, 1433, 3389, 5900]);
const SOURCES = ['10.0.0.5', '10.0.0.6', '10.0.0.7', '10.0.0.8', '10.0.0.9', '172.16.0.4', '192.168.1.10'];
const TARGETS = ['8.8.8.8', '1.1.1.1', '142.250.74.78', '93.184.216.34', '13.107.42.14', '52.84.150.22'];
const PROTO_PORTS = [
  { proto: 'TCP', port: 80 },
  { proto: 'TCP', port: 443 },
  { proto: 'TCP', port: 22 },
  { proto: 'TCP', port: 3389 },
  { proto: 'TCP', port: 8080 },
  { proto: 'UDP', port: 53 },
  { proto: 'UDP', port: 123 },
  { proto: 'ICMP' },
  { proto: 'TCP', port: 25 },
];

let mock = true;
let pps = 0;
let recentPackets = [];
let lastEmit = 0;
let lastBandwidthTick = 0;

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function generatePacket() {
  const spec = rand(PROTO_PORTS);
  const insecure = spec.port ? INSECURE_PORTS.has(spec.port) : false;
  const state = Math.random() < 0.7 ? 'open' : (Math.random() < 0.5 ? 'filtered' : 'closed');
  return {
    ts: Date.now(),
    src: rand(SOURCES),
    dst: rand(TARGETS),
    proto: spec.proto,
    port: spec.port || null,
    state,
    insecure: insecure ? 1 : 0,
    note: insecure ? 'exposed-service' : '',
  };
}

function emitBatch() {
  if (!recentPackets.length) return;
  broadcast('packet:capture', recentPackets);
  const now = Date.now();
  if (now - lastBandwidthTick > 1000) {
    const bytes = recentPackets.length * 1200;
    broadcast('bandwidth:tick', { t: now, rx: bytes, tx: Math.floor(bytes * 0.4) });
    lastBandwidthTick = now;
    pps = recentPackets.length;
  }
  maybeAlert(recentPackets);
  recentPackets = [];
}

function maybeAlert(pkts) {
  const insecure = pkts.filter((p) => p.insecure);
  if (insecure.length >= 3) {
    recordAlert({
      severity: 'high',
      source: 'packet-engine',
      title: `Insecure service contact from ${insecure[0].src}`,
      summary: `${insecure.length} hits to known-insecure ports in last batch`,
      indicator: insecure[0].src,
    });
  }
  const rdp = pkts.filter((p) => p.port === 3389);
  if (rdp.length >= 5) {
    recordAlert({
      severity: 'critical',
      source: 'packet-engine',
      title: `RDP burst from ${rdp[0].src}`,
      summary: `${rdp.length} packets targeting TCP/3389 in 1s`,
      indicator: rdp[0].src,
    });
  }
}

export function startCapture() {
  mock = true;
  setInterval(() => {
    const burst = Array.from({ length: 8 + Math.floor(Math.random() * 16) }, generatePacket);
    try {
      const ins = db.prepare(`
        INSERT INTO packets (ts, src, dst, proto, port, state, insecure, note)
        VALUES (@ts, @src, @dst, @proto, @port, @state, @insecure, @note)
      `);
      for (const r of burst) ins.run(r);
    } catch (err) {
      logger.warn('packet insert failed', { err: err.message });
    }
    recentPackets.push(...burst);
    const now = Date.now();
    if (now - lastEmit > 1000) {
      emitBatch();
      lastEmit = now;
    }
  }, 250);

  logger.info('packet capture started (mock generator)', { source: 'mock' });
}

export function getCaptureStatus() {
  return { source: mock ? 'mock' : 'pcap', running: true, pps };
}
