import type { LatLng } from "../api/types";

const EARTH_RADIUS_KM = 6371.0088;
const toRad = (deg: number): number => (deg * Math.PI) / 180;

/** Straight-line distance. Illustration only: never used to approve a rule. */
export function haversineKm(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Point at a fraction (0 to 1) of the way along a polyline, by straight-line length. */
export function pointAlong(polyline: LatLng[], fraction: number): LatLng {
  if (polyline.length === 0) throw new Error("polyline is empty");
  if (polyline.length === 1) return polyline[0];
  const f = Math.min(1, Math.max(0, fraction));
  const lengths: number[] = [];
  let total = 0;
  for (let i = 1; i < polyline.length; i++) {
    const d = haversineKm(polyline[i - 1], polyline[i]);
    lengths.push(d);
    total += d;
  }
  if (total === 0) return polyline[0];
  let target = f * total;
  for (let i = 0; i < lengths.length; i++) {
    if (target <= lengths[i] || i === lengths.length - 1) {
      const t = lengths[i] === 0 ? 0 : Math.min(1, target / lengths[i]);
      const a = polyline[i];
      const b = polyline[i + 1];
      return { lat: a.lat + (b.lat - a.lat) * t, lng: a.lng + (b.lng - a.lng) * t };
    }
    target -= lengths[i];
  }
  return polyline[polyline.length - 1];
}

export function isInsideIndia(p: LatLng): boolean {
  return p.lat >= 6 && p.lat <= 37.5 && p.lng >= 68 && p.lng <= 98;
}
