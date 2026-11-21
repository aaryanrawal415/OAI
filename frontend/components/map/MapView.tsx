import { latLngBounds } from "leaflet";
import { useEffect, type ReactNode } from "react";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import type { LatLng } from "../../api/types";

function FitBounds({ points }: { points: LatLng[] }) {
  const map = useMap();
  const key = points.map((p) => `${p.lat.toFixed(4)},${p.lng.toFixed(4)}`).join("|");
  useEffect(() => {
    if (points.length === 0) return;
    const bounds = latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [28, 28] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, key]);
  return null;
}

function PickHandler({ onPick }: { onPick: (p: LatLng) => void }) {
  useMapEvents({ click: (event) => onPick({ lat: event.latlng.lat, lng: event.latlng.lng }) });
  return null;
}

interface Props {
  fit: LatLng[];
  label: string;
  height?: string;
  interactive?: boolean;
  onPick?: (point: LatLng) => void;
  children?: ReactNode;
}

/**
 * Base map. Tiles come from OpenStreetMap, which asks for credit and light use; use a tile
 * provider with a proper plan before any public launch.
 */
export function MapView({ fit, label, height = "28rem", interactive = true, onPick, children }: Props) {
  return (
    <div className="map-frame" style={{ height }} role="region" aria-label={label}>
      <MapContainer
        center={[22.5, 79]}
        zoom={5}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={interactive}
        dragging={interactive}
        doubleClickZoom={interactive}
        zoomControl={interactive}
        attributionControl
      >
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={18}
        />
        <FitBounds points={fit} />
        {onPick && <PickHandler onPick={onPick} />}
        {children}
      </MapContainer>
    </div>
  );
}
