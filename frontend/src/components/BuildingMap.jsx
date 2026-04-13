import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { formatGallons, formatSqft } from '../utils/formatters';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function pinColor(score) {
  if (score >= 70) return '#10b981'; // emerald-500
  if (score >= 50) return '#f59e0b'; // amber-500
  return '#ef4444';                  // red-500
}

function pinRadius(score) {
  if (score >= 70) return 7;
  if (score >= 50) return 6;
  return 5;
}

/**
 * Build an HTML string for the Leaflet popup.
 * Using HTML strings (not React elements) because the markers are
 * managed by raw Leaflet inside MarkerClusterGroup.
 */
function buildPopupHTML(b) {
  const score     = Number(b.final_viability_score || 0);
  const scoreColor = score >= 70 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
  const name      = b.name || b.id || 'Unknown';
  const cityState = [b.city, b.state].filter(Boolean).join(', ');
  const oppType   = b.opportunity_type || 'Balanced Opportunity';
  const roof      = formatSqft(b.roof_area_sqft);
  const harvest   = formatGallons(b.annual_capture_gallons);

  const conf     = b.cooling_confidence != null ? Number(b.cooling_confidence) : null;
  const confPct  = conf != null ? Math.round(conf * 100) : null;
  const confColor = conf != null
    ? (conf >= 0.8 ? '#10b981' : conf >= 0.6 ? '#f59e0b' : '#ef4444')
    : '#52525b';

  const confHTML = conf != null ? `
    <div style="margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;font-size:10px;color:#52525b;margin-bottom:3px">
        <span>AI COOLING CONFIDENCE</span>
        <span style="color:${confColor};font-weight:700">${confPct}%</span>
      </div>
      <div style="height:4px;background:#27272a;border-radius:2px;overflow:hidden">
        <div style="height:100%;width:${confPct}%;background:${confColor};border-radius:2px"></div>
      </div>
    </div>` : '';

  return `
    <div style="min-width:220px;font-family:Inter,system-ui,sans-serif">
      <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:8px">
        <div style="flex-shrink:0;width:44px;height:44px;border-radius:6px;background:${scoreColor}18;
                    border:1px solid ${scoreColor}40;display:flex;align-items:center;justify-content:center;
                    font-size:15px;font-weight:700;color:${scoreColor};font-family:Outfit,Inter,sans-serif">
          ${score.toFixed(0)}
        </div>
        <div style="flex:1;min-width:0">
          <div style="font-weight:600;font-size:13px;color:#f4f4f5;line-height:1.3;margin-bottom:2px">${name}</div>
          <div style="font-size:11px;color:#71717a">${cityState}</div>
        </div>
      </div>
      <div style="display:inline-block;font-size:10px;padding:2px 8px;border-radius:999px;
                  background:#18181b;border:1px solid #27272a;color:#a1a1aa;margin-bottom:10px;
                  letter-spacing:.04em;text-transform:uppercase">${oppType}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 12px;font-size:11px;margin-bottom:10px">
        <div>
          <div style="color:#52525b;margin-bottom:1px">ROOF AREA</div>
          <div style="color:#d4d4d8;font-weight:600">${roof}</div>
        </div>
        <div>
          <div style="color:#52525b;margin-bottom:1px">HARVEST / YR</div>
          <div style="color:#38bdf8;font-weight:600">${harvest}</div>
        </div>
      </div>
      ${confHTML}
      <a href="/buildings/${b.id}"
         style="display:block;width:100%;padding:6px 0;background:#18181b;border:1px solid #27272a;
                border-radius:6px;color:#10b981;font-size:11px;font-weight:600;cursor:pointer;
                letter-spacing:.04em;text-align:center;text-decoration:none">
        VIEW FULL PROFILE →
      </a>
    </div>`;
}

// ---------------------------------------------------------------------------
// ClusterLayer — manages MarkerClusterGroup via raw Leaflet inside useMap
// ---------------------------------------------------------------------------

function ClusterLayer({ buildings }) {
  const map = useMap();
  const mcgRef = useRef(null);

  useEffect(() => {
    if (!map) return;

    // Remove previous cluster group
    if (mcgRef.current) {
      map.removeLayer(mcgRef.current);
    }

    const mcg = L.markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 60,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      iconCreateFunction(cluster) {
        const count = cluster.getChildCount();
        const size  = count >= 100 ? 48 : count >= 10 ? 40 : 32;
        const color = '#10b981';
        return L.divIcon({
          html: `<div style="
            width:${size}px;height:${size}px;border-radius:50%;
            background:${color}22;border:2px solid ${color}88;
            display:flex;align-items:center;justify-content:center;
            color:${color};font-size:${count >= 100 ? 11 : 12}px;font-weight:700;
            font-family:monospace;box-shadow:0 0 10px ${color}44">
            ${count}
          </div>`,
          className: '',
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });
      },
    });

    buildings.forEach((b) => {
      const lat = Number(b.latitude);
      const lng = Number(b.longitude);
      if (!lat || !lng) return;

      const score = Number(b.final_viability_score || 0);
      const color = pinColor(score);

      const marker = L.circleMarker([lat, lng], {
        radius:      pinRadius(score),
        fillColor:   color,
        fillOpacity: 0.9,
        color:       '#000',
        weight:      0.8,
      });

      marker.bindPopup(buildPopupHTML(b), { maxWidth: 270 });
      mcg.addLayer(marker);
    });

    map.addLayer(mcg);
    mcgRef.current = mcg;

    return () => {
      if (mcgRef.current) {
        map.removeLayer(mcgRef.current);
        mcgRef.current = null;
      }
    };
  }, [map, buildings]);

  return null;
}

// ---------------------------------------------------------------------------
// FlyToState — animates the map when state filter changes
// ---------------------------------------------------------------------------

function FlyToState({ buildings, selectedState }) {
  const map = useMap();

  useEffect(() => {
    if (!selectedState) {
      map.flyTo([37.8, -96], 4, { duration: 1.2 });
      return;
    }

    const stateBuildings = buildings.filter(
      (b) => b.state?.toLowerCase() === selectedState.toLowerCase()
    );
    if (!stateBuildings.length) return;

    const lats = stateBuildings.map((b) => Number(b.latitude)).filter(Boolean);
    const lngs = stateBuildings.map((b) => Number(b.longitude)).filter(Boolean);
    if (!lats.length) return;

    map.fitBounds(
      [
        [Math.min(...lats), Math.min(...lngs)],
        [Math.max(...lats), Math.max(...lngs)],
      ],
      { padding: [50, 50], maxZoom: 9, duration: 1.2 }
    );
  }, [selectedState, buildings, map]);

  return null;
}

// ---------------------------------------------------------------------------
// Legend overlay
// ---------------------------------------------------------------------------

function MapLegend() {
  const items = [
    { color: '#10b981', label: 'Score ≥ 70' },
    { color: '#f59e0b', label: 'Score 50–69' },
    { color: '#ef4444', label: 'Score < 50' },
  ];
  return (
    <div style={{
      position: 'absolute', bottom: 32, left: 12, zIndex: 1000,
      background: 'rgba(9,9,11,0.88)', border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 8, padding: '10px 14px', display: 'flex',
      flexDirection: 'column', gap: 6, backdropFilter: 'blur(8px)',
    }}>
      <div style={{ fontSize: 9, letterSpacing: '.1em', color: '#52525b',
                    textTransform: 'uppercase', marginBottom: 2, fontFamily: 'monospace' }}>
        Viability Score
      </div>
      {items.map(({ color, label }) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: color,
                        flexShrink: 0, boxShadow: `0 0 6px ${color}80` }} />
          <span style={{ fontSize: 11, color: '#a1a1aa' }}>{label}</span>
        </div>
      ))}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: 4, paddingTop: 6,
                    fontSize: 10, color: '#52525b', fontFamily: 'monospace' }}>
        Clusters auto-group nearby pins
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export default function BuildingMap({ buildings, selectedState }) {
  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <MapContainer
        center={[37.8, -96]}
        zoom={4}
        style={{ height: '100%', width: '100%', background: '#09090b' }}
        scrollWheelZoom
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          maxZoom={19}
        />

        <FlyToState buildings={buildings} selectedState={selectedState} />
        <ClusterLayer buildings={buildings} />
      </MapContainer>

      <MapLegend />
    </div>
  );
}
