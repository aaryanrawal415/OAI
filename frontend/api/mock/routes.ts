import type { LatLng, Place, RouteInfo } from "../types";

// DEMONSTRATION ROUTES. The line is drawn through rough highway waypoints, not snapped to roads,
// and the distances are approximate. The real figures come from the routing engine.

const AVERAGE_SPEED_KMH = 45;

function place(name: string, lat: number, lng: number): Place {
  return { name, lat, lng };
}

function make(
  id: string,
  name: string,
  origin: Place,
  destination: Place,
  distanceKm: number,
  waypoints: [number, number][],
): RouteInfo {
  const polyline: LatLng[] = waypoints.map(([lat, lng]) => ({ lat, lng }));
  return {
    id,
    corridor_id: id,
    name,
    origin,
    destination,
    polyline,
    distance_km: distanceKm,
    baseline_driving_minutes: Math.round((distanceKm / AVERAGE_SPEED_KMH) * 60),
    verified: false,
    version: 1,
  };
}

export const ROUTES: RouteInfo[] = [
  make("delhi_mumbai", "Delhi to Mumbai", place("Delhi", 28.61, 77.21), place("Mumbai", 19.08, 72.88), 1400, [
    [28.61, 77.21], [28.46, 77.03], [26.91, 75.79], [26.1, 74.32], [24.58, 73.68], [23.6, 72.97],
    [23.02, 72.57], [22.31, 73.18], [21.17, 72.83], [20.37, 72.91], [19.7, 72.78], [19.08, 72.88],
  ]),
  make("surat_mumbai", "Surat to Mumbai", place("Surat", 21.17, 72.83), place("Mumbai", 19.08, 72.88), 280, [
    [21.17, 72.83], [20.37, 72.91], [19.7, 72.78], [19.08, 72.88],
  ]),
  make("mumbai_bengaluru", "Mumbai to Bengaluru", place("Mumbai", 19.08, 72.88), place("Bengaluru", 12.97, 77.59), 1000, [
    [19.08, 72.88], [18.52, 73.86], [17.69, 74.0], [16.7, 74.24], [15.85, 74.5], [15.36, 75.12],
    [14.46, 75.92], [13.34, 77.1], [12.97, 77.59],
  ]),
  make("delhi_chennai", "Delhi to Chennai", place("Delhi", 28.61, 77.21), place("Chennai", 13.08, 80.27), 2200, [
    [28.61, 77.21], [27.18, 78.02], [26.22, 78.18], [25.45, 78.57], [23.26, 77.41], [21.15, 79.09],
    [17.38, 78.48], [16.51, 80.65], [14.44, 79.99], [13.08, 80.27],
  ]),
];

export function findRoute(id: string): RouteInfo | undefined {
  return ROUTES.find((r) => r.id === id);
}
