import { Polyline, Tooltip } from "react-leaflet";
import type { Candidate, LatLng } from "../../api/types";
import { MAP_COLORS } from "../../lib/colors";
import { pointAlong } from "../../lib/geo";
import { formatKm } from "../../lib/format";

const toPair = (p: LatLng): [number, number] => [p.lat, p.lng];

/**
 * Dashed lines from the route to an off-route stop. ILLUSTRATION ONLY: the line is straight and
 * starts where the stop sits along the route; the real detour is measured by road.
 */
export function DetourLayer({
  candidate,
  polyline,
  routeKm,
}: {
  candidate: Candidate;
  polyline: LatLng[];
  routeKm: number;
}) {
  const stops = [
    { stop: candidate.pickup, at: candidate.pickup_at_km, km: candidate.pickup_excursion_km, name: "Pickup" },
    { stop: candidate.drop, at: candidate.drop_at_km, km: candidate.drop_excursion_km, name: "Drop" },
  ];
  return (
    <>
      {stops.map(({ stop, at, km, name }) => {
        if (km === 0) return null;
        const from = pointAlong(polyline, routeKm > 0 ? at / routeKm : 0);
        return (
          <Polyline
            key={name}
            positions={[toPair(from), toPair(stop)]}
            pathOptions={{ color: MAP_COLORS.detour, weight: 3, dashArray: "8 6" }}
          >
            <Tooltip sticky>
              {name} detour: {km == null ? "not verified" : `${formatKm(km)} round trip`} (illustration)
            </Tooltip>
          </Polyline>
        );
      })}
    </>
  );
}
