import { CircleMarker, Polyline, Tooltip } from "react-leaflet";
import type { LatLng, Place } from "../../api/types";
import { MAP_COLORS } from "../../lib/colors";

const toPair = (p: LatLng): [number, number] => [p.lat, p.lng];

function End({ place, kind }: { place: Place; kind: "Start" | "End" }) {
  return (
    <CircleMarker
      center={toPair(place)}
      radius={8}
      pathOptions={{ color: MAP_COLORS.route, fillColor: "#ffffff", fillOpacity: 1, weight: 3 }}
    >
      <Tooltip>
        {kind}: {place.name}
      </Tooltip>
    </CircleMarker>
  );
}

/** The original route: the baseline that never changes when cargo is accepted. */
export function RouteLayer({ polyline, origin, destination }: { polyline: LatLng[]; origin: Place; destination: Place }) {
  return (
    <>
      <Polyline positions={polyline.map(toPair)} pathOptions={{ color: MAP_COLORS.route, weight: 4, opacity: 0.85 }} />
      <End place={origin} kind="Start" />
      <End place={destination} kind="End" />
    </>
  );
}
