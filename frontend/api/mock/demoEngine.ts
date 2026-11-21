// DEMO ONLY. This is NOT the production rules engine. The real rules will live in the backend.
// It exists so the interface can be shown and tested without a server. It evaluates the
// demonstration listings (and manual entries, as "unverified") with simplified versions of the
// project rules. No trained model is involved: model_score is always null here.

import { haversineKm, pointAlong } from "../../lib/geo";
import { formatInr, formatKg, formatKm } from "../../lib/format";
import { VEHICLE_CLASSES, categoryName } from "../../lib/reference";
import { combineVerdicts } from "../../lib/verdict";
import type {
  BodyType,
  Candidate,
  CheckResult,
  Claim,
  ClaimTag,
  CostOverrides,
  LatLng,
  LoadPoint,
  ManualListing,
  MatchRequest,
  MatchResponse,
  Money3,
  RouteInfo,
  TimelineStop,
  TripCaps,
  BudgetStatus,
  Verdict,
} from "../types";
import { findRoute } from "./routes";
import { DEMO_SPECS, type DemoSpec } from "./specs";

export const CONFIG_VERSION = 1;
export const OFF_ROUTE_CAP_KM = 40;
const SPEED_KMH = 45;
const EXCURSION_SPEED_KMH = 30;

export function tripCaps(routeKm: number): TripCaps {
  if (routeKm <= 500) return { max_jobs_total: 3, max_jobs_per_day: null, band_label: "Up to 500 km" };
  if (routeKm <= 1250) return { max_jobs_total: 5, max_jobs_per_day: 3, band_label: "500 to 1,250 km" };
  if (routeKm <= 2000) return { max_jobs_total: 8, max_jobs_per_day: 4, band_label: "1,250 to 2,000 km" };
  return { max_jobs_total: 10, max_jobs_per_day: 4, band_label: "Over 2,000 km" };
}

export function budgetMultiplier(routeKm: number): number {
  if (routeKm <= 1000) return 1.25;
  if (routeKm >= 1500) return 1.35;
  return 1.25 + (0.1 * (routeKm - 1000)) / 500;
}

const BODY_ORDER: BodyType[] = [
  "open_body",
  "closed_body",
  "flatbed_trailer",
  "container_carrier",
  "tanker",
  "reefer",
  "tipper",
];

// One letter per body type, in BODY_ORDER: Y allowed, C conditional, N not allowed.
const COMPAT: Record<string, string> = {
  fmcg_packaged: "CYNYNCN",
  steel_coils_sections: "YNYNNNN",
  cement_bags: "CYCCNNN",
  building_materials: "YCYNNNN",
  auto_parts: "CYNYNNN",
  machinery_heavy: "CNYCNNN",
  container_20ft: "NNYYNNN",
  container_40ft: "NNYYNNN",
  agri_grain_bags: "CYNCNNN",
  fresh_produce: "CCNNNYN",
  frozen_pharma: "NNNCNYN",
  chemicals_packaged_hazardous: "NCNCNNN",
  liquid_bulk: "NNNNYNN",
  textiles_garments: "CYNYNNN",
  furniture_household: "CYNCNNN",
  ecommerce_parcels: "NYNCNNN",
  over_dimensional_project: "CNYNNNN",
  bulk_aggregates_coal: "CNNNNNY",
};

const HAZARDOUS = new Set(["chemicals_packaged_hazardous", "liquid_bulk"]);
const OVER_DIMENSIONAL = new Set(["machinery_heavy", "over_dimensional_project"]);

interface Triple {
  low: number;
  expected: number;
  high: number;
}

const COST_DEFAULTS = {
  diesel: { low: 85, expected: 92, high: 100 },
  toll: { low: 3.2, expected: 4.4, high: 5.8 },
  wear: { low: 4.5, expected: 6.5, high: 8.5 },
  driver: { low: 100, expected: 130, high: 170 },
  handlingPerTonne: { low: 160, expected: 300, high: 500 },
};

function override(base: Triple, value: number | undefined): Triple {
  if (value == null || !Number.isFinite(value) || value <= 0) return base;
  const ratio = (x: number): number => (x / base.expected) * value;
  return { low: ratio(base.low), expected: value, high: ratio(base.high) };
}

function chk(
  rule_code: string,
  label: string,
  verdict: Verdict,
  value: string | number | null,
  threshold: string | number | null,
  unit: string | null,
  claim_tag: ClaimTag,
  message: string,
): CheckResult {
  return { rule_code, label, verdict, value, threshold, unit, claim_tag, message };
}

interface Context {
  route: RouteInfo;
  routeVersion: number;
  truck: MatchRequest["truck"];
  offRoute: boolean;
  costs: CostOverrides | undefined;
}

function excursionCheck(code: string, label: string, km: number | null): CheckResult {
  if (km == null) {
    return chk(code, label, "unknown", null, OFF_ROUTE_CAP_KM, "km", "fact",
      "The road distance could not be verified, so this stop cannot be approved.");
  }
  if (km <= OFF_ROUTE_CAP_KM) {
    const text = km === 0 ? "On your route: no detour needed." : `Round-trip detour of ${formatKm(km)} is within the ${OFF_ROUTE_CAP_KM} km limit.`;
    return chk(code, label, "pass", km, OFF_ROUTE_CAP_KM, "km", "calculation", text);
  }
  return chk(code, label, "fail", km, OFF_ROUTE_CAP_KM, "km", "calculation",
    `Round-trip detour of ${formatKm(km)} is over the ${OFF_ROUTE_CAP_KM} km limit.`);
}

function costFor(spec: DemoSpec, ctx: Context): { revenue: number | null; cost: Money3 | null; costMid: number | null } {
  const extraKm = spec.pickup_excursion_km != null && spec.drop_excursion_km != null
    ? spec.pickup_excursion_km + spec.drop_excursion_km
    : null;
  if (spec.rate_inr == null || extraKm == null || spec.extra_active_minutes == null || spec.weight_kg == null) {
    return { revenue: spec.rate_inr, cost: null, costMid: null };
  }
  const vehicle = VEHICLE_CLASSES.find((v) => v.id === ctx.truck.vehicle_class);
  const mileage = ctx.costs?.mileage_km_per_l && ctx.costs.mileage_km_per_l > 0 ? ctx.costs.mileage_km_per_l : (vehicle?.mileageKmPerL ?? 4);
  const diesel = override(COST_DEFAULTS.diesel, ctx.costs?.diesel_inr_per_l);
  const toll = override(COST_DEFAULTS.toll, ctx.costs?.toll_inr_per_km);
  const driver = override(COST_DEFAULTS.driver, ctx.costs?.driver_inr_per_hour);
  const at = (level: keyof Triple): number =>
    (extraKm / mileage) * diesel[level] +
    extraKm * toll[level] +
    extraKm * COST_DEFAULTS.wear[level] +
    (spec.extra_active_minutes! / 60) * driver[level] +
    (spec.weight_kg! / 1000) * COST_DEFAULTS.handlingPerTonne[level];
  const cost: Money3 = { low: at("low"), expected: at("expected"), high: at("high") };
  return { revenue: spec.rate_inr, cost, costMid: cost.expected };
}

function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}

function isoPlusMinutes(startIso: string, minutes: number): string {
  return new Date(new Date(startIso).getTime() + minutes * 60_000).toISOString();
}

export function evaluateSpec(spec: DemoSpec, ctx: Context): Candidate {
  const { route, truck } = ctx;
  const caps = tripCaps(route.distance_km);
  const mult = budgetMultiplier(route.distance_km);
  const distLimit = (mult - 1) * route.distance_km;
  const timeLimit = (mult - 1) * route.baseline_driving_minutes;

  const pe = spec.pickup_excursion_km;
  const de = spec.drop_excursion_km;
  const routeClass = pe === 0 && de === 0 ? "on_route" : "off_route";
  const extraKm = pe != null && de != null ? pe + de : null;
  const extraMin = spec.extra_active_minutes;

  const checks: CheckResult[] = [];

  checks.push(
    spec.status === "open"
      ? chk("listing_status", "Listing is open", "pass", "open", "open", null, "fact", "The listing is open.")
      : chk("listing_status", "Listing is open", "fail", spec.status, "open", null, "fact", `The listing is ${spec.status}.`),
  );

  if (spec.weight_kg == null) {
    checks.push(chk("capacity", "Fits available payload", "unknown", null, truck.available_payload_kg, "kg", "fact",
      "The listing gives no weight, so capacity cannot be checked."));
  } else if (spec.weight_kg <= truck.available_payload_kg) {
    checks.push(chk("capacity", "Fits available payload", "pass", spec.weight_kg, truck.available_payload_kg, "kg", "calculation",
      `${formatKg(spec.weight_kg)} fits within your available payload of ${formatKg(truck.available_payload_kg)}.`));
  } else {
    checks.push(chk("capacity", "Fits available payload", "fail", spec.weight_kg, truck.available_payload_kg, "kg", "calculation",
      `${formatKg(spec.weight_kg)} is over your available payload of ${formatKg(truck.available_payload_kg)}.`));
  }

  const row = COMPAT[spec.category];
  const code = row ? row[BODY_ORDER.indexOf(truck.body_type)] : undefined;
  if (code === "Y") {
    checks.push(chk("body_compatibility", "Cargo suits your truck body", "pass", truck.body_type, null, null, "fact",
      `${categoryName(spec.category)} can travel in your truck body.`));
  } else if (code === "C") {
    checks.push(chk("body_compatibility", "Cargo suits your truck body", "unknown", truck.body_type, null, null, "fact",
      `${categoryName(spec.category)} is allowed in your body only if an extra condition is met (for example a cover). It is not confirmed.`));
  } else {
    checks.push(chk("body_compatibility", "Cargo suits your truck body", "fail", truck.body_type, null, null, "fact",
      `${categoryName(spec.category)} cannot travel in your truck body.`));
  }

  if (pe == null || de == null) {
    checks.push(chk("route_mode", "Stops are on your route", "unknown", null, null, null, "fact",
      "Whether the stops are on your route could not be verified."));
  } else if (routeClass === "off_route" && !ctx.offRoute) {
    checks.push(chk("route_mode", "Stops are on your route", "fail", "off-route", "on-route only", null, "fact",
      "This job needs a detour and off-route stops are switched off."));
  } else {
    checks.push(chk("route_mode", "Stops are on your route", "pass", routeClass === "on_route" ? "on-route" : "off-route allowed", null, null, "fact",
      routeClass === "on_route" ? "Both stops are on your original route." : "Off-route stops are switched on."));
  }

  checks.push(excursionCheck("pickup_excursion", "Pickup detour within limit", pe));
  checks.push(excursionCheck("drop_excursion", "Drop detour within limit", de));

  if (spec.window_ok == null) {
    checks.push(chk("time_window", "Pickup and delivery times work", "unknown", null, null, null, "fact",
      "The listing gives no time window, so timing cannot be confirmed."));
  } else if (spec.window_ok) {
    checks.push(chk("time_window", "Pickup and delivery times work", "pass", null, null, null, "calculation",
      "You can reach both stops inside their time windows."));
  } else {
    checks.push(chk("time_window", "Pickup and delivery times work", "fail", null, null, null, "calculation",
      "You would arrive after the pickup window closes."));
  }

  if (HAZARDOUS.has(spec.category)) {
    checks.push(chk("special_cargo", "Special cargo rules", "unknown", null, null, null, "fact",
      "Hazardous goods need permits and segregation checks that are not verified here."));
  } else if (OVER_DIMENSIONAL.has(spec.category)) {
    checks.push(chk("special_cargo", "Special cargo rules", "unknown", null, null, null, "fact",
      "Size limits and permits for over-dimensional cargo are not verified here."));
  }

  checks.push(chk("job_cap", "Within the trip job limit", "pass", `1 of ${caps.max_jobs_total}`, caps.max_jobs_total, "jobs", "calculation",
    `A new job would use 1 of ${caps.max_jobs_total} allowed on this trip${spec.bundle_size > 1 ? ` (the ${spec.bundle_size} consignments count as one)` : ""}.`));

  if (extraKm == null) {
    checks.push(chk("budget_distance", "Within the distance budget", "unknown", null, Math.round(distLimit), "km", "fact",
      "Extra distance is unknown, so the distance budget cannot be checked."));
  } else if (extraKm <= distLimit) {
    checks.push(chk("budget_distance", "Within the distance budget", "pass", extraKm, Math.round(distLimit), "km", "calculation",
      `${formatKm(extraKm)} extra is inside the ${formatKm(distLimit, 0)} allowed for this trip.`));
  } else {
    checks.push(chk("budget_distance", "Within the distance budget", "fail", extraKm, Math.round(distLimit), "km", "calculation",
      `${formatKm(extraKm)} extra is over the ${formatKm(distLimit, 0)} allowed for this trip.`));
  }

  if (extraMin == null) {
    checks.push(chk("budget_time", "Within the time budget", "unknown", null, Math.round(timeLimit), "min", "fact",
      "Extra active time is unknown, so the time budget cannot be checked."));
  } else if (extraMin <= timeLimit) {
    checks.push(chk("budget_time", "Within the time budget", "pass", extraMin, Math.round(timeLimit), "min", "calculation",
      "The extra active time is inside the trip's time budget."));
  } else {
    checks.push(chk("budget_time", "Within the time budget", "fail", extraMin, Math.round(timeLimit), "min", "calculation",
      "The extra active time is over the trip's time budget."));
  }

  const eligible = combineVerdicts(checks.map((c) => c.verdict));
  const rejection_codes = checks.filter((c) => c.verdict === "fail").map((c) => c.rule_code);

  const { revenue, cost, costMid } = costFor(spec, ctx);
  const net: Money3 =
    revenue != null && cost
      ? { low: revenue - (cost.high ?? 0), expected: revenue - (cost.expected ?? 0), high: revenue - (cost.low ?? 0) }
      : { low: null, expected: null, high: null };

  let score: number | null = null;
  if (net.expected != null && extraKm != null) {
    score = Math.round(
      (0.55 * clamp01(net.expected / 60000) + 0.25 * (1 - clamp01(extraKm / 80)) + 0.2 * (spec.window_ok == null ? 0.5 : 1)) * 1000,
    ) / 1000;
  }

  const budget_after: BudgetStatus | null =
    extraKm != null || extraMin != null
      ? {
          multiplier: mult,
          distance_limit_km: Math.round(distLimit),
          time_limit_minutes: Math.round(timeLimit),
          distance_used_fraction: extraKm != null && distLimit > 0 ? extraKm / distLimit : null,
          time_used_fraction: extraMin != null && timeLimit > 0 ? extraMin / timeLimit : null,
        }
      : null;

  const w = spec.weight_kg ?? 0;
  const load_profile: LoadPoint[] = [
    { km: 0, load_kg: 0 },
    { km: spec.pickup_at_km, load_kg: 0 },
    { km: spec.pickup_at_km, load_kg: w },
    { km: spec.drop_at_km, load_kg: w },
    { km: spec.drop_at_km, load_kg: 0 },
    { km: route.distance_km, load_kg: 0 },
  ];

  const pickupMinutes = (spec.pickup_at_km / SPEED_KMH) * 60 + ((pe ?? 0) / EXCURSION_SPEED_KMH) * 60;
  const loadMinutes = 30 + 2 * (w / 1000);
  const dropMinutes =
    pickupMinutes + loadMinutes + ((spec.drop_at_km - spec.pickup_at_km) / SPEED_KMH) * 60 + ((de ?? 0) / EXCURSION_SPEED_KMH) * 60;
  const start = truck.available_from;
  const withWindow = (label: string, minutes: number): TimelineStop => ({
    label,
    arrival: isoPlusMinutes(start, minutes),
    window_start: spec.window_ok == null ? null : isoPlusMinutes(start, minutes - 180),
    window_end: spec.window_ok == null ? null : isoPlusMinutes(start, minutes + (spec.window_ok ? 120 : -60)),
  });
  const timeline: TimelineStop[] = [withWindow("Pickup", pickupMinutes), withWindow("Delivery", dropMinutes)];

  const explanation: Claim[] = [];
  if (eligible === "pass") {
    explanation.push({ tag: "recommendation", text: "Every check passed. Review the numbers and accept it only if it suits you." });
  } else if (eligible === "unknown") {
    explanation.push({ tag: "fact", text: "Nothing failed, but some checks could not be verified, so this is not shown as eligible." });
  } else {
    explanation.push({ tag: "fact", text: "At least one mandatory check failed, so this job is rejected whatever its payment." });
  }
  for (const c of checks) {
    if (c.verdict !== "pass" || ["capacity", "pickup_excursion", "drop_excursion"].includes(c.rule_code)) {
      explanation.push({ tag: c.claim_tag, text: c.message });
    }
  }
  if (net.expected != null) {
    explanation.push({
      tag: "estimate",
      text: `Estimated net ${formatInr(net.expected)} (between ${formatInr(net.low)} and ${formatInr(net.high)}) after incremental costs. Revenue is ${formatInr(revenue)}.`,
    });
  } else {
    explanation.push({ tag: "fact", text: "Net earnings cannot be estimated because weight, distance, time, or payment is unknown." });
  }
  explanation.push({
    tag: "fact",
    text: "Demonstration data evaluated by a demo evaluator. It is not real freight and not the production rules engine.",
  });

  return {
    id: spec.id,
    title: spec.title,
    category: spec.category,
    category_label: categoryName(spec.category),
    weight_kg: spec.weight_kg,
    is_bundle: spec.bundle_size > 1,
    bundle_size: spec.bundle_size,
    source_type: spec.source,
    listing_status: spec.status,
    pickup: spec.pickup,
    drop: spec.drop,
    pickup_at_km: spec.pickup_at_km,
    drop_at_km: spec.drop_at_km,
    route_class: routeClass,
    pickup_excursion_km: pe,
    drop_excursion_km: de,
    extra_distance_km: extraKm,
    extra_active_minutes: extraMin,
    revenue_inr: revenue,
    incremental_cost_inr: costMid,
    net_inr: net,
    checks,
    eligible,
    rejection_codes,
    baseline_score: score,
    model_score: null,
    explanation,
    load_profile,
    timeline,
    budget_after,
  };
}

/** Where along the route (in km) the nearest route vertex to a place sits. Illustration only. */
export function approximateRouteKm(place: LatLng, route: RouteInfo): number {
  let best = 0;
  let bestDist = Infinity;
  const steps = 200;
  for (let i = 0; i <= steps; i++) {
    const f = i / steps;
    const d = haversineKm(place, pointAlong(route.polyline, f));
    if (d < bestDist) {
      bestDist = d;
      best = f;
    }
  }
  return Math.round(best * route.distance_km);
}

function manualToSpec(m: ManualListing, route: RouteInfo): DemoSpec {
  return {
    id: `manual-${m.id}`,
    corridor: route.id,
    title: m.title,
    category: m.category,
    weight_kg: m.weight_kg,
    rate_inr: m.rate_inr,
    pickup: m.pickup,
    drop: m.drop,
    pickup_at_km: approximateRouteKm(m.pickup, route),
    drop_at_km: approximateRouteKm(m.drop, route),
    pickup_excursion_km: null, // a manual entry has no verified road distance in demo mode
    drop_excursion_km: null,
    window_ok: null, // a manual window cannot be checked without a routing engine
    extra_active_minutes: null,
    status: "open",
    bundle_size: 1,
    source: "manual",
  };
}

export function runDemoMatching(request: MatchRequest, manual: ManualListing[]): MatchResponse {
  const route = getRoute(request.route_id);
  const ctx: Context = {
    route,
    routeVersion: request.route_version,
    truck: request.truck,
    offRoute: request.off_route_enabled,
    costs: request.cost_overrides,
  };
  const specs = [...DEMO_SPECS.filter((s) => s.corridor === route.id), ...manual.map((m) => manualToSpec(m, route))];
  const candidates = specs.map((s) => evaluateSpec(s, ctx));
  const rank = (c: Candidate): number => (c.eligible === "pass" ? 0 : c.eligible === "unknown" ? 1 : 2);
  candidates.sort(
    (a, b) => rank(a) - rank(b) || (b.baseline_score ?? -1) - (a.baseline_score ?? -1) || a.id.localeCompare(b.id),
  );
  const mult = budgetMultiplier(route.distance_km);
  return {
    run_id: `run-${Date.now()}`,
    route_id: route.id,
    route_version: request.route_version,
    config_version: CONFIG_VERSION,
    generated_at: new Date().toISOString(),
    off_route_enabled: request.off_route_enabled,
    routing_source: "mock",
    data_label: manual.length > 0 ? "mixed" : "demonstration",
    caps: tripCaps(route.distance_km),
    budget: {
      multiplier: mult,
      distance_limit_km: Math.round((mult - 1) * route.distance_km),
      time_limit_minutes: Math.round((mult - 1) * route.baseline_driving_minutes),
      distance_used_fraction: 0,
      time_used_fraction: 0,
    },
    candidates,
    notices: [
      "Demonstration data: these are not real freight listings.",
      "Distances are not measured by a routing engine. Nothing here is verified road distance.",
      "No trained model is connected, so ranking uses a simple demo score.",
    ],
  };
}

function getRoute(id: string): RouteInfo {
  const route = findRoute(id);
  if (!route) throw new Error(`Unknown route: ${id}`);
  return route;
}
