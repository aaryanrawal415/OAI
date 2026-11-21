import type { LatLng } from "../api/types";
import { googleMapsDirectionsUrl } from "../lib/googleMapsUrl";
import { ExternalButton } from "./ui/Button";

interface Props {
  origin: LatLng;
  destination: LatLng;
  waypoints: LatLng[];
}

/** Opens Google Maps with the trip filled in. A plain link: no API key and no billing. */
export function GoogleMapsButton({ origin, destination, waypoints }: Props) {
  return (
    <div className="stack" style={{ gap: "0.35rem" }}>
      <ExternalButton variant="primary" block href={googleMapsDirectionsUrl({ origin, destination, waypoints })}>
        Open in Google Maps
      </ExternalButton>
      <p className="field__hint">
        Opens a new tab with your start, pickup, drop, and final destination filled in. Google may pick a slightly
        different road than this app uses.
      </p>
    </div>
  );
}
