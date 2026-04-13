import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
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
  // Slightly larger pins for higher-scoring buildings
  if (score >= 70) return 7;
  if (score >= 50) return 6;
  return 5;
}

// ---------------------------------------------------------------------------
// Internal: flies the map to fit the filtered state, or resets to CONUS
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
// Popup card
// ---------------------------------------------------------------------------

function BuildingPopup({ building }) {
  const navigate = useNavigate();
  const score = Number(building.final_viability_score || 0);
  const scoreColor =
    score >= 70 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ minWidth: 220, fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Score badge + name */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
        <div
          style={{
            flexShrink: 0,
            width: 44,
            height: 44,
            borderRadius: 6,
            background: scoreColor + '18',
            border: `1px solid ${scoreColor}40`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 15,
            fontWeight: 700,
            color: scoreColor,
            fontFamily: 'Outfit, Inter, system-ui, sans-serif',
          }}
        >
          {score.toFixed(0)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: 600,
              fontSize: 13,
              color: '#f4f4f5',
              lineHeight: 1.3,
              marginBottom: 2,
            }}
          >
            {building.name || building.id}
          </div>
          <div style={{ fontSize: 11, color: '#71717a' }}>
            {[building.city, building.state].filter(Boolean).join(', ')}
          </div>
        </div>
      </div>

      {/* Opportunity type */}
      <div
        style={{
          display: 'inline-block',
          fontSize: 10,
          padding: '2px 8px',
          borderRadius: 999,
          background: '#18181b',
          border: '1px solid #27272a',
          color: '#a1a1aa',
          marginBottom: 10,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}
      >
        {building.opportunity_type || 'Balanced Opportunity'}
      </div>

      {/* Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '6px 12px',
          fontSize: 11,
          marginBottom: 12,
        }}
      >
        <div>
          <div style={{ color: '#52525b', marginBottom: 1 }}>ROOF AREA</div>
          <div style={{ color: '#d4d4d8', fontWeight: 600 }}>
            {formatSqft(building.roof_area_sqft)}
          </div>
        </div>
        <div>
          <div style={{ color: '#52525b', marginBottom: 1 }}>HARVEST / YR</div>
          <div style={{ color: '#38bdf8', fontWeight: 600 }}>
            {formatGallons(building.annual_capture_gallons)}
          </div>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={() => navigate(`/buildings/${building.id}`)}
        style={{
          display: 'block',
          width: '100%',
          padding: '6px 0',
          background: '#18181b',
          border: '1px solid #27272a',
          borderRadius: 6,
          color: '#10b981',
          fontSize: 11,
          fontWeight: 600,
          cursor: 'pointer',
          letterSpacing: '0.04em',
          textAlign: 'center',
        }}
      >
        VIEW FULL PROFILE →
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Map legend (absolute-positioned overlay)
// ---------------------------------------------------------------------------

function MapLegend() {
  const items = [
    { color: '#10b981', label: 'Score ≥ 70' },
    { color: '#f59e0b', label: 'Score 50–69' },
    { color: '#ef4444', label: 'Score < 50' },
  ];
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 32,
        left: 12,
        zIndex: 1000,
        background: 'rgba(9,9,11,0.88)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 8,
        padding: '10px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        backdropFilter: 'blur(8px)',
      }}
    >
      <div
        style={{
          fontSize: 9,
          letterSpacing: '0.1em',
          color: '#52525b',
          textTransform: 'uppercase',
          marginBottom: 2,
          fontFamily: 'monospace',
        }}
      >
        Viability Score
      </div>
      {items.map(({ color, label }) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: color,
              flexShrink: 0,
              boxShadow: `0 0 6px ${color}80`,
            }}
          />
          <span style={{ fontSize: 11, color: '#a1a1aa' }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export default function BuildingMap({ buildings, selectedState }) {
  const visibleBuildings = selectedState
    ? buildings.filter(
        (b) => b.state?.toLowerCase() === selectedState.toLowerCase()
      )
    : buildings;

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

        {visibleBuildings.map((b) => {
          const lat = Number(b.latitude);
          const lng = Number(b.longitude);
          if (!lat || !lng) return null;

          const score = Number(b.final_viability_score || 0);
          const color = pinColor(score);

          return (
            <CircleMarker
              key={b.id}
              center={[lat, lng]}
              radius={pinRadius(score)}
              pathOptions={{
                fillColor: color,
                fillOpacity: 0.88,
                color: '#000000',
                weight: 0.8,
              }}
            >
              <Popup
                maxWidth={260}
                className="rainuse-popup"
              >
                <BuildingPopup building={b} />
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      <MapLegend />
    </div>
  );
}
