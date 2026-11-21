import { describe, expect, it } from "vitest";
import { formatDuration, formatInr, formatKg, formatKm, formatPercent } from "../lib/format";

describe("format", () => {
  it("formats rupees with Indian digit grouping", () => {
    expect(formatInr(1234567)).toBe("₹12,34,567");
    expect(formatInr(-5000)).toBe("-₹5,000");
  });
  it("shows a dash for unknown values, never zero", () => {
    expect(formatInr(null)).toBe("—");
    expect(formatKm(undefined)).toBe("—");
    expect(formatKg(null)).toBe("—");
    expect(formatDuration(null)).toBe("—");
    expect(formatPercent(null)).toBe("—");
  });
  it("formats distance, weight, duration and percent", () => {
    expect(formatKm(12.345)).toBe("12.3 km");
    expect(formatKg(8200)).toBe("8,200 kg");
    expect(formatDuration(135)).toBe("2 h 15 min");
    expect(formatDuration(45)).toBe("45 min");
    expect(formatDuration(120)).toBe("2 h");
    expect(formatPercent(0.456)).toBe("46%");
  });
});
