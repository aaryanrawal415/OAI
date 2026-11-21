import type { LatLng } from "../api/types";

const fmt = (p: LatLng): string => `${p.lat.toFixed(5)},${p.lng.toFixed(5)}`;

interface Trip {
  origin: LatLng;
  destination: LatLng;
  waypoints?: LatLng[];
}

/** Link that opens Google Maps with the trip filled in. Needs no API key. */
export function googleMapsDirectionsUrl({ origin, destination, waypoints = [] }: Trip): string {
  const params = new URLSearchParams({
    api: "1",
    origin: fmt(origin),
    destination: fmt(destination),
    travelmode: "driving",
  });
  if (waypoints.length > 0) params.set("waypoints", waypoints.map(fmt).join("|"));
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

/** Address for the Google Maps Embed API (needs a key). */
export function googleMapsEmbedUrl(key: string, { origin, destination, waypoints = [] }: Trip): string {
  const params = new URLSearchParams({
    key,
    origin: fmt(origin),
    destination: fmt(destination),
    mode: "driving",
  });
  if (waypoints.length > 0) params.set("waypoints", waypoints.map(fmt).join("|"));
  return `https://www.google.com/maps/embed/v1/directions?${params.toString()}`;
}
