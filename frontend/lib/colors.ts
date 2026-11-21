import type { Verdict } from "../api/types";

/** Leaflet cannot read CSS variables, so map colours live here. */
export const MAP_COLORS = {
  route: "#14213d",
  detour: "#e36414",
  truck: "#1d4ed8",
  pass: "#1b7f5c",
  fail: "#b3261e",
  unknown: "#8a6d00",
  selected: "#e36414",
} as const;

export function verdictColor(verdict: Verdict): string {
  return MAP_COLORS[verdict];
}
