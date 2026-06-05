import si from 'systeminformation';
import { logger } from '../utils/logger.js';

let cache = null;
let cacheTs = 0;

export async function getHealth() {
  const now = Date.now();
  if (cache && now - cacheTs < 1500) return cache;
  try {
    const [cpu, mem, fs, os, load, currentLoad] = await Promise.all([
      si.cpu(),
      si.mem(),
      si.fsSize(),
      si.osInfo(),
      si.currentLoad().catch(() => ({ avgLoad: 0 })),
      Promise.resolve(),
    ]);
    const total = mem.total || 1;
    const used = mem.active || mem.used || 0;
    const main = (fs[0] || {});
    cache = {
      cpu: Math.round(currentLoad?.currentLoad ?? load.avgLoad ?? 0),
      cpus: cpu,
      memory: Math.round((used / total) * 100),
      memoryTotal: total,
      memoryAvailable: mem.available,
      disk: Math.round(main.use || 0),
      diskPath: main.mount || main.fs || '/',
      uptime: si.time().uptime || 0,
      hostname: os.hostname || 'node-01',
      os: `${os.distro || os.platform} ${os.release || ''}`.trim(),
      loadavg: [load.avgLoad || 0, 0, 0],
    };
    cacheTs = now;
    return cache;
  } catch (err) {
    logger.warn('health snapshot failed', { err: err.message });
    return cache || {
      cpu: 0, memory: 0, memoryTotal: 0, disk: 0, uptime: 0,
      hostname: 'unknown', os: 'unknown', loadavg: [0, 0, 0],
    };
  }
}
