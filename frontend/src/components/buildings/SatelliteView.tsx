/**
 * SatelliteView — Embeds a satellite image of the building's location.
 *
 * Priority:
 *  1. Google Maps Static API (if VITE_GOOGLE_MAPS_API_KEY is set in .env)
 *  2. Free fallback: mini Leaflet map with ESRI World Imagery tile layer
 *
 * Designed to be React.lazy()-loaded so the Leaflet bundle is only
 * fetched when a user actually opens a building detail page.
 */

import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const GOOGLE_KEY = (import.meta as Record<string, unknown> & { env: Record<string, string> }).env
  .VITE_GOOGLE_MAPS_API_KEY as string | undefined;

interface Building {
  latitude?: number | string | null;
  longitude?: number | string | null;
  roof_area_sqft?: number | string | null;
  cooling_confidence?: number | string | null;
  name?: string;
  city?: string;
  state?: string;
  [key: string]: unknown;
}

interface Props {
  building: Building;
}

export default function SatelliteView({ building }: Props) {
  const lat = building.latitude != null ? Number(building.latitude) : null;
  const lng = building.longitude != null ? Number(building.longitude) : null;
  const hasCoords = lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng);

  const roofSqft = Math.round(Number(building.roof_area_sqft || 0));
  const coolConf = Number(building.cooling_confidence || 0);
  const coolPct = Math.round(coolConf * 100);

  const locationLabel =
    building.city && building.state
      ? `${building.city}, ${building.state}`
      : hasCoords
      ? `${lat!.toFixed(4)}, ${lng!.toFixed(4)}`
      : 'Unknown location';

  /* ── Badge colour helpers ─────────────────────────────────────────── */
  const roofBadge =
    roofSqft > 100_000
      ? 'bg-emerald-900/60 border-emerald-500/30 text-emerald-300'
      : 'bg-zinc-800 border-white/5 text-zinc-400';

  const coolBadge =
    coolPct >= 80
      ? 'bg-cyan-900/60 border-cyan-500/30 text-cyan-300'
      : coolPct >= 60
      ? 'bg-amber-900/60 border-amber-500/30 text-amber-300'
      : 'bg-red-900/50 border-red-500/20 text-red-400';

  /* ── No coordinates ───────────────────────────────────────────────── */
  if (!hasCoords) {
    return (
      <div className="rounded border border-white/5 bg-zinc-900/30 p-6 text-center text-zinc-500 text-sm">
        No location coordinates available for satellite view.
      </div>
    );
  }

  /* ── Google Maps Static API (requires VITE_GOOGLE_MAPS_API_KEY) ───── */
  if (GOOGLE_KEY) {
    const url =
      `https://maps.googleapis.com/maps/api/staticmap` +
      `?center=${lat},${lng}&zoom=18&size=600x300&maptype=satellite` +
      `&markers=color:red|${lat},${lng}&key=${GOOGLE_KEY}`;

    return (
      <div className="space-y-3">
        <p className="text-sm font-medium text-zinc-300">
          📍 Satellite View — {locationLabel}
        </p>

        <div className="rounded overflow-hidden border border-white/5 w-full" style={{ height: 250 }}>
          <img
            src={url}
            alt={`Satellite view of ${locationLabel}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        <Badges roofSqft={roofSqft} coolPct={coolPct} roofBadge={roofBadge} coolBadge={coolBadge} />
      </div>
    );
  }

  /* ── Free fallback: Leaflet + ESRI World Imagery ──────────────────── */
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-zinc-300">
        📍 Satellite View — {locationLabel}
      </p>

      <div className="rounded overflow-hidden border border-white/5" style={{ height: 250 }}>
        <MapContainer
          center={[lat, lng]}
          zoom={18}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
          attributionControl
        >
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="Imagery &copy; Esri"
            maxZoom={19}
          />
          <CircleMarker
            center={[lat, lng]}
            radius={10}
            pathOptions={{
              color: '#dc2626',
              fillColor: '#ef4444',
              fillOpacity: 0.95,
              weight: 2.5,
            }}
          />
        </MapContainer>
      </div>

      <Badges roofSqft={roofSqft} coolPct={coolPct} roofBadge={roofBadge} coolBadge={coolBadge} />
    </div>
  );
}

/* ── Shared badge row ─────────────────────────────────────────────────── */
function Badges({
  roofSqft,
  coolPct,
  roofBadge,
  coolBadge,
}: {
  roofSqft: number;
  coolPct: number;
  roofBadge: string;
  coolBadge: string;
}) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className={`px-3 py-1.5 rounded border text-xs font-mono font-semibold ${roofBadge}`}>
        🏗 Roof: {roofSqft.toLocaleString()} sq ft
      </span>
      <span className={`px-3 py-1.5 rounded border text-xs font-mono font-semibold ${coolBadge}`}>
        🌡 Cooling Tower: {coolPct}% confidence
      </span>
    </div>
  );
}
