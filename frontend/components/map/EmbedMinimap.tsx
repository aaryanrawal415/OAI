import { CircleMarker, Tooltip } from "react-leaflet";
import type { LatLng, Place } from "../../api/types";
import { MAP_COLORS } from "../../lib/colors";
import { googleMapsEmbedUrl } from "../../lib/googleMapsUrl";
import { MapView } from "./MapView";
import { RouteLayer } from "./RouteLayer";

interface Props {
  origin: Place;
  destination: Place;
  polyline: LatLng[];
  pickup: Place;
  drop: Place;
}

/**
 * Shipment minimap. With a Google Embed key it shows Google's map; otherwise it uses the free
 * Leaflet map. Both show the same trip.
 */
export function EmbedMinimap({ origin, destination, polyline, pickup, drop }: Props) {
  const key = import.meta.env.VITE_GOOGLE_MAPS_EMBED_KEY;
  if (key) {
    const src = googleMapsEmbedUrl(key, { origin, destination, waypoints: [pickup, drop] });
    return (
      <div className="stack">
        <iframe
          title="Google Maps route"
          src={src}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          style={{ border: 0, width: "100%", height: "16rem", borderRadius: "10px" }}
          allowFullScreen
        />
        <span className="badge">Google Maps minimap</span>
      </div>
    );
  }
  return (
    <div className="stack">
      <MapView fit={[...polyline, pickup, drop]} label="Route minimap" height="16rem" interactive={false}>
        <RouteLayer polyline={polyline} origin={origin} destination={destination} />
        <CircleMarker center={[pickup.lat, pickup.lng]} radius={6} pathOptions={{ color: MAP_COLORS.pass, fillColor: MAP_COLORS.pass, fillOpacity: 1 }}>
          <Tooltip>Pickup: {pickup.name}</Tooltip>
        </CircleMarker>
        <CircleMarker center={[drop.lat, drop.lng]} radius={6} pathOptions={{ color: MAP_COLORS.pass, fillColor: "#ffffff", fillOpacity: 1, weight: 3 }}>
          <Tooltip>Drop: {drop.name}</Tooltip>
        </CircleMarker>
      </MapView>
      <span className="badge">Leaflet minimap (free). Add a Google Embed key in .env.local to use Google's.</span>
    </div>
  );
}
