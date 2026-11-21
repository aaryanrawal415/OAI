import { describe, expect, it } from "vitest";
import type { Candidate, MatchResponse, TruckInput } from "../api/types";
import { budgetMultiplier, runDemoMatching, tripCaps } from "../api/mock/demoEngine";
import { ROUTES } from "../api/mock/routes";
import { DEMO_SPECS } from "../api/mock/specs";

const truck: TruckInput = {
  vehicle_class: "hcv_10wheel",
  body_type: "closed_body",
  max_payload_kg: 21000,
  available_payload_kg: 18000,
  available_volume_m3: 60,
  location: { name: "Delhi", lat: 28.61, lng: 77.21 },
  available_from: "2026-11-20T04:00:00.000Z",
  handling_equipment: [],
};

const run = (routeId: string, offRoute: boolean): MatchResponse =>
  runDemoMatching({ route_id: routeId, route_version: 1, truck, off_route_enabled: offRoute }, []);
const find = (res: MatchResponse, id: string): Candidate => {
  const found = res.candidates.find((c) => c.id === id);
  if (!found) throw new Error(`missing ${id}`);
  return found;
};

describe("demo evaluator: invariants the interface relies on", () => {
  it("with off-route stops switched off, no off-route job is ever eligible", () => {
    for (const route of ROUTES) {
      for (const c of run(route.id, false).candidates) {
        if (c.route_class === "off_route") expect(c.eligible).not.toBe("pass");
      }
    }
  });
  it("no job with a detour over 40 km is ever eligible", () => {
    for (const off of [true, false]) {
      for (const route of ROUTES) {
        for (const c of run(route.id, off).candidates) {
          if (Math.max(c.pickup_excursion_km ?? 0, c.drop_excursion_km ?? 0) > 40) expect(c.eligible).toBe("fail");
        }
      }
    }
  });
  it("eligible means every check passed; rejected has reasons; unverified has no failure", () => {
    for (const off of [true, false]) {
      for (const route of ROUTES) {
        for (const c of run(route.id, off).candidates) {
          if (c.eligible === "pass") expect(c.checks.every((k) => k.verdict === "pass")).toBe(true);
          if (c.eligible === "fail") expect(c.rejection_codes.length).toBeGreaterThan(0);
          if (c.eligible === "unknown") {
            expect(c.checks.some((k) => k.verdict === "unknown")).toBe(true);
            expect(c.checks.some((k) => k.verdict === "fail")).toBe(false);
          }
        }
      }
    }
  });
  it("every route shows a mix of outcomes", () => {
    expect(DEMO_SPECS.length).toBe(30);
    for (const route of ROUTES) {
      const res = run(route.id, true);
      expect(res.candidates.some((c) => c.eligible === "pass")).toBe(true);
      expect(res.candidates.some((c) => c.eligible === "fail")).toBe(true);
    }
  });
  it("ranks eligible first, then unverified, then rejected, and labels the data as demonstration", () => {
    const res = run("delhi_mumbai", true);
    const rank = (c: Candidate): number => (c.eligible === "pass" ? 0 : c.eligible === "unknown" ? 1 : 2);
    for (let i = 1; i < res.candidates.length; i++) expect(rank(res.candidates[i - 1])).toBeLessThanOrEqual(rank(res.candidates[i]));
    expect(res.data_label).toBe("demonstration");
    expect(res.routing_source).toBe("mock");
    expect(res.candidates.every((c) => c.model_score === null)).toBe(true);
  });
});

describe("demo evaluator: Delhi to Mumbai cases", () => {
  const off = run("delhi_mumbai", false);
  const on = run("delhi_mumbai", true);
  it("on-route jobs pass; detour jobs need the checkbox", () => {
    expect(find(off, "dm-01").eligible).toBe("pass");
    expect(find(off, "dm-02").eligible).toBe("fail");
    expect(find(on, "dm-02").eligible).toBe("pass");
  });
  it("exactly 40 km passes and 41 km fails", () => {
    expect(find(on, "dm-06").eligible).toBe("pass");
    expect(find(on, "dm-07").eligible).toBe("fail");
  });
  it("rejects incompatible, over-capacity, cancelled and late jobs", () => {
    expect(find(on, "dm-03").rejection_codes).toContain("body_compatibility");
    expect(find(on, "dm-05").rejection_codes).toContain("capacity");
    expect(find(on, "dm-09").eligible).toBe("fail");
    expect(find(on, "dm-12").eligible).toBe("fail");
  });
  it("missing weight or unverified distance is unverified, never eligible", () => {
    expect(find(on, "dm-08").eligible).toBe("unknown");
    expect(find(on, "dm-11").eligible).toBe("unknown");
    expect(find(off, "dm-11").eligible).toBe("unknown");
    expect(find(on, "dm-08").net_inr.expected).toBeNull();
  });
  it("a bundle counts as one job and still follows the checkbox", () => {
    expect(find(on, "dm-10").is_bundle).toBe(true);
    expect(find(on, "dm-10").eligible).toBe("pass");
    expect(find(off, "dm-10").eligible).toBe("fail");
  });
});

describe("demo evaluator: money and limits", () => {
  it("net equals revenue minus incremental cost, with ordered bands", () => {
    const c = find(run("delhi_mumbai", true), "dm-01");
    expect(c.net_inr.expected).toBeCloseTo((c.revenue_inr ?? 0) - (c.incremental_cost_inr ?? 0), 6);
    expect(c.net_inr.low ?? 0).toBeLessThanOrEqual(c.net_inr.expected ?? 0);
    expect(c.net_inr.expected ?? 0).toBeLessThanOrEqual(c.net_inr.high ?? 0);
  });
  it("cost overrides change the estimate", () => {
    const base = find(run("delhi_mumbai", true), "dm-02").net_inr.expected ?? 0;
    const res = runDemoMatching(
      { route_id: "delhi_mumbai", route_version: 1, truck, off_route_enabled: true, cost_overrides: { diesel_inr_per_l: 140 } },
      [],
    );
    expect(find(res, "dm-02").net_inr.expected ?? 0).toBeLessThan(base);
  });
  it("a manual listing is unverified because its distances cannot be checked", () => {
    const manual = [{
      id: "x1", title: "My load", category: "fmcg_packaged", weight_kg: 1000, rate_inr: 10000,
      pickup: { name: "A", lat: 28.5, lng: 77.2 }, drop: { name: "B", lat: 22.9, lng: 72.6 },
      pickup_window_start: null, pickup_window_end: null, created_at: "2026-11-18T00:00:00Z",
    }];
    const res = runDemoMatching({ route_id: "delhi_mumbai", route_version: 1, truck, off_route_enabled: true }, manual);
    const m = find(res, "manual-x1");
    expect(m.eligible).toBe("unknown");
    expect(m.source_type).toBe("manual");
    expect(res.data_label).toBe("mixed");
  });
  it("job caps and the budget multiplier follow the decided bands", () => {
    expect(tripCaps(500).max_jobs_total).toBe(3);
    expect(tripCaps(500.01).max_jobs_total).toBe(5);
    expect(tripCaps(1250).max_jobs_per_day).toBe(3);
    expect(tripCaps(1250.01).max_jobs_total).toBe(8);
    expect(tripCaps(2000.01).max_jobs_total).toBe(10);
    expect(budgetMultiplier(1000)).toBe(1.25);
    expect(budgetMultiplier(1250)).toBeCloseTo(1.3, 12);
    expect(budgetMultiplier(1500)).toBe(1.35);
  });
});
