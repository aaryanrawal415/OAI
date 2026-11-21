import { Fragment } from "react";
import { CircleMarker, Polyline, Tooltip } from "react-leaflet";
import type { Candidate, LatLng, Place } from "../../api/types";
import { MAP_COLORS, verdictColor } from "../../lib/colors";
import { eligibilityLabel } from "../../lib/verdict";

const toPair = (p: LatLng): [number, number] => [p.lat, p.lng];

export function TruckMarker({ place }: { place: Place }) {
  return (
    <CircleMarker
      center={toPair(place)}
      radius={9}
      pathOptions={{ color: "#ffffff", fillColor: MAP_COLORS.truck, fillOpacity: 1, weight: 3 }}
    >
      <Tooltip permanent direction="top" offset={[0, -8]}>
        Your truck
      </Tooltip>
    </CircleMarker>
  );
}

interface Props {
  candidates: Candidate[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

/** Pickup (filled dot) and drop (ring) for each candidate, coloured by verdict. */
export function CandidateMarkers({ candidates, selectedId, onSelect }: Props) {
  return (
    <>
      {candidates.map((c) => {
        const selected = c.id === selectedId;
        const color = selected ? MAP_COLORS.selected : verdictColor(c.eligible);
        return (
          <Fragment key={c.id}>
            {selected && (
              <Polyline
                positions={[toPair(c.pickup), toPair(c.drop)]}
                pathOptions={{ color: MAP_COLORS.selected, weight: 2, dashArray: "2 8" }}
              />
            )}
            <CircleMarker
              center={toPair(c.pickup)}
              radius={selected ? 9 : 6}
              pathOptions={{ color, fillColor: color, fillOpacity: 0.9, weight: 2 }}
              eventHandlers={{ click: () => onSelect(c.id) }}
            >
              <Tooltip>
                Pickup: {c.pickup.name} ({eligibilityLabel(c.eligible)})
              </Tooltip>
            </CircleMarker>
            <CircleMarker
              center={toPair(c.drop)}
              radius={selected ? 9 : 6}
              pathOptions={{ color, fillColor: "#ffffff", fillOpacity: 1, weight: 3 }}
              eventHandlers={{ click: () => onSelect(c.id) }}
            >
              <Tooltip>
                Drop: {c.drop.name} ({eligibilityLabel(c.eligible)})
              </Tooltip>
            </CircleMarker>
          </Fragment>
        );
      })}
    </>
  );
}
