import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Card from '../ui/Card.jsx';
import Spinner from '../ui/Spinner.jsx';
import { SEVERITY_DASH, SEVERITY_WEIGHT } from '../../utils/severity.js';

const PRIMARY = [20.5937, 78.9629]; // world centroid fallback
const NODE = [37.7749, -122.4194];  // primary monitored node

const FAKE_THREATS = [
  { id: 't1', severity: 'critical', from: NODE,            to: [55.7558, 37.6173] },
  { id: 't2', severity: 'high',     from: NODE,            to: [39.9042, 116.4074] },
  { id: 't3', severity: 'medium',   from: NODE,            to: [35.6895, 139.6917] },
  { id: 't4', severity: 'low',      from: NODE,            to: [-33.8688, 151.2093] },
  { id: 't5', severity: 'high',     from: NODE,            to: [-23.5505, -46.6333] },
];

function pulseIcon(L) {
  return L.divIcon({
    className: 'soc-node',
    html: `
      <div style="position:relative;width:18px;height:18px;">
        <div style="position:absolute;inset:0;border:1px solid #ffffff;animation:pulse-node 1.6s ease-in-out infinite;"></div>
        <div style="position:absolute;left:6px;top:6px;width:6px;height:6px;background:#ffffff;animation:pulse-node-core 1.6s ease-in-out infinite;"></div>
      </div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

export default function NetworkMap({ height = 480, threats = FAKE_THREATS }) {
  const icon = useMemo(() => pulseIcon(L), []);

  return (
    <Card
      title="Threat Geography"
      subtitle="LIVE / OPENSTREETMAP DARK"
      actions={
        <span className="font-mono text-[10px] text-text-3 uppercase flex items-center gap-2">
          <Spinner size={10} /> TRACKING {threats.length} ROUTES
        </span>
      }
      className="overflow-hidden"
    >
      <div style={{ height }} className="-m-4 -mt-0">
        <MapContainer
          center={PRIMARY}
          zoom={2}
          minZoom={2}
          maxZoom={8}
          scrollWheelZoom
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; OpenStreetMap &copy; CARTO'
          />
          {icon && (
            <Marker position={NODE} icon={icon}>
              <Popup>
                <div className="font-mono text-[11px]">
                  <div className="font-orbitron text-[10px] tracking-widest2 uppercase text-text-1 mb-1">
                    Monitored Node
                  </div>
                  <div className="text-text-2">PRIMARY-EDGE-01</div>
                  <div className="text-text-3">37.7749, -122.4194</div>
                </div>
              </Popup>
            </Marker>
          )}
          <CircleMarker center={NODE} radius={28} pathOptions={{ color: '#ffffff', weight: 1, fillOpacity: 0.05, fillColor: '#ffffff' }} />
          {threats.map((t) => (
            <Polyline
              key={t.id}
              positions={[t.from, t.to]}
              pathOptions={{
                color: '#ffffff',
                weight: SEVERITY_WEIGHT[t.severity],
                dashArray: SEVERITY_DASH[t.severity],
                opacity: t.severity === 'critical' ? 1 : t.severity === 'high' ? 0.8 : 0.5,
              }}
            >
              <Popup>
                <div className="font-mono text-[11px]">
                  <div className="font-orbitron text-[10px] tracking-widest2 uppercase text-text-1">
                    {t.severity} ROUTE
                  </div>
                  <div className="text-text-3">
                    {t.to[0].toFixed(2)}, {t.to[1].toFixed(2)}
                  </div>
                </div>
              </Popup>
            </Polyline>
          ))}
        </MapContainer>
      </div>
      <div className="absolute bottom-2 left-2 z-[400] bg-void/80 border border-border-2 px-2 py-1 font-mono text-[9px] text-text-3 uppercase">
        Critical ──── High ┄┄┄ Medium ┄ ┄ Low ·······
      </div>
    </Card>
  );
}
