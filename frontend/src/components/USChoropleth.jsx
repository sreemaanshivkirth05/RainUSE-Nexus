/**
 * USChoropleth — US state choropleth map using react-simple-maps.
 *
 * Shows all states colored by average viability score.
 * Clicking a state calls onStateSelect(stateCode).
 * Requires react-simple-maps (already in package.json).
 */

import { useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps';

// TopoJSON from a public CDN — US states
const GEO_URL =
  'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';

// FIPS → 2-letter state code (the subset we care about, plus full map)
const FIPS_TO_CODE = {
  '01': 'AL', '02': 'AK', '04': 'AZ', '05': 'AR', '06': 'CA',
  '08': 'CO', '09': 'CT', '10': 'DE', '11': 'DC', '12': 'FL',
  '13': 'GA', '15': 'HI', '16': 'ID', '17': 'IL', '18': 'IN',
  '19': 'IA', '20': 'KS', '21': 'KY', '22': 'LA', '23': 'ME',
  '24': 'MD', '25': 'MA', '26': 'MI', '27': 'MN', '28': 'MS',
  '29': 'MO', '30': 'MT', '31': 'NE', '32': 'NV', '33': 'NH',
  '34': 'NJ', '35': 'NM', '36': 'NY', '37': 'NC', '38': 'ND',
  '39': 'OH', '40': 'OK', '41': 'OR', '42': 'PA', '44': 'RI',
  '45': 'SC', '46': 'SD', '47': 'TN', '48': 'TX', '49': 'UT',
  '50': 'VT', '51': 'VA', '53': 'WA', '54': 'WV', '55': 'WI',
  '56': 'WY',
};

// Our 22 target states
const TARGET_CODES = new Set([
  'TX','FL','GA','NC','LA','AL','SC','TN','VA','MS',
  'AR','KY','OK','MO','MD','DE','AZ','NM','KS','IN','IL','WV',
]);

/**
 * Returns fill color for a state given its avg score.
 * stateScores: { [code]: avgScore }  (0–100)
 * isTarget: whether this state is in the dataset
 */
function fillColor(code, stateScores, hovered) {
  const score = stateScores[code];

  if (code === hovered) return '#34d399';   // hover: bright emerald

  if (!TARGET_CODES.has(code)) {
    // Not in dataset
    return score != null
      ? '#1c1c22'   // has data but not focus
      : '#111113';  // no data at all
  }

  if (score == null) return '#1e2a1e';

  if (score >= 55)  return '#059669';  // dark green
  if (score >= 48)  return '#10b981';  // medium emerald
  if (score >= 42)  return '#34d399';  // light green
  if (score >= 36)  return '#a3e635';  // yellow-green
  return            '#facc15';         // yellow
}

export default function USChoropleth({ stateScores = {}, onStateSelect }) {
  const [hovered, setHovered] = useState(null);
  const [tooltip, setTooltip] = useState(null);  // { x, y, code, name, score }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#09090b' }}>
      <ComposableMap
        projection="geoAlbersUsa"
        style={{ width: '100%', height: '100%' }}
      >
        <ZoomableGroup zoom={1} center={[0, 0]} minZoom={1} maxZoom={4}>
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const fips = geo.id?.toString().padStart(2, '0') ?? '';
                const code = FIPS_TO_CODE[fips] ?? null;
                const isTarget = code && TARGET_CODES.has(code);
                const score = code ? stateScores[code] : null;
                const fill  = fillColor(code, stateScores, hovered);

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fill}
                    stroke="#09090b"
                    strokeWidth={0.8}
                    style={{
                      default: { outline: 'none', cursor: isTarget ? 'pointer' : 'default' },
                      hover:   { outline: 'none', fill: isTarget ? '#34d399' : fill },
                      pressed: { outline: 'none' },
                    }}
                    onMouseEnter={(e) => {
                      if (!code) return;
                      setHovered(code);
                      setTooltip({
                        x: e.clientX,
                        y: e.clientY,
                        code,
                        name: geo.properties?.name ?? code,
                        score,
                        isTarget,
                      });
                    }}
                    onMouseMove={(e) => {
                      if (tooltip) setTooltip((t) => ({ ...t, x: e.clientX, y: e.clientY }));
                    }}
                    onMouseLeave={() => {
                      setHovered(null);
                      setTooltip(null);
                    }}
                    onClick={() => {
                      if (isTarget && code) onStateSelect?.(code);
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {/* Tooltip */}
      {tooltip && (
        <div
          style={{
            position: 'fixed',
            left: tooltip.x + 14,
            top: tooltip.y - 10,
            pointerEvents: 'none',
            zIndex: 9999,
            background: 'rgba(9,9,11,0.95)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 6,
            padding: '8px 12px',
            fontSize: 12,
            color: '#f4f4f5',
            minWidth: 140,
            backdropFilter: 'blur(8px)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 4 }}>
            {tooltip.name} ({tooltip.code})
          </div>
          {tooltip.isTarget ? (
            tooltip.score != null ? (
              <>
                <div style={{ color: '#10b981', fontSize: 16, fontWeight: 700, fontFamily: 'monospace' }}>
                  {tooltip.score.toFixed(1)}
                  <span style={{ color: '#52525b', fontSize: 11, fontWeight: 400 }}>/100</span>
                </div>
                <div style={{ color: '#71717a', fontSize: 10, marginTop: 2 }}>avg viability score</div>
                <div style={{ color: '#34d399', fontSize: 10, marginTop: 4 }}>Click to explore →</div>
              </>
            ) : (
              <div style={{ color: '#52525b', fontSize: 11 }}>No score data</div>
            )
          ) : (
            <div style={{ color: '#52525b', fontSize: 11 }}>Not in dataset</div>
          )}
        </div>
      )}

      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: 16, left: 16, zIndex: 100,
        background: 'rgba(9,9,11,0.9)', border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 8, padding: '10px 14px', backdropFilter: 'blur(8px)',
      }}>
        <div style={{ fontSize: 9, letterSpacing: '.1em', color: '#52525b',
                      textTransform: 'uppercase', marginBottom: 6, fontFamily: 'monospace' }}>
          Avg Viability Score
        </div>
        {[
          { color: '#059669', label: '≥ 55' },
          { color: '#10b981', label: '48–54' },
          { color: '#34d399', label: '42–47' },
          { color: '#a3e635', label: '36–41' },
          { color: '#facc15', label: '< 36' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ width: 12, height: 12, borderRadius: 2, background: color, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: '#a1a1aa', fontFamily: 'monospace' }}>{label}</span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, paddingTop: 4,
                      borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ width: 12, height: 12, borderRadius: 2, background: '#111113', border: '1px solid #27272a', flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: '#52525b', fontFamily: 'monospace' }}>Not in dataset</span>
        </div>
      </div>

      {/* Hint */}
      <div style={{
        position: 'absolute', bottom: 16, right: 16, zIndex: 100,
        background: 'rgba(9,9,11,0.8)', border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: 6, padding: '6px 10px', fontSize: 10, color: '#52525b', fontFamily: 'monospace',
      }}>
        Click a highlighted state to explore
      </div>
    </div>
  );
}
