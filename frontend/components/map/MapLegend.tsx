import { MAP_COLORS } from "../../lib/colors";

const ITEMS = [
  { color: MAP_COLORS.route, label: "Original route" },
  { color: MAP_COLORS.truck, label: "Your truck" },
  { color: MAP_COLORS.pass, label: "Eligible" },
  { color: MAP_COLORS.unknown, label: "Unverified" },
  { color: MAP_COLORS.fail, label: "Rejected" },
  { color: MAP_COLORS.detour, label: "Detour (illustration)" },
];

export function MapLegend() {
  return (
    <ul className="map-legend" style={{ listStyle: "none", margin: 0, padding: 0 }}>
      {ITEMS.map((item) => (
        <li key={item.label} className="map-legend__item">
          <span className="map-legend__swatch" style={{ color: item.color, background: item.color }} aria-hidden="true" />
          {item.label}
        </li>
      ))}
      <li className="map-legend__item">Filled dot = pickup, ring = drop</li>
    </ul>
  );
}
