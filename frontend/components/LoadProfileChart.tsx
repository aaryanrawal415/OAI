import type { LoadPoint } from "../api/types";
import { formatKg } from "../lib/format";

interface Props {
  profile: LoadPoint[];
  routeKm: number;
  capacityKg: number;
}

const W = 640;
const H = 220;
const M = { left: 58, right: 16, top: 14, bottom: 34 };

/** Weight on board along the route, against the truck's available payload. */
export function LoadProfileChart({ profile, routeKm, capacityKg }: Props) {
  const innerW = W - M.left - M.right;
  const innerH = H - M.top - M.bottom;
  const peak = Math.max(0, ...profile.map((p) => p.load_kg));
  const yMax = Math.max(capacityKg, peak) * 1.1 || 1;
  const x = (km: number): number => M.left + (Math.min(routeKm, Math.max(0, km)) / (routeKm || 1)) * innerW;
  const y = (kg: number): number => M.top + innerH - (kg / yMax) * innerH;
  const baseline = y(0);

  const path =
    profile.length > 0
      ? `M ${x(profile[0].km)} ${baseline} ` +
        profile.map((p) => `L ${x(p.km)} ${y(p.load_kg)}`).join(" ") +
        ` L ${x(profile[profile.length - 1].km)} ${baseline} Z`
      : "";

  const yTicks = [0, capacityKg / 2, capacityKg];
  const xTicks = [0, routeKm / 2, routeKm];
  const summary = `Peak load ${formatKg(peak)} against ${formatKg(capacityKg)} available over ${Math.round(routeKm)} km.`;

  return (
    <figure style={{ margin: 0 }}>
      <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Load on board along the route. ${summary}`}>
        <title>Load on board along the route</title>
        {yTicks.map((t) => (
          <g key={t}>
            <line className="grid" x1={M.left} x2={W - M.right} y1={y(t)} y2={y(t)} />
            <text x={M.left - 8} y={y(t) + 4} textAnchor="end">
              {(t / 1000).toFixed(1)} t
            </text>
          </g>
        ))}
        <line className="axis" x1={M.left} x2={W - M.right} y1={baseline} y2={baseline} />
        <path className="area" d={path} />
        <line className="cap" x1={M.left} x2={W - M.right} y1={y(capacityKg)} y2={y(capacityKg)} />
        <text x={W - M.right} y={y(capacityKg) - 6} textAnchor="end">
          available payload
        </text>
        {xTicks.map((t, i) => (
          <text key={i} x={x(t)} y={H - 10} textAnchor={i === 0 ? "start" : i === 2 ? "end" : "middle"}>
            {Math.round(t)} km
          </text>
        ))}
      </svg>
      <figcaption className="small muted">{summary}</figcaption>
    </figure>
  );
}
