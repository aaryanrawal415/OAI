import { describe, expect, it } from "vitest";
import { haversineKm, isInsideIndia, pointAlong } from "../lib/geo";

describe("geo helpers", () => {
  const line = [{ lat: 0, lng: 0 }, { lat: 0, lng: 2 }];
  it("finds a point along a line", () => {
    const mid = pointAlong(line, 0.5);
    expect(mid.lng).toBeCloseTo(1, 9);
    expect(pointAlong(line, 0)).toEqual(line[0]);
    expect(pointAlong(line, 5)).toEqual(line[1]);
  });
  it("measures straight-line distance", () => {
    expect(haversineKm({ lat: 0, lng: 0 }, { lat: 0, lng: 1 })).toBeCloseTo(111.19, 0);
  });
  it("knows roughly where India is", () => {
    expect(isInsideIndia({ lat: 28.6, lng: 77.2 })).toBe(true);
    expect(isInsideIndia({ lat: 51.5, lng: -0.12 })).toBe(false);
  });
});
