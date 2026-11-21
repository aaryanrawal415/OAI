import { describe, expect, it } from "vitest";
import type { TruckInput } from "../api/types";
import { isValidEmail, manualProblems, passwordProblem, truckProblems, type ManualDraft } from "../lib/validate";

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

const place = (lat: string, lng: string) => ({ hub: "custom", name: "x", lat, lng });
const draft: ManualDraft = {
  title: "Packaged goods",
  category: "fmcg_packaged",
  weight: "1000",
  rate: "",
  pickup: place("28.5", "77.2"),
  drop: place("22.9", "72.6"),
  windowStart: "",
  windowEnd: "",
};

describe("account validation", () => {
  it("checks email and password", () => {
    expect(isValidEmail("a@b.com")).toBe(true);
    expect(isValidEmail("not an email")).toBe(false);
    expect(passwordProblem("short")).not.toBeNull();
    expect(passwordProblem("long-enough")).toBeNull();
  });
});

describe("truck validation", () => {
  it("accepts a sensible truck", () => {
    expect(truckProblems(truck)).toEqual([]);
  });
  it("rejects zero, negative, or over-maximum payload", () => {
    expect(truckProblems({ ...truck, available_payload_kg: 0 }).length).toBeGreaterThan(0);
    expect(truckProblems({ ...truck, available_payload_kg: -5 }).length).toBeGreaterThan(0);
    expect(truckProblems({ ...truck, available_payload_kg: 25000 }).length).toBeGreaterThan(0);
  });
  it("rejects a location outside India", () => {
    expect(truckProblems({ ...truck, location: { name: "London", lat: 51.5, lng: -0.1 } }).length).toBeGreaterThan(0);
  });
});

describe("manual listing validation", () => {
  it("accepts a complete listing", () => {
    expect(manualProblems(draft)).toEqual({});
  });
  it("rejects bad weight, payment, places and windows", () => {
    expect(manualProblems({ ...draft, weight: "0" }).weight).toBeDefined();
    expect(manualProblems({ ...draft, weight: "" }).weight).toBeDefined();
    expect(manualProblems({ ...draft, rate: "-1" }).rate).toBeDefined();
    expect(manualProblems({ ...draft, category: "" }).category).toBeDefined();
    expect(manualProblems({ ...draft, pickup: place("", "") }).pickup).toBeDefined();
    expect(manualProblems({ ...draft, drop: draft.pickup }).drop).toBeDefined();
    expect(manualProblems({ ...draft, windowStart: "2026-11-20T10:00", windowEnd: "2026-11-20T09:00" }).window).toBeDefined();
  });
});
