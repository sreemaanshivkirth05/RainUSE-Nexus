/**
 * StateInsightsMap — Leaflet map for the State Insights page.
 *
 * Features:
 *   - ESRI satellite base layer (default) + OpenStreetMap street layer
 *   - Layer toggle overlay (Satellite | Streets)
 *   - MarkerClusterGroup with score-coloured circle pins
 *   - Popup: name, address, score badge, opportunity type, roof, harvest,
 *     100k+ flag, "View Full Details" button
 *   - FlyToState animation when stateCode changes
 *   - Score legend
 */

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { formatGallons, formatSqft } from '../utils/formatters';

// ---------------------------------------------------------------------------
// Tile layer URLs
// ---------------------------------------------------------------------------

const TILES = {
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 19,
  },
  streets: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19,
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function pinColor(score) {
  if (score >= 70) return '#10b981';
  if (score >= 50) return '#f59e0b';
  return '#ef4444';
}

function pinRadius(score) {
  if (score >= 70) return 8;
  if (score >= 50) return 7;
  return 6;
}

function buildPopupHTML(b) {
  const score      = Number(b.final_viability_score || 0);
  const scoreColor = pinColor(score);
  const name       = b.building_name || b.name || b.id || 'Unknown';
  const address    = b.short_address || [b.city, b.state].filter(Boolean).join(', ');
  const oppType    = b.opportunity_type || 'Balanced Opportunity';
  const roof       = formatSqft(b.roof_area_sqft);
  const harvest    = formatGallons(b.annual_capture_gallons);
  const is100k     = b.roof_over_100k;

  return `
    <div style="min-width:230px;font-family:Inter,system-ui,sans-serif">
      <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:10px">
        <div style="flex-shrink:0;width:44px;height:44px;border-radius:6px;
                    background:${scoreColor}18;border:1px solid ${scoreColor}44;
                    display:flex;align-items:center;justify-content:center;
                    font-size:15px;font-weight:700;color:${scoreColor};font-family:Outfit,Inter,sans-serif">
          ${score.toFixed(0)}
        </div>
        <div style="flex:1;min-width:0">
          <div style="font-weight:600;font-size:13px;color:#f4f4f5;line-height:1.3;margin-bottom:2px;
                      white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${name}</div>
          <div style="font-size:11px;color:#71717a">${address}</div>
        </div>
      </div>

      <div style="display:inline-block;font-size:10px;padding:2px 8px;border-radius:999px;
                  background:#18181b;border:1px solid #27272a;color:#a1a1aa;margin-bottom:10px;
                  letter-spacing:.04em;text-transform:uppercase">${oppType}</div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 12px;font-size:11px;margin-bottom:10px">
        <div>
          <div style="color:#52525b;margin-bottom:1px">ROOF AREA</div>
          <div style="color:#d4d4d8;font-weight:600">
            ${roof}${is100k ? ' <span style="color:#f59e0b;font-size:9px">★100K+</span>' : ''}
          </div>
        </div>
        <div>
          <div style="color:#52525b;margin-bottom:1px">HARVEST / YR</div>
          <div style="color:#38bdf8;font-weight:600">${harvest}</div>
        </div>
      </div>

      <a href="/buildings/${b.id}"
         style="display:block;width:100%;padding:7px 0;background:#18181b;border:1px solid #27272a;
                border-radius:6px;color:#10b981;font-size:11px;font-weight:600;cursor:pointer;
                letter-spacing:.04em;text-align:center;text-decoration:none">
        VIEW FULL DETAILS →
      </a>
    </div>`;
}

// ---------------------------------------------------------------------------
// ClusterLayer — manages MarkerClusterGroup inside useMap
// ---------------------------------------------------------------------------

function ClusterLayer({ buildings }) {
  const map    = useMap();
  const mcgRef = useRef(null);

  useEffect(() => {
    if (!map) return;
    if (mcgRef.current) map.removeLayer(mcgRef.current);

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
      marker.bindPopup(buildPopupHTML(b), { maxWidth: 280 });
      mcg.addLayer(marker);
    });

    map.addLayer(mcg);
    mcgRef.current = mcg;

    return () => {
      if (mcgRef.current) { map.removeLayer(mcgRef.current); mcgRef.current = null; }
    };
  }, [map, buildings]);

  return null;
}

// ---------------------------------------------------------------------------
// FlyToState — zoom to state bounds
// ---------------------------------------------------------------------------

function FlyToState({ buildings, stateCode }) {
  const map = useMap();

  useEffect(() => {
    if (!stateCode) {
      map.flyTo([37.8, -96], 4, { duration: 1.2 });
      return;
    }
    const lats = buildings.map((b) => Number(b.latitude)).filter(Boolean);
    const lngs = buildings.map((b) => Number(b.longitude)).filter(Boolean);
    if (!lats.length) return;
    map.fitBounds(
      [[Math.min(...lats), Math.min(...lngs)], [Math.max(...lats), Math.max(...lngs)]],
      { padding: [50, 50], maxZoom: 10, duration: 1.2 }
    );
  }, [stateCode, buildings, map]);

  return null;
}

// ---------------------------------------------------------------------------
// LayerToggle — overlay button to switch tile layers
// ---------------------------------------------------------------------------

function LayerToggle({ active, onChange }) {
  const layers = ['satellite', 'streets'];
  return (
    <div style={{
      position: 'absolute', top: 12, right: 12, zIndex: 1000,
      display: 'flex', borderRadius: 6, overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.1)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
    }}>
      {layers.map((layer) => (
        <button
          key={layer}
          onClick={() => onChange(layer)}
          style={{
            padding: '5px 12px',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '.06em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            border: 'none',
            background: active === layer ? '#10b981' : 'rgba(9,9,11,0.88)',
            color: active === layer ? '#000' : '#a1a1aa',
            fontFamily: 'monospace',
            backdropFilter: 'blur(8px)',
          }}
        >
          {layer}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Legend overlay
// ---------------------------------------------------------------------------

function MapLegend() {
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
      {[
        { color: '#10b981', label: 'Score ≥ 70' },
        { color: '#f59e0b', label: 'Score 50–69' },
        { color: '#ef4444', label: 'Score < 50' },
      ].map(({ color, label }) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: color,
                        flexShrink: 0, boxShadow: `0 0 6px ${color}80` }} />
          <span style={{ fontSize: 11, color: '#a1a1aa' }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export default function StateInsightsMap({ buildings, stateCode }) {
  const [tileLayer, setTileLayer] = useState('satellite');
  const tile = TILES[tileLayer];

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <MapContainer
        center={[37.8, -96]}
        zoom={4}
        style={{ height: '100%', width: '100%', background: '#09090b' }}
        scrollWheelZoom
      >
        <TileLayer key={tileLayer} url={tile.url} attribution={tile.attribution} maxZoom={tile.maxZoom} />
        <FlyToState buildings={buildings} stateCode={stateCode} />
        <ClusterLayer buildings={buildings} />
      </MapContainer>

      <LayerToggle active={tileLayer} onChange={setTileLayer} />
      <MapLegend />
    </div>
  );
}
